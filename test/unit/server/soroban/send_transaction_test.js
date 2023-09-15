const { SorobanServer } = StellarSdk;

describe("Server#sendTransaction", function () {
  let keypair = StellarSdk.Keypair.random();
  let account = new StellarSdk.Account(keypair.publicKey(), "56199647068161");

  beforeEach(function () {
    this.server = new SorobanServer(serverUrl);
    this.axiosMock = sinon.mock(SorobanAxiosClient);
    let transaction = new StellarSdk.TransactionBuilder(account, {
      fee: 100,
      networkPassphrase: StellarSdk.Networks.TESTNET,
      v1: true,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination:
            "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
          asset: StellarSdk.Asset.native(),
          amount: "100.50",
        }),
      )
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();
    transaction.sign(keypair);

    this.transaction = transaction;
    this.hash = this.transaction.hash().toString("hex");
    this.blob = transaction.toEnvelope().toXDR().toString("base64");
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("sends a transaction", function (done) {
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "sendTransaction",
        params: [this.blob],
      })
      .returns(
        Promise.resolve({
          data: { id: 1, result: { id: this.hash, status: "PENDING" } },
        }),
      );

    this.server
      .sendTransaction(this.transaction)
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  xit("adds metadata - tx was too small and was immediately deleted");
  xit("adds metadata, order immediately fills");
  xit("adds metadata, order is open");
  xit("adds metadata, partial fill");
  xit("doesnt add metadata to non-offers");
  xit("adds metadata about offers, even if some ops are not");
  xit("submits fee bump transactions");
});
