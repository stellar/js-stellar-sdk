# Changelog

A breaking change will get clearly marked in this log.

## [v7.0.0](https://github.com/stellar/js-stellar-sdk/compare/v6.2.0...v7.0.0)

This release includes a major-version increase due to breaking changes included.

### Breaking

- Updates the SEP-10 utility function parameters and return values to support [SEP-10 v3.0](https://github.com/stellar/stellar-protocol/commit/9d121f98fd2201a5edfe0ed2befe92f4bf88bfe4)
  - The following functions replaced the `homeDomain` parameter with `homeDomains` (note: plural):
    - `utils.readChallengeTx()`
    - `utils.verifyChallengeTxThreshold()`
    - `utils.verifyChallengeTxSigners()`
  - `utils.readChallengeTx()` now returns an additional object attribute, `matchedHomeDomain`

## Update

- Update challenge transaction helpers for SEP0010 v3.0.0. ([#596](https://github.com/stellar/js-stellar-sdk/pull/596))
   * Restore `homeDomain` validation in `readChallengeTx()`.

## [v6.2.0](https://github.com/stellar/js-stellar-sdk/compare/v6.1.0...v6.2.0)

### Update

- Update challenge transaction helpers for SEP0010 v2.1.0. ([#581](https://github.com/stellar/js-stellar-sdk/issues/581))
   * Remove verification of home domain.
   * Allow additional manage data operations that have the source account set as the server key.

## [v6.1.0](https://github.com/stellar/js-stellar-sdk/compare/v6.0.0...v6.1.0)

### Update

- Update claim predicate fields to match Horizon 1.9.1 ([#575](https://github.com/stellar/js-stellar-sdk/pull/575)).

## [v6.0.0](https://github.com/stellar/js-stellar-sdk/compare/v5.0.4...v6.0.0)

### Add

- Add support for claimable balances ([#572](https://github.com/stellar/js-stellar-sdk/pull/572)).
Extend server class to allow loading claimable balances from Horizon. The following functions are available:

```
server.claimableBalances();
server.claimableBalances().claimant(claimant);
server.claimableBalances().sponsor(sponsorID);
server.claimableBalances().asset(asset);
server.claimableBalances().claimableBalance(balanceID);
```
-  Add the following attributes to `AccountResponse` ([#572](https://github.com/stellar/js-stellar-sdk/pull/572)):
    * `sponsor?: string`
    * `num_sponsoring: number`
    * `num_sponsored: number`

- Add the optional attribute `sponsor` to `AccountSigner`, `BalanceLineAsset`, `ClaimableBalanceRecord`, and `OfferRecord` ([#572](https://github.com/stellar/js-stellar-sdk/pull/572)).

- Add `sponsor` filtering support for `offers` and `accounts` ([#572](https://github.com/stellar/js-stellar-sdk/pull/572)).
    * `server.offers().sponsor(accountID)`
    * `server.accounts().sponsor(accountID)`

- Extend operation responses to support new operations ([#572](https://github.com/stellar/js-stellar-sdk/pull/572)).
    * `create_claimable_balance` with the following fields:
        * `asset` - asset available to be claimed (in canonical form),
        * `amount` - amount available to be claimed,
        * `claimants` - list of claimants with predicates (see below):
            * `destination` - destination account ID,
            * `predicate` - predicate required to claim a balance (see below).
    * `claim_claimable_balance` with the following fields:
        * `balance_id` - unique ID of balance to be claimed,
        * `claimant` - account ID of a claimant.
    * `begin_sponsoring_future_reserves` with the following fields:
        * `sponsored_id` - account ID for which future reserves will be sponsored.
    * `end_sponsoring_future_reserves` with the following fields:
        * `begin_sponsor` - account sponsoring reserves.
    * `revoke_sponsorship` with the following fields:
        * `account_id` - if account sponsorship was revoked,
        * `claimable_balance_id` - if claimable balance sponsorship was revoked,
        * `data_account_id` - if account data sponsorship was revoked,
        * `data_name` - if account data sponsorship was revoked,
        * `offer_id` - if offer sponsorship was revoked,
        * `trustline_account_id` - if trustline sponsorship was revoked,
        * `trustline_asset` - if trustline sponsorship was revoked,
        * `signer_account_id` - if signer sponsorship was revoked,
        * `signer_key` - if signer sponsorship was revoked.

- Extend effect responses to support new effects ([#572](https://github.com/stellar/js-stellar-sdk/pull/572)).
    * `claimable_balance_created` with the following fields:
        * `balance_id` - unique ID of claimable balance,
        * `asset` - asset available to be claimed (in canonical form),
        * `amount` - amount available to be claimed.
    * `claimable_balance_claimant_created` with the following fields:
        * `balance_id` - unique ID of a claimable balance,
        * `asset` - asset available to be claimed (in canonical form),
        * `amount` - amount available to be claimed,
        * `predicate` - predicate required to claim a balance (see below).
    * `claimable_balance_claimed` with the following fields:
        * `balance_id` - unique ID of a claimable balance,
        * `asset` - asset available to be claimed (in canonical form),
        * `amount` - amount available to be claimed,
    * `account_sponsorship_created` with the following fields:
        * `sponsor` - sponsor of an account.
    * `account_sponsorship_updated` with the following fields:
        * `new_sponsor` - new sponsor of an account,
        * `former_sponsor` - former sponsor of an account.
    * `account_sponsorship_removed` with the following fields:
        * `former_sponsor` - former sponsor of an account.
    * `trustline_sponsorship_created` with the following fields:
        * `sponsor` - sponsor of a trustline.
    * `trustline_sponsorship_updated` with the following fields:
        * `new_sponsor` - new sponsor of a trustline,
        * `former_sponsor` - former sponsor of a trustline.
    * `trustline_sponsorship_removed` with the following fields:
        * `former_sponsor` - former sponsor of a trustline.
    * `claimable_balance_sponsorship_created` with the following fields:
        * `sponsor` - sponsor of a claimable balance.
    * `claimable_balance_sponsorship_updated` with the following fields:
        * `new_sponsor` - new sponsor of a claimable balance,
        * `former_sponsor` - former sponsor of a claimable balance.
    * `claimable_balance_sponsorship_removed` with the following fields:
        * `former_sponsor` - former sponsor of a claimable balance.
    * `signer_sponsorship_created` with the following fields:
        * `signer` - signer being sponsored.
        * `sponsor` - signer sponsor.
    * `signer_sponsorship_updated` with the following fields:
        * `signer` - signer being sponsored.
        * `former_sponsor` - the former sponsor of the signer.
        * `new_sponsor` - the new sponsor of the signer.
    * `signer_sponsorship_removed` with the following fields:
        * `former_sponsor` - former sponsor of a signer.

### Breaking

- Update `stellar-base` to `v4.0.0` which introduces a breaking change in the internal XDR library.

The following functions were renamed:

- `xdr.OperationBody.setOption()` -> `xdr.OperationBody.setOptions()`
- `xdr.OperationBody.manageDatum()` -> `xdr.OperationBody.manageData()`
- `xdr.OperationType.setOption()` -> `xdr.OperationType.setOptions()`
- `xdr.OperationType.manageDatum()` -> `xdr.OperationType.manageData()`

The following enum values were rename in `OperationType`:

- `setOption` -> `setOptions`
- `manageDatum` -> `manageData`


## [v5.0.4](https://github.com/stellar/js-stellar-sdk/compare/v5.0.3...v5.0.4)

### Update
- Add `tx_set_operation_count` to `ledger` resource ([#559](https://github.com/stellar/js-stellar-sdk/pull/559)).

## [v5.0.3](https://github.com/stellar/js-stellar-sdk/compare/v5.0.2...v5.0.3)

### Fix
- Fix regression on `server.offer().forAccount()` which wasn't allowing streaming ([#533](https://github.com/stellar/js-stellar-sdk/pull/553)).

## [v5.0.2](https://github.com/stellar/js-stellar-sdk/compare/v5.0.1...v5.0.2)

### Update

- Allow submitTransaction to receive a FeeBumpTransaction ([#548](https://github.com/stellar/js-stellar-sdk/pull/548)).

## [v5.0.1](https://github.com/stellar/js-stellar-sdk/compare/v5.0.0...v5.0.1)

### Update

- Skip SEP0029 (memo required check) for multiplexed accounts ([#538](https://github.com/stellar/js-stellar-sdk/pull/538)).

### Fix
- Fix missing documentation for `stellar-base` ([#544](https://github.com/stellar/js-stellar-sdk/pull/544)).
- Move dom-monkeypatch to root types and publish to npm ([#543](https://github.com/stellar/js-stellar-sdk/pull/543)).

## [v5.0.0](https://github.com/stellar/js-stellar-sdk/compare/v4.1.0...v5.0.0)

### Add
- Add fee bump related attributes to `TransactionResponse` ([#532](https://github.com/stellar/js-stellar-sdk/pull/532)):
    - `fee_account: string`.
    - `fee_bump_transaction: FeeBumpTransactionResponse`:
      ```js
      interface FeeBumpTransactionResponse {
        hash: string;
        signatures: string[];
      }
      ```
    - `inner_transaction: InnerTransactionResponse`:
      ```js
      interface InnerTransactionResponse {
        hash: string;
        signatures: string[];
        max_fee: string;
      }
      ```
- Add `memo_bytes: string` to `TransactionResponse` ([#532](https://github.com/stellar/js-stellar-sdk/pull/532)).
- Add `authorize_to_maintain_liabilities: boolean` to `AllowTrustOperation` ([#532](https://github.com/stellar/js-stellar-sdk/pull/532)).
- Add `is_authorized_to_maintain_liabilities: boolean` to `BalanceLineNative` ([#532](https://github.com/stellar/js-stellar-sdk/pull/532)).
- Add new result codes to `TransactionFailedResultCodes` ([#531](https://github.com/stellar/js-stellar-sdk/pull/531)).
  ```js
  TX_FEE_BUMP_INNER_SUCCESS = "tx_fee_bump_inner_success",
  TX_FEE_BUMP_INNER_FAILED = "tx_fee_bump_inner_failed",
  TX_NOT_SUPPORTED = "tx_not_supported",
  TX_SUCCESS = "tx_success",
  TX_TOO_EARLY = "tx_too_early",
  TX_TOO_LATE = "tx_too_late",
  TX_MISSING_OPERATION = "tx_missing_operation",
  TX_INSUFFICIENT_BALANCE = "tx_insufficient_balance",
  TX_NO_SOURCE_ACCOUNT = "tx_no_source_account",
  TX_INSUFFICIENT_FEE = "tx_insufficient_fee",
  TX_INTERNAL_ERROR = "tx_internal_error",
  ```

### Breaking changes
- The attributes `max_fee` and `fee_charged` in `TransactionResponse` can be now a `number` or a `string`.
  Update your code to handle both types since Horizon will start sending `string` in version `1.3.0` ([#528](https://github.com/stellar/js-stellar-sdk/pull/528)).
- Bump `stellar-base` to `v3.0.0`: This new version of stellar-base brings support for protocol 13, including multiple breaking changes which might affect your code, please review the list of breaking changes in [stellar-base@3.0.0](https://github.com/stellar/js-stellar-base/releases/tag/v3.0.0) release ([#524](https://github.com/stellar/js-stellar-sdk/pull/524)).
- Make `networkPassphrase` a required argument in `Utils.buildChallengeTx` and  `Utils.readChallengeTx` ([#524](https://github.com/stellar/js-stellar-sdk/pull/524)).
- Remove `Server.paths` ([#525](https://github.com/stellar/js-stellar-sdk/pull/525)).

## [v5.0.0-alpha.2](https://github.com/stellar/js-stellar-sdk/compare/v5.0.0-alpha.1..v5.0.0-alpha.2)

### Update
- Update `stellar-base` to `v3.0.0-alpha-1`.

## [v5.0.0-alpha.1](https://github.com/stellar/js-stellar-sdk/compare/v4.1.0...v5.0.0-alpha.1)

### Breaking changes
- Bump `stellar-base` to `v3.0.0-alpha-0`: This new version of stellar-base brings support for protocol 13, including multiple breaking changes which might affect your code, please review the list of breaking changes in [stellar-base@3.0.0-alpha.0](https://github.com/stellar/js-stellar-base/releases/tag/v3.0.0-alpha.0) release ([#524](https://github.com/stellar/js-stellar-sdk/pull/524)).
- Make `networkPassphrase` a required argument in `Utils.buildChallengeTx` and  `Utils.readChallengeTx` ([#524](https://github.com/stellar/js-stellar-sdk/pull/524)).
- Remove `Server.paths` ([#525](https://github.com/stellar/js-stellar-sdk/pull/525)).

## [v4.1.0](https://github.com/stellar/js-stellar-sdk/compare/v4.0.2...v4.1.0)

### Add
- Add SEP0029 (memo required) support. ([#516](https://github.com/stellar/js-stellar-sdk/issues/516))

  Extends `server.submitTransaction` to always run a memo required check before
  sending the transaction.  If any of the destinations require a memo and the
  transaction doesn't include one, then an `AccountRequiresMemoError` will be thrown.

  You can skip this check by passing `{skipMemoRequiredCheck: true}` to `server.submitTransaction`:

  ```
  server.submitTransaction(tx, {skipMemoRequiredCheck: true})
  ```

  The check runs for each operation of type:
   - `payment`
   - `pathPaymentStrictReceive`
   - `pathPaymentStrictSend`
   - `mergeAccount`

  If the transaction includes a memo, then memo required checking is skipped.

  See [SEP0029](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0029.md) for more information about memo required check.

## [v4.0.2](https://github.com/stellar/js-stellar-sdk/compare/v4.0.1...v4.0.2)

### Fix
- Fix URI TypeScript reference. ([#509](https://github.com/stellar/js-stellar-sdk/issues/509))
- Fix docs build. ([#503](https://github.com/stellar/js-stellar-sdk/issues/503))
- Fix documentation for method to filter offers by account. ([#507](https://github.com/stellar/js-stellar-sdk/issues/507))
- Fix types and add missing attribute to `account_response`. ([#504](https://github.com/stellar/js-stellar-sdk/issues/504))

## [v4.0.1](https://github.com/stellar/js-stellar-sdk/compare/v4.0.0...v4.0.1)

### Add
- Add `.offer` method to `OfferCallBuilder` which allows fetching a single offer by ID. ([#499](https://github.com/stellar/js-stellar-sdk/issues/499))

### Fix
- Fix broken link to Stellar logo+wordmark. ([#496](https://github.com/stellar/js-stellar-sdk/issues/496))
- Fix `_link` omition for AccountResponse class. ([#495](https://github.com/stellar/js-stellar-sdk/issues/495))

### Update
- Update challenge transaction helpers for SEP0010. ([#497](https://github.com/stellar/js-stellar-sdk/issues/497))

## [v4.0.0](https://github.com/stellar/js-stellar-sdk/compare/v3.3.0...v4.0.0)

### Added
- Add support for top-level offers endpoint with `seller`, `selling`, and `buying` filter. ([#485](https://github.com/stellar/js-stellar-sdk/issues/485))
  Horizon 1.0 includes a new `/offers` end-point, which allows you to list all offers, supporting filtering by `seller`, `selling`, or `buying` asset.

  You can fetch data from this endpoint by doing `server.offers()` and use any of the following filters:

  - `seller`: `server.offers().forAccount(accountId)`
  - `buying`: `server.offers().buying(asset)`
  - `selling`: `server.offers().selling(asset)`

  This introduced a breaking change since it modified the signature for the function `server.offers()`.

  Before, if you wanted to list all the offers for a given account, you'd do:

  ```
  server.offers('accounts', accountID)
  ```

  Starting on this version you'll need to do:

  ```
  server.offers().forAccount(accountId)
  ```

  You can do now things that were not possible before, like finding
  all offers for an account filtering by the selling or buying asset

  ```
  server.offers().forAccount(accountId).selling(assetA).buying(assetB)
  ```

- Add support for filtering accounts by `signer` or `asset` ([#474](https://github.com/stellar/js-stellar-sdk/issues/474))
  Horizon 1.0 includes a new `/accounts` end-point, which allows you to list all accounts who have another account as a signer or hold a given asset.

  You can fetch data from this endpoint by doing `server.accounts()` and use any of the following filters:

  - `accountID`: `server.accounts().accountId(accountId)`, returns a single account.
  - `forSigner`: `server.accounts().forSigner(accountId)`, returns accounts where `accountId` is a signer.
  - `forAsset`: `server.accounts().forAsset(asset)`, returns accounts which hold the `asset`.

- Add TypeScript typings for new fields in `fee_stats`. ([#462](https://github.com/stellar/js-stellar-sdk/issues/462))


### Changed
- Changed TypeScript typing for multiple operations "type", it will match the new value on Horizon. ([#477](https://github.com/stellar/js-stellar-sdk/issues/477))

### Fixed
- Fix fetchTimebounds() ([#487](https://github.com/stellar/js-stellar-sdk/issues/487))
- Clone the passed URI in CallBuilder constructor, to not mutate the outside ref ([#473](https://github.com/stellar/js-stellar-sdk/issues/473))
- Use axios CancelToken to ensure timeout ([#482](https://github.com/stellar/js-stellar-sdk/issues/482))

### Breaking
- Remove `fee_paid` field from transaction response. ([#476](https://github.com/stellar/js-stellar-sdk/issues/476))
- Remove all `*_accepted_fee` from FeeStatsResponse. ([#463](https://github.com/stellar/js-stellar-sdk/issues/463))
- Change function signature for `server.offers`. ([#485](https://github.com/stellar/js-stellar-sdk/issues/485))
  The signature for the function `server.offers()` was changed to bring suppport for other filters.

  Before, if you wanted to list all the offers for a given account, you'd do:

  ```
  server.offers('accounts', accountID)
  ```

  Starting on this version you'll need to do:

  ```
  server.offers().accountId(accountId)
  ```


## [v3.3.0](https://github.com/stellar/js-stellar-sdk/compare/v3.2.0...v3.3.0)

### Deprecated ⚠️

- Horizon 0.25.0 will change the data type for multiple attributes from `Int64` to
  `string`. When the JSON payload includes an `Int64`, there are
  scenarios where large number data can be incorrectly parsed, since JavaScript doesn't support
  `Int64` values. You can read more about it in [#1363](https://github.com/stellar/go/issues/1363).

  This release extends the data types for the following attributes to be of type `string` or `number`:

  - `EffectRecord#offer_id`
  - `EffectRecord#new_seq`
  - `OfferRecord#id`
  - `TradeAggregationRecord#timestamp`
  - `TradeAggregationRecord#trade_count`
  - `ManageOfferOperationResponse#offer_id`
  - `PassiveOfferOperationResponse#offer_id`

  We recommend you update your code to handle both `string` or `number` in
  the fields listed above, so that once Horizon 0.25.0 is released, your application
  will be able to handle the new type without breaking.

## [v3.2.0](https://github.com/stellar/js-stellar-sdk/compare/v3.1.2...v3.2.0)

### Add ➕

- Add `fee_charged` an `max_fee` to `TransactionResponse` interface. ([455](https://github.com/stellar/js-stellar-sdk/pull/455))

### Deprecated ⚠️

- Horizon 0.25 will stop sending the property `fee_paid` in the transaction response. Use `fee_charged` and `max_fee`, read more about it in [450](https://github.com/stellar/js-stellar-sdk/issues/450).

## [v3.1.2](https://github.com/stellar/js-stellar-sdk/compare/v3.1.1...v3.1.2)

### Change

- Upgrade `stellar-base` to `v2.1.2`. ([452](https://github.com/stellar/js-stellar-sdk/pull/452))

## [v3.1.1](https://github.com/stellar/js-stellar-sdk/compare/v3.1.0...v3.1.1)

### Change ⚠️

- Change arguments on [server.strictReceivePaths](https://stellar.github.io/js-stellar-sdk/Server.html#strictReceivePaths) since we included `destinationAccount` as an argument, but it is not longer required by Horizon. ([477](https://github.com/stellar/js-stellar-sdk/pull/447))

## [v3.1.0](https://github.com/stellar/js-stellar-sdk/compare/v3.0.0...v3.1.0)

### Add ➕

- Add `server.strictReceivePaths` which adds support for `/paths/strict-receive`. ([444](https://github.com/stellar/js-stellar-sdk/pull/444))
  This function takes a list of source assets or a source address, a destination
  address, a destination asset and a destination amount.

  You can call it passing a list of source assets:

  ```
  server.strictReceivePaths(sourceAssets,destinationAsset, destinationAmount)
  ```

  Or a by passing a Stellar source account address:

  ```
  server.strictReceivePaths(sourceAccount,destinationAsset, destinationAmount)
  ```

  When you call this function with a Stellar account address, it will look at the account’s trustlines and use them to determine all payment paths that can satisfy the desired amount.

- Add `server.strictSendPaths` which adds support for `/paths/strict-send`. ([444](https://github.com/stellar/js-stellar-sdk/pull/444))
  This function takes the asset you want to send, and the amount of that asset,
  along with either a list of destination assets or a destination address.

  You can call it passing a list of destination assets:

  ```
  server.strictSendPaths(sourceAsset, sourceAmount, [destinationAsset]).call()
  ```

  Or a by passing a Stellar account address:

  ```
  server.strictSendPaths(sourceAsset, sourceAmount, "GDRREYWHQWJDICNH4SAH4TT2JRBYRPTDYIMLK4UWBDT3X3ZVVYT6I4UQ").call()
  ```

  When you call this function with a Stellar account address, it will look at the account’s trustlines and use them to determine all payment paths that can satisfy the desired amount.

### Deprecated ⚠️

- [Server#paths](https://stellar.github.io/js-stellar-sdk/Server.html#paths) is deprecated in favor of [Server#strictReceivePaths](https://stellar.github.io/js-stellar-sdk/Server.html#strictReceivePaths). ([444](https://github.com/stellar/js-stellar-sdk/pull/444))

## [v3.0.1](https://github.com/stellar/js-stellar-sdk/compare/v3.0.0...v3.0.1)

### Add
- Add join method to call builder. ([#436](https://github.com/stellar/js-stellar-sdk/issues/436))

## [v3.0.0](https://github.com/stellar/js-stellar-sdk/compare/v2.3.0...v3.0.0)

### BREAKING CHANGES ⚠

- Drop Support for Node 6 since it has been end-of-lifed and no longer in LTS. We now require Node 10 which is the current LTS until April 1st, 2021. ([#424](https://github.com/stellar/js-stellar-sdk/pull/424)

## [v2.3.0](https://github.com/stellar/js-stellar-sdk/compare/v2.2.3...v2.3.0)

### Add
- Add feeStats support. ([#409](https://github.com/stellar/js-stellar-sdk/issues/409))

### Fix
- Fix Util.verifyChallengeTx documentation ([#405](https://github.com/stellar/js-stellar-sdk/issues/405))
- Fix: listen to stream events with addEventListener ([#408](https://github.com/stellar/js-stellar-sdk/issues/408))

## [v2.2.3](https://github.com/stellar/js-stellar-sdk/compare/v2.2.2...v2.2.3)

### Fix
- Fix ServerApi's OrderbookRecord type ([#401](https://github.com/stellar/js-stellar-sdk/issues/401))

### Set
- Set `name` in custom errors ([#403](https://github.com/stellar/js-stellar-sdk/issues/403))

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
