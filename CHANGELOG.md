# Changelog

A breaking change will get clearly marked in this log.

## [v2.2.2](https://github.com/stellar/js-stellar-sdk/compare/v2.2.1...v2.2.2)

### Fix

- Fix manage data value in SEP0010 challenge builder. ([#396](https://github.com/stellar/js-stellar-sdk/issues/396))

### Add

- Add support for networkPassphrase in SEP0010 challenge builder. ([#397](https://github.com/stellar/js-stellar-sdk/issues/397))

## [v2.2.1](https://github.com/stellar/js-stellar-sdk/compare/v2.2.0...v2.2.1)

### Fix

- Fix [#391](https://github.com/stellar/js-stellar-sdk/issues/391): Remove instance check for MessageEvent on stream error. ([#392](https://github.com/stellar/js-stellar-sdk/issues/392))


## [v2.2.0](https://github.com/stellar/js-stellar-sdk/compare/v2.1.1...v2.2.0)

### Add
- Add helper `Utils.verifyChallengeTx` to verify SEP0010 "Challenge" Transaction. ([#388](https://github.com/stellar/js-stellar-sdk/issues/388))
- Add helper `Utils.verifyTxSignedBy` to verify that a transaction has been signed by a given account. ([#388](https://github.com/stellar/js-stellar-sdk/pull/388/commits/2cbf36891e529f63867d46bcf321b5bb76acef50))

### Fix
- Check for a global EventSource before deciding what to use. This allows you to inject polyfills in other environments like react-native. ([#389](https://github.com/stellar/js-stellar-sdk/issues/389))

## [v2.1.1](https://github.com/stellar/js-stellar-sdk/compare/v2.1.0...v2.1.1)

### Fix
- Fix CallBuilder onmessage type ([#385](https://github.com/stellar/js-stellar-sdk/issues/385))

## [v2.1.0](https://github.com/stellar/js-stellar-sdk/compare/v2.0.1...v2.1.0)

### Add
- Add single script to build docs and call it when combined with jsdoc. ([#380](https://github.com/stellar/js-stellar-sdk/issues/380))
- Add SEP0010 transaction challenge builder. ([#375](https://github.com/stellar/js-stellar-sdk/issues/375))
- Add `home_domain` to ServerApi.AccountRecord ([#376](https://github.com/stellar/js-stellar-sdk/issues/376))

### Bump
- Bump stellar-base to 1.0.3. ([#378](https://github.com/stellar/js-stellar-sdk/issues/378))
- Bump @stellar/tslint-config ([#377](https://github.com/stellar/js-stellar-sdk/issues/377))

### Fix
- Fix jsdoc's build in after_deploy ([#373](https://github.com/stellar/js-stellar-sdk/issues/373))
- Create new URI instead of passing serverUrl (Fix [#379](https://github.com/stellar/js-stellar-sdk/issues/379)). ([#382](https://github.com/stellar/js-stellar-sdk/issues/382))

## [v2.0.1](https://github.com/stellar/js-stellar-sdk/compare/v1.0.2...v2.0.1)

- **Breaking change** Port stellar-sdk to Typescript. Because we use a slightly
  different build process, there could be some unanticipated bugs. Additionally,
  some type definitions have changed:
  - Types that were once in the `Server` namespace but didn't actually deal with
    the `Server` class have been broken out into a new namespace, `ServerApi`.
    So, for example, `Server.AccountRecord` -> `ServerApi.AccountRecord`.
  - `Server.AccountResponse` is out of the `Server` namespace ->
    `AccountResponse`
  - `Server.*CallBuilder` is out of the `Server` namespace -> `*CallBuilder`
  - `HorizonResponseAccount` is now `Horizon.AccountResponse`
- Upgrade Webpack to v4.
- Add support for providing app name and version to request headers.
- (NPM wouldn't accept the 2.0.0 version, so we're publishing to 2.0.1.)

Many thanks to @Ffloriel and @Akuukis for their help with this release!

## [v1.0.5](https://github.com/stellar/js-stellar-sdk/compare/v1.0.4...v1.0.5)

- Make CallCollectionFunction return a CollectionPage.
- Update Horizon.AccountSigner[] types.

## [v1.0.4](https://github.com/stellar/js-stellar-sdk/compare/v1.0.3...v1.0.4)

- Automatically tag alpha / beta releases as "next" in NPM.

## [v1.0.3](https://github.com/stellar/js-stellar-sdk/compare/v1.0.2...v1.0.3)

- Upgrade axios to 0.19.0 to close a security vulnerability.
- Some type fixes.

## [v1.0.2](https://github.com/stellar/js-stellar-sdk/compare/v1.0.1...v1.0.2)

- Upgrade stellar-base to v1.0.2 to fix a bug with the browser bundle.

## [v1.0.1](https://github.com/stellar/js-stellar-sdk/compare/v1.0.0...v1.0.1)

- Upgrade stellar-base to v1.0.1, which makes available again the deprecated
  operation functions `Operation.manageOffer` and `Operation.createPassiveOffer`
  (with a warning).
- Fix the documentation around timebounds.

## [v1.0.0](https://github.com/stellar/js-stellar-sdk/compare/v0.15.4...v1.0.0)

- Upgrade stellar-base to
  [v1.0.0](https://github.com/stellar/js-stellar-base/releases/tag/v1.0.0),
  which introduces two breaking changes.
- Switch stellar-sdk's versioning to true semver! 🎉

## [v0.15.4](https://github.com/stellar/js-stellar-sdk/compare/v0.15.3...v0.15.4)

- Add types for LedgerCallBuilder.ledger.
- Add types for Server.operationFeeStats.
- Add types for the HorizonAxiosClient export.
- Move @types/\* from devDependencies to dependencies.
- Pass and use a stream response type to CallBuilders if it's different from the
  normal call response.
- Upgrade stellar-base to a version that includes types, and remove
  @types/stellar-base as a result.

## [v0.15.3](https://github.com/stellar/js-stellar-sdk/compare/v0.15.2...v0.15.3)

- In .travis.yml, try to switch from the encrypted API key to an environment
  var.

## [v0.15.2](https://github.com/stellar/js-stellar-sdk/compare/v0.15.1...v0.15.2)

- Fix Server.transactions and Server.payments definitions to properly return
  collections
- Renew the npm publish key

## [v0.15.1](https://github.com/stellar/js-stellar-sdk/compare/v0.15.0...v0.15.1)

- Add Typescript type definitions (imported from DefinitelyTyped).
- Make these changes to those definitions:
  - Add definitions for Server.fetchBaseFee and Server.fetchTimebounds
  - CallBuilder: No long always returns CollectionPaged results. Interfaces that
    extend CallBuilder should specify whether their response is a collection or
    not
  - CallBuilder: Add inflation_destination and last_modified_ledger property
  - OfferRecord: Fix the returned properties
  - TradeRecord: Fix the returned properties
  - TradesCallBuilder: Add forAccount method
  - TransactionCallBuilder: Add includeFailed method
  - Horizon.BalanceLineNative/Asset: Add buying_liabilities /
    selling_liabilities properties
- Fix documentation links.

## [v0.15.0](https://github.com/stellar/js-stellar-sdk/compare/v0.14.0...v0.15.0)

- **Breaking change**: `stellar-sdk` no longer ships with an `EventSource`
  polyfill. If you plan to support IE11 / Edge, please use
  [`event-source-polyfill`](https://www.npmjs.com/package/event-source-polyfill)
  to set `window.EventSource`.
- Upgrade `stellar-base` to a version that doesn't use the `crypto` library,
  fixing a bug with Angular 6
- Add `Server.prototype.fetchTimebounds`, a helper function that helps you set
  the `timebounds` property when initting `TransactionBuilder`. It bases the
  timebounds on server time rather than local time.

## [v0.14.0](https://github.com/stellar/js-stellar-sdk/compare/v0.13.0...v0.14.0)

- Updated some out-of-date dependencies
- Update documentation to explicitly set fees
- Add `Server.prototype.fetchBaseFee`, which devs can use to fetch the current
  base fee; we plan to add more functions to help suggest fees in future
  releases
- Add `includeFailed` to `OperationCallBuilder` for including failed
  transactions in calls
- Add `operationFeeStats` to `Server` for the new fee stats endpoint
- After submitting a transaction with a `manageOffer` operation, return a new
  property `offerResults`, which explains what happened to the offer. See
  [`Server.prototype.submitTransaction`](https://stellar.github.io/js-stellar-sdk/Server.html#submitTransaction)
  for documentation.

## 0.13.0

- Update `stellar-base` to `0.11.0`
- Added ESLint and Prettier to enforce code style
- Upgraded dependencies, including Babel to 6
- Bump local node version to 6.14.0

## 0.12.0

- Update `stellar-base` to `0.10.0`:
  - **Breaking change** Added
    [`TransactionBuilder.setTimeout`](https://stellar.github.io/js-stellar-base/TransactionBuilder.html#setTimeout)
    method that sets `timebounds.max_time` on a transaction. Because of the
    distributed nature of the Stellar network it is possible that the status of
    your transaction will be determined after a long time if the network is
    highly congested. If you want to be sure to receive the status of the
    transaction within a given period you should set the TimeBounds with
    `maxTime` on the transaction (this is what `setTimeout` does internally; if
    there's `minTime` set but no `maxTime` it will be added). Call to
    `TransactionBuilder.setTimeout` is required if Transaction does not have
    `max_time` set. If you don't want to set timeout, use `TimeoutInfinite`. In
    general you should set `TimeoutInfinite` only in smart contracts. Please
    check
    [`TransactionBuilder.setTimeout`](https://stellar.github.io/js-stellar-base/TransactionBuilder.html#setTimeout)
    docs for more information.
  - Fixed decoding empty `homeDomain`.
- Add `offset` parameter to TradeAggregationCallBuilder to reflect new changes
  to the endpoint in horizon-0.15.0

## 0.11.0

- Update `js-xdr` (by updating `stellar-base`) to support unmarshaling non-utf8
  strings.
- String fields returned by `Operation.fromXDRObject()` are of type `Buffer` now
  (except `SetOptions.home_domain` and `ManageData.name` - both required to be
  ASCII by stellar-core).

## 0.10.3

- Update `stellar-base` and xdr files.

## 0.10.2

- Update `stellar-base` (and `js-xdr`).

## 0.10.1

- Update `stellar-base` to `0.8.1`.

## 0.10.0

- Update `stellar-base` to `0.8.0` with `bump_sequence` support.

## 0.9.2

- Removed `.babelrc` file from the NPM package.

## 0.9.1

### Breaking changes

- `stellar-sdk` is now using native `Promise` instead of `bluebird`. The `catch`
  function is different. Instead of:

  ```js
  .catch(StellarSdk.NotFoundError, function (err) { /* ... */ })
  ```

  please use the following snippet:

  ```js
  .catch(function (err) {
    if (err instanceof StellarSdk.NotFoundError) { /* ... */ }
  })
  ```

- We no longer support IE 11, Firefox < 42, Chrome < 49.

### Changes

- Fixed `_ is undefined` bug.
- Browser build is around 130 KB smaller!

## 0.8.2

- Added `timeout` option to `StellarTomlResolver` and `FederationServer` calls
  (https://github.com/stellar/js-stellar-sdk/issues/158).
- Fixed adding random value to URLs multiple times
  (https://github.com/stellar/js-stellar-sdk/issues/169).
- Fixed jsdoc for classes that extend `CallBuilder`.
- Updated dependencies.
- Added `yarn.lock` file to repository.

## 0.8.1

- Add an allowed trade aggregation resolution of one minute
- Various bug fixes
- Improved documentation

## 0.8.0

- Modify `/trades` endpoint to reflect changes in horizon.
- Add `/trade_aggregations` support.
- Add `/assets` support.

## 0.7.3

- Upgrade `stellar-base`.

## 0.7.2

- Allow hex string in setOptions signers.

## 0.7.1

- Upgrade `stellar-base`.

## 0.7.0

- Support for new signer types: `sha256Hash`, `preAuthTx`.
- `StrKey` helper class with `strkey` encoding related methods.
- Removed deprecated methods: `Keypair.isValidPublicKey` (use `StrKey`),
  `Keypair.isValidSecretKey` (use `StrKey`), `Keypair.fromSeed`, `Keypair.seed`,
  `Keypair.rawSeed`.
- **Breaking changes**:
  - `Network` must be explicitly selected. Previously testnet was a default
    network.
  - `Operation.setOptions()` method `signer` param changed.
  - `Keypair.fromAccountId()` renamed to `Keypair.fromPublicKey()`.
  - `Keypair.accountId()` renamed to `Keypair.publicKey()`.
  - Dropping support for `End-of-Life` node versions.

## 0.6.2

- Updated `stellar.toml` location

## 0.6.1

- `forUpdate` methods of call builders now accept strings and numbers.
- Create a copy of attribute in a response if there is a link with the same name
  (ex. `transaction.ledger`, `transaction._links.ledger`).

## 0.6.0

- **Breaking change** `CallBuilder.stream` now reconnects when no data was
  received for a long time. This is to prevent permanent disconnects (more in:
  [#76](https://github.com/stellar/js-stellar-sdk/pull/76)). Also, this method
  now returns `close` callback instead of `EventSource` object.
- **Breaking change** `Server.loadAccount` now returns the `AccountResponse`
  object.
- **Breaking change** Upgraded `stellar-base` to `0.6.0`. `ed25519` package is
  now an optional dependency. Check `StellarSdk.FastSigning` variable to check
  if `ed25519` package is available. More in README file.
- New `StellarTomlResolver` class that allows getting `stellar.toml` file for a
  domain.
- New `Config` class to set global config values.

## 0.5.1

- Fixed XDR decoding issue when using firefox

## 0.5.0

- **Breaking change** `Server` and `FederationServer` constructors no longer
  accept object in `serverUrl` parameter.
- **Breaking change** Removed `AccountCallBuilder.address` method. Use
  `AccountCallBuilder.accountId` instead.
- **Breaking change** It's no longer possible to connect to insecure server in
  `Server` or `FederationServer` unless `allowHttp` flag in `opts` is set.
- Updated dependencies.

## 0.4.3

- Updated dependency (`stellar-base`).

## 0.4.2

- Updated dependencies.
- Added tests.
- Added `CHANGELOG.md` file.

## 0.4.1

- `stellar-base` bump. (c90c68f)

## 0.4.0

- **Breaking change** Bumped `stellar-base` to
  [0.5.0](https://github.com/stellar/js-stellar-base/blob/master/CHANGELOG.md#050).
  (b810aef)
