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
  mockPost.mockResolvedValue(mockResponse);

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
  mockPost.mockResolvedValue(mockResponse);

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
            Number(tl.balanceEntry!.clawback) |
            Number(tl.balanceEntry!.revocable!),
          ext: new (xdr.TrustLineEntryExt as any)(0),
        });
      },
      xdr.TrustLineEntry,
      trustlineEntry.toXDR("base64"),
      2, // extra for getLatestLedger call
    ));

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
