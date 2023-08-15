const MockAdapter = require("axios-mock-adapter");

describe("Server#requestAirdrop", function () {
  const { Account, StrKey, xdr } = SorobanClient;

  function accountLedgerEntryData(accountId, sequence) {
    return new xdr.LedgerEntryData.account(
      new xdr.AccountEntry({
        accountId: xdr.AccountId.publicKeyTypeEd25519(
          StrKey.decodeEd25519PublicKey(accountId)
        ),
        balance: xdr.Int64.fromString("1"),
        seqNum: xdr.SequenceNumber.fromString(sequence),
        numSubEntries: 0,
        inflationDest: null,
        flags: 0,
        homeDomain: "",
        // Taken from a real response. idk.
        thresholds: Buffer.from("AQAAAA==", "base64"),
        signers: [],
        ext: new xdr.AccountEntryExt(0),
      })
    );
  }

  // Create a mock transaction meta for the account we're going to request an airdrop for
  function transactionMetaFor(accountId, sequence) {
    const meta = new xdr.TransactionMeta(0, [
      new xdr.OperationMeta({
        changes: [
          xdr.LedgerEntryChange.ledgerEntryCreated(
            new xdr.LedgerEntry({
              lastModifiedLedgerSeq: 0,
              data: accountLedgerEntryData(accountId, sequence),
              ext: new xdr.LedgerEntryExt(0),
            })
          ),
        ],
      }),
    ]);
    return meta;
  }

  beforeEach(function () {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  function mockGetNetwork(friendbotUrl) {
    const result = {
      friendbotUrl,
      passphrase: "Soroban Testnet ; December 2018",
      protocolVersion: 20,
    };
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getNetwork",
        params: null,
      })
      .returns(Promise.resolve({ data: { result } }));
  }

  it("returns true when the account is created", function (done) {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
    mockGetNetwork.call(this, friendbotUrl);

    const result_meta_xdr = transactionMetaFor(accountId, "1234").toXDR(
      "base64"
    );
    this.axiosMock
      .expects("post")
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.resolve({ data: { result_meta_xdr } }));

    this.server
      .requestAirdrop(accountId)
      .then(function (response) {
        expect(response).to.be.deep.equal(new Account(accountId, "1234"));
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("returns false if the account already exists", function (done) {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects("post")
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(
        Promise.reject({
          response: {
            status: 400,
            detail:
              "createAccountAlreadyExist (AAAAAAAAAGT/////AAAAAQAAAAAAAAAA/////AAAAAA=)",
          },
        })
      );

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: [
          [
            xdr.LedgerKey.account(
              new xdr.LedgerKeyAccount({
                accountId: xdr.PublicKey.publicKeyTypeEd25519(
                  StrKey.decodeEd25519PublicKey(accountId)
                ),
              })
            ).toXDR("base64"),
          ],
        ],
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              entries: [
                {
                  xdr: accountLedgerEntryData(accountId, "1234").toXDR(
                    "base64"
                  ),
                },
              ],
            },
          },
        })
      );

    this.server
      .requestAirdrop(accountId)
      .then(function (response) {
        expect(response).to.be.deep.equal(new Account(accountId, "1234"));
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("uses custom friendbotUrl if passed", function (done) {
    const friendbotUrl = "https://custom-friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";

    const result_meta_xdr = transactionMetaFor(accountId, "1234").toXDR(
      "base64"
    );
    this.axiosMock
      .expects("post")
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.resolve({ data: { result_meta_xdr } }));

    this.server
      .requestAirdrop(accountId, friendbotUrl)
      .then(function (response) {
        expect(response).to.be.deep.equal(new Account(accountId, "1234"));
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("rejects invalid addresses", function (done) {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId = "addr&injected=1";
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects("post")
      .withArgs(`${friendbotUrl}?addr=addr%26injected%3D1`)
      .returns(
        Promise.reject({
          response: {
            status: 400,
            type: "https://stellar.org/horizon-errors/bad_request",
            title: "Bad Request",
            detail: "The request you sent was invalid in some way.",
            extras: {
              invalid_field: "addr",
              reason:
                "base32 decode failed: illegal base32 data at input byte 7",
            },
          },
        })
      );

    this.server
      .requestAirdrop(accountId)
      .then(function (_) {
        done(new Error("Should have thrown"));
      })
      .catch(function (err) {
        expect(err.response.extras.reason).to.include("base32 decode failed");
        done();
      });
  });

  it("throws if there is no friendbotUrl set", function (done) {
    const accountId = "addr&injected=1";
    mockGetNetwork.call(this, undefined);

    this.server
      .requestAirdrop(accountId)
      .then(function (_) {
        done(new Error("Should have thrown"));
      })
      .catch(function (err) {
        expect(err.message).to.be.equal(
          "No friendbot URL configured for current network"
        );
        done();
      });
  });

  it("throws if the request fails", function (done) {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects("post")
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.reject(new Error("Request failed")));

    this.server
      .requestAirdrop(accountId)
      .then(function (_) {
        done(new Error("Should have thrown"));
      })
      .catch(function (err) {
        expect(err.message).to.be.equal("Request failed");
        done();
      });
  });
});
