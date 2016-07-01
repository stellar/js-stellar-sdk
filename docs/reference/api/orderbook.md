---
title: orderbook()
---

## Overview

An orderbook is a summary of all offers for a given pair of [`Assets`](http://stellar.org/developers/learn/concepts/assets.html).  In order to read information about an orderbook from a Horizon server, the [`server`](./server.md) object provides the `orderbook()` function. `orderbook()` returns an `OrderbookCallBuilder` class, an extension of the [`CallBuilder`](./call_builder.md) class.

`orderbook()` must take two parameters to be valid. By passing it a `selling` Asset and a `buying` Asset,`orderbook()` gives you access to the [`orderbook_details`](https://stellar.org/developers/horizon/reference/orderbook_details.html) endpoint.  Chaining `.trades()` gives you access to [`trades_for_orderbook`](https://stellar.org/developers/horizon/reference/trades-for-orderbook.html).

## Methods

| Method | Horizon Endpoint | Param Type | Description |
| --- | --- | --- | --- |
| `orderbook(selling, buying)` | [`orderbook_details`](https://stellar.org/developers/horizon/reference/orderbook_details.html) | [`Asset`](https://github.com/stellar/js-stellar-base/blob/master/src/asset.js), [`Asset`](https://github.com/stellar/js-stellar-base/blob/master/src/asset.js) | Access orderbook summary of all offers with the assets `selling` and `buying`. |
| `.trades()` | [`trades_for_orderbook`](https://stellar.org/developers/horizon/reference/trades-for-orderbook.html) | None | Access trades for the given orderbook. |
| `.limit(limit)` | | `integer` | Limits the number of returned resources to the given `limit`.|
| `.cursor("token")` | | `string` | Return only resources after the given paging token. |
| `.order({"asc" or "desc"})` | | `string` |  Order the returned collection in "asc" or "desc" order. |
| `.call()` | | | Triggers a HTTP Request to the Horizon server based on the builder's current configuration.  Returns a `Promise` that resolves to the server's response.  For more on `Promise`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).|
| `.stream({options})` | | object of [properties](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#Properties) | Creates an `EventSource` that listens for incoming messages from the server.  URL based on builder's current configuration.  For more on `EventSource`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/API/EventSource). |

## Examples

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

server.orderbook(new StellarSdk.Asset("EUR", "GCQPYGH4K57XBDENKKX55KDTWOTK5WDWRQOH2LHEDX3EKVIQRLMESGBG"), new StellarSdk.Asset("USD", "GC23QF2HUE52AMXUFUH3AYJAXXGXXV2VHXYYR6EYXETPKDXZSAW67XO4"))
  .trades()
  .call()
  .then(function(resp) { console.log(resp); })
  .catch(function(err) { console.log(err); })
```
