const { Asset, Keypair, StrKey, xdr, hash } = StellarSdk;
const { Server, AxiosClient } = StellarSdk.rpc;

function expectLedgerEntryFound(
  axiosMock,
  ledgerKeyXDR,
  ledgerEntryXDR,
  call,
  expectedType,
  expectedXDR,
) {
  axiosMock
    .expects("post")
    .withArgs(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [ledgerKeyXDR] },
    })
    .returns(
      Promise.resolve({
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
      }),
    );

  return call().then((entry) => {
    expect(entry).to.be.instanceof(expectedType);
    expect(entry.toXDR("base64")).to.equal(expectedXDR);
  });
}

function expectLedgerEntryNotFound(axiosMock, ledgerKeyXDR, call, message) {
  axiosMock
    .expects("post")
    .withArgs(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [ledgerKeyXDR] },
    })
    .returns(
      Promise.resolve({
        data: {
          result: {
            latestLedger: 0,
            entries: [],
          },
        },
      }),
    );

  return call()
    .then(() => Promise.reject(new Error("Expected rejection")))
    .catch((error) => {
      expect(error.message).to.equal(message);
    });
}

describe("Server#getAccountEntry", function () {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  const account = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
  const accountId = Keypair.fromPublicKey(account).xdrAccountId();
  const ledgerKey = xdr.LedgerKey.account(
    new xdr.LedgerKeyAccount({ accountId }),
  );
  const accountEntry = new xdr.AccountEntry({
    accountId,
    balance: xdr.Int64.fromString("1"),
    seqNum: xdr.SequenceNumber.fromString("1"),
    numSubEntries: 0,
    inflationDest: null,
    flags: 0,
    homeDomain: "",
    thresholds: Buffer.from("AQAAAA==", "base64"),
    signers: [],
    ext: new xdr.AccountEntryExt(0),
  });
  const ledgerEntry = xdr.LedgerEntryData.account(accountEntry);
  const ledgerKeyXDR = ledgerKey.toXDR("base64");
  const ledgerEntryXDR = ledgerEntry.toXDR("base64");

  it("returns the account entry when one is found", function () {
    return expectLedgerEntryFound(
      this.axiosMock,
      ledgerKeyXDR,
      ledgerEntryXDR,
      () => this.server.getAccountEntry(account),
      xdr.AccountEntry,
      accountEntry.toXDR("base64"),
    );
  });

  it("throws a helpful error when the account is missing", function () {
    return expectLedgerEntryNotFound(
      this.axiosMock,
      ledgerKeyXDR,
      () => this.server.getAccountEntry(account),
      `Account not found: ${account}`,
    );
  });
});

describe("Server#getTrustline", function () {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
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
    ext: new xdr.TrustLineEntryExt(0),
  });
  const trustlineLedgerEntry = xdr.LedgerEntryData.trustline(trustlineEntry);
  const trustlineKeyXDR = trustlineKey.toXDR("base64");
  const trustlineEntryXDR = trustlineLedgerEntry.toXDR("base64");

  it("returns the trustline entry when it exists", function () {
    return expectLedgerEntryFound(
      this.axiosMock,
      trustlineKeyXDR,
      trustlineEntryXDR,
      () => this.server.getTrustline(account, asset),
      xdr.TrustLineEntry,
      trustlineEntry.toXDR("base64"),
    );
  });

  it("throws an error when the trustline is missing", function () {
    return expectLedgerEntryNotFound(
      this.axiosMock,
      trustlineKeyXDR,
      () => this.server.getTrustline(account, asset),
      `Trustline for ${asset.getCode()}:${asset.getIssuer()} not found for ${account}`,
    );
  });
});

describe("Server#getClaimableBalance", function () {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
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
    ext: new xdr.ClaimableBalanceEntryExt(0),
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

  it("returns the claimable balance entry when found", function () {
    return expectLedgerEntryFound(
      this.axiosMock,
      ledgerKeyXDR,
      ledgerEntryXDR,
      () => this.server.getClaimableBalance(balanceIdStrKey),
      xdr.ClaimableBalanceEntry,
      claimableBalanceEntry.toXDR("base64"),
    );
  });

  it("throws an error when the claimable balance does not exist", function () {
    return expectLedgerEntryNotFound(
      this.axiosMock,
      ledgerKeyXDR,
      () => this.server.getClaimableBalance(balanceIdHex),
      `Claimable balance ${balanceIdHex} not found`,
    );
  });

  it("rejects when provided id is neither strkey nor hex", function () {
    return this.server
      .getClaimableBalance("not-a-valid-balance-id")
      .then(() => Promise.reject(new Error("Expected rejection")))
      .catch((error) => {
        expect(error).to.be.instanceof(TypeError);
        expect(error.message).to.match(/expected 72-char hex ID or strkey/i);
      });
  });
});
