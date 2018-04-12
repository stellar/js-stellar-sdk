---
title: friendbot()
---

## Overview

Friendbot is an utility that funds a new account.  When you create a new account, that account has no balance and does not exist in the ledger until it is funded.  Friendbot fixes that problem.

The mechanics underlying Friendbot (i.e., how a new account is funded) are determined by each Horizon server's administrator.

## Methods

| Method | Horizon Endpoint | Param Type | Description |
| --- | --- | --- | --- |
| `friendbot("address")` | | `string` | Funds the new account with the given address.  Fails if account is already funded. |
| `.call()` |  | | Triggers a HTTP Request to the Horizon server based on the builder's current configuration.  Returns a `Promise` that resolves to the server's response.  For more on `Promise`, see []().|
| `.stream(options)` | | object containing the optional functions `onmessage` and `onerror` | Creates an `Eventsource` that listens for incoming messages from the server.  URL based on builder's current configuration.  For more on `Eventsource`, see []() |


## Examples

```js
var StellarLib = require('stellar-sdk');

var new_seed = StellarLib.Keypair.random()
var new_address = new_seed.accountId()

server.friendbot(new_address)
  .then(function(resp) {
    console.log(resp);
  })
  .catch(function(err) {
    console.log(err);
  });
```
