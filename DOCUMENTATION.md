## Overview

### Transactions

Transactions are used to change the state of accounts on the network. This includes
sending payments, making account configuration changes, etc. Each unit of change that
can be made on an account is called an "operation". Transactions are made up of one or
more operations. Each operation will be applied in the order it is added to the tranasction. In js-stellar-lib, that order is chronologically as operations are added. Each operation is described below:

* **Payment** - Send an amount to a destination account, optionally through a path.
    XLM payments create the destination account if it does not exist
* **Create Offer** - Creates, updates, or deletes an offer for the account.
* **Set Options** - Set or clear Account flags, set inflation destination, or add new signers.
* **Change Trust** - Add or remove a trust line from one account to another.
* **Allow Trust** - Authorize another account to hold your credits.
* **Account Merge** - Merge your account's balance into another account, deleting it.

A transaction contains a source account which will use up a sequence number and be charged a fee for the transaction. Additionally, each operation has a source account, which defaults to
the transaction's source account. For a transaction to be valid, it must include signatures
that meet the low threshold for the transaction's source account, and for each operation's
source account threshold for each operation. See more on signatures and thresholds [here](https://github.com/stellar/stellar-core/tree/dc8a9adb494b0584fda9500fb1a465d175efdfd4/src/transactions#thresholds).

## Examples

### Creating a simple payment transaction
To create a transaction using js-stellar-lib, use [TransactionBuilder](https://github.com/stellar/js-stellar-lib/blob/master/src/transaction_builder.js). This class provides
a builder like interface which allows you to add operations to a transaction via chaining.
Simply construct a new TransactionBuilder, call addOperation(), passing it the Operation
you'd like to add. Use the static methods in the Operation class to easily create operations.


```javascript
/**
* In this example, we'll create a transaction that funds a new account from the
* root account.
*/

// create the server connection object
var server = new StellarLib.Server({port: 3000});

// load the root account's current details from the server
server.loadAccount("gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC")
    .then(function (account) {
        // build the transaction
        var transaction = new StellarLib.TransactionBuilder(account)
            // this operation funds the new account with XLM
            .addOperation(StellarLib.Operation.payment({
                destination: "g8WyiYoaMmCPsv86xgPRBhHSpBs7bmNMKAB1n93x1BhFkaczjW",
                currency: StellarLib.Currency.native(),
                amount: "20000000"
            }))
            .build();
        // now we need to sign the transaction with the source (root) account
        var keypair = StellarLib.Keypair.fromSeed("sft74k3MagHG6iF36yeSytQzCCLsJ2Fo9K4YJpQCECwgoUobc4v");
        var signature = transaction.sign(keypair);
        transaction.addSignature(signature);
        console.log(transaction.toEnvelope().toXDR().toString("hex"))
        // submit the transaction to the server
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.error(err.stack);
    });
```

### Loading transaction history


```javascript
var server = new StellarLib.Server({port: 3000});
server.accounts("gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC", "transactions")
    .then(function (page) {
        // page 1
        console.log(page.records);
        return page.next();
    })
    .then(function (page) {
        // page 2
        console.log(page.records);
    })
    .catch(function (err) {
        done(err);
    });
```