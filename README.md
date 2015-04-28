# js-stellar-lib

A client side Stellar Javascript Library for building and signing Stellar transactions, and communicating with a remote Stellar Horizon Server.

## Overview

js-stellar-lib is a client side Javascript library for building client side Stellar apps. These can be either node apps or in the browser. The library provides facillities for building and signing transactions, and communicating with a Stellar Horizon instance, for submitting transactions or querying network history.

## Get Started

```
npm install js-stellar-lib
```


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

### Building a Transaction

Once we've created an Account object that has a private key, as in the example above, we can now use that account to create a transaction. In this example, we'll create a simple payment transaction that sends a payment from a source account to a destination account.

```javascript
// create the server connection object
var server = new StellarLib.Server({port: 3000});
// create our source account from seed
var source = StellarLib.Account.fromSeed("sft74k3MagHG6iF36yeSytQzCCLsJ2Fo9K4YJpQCECwgoUobc4v");
// our destination only needs to be the address
var destination = "gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC";
// the currency we want to send
var currency = StellarLib.Currency.native();
// the amount of the currency you want to send
var amount = "1000";
// build the transaction
var transaction = new StellarLib.TransactionBuilder(source)
    .payment(destination, currency, amount)
    .build();
// load the account's current details from the server
server.loadAccount(source)
    .then(function () {
        // submit the transaction to the server
        return server.submitTransaction(transaction)
            .then(function (res) {
                console.log(res);
            })
            .catch(function (err) {
                console.error(err);
            })
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