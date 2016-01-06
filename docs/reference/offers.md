---
title: offers()
---

## Overview

In order to read information about offers from a Horizon server, the [`server`](./server.md) object provides the `offers()` function. `offers()` returns an `OfferCallBuilder` class, an extension of the [`CallBuilder`](./call_builder.md) class.

`offers()` must take parameters to be valid. By passing it "accounts" and an account `address`, the only valid input, `offers()` gives you access to the [`offers_for_account`](https://stellar.org/developers/horizon/reference/offers-for-account.html) endpoint.

## Methods

| Method | Horizon Endpoint | Param Type | Description |
| --- | --- | --- | --- |
| `offers("accounts", address)` | [`offers_for_account`](https://stellar.org/developers/horizon/reference/offers-for-account.html) | `string`, `string` | Access all offers for a given `address`. |
| `.limit(limit)` | | `integer` | Limits the number of returned resources to the given `limit`.|
| `.cursor("token")` | | `string` | Return only resources after the given paging token. |
| `.order({"asc" or "desc"})` | | `string` |  Order the returned collection in "asc" or "desc" order. |
| `.call()` | | | Triggers a HTTP Request to the Horizon server based on the builder's current configuration.  Returns a `Promise` that resolves to the server's response.  For more on `Promise`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).|
| `.stream({options})` | | object of [properties](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#Properties) | Creates an `EventSource` that listens for incoming messages from the server.  URL based on builder's current configuration.  For more on `EventSource`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/API/EventSource). |

## Examples

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

server.offers("accounts", "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ")
  .call()
  .then(function (offerResult) {
    console.log(offerResult);
  })
  .catch(function (err) {
    console.error(err);
  })
```
