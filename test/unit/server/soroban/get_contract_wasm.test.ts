import {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  vi,
  assert,
} from "vitest";
import { xdr, hash, Contract, rpc } from "../../../../src/index.js";

import { serverUrl } from "../../../constants.js";

const { Server } = rpc;

describe("Server#getContractWasm", () => {
  let server: rpc.Server;
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
  const contractCodeEntryExtension = xdr.ContractCodeEntryExt.fromXDR(
    "AAAAAQAAAAAAAAAAAAAVqAAAAJwAAAADAAAAAwAAABgAAAABAAAAAQAAABEAAAAgAAABpA==",
    "base64",
  );

  const contract = new Contract(contractId);
  const contractLedgerKey = contract.getFootprint();
  const address = contract.address();

  const ledgerEntryWasmHash: xdr.LedgerEntryData = {
    type: "contractData",
    contractData: {
      ext: { type: "case0" },
      contract: address.toScAddress(),
      durability: "persistent",
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      val: xdr.ScVal.scvContractInstance({
        executable: xdr.ContractExecutable.contractExecutableWasm(wasmHash),
        storage: null,
      }),
    },
  };

  const ledgerKeyWasmHash: xdr.LedgerKey = {
    type: "contractData",
    contractData: {
      contract: ledgerEntryWasmHash.contractData.contract,
      durability: ledgerEntryWasmHash.contractData.durability,
      key: ledgerEntryWasmHash.contractData.key,
    },
  };
  const ledgerTtlEntryWasmHash: xdr.LedgerEntryData = {
    type: "ttl",
    ttl: {
      keyHash: hash(Buffer.from(xdr.LedgerKey.toXDR(ledgerKeyWasmHash))),
      liveUntilLedgerSeq: 1000,
    },
  };

  const wasmHashResult = {
    lastModifiedLedgerSeq: 1,
    key: ledgerKeyWasmHash,
    val: ledgerEntryWasmHash,
    liveUntilLedgerSeq: 1000,
  };

  const wasmLedgerKey = xdr.LedgerKey.contractCode({
    hash: wasmHash,
  });
  const wasmLedgerCode = xdr.LedgerEntryData.contractCode({
    ext: contractCodeEntryExtension,
    hash: wasmHash,
    code: wasmBuffer,
  });

  const wasmLedgerTtlEntry: xdr.LedgerEntryData = {
    type: "ttl",
    ttl: {
      keyHash: hash(Buffer.from(xdr.LedgerKey.toXDR(wasmLedgerKey))),
      liveUntilLedgerSeq: 1000,
    },
  };

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
              xdr: xdr.LedgerEntryData.toXDR(ledgerEntryWasmHash, "base64"),
              key: xdr.LedgerKey.toXDR(contractLedgerKey, "base64"),
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
              xdr: xdr.LedgerEntryData.toXDR(wasmLedgerCode, "base64"),
              key: xdr.LedgerKey.toXDR(wasmLedgerKey, "base64"),
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
      params: { keys: [xdr.LedgerKey.toXDR(contractLedgerKey, "base64")] },
    });
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [xdr.LedgerKey.toXDR(wasmLedgerKey, "base64")] },
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
      params: { keys: [xdr.LedgerKey.toXDR(contractLedgerKey, "base64")] },
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
              xdr: xdr.LedgerEntryData.toXDR(ledgerEntryWasmHash, "base64"),
              key: xdr.LedgerKey.toXDR(contractLedgerKey, "base64"),
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
      params: { keys: [xdr.LedgerKey.toXDR(contractLedgerKey, "base64")] },
    });
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [xdr.LedgerKey.toXDR(wasmLedgerKey, "base64")] },
    });
    expect(mockPost).toHaveBeenCalledTimes(2);
  });
});
