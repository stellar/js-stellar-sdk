// Tests CAP-38 endpoints against the mock API server:
// https://ammmock.docs.apiary.io/

// All endpoints from here are tested:
// https://docs.google.com/document/d/1pXL8kr1a2vfYSap9T67R-g72B_WWbaE1YsLMa04OgoU/edit
const MOCK_SERVER = "http://private-anon-a06e1b25a0-ammmock.apiary-mock.com";

describe("tests the /liquidity_pools endpoint", function() {
  const lpId = "0569b19c75d7ecadce50501fffad6fe8ba4652455df9e1cc96dc408141124dd5";

  it("GET /", function(done) {
    let server = new StellarSdk.Server(MOCK_SERVER, {allowHttp: true});

    chai.request(MOCK_SERVER)
      .get("/liquidity_pools")
      .end(function(err, res) {
        if (err != null) done(err);
        expect(res.body).not.to.be.null;

        server
          .liquidityPools()
          .call()
          .then(resp => {
            expect(resp.records).to.deep.equal(res.body._embedded.records);
            done();
          })
          .catch(err => done(err));
      });
  });

  it('GET /<pool-id>', function(done) {
    let server = new StellarSdk.Server(MOCK_SERVER, {allowHttp: true});

    chai.request(MOCK_SERVER)
      .get(`/liquidity_pools/${lpId}`)
      .end(function(err, res) {
        if (err != null) done(err);
        expect(res.body).not.to.be.null;

        server
          .liquidityPools()
          .liquidityPoolId(lpId)
          .call()
          .then(resp => {
            expect(resp).to.deep.equal(res.body);
            done();
          })
          .catch(err => done(err));
      });
  });

  let server = new StellarSdk.Server(MOCK_SERVER, {allowHttp: true});
  const testCases = {
    transactions: server.transactions(),
    operations: server.operations(),
    effects: server.effects(),
  };

  Object.keys(testCases).forEach(suffix => {
    it(`GET /<id>/${suffix}`, function(done) {
      chai.request(MOCK_SERVER)
        .get(`/liquidity_pools/${lpId}/${suffix}`)
        .end(function(err, res) {
          if (err != null) return done(err);
          expect(res.body).not.to.be.null;

          testCases[suffix]
            .forLiquidityPool(lpId)
            .call()
            .then(resp => {
              resp.records.forEach((record, i) => {
                // In an ideal world, we'd do a `.deep.equal(...)` here against
                // the server response. However, these methods provide
                // convenience methods that cause them to not perfectly align
                // with the server response.
                //
                // For example, transaction responses include the ledger number,
                // but this is attached to the `ledger_attr` field in a
                // `TransactionRecord`, while `ledger` is a function that
                // corresponds to a `LedgerCallBuilder`.
                //
                // For this reason, we do a "best effort" validity check by at
                // least ensuring that the response objects have *at least* all
                // of the keys in the server response.
                expect(isSubsetOf(
                  Object.keys(record),
                  Object.keys(res.body._embedded.records[i])
                )).to.be.true;
              });
              done();
            })
            .catch(err => done(err));
        });
    });
  });
});

describe("tests the /accounts endpoint", function() {
  it('GET /', function(done) {
    let server = new StellarSdk.Server(MOCK_SERVER, {allowHttp: true});

    chai.request(MOCK_SERVER)
      .get("/accounts")
      .end(function(err, res) {
        if (err != null) return done(err);
        expect(res.body).not.to.be.null;

        server
          .accounts()
          .call()
          .then(resp => {
            expect(resp.records).to.deep.equal(res.body._embedded.records);
          }).catch(err => done(err));

        done();
      });
  });

  it('GET /?liquidity_pool=<pool-id>', function(done) {
    let server = new StellarSdk.Server(MOCK_SERVER, {allowHttp: true});
    const lpId = "0569b19c75d7ecadce50501fffad6fe8ba4652455df9e1cc96dc408141124dd5";

    chai.request(MOCK_SERVER)
      .get("/accounts")
      .query({liquidity_pool: lpId})
      .end(function(err, res) {
        if (err != null) return done(err);
        expect(res.body).not.to.be.null;

        server
          .accounts()
          .forLiquidityPool(lpId)
          .call()
          .then(resp => {
            expect(resp.records).to.deep.equal(res.body._embedded.records);
            done();
          }).catch(err => done(err));
      });
  });

  it('GET /<id>', function(done) {
    let server = new StellarSdk.Server(MOCK_SERVER, {allowHttp: true});
    const accountId = "GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3";

    chai.request(MOCK_SERVER)
      .get(`/accounts/${accountId}`)
      .end(function(err, res) {
        if (err != null) return done(err);
        expect(res.body).not.to.be.null;

        server
          .accounts()
          .accountId(accountId)
          .call()
          .then(resp => {
            // find the pool share balance(s)
            const poolShares = resp.balances
              .filter(b => b.asset_type === "liquidity_pool_shares");

            expect(poolShares).to.have.lengthOf(1);
            poolShares.forEach(poolShare => {
              expect(poolShare.buying_liabilities).to.be.undefined;
              expect(poolShare.selling_liabilities).to.be.undefined;
              expect(poolShare.asset_code).to.be.undefined;
              expect(poolShare.asset_issuer).to.be.undefined;
            });

            expect(resp).to.deep.equal(res.body);
            done();
          }).catch(err => done(err));
      });
  });
});

// isSubsetOf returns true if all of the `needles` array is part of `haystack`.
function isSubsetOf(haystack, needles) {
  return needles
    .map(item => haystack.indexOf(item) !== -1)       // found the needle?
    .reduce((hasFailed, b) => hasFailed && b, true);  // were all found?
}

describe('isSubsetOf works', function() {
  const masterArray = ['a', 'b', 'c'];

  const testCases = [
    { values: ['a'], expected: true },
    { values: ['a', 'b'], expected: true },
    { values: ['z'], expected: false },
    { values: ['a', 'z'], expected: false },
    { values: ['a', 'b', 'c', 'z'], expected: false },
    { values: [], expected: true },
  ];

  testCases.forEach(test => {
    it(`[${test.values}] should be ${test.expected}`, function() {
      expect(isSubsetOf(masterArray, test.values)).to.equal(test.expected);
    });
  });
});
