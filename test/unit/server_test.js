var StellarBase = require('stellar-base');
var errors = require('../../src/errors');
require('it-each')({ testPerIteration: true });

var setFixtures;

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
    setFixtures = this.setFixtures = function (fixtures, done) {
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
    var transaction = new StellarBase.Transaction('42cf0559790f6c3b64de15120df0bb25caab7dc2db4fb4a18a35e881bf323af7000003e800016f000000000200000000000000000000000100000000000000010783a8ac8f5319f8f9f6602a67309364d4f4c7385f9de41a265ed57581cd2ec50000000000000000009896800000000142cf0559a4a1c357d32b0f7a88e2c0982e9e9b3c4db0482ad993a11fb8f245c1f7ddb576b932488c6b840aa45c9ef7b34c3aec8ee173765ebeb41384b3dd05f25da0be0e');

    it("sends a transaction successfully", function(done) {
      var response = {status: 200, body: {"result":"received"}};
      this.setFixtures({
          request: "/transactions",
          response: response
        })
        .then(function () {
          server.submitTransaction(transaction)
            .then(function(r) {
              expect(r).to.be.deep.equal(response.body);
              done();
            });
        });
    });

    var errors = [
      {error: 'TransactionFailedError', hex: '0000000000000000fffffff1'},
      {error: 'TransactionTooEarlyError', hex: '0000000000000000fffffff2'},
      {error: 'TransactionTooLateError', hex: '0000000000000000fffffff3'},
      {error: 'MissingOperationError', hex: '0000000000000000fffffff4'},
      {error: 'BadSequenceError', hex: '0000000000000000fffffff5'},
      {error: 'NotEnoughSignaturesError', hex: '0000000000000000fffffff6'},
      {error: 'InsufficientBalanceError', hex: '0000000000000000fffffff7'},
      {error: 'NotFoundError', hex: '0000000000000000fffffff8'},
      {error: 'InsufficientBalanceError', hex: '0000000000000000fffffff9'},
      {error: 'txNoAccount', hex: '0000000000000000fffffffa'},
      {error: 'txInsufficientFee', hex: '0000000000000000fffffffb'},
      {error: 'txBadAuthExtra', hex: '0000000000000000fffffffc'},
      {error: 'txInternalError', hex: '0000000000000000fffffffd'}
    ];

    it.each(errors, "throws %s", ['error'], function(element, done) {
      var response = {status: 500, body: {"result":"failed","submission_result":element.hex}};
      setFixtures({
          request: "/transactions",
          response: response
        })
        .then(function () {
          server.submitTransaction(transaction)
            .should.be.rejectedWith(errors[element.error]).and.notify(done);
        });
    });
  });

  describe("Server._parseResult", function () {
    it("creates link functions", function () {
      var json = server._parseResponse({
        "_links": {
          "test": function () {
            return "hi";
          }
        }
      });
      expect(typeof json.test).to.be.equal("function");
    });
  });
});
