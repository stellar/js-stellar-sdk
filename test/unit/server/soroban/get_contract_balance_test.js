const { Address, Keypair, xdr, nativeToScVal, hash } = StellarSdk;
const { Server, AxiosClient, Durability } = StellarSdk.rpc;

describe("Server#getSACBalance", function () {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(this.server.httpClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
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
        ext: new xdr.ExtensionPoint(0),
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

  function buildMockResult(that) {
    const { entry, ledgerKey } = buildBalanceArtifacts();
    let result = {
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

    that.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [ledgerKey.toXDR("base64")] },
      })
      .returns(
        Promise.resolve({
          data: { result },
        }),
      );
  }

  it("returns the correct balance entry", function (done) {
    buildMockResult(this);

    this.server
      .getSACBalance(contract, token, StellarSdk.Networks.TESTNET)
      .then((response) => {
        expect(response.latestLedger).to.equal(1000);
        expect(response.balanceEntry).to.not.be.undefined;
        expect(response.balanceEntry.amount).to.equal("1000000000000");
        expect(response.balanceEntry.authorized).to.be.true;
        expect(response.balanceEntry.clawback).to.be.false;
        done();
      })
      .catch((err) => done(err));
  });

  it("infers the network passphrase", function (done) {
    buildMockResult(this);

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getNetwork",
        params: null,
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              passphrase: StellarSdk.Networks.TESTNET,
            },
          },
        }),
      );

    this.server
      .getSACBalance(contract, token)
      .then((response) => {
        expect(response.latestLedger).to.equal(1000);
        expect(response.balanceEntry).to.not.be.undefined;
        expect(response.balanceEntry.amount).to.equal("1000000000000");
        expect(response.balanceEntry.authorized).to.be.true;
        expect(response.balanceEntry.clawback).to.be.false;
        done();
      })
      .catch((err) => done(err));
  });

  it("throws on account addresses", function (done) {
    const account = Keypair.random().publicKey();

    this.server
      .getSACBalance(account, token)
      .then(() => done(new Error("Error didn't occur")))
      .catch((err) => {
        expect(err).to.match(/TypeError/);
        done();
      });
  });

  it("throws on invalid addresses", function (done) {
    this.server
      .getSACBalance(contract.substring(0, -1), token)
      .then(() => done(new Error("Error didn't occur")))
      .catch((err) => {
        expect(err).to.match(/TypeError/);
        done();
      });
  });
});
