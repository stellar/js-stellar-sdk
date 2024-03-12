const { Account, Keypair, StrKey, hash, xdr } = StellarSdk;
const { Server, AxiosClient } = StellarSdk.SorobanRpc;

describe("Server#getAccount", function () {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  const address = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
  const accountId = Keypair.fromPublicKey(address).xdrPublicKey();
  const key = xdr.LedgerKey.account(new xdr.LedgerKeyAccount({ accountId }));
  const accountEntry =
    "AAAAAAAAAABzdv3ojkzWHMD7KUoXhrPx0GH18vHKV0ZfqpMiEblG1g3gtpoE608YAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAQAAAAAY9D8iA";

  it("requests the correct method", function (done) {
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [ key.toXDR("base64") ] },
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 0,
              entries: [
                {
                  key: key.toXDR("base64"),
                  xdr: accountEntry,
                },
              ],
            },
          },
        }),
      );

    const expected = new Account(address, "1");
    this.server
      .getAccount(address)
      .then(function (response) {
        expect(response).to.be.deep.equal(expected);
        done();
      })
      .catch(done);
  });

  it("throws a useful error when the account is not found", function (done) {
    const address = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [ key.toXDR("base64") ] },
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 0,
              entries: null,
            },
          },
        }),
      );

    this.server
      .getAccount(address)
      .then(function (_) {
        done(new Error("Expected error to be thrown"));
      })
      .catch(function (err) {
        done(
          err.message === `Account not found: ${address}`
            ? null
            : new Error(`Received unexpected error: ${err.message}`),
        );
      });
  });
});
