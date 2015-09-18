# Accounts

## Overview

In order to read information about accounts from a Horizon server, the [`server`](./server.md) object provides the `accounts()` function. `accounts()` returns an `AccountCallBuilder` class, an extension of the [`CallBuilder`](./call_builder.md) class.

By default, `accounts()` provides access to the `accounts_all` Horizon endpoint.  By chaining an account address to it, you can reach the `accounts_single` endpoint.

## Methods

| Method | Horizon Endpoint | Param Type | Description |
| --- | --- | --- | --- |
| `accounts()` | `accounts_all` | None | 
| `.address(accountAddress)` | `accounts_single` | `string` | The `string` of the address of the account you're interested in.  Please refer to the [`accounts_single`]() reference documentation. |
| `.call()` |  | | Triggers a HTTP Request to the Horizon server based on the builder's current configuration.  Returns a `Promise` that resolves to the server's response.  For more on `Promise`, see []().|
| `.stream(options)` | | object containing the optional functions `onmessage` and `onerror` | Creates an `Eventsource` that listens for incoming messages from the server.  URL based on builder's current configuration.  For more on `Eventsource`, see []() |
| `.limit("limit")` | |`string` | |
| `.cursor("token")` | |`string` | |
| `.order({"asc" or "desc"})` | | `string` | |

## Examples

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server({hostname:'horizon-testnet.stellar.org', secure:true, port:443});

server.accounts()
  .address("GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ")
  .call()
  .then(function (accountResult) {
    console.log(accountResult);
  })
  .catch(function (err) {
    console.error(err);
  })
```
