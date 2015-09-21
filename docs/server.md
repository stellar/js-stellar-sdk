
# Server

## Overview

The `server` object handles a network connection to a Horizon server.  It provides methods that makes requests to that Horizon server easy.

It is important to note that `server` methods query [Horizon endpoints]().  Each method points to a particular set of endpoints -- for example, `accounts()` queries `accounts-all` or `accounts-single`.  In order to specify exactly which of the two, more methods are provided after calling `accounts()`.  For more, please see the documentation for [`CallBuilder`]() and for each of the methods belonging to `server`.

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
| `accounts` | None | Returns an `AccountCallBuilder` with methods to query account endpoints. | [`accounts_all`](https://stellar.org/developers/reference/horizon/accounts-all.md), [`accounts_single`](https://stellar.org/developers/reference/horizon/accounts-single.md)|
| `ledgers` | None | Returns a `LedgerCallBuilder` with methods to query ledger endpoints. | [`ledgers_all`](https://stellar.org/developers/reference/horizon/ledgers-all.md), [`ledgers_single`](https://stellar.org/developers/reference/horizon/ledgers-single.md) |
| `transactions` | None | Returns a `TransactionCallBuilder` with methods to query transaction endpoints. | [`transactions_all`](https://stellar.org/developers/reference/horizon/transactions-all.md), [`transactions_single`](https://stellar.org/developers/reference/horizon/transactions-single.md), [`transactions_for_account`](https://stellar.org/developers/reference/horizon/transactions-for-account.md), [`transactions_for_ledger`](https://stellar.org/developers/reference/horizon/transactions-for-ledger.md) |
| `operations` | None | Returns an `OperationsCallBuilder` with methods to query operation endpoints.| [`operations_all`](https://stellar.org/developers/reference/horizon/operations-all.md), [`operations_single`](https://stellar.org/developers/reference/horizon/operations-single.md), [`operations_for_account`](https://stellar.org/developers/reference/horizon/operations-for-account.md), [`operations_for_transaction`](https://stellar.org/developers/reference/horizon/operations-for-transaction.md), [`operation_for_ledger`](https://stellar.org/developers/reference/horizon/operation-for-ledger.md)|
| `payments` | None | Returns a `PaymentCallBuilder` with methods to query payment endpoints. | [`payments_all`](https://stellar.org/developers/reference/horizon/payments-all.md), [`payments_for_account`](https://stellar.org/developers/reference/horizon/payments-for-account.md), [`payments_for_ledger`](https://stellar.org/developers/reference/horizon/payments-for-ledger.md), [`payments_for_transactions`](https://stellar.org/developers/reference/horizon/payments-for-transactions.md) |
| `effects` | None | Returns an `EffectCallBuilder` with methods to query effect endpoints.| [`effects_all`](https://stellar.org/developers/reference/horizon/effects-all.md), [`effects_for_account`](https://stellar.org/developers/reference/horizon/effects-for-account.md), [`effects_for_ledger`](https://stellar.org/developers/reference/horizon/effects-for-ledger.md), [`effects_for_operation`](https://stellar.org/developers/reference/horizon/effects-for-operation.md), [`effects_for_transaction`](https://stellar.org/developers/reference/horizon/effects-for-transaction.md) |
| `offers` | `resource`, `resourceParams` | Returns a `OfferCallBuilder` that queries the offer endpoint.  This requires "accounts" as the `resource` and the address of the account with the offers you're interested in as `resourceParams`. | [`offers_for_account`](https://stellar.org/developers/reference/horizon/offers-for-account.md) |
| `orderbook` | `selling`, `buying` | Returns a `OrderbookCallBuilder` that queries the orderbook endpoint.  Requires the `Asset`s that others are `selling` or `buying` as parameters. | [`orderbook`](https://stellar.org/developers/reference/horizon/orderbook.md) |
| `trades` | None | | [`trades_for_orderbook`](https://stellar.org/developers/reference/horizon/trades-for-orderbook.md) |

## Examples

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server({hostname:'horizon-testnet.stellar.org', secure:true, port:443});

server.accounts()
  ...
```