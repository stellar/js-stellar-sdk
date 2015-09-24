
# Server

## Overview

The `server` object handles a network connection to a Horizon server.  It provides methods that makes requests to that Horizon server easy.

It is important to note that `server` methods query [Horizon endpoints](https://stellar.org/developers/reference/horizon/).  Each method points to a particular set of endpoints -- for example, `accounts()` queries [`accounts_all`](https://stellar.org/developers/reference/horizon/accounts-all/) or [`accounts_single`](https://stellar.org/developers/reference/horizon/accounts-single/).  In order to specify exactly which of the two, more methods are provided after calling `accounts()`.  For more, please see the documentation for [`CallBuilder`](./call_builder.md) and for each of the methods belonging to `server`.

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
| `accounts` | None | Returns an `AccountCallBuilder` with methods to query account endpoints. | [`accounts_all`](https://stellar.org/developers/reference/horizon/accounts-all/), [`accounts_single`](https://stellar.org/developers/reference/horizon/accounts-single/)|
| `ledgers` | None | Returns a `LedgerCallBuilder` with methods to query ledger endpoints. | [`ledgers_all`](https://stellar.org/developers/reference/horizon/ledgers-all/), [`ledgers_single`](https://stellar.org/developers/reference/horizon/ledgers-single/) |
| `transactions` | None | Returns a `TransactionCallBuilder` with methods to query transaction endpoints. | [`transactions_all`](https://stellar.org/developers/reference/horizon/transactions-all/), [`transactions_single`](https://stellar.org/developers/reference/horizon/transactions-single/), [`transactions_for_account`](https://stellar.org/developers/reference/horizon/transactions-for-account/), [`transactions_for_ledger`](https://stellar.org/developers/reference/horizon/transactions-for-ledger/) |
| `operations` | None | Returns an `OperationsCallBuilder` with methods to query operation endpoints.| [`operations_all`](https://stellar.org/developers/reference/horizon/operations-all/), [`operations_single`](https://stellar.org/developers/reference/horizon/operations-single/), [`operations_for_account`](https://stellar.org/developers/reference/horizon/operations-for-account/), [`operations_for_transaction`](https://stellar.org/developers/reference/horizon/operations-for-transaction/), [`operation_for_ledger`](https://stellar.org/developers/reference/horizon/operation-for-ledger/)|
| `payments` | None | Returns a `PaymentCallBuilder` with methods to query payment endpoints. | [`payments_all`](https://stellar.org/developers/reference/horizon/payments-all/), [`payments_for_account`](https://stellar.org/developers/reference/horizon/payments-for-account/), [`payments_for_ledger`](https://stellar.org/developers/reference/horizon/payments-for-ledger/), [`payments_for_transactions`](https://stellar.org/developers/reference/horizon/payments-for-transactions/) |
| `effects` | None | Returns an `EffectCallBuilder` with methods to query effect endpoints.| [`effects_all`](https://stellar.org/developers/reference/horizon/effects-all/), [`effects_for_account`](https://stellar.org/developers/reference/horizon/effects-for-account/), [`effects_for_ledger`](https://stellar.org/developers/reference/horizon/effects-for-ledger/), [`effects_for_operation`](https://stellar.org/developers/reference/horizon/effects-for-operation/), [`effects_for_transaction`](https://stellar.org/developers/reference/horizon/effects-for-transaction/) |
| `offers` | `resource`, `resourceParams` | Returns a `OfferCallBuilder` that queries the offer endpoint.  This requires "accounts" as the `resource` and the address of the account with the offers you're interested in as `resourceParams`. | [`offers_for_account`](https://stellar.org/developers/reference/horizon/offers-for-account/) |
| `orderbook` | `selling`, `buying` | Returns a `OrderbookCallBuilder` that queries the orderbook endpoint.  Requires the `Asset`s that others are `selling` or `buying` as parameters. | [`orderbook_details`](https://stellar.org/developers/reference/horizon/orderbook_details/), [`trades_for_orderbook`](https://stellar.org/developers/reference/horizon/trades-for-orderbook/)  |


## Examples

```js
var StellarSdk = require('stellar-sdk');
var server = new StellarSdk.Server({hostname:'horizon-testnet.stellar.org', secure:true, port:443});

server.accounts()
  ...
```