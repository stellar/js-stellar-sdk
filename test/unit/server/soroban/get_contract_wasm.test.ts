import {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  vi,
  assert,
} from "vitest";
import * as StellarSdk from "../../../../src/index.js";

import { serverUrl } from "../../../constants";

const { xdr, hash, Contract, rpc } = StellarSdk;

const { Server } = rpc;

describe("Server#getContractWasm", () => {
  let server: any;
  let mockPost: any;

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const contractId = "CCN57TGC6EXFCYIQJ4UCD2UDZ4C3AQCHVMK74DGZ3JYCA5HD4BY7FNPC";
  const wasmHash = Buffer.from(
    "kh1dFBiUKv/lXkcD+XnVTsbzi+Lps96lfWEk3rFWNnI=",
    "base64",
  );
  const wasmBuffer = Buffer.from(
    "0061730120c0800010ab818080000b20002035503082000336232636439000",
    "hex",
  );
  const contractCodeEntryExtension = xdr.ContractCodeEntryExt.fromXdr(
    "AAAAAQAAAAAAAAAAAAAVqAAAAJwAAAADAAAAAwAAABgAAAABAAAAAQAAABEAAAAgAAABpA==",
    "base64",
  );

  const contract = new Contract(contractId);
  const contractLedgerKey = contract.getFootprint();
  const address = contract.address();

  const ledgerEntryWasmHash = xdr.LedgerEntryData.contractData(
    new xdr.ContractDataEntry({
      ext: xdr.ExtensionPoint.v0(),
      contract: address.toScAddress(),
      durability: xdr.ContractDataDurability.persistent,
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      val: xdr.ScVal.scvContractInstance(
        new xdr.ScContractInstance({
          executable: xdr.ContractExecutable.contractExecutableWasm(
            new xdr.Hash(wasmHash),
          ),
          storage: null,
        }),
      ),
    }),
  );
  const ledgerKeyWasmHash = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: ledgerEntryWasmHash.contractData.contract,
      durability: ledgerEntryWasmHash.contractData.durability,
      key: ledgerEntryWasmHash.contractData.key,
    }),
  );
  const ledgerTtlEntryWasmHash = xdr.LedgerEntryData.ttl(
    new xdr.TtlEntry({
      keyHash: hash(ledgerKeyWasmHash.toXdr()),
      liveUntilLedgerSeq: 1000,
    }),
  );

  const wasmHashResult = {
    lastModifiedLedgerSeq: 1,
    key: ledgerKeyWasmHash,
    val: ledgerEntryWasmHash,
    liveUntilLedgerSeq: 1000,
  };

  const wasmLedgerKey = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: wasmHash,
    }),
  );
  const wasmLedgerCode = xdr.LedgerEntryData.contractCode(
    new xdr.ContractCodeEntry({
      ext: contractCodeEntryExtension,
      hash: wasmHash,
      code: wasmBuffer,
    }),
  );

  const wasmLedgerTtlEntry = xdr.LedgerEntryData.ttl(
    new xdr.TtlEntry({
      keyHash: hash(wasmLedgerKey.toXdr()),
      liveUntilLedgerSeq: 1000,
    }),
  );

  const wasmResult = {
    lastModifiedLedgerSeq: 1,
    key: wasmLedgerKey,
    val: wasmLedgerCode,
    liveUntilLedgerSeq: 1000,
  };

  it("retrieves WASM bytecode for a contract", async () => {
    const firstResponse = {
      data: {
        result: {
          latestLedger: 18039,
          entries: [
            {
              liveUntilLedgerSeq: ledgerTtlEntryWasmHash.ttl.liveUntilLedgerSeq,
              lastModifiedLedgerSeq: wasmHashResult.lastModifiedLedgerSeq,
              xdr: ledgerEntryWasmHash.toXdr("base64"),
              key: contractLedgerKey.toXdr("base64"),
            },
          ],
        },
      },
    };

    const secondResponse = {
      data: {
        result: {
          latestLedger: 18039,
          entries: [
            {
              liveUntilLedgerSeq: wasmLedgerTtlEntry.ttl.liveUntilLedgerSeq,
              lastModifiedLedgerSeq: wasmResult.lastModifiedLedgerSeq,
              xdr: wasmLedgerCode.toXdr("base64"),
              key: wasmLedgerKey.toXdr("base64"),
            },
          ],
        },
      },
    };

    mockPost
      .mockResolvedValueOnce(firstResponse)
      .mockResolvedValueOnce(secondResponse);

    const wasmData = await server.getContractWasmByContractId(contractId);
    assert.deepEqual(wasmData, wasmBuffer);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [contractLedgerKey.toXdr("base64")] },
    });
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [wasmLedgerKey.toXdr("base64")] },
    });
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it("fails when wasmHash is not found", async () => {
    const mockResponse = { data: { result: { entries: [] } } };
    mockPost.mockResolvedValue(mockResponse);

    await expect(
      server.getContractWasmByContractId(contractId),
    ).rejects.toMatchObject({
      code: 404,
    });
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [contractLedgerKey.toXdr("base64")] },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("fails when wasm is not found", async () => {
    const firstResponse = {
      data: {
        result: {
          latestLedger: 18039,
          entries: [
            {
              liveUntilLedgerSeq: ledgerTtlEntryWasmHash.ttl.liveUntilLedgerSeq,
              lastModifiedLedgerSeq: wasmHashResult.lastModifiedLedgerSeq,
              xdr: ledgerEntryWasmHash.toXdr("base64"),
              key: contractLedgerKey.toXdr("base64"),
            },
          ],
        },
      },
    };

    const secondResponse = { data: { result: { entries: [] } } };

    mockPost
      .mockResolvedValueOnce(firstResponse)
      .mockResolvedValueOnce(secondResponse);

    await expect(
      server.getContractWasmByContractId(contractId),
    ).rejects.toMatchObject({
      code: 404,
    });
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [contractLedgerKey.toXdr("base64")] },
    });
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [wasmLedgerKey.toXdr("base64")] },
    });
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it("throws a clear error for a Stellar Asset Contract (SAC)", async () => {
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

    const response = {
      data: {
        result: {
          latestLedger: 18039,
          entries: [
            {
              liveUntilLedgerSeq: 1000,
              lastModifiedLedgerSeq: 1,
              xdr: sacInstanceEntry.toXdr("base64"),
              key: contractLedgerKey.toXdr("base64"),
            },
          ],
        },
      },
    };

    mockPost.mockResolvedValueOnce(response);

    // A SAC has no Wasm to fetch, so this must fail with the same structured
    // { code, message } rejection shape as the method's other errors, instead
    // of crashing while encoding a ledger key from an undefined hash.
    await expect(
      server.getContractWasmByContractId(contractId),
    ).rejects.toMatchObject({
      code: 400,
      message: expect.stringContaining("Stellar Asset Contract"),
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
