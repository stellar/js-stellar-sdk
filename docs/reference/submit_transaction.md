---
title: submitTransaction()
---

## Overview

You can build a transaction locally (see [this example](../readme.md#building-transactions)), but after you build it you have to submit it to the Stellar network.  js-stellar-sdk has a function `submitTransaction()` that sends your transaction to the Horizon server to be broadcast to the Stellar network.

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `transaction` | [`Transaction`](https://github.com/stellar/js-stellar-base/blob/master/src/transaction.js) | Transaction you want to submit to the network.|

## Example

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
