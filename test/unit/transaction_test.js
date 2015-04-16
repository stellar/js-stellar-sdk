var StellarBase = require("stellar-base");

describe('Transaction.payment', function() {

    it("creates and signs a payment transaction", function() {
        let source = StellarLib.Account.fromSeed("sft74k3MagHG6iF36yeSytQzCCLsJ2Fo9K4YJpQCECwgoUobc4v");
        let destination = StellarLib.Account.fromSeed("sft74k3MagHG6iF36yeSytQzCCLsJ2Fo9K4YJpQCECwgoUobc4v");
        let amount = "1000";
        let currency = StellarLib.Currency.native();

        let transaction = new StellarLib.Transaction(source);
        transaction.payment(destination, currency, amount);
        transaction.sign();
        console.log(transaction.blob);

        let server = new StellarLib.Server();
        // TODO this fails in the browser at xhr.open
        server.sendTransaction(transaction);
    });
});