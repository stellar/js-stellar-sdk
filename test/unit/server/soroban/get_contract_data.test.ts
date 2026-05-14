import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import {
  Address,
  xdr,
  nativeToScVal,
  hash,
  rpc,
} from "../../../../src/index.js";
import { serverUrl } from "../../../constants.js";

const { Server, Durability } = rpc;

describe("Server#getContractData", () => {
  let server: rpc.Server;
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

  const ledgerEntry: xdr.LedgerEntryData = {
    type: "contractData",
    contractData: {
      ext: { type: "case0" },
      contract: new Address(address).toScAddress(),
      durability: "persistent",
      key,
      val: key, // lazy
    },
  };

  // the key is a subset of the val
  const ledgerKey = xdr.LedgerKey.contractData({
    contract: ledgerEntry.contractData.contract,
    durability: ledgerEntry.contractData.durability,
    key: ledgerEntry.contractData.key,
  });

  const ledgerTtlEntry: xdr.LedgerEntryData = {
    type: "ttl",
    ttl: {
      keyHash: hash(Buffer.from(xdr.LedgerKey.toXDR(ledgerKey))),
      liveUntilLedgerSeq: 1000,
    },
  };

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
              liveUntilLedgerSeq: ledgerTtlEntry.ttl.liveUntilLedgerSeq,
              lastModifiedLedgerSeq: result.lastModifiedLedgerSeq,
              key: xdr.LedgerKey.toXDR(ledgerKey, "base64"),
              xdr: xdr.LedgerEntryData.toXDR(ledgerEntry, "base64"),
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
    expect(xdr.LedgerKey.toXDR(response.key, "base64")).toEqual(
      xdr.LedgerKey.toXDR(result.key, "base64"),
    );
    expect(xdr.LedgerEntryData.toXDR(response.val, "base64")).toEqual(
      xdr.LedgerEntryData.toXDR(result.val, "base64"),
    );
    expect(response.liveUntilLedgerSeq).toEqual(1000);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [xdr.LedgerKey.toXDR(ledgerKey, "base64")] },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("contract data key not found", async () => {
    // clone and change durability to test this case
    const ledgerKeyDupe = xdr.LedgerKey.fromXDR(xdr.LedgerKey.toXDR(ledgerKey));
    if (ledgerKeyDupe.type !== "contractData") {
      throw new Error("Expected contractData ledger key");
    }
    (ledgerKeyDupe.contractData.durability as any) = "temporary";

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
      params: { keys: [xdr.LedgerKey.toXDR(ledgerKeyDupe, "base64")] },
    });
  });

  it("fails on hex address (was deprecated now unsupported)", async () => {
    const hexAddress = `${"0".repeat(63)}1`;
    await expect(
      server.getContractData(hexAddress, key, Durability.Persistent),
    ).rejects.toThrow(/Invalid contract ID/);
  });
});
