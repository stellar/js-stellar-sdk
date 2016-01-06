---
title: transactions()
---

## Overview

In order to read information about transactions from a Horizon server, the [`server`](./server.md) object provides the `transactions()` function. `transactions()` returns an `TransactionCallBuilder` class, an extension of the [`CallBuilder`](./call_builder.md) class.

By default, `transactions()` provides access to the [`transactions_all`](https://stellar.org/developers/horizon/reference/transactions-all.html) Horizon endpoint.  By chaining other methods to it, you can reach other transaction endpoints.

## Methods

| Method | Horizon Endpoint | Param Type | Description |
| --- | --- | --- | --- |
| `transactions()` | [`transactions_all`](https://stellar.org/developers/horizon/reference/transactions-all.html) |  | Access all transactions. |
| `.transaction(transactionHash)` | [`transactions_single`](https://stellar.org/developers/horizon/reference/transactions-single.html) | `string` | Pass in the hash of the transaction you're interested in to access its details. |
| `.forAccount(address)` | [`transactions_for_account`](https://stellar.org/developers/horizon/reference/transactions-for-account.html) | `string` | Pass in the address of a particular account to access its transactions. |
| `.forLedger(ledgerSeq)` | [`transactions_for_ledger`](https://stellar.org/developers/horizon/reference/transactions-for-ledger.html) | `string` | Pass in the ledger sequence of a particular ledger to access its transactions. |
| `.limit(limit)` | | `integer` | Limits the number of returned resources to the given `limit`.|
| `.cursor("token")` | | `string` | Return only resources after the given paging token. |
| `.order({"asc" or "desc"})` | | `string` |  Order the returned collection in "asc" or "desc" order. |
| `.call()` | | | Triggers a HTTP Request to the Horizon server based on the builder's current configuration.  Returns a `Promise` that resolves to the server's response.  For more on `Promise`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).|
| `.stream({options})` | | object of [properties](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#Properties) | Creates an `EventSource` that listens for incoming messages from the server.  URL based on builder's current configuration.  For more on `EventSource`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/API/EventSource). |

## Examples

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

server.transactions()
  .forAddress("GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K")
  .cursor("15530601746432")
  .call()
  .then(function (transactionResult) {
    console.log(transactionResult);
  })
  .catch(function (err) {
    console.error(err);
  })
```
