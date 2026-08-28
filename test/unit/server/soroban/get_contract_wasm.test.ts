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

const { xdr, hash, Contract } = StellarSdk;

const { Server } = StellarSdk.rpc;

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
  const contractCodeEntryExtension = xdr.ContractCodeEntryExt.fromXDR(
    "AAAAAQAAAAAAAAAAAAAVqAAAAJwAAAADAAAAAwAAABgAAAABAAAAAQAAABEAAAAgAAABpA==",
    "base64",
  );

  const contract = new Contract(contractId);
  const contractLedgerKey = contract.getFootprint();
  const address = contract.address();

  const ledgerEntryWasmHash = xdr.LedgerEntryData.contractData(
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
  const ledgerKeyWasmHash = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: ledgerEntryWasmHash.contractData().contract(),
      durability: ledgerEntryWasmHash.contractData().durability(),
      key: ledgerEntryWasmHash.contractData().key(),
    }),
  );
  const ledgerTtlEntryWasmHash = xdr.LedgerEntryData.ttl(
    new xdr.TtlEntry({
      keyHash: hash(ledgerKeyWasmHash.toXDR()),
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
      keyHash: hash(wasmLedgerKey.toXDR()),
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
              liveUntilLedgerSeq: ledgerTtlEntryWasmHash
                .ttl()
                .liveUntilLedgerSeq(),
              lastModifiedLedgerSeq: wasmHashResult.lastModifiedLedgerSeq,
              xdr: ledgerEntryWasmHash.toXDR("base64"),
              key: contractLedgerKey.toXDR("base64"),
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
              liveUntilLedgerSeq: wasmLedgerTtlEntry.ttl().liveUntilLedgerSeq(),
              lastModifiedLedgerSeq: wasmResult.lastModifiedLedgerSeq,
              xdr: wasmLedgerCode.toXDR("base64"),
              key: wasmLedgerKey.toXDR("base64"),
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
      params: { keys: [contractLedgerKey.toXDR("base64")] },
    });
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [wasmLedgerKey.toXDR("base64")] },
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
      params: { keys: [contractLedgerKey.toXDR("base64")] },
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
              liveUntilLedgerSeq: ledgerTtlEntryWasmHash
                .ttl()
                .liveUntilLedgerSeq(),
              lastModifiedLedgerSeq: wasmHashResult.lastModifiedLedgerSeq,
              xdr: ledgerEntryWasmHash.toXDR("base64"),
              key: contractLedgerKey.toXDR("base64"),
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
      params: { keys: [contractLedgerKey.toXDR("base64")] },
    });
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [wasmLedgerKey.toXDR("base64")] },
    });
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it("throws a clear error for a Stellar Asset Contract (SAC)", async () => {
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

    const response = {
      data: {
        result: {
          latestLedger: 18039,
          entries: [
            {
              liveUntilLedgerSeq: 1000,
              lastModifiedLedgerSeq: 1,
              xdr: sacInstanceEntry.toXDR("base64"),
              key: contractLedgerKey.toXDR("base64"),
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

  describe("CAP-85 external executable references", () => {
    const ownerId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
    const owner = new Contract(ownerId);
    const tag = "my-executable";

    // The owner holds a persistent entry keyed by the tag whose value is the
    // 32-byte Wasm hash; the reference itself carries no hash.
    const tagKey = xdr.ScVal.scvExecutableTag(tag);
    const tagLedgerKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: owner.address().toScAddress(),
        durability: xdr.ContractDataDurability.persistent(),
        key: tagKey,
      }),
    );

    function externalRefInstanceEntry(tagValue: string | Buffer = tag) {
      return xdr.LedgerEntryData.contractData(
        new xdr.ContractDataEntry({
          ext: new (xdr.ExtensionPoint as any)(0),
          contract: address.toScAddress(),
          durability: xdr.ContractDataDurability.persistent(),
          key: xdr.ScVal.scvLedgerKeyContractInstance(),
          val: xdr.ScVal.scvContractInstance(
            new xdr.ScContractInstance({
              executable: xdr.ContractExecutable.contractExecutableExternalRef(
                new xdr.ContractExecutableExternalRef({
                  executableOwner: owner.address().toScAddress(),
                  tag: tagValue,
                }),
              ),
              storage: null,
            }),
          ),
        }),
      );
    }

    function tagEntry(value: any) {
      return xdr.LedgerEntryData.contractData(
        new xdr.ContractDataEntry({
          ext: new (xdr.ExtensionPoint as any)(0),
          contract: owner.address().toScAddress(),
          durability: xdr.ContractDataDurability.persistent(),
          key: tagKey,
          val: value,
        }),
      );
    }

    function entryResponse(entry: any, key: any) {
      return {
        data: {
          result: {
            latestLedger: 18039,
            entries: [
              {
                liveUntilLedgerSeq: 1000,
                lastModifiedLedgerSeq: 1,
                xdr: entry.toXDR("base64"),
                key: key.toXDR("base64"),
              },
            ],
          },
        },
      };
    }

    it("resolves the reference and retrieves the WASM", async () => {
      mockPost
        .mockResolvedValueOnce(
          entryResponse(externalRefInstanceEntry(), contractLedgerKey),
        )
        .mockResolvedValueOnce(
          entryResponse(tagEntry(xdr.ScVal.scvBytes(wasmHash)), tagLedgerKey),
        )
        .mockResolvedValueOnce(entryResponse(wasmLedgerCode, wasmLedgerKey));

      const wasmData = await server.getContractWasmByContractId(contractId);
      assert.deepEqual(wasmData, wasmBuffer);

      // instance -> owner's tag entry -> contract code
      expect(mockPost).toHaveBeenCalledWith(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [tagLedgerKey.toXDR("base64")] },
      });
      expect(mockPost).toHaveBeenCalledWith(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [wasmLedgerKey.toXDR("base64")] },
      });
      expect(mockPost).toHaveBeenCalledTimes(3);
    });

    it("keys the lookup on a binary tag without decoding it", async () => {
      // An executable tag is an unbounded SCString and need not be UTF-8. A
      // lenient decode would build a key for a different entry.
      const binaryTag = Buffer.from([0xff, 0xfe, 0x00, 0x41]);
      const binaryTagLedgerKey = xdr.LedgerKey.contractData(
        new xdr.LedgerKeyContractData({
          contract: owner.address().toScAddress(),
          durability: xdr.ContractDataDurability.persistent(),
          key: xdr.ScVal.scvExecutableTag(binaryTag),
        }),
      );

      mockPost.mockResolvedValueOnce(
        entryResponse(externalRefInstanceEntry(binaryTag), contractLedgerKey),
      );
      mockPost.mockResolvedValue({ data: { result: { entries: [] } } });

      await expect(
        server.getContractWasmByContractId(contractId),
      ).rejects.toMatchObject({ code: 404 });

      expect(mockPost).toHaveBeenCalledWith(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [binaryTagLedgerKey.toXDR("base64")] },
      });
    });

    it("rejects when the tag entry does not hold a 32-byte hash", async () => {
      mockPost
        .mockResolvedValueOnce(
          entryResponse(externalRefInstanceEntry(), contractLedgerKey),
        )
        .mockResolvedValueOnce(
          entryResponse(tagEntry(xdr.ScVal.scvU32(7)), tagLedgerKey),
        );

      await expect(
        server.getContractWasmByContractId(contractId),
      ).rejects.toMatchObject({
        code: 404,
        message: expect.stringContaining("32-byte Wasm hash"),
      });
      expect(mockPost).toHaveBeenCalledTimes(2);
    });

    it("rejects when the owner is not a contract", async () => {
      const accountOwner = new StellarSdk.Address(
        "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
      );
      const instanceEntry = xdr.LedgerEntryData.contractData(
        new xdr.ContractDataEntry({
          ext: new (xdr.ExtensionPoint as any)(0),
          contract: address.toScAddress(),
          durability: xdr.ContractDataDurability.persistent(),
          key: xdr.ScVal.scvLedgerKeyContractInstance(),
          val: xdr.ScVal.scvContractInstance(
            new xdr.ScContractInstance({
              executable: xdr.ContractExecutable.contractExecutableExternalRef(
                new xdr.ContractExecutableExternalRef({
                  executableOwner: accountOwner.toScAddress(),
                  tag,
                }),
              ),
              storage: null,
            }),
          ),
        }),
      );

      mockPost.mockResolvedValueOnce(
        entryResponse(instanceEntry, contractLedgerKey),
      );

      // Only a contract can hold the contract data entry that names the Wasm,
      // so this fails before any second lookup.
      await expect(
        server.getContractWasmByContractId(contractId),
      ).rejects.toMatchObject({
        code: 400,
        message: expect.stringContaining("is not a"),
      });
      expect(mockPost).toHaveBeenCalledTimes(1);
    });
  });
});
