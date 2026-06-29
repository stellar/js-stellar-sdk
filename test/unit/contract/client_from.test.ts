import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { describe, it, afterEach, expect, vi } from "vitest";
import * as StellarSdk from "../../../src/index.js";

import { serverUrl } from "../../constants";

const __dirname = dirname(fileURLToPath(import.meta.url));

// `Client.from` constructs its own `Server` internally, so we cannot spy on a
// server instance we create here. Instead we mock the http-client factory that
// the internal `Server` uses, which lets the real `getContractWasmByContractId`
// code path run against controlled JSON-RPC responses.
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
    // A real compiled contract with an embedded `contractspecv0` section so
    // `Spec.fromWasm` can parse it. The wasm hash is arbitrary for the mock;
    // it only has to match between the instance executable and the code entry.
    const wasmBuffer = readFileSync(
      join(__dirname, "../../e2e/wasm-fixtures/custom_types.wasm"),
    );
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
