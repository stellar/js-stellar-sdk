var StellarBase = require("stellar-base");

describe('TransactionBuilder', function() {

    describe("constructs a native payment transaction", function(done) {
        var source;
        var destination;
        var amount;
        var currency;
        var transaction;
        beforeEach(function () {
            source = StellarLib.Account.fromSeed("sft74k3MagHG6iF36yeSytQzCCLsJ2Fo9K4YJpQCECwgoUobc4v");
            destination = "gsbkQ1tG4fEqk1sApdeQYZG9r19yVm28m2Zz72gRGjoDKTHi7UL";
            amount = "1000";
            currency = StellarLib.Currency.native();

            transaction = new StellarLib.TransactionBuilder(source)
                .addOperation(StellarLib.Operation.payment({
                    destination: destination,
                    currency: currency,
                    amount: amount
                }))
                .build();
        });

        it("should have the same source account", function (done) {
            expect(transaction.source)
                .to.be.equal(source.address);
            done()
        });

        it("should have the account's sequence number", function (done) {
            expect(transaction.sequence).to.be.equal("1");
            done();
        });

        it("should increment the account's sequence number", function (done) {
            expect(source.sequence).to.be.equal(2);
            done();
        });

        it("should have one payment operation", function (done) {
            expect(transaction.operations.length).to.be.equal(1);
            expect(transaction.operations[0].type).to.be.equal("payment");
            done();
        });
    });
});