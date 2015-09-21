
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
| `accounts` | None | Returns an `AccountCallBuilder` with methods to query account endpoints. | [`accounts_all`](https://github.com/stellar/horizon/blob/master/docs/reference/accounts-all.md), [`accounts_single`](https://github.com/stellar/horizon/blob/master/docs/reference/accounts-single.md)|
| `ledgers` | None | Returns a `LedgerCallBuilder` with methods to query ledger endpoints. | [`ledgers_all`](https://github.com/stellar/horizon/blob/master/docs/reference/ledgers-all.md), [`ledgers_single`](https://github.com/stellar/horizon/blob/master/docs/reference/ledgers-single.md) |
| `transactions` | None | Returns a `TransactionCallBuilder` with methods to query transaction endpoints. | [`transactions_all`](https://github.com/stellar/horizon/blob/master/docs/reference/transactions-all.md), [`transactions_single`](https://github.com/stellar/horizon/blob/master/docs/reference/transactions-single.md), [`transactions_for_account`](https://github.com/stellar/horizon/blob/master/docs/reference/transactions-for-account.md), [`transactions_for_ledger`](https://github.com/stellar/horizon/blob/master/docs/reference/transactions-for-ledger.md) |
| `operations` | None | Returns an `OperationsCallBuilder` with methods to query operation endpoints.| [`operations_all`](https://github.com/stellar/horizon/blob/master/docs/reference/operations-all.md), [`operations_single`](https://github.com/stellar/horizon/blob/master/docs/reference/operations-single.md), [`operations_for_account`](https://github.com/stellar/horizon/blob/master/docs/reference/operations-for-account.md), [`operations_for_transaction`](https://github.com/stellar/horizon/blob/master/docs/reference/operations-for-transaction.md), [`operation_for_ledger`](https://github.com/stellar/horizon/blob/master/docs/reference/operation-for-ledger.md)|
| `payments` | None | Returns a `PaymentCallBuilder` with methods to query payment endpoints. | [`payments_all`](https://github.com/stellar/horizon/blob/master/docs/reference/payments-all.md), [`payments_for_account`](https://github.com/stellar/horizon/blob/master/docs/reference/payments-for-account.md), [`payments_for_ledger`](https://github.com/stellar/horizon/blob/master/docs/reference/payments-for-ledger.md), [`payments_for_transactions`](https://github.com/stellar/horizon/blob/master/docs/reference/payments-for-transactions.md) |
| `effects` | None | Returns an `EffectCallBuilder` with methods to query effect endpoints.| [`effects_all`](https://github.com/stellar/horizon/blob/master/docs/reference/effects-all.md), [`effects_for_account`](https://github.com/stellar/horizon/blob/master/docs/reference/effects-for-account.md), [`effects_for_ledger`](https://github.com/stellar/horizon/blob/master/docs/reference/effects-for-ledger.md), [`effects_for_operation`](https://github.com/stellar/horizon/blob/master/docs/reference/effects-for-operation.md), [`effects_for_transaction`](https://github.com/stellar/horizon/blob/master/docs/reference/effects-for-transaction.md) |
| `offers` | `resource`, `resourceParams` | Returns a `OfferCallBuilder` that queries the offer endpoint.  This requires "accounts" as the `resource` and the address of the account with the offers you're interested in as `resourceParams`. | [`offers_for_account`](https://github.com/stellar/horizon/blob/master/docs/reference/offers-for-account.md) |
| `orderbook` | `selling`, `buying` | Returns a `OrderbookCallBuilder` that queries the orderbook endpoint.  Requires the `Asset`s that others are `selling` or `buying` as parameters. | [`orderbook`](https://github.com/stellar/horizon/blob/master/docs/reference/orderbook.md) |
| `trades` | None | | [`trades_for_orderbook`](https://github.com/stellar/horizon/blob/master/docs/reference/trades-for-orderbook.md) |

## Examples

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server({hostname:'horizon-testnet.stellar.org', secure:true, port:443});

server.accounts()
  ...
```