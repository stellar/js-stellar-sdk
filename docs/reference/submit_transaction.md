---
title: submitTransaction()
---

## Overview

You can build a transaction locally (see [this example](../readme.md#building-transactions)), but after you build it you have to submit it to the Stellar network.  js-stellar-sdk has a function `submitTransaction()` that sends your transaction to the Horizon server (via the [`transactions_create`](https://stellar.org/developers/horizon/reference/transactions-create.html) endpoint) to be broadcast to the Stellar network.

## Methods

| Method | Horizon Endpoint | Param Type | Description |
| --- | --- | --- | --- |
| `submitTransaction(Transaction)` | [`transactions_create`](https://stellar.org/developers/horizon/reference/transactions-create.html) |  [`Transaction`](https://github.com/stellar/js-stellar-base/blob/master/src/transaction.js) | Submits a transaction to the network.

## Example

```js
var StellarSdk = require('js-stellar-sdk')
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

var transaction = new StellarSdk.TransactionBuilder(account)
        // this operation funds the new account with XLM
        .addOperation(StellarSdk.Operation.payment({
            destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
            asset: StellarSdk.Asset.native(),
            amount: "20000000"
        }))
        .build();

transaction.sign(StellarSdk.Keypair.fromSeed(seedString)); // sign the transaction

server.submitTransaction(transaction)
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.error(err);
    });
```
