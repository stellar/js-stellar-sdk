import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import * as StellarSdk from "../../../../src/index.js";

import { serverUrl } from "../../../constants";

const { Address, xdr, nativeToScVal, hash, rpc } = StellarSdk;
const { Server } = rpc;

describe("Server#getLedgerEntries", () => {
  let server: any;
  let mockPost: any;
  const address = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
  const key = nativeToScVal(["test"]);
  const ledgerEntry = xdr.LedgerEntryData.contractData(
    new xdr.ContractDataEntry({
      ext: xdr.ExtensionPoint.v0(),
      contract: new Address(address).toScAddress(),
      durability: xdr.ContractDataDurability.persistent,
      key,
      val: key,
    }),
  );
  const ledgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: ledgerEntry.contractData.contract,
      durability: ledgerEntry.contractData.durability,
      key: ledgerEntry.contractData.key,
    }),
  );
  const ledgerTtlEntry = new xdr.TtlEntry({
    keyHash: hash(ledgerKey.toXdr()),
    liveUntilLedgerSeq: 1000,
  });
  const ledgerKeyXDR = ledgerKey.toXdr("base64");
  const ledgerEntryXDR = ledgerEntry.toXdr("base64");

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
    expect(result.key.toXdr("base64")).toEqual(ledgerKeyXDR);
    expect(result.val.toXdr("base64")).toEqual(ledgerEntryXDR);
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
    expect(result.key.toXdr("base64")).toEqual(ledgerKeyXDR);
    expect(result.val.toXdr("base64")).toEqual(ledgerEntryXDR);
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
