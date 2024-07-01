const { Horizon } = StellarSdk;

describe("server.js async transaction submission tests", function () {
  let keypair = StellarSdk.Keypair.random();
  let account = new StellarSdk.Account(keypair.publicKey(), "56199647068161");

  beforeEach(function () {
    this.server = new Horizon.Server("https://horizon-live.stellar.org:1337");
    this.axiosMock = sinon.mock(Horizon.AxiosClient);
    let transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
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
    this.blob = encodeURIComponent(
      transaction.toEnvelope().toXDR().toString("base64"),
    );
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("sends an async transaction", function (done) {
    this.axiosMock
      .expects("post")
      .withArgs(
        "https://horizon-live.stellar.org:1337/transactions_async",
        `tx=${this.blob}`,
      )
      .returns(Promise.resolve({ data: {} }));

    this.server
      .submitAsyncTransaction(this.transaction, { skipMemoRequiredCheck: true })
      .then(() => done())
      .catch((err) => done(err));
  });
  it("sends an async transaction and gets a PENDING response", function (done) {
    const response = {
      tx_status: "PENDING",
      hash: "db2c69a07be57eb5baefbfbb72b95c7c20d2c4d6f2a0e84e7c27dd0359055a2f",
    };

    this.axiosMock
      .expects("post")
      .withArgs(
        "https://horizon-live.stellar.org:1337/transactions_async",
        `tx=${this.blob}`,
      )
      .returns(Promise.resolve({ data: response }));

    this.server
      .submitAsyncTransaction(this.transaction, { skipMemoRequiredCheck: true })
      .then(function (res) {
        expect(res).to.equal(response);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  it("sends an async transaction and gets a Problem response", function (done) {
    const response = {
      type: "transaction_submission_exception",
      title: "Transaction Submission Exception",
      status: 500,
      detail:
        "Received exception from stellar-core." +
        "The `extras.error` field on this response contains further " +
        "details.  Descriptions of each code can be found at: " +
        "https://developers.stellar.org/api/errors/http-status-codes/horizon-specific/transaction-submission-async/transaction_submission_exception",
      extras: {
        envelope_xdr:
          "AAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAZAEH/OgAAAAgAAAAAQAAAAAAAAAAAAAAAFyIDD0AAAAAAAAAAQAAAAAAAAADAAAAAAAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAAExLQAAAAABAAAAAgAAAAAAAAAAAAAAAAAAAAFPQUH/AAAAQHk3Igj+JXqggsJBFl4mrzgACqxWpx87psxu5UHnSskbwRjHZz89NycCZmJL4gN5WN7twm+wK371K9XcRNDiBwQ=",
        error: "There was an exception when submitting this transaction.",
      },
    };

    this.axiosMock
      .expects("post")
      .withArgs(
        "https://horizon-live.stellar.org:1337/transactions_async",
        `tx=${this.blob}`,
      )
      .returns(Promise.resolve({ data: response }));

    this.server
      .submitAsyncTransaction(this.transaction, { skipMemoRequiredCheck: true })
      .then(function (res) {
        expect(res).to.equal(response);
        done();
      })
      .catch((err) => done(err));
  });
});
