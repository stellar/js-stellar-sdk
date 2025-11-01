import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import { StellarSdk } from "../../../test-utils/stellar-sdk-import";
import { serverUrl } from "../../../constants";

const { Address, xdr, nativeToScVal, hash } = StellarSdk;
const { Server, Durability } = StellarSdk.rpc;

describe("Server#getContractData", () => {
  let server: any;
  let mockPost: any;

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const address = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
  const key = nativeToScVal(["Admin"]);

  const ledgerEntry = xdr.LedgerEntryData.contractData(
    new xdr.ContractDataEntry({
      ext: new (xdr.ExtensionPoint as any)(0),
      contract: new Address(address).toScAddress(),
      durability: xdr.ContractDataDurability.persistent(),
      key,
      val: key, // lazy
    }),
  );

  // the key is a subset of the val
  const ledgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: ledgerEntry.contractData().contract(),
      durability: ledgerEntry.contractData().durability(),
      key: ledgerEntry.contractData().key(),
    }),
  );

  const ledgerTtlEntry = xdr.LedgerEntryData.ttl(
    new xdr.TtlEntry({
      keyHash: hash(ledgerKey.toXDR()),
      liveUntilLedgerSeq: 1000,
    }),
  );

  it("contract data key found", async () => {
    const result = {
      lastModifiedLedgerSeq: 1,
      key: ledgerKey,
      val: ledgerEntry,
      liveUntilLedgerSeq: 1000,
    };

    const mockResponse = {
      data: {
        result: {
          latestLedger: 420,
          entries: [
            {
              liveUntilLedgerSeq: ledgerTtlEntry.ttl().liveUntilLedgerSeq(),
              lastModifiedLedgerSeq: result.lastModifiedLedgerSeq,
              key: ledgerKey.toXDR("base64"),
              xdr: ledgerEntry.toXDR("base64"),
            },
          ],
        },
      },
    };

    mockPost.mockResolvedValue(mockResponse);

    const response = await server.getContractData(
      address,
      key,
      Durability.Persistent,
    );
    expect(response.key.toXDR("base64")).toEqual(result.key.toXDR("base64"));
    expect(response.val.toXDR("base64")).toEqual(result.val.toXDR("base64"));
    expect(response.liveUntilLedgerSeq).toEqual(1000);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [ledgerKey.toXDR("base64")] },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("contract data key not found", async () => {
    // clone and change durability to test this case
    const ledgerKeyDupe = xdr.LedgerKey.fromXDR(ledgerKey.toXDR());
    ledgerKeyDupe
      .contractData()
      .durability(xdr.ContractDataDurability.temporary());

    const mockResponse = { data: { result: { entries: [] } } };
    mockPost.mockResolvedValue(mockResponse);

    await expect(
      server.getContractData(address, key, Durability.Temporary),
    ).rejects.toMatchObject({
      code: 404,
    });
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [ledgerKeyDupe.toXDR("base64")] },
    });
  });

  it("fails on hex address (was deprecated now unsupported)", async () => {
    const hexAddress = `${"0".repeat(63)}1`;
    await expect(
      server.getContractData(hexAddress, key, Durability.Persistent),
    ).rejects.toThrow(/Invalid contract ID/);
  });
});
