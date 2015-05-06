describe("server.js tests", function () {

  var server;

  beforeEach(function () {
    server = new StellarLib.Server({port: 1337});
    // sets the request the dev server should expect and the response it should send
    this.setFixtures = function (fixtures, done) {
      // instruct the dev server to except the correct request
      request
        .post(global.fixtures.DEV_SERVER_FIXTURES_ENDPOINT)
        .type('json')
        .send(fixtures)
        .end(function(err, res) {
          done();
        });
    }
  });

  afterEach(function (done) {
    request
      .post(global.fixtures.DEV_SERVER_CLEAR_FIXTURES_ENDPOINT)
      .type('json')
      .send(fixtures)
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

  describe('Server.loadAccount', function() {
    describe("success", function () {
      beforeEach(function (done) {
        this.setFixtures({
          request: global.fixtures.TEST_LOAD_ACCOUNT.SUCCESS.REQUEST,
          response: global.fixtures.TEST_LOAD_ACCOUNT.SUCCESS.RESPONSE
        }, done);
      });

      it("sets the sequence number", function(done) {
        var account = global.fixtures.TEST_LOAD_ACCOUNT.SUCCESS.ACCOUNT;
        var result = global.fixtures.TEST_LOAD_ACCOUNT.SUCCESS.RESULT_ACCOUNT;
        server.loadAccount(account)
          .then(function (res) {
            expect(account.sequence).to.be.equal(result.sequence);
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });

      it("sets the balances", function(done) {
        var account = global.fixtures.TEST_LOAD_ACCOUNT.SUCCESS.ACCOUNT;
        var result = global.fixtures.TEST_LOAD_ACCOUNT.SUCCESS.RESULT_ACCOUNT;
        server.loadAccount(account)
          .then(function (res) {
            for (var i = 0; i < result.balances; i++) {
              let accountBalance = account.balances[i];
              let resultBalance = result.balances[i];
              let sameCurrency = accountBalance.currency.equals(resultBalance.currency);
              expect(sameCurrency).to.be.true;
              expect(accountBalance.balance).to.be.equal(resultBalance.balance);
            }
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });
  });

  describe("Server.getTransactions", function () {

    describe("with default options", function () {

      beforeEach(function (done) {
        this.setFixtures({
          request: global.fixtures.TEST_GET_TRANSACTIONS.DEFAULT.REQUEST,
          response: global.fixtures.TEST_GET_TRANSACTIONS.DEFAULT.RESPONSE
        }, done);
      });

      it("should return a transaction page with records and next link", function (done) {
        server.getTransactions()
          .then(function (res) {
            expect(res.next).to.be.equal(global.fixtures.TEST_GET_TRANSACTIONS.DEFAULT.RESPONSE.body._links.next.href);
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });
  });

  describe("Server.getAccountTransactions", function () {

    describe("with default options", function () {
      var TransactionPage;
      beforeEach(function (done) {
        this.setFixtures({
          request: global.fixtures.TEST_GET_ACCOUNT_TRANSACTIONS.DEFAULT.REQUEST,
          response: global.fixtures.TEST_GET_ACCOUNT_TRANSACTIONS.DEFAULT.RESPONSE
        }, done);
      });

      it("should return a transaction page with records and next link", function (done) {
        var address = global.fixtures.ROOT_ACCOUNT;
        server.getAccountTransactions(address)
          .then(function (res) {
            expect(res.next).to.be.equal(global.fixtures.TEST_GET_ACCOUNT_TRANSACTIONS.DEFAULT.RESPONSE.body._links.next.href);
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });
    describe("with limit = 1", function () {
      var TransactionPage;
      beforeEach(function (done) {
        this.setFixtures({
          request: global.fixtures.TEST_GET_ACCOUNT_TRANSACTIONS.WITH_LIMIT.REQUEST,
          response: global.fixtures.TEST_GET_ACCOUNT_TRANSACTIONS.WITH_LIMIT.RESPONSE
        }, done);
      });

      it("should call server with limit query param 1", function (done) {
        var address = global.fixtures.ROOT_ACCOUNT;
        server.getAccountTransactions(address, {limit: 1})
          .then(function (res) {
            expect(res.next).to.be.equal(global.fixtures.TEST_GET_ACCOUNT_TRANSACTIONS.WITH_LIMIT.RESPONSE.body._links.next.href);
            done();
          })
          .catch(function (err) {
            done(err);
          })
      });
    });
  });

  describe("Server.getNextTransactions", function () {
    beforeEach(function (done) {
      this.setFixtures({
        request: global.fixtures.TEST_GET_NEXT_TRANSACTIONS.REQUEST,
        response: global.fixtures.TEST_GET_NEXT_TRANSACTIONS.RESPONSE
      }, done);
    });
    it("should call server with the next value in the TransactionPage", function (done) {
      var page = global.fixtures.TEST_GET_NEXT_TRANSACTIONS.TRANSACTION_PAGE;
      server.getNextTransactions(page)
        .then(function (res) {
          expect(res.next).to.be.equal(global.fixtures.TEST_GET_NEXT_TRANSACTIONS.RESPONSE.body._links.next.href);
          done();
        })
        .catch(function (err) {
          done(err);
        })
    });
  });
});