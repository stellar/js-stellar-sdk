import { describe, it, afterEach, expect, vi } from "vitest";
import * as StellarSdk from "../../../src/index.js";

import { serverUrl } from "../../constants";

// `Client.from` constructs its own `Server` internally, so we cannot spy on a
// server instance we create here. Instead we mock the http-client factory that
// the internal `Server` uses, which lets the real code path
// (`getContractInstance`, then `getContractWasmByHash` for Wasm contracts) run
// against controlled JSON-RPC responses.
const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }));

vi.mock("../../../src/rpc/axios.js", async (importActual) => {
  const actual =
    await importActual<typeof import("../../../src/rpc/axios.js")>();
  return {
    ...actual,
    createHttpClient: () => ({ post: mockPost }),
  };
});

const { xdr, hash, Contract } = StellarSdk;
const { Client } = StellarSdk.contract;

const networkPassphrase = "Test SDF Network ; September 2015";

// LEB128 unsigned varint, as used for WASM section lengths.
function leb128(value: number): Buffer {
  const bytes: number[] = [];
  let n = value;
  do {
    let byte = n & 0x7f;
    n >>>= 7;
    if (n !== 0) byte |= 0x80;
    bytes.push(byte);
  } while (n !== 0);
  return Buffer.from(bytes);
}

// Builds a minimal valid WASM binary whose only content is a `contractspecv0`
// custom section carrying the given spec entries. This is browser-safe (pure
// Buffer ops, no filesystem) and is enough for `Spec.fromWasm` to parse, which
// only scans for that custom section.
function wasmWithSpec(entries: StellarSdk.xdr.ScSpecEntry[]): Buffer {
  const name = Buffer.from("contractspecv0", "utf8");
  const payload = Buffer.concat(entries.map((e) => e.toXDR()));
  const sectionBody = Buffer.concat([leb128(name.length), name, payload]);
  const customSection = Buffer.concat([
    Buffer.from([0x00]), // custom section id
    leb128(sectionBody.length),
    sectionBody,
  ]);
  const header = Buffer.from([
    0x00,
    0x61,
    0x73,
    0x6d, // "\0asm" magic
    0x01,
    0x00,
    0x00,
    0x00, // version 1
  ]);
  return Buffer.concat([header, customSection]);
}

describe("contract.Client.from", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const contractId = "CCN57TGC6EXFCYIQJ4UCD2UDZ4C3AQCHVMK74DGZ3JYCA5HD4BY7FNPC";
  const contract = new Contract(contractId);
  const contractLedgerKey = contract.getFootprint();
  const address = contract.address();

  // Builds the JSON-RPC response shape returned by `getLedgerEntries` for a
  // single ledger entry, matching what the RPC server produces.
  function ledgerEntriesResponse(
    val: StellarSdk.xdr.LedgerEntryData,
    key: StellarSdk.xdr.LedgerKey,
  ) {
    return {
      data: {
        result: {
          latestLedger: 18039,
          entries: [
            {
              liveUntilLedgerSeq: 1000,
              lastModifiedLedgerSeq: 1,
              xdr: val.toXDR("base64"),
              key: key.toXDR("base64"),
            },
          ],
        },
      },
    };
  }

  describe("wasm contract (baseline)", () => {
    // A synthetic wasm exposing a single `hello` function, so `Spec.fromWasm`
    // can parse it. The wasm hash is arbitrary for the mock; it only has to
    // match between the instance executable and the code entry.
    const wasmBuffer = wasmWithSpec([
      xdr.ScSpecEntry.scSpecEntryFunctionV0(
        new xdr.ScSpecFunctionV0({
          doc: "",
          name: "hello",
          inputs: [],
          outputs: [],
        }),
      ),
    ]);
    const wasmHash = hash(wasmBuffer);

    const instanceEntry = xdr.LedgerEntryData.contractData(
      new xdr.ContractDataEntry({
        ext: new (xdr.ExtensionPoint as any)(0),
        contract: address.toScAddress(),
        durability: xdr.ContractDataDurability.persistent(),
        key: xdr.ScVal.scvLedgerKeyContractInstance(),
        val: xdr.ScVal.scvContractInstance(
          new xdr.ScContractInstance({
            executable: xdr.ContractExecutable.contractExecutableWasm(wasmHash),
            storage: null,
          }),
        ),
      }),
    );

    const wasmLedgerKey = xdr.LedgerKey.contractCode(
      new xdr.LedgerKeyContractCode({ hash: wasmHash }),
    );
    const wasmLedgerCode = xdr.LedgerEntryData.contractCode(
      new xdr.ContractCodeEntry({
        ext: xdr.ContractCodeEntryExt.fromXDR(
          "AAAAAQAAAAAAAAAAAAAVqAAAAJwAAAADAAAAAwAAABgAAAABAAAAAQAAABEAAAAgAAABpA==",
          "base64",
        ),
        hash: wasmHash,
        code: wasmBuffer,
      }),
    );

    it("builds a Client from a deployed wasm contract", async () => {
      mockPost
        .mockResolvedValueOnce(
          ledgerEntriesResponse(instanceEntry, contractLedgerKey),
        )
        .mockResolvedValueOnce(
          ledgerEntriesResponse(wasmLedgerCode, wasmLedgerKey),
        );

      const client = await Client.from({
        contractId,
        networkPassphrase,
        rpcUrl: serverUrl,
      });

      expect(client).toBeInstanceOf(Client);
      expect(client.spec.funcs().length).toBeGreaterThan(0);
    });
  });

  describe("Stellar Asset Contract (SAC)", () => {
    // A SAC's contract instance has a `StellarAsset` executable instead of a
    // wasm hash, so there is no wasm to download from the network.
    const sacInstanceEntry = xdr.LedgerEntryData.contractData(
      new xdr.ContractDataEntry({
        ext: new (xdr.ExtensionPoint as any)(0),
        contract: address.toScAddress(),
        durability: xdr.ContractDataDurability.persistent(),
        key: xdr.ScVal.scvLedgerKeyContractInstance(),
        val: xdr.ScVal.scvContractInstance(
          new xdr.ScContractInstance({
            executable: xdr.ContractExecutable.contractExecutableStellarAsset(),
            storage: null,
          }),
        ),
      }),
    );

    it("builds a Client with the embedded SAC spec", async () => {
      // Only the instance lookup is needed: a SAC has no wasm to fetch, so the
      // embedded spec should be used instead of a second ledger-entries call.
      mockPost.mockResolvedValueOnce(
        ledgerEntriesResponse(sacInstanceEntry, contractLedgerKey),
      );

      const client = await Client.from({
        contractId,
        networkPassphrase,
        rpcUrl: serverUrl,
      });

      expect(client).toBeInstanceOf(Client);
      // The standard token interface every SAC exposes.
      for (const method of [
        "symbol",
        "name",
        "decimals",
        "balance",
        "transfer",
      ]) {
        expect(typeof (client as any)[method]).toBe("function");
      }
    });
  });
});
