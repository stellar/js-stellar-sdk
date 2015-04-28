describe("server.js tests", function () {

  var server;

  beforeEach(function () {
    server = new StellarLib.Server({port: 1337});
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
      beforeEach(function () {
        // instruct the dev server to return the appropriate json for this test case
        request
          .post(global.fixtures.DEV_SERVER_ENDPOINT)
          .type('json')
          .send({
            request: global.fixtures.TEST_LOAD_ACCOUNT.SUCCESS.REQUEST,
            response: global.fixtures.TEST_LOAD_ACCOUNT.SUCCESS.RESPONSE
          })
          .end(function(err, res) {
            done();
          });
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

  describe("Server.getAccountTransactions", function () {

    describe("with default options", function () {
      var TransactionPage;
      beforeEach(function () {
        // instruct the dev server to return the appropriate json for this test case
        request
          .post(global.fixtures.DEV_SERVER_ENDPOINT)
          .type('json')
          .send({
            request: global.fixtures.TEST_GET_ACCOUNT_TRANSACTIONS.DEFAULT.REQUEST,
            response: global.fixtures.TEST_GET_ACCOUNT_TRANSACTIONS.DEFAULT.RESPONSE
          })
          .end(function(err, res) {
            done();
          });
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
      beforeEach(function () {
        // instruct the dev server to return the appropriate json for this test case
        request
          .post(global.fixtures.DEV_SERVER_ENDPOINT)
          .type('json')
          .send({
            request: global.fixtures.TEST_GET_ACCOUNT_TRANSACTIONS.WITH_LIMIT.REQUEST,
            response: global.fixtures.TEST_GET_ACCOUNT_TRANSACTIONS.WITH_LIMIT.RESPONSE
          })
          .end(function(err, res) {
            done();
          });
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
    beforeEach(function () {
      // instruct the dev server to return the appropriate json for this test case
      request
        .post(global.fixtures.DEV_SERVER_ENDPOINT)
        .type('json')
        .send({
          request: global.fixtures.TEST_GET_NEXT_TRANSACTIONS.REQUEST,
          response: global.fixtures.TEST_GET_NEXT_TRANSACTIONS.RESPONSE
        })
        .end(function(err, res) {
          done();
        });
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