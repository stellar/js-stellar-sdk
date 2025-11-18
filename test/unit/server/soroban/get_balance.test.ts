import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { StellarSdk } from "../../../test-utils/stellar-sdk-import";

import { serverUrl } from "../../../constants";

const { Address, Keypair, xdr, nativeToScVal } = StellarSdk;
const { Server } = StellarSdk.rpc;


describe("Server#getSACBalance|getAssetBalance", () => {
  let server: any;
  let mockPost: any;

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const token = StellarSdk.Asset.native();
  const contract = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
  const contractAddress = new Address(
    token.contractId(StellarSdk.Networks.TESTNET),
  ).toScAddress();

  const val = nativeToScVal(
    {
      amount: 1_000_000_000_000n,
      clawback: false,
      authorized: true,
    },
    {
      type: {
        amount: ["symbol", "i128"],
        clawback: ["symbol", "boolean"],
        authorized: ["symbol", "boolean"],
      },
    },
  );

  function buildBalanceArtifacts() {
    const key = xdr.ScVal.scvVec([
      nativeToScVal("Balance", { type: "symbol" }),
      nativeToScVal(contract, { type: "address" }),
    ]);

    const entry = xdr.LedgerEntryData.contractData(
      new xdr.ContractDataEntry({
        ext: new (xdr.ExtensionPoint as any)(0),
        contract: contractAddress,
        durability: xdr.ContractDataDurability.persistent(),
        key,
        val,
      }),
    );

    const ledgerKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: entry.contractData().contract(),
        durability: entry.contractData().durability(),
        key: entry.contractData().key(),
      }),
    );

    return { entry, ledgerKey };
  }

  function buildMockResult() {
    const { entry, ledgerKey } = buildBalanceArtifacts();
    const result = {
      latestLedger: 1000,
      entries: [
        {
          lastModifiedLedgerSeq: 1,
          liveUntilLedgerSeq: 1000,
          key: ledgerKey.toXDR("base64"),
          xdr: entry.toXDR("base64"),
        },
      ],
    };

    const mockResponse = {
      data: { result },
    };

    mockPost.mockResolvedValue(mockResponse);
    return { entry, ledgerKey, result };
  }

  it("returns the correct balance entry", async () => {
    const { ledgerKey } = buildMockResult();

    const response = await server.getSACBalance(
      contract,
      token,
      StellarSdk.Networks.TESTNET,
    );
    expect(response.latestLedger).toBe(1000);
    expect(response.balanceEntry).toBeDefined();
    expect(response.balanceEntry.amount).toBe("1000000000000");
    expect(response.balanceEntry.authorized).toBeTruthy();
    expect(response.balanceEntry.clawback).toBeFalsy();
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [ledgerKey.toXDR("base64")] },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);

    const assetResponse = await server.getAssetBalance(
      contract,
      token,
      StellarSdk.Networks.TESTNET,
    );
    expect(assetResponse).to.deep.equal(response);
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it("infers the network passphrase", async () => {
    const { entry, ledgerKey } = buildBalanceArtifacts();
    const balanceResult = {
      latestLedger: 1000,
      entries: [
        {
          lastModifiedLedgerSeq: 1,
          liveUntilLedgerSeq: 1000,
          key: ledgerKey.toXDR("base64"),
          xdr: entry.toXDR("base64"),
        },
      ],
    };

    const networkResponse = {
      data: {
        result: {
          passphrase: StellarSdk.Networks.TESTNET,
        },
      },
    };

    const balanceResponse = {
      data: { result: balanceResult },
    };

    // Mock both calls in sequence
    mockPost
      .mockResolvedValueOnce(networkResponse) // First call for getNetwork
      .mockResolvedValueOnce(balanceResponse); // Second call for getLedgerEntries

    const response = await server.getSACBalance(contract, token);
    expect(response.latestLedger).toBe(1000);
    expect(response.balanceEntry).toBeDefined();
    expect(response.balanceEntry.amount).toBe("1000000000000");
    expect(response.balanceEntry.authorized).toBeTruthy();
    expect(response.balanceEntry.clawback).toBeFalsy();
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getNetwork",
      params: null,
    });
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it("throws on account addresses", async () => {
    const account = Keypair.random().publicKey();

    await expect(server.getSACBalance(account, token)).rejects.toThrow(
      /expected contract ID/,
    );
  });

  it("throws on invalid addresses", async () => {
    await expect(
      server.getSACBalance(contract.substring(0, -1), token),
    ).rejects.toThrow(/expected contract ID/);
  });
});
