# Effects

## Overview

In order to read information about effects from a Horizon server, the [`server`](./server.md) object provides the `effects()` function. `effects()` returns an `TransactionCallBuilder` class, an extension of the [`CallBuilder`](./call_builder.md) class.

By default, `effects()` provides access to the [`effects_all`](https://stellar.org/developers/horizon/reference/effects-all/) Horizon endpoint.  By chaining other methods to it, you can reach other operation endpoints.

## Methods

| Method | Horizon Endpoint | Param Type | Description |
| --- | --- | --- | --- |
| `effects()` | [`effects_all`](https://stellar.org/developers/horizon/reference/effects-all/)|  | Access all effects.
| `.forAccount("address")` | [`effects_for_account`](https://stellar.org/developers/horizon/reference/effects-for-account/) | `string` | Pass in the address of a particular account to access its effects.|
| `.forLedger("ledgerSeq")` | [`effects_for_ledger`](https://stellar.org/developers/horizon/reference/effects-for-ledger/) | `string` | Pass in the sequence of a particular ledger to access its effects. |
| `.forOperation("operationID")` | [`effects_for_operation`](https://stellar.org/developers/horizon/reference/effects-for-operation/) | `string` | Pass in the ID of a particular operation to access its effects. |
| `.forTransaction("transactionHash")` | [`effects_for_transaction`](https://stellar.org/developers/horizon/reference/effects-for-transaction/) | `string` |  Pass in the hash of a particular transaction to access its effects. |
| `.limit(limit)` | | `integer` | Limits the number of returned resources to the given `limit`.|
| `.cursor("token")` | | `string` | Return only resources after the given paging token. |
| `.order({"asc" or "desc"})` | | `string` |  Order the returned collection in "asc" or "desc" order. |
| `.call()` | | | Triggers a HTTP Request to the Horizon server based on the builder's current configuration.  Returns a `Promise` that resolves to the server's response.  For more on `Promise`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).|
| `.stream({options})` | | object of [properties](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#Properties) | Creates an `EventSource` that listens for incoming messages from the server.  URL based on builder's current configuration.  For more on `EventSource`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/API/EventSource). |


## Examples

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server({hostname:'horizon-testnet.stellar.org', secure:true, port:443});

server.effects()
  .forTransaction("7328c64eb9d1a6663c6464a8aecea34951db49b0fd6baae6ee1faa4fd8bc2dcb")
  .call()
  .then(function (operationResult) {
    console.log(operationResult);
  })
  .catch(function (err) {
    console.error(err);
  })
```
