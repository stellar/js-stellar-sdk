describe("horizon path tests", function () {
  beforeEach(function () {
    this.axiosMock = sinon.mock(HorizonAxiosClient);
    StellarSdk.Config.setDefault();
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  function test_horizon_paths(serverUrl) {
    let server = new StellarSdk.Server(serverUrl);

    let randomResult = {
      data: {
        url: serverUrl,
        random: Math.round(1000 * Math.random()),
        endpoint: "bogus",
      },
    };

    function prepareAxios(axiosMock, endpoint) {
      randomResult.endpoint = endpoint;
      axiosMock
        .expects("get")
        .withArgs(sinon.match(serverUrl + endpoint))
        .returns(Promise.resolve(randomResult));
    }

    it("server.accounts() " + serverUrl, function (done) {
      prepareAxios(this.axiosMock, "/accounts");
      server
        .accounts()
        .call()
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });

    it(
      "server.accounts().accountId('fooAccountId') " + serverUrl,
      function (done) {
        prepareAxios(this.axiosMock, "/accounts/fooAccountId");
        server
          .accounts()
          .accountId("fooAccountId")
          .call()
          .should.eventually.deep.equal(randomResult.data)
          .notify(done);
      },
    );

    it("server.transactions() " + serverUrl, function (done) {
      prepareAxios(this.axiosMock, "/transactions");
      server
        .transactions()
        .call()
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });

    it(
      "server.transactions().includeFailed(true) " + serverUrl,
      function (done) {
        prepareAxios(this.axiosMock, "/transactions?include_failed=true");
        server
          .transactions()
          .includeFailed(true)
          .call()
          .should.eventually.deep.equal(randomResult.data)
          .notify(done);
      },
    );

    it("server.operations().includeFailed(true) " + serverUrl, function (done) {
      prepareAxios(this.axiosMock, "/operations?include_failed=true");
      server
        .operations()
        .includeFailed(true)
        .call()
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });

    it(
      "server.transactions().transaction('fooTransactionId') " + serverUrl,
      function (done) {
        prepareAxios(this.axiosMock, "/transactions/fooTransactionId");
        server
          .transactions()
          .transaction("fooTransactionId")
          .call()
          .should.eventually.deep.equal(randomResult.data)
          .notify(done);
      },
    );

    it(
      "server.transactions().forAccount('fooAccountId') " + serverUrl,
      function (done) {
        prepareAxios(this.axiosMock, "/accounts/fooAccountId/transactions");
        server
          .transactions()
          .forAccount("fooAccountId")
          .call()
          .should.eventually.deep.equal(randomResult.data)
          .notify(done);
      },
    );

    it("server.submitTransaction() " + serverUrl, function (done) {
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

      this.axiosMock
        .expects("post")
        .withArgs(sinon.match(serverUrl + "/transactions", `tx=${tx}`))
        .returns(Promise.resolve(randomResult));

      server
        .submitTransaction(fakeTransaction, { skipMemoRequiredCheck: true })
        .should.eventually.deep.equal(randomResult.data)
        .notify(done);
    });
  }

  let serverUrls = [];

  //server url without folder path.
  serverUrls.push("https://acme.com:1337");

  //server url folder path.
  serverUrls.push("https://acme.com:1337/folder");

  //server url folder and subfolder path.
  serverUrls.push("https://acme.com:1337/folder/subfolder");

  for (var index = 0; index < serverUrls.length; index++) {
    var serverUrl = serverUrls[index];
    test_horizon_paths(serverUrl);
  }
});
