const { xdr, nativeToScVal, Durability, hash } = StellarSdk;
const { Server, AxiosClient } = StellarSdk.SorobanRpc;

describe("Server#getLedgerEntries", function () {
  const address = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
  const key = nativeToScVal(["test"]);
  const ledgerEntry = xdr.LedgerEntryData.contractData(
    new xdr.ContractDataEntry({
      ext: new xdr.ExtensionPoint(0),
      contract: new StellarSdk.Address(address).toScAddress(),
      durability: xdr.ContractDataDurability.persistent(),
      key,
      val: key,
    }),
  );
  const ledgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: ledgerEntry.contractData().contract(),
      durability: ledgerEntry.contractData().durability(),
      key: ledgerEntry.contractData().key(),
    }),
  );
  const ledgerExpirationKey = xdr.LedgerKey.expiration(
    new xdr.LedgerKeyExpiration({ keyHash: hash(ledgerKey.toXDR()) }),
  );
  const ledgerExpirationEntry = new xdr.ExpirationEntry({
    keyHash: hash(ledgerKey.toXDR()),
    expirationLedgerSeq: 1000,
  });
  const ledgerExpirationEntryData = xdr.LedgerEntryData.expiration(
    ledgerExpirationEntry,
  );

  const ledgerEntryXDR = ledgerEntry.toXDR("base64");
  const ledgerKeyXDR = ledgerKey.toXDR("base64");
  const ledgerExpirationKeyXDR = ledgerExpirationKey.toXDR("base64");
  const ledgerExpirationEntryXDR = ledgerExpirationEntry.toXDR("base64");
  const ledgerExpirationEntryDataXDR =
    ledgerExpirationEntryData.toXDR("base64");

  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  function mockRPC(axiosMock, requests, entries) {
    axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: [requests],
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 420,
              entries,
            },
          },
        }),
      );
  }

  it("ledger entry found, includes expiration meta", function (done) {
    mockRPC(
      this.axiosMock,
      [ledgerKeyXDR, ledgerExpirationKeyXDR],
      [
        {
          lastModifiedLedgerSeq: 1,
          key: ledgerKeyXDR,
          xdr: ledgerEntryXDR,
        },
        {
          lastModifiedLedgerSeq: 2,
          key: ledgerExpirationKeyXDR,
          xdr: ledgerExpirationEntryDataXDR,
        },
      ],
    );

    this.server
      .getLedgerEntries(ledgerKey)
      .then((response) => {
        expect(response.entries).to.have.lengthOf(1);
        let result = response.entries[0];
        expect(result.lastModifiedLedgerSeq).to.eql(1);
        expect(result.key.toXDR("base64")).to.eql(ledgerKeyXDR);
        expect(result.val.toXDR("base64")).to.eql(ledgerEntryXDR);
        expect(result.expirationLedgerSeq).to.eql(1000);
        done();
      })
      .catch((err) => done(err));
  });

  it("ledger entry found, no expiration meta included in response", function (done) {
    mockRPC(
      this.axiosMock,
      [ledgerKeyXDR, ledgerExpirationKeyXDR],
      [
        {
          lastModifiedLedgerSeq: 1,
          key: ledgerKeyXDR,
          xdr: ledgerEntryXDR,
        },
      ],
    );

    this.server
      .getLedgerEntries(ledgerKey)
      .then((response) => {
        expect(response.entries).to.have.lengthOf(1);
        let result = response.entries[0];
        expect(result.lastModifiedLedgerSeq).to.eql(1);
        expect(result.key.toXDR("base64")).to.eql(ledgerKeyXDR);
        expect(result.val.toXDR("base64")).to.eql(ledgerEntryXDR);
        expect(result.expirationLedgerSeq).to.be.undefined;
        done();
      })
      .catch((err) => done(err));
  });

  it("ledger entry found, includes expiration meta from any order in response", function (done) {
    mockRPC(
      this.axiosMock,
      [ledgerKeyXDR, ledgerExpirationKeyXDR],
      [
        {
          lastModifiedLedgerSeq: 2,
          key: ledgerExpirationKeyXDR,
          xdr: ledgerExpirationEntryDataXDR,
        },
        {
          lastModifiedLedgerSeq: 1,
          key: ledgerKeyXDR,
          xdr: ledgerEntryXDR,
        },
      ],
    );

    this.server
      .getLedgerEntries(ledgerKey)
      .then((response) => {
        expect(response.entries).to.have.lengthOf(1);
        let result = response.entries[0];
        expect(result.lastModifiedLedgerSeq).to.eql(1);
        expect(result.key.toXDR("base64")).to.eql(ledgerKeyXDR);
        expect(result.val.toXDR("base64")).to.eql(ledgerEntryXDR);
        expect(result.expirationLedgerSeq).to.eql(1000);
        done();
      })
      .catch((err) => done(err));
  });

  it("ledger expiration key is requested by caller, no expiration meta needed on response", function (done) {
    mockRPC(
      this.axiosMock,
      [ledgerExpirationKeyXDR],
      [
        {
          lastModifiedLedgerSeq: 2,
          key: ledgerExpirationKeyXDR,
          xdr: ledgerExpirationEntryDataXDR,
        },
      ],
    );

    this.server
      .getLedgerEntries(ledgerExpirationKey)
      .then((response) => {
        expect(response.entries).to.have.lengthOf(1);
        let result = response.entries[0];
        expect(result.lastModifiedLedgerSeq).to.eql(2);
        expect(result.key.toXDR("base64")).to.eql(ledgerExpirationKeyXDR);
        expect(result.val.toXDR("base64")).to.eql(ledgerExpirationEntryDataXDR);
        expect(result.expirationLedgerSeq).to.be.undefined;
        done();
      })
      .catch((err) => done(err));
  });

  it("throws when invalid rpc response", function (done) {
    // these are simulating invalid json, missing `xdr` and `key`
    mockRPC(
      this.axiosMock,
      [ledgerKeyXDR, ledgerExpirationKeyXDR],
      [
        {
          lastModifiedLedgerSeq: 2,
        },
        {
          lastModifiedLedgerSeq: 1,
        },
      ],
    );

    this.server
      .getLedgerEntries(ledgerKey)
      .then((reply) => done(new Error(`should have failed, got: ${reply}`)))
      .catch((error) => {
        expect(error).to.contain(/invalid ledger entry/i);
        done();
      });
  });
});
