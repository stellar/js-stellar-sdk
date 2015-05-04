# js-stellar-lib

A client side Stellar Javascript Library for building and signing Stellar transactions, and communicating with a remote Stellar Horizon Server.

## Overview

js-stellar-lib is a client side Javascript library for building client side Stellar apps. These can be either node apps or in the browser. The library provides facillities for building and signing transactions, and communicating with a Stellar Horizon instance, for submitting transactions or querying network history.

## Get Started

```
npm install js-stellar-lib
```

## API Documentation

Check out the API Documentation [here](http://stellar.github.io/js-stellar-lib).

## Examples

### Loading an account

An account is created using one of the static methods on the account class, such as Account.random() or Account.fromSeed(someSeed). In this example, we'll create an account using a seed, and then load its current sequence number and balances from the network.

```javascript
// first create the server connection object
var server = new StellarLib.Server({port: 3000});
// create an Account from a seed
var source = StellarLib.Account.fromSeed("sft74k3MagHG6iF36yeSytQzCCLsJ2Fo9K4YJpQCECwgoUobc4v");
// load the account, which will modify the Account object we just created
server.loadAccount(source)
    .then(function () {
        // now our source account will have its sequence number and balances loaded
        console.log(source);
    })
    .catch(function (err) {
        console.error(err);
    })
```

### Building Transactions

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

A transaction contains a source account which will use up a sequence number and be charged a fee for the transaction. Additionally, each operation has a source account,
which will be the transaction's source account if unspecified in the operation. For
each source account on the transaction and the operations, a corresponding signature
or signatures adding up to that operation's threshold must be added to the transaction before submitting to the network. See more on signatures and thresholds [here](https://github.com/stellar/stellar-core/tree/dc8a9adb494b0584fda9500fb1a465d175efdfd4/src/transactions#thresholds).

To create a transaction using js-stellar-lib, use [TransactionBuilder](https://github.com/stellar/js-stellar-lib/blob/master/src/transaction_builder.js). This class provides
a builder like interface which allows you to add operations to a transaction via chaining.



```javascript
/**
* In this example, we'll create a transaction that funds a new account from the
* root account.
*/

// first, create our source account from seed and load its details
var source = StellarLib.Account.fromSeed("sft74k3MagHG6iF36yeSytQzCCLsJ2Fo9K4YJpQCECwgoUobc4v");
// the new account we'll fund
var newAccount = "givyhJUjmGZGAR2BWjpqpV6q52siiaspmSWx7v5wvhYLW4XAFw";
// the USD curreny we'll be sending
var usdCurrency = new StellarLib.Currency("USD", usdGateway);
// create the server connection object
var server = new StellarLib.Server({port: 3000});

// load the source account's current details from the server
server.loadAccount(source)
    .then(function () {
        // build the transaction
        var transaction = new StellarLib.TransactionBuilder(source)
            // this operation funds the new account with XLM
            .payment(usdGateway, StellarLib.Currency.native(), 20000000)
            .build();
        return transaction;
    })
    .then(function (transaction) {
        // submit the transaction to the server
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.error(err);
    });
```

### Loading transaction history

To load an account's transaction history, call server.getAccountTransactions()
with the account's address. It will return a TransactionPage object with the
"records" (each a transaction json object) and a "next" field. You can then
pass the TransactionPage to server.getNextTransactions() which will load the next
transactions in sequence and return a new TransactionPage.

```javascript
var address = "gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC";
    var server = new StellarLib.Server({port: 3000});
    // first load the initial transactions, limit 1
    server.getAccountTransactions(address, {limit: 1})
        .then(function (page) {
            // next, load the next results (implicilty limit 1)
            return server.getNextTransactions(page)
                .then(function (page) {
                    // this page will hold the second transaction
                    console.log(page);
                    done()
                })
                .catch(function (err) {
                    done(err);
                })
        })
        .catch(function (err) {
            done(err);
        });
```

## Building the Browser Bundle

To build the js-stellar-lib browser bundle:

```sh
gulp build:browser
```

This will generate files named `js-stellar-lib.js` and `js-stellar-lib.min.js`.
## Tests

Run all the tests:

```sh
gulp test
```
Just the browser or node tests:
```sh
gulp test:node
gulp test:browser
```
Create a coverage report:
```sh
gulp coverage
```

## Contributing

For information on how to contribute, please refer to our [CONTRIBUTING](https://github.com/stellar/js-stellar-lib/blob/master/CONTRIBUTING.md) file.

## License

Code released under [the Apache 2 license](https://github.com/stellar/js-stellar-lib/blob/master/LICENSE).