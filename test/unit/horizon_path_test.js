const { Horizon } = StellarSdk;

const serverUrls = [
  "https://acme.com:1337",
  "https://acme.com:1337/folder",
  "https://acme.com:1337/folder/subfolder",
];

serverUrls.forEach((serverUrl) => {
  describe(`horizon path tests for ${serverUrl}`, function () {
    let server;
    let axiosMock;

    beforeEach(function () {
      StellarSdk.Config.setDefault();
      server = new Horizon.Server(serverUrl);
      axiosMock = sinon.mock(server.httpClient);
    });

    afterEach(function () {
      axiosMock.verify();
      axiosMock.restore();
    });

    let randomResult = {
      data: {
        url: serverUrl,
        random: Math.round(1000 * Math.random()),
        endpoint: "bogus",
      },
    };

    function prepareAxios(endpoint) {
      randomResult.endpoint = endpoint;
      axiosMock
        .expects("get")
        .withArgs(sinon.match(serverUrl + endpoint))
        .returns(Promise.resolve(randomResult));
    }

    it("server.accounts()", function (done) {
      prepareAxios("/accounts");
      server
        .accounts()
        .call()
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });

    it("server.accounts().accountId('fooAccountId')", function (done) {
      prepareAxios("/accounts/fooAccountId");
      server
        .accounts()
        .accountId("fooAccountId")
        .call()
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });

    it("server.transactions()", function (done) {
      prepareAxios("/transactions");
      server
        .transactions()
        .call()
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });

    it("server.transactions().includeFailed(true)", function (done) {
      prepareAxios("/transactions?include_failed=true");
      server
        .transactions()
        .includeFailed(true)
        .call()
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });

    it("server.operations().includeFailed(true)", function (done) {
      prepareAxios("/operations?include_failed=true");
      server
        .operations()
        .includeFailed(true)
        .call()
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });

    it("server.payments().includeFailed(true)", function (done) {
      prepareAxios("/payments?include_failed=true");
      server
        .payments()
        .includeFailed(true)
        .call()
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });

    it("server.transactions().transaction('fooTransactionId')", function (done) {
      prepareAxios("/transactions/fooTransactionId");
      server
        .transactions()
        .transaction("fooTransactionId")
        .call()
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });

    it("server.transactions().forAccount('fooAccountId')", function (done) {
      prepareAxios("/accounts/fooAccountId/transactions");
      server
        .transactions()
        .forAccount("fooAccountId")
        .call()
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });

    it("server.submitTransaction()", function (done) {
      randomResult.endpoint = "post";

      let keypair = StellarSdk.Keypair.random();
      let account = new StellarSdk.Account(
        keypair.publicKey(),
        "56199647068161",
      );

      let fakeTransaction = new StellarSdk.TransactionBuilder(account, {
        fee: 100,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: keypair.publicKey(),
            asset: StellarSdk.Asset.native(),
            amount: "100.50",
          }),
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();
      fakeTransaction.sign(keypair);
      let tx = encodeURIComponent(
        fakeTransaction.toEnvelope().toXDR().toString("base64"),
      );

      axiosMock
        .expects("post")
        .withArgs(sinon.match(serverUrl + "/transactions", `tx=${tx}`))
        .returns(Promise.resolve(randomResult));

      server
        .submitTransaction(fakeTransaction, { skipMemoRequiredCheck: true })
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });
  });
});
