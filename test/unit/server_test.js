describe("server.js tests", function () {

  var DEV_SERVER_FIXTURES_ENDPOINT = "http://localhost:1337/fixtures";
  var DEV_SERVER_CLEAR_FIXTURES_ENDPOINT = "http://localhost:1337/clear";

  var toBluebird = bluebird.resolve;

  var makeFakePage = function(nextUrl) {
    return {
      _links: {
        next: { href: nextUrl },
      },
      _embedded: {
        records: []
      },
    }
  }

  var FAKE_COLLECTION_RESPONSE = makeFakePage('http://localhost:3000/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC/transactions?after=55834578944&limit=1&order=asc');

  var server;

  beforeEach(function () {
    server = new StellarSdk.Server({port: 1337});
    // sets the request the dev server should expect and the response it should send
    this.setFixtures = function (fixtures, done) {
      // instruct the dev server to except the correct request
      return axios.post(DEV_SERVER_FIXTURES_ENDPOINT, fixtures);
    }
  });

  afterEach(function (done) {
    return toBluebird(axios.post(DEV_SERVER_CLEAR_FIXTURES_ENDPOINT))
      .then(function () { done() });
  })

  describe('Server._sendResourceRequest', function () {

    describe("requests all ledgers", function () {
      describe("without options", function () {

        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          return this.setFixtures({
            request: "/ledgers",
            response: {status: 200, body: FAKE_COLLECTION_RESPONSE}
          }).then(function () { done() });
        });

        it("requests the correct endpoint", function (done) {
          server.ledgers()
            .call()
            .then(function () {
              done();
            })
            .catch(function (err) {
              done(err);
            })
        })
      })

      describe("with options", function () {
        beforeEach(function (done) {
          var url = "/ledgers?limit=1&after=b&order=asc"
          // instruct the dev server to except the correct request
          return this.setFixtures({
            request: url,
            response: {status: 200, body: makeFakePage('http://localhost:1337' + url)}
          }).then(function () { done(); });
        });

        it("requests the correct endpoint", function () {
          return server.ledgers()
            .limit("1")
            .after("b")
            .order("asc")
            .call();
        });

        it("can call .next() on the result to retrieve the next page", function () {
          return server
            .ledgers()
            .limit("1")
            .after("b")
            .order("asc")
            .call()
            .then(function(page) {
              return page.next()
            });
        });
      });

      describe("as stream", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          return this.setFixtures({
            request: "/ledgers",
            response: {status: 200, body: "{\"test\":\"body\"}"},
            stream: true
          }).then(function () { done() });
        });

        it("attaches onmessage handler to an EventSource", function (done) {
          var es = server.ledgers()
            .stream(
              { onmessage: function (res) {
                    expect(res.test).to.be.equal("body");
                    done(); 
              }
            })
        });
      });
    });

    describe("requests a single ledger", function () {
      describe("for a non existent ledger", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          return this.setFixtures({
            request: "/ledgers/1",
            response: {status: 404, body: "{\"test\":\"body\"}"}
          }).then(function () { done() });
        });

        it("throws a NotFoundError", function (done) {
          server.ledgers()
            .ledger("1")
            .call()
            .then(function () {
              done("didn't throw an error");
            })
            .catch(StellarSdk.NotFoundError, function (err) {
              done();
            })
            .catch(function (err) {
              done(err);
            })
        })
      });
      describe("without options", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          return this.setFixtures({
            request: "/ledgers/1",
            response: {status: 200, body: "{\"best\":\"body\"}"}
          }).then(function () { done() });
        });

        it("requests the correct endpoint", function (done) {
          server.ledgers()
            .ledger("1")
            .call()
            .then(function () {
              done();
            })
            .catch(function (err) {
              done(err);
            })
        });
      });
      describe("with options", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          return this.setFixtures({
            request: "/ledgers/1?limit=1&after=b&order=asc",
            response: {status: 200, body: "{\"test\":\"body\"}"}
          }).then(function () { done() });
        });

        it("requests the correct endpoint", function (done) {
          server.ledgers()
            .ledger("1")
            .limit("1")
            .after("b")
            .order("asc")
            .call()
            .then(function () {
              done();
            })
            .catch(function (err) {
              done(err);
            })
        });
      });
    });

    describe("requests a sub resource", function (done) {
      describe("without options", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          return this.setFixtures({
            request: "/ledgers/1/transactions",
            response: {status: 200, body: FAKE_COLLECTION_RESPONSE}
          }).then(function () { done() });
        });

        it("requests the correct endpoint", function (done) {
          server.transactions()
            .forLedger("1")
            .call()
            .then(function () {
              done();
            })
            .catch(function (err) {
              done(err);
            })
        });
      });
      describe("with options", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          return this.setFixtures({
            request: "/ledgers/1/transactions?limit=1&after=b&order=asc",
            response: {status: 200, body: FAKE_COLLECTION_RESPONSE}
          }).then(function () { done() });
        });

        it("requests the correct endpoint", function (done) {
          server.transactions()
            .forLedger("1")
            .after("b")
            .limit("1")
            .order("asc")
            .call()
            .then(function () {
              done();
            })
            .catch(function (err) {
              done(err);
            })
        });
      });
      describe("as stream", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          return this.setFixtures({
            request: "/ledgers/1/transactions",
            response: {status: 200, body: "{\"test\":\"body\"}"},
            stream: true
          }).then(function () { done() });
        });

        it("attaches onmessage handler to an EventSource", function (done) {
          var es = server.transactions()
            .forLedger("1")
            .stream({
              onmessage: function (res) {
                expect(res.test).to.be.equal("body");
                es.close();
                done();
              }
            });
        });
      });
    });
  });

  describe('Server.sendTransaction', function() {
    /*it("sends a transaction", function() {
      server.submitTransaction({blob: global.fixtures.TEST_TRANSACTION_BLOB})
        .then(function (res) {
          done();
        })
        .catch(function (err) {
          done(err);
        })
    });*/
  });

  describe("Server._parseResult", function () {
    it("creates link functions", function () {
      var callBuilder = server.ledgers();
      var json = callBuilder._parseResponse({
        "_links": {
          "test": function () {
            return "hi";
          }
        }
      });
      expect(typeof json.test).to.be.equal("function");
    });
  });

  describe("Smoke tests for the rest of the builders", function() {
    describe("AccountCallBuilder", function() {
      beforeEach(function (done) {
        // instruct the dev server to except the correct request
        return this.setFixtures({
          request: "/accounts/GSDEF?limit=4",
          response: {status: 200, body: FAKE_COLLECTION_RESPONSE}
        }).then(function () { done() });
      });

      it("requests the correct endpoint", function (done) {
        server.accounts()
          .address("GSDEF")
          .limit("4")
          .call()
          .then(function () {
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });

    describe("OfferCallBuilder", function() {
      beforeEach(function (done) {
        // instruct the dev server to except the correct request
        return this.setFixtures({
          request: "/accounts/GSDEF/offers?order=asc",
          response: {status: 200, body: FAKE_COLLECTION_RESPONSE}
        }).then(function () { done() });
      });

      it("requests the correct endpoint", function (done) {
        server.offers('accounts', "GSDEF")
          .order("asc")
          .call()
          .then(function () {
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("rejects the wrong resource", function(done) {
        expect(() => server.offers('ledgers', '123').call()).to.throw(/Bad resource specified/);
        done();
      });
    });

    describe("OrderbookCallBuilder", function() {
      beforeEach(function (done) {
        // instruct the dev server to except the correct request
        return this.setFixtures({
          request: "/order_book?selling_asset_type=native&buying_asset_type=credit_alphanum4&buying_asset_code=USD&buying_asset_issuer=GSEDF",
          response: {status: 200, body: FAKE_COLLECTION_RESPONSE}
        }).then(function () { done() });
      });

      it("requests the correct endpoint", function (done) {
        server.orderbook(new StellarSdk.Asset.native(), new StellarSdk.Asset('USD', "GSEDF"))
          .call()
          .then(function () {
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });

    describe("EffectCallBuilder", function() {
      beforeEach(function (done) {
        // instruct the dev server to except the correct request
        return this.setFixtures({
          request: "/effects?after=b",
          response: {status: 200, body: FAKE_COLLECTION_RESPONSE}
        }).then(function () { done() });
      });

      it("requests the correct endpoint", function (done) {
        server.effects()
          .after("b")
          .call()
          .then(function () {
            done();
          })
          .catch(function (err) {
            done(err);
          })
        });

      it("rejects two filters", function (done) {
        expect(() => server.effects().forOperation("blah").forLedger('234').call()).to.throw(/Too many filters/);
        done();
      });
    })

    describe("OperationCallBuilder", function() {
      beforeEach(function (done) {
        // instruct the dev server to except the correct request
        return this.setFixtures({
          request: "/transactions/blah/operations",
          response: {status: 200, body: FAKE_COLLECTION_RESPONSE}
        }).then(function () { done() });
      });

      it("requests the correct endpoint", function (done) {
        server.operations()
          .forTransaction("blah")
          .call()
          .then(function () {
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });

    describe("PaymentCallBuilder", function() {
      beforeEach(function (done) {
        // instruct the dev server to except the correct request
        return this.setFixtures({
          request: "/accounts/GDEFS/payments",
          response: {status: 200, body: FAKE_COLLECTION_RESPONSE}
        }).then(function () { done() });
      });

      it("requests the correct endpoint", function (done) {
        server.payments()
          .forAccount("GDEFS")
          .call()
          .then(function () {
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });
  })  
});
