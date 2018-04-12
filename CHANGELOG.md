# Changelog

As this project is pre 1.0, breaking changes may happen for minor version bumps. A breaking change will get clearly notified in this log.

## 0.8.0

* Modify `/trades` endpoint to reflect changes in horizon. 
* Add `/trade_aggregations` support.
* Add `/assets` support. 

## 0.7.3

* Upgrade `stellar-base`.

## 0.7.2

* Allow hex string in setOptions signers.

## 0.7.1

* Upgrade `stellar-base`.

## 0.7.0

* Support for new signer types: `sha256Hash`, `preAuthTx`.
* `StrKey` helper class with `strkey` encoding related methods.
* Removed deprecated methods: `Keypair.isValidPublicKey` (use `StrKey`), `Keypair.isValidSecretKey` (use `StrKey`), `Keypair.fromSeed`, `Keypair.seed`, `Keypair.rawSeed`.
* **Breaking changes**:
  * `Network` must be explicitly selected. Previously testnet was a default network.
  * `Operation.setOptions()` method `signer` param changed.
  * `Keypair.fromAccountId()` renamed to `Keypair.fromPublicKey()`.
  * `Keypair.accountId()` renamed to `Keypair.publicKey()`.
  * Dropping support for `End-of-Life` node versions.

## 0.6.2

* Updated `stellar.toml` location

## 0.6.1

* `forUpdate` methods of call builders now accept strings and numbers.
* Create a copy of attribute in a response if there is a link with the same name (ex. `transaction.ledger`, `transaction._links.ledger`).

## 0.6.0

* **Breaking change** `CallBuilder.stream` now reconnects when no data was received for a long time.
This is to prevent permanent disconnects (more in: [#76](https://github.com/stellar/js-stellar-sdk/pull/76)).
Also, this method now returns `close` callback instead of `EventSource` object.
* **Breaking change** `Server.loadAccount` now returns the `AccountResponse` object.
* **Breaking change** Upgraded `stellar-base` to `0.6.0`. `ed25519` package is now an optional dependency. Check `StellarSdk.FastSigning` variable to check if `ed25519` package is available. More in README file.
* New `StellarTomlResolver` class that allows getting `stellar.toml` file for a domain.
* New `Config` class to set global config values.

## 0.5.1

* Fixed XDR decoding issue when using firefox

## 0.5.0

* **Breaking change** `Server` and `FederationServer` constructors no longer accept object in `serverUrl` parameter.
* **Breaking change** Removed `AccountCallBuilder.address` method. Use `AccountCallBuilder.accountId` instead.
* **Breaking change** It's no longer possible to connect to insecure server in `Server` or `FederationServer` unless `allowHttp` flag in `opts` is set.
* Updated dependencies.

## 0.4.3

* Updated dependency (`stellar-base`).

## 0.4.2

* Updated dependencies.
* Added tests.
* Added `CHANGELOG.md` file.

## 0.4.1

* `stellar-base` bump. (c90c68f)

## 0.4.0

* **Breaking change** Bumped `stellar-base` to [0.5.0](https://github.com/stellar/js-stellar-base/blob/master/CHANGELOG.md#050). (b810aef)
