---
title: ledgers()
---

## Overview

In order to read information about ledgers from a Horizon server, the [`server`](./server.md) object provides the `ledgers()` function. `ledgers()` returns an `TransactionCallBuilder` class, an extension of the [`CallBuilder`](./call_builder.md) class.

By default, `ledgers()` provides access to the [`ledgers_all`](https://stellar.org/developers/horizon/reference/ledgers-all.html) Horizon endpoint.  By chaining other methods to it, you can reach other transaction endpoints.

## Methods

| Method | Horizon Endpoint | Param Type | Description |
| --- | --- | --- | --- |
| `ledgers()` | [`ledgers_all`](https://stellar.org/developers/horizon/reference/ledgers-all.html) |  | Access all ledgers. |
| `.ledger(ledgerSeq)` | [`ledgers_single`](https://stellar.org/developers/horizon/reference/ledgers-single.html) | `string` | Pass in the sequence of the ledger you're interested in to access its details. |
| `.limit(limit)` | | `integer` | Limits the number of returned resources to the given `limit`.|
| `.cursor("token")` | | `string` | Return only resources after the given paging token. |
| `.order({"asc" or "desc"})` | | `string` |  Order the returned collection in "asc" or "desc" order. |
| `.call()` | | | Triggers a HTTP Request to the Horizon server based on the builder's current configuration.  Returns a `Promise` that resolves to the server's response.  For more on `Promise`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).|
| `.stream({options})` | | object of [properties](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#Properties) | Creates an `EventSource` that listens for incoming messages from the server.  URL based on builder's current configuration.  For more on `EventSource`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/API/EventSource). |

## Examples

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

server.ledgers()
  .limit(15)
  .order("desc")
  .call()
  .then(function (ledgerResult) {
    console.log(ledgerResult);
  })
  .catch(function (err) {
    console.error(err);
  })
```
