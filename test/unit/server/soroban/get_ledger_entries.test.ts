import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import {
  xdr,
  nativeToScVal,
  hash,
  rpc,
  Address,
} from "../../../../src/index.js";

import { serverUrl } from "../../../constants.js";

const { Server } = rpc;

describe("Server#getLedgerEntries", () => {
  let server: rpc.Server;
  let mockPost: any;
  const address = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
  const key = nativeToScVal(["test"]);
  const ledgerEntry: xdr.LedgerEntryData = {
    type: "contractData",
    contractData: {
      ext: { type: "case0" },
      contract: new Address(address).toScAddress(),
      durability: "persistent",
      key,
      val: key,
    },
  };
  const ledgerKey = xdr.LedgerKey.contractData({
    contract: ledgerEntry.contractData.contract,
    durability: ledgerEntry.contractData.durability,
    key: ledgerEntry.contractData.key,
  });
  const ledgerTtlEntry = {
    keyHash: hash(Buffer.from(xdr.LedgerKey.toXDR(ledgerKey))),
    liveUntilLedgerSeq: 1000,
  };
  const ledgerKeyXDR = xdr.LedgerKey.toXDR(ledgerKey, "base64");
  const ledgerEntryXDR = xdr.LedgerEntryData.toXDR(ledgerEntry, "base64");

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function mockRPC(_requests: string[], entries: any[]) {
    const mockResponse = {
      data: {
        result: {
          latestLedger: 420,
          entries,
        },
      },
    };
    mockPost.mockResolvedValue(mockResponse);
  }

  it("ledger entry found, includes ttl meta in response", async () => {
    mockRPC(
      [ledgerKeyXDR],
      [
        {
          liveUntilLedgerSeq: ledgerTtlEntry.liveUntilLedgerSeq,
          lastModifiedLedgerSeq: 2,
          key: ledgerKeyXDR,
          xdr: ledgerEntryXDR,
        },
      ],
    );

    const response = await server.getLedgerEntries(ledgerKey);
    expect(response.entries).toHaveLength(1);
    const result = response.entries[0];
    expect(result.lastModifiedLedgerSeq).toEqual(2);
    expect(xdr.LedgerKey.toXDR(result.key, "base64")).toEqual(ledgerKeyXDR);
    expect(xdr.LedgerEntryData.toXDR(result.val, "base64")).toEqual(
      ledgerEntryXDR,
    );
    expect(result.liveUntilLedgerSeq).toEqual(1000);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [ledgerKeyXDR] },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("ledger entry found, no ttl in response", async () => {
    mockRPC(
      [ledgerKeyXDR],
      [
        {
          lastModifiedLedgerSeq: 2,
          key: ledgerKeyXDR,
          xdr: ledgerEntryXDR,
        },
      ],
    );

    const response = await server.getLedgerEntries(ledgerKey);
    expect(response.entries).toHaveLength(1);
    const result = response.entries[0];
    expect(result.lastModifiedLedgerSeq).toEqual(2);
    expect(xdr.LedgerKey.toXDR(result.key, "base64")).toEqual(ledgerKeyXDR);
    expect(xdr.LedgerEntryData.toXDR(result.val, "base64")).toEqual(
      ledgerEntryXDR,
    );
    expect(result.liveUntilLedgerSeq).toBeUndefined();
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [ledgerKeyXDR] },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("throws when invalid rpc response", async () => {
    // these are simulating invalid json, missing `xdr` and `key`
    mockRPC(
      [ledgerKeyXDR],
      [
        {
          lastModifiedLedgerSeq: 2,
        },
        {
          lastModifiedLedgerSeq: 1,
        },
      ],
    );

    await expect(server.getLedgerEntries(ledgerKey)).rejects.toThrow(
      /invalid ledger entry/i,
    );
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [ledgerKeyXDR] },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
