---
title: Overview
---
The JavaScript Stellar SDK facilitates integration with the Stellar [Horizon API server](https://developers.stellar.org/api/), the Stellar [Soroban RPC server](https://developers.stellar.org/network/soroban-rpc) and submission of Stellar transactions, either on Node.js or in the browser. It has three main uses: [querying Horizon](#querying-horizon), [interacting with Soroban RPC](), and [building, signing, and submitting transactions to the Stellar network](#building-transactions).

 * [Building and installing the SDK](https://github.com/stellar/js-stellar-sdk)
 * [Examples of using the SDK](./examples.md)

# Querying Horizon
The Stellar SDK gives you access to all the endpoints exposed by Horizon.

## Building requests
js-stellar-sdk uses the [Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern) to create the requests to send to Horizon. Starting with a [server](https://stellar.github.io/js-stellar-sdk/Server.html) object, you can chain methods together to generate a query. (See the [Horizon reference](https://developers.stellar.org/api/) documentation for what methods are possible.)

```js
var StellarSdk = require('@stellar/stellar-sdk');
var server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
// get a list of transactions that occurred in ledger 1400
server.transactions()
    .forLedger(1400)
    .call().then(function(r){ console.log(r); });

// get a list of transactions submitted by a particular account
server.transactions()
    .forAccount('GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW')
    .call().then(function(r){ console.log(r); });
```

Once the request is built, it can be invoked with `.call()` or with `.stream()`. `call()` will return a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to the response given by Horizon.

## Streaming requests
Many requests can be invoked with `stream()`. Instead of returning a promise like `call()` does, `.stream()` will return an `EventSource`. Horizon will start sending responses from either the beginning of time or from the point specified with `.cursor()`. (See the [Horizon reference](https://developers.stellar.org/api/introduction/streaming/) documentation to learn which endpoints support streaming.)

For example, to log instances of transactions from a particular account:

```javascript
var StellarSdk = require('@stellar/stellar-sdk')
var server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
var lastCursor=0; // or load where you left off

var txHandler = function (txResponse) {
    console.log(txResponse);
};

var errorHandler = function (error) {
    console.error("Stream encountered an error:", error);

    setTimeout(() => {
        console.log("Reconnecting...");
        es();
    }, 5000);
};

var es = server.transactions()
    .forAccount(accountAddress)
    .cursor(lastCursor)
    .stream({
        onmessage: txHandler,
        onerror: errorHandler
    })
```

## Handling responses

### XDR
The transaction endpoints will return some fields in raw [XDR](https://developers.stellar.org/api/introduction/xdr/)
form. You can convert this XDR to JSON using the `.fromXDR()` method.

An example of re-writing the txHandler from above to print the XDR fields as JSON:

```javascript
var txHandler = function (txResponse) {
    console.log( JSON.stringify(StellarSdk.xdr.TransactionEnvelope.fromXDR(txResponse.envelope_xdr, 'base64')) );
    console.log( JSON.stringify(StellarSdk.xdr.TransactionResult.fromXDR(txResponse.result_xdr, 'base64')) );
    console.log( JSON.stringify(StellarSdk.xdr.TransactionMeta.fromXDR(txResponse.result_meta_xdr, 'base64')) );
};

```


### Following links
The [HAL format](https://developers.stellar.org/api/introduction/response-format/) links returned with the Horizon response are converted into functions you can call on the returned object.
This allows you to simply use `.next()` to page through results. It also makes fetching additional info, as in the following example, easy:

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


# Transactions

## Building transactions

See the [Building Transactions](https://github.com/stellar/js-stellar-base/blob/master/docs/reference/building-transactions.md) guide for information about assembling a transaction.

## Submitting transactions
Once you have built your transaction, you can submit it to the Stellar network with `Server.submitTransaction()`.
```js
const StellarSdk = require('@stellar/stellar-sdk')
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

(async function main() {
    const account = await server.loadAccount(publicKey);

    // Right now, we have one function that fetches the base fee.
    const fee = await server.fetchBaseFee();

    const transaction = new StellarSdk.TransactionBuilder(account, { fee, networkPassphrase: StellarSdk.Networks.TESTNET })
        .addOperation(
            // this operation funds the new account with XLM
            StellarSdk.Operation.payment({
                destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
                asset: StellarSdk.Asset.native(),
                amount: "2"
            })
        )
        .setTimeout(30)
        .build();

    // sign the transaction
    transaction.sign(StellarSdk.Keypair.fromSecret(secretString));

    try {
        const transactionResult = await server.submitTransaction(transaction);
        console.log(transactionResult);
    } catch (err) {
        console.error(err);
    }
})()
```
