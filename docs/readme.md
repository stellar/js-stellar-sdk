---
id: readme
title: Getting Started
category: Getting Started
---
JS Stellar Lib facilitates Stellar transaction submission and client integration
with the [Stellar Horizon API Server](https://github.com/stellar/go-horizon).

- [Overview](#overview)
    - [Transactions](#transactions)
    - [Sequence Numbers](#sequence-numbers)
- [Examples](#examples)
    - [Stellar Client Tutorial](https://github.com/stellar/stellar-tutorials/tree/master/client)
    - [Creating a simple payment transaction](#creating-a-simple-payment-transaction)
    - [Loading an account's transaction history](#loading-an-account-transaction-history)
    - [Streaming an accounts transaction history](#streaming-an-accounts-transaction-history)
    - [Creating a multi-signature account](#creating-a-multi-signature-account)

## Overview

### Transactions

Transactions are used to change the state of accounts on the network. This includes
sending payments, making account configuration changes, etc. Each unit of change that
can be made on an account is called an "operation". Transactions are made up of one or
more operations. Each operation will be applied in the order it is added to the tranasction. In js-stellar-sdk, that order is chronologically as operations are added. Each operation is described below:

* **Create Account** - Create an account with a given amount.
* **Payment** - Send an payment of a given currency to an existing destination account, optionally through a path.
* **Path Payment** - Sends a currency to a destination with using a different source currency.
* **Create Offer** - Creates, updates, or deletes an offer for the account.
* **Set Options** - Set or clear Account flags, set inflation destination, or add new signers.
* **Change Trust** - Add or remove a trust line from one account to another.
* **Allow Trust** - Authorize another account to hold your credits.
* **Account Merge** - Merge your account's balance into another account, deleting it.

A transaction contains a source account which will use up a sequence number and be charged a fee for the transaction. Additionally, each operation has a source account, which defaults to
the transaction's source account. For a transaction to be valid, it must include signatures
that meet the low threshold for the transaction's source account, and for each operation's
source account threshold for each operation. See more on signatures and thresholds [here](https://github.com/stellar/stellar-core/tree/dc8a9adb494b0584fda9500fb1a465d175efdfd4/src/transactions#thresholds).


### Sequence Numbers

The transaction's "outer" source account uses up a sequence number on transaction submission. The sequence number must be 1 greater than whatever the account's sequence number currently says in the ledger. There are two ways to accomplish this: 1) get sequence number before every transaction or 2) manage locally. Managing the sequence number locally is a must for robust applications as transaction submission is asynchronous, and fetching the sequence number from the network each time you need to sign a transaction may not return what will be the correct sequence number. The js client tool fetches the sequence number from the network each time but this is simply a conveience factor.

You can get the latest sequence number from the network by calling Server.loadAccount() with the account's address. This will return an Account object that can be passed to TransactionBuilder when building a transaction. When build() is called on a TransactionBuilder object, the account's sequence number will be incremented by 1.

## Examples

### Creating a simple payment transaction
To create a transaction using js-stellar-sdk, use [TransactionBuilder](https://github.com/stellar/js-stellar-sdk/blob/master/src/transaction_builder.js). This class provides
a builder like interface which allows you to add operations to a transaction via chaining.
Simply construct a new TransactionBuilder, call addOperation(), passing it the Operation
you'd like to add. Use the static methods in the Operation class to easily create operations.


```javascript
/**
* In this example, we'll create a transaction that funds a new account from the
* root account.
*/

// create the server connection object
var server = new StellarSdk.Server({port: 3000});

// load the root account's current details from the server
server.loadAccount("gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC")
    .then(function (account) {
        // build the transaction
        var transaction = new StellarSdk.TransactionBuilder(account)
            // this operation funds the new account with XLM
            .addOperation(StellarSdk.Operation.payment({
                destination: "g8WyiYoaMmCPsv86xgPRBhHSpBs7bmNMKAB1n93x1BhFkaczjW",
                currency: StellarSdk.Currency.native(),
                amount: "20000000"
            }))
            .build();
        // now we need to sign the transaction with the source (root) account
        var keypair = StellarSdk.Keypair.fromSeed("sft74k3MagHG6iF36yeSytQzCCLsJ2Fo9K4YJpQCECwgoUobc4v");
        var signature = transaction.sign(keypair);
        transaction.addSignature(signature);
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.error(err.stack);
    });
```

### Loading an account transaction history


```javascript
var server = new StellarSdk.Server({port: 3000});
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
### Streaming an accounts transaction history

js-stellar-sdk provides streaming support for Horizon endpoints out of the box, and
it's easy! Simply pass a streaming onmessage handler to an account's transaction lookup
call like so:

```javascript
var streamingMessageHandler = function (message) {
    console.log(message);
};

var server = new StellarSdk.Server({port: 3000});
server.accounts("gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC", "transactions",
    {
        streaming: {
            onmessage: streamingMessageHandler
        }
    })
    .then(function (es) {
        // returns the EventSource object for you to close()
    })
    .catch(function (err) {
        done(err);
    });
```



### Creating a multi-signature account

Multi-signature accounts can be used to require that certain operations
require multiple keypairs sign it before it's valid. This is done by first
configuration your accounts "threshold" levels. Each operation has a threshold
level of low, medium, or high. You give each threshold level a number between
1-255 in your account. Then, for each key in your account, you assign it a
weight (1-255, setting a 0 weight deletes the key). Each operation your account
is the source account to needs to be signed with enough keys to meet the threshold.

For example, lets say you set your threshold levels low = 1, medium = 2, high = 3.
You want to send a payment operation, which has threshold level 2. Your master key has weight 1 (the master key weight is assigned when setting the threshold levels for your account).
Additionally, you have a secondary key associated with your account which has threshold
level 1. Now, the transaction you submit for this payment must include both signatures of
your master key and secondary key.

In this example, we will:
* Add a second signer to the account
* Set our account's masterkey weight and threshold levels
* Create a multi signature transaction that sends a payment

In each example, we'll use the root account.

#### Add a secondary key to the account
```javascript
var server = new StellarSdk.Server({port: 3000});
var rootKeypair = StellarSdk.Keypair.fromSeed("sft74k3MagHG6iF36yeSytQzCCLsJ2Fo9K4YJpQCECwgoUobc4v");
var secondaryAddress = "gsRzkw9ss6BwoUFCsadDDskqaCm9vh9gy3cNbbCVtdvawuTm2pD";
server.loadAccount(rootKeypair.address())
    .then(function (account) {
        // build the transaction
        var transaction = new StellarSdk.TransactionBuilder(account)
            // this operation funds the new account with XLM
            .addOperation(StellarSdk.Operation.setOptions({
                signer: {
                    address: secondaryAddress,
                    weight: 1
                }
            }))
            .build();
        var signature = transaction.sign(rootKeypair);
        transaction.addSignature(signature);
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        done(err);
    });
```

#### Set Master key weight and threshold weights
```javascript
var server = new StellarSdk.Server({port: 3000});
var rootKeypair = StellarSdk.Keypair.fromSeed("sft74k3MagHG6iF36yeSytQzCCLsJ2Fo9K4YJpQCECwgoUobc4v");
server.loadAccount(rootKeypair.address())
    .then(function (account) {
        // build the transaction
        var transaction = new StellarSdk.TransactionBuilder(account)
            // this operation funds the new account with XLM
            .addOperation(StellarSdk.Operation.setOptions({
                thresholds: {
                    weight: 1, // master key weight
                    low: 1,
                    medium: 2, // a payment is medium threshold
                    high: 2 // make sure to have enough weight to add up to the high threshold!
                }
            }))
            .build();
        var signature = transaction.sign(rootKeypair);
        transaction.addSignature(signature);
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        done(err);
    });
```

#### Create a multi-sig payment transaction
```javascript

// create the server connection object
var server = new StellarSdk.Server({port: 3000});

var rootKeypair = StellarSdk.Keypair.fromSeed("sft74k3MagHG6iF36yeSytQzCCLsJ2Fo9K4YJpQCECwgoUobc4v");
var secondKeypair = StellarSdk.Keypair.fromSeed("sfLq8Ua5ynNXo8nYzkGrTWckwQpxuzZ2wh5YzE73mrciWn7gpUQ");

// load the root account's current details from the server
server.loadAccount("gspbxqXqEUZkiCCEFFCN9Vu4FLucdjLLdLcsV6E82Qc1T7ehsTC")
    .then(function (account) {
        // build the transaction
        var transaction = new StellarSdk.TransactionBuilder(account)
            // this operation funds the new account with XLM
            .addOperation(StellarSdk.Operation.payment({
                destination: "g8WyiYoaMmCPsv86xgPRBhHSpBs7bmNMKAB1n93x1BhFkaczjW",
                currency: StellarSdk.Currency.native(),
                amount: "20000000"
            }))
            .build();
        // now we need to sign the transaction with the source (root) account
        transaction.addSignature(transaction.sign(rootKeypair));
        transaction.addSignature(transaction.sign(secondKeypair));
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.error(err.stack);
    });
```
#### Multi-sig RPC

Note: If the second keypair was controlled by an external process such as a seperate process or a remote network device, the transaction envelope could be sent to that external process
and it could return a signature, like so:

```javascript
var fakeRPCSigner = function(transactionEnvelope) {
    var RPCKeypair = StellarSdk.Keypair.fromSeed("sfLq8Ua5ynNXo8nYzkGrTWckwQpxuzZ2wh5YzE73mrciWn7gpUQ");
    var transaction = new StellarSdk.Transaction(transactionEnvelope);
    // if needed, check the operations in the transaction for risk analysis here
    // we'll check to make sure there's only one payment operation under a limit
    if (transaction.operations.length > 1) {
        throw new Error("Only can sign one payment operation");
    }
    var operation = transaction.operations[0];
    if (operation.type != "payment" || operation.amount > 1000000) {
        throw new Error("Payment type not payment or amount too high");
    }
    var signature = transaction.sign(RPCKeypair);
    return signature;
}

// build the transaction
var transaction = new StellarSdk.TransactionBuilder(account)
    // this operation funds the new account with XLM
    .addOperation(StellarSdk.Operation.payment({
        destination: "g8WyiYoaMmCPsv86xgPRBhHSpBs7bmNMKAB1n93x1BhFkaczjW",
        currency: StellarSdk.Currency.native(),
        amount: "20000000"
    }))
    .build();
transaction.addSignature(transaction.sign(rootKeypair));
try {
    var RPCSignature = fakeRPCSigner(transaction.toEnvelope().toString("hex"));
    transaction.addSignature(RPCSignature);
    return server.submitTransaction(transaction);
} else {
    throw new Error("Unable to authorize transaction");
}

```



