
# Server

## Overview

The `server` object handles a network connection to a Horizon server.  It provides methods that makes requests to that Horizon server easy.

It is important to note that `server` methods query [Horizon endpoints]().  Each method points to a particular set of endpoints -- for example, `accounts()` queries `accounts_all` or `accounts_single`.  In order to specify exactly which of the two, more methods are provided after calling `accounts()`.  For more, please see the documentation for [`CallBuilder`]() and for each of the methods belonging to `server`.

## Parameters

| Parameter | Type | Required | Description | 
| --- | --- | --- | --- |
| `config` | `object` | No | The server configuration |
| `config.secure` | `boolean` | No | If `true`, establishes a connection with HTTPS instead of HTTP.  Defaults `false`.|
| `config.hostname` | `string` | No | The hostname of the Horizon server.  Defaults to `localhost`.|
| `config.port` | `integer` | No | The port of the Horizon server to connect to.  Defaults to 3000.|

## Methods

| Method | Params | Description | Endpoints |
| --- | --- | --- | --- |
| `accounts` | None | Returns an `AccountCallBuilder` with methods to query account endpoints. | `accounts_all`, `accounts_single`|
| `ledgers` | None | Returns a `LedgerCallBuilder` with methods to query ledger endpoints. | `ledgers_all`, `ledgers_single` |
| `transactions` | None | Returns a `TransactionCallBuilder` with methods to query transaction endpoints. | `transactions_all`, `transactions_single`, `transactions_for_account`, `transactions_for_ledger` |
| `operations` | None | Returns an `OperationsCallBuilder` with methods to query operation endpoints.| `operations_all`, `operations_single`, `operations_for_account`, `operations_for_transaction`, `operation_for_ledger`|
| `payments` | None | Returns a `PaymentCallBuilder` with methods to query payment endpoints. | `payments_all`, `payments_for_account`, `payments_for_ledger`, `payments_for_transactions` |
| `effects` | None | Returns an `EffectCallBuilder` with methods to query effect endpoints.| `effects_all`, `effects_for_account`, `effects_for_ledger`, `effects_for_operation`, `effects_for_transaction` |
| `offers` | `resource`, `resourceParams` | Returns a `OfferCallBuilder` that queries the offer endpoint.  This requires "accounts" as the `resource` and the address of the account with the offers you're interested in as `resourceParams`. | `offers_for_account` |
| `orderbook` | `selling`, `buying` | Returns a `OrderbookCallBuilder` that queries the orderbook endpoint.  Requires the `Asset`s that others are `selling` or `buying` as parameters. | `orderbook` |
| `trades` | None | | `trades_for_orderbook` |

## Examples

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server({hostname:'horizon-testnet.stellar.org', secure:true, port:443});

server.accounts()
  ...
```