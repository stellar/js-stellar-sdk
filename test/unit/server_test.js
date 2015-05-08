describe("server.js tests", function () {

  var DEV_SERVER_FIXTURES_ENDPOINT = "http://localhost:1337/fixtures";
  var DEV_SERVER_CLEAR_FIXTURES_ENDPOINT = "http://localhost:1337/clear";

  var server;

  beforeEach(function () {
    server = new StellarLib.Server({port: 1337});
    // sets the request the dev server should expect and the response it should send
    this.setFixtures = function (fixtures, done) {
      // instruct the dev server to except the correct request
      request
        .post(DEV_SERVER_FIXTURES_ENDPOINT)
        .type('json')
        .send(fixtures)
        .end(function(err, res) {
          done();
        });
    }
  });

  afterEach(function (done) {
    request
      .post(DEV_SERVER_CLEAR_FIXTURES_ENDPOINT)
      .type('json')
      .end(function(err, res) {
        done();
      });
  })

  describe('Server.ledgers', function () {
    describe("requests all ledgers", function () {
      describe("without options", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          this.setFixtures({
            request: "/ledgers",
            response: {status: 200, body: "doesnt matter"}
          }, done);
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
          this.setFixtures({
            request: "/ledgers?limit=1&after=b&order=asc",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.ledgers({limit: 1, after: "b", order: "asc"})
            .then(function () {
              done();
            })
            .catch(function (err) {
              done(err);
            })
        })
      });

      describe("as stream", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          this.setFixtures({
            request: "/ledgers",
            response: {status: 200, body: "body"},
            stream: true
          }, done);
        });

        it("attaches onmessage handler to an EventSource", function (done) {
          var es = server.ledgers({
            streaming: {
              onmessage: function (res) {
                expect(res.data).to.be.equal("body");
                es.close();
                done();
              }
            }
          });
        });
      });
    });

    describe("requests a single ledger", function () {
      describe("without options", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          this.setFixtures({
            request: "/ledgers/1",
            response: {status: 200, body: "doesnt matter"}
          }, done);
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
          this.setFixtures({
            request: "/ledgers/1?limit=1&after=b&order=asc",
            response: {status: 200, body: "doesnt matter"}
          }, done);
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
          this.setFixtures({
            request: "/ledgers/1/transactions",
            response: {status: 200, body: "doesnt matter"}
          }, done);
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
          this.setFixtures({
            request: "/ledgers/1/transactions?limit=1&after=b&order=asc",
            response: {status: 200, body: "doesnt matter"}
          }, done);
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
          this.setFixtures({
            request: "/ledgers/1/transactions",
            response: {status: 200, body: "body"},
            stream: true
          }, done);
        });

        it("attaches onmessage handler to an EventSource", function (done) {
          var es = server.ledgers(1, "transactions", {
            streaming: {
              onmessage: function (res) {
                expect(res.data).to.be.equal("body");
                es.close();
                done();
              }
            }
          });
        });
      });
    });
  });

  describe('Server.accounts', function () {
    describe("requests all accounts", function () {
      describe("without options", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          this.setFixtures({
            request: "/accounts",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.accounts()
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
          this.setFixtures({
            request: "/accounts?limit=1&after=b&order=asc",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.accounts({limit: 1, after: "b", order: "asc"})
            .then(function () {
              done();
            })
            .catch(function (err) {
              done(err);
            })
        })
      });

      describe("as stream", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          this.setFixtures({
            request: "/accounts",
            response: {status: 200, body: "body"},
            stream: true
          }, done);
        });

        it("attaches onmessage handler to an EventSource", function (done) {
          var es = server.accounts({
            streaming: {
              onmessage: function (res) {
                expect(res.data).to.be.equal("body");
                es.close();
                done();
              }
            }
          });
        });
      });
    });

    describe("requests a single account", function () {
      describe("without options", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          this.setFixtures({
            request: "/accounts/address",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.accounts("address")
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
          this.setFixtures({
            request: "/accounts/address?limit=1&after=b&order=asc",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.accounts("address", {limit: 1, after: "b", order: "asc"})
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
          this.setFixtures({
            request: "/accounts/address/transactions",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.accounts("address", "transactions")
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
          this.setFixtures({
            request: "/accounts/address/transactions?limit=1&after=b&order=asc",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.accounts("address", "transactions", {limit: 1, after: "b", order: "asc"})
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
          this.setFixtures({
            request: "/accounts/address/transactions",
            response: {status: 200, body: "body"},
            stream: true
          }, done);
        });

        it("attaches onmessage handler to an EventSource", function (done) {
          var es = server.accounts("address", "transactions", {
            streaming: {
              onmessage: function (res) {
                expect(res.data).to.be.equal("body");
                es.close();
                done();
              }
            }
          });
        });
      });
    });
  });

  describe('Server.transactions', function () {
    describe("requests all transactions", function () {
      describe("without options", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          this.setFixtures({
            request: "/transactions",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.transactions()
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
          this.setFixtures({
            request: "/transactions?limit=1&after=b&order=asc",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.transactions({limit: 1, after: "b", order: "asc"})
            .then(function () {
              done();
            })
            .catch(function (err) {
              done(err);
            })
        })
      });
      describe("as stream", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          this.setFixtures({
            request: "/transactions",
            response: {status: 200, body: "body"},
            stream: true
          }, done);
        });

        it("attaches onmessage handler to an EventSource", function (done) {
          var es = server.transactions({
            streaming: {
              onmessage: function (res) {
                expect(res.data).to.be.equal("body");
                es.close();
                done();
              }
            }
          });
        });
      });
    });

    describe("requests a single transactions", function () {
      describe("without options", function () {
        beforeEach(function (done) {
          // instruct the dev server to except the correct request
          this.setFixtures({
            request: "/transactions/hash",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.transactions("hash")
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
          this.setFixtures({
            request: "/transactions/hash?limit=1&after=b&order=asc",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.transactions("hash", {limit: 1, after: "b", order: "asc"})
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
          this.setFixtures({
            request: "/transactions/hash/operations",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.transactions("hash", "operations")
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
          this.setFixtures({
            request: "/transactions/hash/operations?limit=1&after=b&order=asc",
            response: {status: 200, body: "doesnt matter"}
          }, done);
        });

        it("requests the correct endpoint", function (done) {
          server.transactions("hash", "operations", {limit: 1, after: "b", order: "asc"})
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
          this.setFixtures({
            request: "/transactions/hash/operations",
            response: {status: 200, body: "body"},
            stream: true
          }, done);
        });

        it("attaches onmessage handler to an EventSource", function (done) {
          var es = server.transactions("hash", "operations", {
            streaming: {
              onmessage: function (res) {
                expect(res.data).to.be.equal("body");
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