---
title: Getting Started
---
js-stellar-sdk facilitates Stellar transaction submission and client integration
with the [Stellar Horizon API Server](https://github.com/stellar/horizon). It has two main uses, [querying Horizon](#querying-horizon) and [building, signing, and submitting transactions](#building-transactions) to the Stellar network.

[Building and installing js-stellar-sdk](../../README.md)<br>
[Examples of using js-stellar-sdk](./examples.md)

# Querying Horizon
js-stellar-sdk gives you access to all the endpoints exposed by Horizon.

## Building the Requests
js-stellar-sdk uses the [Builder Pattern](https://en.wikipedia.org/wiki/Builder_pattern) to create the requests to send
to Horizon. Starting with a [server](./server.md) object, you can chain methods together to generate a query.
See the reference documentation for what methods are possible.
```js
var StellarSdk = require('js-stellar-sdk')
var server = new StellarSdk.Server({hostname:'horizon-testnet.stellar.org', secure: true, port: 443});
// get a list of transactions that occurred in ledger 1400
server.transactions()
    .forLedger(1400)
    .call().then(function(r){ console.log(r); });

// get a list of transactions submitted by a particular account
server.transactions()
    .forAccount('GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW')
    .call().then(function(r){ console.log(r); });
```

Once the request is built, it can be invoked with `.call()` or with `.stream()`. `call()` will return a
[promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to the response given by Horizon.

## Streaming Request
Many requests can be invoked with `stream()`. Instead of returning a promise like `call()` does, `.stream()` will return an `EventSource`.
Horizon will start sending responses from either the beginning of time or from the point specified with `.cursor()`.
See the [Horizon reference](https://stellar.org/developers/horizon/reference/) documentation for which endpoints support streaming.
For example, to log anytime a particular account makes a transaction:

```javascript
var StellarSdk = require('js-stellar-sdk')
var server = new StellarSdk.Server({hostname:'horizon-testnet.stellar.org', secure: true, port: 443});
var lastCursor=0; // or load where you left off

var txHandler = function (txResponse) {
    console.log(txResponse);
};

var es = server.transactions()
    .forAccount(accountAddress)
    .cursor(lastCursor)
    .stream({
        onmessage: txHandler
    })
```

## Handling Responses

### XDR
The transaction endpoints will return some fields in raw [XDR](https://stellar.org/developers/horizon/learn/xdr/)
form. You can convert this XDR to JSON using the `.fromXDR()` method.

Here is an example re-writing the txHandler from above to print the XDR fields as JSON.

```javascript
var txHandler = function (txResponse) {
    console.log( JSON.stringify(StellarSdk.xdr.TransactionEnvelope.fromXDR(txResponse.envelope_xdr, 'base64')) );
    console.log( JSON.stringify(StellarSdk.xdr.TransactionResult.fromXDR(txResponse.result_xdr, 'base64')) );
    console.log( JSON.stringify(StellarSdk.xdr.TransactionMeta.fromXDR(txResponse.result_meta_xdr, 'base64')) );
};

```


### Following links
The links returned with the Horizon response are converted into functions you can call on the returned object.
This is allows you to just use `.next()` to page through results.  It also makes fetching additional info like in the following example easy:

```js
server.payments()
    .limit(1)
    .call()
    .then(function(response){
        // will follow the transactions link returned by Horizon
        response.records[0].transaction().then(function(txs){
            console.log(txs);
        });
    });
```


# Building Transactions

See the [Building Transactions](https://stellar.org/developers/js-stellar/learn/building-transactions/) guide for information about assembling a transaction.


## Submitting
Once you have built your transaction you can submit it to the Stellar network with `Server.submitTransaction()`.
```js
var StellarSdk = require('js-stellar-sdk')
var server = new StellarSdk.Server({hostname:'horizon-testnet.stellar.org', secure: true, port: 443});

var transaction = new StellarSdk.TransactionBuilder(account)
        // this operation funds the new account with XLM
        .addOperation(StellarSdk.Operation.payment({
            destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
            asset: StellarSdk.Asset.native(),
            amount: "20000000"
        }))
        .addSigner(StellarSdk.Keypair.fromSeed(seedString)) // sign the transaction
        .build();

server.submitTransaction(transaction)
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.error(err);
    });
```





