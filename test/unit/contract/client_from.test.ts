import { describe, it, beforeEach, expect, vi } from "vitest";
import * as StellarSdk from "../../../src/index.js";

import { serverUrl } from "../../constants.js";
import { wasmWithSpec } from "./support/wasm.js";

const { xdr, hash, Contract, rpc } = StellarSdk;
const { Client } = StellarSdk.contract;
const { Server } = rpc;

const networkPassphrase = "Test SDF Network ; September 2015";

describe("contract.Client.from", () => {
  let server: any;
  let mockPost: any;

  // `Client.from` accepts a pre-built `Server` via `options.server`, so spying
  // on that instance's http client lets the real code path
  // (`getContractInstance`, then `getContractWasmByHash` for wasm contracts)
  // run against controlled JSON-RPC responses without mocking a module.
  beforeEach(() => {
    server = new Server(serverUrl);
    // The default throws rather than calling through: `vi.spyOn` keeps the real
    // implementation, so once the queued `mockResolvedValueOnce` responses run
    // out an unexpected call would otherwise issue a real HTTP request.
    mockPost = vi.spyOn(server.httpClient, "post").mockImplementation(() => {
      throw new Error("unexpected RPC call");
    });
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
              xdr: val.toXdr("base64"),
              key: key.toXdr("base64"),
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
        ext: xdr.ExtensionPoint.v0(),
        contract: address.toScAddress(),
        durability: xdr.ContractDataDurability.persistent,
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
        ext: xdr.ContractCodeEntryExt.fromXdr(
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
        server,
      });

      expect(client).toBeInstanceOf(Client);
      expect(client.spec.funcs().length).toBeGreaterThan(0);
      // The instance lookup, then the wasm fetch.
      expect(mockPost).toHaveBeenCalledTimes(2);
    });
  });

  describe("Stellar Asset Contract (SAC)", () => {
    // A SAC's contract instance has a `StellarAsset` executable instead of a
    // wasm hash, so there is no wasm to download from the network.
    const sacInstanceEntry = xdr.LedgerEntryData.contractData(
      new xdr.ContractDataEntry({
        ext: xdr.ExtensionPoint.v0(),
        contract: address.toScAddress(),
        durability: xdr.ContractDataDurability.persistent,
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
        server,
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
      expect(mockPost).toHaveBeenCalledTimes(1);
    });
  });
});
