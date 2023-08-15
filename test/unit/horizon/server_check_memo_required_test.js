function buildTransaction(destination, operations = [], builderOpts = {}) {
  let txBuilderOpts = {
    fee: 100,
    networkPassphrase: StellarSdk.Networks.TESTNET,
    v1: true,
  };
  Object.assign(txBuilderOpts, builderOpts);
  let keypair = StellarSdk.Keypair.random();
  let account = new StellarSdk.Account(keypair.publicKey(), "56199647068161");
  let transaction = new StellarSdk.TransactionBuilder(
    account,
    txBuilderOpts,
  ).addOperation(
    StellarSdk.Operation.payment({
      destination: destination,
      asset: StellarSdk.Asset.native(),
      amount: "100.50",
    }),
  );

  operations.forEach((op) => (transaction = transaction.addOperation(op)));

  transaction = transaction.setTimeout(StellarSdk.TimeoutInfinite).build();
  transaction.sign(keypair);

  if (builderOpts.feeBump) {
    return StellarSdk.TransactionBuilder.buildFeeBumpTransaction(
      keypair,
      "200",
      transaction,
      txBuilderOpts.networkPassphrase,
    );
  } else {
    return transaction;
  }
}

function buildAccount(id, data = {}) {
  return {
    _links: {
      data: {
        href: `https://horizon-testnet.stellar.org/accounts/${id}/data/{key}`,
        templated: true,
      },
    },
    id: id,
    account_id: id,
    sequence: "3298702387052545",
    subentry_count: 1,
    last_modified_ledger: 768061,
    thresholds: {
      low_threshold: 0,
      med_threshold: 0,
      high_threshold: 0,
    },
    flags: {
      auth_required: false,
      auth_revocable: false,
      auth_immutable: false,
    },
    balances: [
      {
        balance: "9999.9999900",
        buying_liabilities: "0.0000000",
        selling_liabilities: "0.0000000",
        asset_type: "native",
      },
    ],
    signers: [
      {
        weight: 1,
        key: id,
        type: "ed25519_public_key",
      },
    ],
    data: data,
  };
}

function mockAccountRequest(axiosMock, id, status, data = {}) {
  let response;

  switch (status) {
    case 404:
      response = Promise.reject({
        response: { status: 404, statusText: "NotFound", data: {} },
      });
      break;
    case 400:
      response = Promise.reject({
        response: { status: 400, statusText: "BadRequestError", data: {} },
      });
      break;
    default:
      response = Promise.resolve({ data: buildAccount(id, data) });
      break;
  }

  axiosMock
    .expects("get")
    .withArgs(sinon.match(`https://horizon-testnet.stellar.org/accounts/${id}`))
    .returns(response)
    .once();
}

describe("server.js check-memo-required", function () {
  beforeEach(function () {
    this.server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("fails if memo is required", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 200, {
      "config.memo_required": "MQ==",
    });
    let transaction = buildTransaction(accountId);

    this.server
      .checkMemoRequired(transaction)
      .then(
        function () {
          expect.fail("promise should have failed");
        },
        function (err) {
          expect(err).to.be.instanceOf(StellarSdk.AccountRequiresMemoError);
          expect(err.accountId).to.eq(accountId);
          expect(err.operationIndex).to.eq(0);
          done();
        },
      )
      .catch(function (err) {
        done(err);
      });
  });

  it("fee bump - fails if memo is required", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 200, {
      "config.memo_required": "MQ==",
    });
    let transaction = buildTransaction(accountId, [], { feeBump: true });

    this.server
      .checkMemoRequired(transaction)
      .then(
        function () {
          expect.fail("promise should have failed");
        },
        function (err) {
          expect(err).to.be.instanceOf(StellarSdk.AccountRequiresMemoError);
          expect(err.accountId).to.eq(accountId);
          expect(err.operationIndex).to.eq(0);
          done();
        },
      )
      .catch(function (err) {
        done(err);
      });
  });

  it("returns false if account doesn't exist", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 404, {});
    let transaction = buildTransaction(accountId);

    this.server
      .checkMemoRequired(transaction)
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("returns false if data field is not present", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 200, {});
    let transaction = buildTransaction(accountId);

    this.server
      .checkMemoRequired(transaction)
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("returns err with client errors", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 400, {});
    let transaction = buildTransaction(accountId);

    this.server
      .checkMemoRequired(transaction)
      .then(
        function () {
          expect.fail("promise should have failed");
        },
        function (err) {
          expect(err).to.be.instanceOf(StellarSdk.NetworkError);
          done();
        },
      )
      .catch(function (err) {
        done(err);
      });
  });

  it("doesn't repeat account check if the destination is more than once", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 200, {});

    let operations = [
      StellarSdk.Operation.payment({
        destination: accountId,
        asset: StellarSdk.Asset.native(),
        amount: "100.50",
      }),
    ];

    let transaction = buildTransaction(accountId, operations);

    this.server
      .checkMemoRequired(transaction)
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("other operations", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(this.axiosMock, accountId, 200, {});

    const destinations = [
      "GASGNGGXDNJE5C2O7LDCATIVYSSTZKB24SHYS6F4RQT4M4IGNYXB4TIV",
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    ];

    const usd = new StellarSdk.Asset(
      "USD",
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
    );
    const eur = new StellarSdk.Asset(
      "EUR",
      "GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL",
    );
    const liquidityPoolAsset = new StellarSdk.LiquidityPoolAsset(eur, usd, 30);

    let operations = [
      StellarSdk.Operation.accountMerge({
        destination: destinations[0],
      }),
      StellarSdk.Operation.pathPaymentStrictReceive({
        sendAsset: StellarSdk.Asset.native(),
        sendMax: "5.0000000",
        destination: destinations[1],
        destAsset: StellarSdk.Asset.native(),
        destAmount: "5.50",
        path: [usd, eur],
      }),
      StellarSdk.Operation.pathPaymentStrictSend({
        sendAsset: StellarSdk.Asset.native(),
        sendAmount: "5.0000000",
        destination: destinations[2],
        destAsset: StellarSdk.Asset.native(),
        destMin: "5.50",
        path: [usd, eur],
      }),
      StellarSdk.Operation.changeTrust({
        asset: usd,
      }),
      StellarSdk.Operation.changeTrust({
        asset: liquidityPoolAsset,
      }),
    ];

    destinations.forEach((d) => mockAccountRequest(this.axiosMock, d, 200, {}));

    let transaction = buildTransaction(accountId, operations);

    this.server
      .checkMemoRequired(transaction)
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  it("checks for memo required by default", function (done) {
    let accountId = "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    let memo = StellarSdk.Memo.text("42");
    let transaction = buildTransaction(accountId, [], { memo });
    this.server
      .checkMemoRequired(transaction)
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
});
