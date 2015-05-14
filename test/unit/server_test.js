describe("server.js tests", function () {

  var DEV_SERVER_FIXTURES_ENDPOINT = "http://localhost:1337/fixtures";
  var DEV_SERVER_CLEAR_FIXTURES_ENDPOINT = "http://localhost:1337/clear";

  var toBluebird = bluebird.resolve;

  var FAKE_COLLECTION_RESPONSE = {
    _links: {
      next: {
        href: 'http://localhost:3000/accounts/gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC/transactions?after=55834578944&limit=1&order=asc'
      }
    },
    _embedded: {
      records: []
    }
  }

  var server;

  beforeEach(function () {
    server = new StellarLib.Server({port: 1337});
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
          // instruct the dev server to except the correct request
          return this.setFixtures({
            request: "/ledgers?limit=1&after=b&order=asc",
            response: {status: 200, body: FAKE_COLLECTION_RESPONSE}
          }).then(function () { done() });
        });

        it("requests the correct endpoint", function () {
          return server.ledgers({limit: 1, after: "b", order: "asc"});
        })
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
          var es = server.ledgers({
            streaming: {
              onmessage: function (res) {
                expect(res.test).to.be.equal("body");
                done();
              }
            }
          });
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
          server.ledgers(1)
            .then(function () {
              done("didn't throw an error");
            })
            .catch(StellarLib.NotFoundError, function (err) {
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
          server.ledgers(1)
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
          server.ledgers(1, {limit: 1, after: "b", order: "asc"})
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
          server.ledgers(1, "transactions")
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
          server.ledgers(1, "transactions", {limit: 1, after: "b", order: "asc"})
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
          var es = server.ledgers(1, "transactions", {
            streaming: {
              onmessage: function (res) {
                expect(res.test).to.be.equal("body");
                es.close();
                done();
              }
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
});