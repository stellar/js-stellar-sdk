---
id: readme
title: Getting Started with js-stellar-sdk
category: Getting Started
---
js-stellar-sdk facilitates Stellar transaction submission and client integration
with the [Stellar Horizon API Server](https://github.com/stellar/horizon).

- [Building and Installing]()
- [Using JS-Stellar-SDK]()
    - [Transactions](#transactions)
    - [Sequence Numbers](#sequence-numbers)
    - [Multisig](#multisig)
- [Examples](#examples)
   - [Creating a simple payment transaction](#creating-a-simple-payment-transaction)
   - [Loading an account's transaction history](#loading-an-account-transaction-history)
   - [Streaming an accounts transaction history](#streaming-an-accounts-transaction-history)
   - [Creating a multi-signature account](#creating-a-multi-signature-account)


## Building and Installing

Please refer to the project-level [README](../README.md) for information on how to build and install JS-Stellar-SDK.

## Using js-stellar-sdk

### Transactions

[Transactions](https://github.com/stellar/docs/blob/master/concepts/transactions.md) are the commands that modify the network.  They include sending payments, making account configuration changes, etc.  

Transactions are made up of one or more operations. In js-stellar-sdk, operations are added chronologically and applied in that order. Each operation is described below:

* **Create Account** - Create an account with a given starting balance.
* **Payment** - Send an payment of a given currency to an existing destination account, optionally through a path.
* **Path Payment** - Sends a currency to a destination with using a different source currency.
* **Create Offer** - Creates, updates, or deletes an offer for the account.
* **Set Options** - Set or clear Account flags, set inflation destination, or add new signers.
* **Change Trust** - Add or remove a trust line from one account to another.
* **Allow Trust** - Authorize another account to hold your credits.
* **Account Merge** - Merge your account's balance into another account, deleting it.

For more, please refer to the [operations documentation](https://github.com/stellar/docs/blob/master/concepts/operations.md).

Transactions are performed by source accounts that will use up a sequence number and be charged a fee for the transaction.  Each operation also has a source account, which defaults to the transaction's source account. 

For a transaction to be valid, it must be signed by at least one public key -- generally, the source account's public key.  That key must meet the thresholds for the operations in the transaction.  For more on signatures and thresholds, please see the [multi-sig documentation](https://github.com/stellar/docs/blob/master/concepts/multi-sig.md).


### Sequence Numbers

There are strict rules governing a transaction's sequence number.  That sequence number has to match the sequence number stored by the source account or else the transaction is invalid.  After the transaction is submitted and applied to the ledger, the source account's sequence number increases by 1. 

There are two ways to ensure correct sequence numbers:

1. Read the source account's sequence number before submitting a transaction
2. Manage the sequence number locally

Robust applications should use the second method.  During periods of high transaction throughput, fetching a source account's sequence number from the network may not return the correct value.  So, if you're submitting many transactions quickly, you will want to keep track of the sequence number locally.


### Multi-sig

Transactions require signatures for authorization, and generally they only require one.  However, you can exercise more control over authorization and set up complex schemes by increasing the number of signatures a transaction requires.  For more, please consult the [multi-sig documentation](https://github.com/stellar/docs/blob/master/concepts/multi-sig.md).  A summary of the documentation follows:

Every operation has a threshold level of either low, medium, or high.  Let's say that you want to send a payment, a medium threshold operation.  You can set, using the operation `setOptions`, the exact threshold value every medium operation stemming from your account will have.  For example, if your medium threshold level is 3, the payment you send to your friend Zoe will have a threshold level of 3.  The weights of every key that signs the transaction must add up to at least 3.  So, if your signing key only has a weight of 2, you need an additional signer to authorize the payment.


## Examples

### Creating a simple payment transaction

js-stellar-sdk exposes the [`TransactionBuilder`](https://github.com/stellar/js-stellar-base/blob/master/src/transaction_builder.js) class from js-stellar-base.  This class allows you to add operations to a transaction via chaining.  You can construct a new `TransactionBuilder`, call `addOperation`, call `addSigner`, and `build()` yourself transaction.  Below are two examples, reflecting the two ways of dealing with the [sequence number](#sequence-number).

```javascript
/**
* In this example, we'll create and a submit a payment.  We'll use a
* locally managed sequence number.
*/

var StellarLib = require('js-stellar-sdk')
// create the server connection object
var server = new StellarLib.Server({hostname:'example-horizon-server.com', secure: true, port: 443});

// create Account object using locally tracked sequence number
var an_account = new StellarLib.Account("GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ", localSequence);

var transaction = new StellarLib.TransactionBuilder(an_account)
    .addOperation(StellarLib.Operation.payment({
      destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
      asset: StellarLib.Asset.native(),
      amount: "20000000"
    }))
    .addSigner(StellarLib.Keypair.fromSeed(seedString)) // sign the transaction
    .build();

server.submitTransaction(transaction)
  .catch(function (err){
    console.log(err);
  });
```


```javascript
/**
* In this example, we'll create and submit a payment, but we'll read the
* sequence number from the server.
*/
var StellarLib = require('js-stellar-sdk')
var server = new StellarLib.Server({hostname:'example-horizon-server.com', secure: true, port: 443});

server.loadAccount("GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ")
    .then(function (account) {
        // build the transaction
        var transaction = new StellarLib.TransactionBuilder(account)
            // this operation funds the new account with XLM
            .addOperation(StellarLib.Operation.payment({
                destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
                asset: StellarLib.Asset.native(),
                amount: "20000000"
            }))
            .addSigner(StellarLib.Keypair.fromSeed(seedString)) // sign the transaction
            .build();
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.error(err);
    });
```

### Loading an account transaction history

Let's say you want to look at an account's transaction history.  You can use the `accounts()` command and pass in `transactions` as the resource you're interested in.

```javascript
var StellarLib = require('js-stellar-sdk')
var server = new StellarLib.Server({hostname:'example-horizon-server.com', secure: true, port: 443});

server.accounts("GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ", "transactions")
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
        console.log(err);
    });
```
### Streaming an accounts transaction history

js-stellar-lib provides streaming support for Horizon endpoints using `EventSource`.  For example, pass a streaming `onmessage` handler to an account's transaction call:

```javascript
var StellarLib = require('js-stellar-sdk')
var server = new StellarLib.Server({hostname:'example-horizon-server.com', secure: true, port: 443});

var streamingMessageHandler = function (message) {
    console.log(message);
};

var es = server.accounts("GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ", "transactions",
    {
        streaming: {
            onmessage: streamingMessageHandler
        }
    })
```

For more on streaming events, please check out [our guide](https://github.com/stellar/horizon/blob/master/docs/guide/responses.md) and this [guide to server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events).

### Creating a multi-signature account

In this example, we will:
* Add a second signer to an account
* Set the account's masterkey weight and threshold levels
* Create a multi signature transaction that sends a payment

#### Add a secondary key to the account
```javascript

var StellarLib = require('js-stellar-sdk')
var server = new StellarLib.Server({hostname:'example-horizon-server.com', secure: true, port: 443});

server.loadAccount(firstAccountAddress)
    .then(function (account) {
        // build the transaction
        var transaction = new StellarLib.TransactionBuilder(account)
            .addOperation(StellarLib.Operation.setOptions({
                signer: {
                    address: secondAccountAddress,
                    weight: 1
                }
            }))
            .addSigner(StellarLib.Keypair.fromSeed(firstAccountSeedString))
            .build();
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.log(err);
    });
```

#### Set Master key weight and threshold weights
```javascript
var StellarLib = require('js-stellar-sdk')
var server = new StellarLib.Server({hostname:'example-horizon-server.com', secure: true, port: 443});

server.loadAccount(firstAccountAddress)
    .then(function (account) {
        // build the transaction
        var transaction = new StellarLib.TransactionBuilder(account)
            // this operation funds the new account with XLM
                .addOperation(StellarLib.Operation.setOptions({
                    masterWeight : 1,
                    lowThreshold: 1,
                    medThreshold: 2,
                    highThreshold: 1
                }))
            .addSigner(StellarLib.Keypair.fromSeed(firstAccountSeedString))
            .build();
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.log(err);
    });
```

#### Create a multi-sig payment transaction
```javascript
var StellarLib = require('js-stellar-sdk')
var server = new StellarLib.Server({hostname:'example-horizon-server.com', secure: true, port: 443});

server.loadAccount(firstAccountAddress)
    .then(function (account) {
        // build the transaction
        var transaction = new StellarLib.TransactionBuilder(account)
            // this operation funds the new account with XLM
            .addOperation(StellarLib.Operation.payment({
                destination: destinationAccount,  // can be any destination account
                asset: StellarLib.Asset.native(),
                amount: "20000000"
            }))
            .addSigner(StellarLib.Keypair.fromSeed(firstAccountSeedString))
            .addSigner(StellarLib.Keypair.fromSeed(secondAccountSeedString))
            .build();
        return server.submitTransaction(transaction);
    })
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.error(err);
    });
```
#### Multi-sig RPC

Let's say you are a second signer on an account and don't want to share your keypair with the source account.  Instead, you want to control your keypair on a remote server or separate process.  If the source account can send you the envelope of the transaction it wants to submit, you can sign the envelope remotely like so:


```javascript
var StellarLib = require('js-stellar-sdk')
var server = new StellarLib.Server({hostname:'example-horizon-server.com', secure: true, port: 443});

// Let's say this function exists on the remote server
var fakeRPCSigner = function(transactionEnvelope) {
    var RPCKeypair = StellarLib.Keypair.fromSeed(secondAccountSeedString);
    var transaction = new StellarLib.Transaction(transactionEnvelope);
    // If needed, the remote server can check the transaction 
    // for whatever requirements before signing.  For example, 
    // let's check to make sure the transaction is only submitting one operation
    if (transaction.operations.length > 1) {
        throw new Error("Only can sign one payment operation");
    }
    // Now let's check to make sure the operation is a low-enough payment
    var operation = transaction.operations[0];
    if (operation.type != "payment" || operation.amount > 1000000) {
        throw new Error("Payment type not payment or amount too high");
    }
    // All the above is optional.  This function only needs to sign
    transaction.sign({RPCKeypair});
    return transaction.toEnvelope();
};

// Build the transation on the local server
var transaction = new StellarLib.TransactionBuilder(rootAccount)
    // this operation funds the new account with XLM
    .addOperation(StellarLib.Operation.payment({
        destination: destAccountAddress,
        asset: StellarLib.Asset.native(),
        amount: "20000000"
    }))
    .addSigner(StellarLib.Keypair.fromSeed(rootAccountSeedString))
    .build();
try {
    var RPCSignedTransactionEnvelope = fakeRPCSigner(transaction.toEnvelope());
    server.submitTransaction(new StellarLib.Transaction(RPCSignedTransactionEnvelope))
        .catch(function (err) {
            console.log(err);
        });
} catch (err) {
    throw new Error("Unable to authorize transaction");
}

```



