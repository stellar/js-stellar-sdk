---
title: Server
---

## Overview

The `server` object handles a network connection to a Horizon server.  It provides methods that makes requests to that Horizon server easy.

It is important to note that `server` methods query [Horizon endpoints](https://www.stellar.org/developers/reference/).  Each method points to a particular set of endpoints -- for example, `accounts()` queries [`accounts_all`](https://www.stellar.org/developers/horizon/reference/accounts-all.html) or [`accounts_single`](https://www.stellar.org/developers/horizon/reference/accounts-single.html).  In order to specify exactly which of the two, more methods are provided after calling `accounts()`.  For more, please see the documentation for [`CallBuilder`](./call_builder.md) and for each of the methods belonging to `server`.

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
| `accounts` | None | Returns an `AccountCallBuilder` with methods to query account endpoints. | [`accounts_all`](https://stellar.org/developers/horizon/reference/accounts-all.html), [`accounts_single`](https://stellar.org/developers/horizon/reference/accounts-single.html)|
| `ledgers` | None | Returns a `LedgerCallBuilder` with methods to query ledger endpoints. | [`ledgers_all`](https://stellar.org/developers/horizon/reference/ledgers-all.html), [`ledgers_single`](https://stellar.org/developers/horizon/reference/ledgers-single.html) |
| `transactions` | None | Returns a `TransactionCallBuilder` with methods to query transaction endpoints. | [`transactions_all`](https://stellar.org/developers/horizon/reference/transactions-all.html), [`transactions_single`](https://stellar.org/developers/horizon/reference/transactions-single.html), [`transactions_for_account`](https://stellar.org/developers/horizon/reference/transactions-for-account.html), [`transactions_for_ledger`](https://stellar.org/developers/horizon/reference/transactions-for-ledger.html) |
| `operations` | None | Returns an `OperationsCallBuilder` with methods to query operation endpoints.| [`operations_all`](https://stellar.org/developers/horizon/reference/operations-all.html), [`operations_single`](https://www.stellar.org/developers/horizon/reference/operations-single.html), [`operations_for_account`](https://stellar.org/developers/horizon/reference/operations-for-account.html), [`operations_for_transaction`](https://stellar.org/developers/horizon/reference/operations-for-transaction.html), [`operation_for_ledger`](https://stellar.org/developers/horizon/reference/operations-for-ledger.html)|
| `payments` | None | Returns a `PaymentCallBuilder` with methods to query payment endpoints. | [`payments_all`](https://stellar.org/developers/horizon/reference/payments-all.html), [`payments_for_account`](https://stellar.org/developers/horizon/reference/payments-for-account.html), [`payments_for_ledger`](https://stellar.org/developers/horizon/reference/payments-for-ledger.html), [`payments_for_transactions`](https://www.stellar.org/developers/horizon/reference/payments-for-transaction.html) |
| `effects` | None | Returns an `EffectCallBuilder` with methods to query effect endpoints.| [`effects_all`](https://stellar.org/developers/horizon/reference/effects-all.html), [`effects_for_account`](https://stellar.org/developers/horizon/reference/effects-for-account.html), [`effects_for_ledger`](https://stellar.org/developers/horizon/reference/effects-for-ledger.html), [`effects_for_operation`](https://stellar.org/developers/horizon/reference/effects-for-operation.html), [`effects_for_transaction`](https://stellar.org/developers/horizon/reference/effects-for-transaction.html) |
| `offers` | `resource`, `resourceParams` | Returns a `OfferCallBuilder` that queries the offer endpoint.  This requires "accounts" as the `resource` and the address of the account with the offers you're interested in as `resourceParams`. | [`offers_for_account`](https://stellar.org/developers/horizon/reference/offers-for-account.html) |
| `orderbook` | `selling`, `buying` | Returns a `OrderbookCallBuilder` that queries the orderbook endpoint.  Requires the `Asset`s that others are `selling` or `buying` as parameters. | [`orderbook_details`](https://www.stellar.org/developers/horizon/reference/orderbook-details.html), [`trades_for_orderbook`](https://stellar.org/developers/horizon/reference/trades-for-orderbook.html)  |


## Examples

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

server.accounts()
  ...
```
