// Tests CAP-38 endpoints against the mock API server:
// https://ammmock.docs.apiary.io/

// All endpoints from here are tested:
// https://docs.google.com/document/d/1pXL8kr1a2vfYSap9T67R-g72B_WWbaE1YsLMa04OgoU/edit
const _ = require("lodash");

const MOCK_SERVER = "https://private-d133c-ammmock.apiary-mock.com";

describe("tests the /liquidity_pools endpoint", function () {
  const lpId =
    "0569b19c75d7ecadce50501fffad6fe8ba4652455df9e1cc96dc408141124dd5";
  const server = new StellarSdk.Server(MOCK_SERVER, { allowHttp: true });

  it("GET /", function (done) {
    chai
      .request(MOCK_SERVER)
      .get("/liquidity_pools")
      .end(function (err, res) {
        if (err != null) done(err);
        expect(res.body).not.to.be.null;

        server
          .liquidityPools()
          .call()
          .then((resp) => {
            expect(resp.records).to.deep.equal(res.body._embedded.records);
            done();
          })
          .catch((err) => done(err));
      });
  });

  it("GET /<pool-id>", function (done) {
    chai
      .request(MOCK_SERVER)
      .get(`/liquidity_pools/${lpId}`)
      .end(function (err, res) {
        if (err != null) done(err);
        expect(res.body).not.to.be.null;

        server
          .liquidityPools()
          .liquidityPoolId(lpId)
          .call()
          .then((resp) => {
            expect(resp).to.deep.equal(res.body);
            done();
          })
          .catch((err) => done(err));
      });
  });

  const testCases = {
    effects: server.effects(),
    operations: server.operations(),
    trades: server.trades(),
    transactions: server.transactions()
  };

  Object.keys(testCases).forEach((suffix) => {
    it(`GET /<pool-id>/${suffix}`, function (done) {
      chai
        .request(MOCK_SERVER)
        .get(`/liquidity_pools/${lpId}/${suffix}`)
        .end(function (err, res) {
          if (err != null) return done(err);
          expect(res.body).not.to.be.null;

          testCases[suffix]
            .forLiquidityPool(lpId)
            .call()
            .then((resp) => {
              resp.records.forEach((record, i) => {
                let expectedRecord = res.body._embedded.records[i];

                // TransactionRecord values don't map 1-to-1 to the JSON (see
                // e.g. the ledger vs. ledger_attr properties), so we do a "best
                // effort" validation by checking that at least the keys exist.
                if (suffix === "transactions") {
                  record = Object.keys(record);
                  expectedRecord = Object.keys(expectedRecord);
                }

                expect(_.isMatch(record, expectedRecord)).to.be.true;
              });
              done();
            })
            .catch((err) => done(err));
        });
    });
  });
});

describe("tests the /accounts endpoint", function () {
  const server = new StellarSdk.Server(MOCK_SERVER, { allowHttp: true });

  it("GET /", function (done) {
    chai
      .request(MOCK_SERVER)
      .get("/accounts")
      .end(function (err, res) {
        if (err != null) return done(err);
        expect(res.body).not.to.be.null;

        server
          .accounts()
          .call()
          .then((resp) => {
            expect(resp.records).to.deep.equal(res.body._embedded.records);
          })
          .catch((err) => done(err));

        done();
      });
  });

  it("GET /?liquidity_pool=<pool-id>", function (done) {
    const lpId =
      "0569b19c75d7ecadce50501fffad6fe8ba4652455df9e1cc96dc408141124dd5";

    chai
      .request(MOCK_SERVER)
      .get("/accounts")
      .query({ liquidity_pool: lpId })
      .end(function (err, res) {
        if (err != null) return done(err);
        expect(res.body).not.to.be.null;

        server
          .accounts()
          .forLiquidityPool(lpId)
          .call()
          .then((resp) => {
            expect(resp.records).to.deep.equal(res.body._embedded.records);
            done();
          })
          .catch((err) => done(err));
      });
  });

  it("GET /<account-id>", function (done) {
    const accountId =
      "GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3";

    chai
      .request(MOCK_SERVER)
      .get(`/accounts/${accountId}`)
      .end(function (err, res) {
        if (err != null) return done(err);
        expect(res.body).not.to.be.null;

        server
          .accounts()
          .accountId(accountId)
          .call()
          .then((resp) => {
            // find the pool share balance(s)
            const poolShares = resp.balances.filter(
              (b) => b.asset_type === "liquidity_pool_shares"
            );

            expect(poolShares).to.have.lengthOf(1);
            poolShares.forEach((poolShare) => {
              expect(poolShare.buying_liabilities).to.be.undefined;
              expect(poolShare.selling_liabilities).to.be.undefined;
              expect(poolShare.asset_code).to.be.undefined;
              expect(poolShare.asset_issuer).to.be.undefined;
            });

            expect(resp).to.deep.equal(res.body);
            done();
          })
          .catch((err) => done(err));
      });
  });
});
