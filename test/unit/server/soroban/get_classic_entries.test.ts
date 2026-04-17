import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { StellarSdk } from "../../../test-utils/stellar-sdk-import";

import { serverUrl } from "../../../constants";
import { Api } from "../../../../lib/rpc";

const { Asset, Keypair, StrKey, xdr, hash } = StellarSdk;
const { Server } = StellarSdk.rpc;

function expectLedgerEntryFound(
  mockPost: any,
  ledgerKeyXDR: string,
  ledgerEntryXDR: string,
  call: () => Promise<any>,
  expectedType: any,
  expectedXDR: string,
  times: number = 1,
) {
  const mockResponse = {
    data: {
      result: {
        latestLedger: 0,
        entries: [
          {
            key: ledgerKeyXDR,
            xdr: ledgerEntryXDR,
          },
        ],
      },
    },
  };
  mockPost.mockImplementation((_: any, body: any) => {
    if (body && body.method === "getLatestLedger") {
      return Promise.resolve({
        data: {
          result: {
            id: "hashed_id",
            sequence: 123,
            protocolVersion: "20",
            closeTime: "124",
            headerXdr:
              "AAAAGrP0s/PGggfZROfm4UrD2ul0kjwslx8W5YhzlGrP1kmlLqJv3aMl3XEf5FOicCD8tDOT0RNfC5huOz82oO+R2lYAAAAAaeEr4gAAAAAAAAABAAAAALVdELK7fShO1cA6R6XhtZDJD1eDVUccxFB7voIE0jyLAAAAQEMyjPK8bIfQbIrUCHW40CP4+YvCImxg16wuSIjEl43NwDbpsGwu3wQmbi/u8WIZsL6MSTLMXlyXYJDZsRM1pQVU05gS2Au4O3vlO2eyFYdtVS8dCHe0xpQYHXySoXVMo7cVZULv/3jAlcjIvlsAn9k0QMOkSYl3lWBCxEKVK785AB+dnA3gtrOnZAAAAAABMFvNhVUAAAAAAAAAAAABiJMAAABkAExLQAAAAMgQFSWR4kocJqxbAsjAStNr1C1FPlc8QXXsjTfs9IydXFT0EtE8W/9jSNRWmLdX985erJs28eCPXUKZpEvoEx+1H5C0OqNqUACzQFS756EBZ0pgw/b3mKoBb8yYOXC9yWGOFIykqWNbxH+1ZyiD369YvoPJhDkeL1vb0PUdGO+NuAAAAAA=",
            metadataXdr:
              "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",
          },
        },
      });
    }
    return Promise.resolve(mockResponse);
  });

  return call().then((entry: any) => {
    expect(entry).toBeInstanceOf(expectedType);
    expect(entry.toXDR("base64")).toBe(expectedXDR);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [ledgerKeyXDR] },
    });
    expect(mockPost).toHaveBeenCalledTimes(times);
  });
}

function expectLedgerEntryNotFound(
  mockPost: any,
  ledgerKeyXDR: string,
  call: () => Promise<any>,
  message: string,
) {
  const mockResponse = {
    data: {
      result: {
        latestLedger: 0,
        entries: [],
      },
    },
  };
  mockPost.mockImplementation((url: any, body: any) => {
    if (body && body.method === "getLatestLedger") {
      return Promise.resolve({ data: { result: { latestLedger: 0 } } });
    }
    return Promise.resolve(mockResponse);
  });

  return call()
    .then(() => Promise.reject(new Error("Expected rejection")))
    .catch((error: any) => {
      expect(error.message).toBe(message);
      expect(mockPost).toHaveBeenCalledWith(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [ledgerKeyXDR] },
      });
    });
}

describe("Server#getAccountEntry", () => {
  let server: any;
  let mockPost: any;

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const account = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
  const accountId = Keypair.fromPublicKey(account).xdrAccountId();
  const ledgerKey = xdr.LedgerKey.account(
    new xdr.LedgerKeyAccount({ accountId }),
  );
  const accountEntry = new xdr.AccountEntry({
    accountId,
    balance: xdr.Int64.fromString("1"),
    seqNum: xdr.Int64.fromString("1"),
    numSubEntries: 0,
    inflationDest: null,
    flags: 0,
    homeDomain: "",
    thresholds: Buffer.from("AQAAAA==", "base64"),
    signers: [],
    ext: new (xdr.AccountEntryExt as any)(0),
  });
  const ledgerEntry = xdr.LedgerEntryData.account(accountEntry);
  const ledgerKeyXDR = ledgerKey.toXDR("base64");
  const ledgerEntryXDR = ledgerEntry.toXDR("base64");

  it("returns the account entry when one is found", () =>
    expectLedgerEntryFound(
      mockPost,
      ledgerKeyXDR,
      ledgerEntryXDR,
      () => server.getAccountEntry(account),
      xdr.AccountEntry,
      accountEntry.toXDR("base64"),
    ));

  it("throws a helpful error when the account is missing", () =>
    expectLedgerEntryNotFound(
      mockPost,
      ledgerKeyXDR,
      () => server.getAccountEntry(account),
      `Account not found: ${account}`,
    ));
});

describe("Server#getTrustline", () => {
  let server: any;
  let mockPost: any;

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const account = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
  const issuer = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
  const asset = new Asset("USDC", issuer);
  const accountId = Keypair.fromPublicKey(account).xdrAccountId();
  const trustlineKey = xdr.LedgerKey.trustline(
    new xdr.LedgerKeyTrustLine({
      accountId,
      asset: asset.toTrustLineXDRObject(),
    }),
  );
  const trustlineEntry = new xdr.TrustLineEntry({
    accountId,
    asset: asset.toTrustLineXDRObject(),
    balance: xdr.Int64.fromString("500"),
    limit: xdr.Int64.fromString("1000"),
    flags: 1,
    ext: new (xdr.TrustLineEntryExt as any)(0),
  });
  const trustlineLedgerEntry = xdr.LedgerEntryData.trustline(trustlineEntry);
  const trustlineKeyXDR = trustlineKey.toXDR("base64");
  const trustlineEntryXDR = trustlineLedgerEntry.toXDR("base64");

  it("returns the trustline entry when it exists", () =>
    expectLedgerEntryFound(
      mockPost,
      trustlineKeyXDR,
      trustlineEntryXDR,
      async () => {
        const tl: Api.BalanceResponse = await server.getAssetBalance(
          account,
          asset,
        );
        return new xdr.TrustLineEntry({
          accountId,
          asset: asset.toTrustLineXDRObject(),
          balance: xdr.Int64.fromString(tl.balanceEntry!.amount),
          limit: xdr.Int64.fromString("1000"),
          flags:
            Number(tl.balanceEntry!.authorized) |
            (Number(tl.balanceEntry!.authorizedToMaintainLiabilities) << 1) |
            (Number(tl.balanceEntry!.clawback) << 2),
          ext: new (xdr.TrustLineEntryExt as any)(0),
        });
      },
      xdr.TrustLineEntry,
      trustlineEntry.toXDR("base64"),
      2, // extra for getLatestLedger call
    ));

  it("correctly decodes trustline flags including clawback", () => {
    const clawbackEntry = new xdr.TrustLineEntry({
      accountId,
      asset: asset.toTrustLineXDRObject(),
      balance: xdr.Int64.fromString("500"),
      limit: xdr.Int64.fromString("1000"),
      flags: 5, // authorized (0x1) + clawback (0x4)
      ext: new (xdr.TrustLineEntryExt as any)(0),
    });
    const clawbackEntryXDR =
      xdr.LedgerEntryData.trustline(clawbackEntry).toXDR("base64");

    return expectLedgerEntryFound(
      mockPost,
      trustlineKeyXDR,
      clawbackEntryXDR,
      async () => {
        const tl: Api.BalanceResponse = await server.getAssetBalance(
          account,
          asset,
        );
        expect(tl.balanceEntry!.authorized).toBe(true);
        expect(tl.balanceEntry!.clawback).toBe(true);
        expect(tl.balanceEntry!.authorizedToMaintainLiabilities).toBe(false);
        return clawbackEntry;
      },
      xdr.TrustLineEntry,
      clawbackEntry.toXDR("base64"),
      2,
    );
  });

  it("throws an error when the trustline is missing", () =>
    expectLedgerEntryNotFound(
      mockPost,
      trustlineKeyXDR,
      () => server.getTrustline(account, asset),
      `Trustline for ${asset.getCode()}:${asset.getIssuer()} not found for ${account}`,
    ));
});

describe("Server#getClaimableBalance", () => {
  let server: any;
  let mockPost: any;

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const claimantAccount =
    "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
  const balanceIdBytes = hash(Buffer.from("claimable-balance-test"));
  const balanceId =
    xdr.ClaimableBalanceId.claimableBalanceIdTypeV0(balanceIdBytes);
  const ledgerKey = xdr.LedgerKey.claimableBalance(
    new xdr.LedgerKeyClaimableBalance({ balanceId }),
  );
  const claimant = xdr.Claimant.claimantTypeV0(
    new xdr.ClaimantV0({
      destination: Keypair.fromPublicKey(claimantAccount).xdrAccountId(),
      predicate: xdr.ClaimPredicate.claimPredicateUnconditional(),
    }),
  );
  const claimableBalanceEntry = new xdr.ClaimableBalanceEntry({
    balanceId,
    claimants: [claimant],
    asset: Asset.native().toXDRObject(),
    amount: xdr.Int64.fromString("200"),
    ext: new (xdr.ClaimableBalanceEntryExt as any)(0),
  });
  const ledgerEntry = xdr.LedgerEntryData.claimableBalance(
    claimableBalanceEntry,
  );
  const ledgerKeyXDR = ledgerKey.toXDR("base64");
  const ledgerEntryXDR = ledgerEntry.toXDR("base64");
  const balanceIdHex = balanceId.toXDR("hex");
  const balanceIdStrKey = StrKey.encodeClaimableBalance(
    Buffer.concat([Buffer.from([balanceId.switch().value]), balanceId.value()]),
  );

  it("returns the claimable balance entry when found", () =>
    expectLedgerEntryFound(
      mockPost,
      ledgerKeyXDR,
      ledgerEntryXDR,
      () => server.getClaimableBalance(balanceIdStrKey),
      xdr.ClaimableBalanceEntry,
      claimableBalanceEntry.toXDR("base64"),
    ));

  it("throws an error when the claimable balance does not exist", () =>
    expectLedgerEntryNotFound(
      mockPost,
      ledgerKeyXDR,
      () => server.getClaimableBalance(balanceIdHex),
      `Claimable balance ${balanceIdHex} not found`,
    ));

  it("rejects when provided id is neither strkey nor hex", () =>
    server
      .getClaimableBalance("not-a-valid-balance-id")
      .then(() => Promise.reject(new Error("Expected rejection")))
      .catch((error: any) => {
        expect(error).toBeInstanceOf(TypeError);
        expect(error.message).toMatch(/expected 72-char hex ID or strkey/i);
      }));
});
