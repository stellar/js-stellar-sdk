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
});