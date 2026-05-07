---
title: Core / Transactions
category: Core / Transactions
---

# Core / Transactions

## Account

Create a new Account object.

`Account` represents a single account in the Stellar network and its sequence
number. Account tracks the sequence number as it is used by {@link TransactionBuilder}. See
[Accounts](https://developers.stellar.org/docs/glossary/accounts/) for
more information about how accounts work in Stellar.

```ts
class Account
```

**Source:** [src/base/account.ts:15](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/account.ts#L15)

## AuthClawbackEnabledFlag

When set using `{@link Operation.setOptions}` option, then any trustlines
created by this account can have a ClawbackOp operation submitted for the
corresponding asset.

```ts
const AuthClawbackEnabledFlag: number
```

**Source:** [src/base/operation.ts:83](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L83)

## AuthFlag

```ts
type AuthFlag = unknown
```

**Source:** [src/base/operations/types.ts:431](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L431)

## AuthFlag

```ts
type AuthFlag = typeof AuthFlag[keyof typeof AuthFlag]
```

**Source:** [src/base/operations/types.ts:431](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L431)

## AuthImmutableFlag

When set using `{@link Operation.setOptions}` option, then none of the
authorization flags can be set and the account can never be deleted.

```ts
const AuthImmutableFlag: number
```

**Source:** [src/base/operation.ts:74](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L74)

## AuthRequiredFlag

When set using `{@link Operation.setOptions}` option, requires the issuing
account to give other accounts permission before they can hold the issuing
account’s credit.

```ts
const AuthRequiredFlag: number
```

**Source:** [src/base/operation.ts:60](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L60)

## AuthRevocableFlag

When set using `{@link Operation.setOptions}` option, allows the issuing
account to revoke its credit held by other accounts.

```ts
const AuthRevocableFlag: number
```

**Source:** [src/base/operation.ts:67](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L67)

## BASE_FEE

Minimum base fee for transactions. If this fee is below the network
minimum, the transaction will fail. The more operations in the
transaction, the greater the required fee. Use
{@link Horizon.Server.fetchBaseFee} to get an accurate value of minimum
transaction fee on the network.

```ts
const BASE_FEE: "100"
```

**Source:** [src/base/transaction_builder.ts:38](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/transaction_builder.ts#L38)

## FeeBumpTransaction

Use {@link TransactionBuilder.buildFeeBumpTransaction} to build a
FeeBumpTransaction object. If you have an object or base64-encoded string of
the transaction envelope XDR use {@link TransactionBuilder.fromXDR}.

Once a {@link FeeBumpTransaction} has been created, its attributes and operations
should not be changed. You should only add signatures (using {@link FeeBumpTransaction.sign}) before
submitting to the network or forwarding on to additional signers.

```ts
class FeeBumpTransaction
```

**Source:** [src/base/fee_bump_transaction.ts:17](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/fee_bump_transaction.ts#L17)

## Int128

```ts
class Int128 extends LargeInt
```

**Source:** [src/base/numbers/int128.ts:3](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/numbers/int128.ts#L3)

## Int256

```ts
class Int256 extends LargeInt
```

**Source:** [src/base/numbers/int256.ts:3](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/numbers/int256.ts#L3)

## Memo

`Memo` represents memos attached to transactions.

```ts
class Memo<T extends MemoType = MemoType>
```

**Source:** [src/base/memo.ts:63](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L63)

## MemoHash

Type of {@link Memo}.

```ts
const MemoHash: "hash"
```

**Source:** [src/base/memo.ts:21](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L21)

## MemoID

Type of {@link Memo}.

```ts
const MemoID: "id"
```

**Source:** [src/base/memo.ts:13](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L13)

## MemoNone

Type of {@link Memo}.

```ts
const MemoNone: "none"
```

**Source:** [src/base/memo.ts:9](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L9)

## MemoReturn

Type of {@link Memo}.

```ts
const MemoReturn: "return"
```

**Source:** [src/base/memo.ts:25](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L25)

## MemoText

Type of {@link Memo}.

```ts
const MemoText: "text"
```

**Source:** [src/base/memo.ts:17](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L17)

## MemoType

```ts
type MemoType = MemoTypeHash | MemoTypeID | MemoTypeNone | MemoTypeReturn | MemoTypeText
```

**Source:** [src/base/memo.ts:33](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L33)

## MemoType.Hash

```ts
type Hash = MemoTypeHash
```

**Source:** [src/base/memo.ts:37](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L37)

## MemoType.ID

```ts
type ID = MemoTypeID
```

**Source:** [src/base/memo.ts:35](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L35)

## MemoType.None

```ts
type None = MemoTypeNone
```

**Source:** [src/base/memo.ts:34](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L34)

## MemoType.Return

```ts
type Return = MemoTypeReturn
```

**Source:** [src/base/memo.ts:38](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L38)

## MemoType.Text

```ts
type Text = MemoTypeText
```

**Source:** [src/base/memo.ts:36](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L36)

## MemoTypeHash

```ts
type MemoTypeHash = typeof MemoHash
```

**Source:** [src/base/memo.ts:30](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L30)

## MemoTypeID

```ts
type MemoTypeID = typeof MemoID
```

**Source:** [src/base/memo.ts:28](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L28)

## MemoTypeNone

```ts
type MemoTypeNone = typeof MemoNone
```

**Source:** [src/base/memo.ts:27](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L27)

## MemoTypeReturn

```ts
type MemoTypeReturn = typeof MemoReturn
```

**Source:** [src/base/memo.ts:31](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L31)

## MemoTypeText

```ts
type MemoTypeText = typeof MemoText
```

**Source:** [src/base/memo.ts:29](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L29)

## MemoValue

```ts
type MemoValue = Buffer | string | null
```

**Source:** [src/base/memo.ts:47](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/memo.ts#L47)

## MuxedAccount

Represents a muxed account for transactions and operations.

A muxed (or *multiplexed*) account (defined rigorously in
[CAP-27](https://stellar.org/protocol/cap-27) and briefly in
[SEP-23](https://stellar.org/protocol/sep-23)) is one that resolves a single
Stellar `G...` account to many different underlying IDs.

For example, you may have a single Stellar address for accounting purposes:
  GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ

Yet would like to use it for 4 different family members:
  1: MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAAGZFQ
  2: MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAALIWQ
  3: MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAAPYHQ
  4: MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAAQLQQ

This object makes it easy to create muxed accounts from regular accounts,
duplicate them, get/set the underlying IDs, etc. without mucking around with
the raw XDR.

Because muxed accounts are purely an off-chain convention, they all share the
sequence number tied to their underlying G... account. Thus, this object
*requires* an {@link Account} instance to be passed in, so that muxed
instances of an account can collectively modify the sequence number whenever
a muxed account is used as the source of a {@link Transaction} with {@link TransactionBuilder}.

```ts
class MuxedAccount
```

**Source:** [src/base/muxed_account.ts:59](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/muxed_account.ts#L59)

## Networks

Contains passphrases for common networks:
* `Networks.PUBLIC`: `Public Global Stellar Network ; September 2015`
* `Networks.TESTNET`: `Test SDF Network ; September 2015`
* `Networks.FUTURENET`: `Test SDF Future Network ; October 2022`
* `Networks.SANDBOX`: `Local Sandbox Stellar Network ; September 2022`
* `Networks.STANDALONE`: `Standalone Network ; February 2017`

```ts
enum Networks
```

**Source:** [src/base/network.ts:9](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/network.ts#L9)

## Operation

`Operation` class represents
[operations](https://developers.stellar.org/docs/glossary/operations/) in
Stellar network.

Use one of static methods to create operations:
* `{@link Operation.createAccount}`
* `{@link Operation.payment}`
* `{@link Operation.pathPaymentStrictReceive}`
* `{@link Operation.pathPaymentStrictSend}`
* `{@link Operation.manageSellOffer}`
* `{@link Operation.manageBuyOffer}`
* `{@link Operation.createPassiveSellOffer}`
* `{@link Operation.setOptions}`
* `{@link Operation.changeTrust}`
* `{@link Operation.allowTrust}`
* `{@link Operation.accountMerge}`
* `{@link Operation.inflation}`
* `{@link Operation.manageData}`
* `{@link Operation.bumpSequence}`
* `{@link Operation.createClaimableBalance}`
* `{@link Operation.claimClaimableBalance}`
* `{@link Operation.beginSponsoringFutureReserves}`
* `{@link Operation.endSponsoringFutureReserves}`
* `{@link Operation.revokeAccountSponsorship}`
* `{@link Operation.revokeTrustlineSponsorship}`
* `{@link Operation.revokeOfferSponsorship}`
* `{@link Operation.revokeDataSponsorship}`
* `{@link Operation.revokeClaimableBalanceSponsorship}`
* `{@link Operation.revokeLiquidityPoolSponsorship}`
* `{@link Operation.revokeSignerSponsorship}`
* `{@link Operation.clawback}`
* `{@link Operation.clawbackClaimableBalance}`
* `{@link Operation.setTrustLineFlags}`
* `{@link Operation.liquidityPoolDeposit}`
* `{@link Operation.liquidityPoolWithdraw}`
* `{@link Operation.invokeHostFunction}`, which has the following additional
  "pseudo-operations" that make building host functions easier:
  - `{@link Operation.createStellarAssetContract}`
  - `{@link Operation.invokeContractFunction}`
  - `{@link Operation.createCustomContract}`
  - `{@link Operation.uploadContractWasm}`
* `{@link Operation.extendFootprintTtlOp}`
* `{@link Operation.restoreFootprint}`

```ts
class Operation
```

**Source:** [src/base/operation.ts:131](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L131)

## Operation.AccountMerge

```ts
type AccountMerge = AccountMergeResult
```

**Source:** [src/base/operation.ts:613](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L613)

## Operation.AllowTrust

```ts
type AllowTrust = AllowTrustResult
```

**Source:** [src/base/operation.ts:612](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L612)

## Operation.BaseOperation

```ts
type BaseOperation<T extends _OperationType = _OperationType> = _BaseOperation<T>
```

**Source:** [src/base/operation.ts:601](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L601)

## Operation.BeginSponsoringFutureReserves

```ts
type BeginSponsoringFutureReserves = BeginSponsoringFutureReservesResult
```

**Source:** [src/base/operation.ts:619](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L619)

## Operation.BumpSequence

```ts
type BumpSequence = BumpSequenceResult
```

**Source:** [src/base/operation.ts:616](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L616)

## Operation.ChangeTrust

```ts
type ChangeTrust = ChangeTrustResult
```

**Source:** [src/base/operation.ts:611](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L611)

## Operation.ClaimClaimableBalance

```ts
type ClaimClaimableBalance = ClaimClaimableBalanceResult
```

**Source:** [src/base/operation.ts:618](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L618)

## Operation.Clawback

```ts
type Clawback = ClawbackResult
```

**Source:** [src/base/operation.ts:631](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L631)

## Operation.ClawbackClaimableBalance

```ts
type ClawbackClaimableBalance = ClawbackClaimableBalanceResult
```

**Source:** [src/base/operation.ts:632](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L632)

## Operation.CreateAccount

```ts
type CreateAccount = CreateAccountResult
```

**Source:** [src/base/operation.ts:603](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L603)

## Operation.CreateClaimableBalance

```ts
type CreateClaimableBalance = CreateClaimableBalanceResult
```

**Source:** [src/base/operation.ts:617](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L617)

## Operation.CreatePassiveSellOffer

```ts
type CreatePassiveSellOffer = CreatePassiveSellOfferResult
```

**Source:** [src/base/operation.ts:607](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L607)

## Operation.EndSponsoringFutureReserves

```ts
type EndSponsoringFutureReserves = EndSponsoringFutureReservesResult
```

**Source:** [src/base/operation.ts:621](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L621)

## Operation.ExtendFootprintTTL

```ts
type ExtendFootprintTTL = ExtendFootprintTTLResult
```

**Source:** [src/base/operation.ts:637](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L637)

## Operation.Inflation

```ts
type Inflation = InflationResult
```

**Source:** [src/base/operation.ts:614](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L614)

## Operation.InvokeHostFunction

```ts
type InvokeHostFunction = InvokeHostFunctionResult
```

**Source:** [src/base/operation.ts:636](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L636)

## Operation.LiquidityPoolDeposit

```ts
type LiquidityPoolDeposit = LiquidityPoolDepositResult
```

**Source:** [src/base/operation.ts:634](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L634)

## Operation.LiquidityPoolWithdraw

```ts
type LiquidityPoolWithdraw = LiquidityPoolWithdrawResult
```

**Source:** [src/base/operation.ts:635](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L635)

## Operation.ManageBuyOffer

```ts
type ManageBuyOffer = ManageBuyOfferResult
```

**Source:** [src/base/operation.ts:609](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L609)

## Operation.ManageData

```ts
type ManageData = ManageDataResult
```

**Source:** [src/base/operation.ts:615](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L615)

## Operation.ManageSellOffer

```ts
type ManageSellOffer = ManageSellOfferResult
```

**Source:** [src/base/operation.ts:608](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L608)

## Operation.PathPaymentStrictReceive

```ts
type PathPaymentStrictReceive = PathPaymentStrictReceiveResult
```

**Source:** [src/base/operation.ts:605](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L605)

## Operation.PathPaymentStrictSend

```ts
type PathPaymentStrictSend = PathPaymentStrictSendResult
```

**Source:** [src/base/operation.ts:606](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L606)

## Operation.Payment

```ts
type Payment = PaymentResult
```

**Source:** [src/base/operation.ts:604](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L604)

## Operation.RestoreFootprint

```ts
type RestoreFootprint = RestoreFootprintResult
```

**Source:** [src/base/operation.ts:638](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L638)

## Operation.RevokeAccountSponsorship

```ts
type RevokeAccountSponsorship = RevokeAccountSponsorshipResult
```

**Source:** [src/base/operation.ts:622](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L622)

## Operation.RevokeClaimableBalanceSponsorship

```ts
type RevokeClaimableBalanceSponsorship = RevokeClaimableBalanceSponsorshipResult
```

**Source:** [src/base/operation.ts:626](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L626)

## Operation.RevokeDataSponsorship

```ts
type RevokeDataSponsorship = RevokeDataSponsorshipResult
```

**Source:** [src/base/operation.ts:625](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L625)

## Operation.RevokeLiquidityPoolSponsorship

```ts
type RevokeLiquidityPoolSponsorship = RevokeLiquidityPoolSponsorshipResult
```

**Source:** [src/base/operation.ts:628](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L628)

## Operation.RevokeOfferSponsorship

```ts
type RevokeOfferSponsorship = RevokeOfferSponsorshipResult
```

**Source:** [src/base/operation.ts:624](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L624)

## Operation.RevokeSignerSponsorship

```ts
type RevokeSignerSponsorship = RevokeSignerSponsorshipResult
```

**Source:** [src/base/operation.ts:630](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L630)

## Operation.RevokeTrustlineSponsorship

```ts
type RevokeTrustlineSponsorship = RevokeTrustlineSponsorshipResult
```

**Source:** [src/base/operation.ts:623](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L623)

## Operation.SetOptions

```ts
type SetOptions = SetOptionsResult<Signer>
```

**Source:** [src/base/operation.ts:610](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L610)

## Operation.SetTrustLineFlags

```ts
type SetTrustLineFlags = SetTrustLineFlagsResult
```

**Source:** [src/base/operation.ts:633](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operation.ts#L633)

## OperationOptions

```ts
type OperationOptions = AccountMergeOpts | AllowTrustOpts | BeginSponsoringFutureReservesOpts | BumpSequenceOpts | ChangeTrustOpts | ClaimClaimableBalanceOpts | ClawbackClaimableBalanceOpts | ClawbackOpts | CreateAccountOpts | CreateClaimableBalanceOpts | CreateCustomContractOpts | CreatePassiveSellOfferOpts | CreateStellarAssetContractOpts | EndSponsoringFutureReservesOpts | ExtendFootprintTtlOpts | InflationOpts | InvokeContractFunctionOpts | InvokeHostFunctionOpts | LiquidityPoolDepositOpts | LiquidityPoolWithdrawOpts | ManageBuyOfferOpts | ManageDataOpts | ManageSellOfferOpts | PathPaymentStrictReceiveOpts | PathPaymentStrictSendOpts | PaymentOpts | RestoreFootprintOpts | RevokeAccountSponsorshipOpts | RevokeClaimableBalanceSponsorshipOpts | RevokeDataSponsorshipOpts | RevokeLiquidityPoolSponsorshipOpts | RevokeOfferSponsorshipOpts | RevokeSignerSponsorshipOpts | RevokeTrustlineSponsorshipOpts | SetOptionsOpts | SetTrustLineFlagsOpts | UploadContractWasmOpts
```

**Source:** [src/base/operations/types.ts:311](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L311)

## OperationRecord

Union of all possible operation objects returned by Operation.fromXDRObject.

```ts
type OperationRecord = AccountMergeResult | AllowTrustResult | BeginSponsoringFutureReservesResult | BumpSequenceResult | ChangeTrustResult | ClaimClaimableBalanceResult | ClawbackClaimableBalanceResult | ClawbackResult | CreateAccountResult | CreateClaimableBalanceResult | CreatePassiveSellOfferResult | EndSponsoringFutureReservesResult | ExtendFootprintTTLResult | InflationResult | InvokeHostFunctionResult | LiquidityPoolDepositResult | LiquidityPoolWithdrawResult | ManageBuyOfferResult | ManageDataResult | ManageSellOfferResult | PathPaymentStrictReceiveResult | PathPaymentStrictSendResult | PaymentResult | RestoreFootprintResult | RevokeAccountSponsorshipResult | RevokeClaimableBalanceSponsorshipResult | RevokeDataSponsorshipResult | RevokeLiquidityPoolSponsorshipResult | RevokeOfferSponsorshipResult | RevokeSignerSponsorshipResult | RevokeTrustlineSponsorshipResult | SetOptionsResult<SignerOpts> | SetTrustLineFlagsResult
```

**Source:** [src/base/operations/types.ts:677](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L677)

## OperationType

```ts
type OperationType = OperationType.AccountMerge | OperationType.AllowTrust | OperationType.BeginSponsoringFutureReserves | OperationType.BumpSequence | OperationType.ChangeTrust | OperationType.ClaimClaimableBalance | OperationType.Clawback | OperationType.ClawbackClaimableBalance | OperationType.CreateAccount | OperationType.CreateClaimableBalance | OperationType.CreatePassiveSellOffer | OperationType.EndSponsoringFutureReserves | OperationType.ExtendFootprintTTL | OperationType.Inflation | OperationType.InvokeHostFunction | OperationType.LiquidityPoolDeposit | OperationType.LiquidityPoolWithdraw | OperationType.ManageBuyOffer | OperationType.ManageData | OperationType.ManageSellOffer | OperationType.PathPaymentStrictReceive | OperationType.PathPaymentStrictSend | OperationType.Payment | OperationType.RestoreFootprint | OperationType.RevokeAccountSponsorship | OperationType.RevokeClaimableBalanceSponsorship | OperationType.RevokeDataSponsorship | OperationType.RevokeLiquidityPoolSponsorship | OperationType.RevokeOfferSponsorship | OperationType.RevokeSignerSponsorship | OperationType.RevokeTrustlineSponsorship | OperationType.SetOptions | OperationType.SetTrustLineFlags
```

**Source:** [src/base/operations/types.ts:354](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L354)

## OperationType.AccountMerge

```ts
type AccountMerge = "accountMerge"
```

**Source:** [src/base/operations/types.ts:365](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L365)

## OperationType.AllowTrust

```ts
type AllowTrust = "allowTrust"
```

**Source:** [src/base/operations/types.ts:364](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L364)

## OperationType.BeginSponsoringFutureReserves

```ts
type BeginSponsoringFutureReserves = "beginSponsoringFutureReserves"
```

**Source:** [src/base/operations/types.ts:371](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L371)

## OperationType.BumpSequence

```ts
type BumpSequence = "bumpSequence"
```

**Source:** [src/base/operations/types.ts:368](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L368)

## OperationType.ChangeTrust

```ts
type ChangeTrust = "changeTrust"
```

**Source:** [src/base/operations/types.ts:363](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L363)

## OperationType.ClaimClaimableBalance

```ts
type ClaimClaimableBalance = "claimClaimableBalance"
```

**Source:** [src/base/operations/types.ts:370](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L370)

## OperationType.Clawback

```ts
type Clawback = "clawback"
```

**Source:** [src/base/operations/types.ts:383](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L383)

## OperationType.ClawbackClaimableBalance

```ts
type ClawbackClaimableBalance = "clawbackClaimableBalance"
```

**Source:** [src/base/operations/types.ts:384](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L384)

## OperationType.CreateAccount

```ts
type CreateAccount = "createAccount"
```

**Source:** [src/base/operations/types.ts:355](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L355)

## OperationType.CreateClaimableBalance

```ts
type CreateClaimableBalance = "createClaimableBalance"
```

**Source:** [src/base/operations/types.ts:369](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L369)

## OperationType.CreatePassiveSellOffer

```ts
type CreatePassiveSellOffer = "createPassiveSellOffer"
```

**Source:** [src/base/operations/types.ts:359](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L359)

## OperationType.EndSponsoringFutureReserves

```ts
type EndSponsoringFutureReserves = "endSponsoringFutureReserves"
```

**Source:** [src/base/operations/types.ts:372](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L372)

## OperationType.ExtendFootprintTTL

```ts
type ExtendFootprintTTL = "extendFootprintTtl"
```

**Source:** [src/base/operations/types.ts:389](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L389)

## OperationType.Inflation

```ts
type Inflation = "inflation"
```

**Source:** [src/base/operations/types.ts:366](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L366)

## OperationType.InvokeHostFunction

```ts
type InvokeHostFunction = "invokeHostFunction"
```

**Source:** [src/base/operations/types.ts:388](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L388)

## OperationType.LiquidityPoolDeposit

```ts
type LiquidityPoolDeposit = "liquidityPoolDeposit"
```

**Source:** [src/base/operations/types.ts:386](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L386)

## OperationType.LiquidityPoolWithdraw

```ts
type LiquidityPoolWithdraw = "liquidityPoolWithdraw"
```

**Source:** [src/base/operations/types.ts:387](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L387)

## OperationType.ManageBuyOffer

```ts
type ManageBuyOffer = "manageBuyOffer"
```

**Source:** [src/base/operations/types.ts:361](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L361)

## OperationType.ManageData

```ts
type ManageData = "manageData"
```

**Source:** [src/base/operations/types.ts:367](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L367)

## OperationType.ManageSellOffer

```ts
type ManageSellOffer = "manageSellOffer"
```

**Source:** [src/base/operations/types.ts:360](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L360)

## OperationType.PathPaymentStrictReceive

```ts
type PathPaymentStrictReceive = "pathPaymentStrictReceive"
```

**Source:** [src/base/operations/types.ts:357](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L357)

## OperationType.PathPaymentStrictSend

```ts
type PathPaymentStrictSend = "pathPaymentStrictSend"
```

**Source:** [src/base/operations/types.ts:358](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L358)

## OperationType.Payment

```ts
type Payment = "payment"
```

**Source:** [src/base/operations/types.ts:356](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L356)

## OperationType.RestoreFootprint

```ts
type RestoreFootprint = "restoreFootprint"
```

**Source:** [src/base/operations/types.ts:390](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L390)

## OperationType.RevokeAccountSponsorship

```ts
type RevokeAccountSponsorship = "revokeAccountSponsorship"
```

**Source:** [src/base/operations/types.ts:375](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L375)

## OperationType.RevokeClaimableBalanceSponsorship

```ts
type RevokeClaimableBalanceSponsorship = "revokeClaimableBalanceSponsorship"
```

**Source:** [src/base/operations/types.ts:379](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L379)

## OperationType.RevokeDataSponsorship

```ts
type RevokeDataSponsorship = "revokeDataSponsorship"
```

**Source:** [src/base/operations/types.ts:378](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L378)

## OperationType.RevokeLiquidityPoolSponsorship

```ts
type RevokeLiquidityPoolSponsorship = "revokeLiquidityPoolSponsorship"
```

**Source:** [src/base/operations/types.ts:381](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L381)

## OperationType.RevokeOfferSponsorship

```ts
type RevokeOfferSponsorship = "revokeOfferSponsorship"
```

**Source:** [src/base/operations/types.ts:377](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L377)

## OperationType.RevokeSignerSponsorship

```ts
type RevokeSignerSponsorship = "revokeSignerSponsorship"
```

**Source:** [src/base/operations/types.ts:382](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L382)

## OperationType.RevokeSponsorship

```ts
type RevokeSponsorship = "revokeSponsorship"
```

**Source:** [src/base/operations/types.ts:374](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L374)

## OperationType.RevokeTrustlineSponsorship

```ts
type RevokeTrustlineSponsorship = "revokeTrustlineSponsorship"
```

**Source:** [src/base/operations/types.ts:376](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L376)

## OperationType.SetOptions

```ts
type SetOptions = "setOptions"
```

**Source:** [src/base/operations/types.ts:362](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L362)

## OperationType.SetTrustLineFlags

```ts
type SetTrustLineFlags = "setTrustLineFlags"
```

**Source:** [src/base/operations/types.ts:385](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L385)

## ScInt

Provides an easier way to manipulate large numbers for Stellar operations.

You can instantiate this "**s**mart **c**ontract integer" value either from
bigints, strings, or numbers (whole numbers, or this will throw).

If you need to create a native BigInt from a list of integer "parts" (for
example, you have a series of encoded 32-bit integers that represent a larger
value), you can use the lower level abstraction {@link XdrLargeInt}. For
example, you could do `new XdrLargeInt('u128', bytes...).toBigInt()`.

```ts
class ScInt extends XdrLargeInt
```

**Source:** [src/base/numbers/sc_int.ts:63](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/numbers/sc_int.ts#L63)

## ScIntType

```ts
type ScIntType = "duration" | "i64" | "i128" | "i256" | "timepoint" | "u64" | "u128" | "u256"
```

**Source:** [src/base/numbers/xdr_large_int.ts:18](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/numbers/xdr_large_int.ts#L18)

## Signer

```ts
type Signer = Signer.Ed25519PublicKey | Signer.Ed25519SignedPayload | Signer.PreAuthTx | Signer.Sha256Hash
```

**Source:** [src/base/operations/types.ts:453](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L453)

## Signer.Ed25519PublicKey

```ts
interface Ed25519PublicKey
```

**Source:** [src/base/operations/types.ts:454](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L454)

## Signer.Ed25519SignedPayload

```ts
interface Ed25519SignedPayload
```

**Source:** [src/base/operations/types.ts:466](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L466)

## Signer.PreAuthTx

```ts
interface PreAuthTx
```

**Source:** [src/base/operations/types.ts:462](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L462)

## Signer.Sha256Hash

```ts
interface Sha256Hash
```

**Source:** [src/base/operations/types.ts:458](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L458)

## SorobanFees

Soroban fee parameters for resource-limited transactions.

```ts
interface SorobanFees
```

**Source:** [src/base/transaction_builder.ts:49](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/transaction_builder.ts#L49)

## TimeoutInfinite

```ts
const TimeoutInfinite: 0
```

**Source:** [src/base/transaction_builder.ts:44](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/transaction_builder.ts#L44)

## Transaction

Use {@link TransactionBuilder} to build a transaction object. If you have an
object or base64-encoded string of the transaction envelope XDR, use {@link TransactionBuilder.fromXDR}.

Once a Transaction has been created, its attributes and operations should not
be changed. You should only add signatures (using {@link Transaction.sign})
to a Transaction object before submitting to the network or forwarding on to
additional signers.

```ts
class Transaction
```

**Source:** [src/base/transaction.ts:25](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/transaction.ts#L25)

## TransactionBuilder

<p>Transaction builder helps constructs a new `{@link Transaction}` using the
given {@link Account} as the transaction's "source account". The transaction
will use the current sequence number of the given account as its sequence
number and increment the given account's sequence number by one. The given
source account must include a private key for signing the transaction or an
error will be thrown.</p>

<p>Operations can be added to the transaction via their corresponding builder
methods, and each returns the TransactionBuilder object so they can be
chained together. After adding the desired operations, call the `build()`
method on the `TransactionBuilder` to return a fully constructed
{@link Transaction} that can be signed. The returned transaction will contain the
sequence number of the source account and include the signature from the
source account.</p>

<p><strong>Be careful about unsubmitted transactions!</strong> When you build
a transaction, `stellar-sdk` automatically increments the source account's
sequence number. If you end up not submitting this transaction and submitting
another one instead, it'll fail due to the sequence number being wrong. So if
you decide not to use a built transaction, make sure to update the source
account's sequence number with
[Server.loadAccount](https://stellar.github.io/js-stellar-sdk/Server.html#loadAccount)
before creating another transaction.</p>

<p>The following code example creates a new transaction with {@link Operation.createAccount} and {@link Operation.payment} operations. The
Transaction's source account first funds `destinationA`, then sends a payment
to `destinationB`. The built transaction is then signed by
`sourceKeypair`.</p>

```
var transaction = new TransactionBuilder(source, { fee, networkPassphrase: Networks.TESTNET })
.addOperation(Operation.createAccount({
    destination: destinationA,
    startingBalance: "20"
})) // <- funds and creates destinationA
.addOperation(Operation.payment({
    destination: destinationB,
    amount: "100",
    asset: Asset.native()
})) // <- sends 100 XLM to destinationB
.setTimeout(30)
.build();

transaction.sign(sourceKeypair);
```

```ts
class TransactionBuilder
```

**Source:** [src/base/transaction_builder.ts:152](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/transaction_builder.ts#L152)

## TrustLineFlag

```ts
type TrustLineFlag = TrustLineFlag.authorize | TrustLineFlag.authorizeToMaintainLiabilities | TrustLineFlag.deauthorize
```

**Source:** [src/base/operations/types.ts:442](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L442)

## TrustLineFlag.authorize

```ts
type authorize = 1
```

**Source:** [src/base/operations/types.ts:444](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L444)

## TrustLineFlag.authorizeToMaintainLiabilities

```ts
type authorizeToMaintainLiabilities = 2
```

**Source:** [src/base/operations/types.ts:445](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L445)

## TrustLineFlag.deauthorize

```ts
type deauthorize = 0
```

**Source:** [src/base/operations/types.ts:443](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/operations/types.ts#L443)

## Uint128

```ts
class Uint128 extends LargeInt
```

**Source:** [src/base/numbers/uint128.ts:3](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/numbers/uint128.ts#L3)

## Uint256

```ts
class Uint256 extends LargeInt
```

**Source:** [src/base/numbers/uint256.ts:3](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/numbers/uint256.ts#L3)

## XdrLargeInt

A wrapper class to represent large XDR-encodable integers.

This operates at a lower level than {@link ScInt} by forcing you to specify
the type / width / size in bits of the integer you're targeting, regardless
of the input value(s) you provide.

```ts
class XdrLargeInt
```

**Source:** [src/base/numbers/xdr_large_int.ts:35](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/numbers/xdr_large_int.ts#L35)

## cereal

```ts
const cereal: { XdrReader: typeof XdrReader; XdrWriter: typeof XdrWriter }
```

**Source:** [src/base/jsxdr.ts:7](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/jsxdr.ts#L7)

## decodeAddressToMuxedAccount

Converts a Stellar address (in G... or M... form) to an `xdr.MuxedAccount`
structure, using the ed25519 representation when possible.

This supports full muxed accounts, where an `M...` address will resolve to
both its underlying `G...` address and an integer ID.

```ts
decodeAddressToMuxedAccount(address: string): MuxedAccount
```

**Source:** [src/base/util/decode_encode_muxed_account.ts:13](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/util/decode_encode_muxed_account.ts#L13)

## encodeMuxedAccount

Transform a Stellar address (G...) and an ID into its XDR representation.

```ts
encodeMuxedAccount(address: string, id: string): MuxedAccount
```

**Source:** [src/base/util/decode_encode_muxed_account.ts:52](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/util/decode_encode_muxed_account.ts#L52)

## encodeMuxedAccountToAddress

Converts an xdr.MuxedAccount to its StrKey representation.

Returns the "M..." string representation if there is a muxing ID within
the object, or the "G..." representation otherwise.

```ts
encodeMuxedAccountToAddress(muxedAccount: MuxedAccount): string
```

**Source:** [src/base/util/decode_encode_muxed_account.ts:33](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/util/decode_encode_muxed_account.ts#L33)

## extractBaseAddress

Extracts the underlying base (G...) address from an M-address.

```ts
extractBaseAddress(address: string): string
```

**Source:** [src/base/util/decode_encode_muxed_account.ts:74](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/util/decode_encode_muxed_account.ts#L74)

## scValToBigInt

Transforms an opaque {@link xdr.ScVal} into a native bigint, if possible.

If you then want to use this in the abstractions provided by this module,
you can pass it to the constructor of {@link XdrLargeInt}.

```ts
scValToBigInt(scv: ScVal): bigint
```

**Source:** [src/base/numbers/index.ts:31](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/numbers/index.ts#L31)
