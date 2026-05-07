---
title: Network / Horizon
category: Network / Horizon
---

# Network / Horizon

## Horizon.HorizonApi.AccountMergeOperationResponse

```ts
interface AccountMergeOperationResponse extends BaseOperationResponse<OperationResponseType.accountMerge, OperationResponseTypeI.accountMerge>
```

**Source:** [src/horizon/horizon_api.ts:416](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L416)

## Horizon.HorizonApi.AccountResponse

```ts
interface AccountResponse extends BaseResponse<"transactions" | "operations" | "payments" | "effects" | "offers" | "trades" | "data">
```

**Source:** [src/horizon/horizon_api.ts:167](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L167)

## Horizon.HorizonApi.AccountSigner

```ts
interface AccountSigner
```

**Source:** [src/horizon/horizon_api.ts:161](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L161)

## Horizon.HorizonApi.AccountThresholds

```ts
interface AccountThresholds
```

**Source:** [src/horizon/horizon_api.ts:150](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L150)

## Horizon.HorizonApi.AllowTrustOperationResponse

```ts
interface AllowTrustOperationResponse extends BaseOperationResponse<OperationResponseType.allowTrust, OperationResponseTypeI.allowTrust>
```

**Source:** [src/horizon/horizon_api.ts:404](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L404)

## Horizon.HorizonApi.AssetAccounts

```ts
interface AssetAccounts
```

**Source:** [src/horizon/horizon_api.ts:129](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L129)

## Horizon.HorizonApi.AssetBalances

```ts
interface AssetBalances
```

**Source:** [src/horizon/horizon_api.ts:134](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L134)

## Horizon.HorizonApi.BalanceChange

```ts
interface BalanceChange
```

**Source:** [src/horizon/horizon_api.ts:556](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L556)

## Horizon.HorizonApi.BalanceLine

```ts
type BalanceLine<T extends AssetType = AssetType> = T extends AssetType.native ? BalanceLineNative : T extends (AssetType.credit4 | AssetType.credit12) ? BalanceLineAsset<T> : T extends AssetType.liquidityPoolShares ? BalanceLineLiquidityPool : BalanceLineNative | BalanceLineAsset | BalanceLineLiquidityPool
```

**Source:** [src/horizon/horizon_api.ts:120](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L120)

## Horizon.HorizonApi.BalanceLineAsset

```ts
interface BalanceLineAsset<T extends AssetType.credit4 | AssetType.credit12 = AssetType.credit4 | AssetType.credit12>
```

**Source:** [src/horizon/horizon_api.ts:102](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L102)

## Horizon.HorizonApi.BalanceLineLiquidityPool

```ts
interface BalanceLineLiquidityPool
```

**Source:** [src/horizon/horizon_api.ts:91](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L91)

## Horizon.HorizonApi.BalanceLineNative

```ts
interface BalanceLineNative
```

**Source:** [src/horizon/horizon_api.ts:85](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L85)

## Horizon.HorizonApi.BaseOperationResponse

```ts
interface BaseOperationResponse<T extends OperationResponseType = OperationResponseType, TI extends OperationResponseTypeI = OperationResponseTypeI> extends BaseResponse<"succeeds" | "precedes" | "effects" | "transaction">
```

**Source:** [src/horizon/horizon_api.ts:259](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L259)

## Horizon.HorizonApi.BaseResponse

```ts
interface BaseResponse<T extends string = never>
```

**Source:** [src/horizon/horizon_api.ts:9](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L9)

## Horizon.HorizonApi.BeginSponsoringFutureReservesOperationResponse

```ts
interface BeginSponsoringFutureReservesOperationResponse extends BaseOperationResponse<OperationResponseType.beginSponsoringFutureReserves, OperationResponseTypeI.beginSponsoringFutureReserves>
```

**Source:** [src/horizon/horizon_api.ts:470](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L470)

## Horizon.HorizonApi.BumpFootprintExpirationOperationResponse

```ts
interface BumpFootprintExpirationOperationResponse extends BaseOperationResponse<OperationResponseType.bumpFootprintExpiration, OperationResponseTypeI.bumpFootprintExpiration>
```

**Source:** [src/horizon/horizon_api.ts:582](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L582)

## Horizon.HorizonApi.BumpSequenceOperationResponse

```ts
interface BumpSequenceOperationResponse extends BaseOperationResponse<OperationResponseType.bumpSequence, OperationResponseTypeI.bumpSequence>
```

**Source:** [src/horizon/horizon_api.ts:433](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L433)

## Horizon.HorizonApi.ChangeTrustOperationResponse

```ts
interface ChangeTrustOperationResponse extends BaseOperationResponse<OperationResponseType.changeTrust, OperationResponseTypeI.changeTrust>
```

**Source:** [src/horizon/horizon_api.ts:389](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L389)

## Horizon.HorizonApi.ClaimClaimableBalanceOperationResponse

```ts
interface ClaimClaimableBalanceOperationResponse extends BaseOperationResponse<OperationResponseType.claimClaimableBalance, OperationResponseTypeI.claimClaimableBalance>
```

**Source:** [src/horizon/horizon_api.ts:462](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L462)

## Horizon.HorizonApi.Claimant

```ts
interface Claimant
```

**Source:** [src/horizon/horizon_api.ts:447](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L447)

## Horizon.HorizonApi.ClawbackClaimableBalanceOperationResponse

```ts
interface ClawbackClaimableBalanceOperationResponse extends BaseOperationResponse<OperationResponseType.clawbackClaimableBalance, OperationResponseTypeI.clawbackClaimableBalance>
```

**Source:** [src/horizon/horizon_api.ts:511](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L511)

## Horizon.HorizonApi.ClawbackOperationResponse

```ts
interface ClawbackOperationResponse extends BaseOperationResponse<OperationResponseType.clawback, OperationResponseTypeI.clawback>
```

**Source:** [src/horizon/horizon_api.ts:500](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L500)

## Horizon.HorizonApi.CreateAccountOperationResponse

```ts
interface CreateAccountOperationResponse extends BaseOperationResponse<OperationResponseType.createAccount, OperationResponseTypeI.createAccount>
```

**Source:** [src/horizon/horizon_api.ts:272](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L272)

## Horizon.HorizonApi.CreateClaimableBalanceOperationResponse

```ts
interface CreateClaimableBalanceOperationResponse extends BaseOperationResponse<OperationResponseType.createClaimableBalance, OperationResponseTypeI.createClaimableBalance>
```

**Source:** [src/horizon/horizon_api.ts:452](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L452)

## Horizon.HorizonApi.DepositLiquidityOperationResponse

```ts
interface DepositLiquidityOperationResponse extends BaseOperationResponse<OperationResponseType.liquidityPoolDeposit, OperationResponseTypeI.liquidityPoolDeposit>
```

**Source:** [src/horizon/horizon_api.ts:533](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L533)

## Horizon.HorizonApi.EndSponsoringFutureReservesOperationResponse

```ts
interface EndSponsoringFutureReservesOperationResponse extends BaseOperationResponse<OperationResponseType.endSponsoringFutureReserves, OperationResponseTypeI.endSponsoringFutureReserves>
```

**Source:** [src/horizon/horizon_api.ts:477](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L477)

## Horizon.HorizonApi.ErrorResponseData

```ts
type ErrorResponseData = ErrorResponseData.RateLimitExceeded | ErrorResponseData.InternalServerError | ErrorResponseData.TransactionFailed
```

**Source:** [src/horizon/horizon_api.ts:630](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L630)

## Horizon.HorizonApi.ErrorResponseData.Base

```ts
interface Base
```

**Source:** [src/horizon/horizon_api.ts:636](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L636)

## Horizon.HorizonApi.ErrorResponseData.InternalServerError

```ts
interface InternalServerError extends Base
```

**Source:** [src/horizon/horizon_api.ts:648](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L648)

## Horizon.HorizonApi.ErrorResponseData.RateLimitExceeded

```ts
interface RateLimitExceeded extends Base
```

**Source:** [src/horizon/horizon_api.ts:644](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L644)

## Horizon.HorizonApi.ErrorResponseData.TransactionFailed

```ts
interface TransactionFailed extends Base
```

**Source:** [src/horizon/horizon_api.ts:652](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L652)

## Horizon.HorizonApi.FeeBumpTransactionResponse

```ts
interface FeeBumpTransactionResponse
```

**Source:** [src/horizon/horizon_api.ts:29](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L29)

## Horizon.HorizonApi.FeeDistribution

```ts
interface FeeDistribution
```

**Source:** [src/horizon/horizon_api.ts:606](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L606)

## Horizon.HorizonApi.FeeStatsResponse

```ts
interface FeeStatsResponse
```

**Source:** [src/horizon/horizon_api.ts:622](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L622)

## Horizon.HorizonApi.Flags

```ts
interface Flags
```

**Source:** [src/horizon/horizon_api.ts:155](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L155)

## Horizon.HorizonApi.InflationOperationResponse

```ts
interface InflationOperationResponse extends BaseOperationResponse<OperationResponseType.inflation, OperationResponseTypeI.inflation>
```

**Source:** [src/horizon/horizon_api.ts:422](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L422)

## Horizon.HorizonApi.InnerTransactionResponse

```ts
interface InnerTransactionResponse
```

**Source:** [src/horizon/horizon_api.ts:34](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L34)

## Horizon.HorizonApi.InvokeHostFunctionOperationResponse

```ts
interface InvokeHostFunctionOperationResponse extends BaseOperationResponse<OperationResponseType.invokeHostFunction, OperationResponseTypeI.invokeHostFunction>
```

**Source:** [src/horizon/horizon_api.ts:568](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L568)

## Horizon.HorizonApi.LiquidityPoolType

```ts
enum LiquidityPoolType
```

**Source:** [src/horizon/horizon_api.ts:197](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L197)

## Horizon.HorizonApi.ManageDataOperationResponse

```ts
interface ManageDataOperationResponse extends BaseOperationResponse<OperationResponseType.manageData, OperationResponseTypeI.manageData>
```

**Source:** [src/horizon/horizon_api.ts:426](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L426)

## Horizon.HorizonApi.ManageOfferOperationResponse

```ts
interface ManageOfferOperationResponse extends BaseOperationResponse<OperationResponseType.manageOffer, OperationResponseTypeI.manageOffer>
```

**Source:** [src/horizon/horizon_api.ts:335](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L335)

## Horizon.HorizonApi.OperationResponseType

```ts
enum OperationResponseType
```

**Source:** [src/horizon/horizon_api.ts:201](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L201)

## Horizon.HorizonApi.OperationResponseTypeI

```ts
enum OperationResponseTypeI
```

**Source:** [src/horizon/horizon_api.ts:230](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L230)

## Horizon.HorizonApi.PassiveOfferOperationResponse

```ts
interface PassiveOfferOperationResponse extends BaseOperationResponse<OperationResponseType.createPassiveOffer, OperationResponseTypeI.createPassiveOffer>
```

**Source:** [src/horizon/horizon_api.ts:350](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L350)

## Horizon.HorizonApi.PathPaymentOperationResponse

```ts
interface PathPaymentOperationResponse extends BaseOperationResponse<OperationResponseType.pathPayment, OperationResponseTypeI.pathPayment>
```

**Source:** [src/horizon/horizon_api.ts:293](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L293)

## Horizon.HorizonApi.PathPaymentStrictSendOperationResponse

```ts
interface PathPaymentStrictSendOperationResponse extends BaseOperationResponse<OperationResponseType.pathPaymentStrictSend, OperationResponseTypeI.pathPaymentStrictSend>
```

**Source:** [src/horizon/horizon_api.ts:314](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L314)

## Horizon.HorizonApi.PaymentOperationResponse

```ts
interface PaymentOperationResponse extends BaseOperationResponse<OperationResponseType.payment, OperationResponseTypeI.payment>
```

**Source:** [src/horizon/horizon_api.ts:280](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L280)

## Horizon.HorizonApi.Predicate

```ts
interface Predicate
```

**Source:** [src/horizon/horizon_api.ts:439](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L439)

## Horizon.HorizonApi.PriceR

```ts
interface PriceR
```

**Source:** [src/horizon/horizon_api.ts:140](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L140)

## Horizon.HorizonApi.PriceRShorthand

```ts
interface PriceRShorthand
```

**Source:** [src/horizon/horizon_api.ts:145](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L145)

## Horizon.HorizonApi.Reserve

```ts
interface Reserve
```

**Source:** [src/horizon/horizon_api.ts:529](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L529)

## Horizon.HorizonApi.ResponseCollection

```ts
interface ResponseCollection<T extends BaseResponse = BaseResponse>
```

**Source:** [src/horizon/horizon_api.ts:594](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L594)

## Horizon.HorizonApi.ResponseLink

```ts
interface ResponseLink
```

**Source:** [src/horizon/horizon_api.ts:5](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L5)

## Horizon.HorizonApi.RestoreFootprintOperationResponse

```ts
interface RestoreFootprintOperationResponse extends BaseOperationResponse<OperationResponseType.restoreFootprint, OperationResponseTypeI.restoreFootprint>
```

**Source:** [src/horizon/horizon_api.ts:589](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L589)

## Horizon.HorizonApi.RevokeSponsorshipOperationResponse

```ts
interface RevokeSponsorshipOperationResponse extends BaseOperationResponse<OperationResponseType.revokeSponsorship, OperationResponseTypeI.revokeSponsorship>
```

**Source:** [src/horizon/horizon_api.ts:484](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L484)

## Horizon.HorizonApi.RootResponse

```ts
interface RootResponse
```

**Source:** [src/horizon/horizon_api.ts:686](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L686)

## Horizon.HorizonApi.SetOptionsOperationResponse

```ts
interface SetOptionsOperationResponse extends BaseOperationResponse<OperationResponseType.setOptions, OperationResponseTypeI.setOptions>
```

**Source:** [src/horizon/horizon_api.ts:365](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L365)

## Horizon.HorizonApi.SetTrustLineFlagsOperationResponse

```ts
interface SetTrustLineFlagsOperationResponse extends BaseOperationResponse<OperationResponseType.setTrustLineFlags, OperationResponseTypeI.setTrustLineFlags>
```

**Source:** [src/horizon/horizon_api.ts:518](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L518)

## Horizon.HorizonApi.SubmitAsyncTransactionResponse

```ts
interface SubmitAsyncTransactionResponse
```

**Source:** [src/horizon/horizon_api.ts:23](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L23)

## Horizon.HorizonApi.SubmitTransactionResponse

```ts
interface SubmitTransactionResponse
```

**Source:** [src/horizon/horizon_api.ts:13](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L13)

## Horizon.HorizonApi.TransactionFailedExtras

```ts
interface TransactionFailedExtras
```

**Source:** [src/horizon/horizon_api.ts:677](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L677)

## Horizon.HorizonApi.TransactionFailedResultCodes

```ts
enum TransactionFailedResultCodes
```

**Source:** [src/horizon/horizon_api.ts:659](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L659)

## Horizon.HorizonApi.TransactionPreconditions

```ts
interface TransactionPreconditions
```

**Source:** [src/horizon/horizon_api.ts:40](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L40)

## Horizon.HorizonApi.TransactionResponse

```ts
interface TransactionResponse extends SubmitTransactionResponse, BaseResponse<"account" | "ledger" | "operations" | "effects" | "succeeds" | "precedes">
```

**Source:** [src/horizon/horizon_api.ts:55](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L55)

## Horizon.HorizonApi.TransactionResponseCollection

```ts
interface TransactionResponseCollection extends ResponseCollection<TransactionResponse>
```

**Source:** [src/horizon/horizon_api.ts:604](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L604)

## Horizon.HorizonApi.WithdrawLiquidityOperationResponse

```ts
interface WithdrawLiquidityOperationResponse extends BaseOperationResponse<OperationResponseType.liquidityPoolWithdraw, OperationResponseTypeI.liquidityPoolWithdraw>
```

**Source:** [src/horizon/horizon_api.ts:546](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_api.ts#L546)

## Horizon.SERVER_TIME_MAP

keep a local map of server times
(export this purely for testing purposes)

each entry will map the server domain to the last-known time and the local
time it was recorded, ex:

```ts
const SERVER_TIME_MAP: Record<string, ServerTime>
```

**Example**

```ts
"horizon-testnet.stellar.org": {
  serverTime: 1552513039,
  localTimeRecorded: 1552513052
}
```

**Source:** [src/horizon/horizon_axios_client.ts:33](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_axios_client.ts#L33)

## Horizon.Server

Server handles the network connection to a [Horizon](https://developers.stellar.org/docs/data/horizon)
instance and exposes an interface for requests to that instance.

```ts
class Server
```

**Source:** [src/horizon/server.ts:70](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server.ts#L70)

## Horizon.Server.Options

Options for configuring connections to Horizon servers.

```ts
interface Options
```

**Source:** [src/horizon/server.ts:917](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server.ts#L917)

## Horizon.Server.SubmitTransactionOptions

```ts
interface SubmitTransactionOptions
```

**Source:** [src/horizon/server.ts:934](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server.ts#L934)

## Horizon.Server.Timebounds

```ts
interface Timebounds
```

**Source:** [src/horizon/server.ts:929](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server.ts#L929)

## Horizon.ServerApi.AccountMergeOperationRecord

```ts
interface AccountMergeOperationRecord extends BaseOperationRecord<OperationResponseType.accountMerge, OperationResponseTypeI.accountMerge>, AccountMergeOperationResponse
```

**Source:** [src/horizon/server_api.ts:249](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L249)

## Horizon.ServerApi.AccountRecord

```ts
interface AccountRecord extends BaseResponse
```

**Source:** [src/horizon/server_api.ts:96](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L96)

## Horizon.ServerApi.AccountRecordSigners

```ts
type AccountRecordSigners = AccountRecordSignersType
```

**Source:** [src/horizon/server_api.ts:14](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L14)

## Horizon.ServerApi.AllowTrustOperationRecord

```ts
interface AllowTrustOperationRecord extends BaseOperationRecord<OperationResponseType.allowTrust, OperationResponseTypeI.allowTrust>, AllowTrustOperationResponse
```

**Source:** [src/horizon/server_api.ts:242](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L242)

## Horizon.ServerApi.AssetRecord

```ts
type AssetRecord = AssetRecordType
```

**Source:** [src/horizon/server_api.ts:15](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L15)

## Horizon.ServerApi.BaseOperationRecord

```ts
interface BaseOperationRecord<T extends OperationResponseType = OperationResponseType, TI extends OperationResponseTypeI = OperationResponseTypeI> extends BaseOperationResponse<T, TI>
```

**Source:** [src/horizon/server_api.ts:173](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L173)

## Horizon.ServerApi.BeginSponsoringFutureReservesOperationRecord

```ts
interface BeginSponsoringFutureReservesOperationRecord extends BaseOperationRecord<OperationResponseType.beginSponsoringFutureReserves, OperationResponseTypeI.beginSponsoringFutureReserves>, BeginSponsoringFutureReservesOperationResponse
```

**Source:** [src/horizon/server_api.ts:291](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L291)

## Horizon.ServerApi.BumpFootprintExpirationOperationRecord

```ts
interface BumpFootprintExpirationOperationRecord extends BaseOperationRecord<OperationResponseType.bumpFootprintExpiration, OperationResponseTypeI.bumpFootprintExpiration>, BumpFootprintExpirationOperationResponse
```

**Source:** [src/horizon/server_api.ts:354](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L354)

## Horizon.ServerApi.BumpSequenceOperationRecord

```ts
interface BumpSequenceOperationRecord extends BaseOperationRecord<OperationResponseType.bumpSequence, OperationResponseTypeI.bumpSequence>, BumpSequenceOperationResponse
```

**Source:** [src/horizon/server_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L270)

## Horizon.ServerApi.CallCollectionFunction

```ts
type CallCollectionFunction<T extends HorizonApi.BaseResponse = HorizonApi.BaseResponse> = (options?: CallFunctionTemplateOptions) => Promise<CollectionPage<T>>
```

**Source:** [src/horizon/server_api.ts:33](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L33)

## Horizon.ServerApi.CallFunction

```ts
type CallFunction<T extends HorizonApi.BaseResponse = HorizonApi.BaseResponse> = () => Promise<T>
```

**Source:** [src/horizon/server_api.ts:30](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L30)

## Horizon.ServerApi.CallFunctionTemplateOptions

```ts
interface CallFunctionTemplateOptions
```

**Source:** [src/horizon/server_api.ts:24](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L24)

## Horizon.ServerApi.ChangeTrustOperationRecord

```ts
interface ChangeTrustOperationRecord extends BaseOperationRecord<OperationResponseType.changeTrust, OperationResponseTypeI.changeTrust>, ChangeTrustOperationResponse
```

**Source:** [src/horizon/server_api.ts:235](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L235)

## Horizon.ServerApi.ClaimClaimableBalanceOperationRecord

```ts
interface ClaimClaimableBalanceOperationRecord extends BaseOperationRecord<OperationResponseType.claimClaimableBalance, OperationResponseTypeI.claimClaimableBalance>, ClaimClaimableBalanceOperationResponse
```

**Source:** [src/horizon/server_api.ts:284](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L284)

## Horizon.ServerApi.ClaimableBalanceRecord

```ts
interface ClaimableBalanceRecord extends BaseResponse
```

**Source:** [src/horizon/server_api.ts:87](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L87)

## Horizon.ServerApi.ClawbackClaimableBalanceOperationRecord

```ts
interface ClawbackClaimableBalanceOperationRecord extends BaseOperationRecord<OperationResponseType.clawbackClaimableBalance, OperationResponseTypeI.clawbackClaimableBalance>, ClawbackClaimableBalanceOperationResponse
```

**Source:** [src/horizon/server_api.ts:319](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L319)

## Horizon.ServerApi.ClawbackOperationRecord

```ts
interface ClawbackOperationRecord extends BaseOperationRecord<OperationResponseType.clawback, OperationResponseTypeI.clawback>, ClawbackOperationResponse
```

**Source:** [src/horizon/server_api.ts:312](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L312)

## Horizon.ServerApi.CollectionPage

```ts
interface CollectionPage<T extends HorizonApi.BaseResponse = HorizonApi.BaseResponse>
```

**Source:** [src/horizon/server_api.ts:16](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L16)

## Horizon.ServerApi.CreateAccountOperationRecord

```ts
interface CreateAccountOperationRecord extends BaseOperationRecord<OperationResponseType.createAccount, OperationResponseTypeI.createAccount>, CreateAccountOperationResponse
```

**Source:** [src/horizon/server_api.ts:183](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L183)

## Horizon.ServerApi.CreateClaimableBalanceOperationRecord

```ts
interface CreateClaimableBalanceOperationRecord extends BaseOperationRecord<OperationResponseType.createClaimableBalance, OperationResponseTypeI.createClaimableBalance>, CreateClaimableBalanceOperationResponse
```

**Source:** [src/horizon/server_api.ts:277](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L277)

## Horizon.ServerApi.DepositLiquidityOperationRecord

```ts
interface DepositLiquidityOperationRecord extends BaseOperationRecord<OperationResponseType.liquidityPoolDeposit, OperationResponseTypeI.liquidityPoolDeposit>, DepositLiquidityOperationResponse
```

**Source:** [src/horizon/server_api.ts:333](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L333)

## Horizon.ServerApi.EffectRecord

```ts
type EffectRecord = BaseEffectRecordFromTypes & EffectRecordMethods
```

**Source:** [src/horizon/server_api.ts:85](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L85)

## Horizon.ServerApi.EffectType

```ts
const EffectType: typeof EffectType
```

**Source:** [src/horizon/server_api.ts:86](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L86)

## Horizon.ServerApi.EndSponsoringFutureReservesOperationRecord

```ts
interface EndSponsoringFutureReservesOperationRecord extends BaseOperationRecord<OperationResponseType.endSponsoringFutureReserves, OperationResponseTypeI.endSponsoringFutureReserves>, EndSponsoringFutureReservesOperationResponse
```

**Source:** [src/horizon/server_api.ts:298](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L298)

## Horizon.ServerApi.InflationOperationRecord

```ts
interface InflationOperationRecord extends BaseOperationRecord<OperationResponseType.inflation, OperationResponseTypeI.inflation>, InflationOperationResponse
```

**Source:** [src/horizon/server_api.ts:256](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L256)

## Horizon.ServerApi.InvokeHostFunctionOperationRecord

```ts
interface InvokeHostFunctionOperationRecord extends BaseOperationRecord<OperationResponseType.invokeHostFunction, OperationResponseTypeI.invokeHostFunction>, InvokeHostFunctionOperationResponse
```

**Source:** [src/horizon/server_api.ts:347](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L347)

## Horizon.ServerApi.LedgerRecord

```ts
interface LedgerRecord extends BaseResponse
```

**Source:** [src/horizon/server_api.ts:145](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L145)

## Horizon.ServerApi.LiquidityPoolRecord

```ts
interface LiquidityPoolRecord extends BaseResponse
```

**Source:** [src/horizon/server_api.ts:126](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L126)

## Horizon.ServerApi.ManageDataOperationRecord

```ts
interface ManageDataOperationRecord extends BaseOperationRecord<OperationResponseType.manageData, OperationResponseTypeI.manageData>, ManageDataOperationResponse
```

**Source:** [src/horizon/server_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L263)

## Horizon.ServerApi.ManageOfferOperationRecord

```ts
interface ManageOfferOperationRecord extends BaseOperationRecord<OperationResponseType.manageOffer, OperationResponseTypeI.manageOffer>, ManageOfferOperationResponse
```

**Source:** [src/horizon/server_api.ts:214](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L214)

## Horizon.ServerApi.OfferRecord

```ts
type OfferRecord = OfferRecordType
```

**Source:** [src/horizon/server_api.ts:13](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L13)

## Horizon.ServerApi.OperationRecord

```ts
type OperationRecord = CreateAccountOperationRecord | PaymentOperationRecord | PathPaymentOperationRecord | ManageOfferOperationRecord | PassiveOfferOperationRecord | SetOptionsOperationRecord | ChangeTrustOperationRecord | AllowTrustOperationRecord | AccountMergeOperationRecord | InflationOperationRecord | ManageDataOperationRecord | BumpSequenceOperationRecord | PathPaymentStrictSendOperationRecord | CreateClaimableBalanceOperationRecord | ClaimClaimableBalanceOperationRecord | BeginSponsoringFutureReservesOperationRecord | EndSponsoringFutureReservesOperationRecord | RevokeSponsorshipOperationRecord | ClawbackClaimableBalanceOperationRecord | ClawbackOperationRecord | SetTrustLineFlagsOperationRecord | DepositLiquidityOperationRecord | WithdrawLiquidityOperationRecord | InvokeHostFunctionOperationRecord | BumpFootprintExpirationOperationRecord | RestoreFootprintOperationRecord
```

**Source:** [src/horizon/server_api.ts:369](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L369)

## Horizon.ServerApi.OrderbookRecord

```ts
interface OrderbookRecord extends BaseResponse
```

**Source:** [src/horizon/server_api.ts:456](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L456)

## Horizon.ServerApi.PassiveOfferOperationRecord

```ts
interface PassiveOfferOperationRecord extends BaseOperationRecord<OperationResponseType.createPassiveOffer, OperationResponseTypeI.createPassiveOffer>, PassiveOfferOperationResponse
```

**Source:** [src/horizon/server_api.ts:221](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L221)

## Horizon.ServerApi.PathPaymentOperationRecord

```ts
interface PathPaymentOperationRecord extends BaseOperationRecord<OperationResponseType.pathPayment, OperationResponseTypeI.pathPayment>, PathPaymentOperationResponse
```

**Source:** [src/horizon/server_api.ts:200](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L200)

## Horizon.ServerApi.PathPaymentStrictSendOperationRecord

```ts
interface PathPaymentStrictSendOperationRecord extends BaseOperationRecord<OperationResponseType.pathPaymentStrictSend, OperationResponseTypeI.pathPaymentStrictSend>, PathPaymentStrictSendOperationResponse
```

**Source:** [src/horizon/server_api.ts:207](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L207)

## Horizon.ServerApi.PaymentOperationRecord

```ts
interface PaymentOperationRecord extends BaseOperationRecord<OperationResponseType.payment, OperationResponseTypeI.payment>, PaymentOperationResponse
```

**Source:** [src/horizon/server_api.ts:190](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L190)

## Horizon.ServerApi.PaymentPathRecord

```ts
interface PaymentPathRecord extends BaseResponse
```

**Source:** [src/horizon/server_api.ts:476](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L476)

## Horizon.ServerApi.RestoreFootprintOperationRecord

```ts
interface RestoreFootprintOperationRecord extends BaseOperationRecord<OperationResponseType.restoreFootprint, OperationResponseTypeI.restoreFootprint>, RestoreFootprintOperationResponse
```

**Source:** [src/horizon/server_api.ts:361](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L361)

## Horizon.ServerApi.RevokeSponsorshipOperationRecord

```ts
interface RevokeSponsorshipOperationRecord extends BaseOperationRecord<OperationResponseType.revokeSponsorship, OperationResponseTypeI.revokeSponsorship>, RevokeSponsorshipOperationResponse
```

**Source:** [src/horizon/server_api.ts:305](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L305)

## Horizon.ServerApi.SetOptionsOperationRecord

```ts
interface SetOptionsOperationRecord extends BaseOperationRecord<OperationResponseType.setOptions, OperationResponseTypeI.setOptions>, SetOptionsOperationResponse
```

**Source:** [src/horizon/server_api.ts:228](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L228)

## Horizon.ServerApi.SetTrustLineFlagsOperationRecord

```ts
interface SetTrustLineFlagsOperationRecord extends BaseOperationRecord<OperationResponseType.setTrustLineFlags, OperationResponseTypeI.setTrustLineFlags>, SetTrustLineFlagsOperationResponse
```

**Source:** [src/horizon/server_api.ts:326](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L326)

## Horizon.ServerApi.TradeRecord

```ts
type TradeRecord = TradeRecord.Orderbook | TradeRecord.LiquidityPool
```

**Source:** [src/horizon/server_api.ts:397](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L397)

## Horizon.ServerApi.TradeRecord.LiquidityPool

```ts
interface LiquidityPool extends Base
```

**Source:** [src/horizon/server_api.ts:431](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L431)

## Horizon.ServerApi.TradeRecord.Orderbook

```ts
interface Orderbook extends Base
```

**Source:** [src/horizon/server_api.ts:421](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L421)

## Horizon.ServerApi.TradeType

```ts
enum TradeType
```

**Source:** [src/horizon/server_api.ts:135](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L135)

## Horizon.ServerApi.TransactionRecord

```ts
interface TransactionRecord extends Omit<HorizonApi.TransactionResponse, "ledger">
```

**Source:** [src/horizon/server_api.ts:442](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L442)

## Horizon.ServerApi.WithdrawLiquidityOperationRecord

```ts
interface WithdrawLiquidityOperationRecord extends BaseOperationRecord<OperationResponseType.liquidityPoolWithdraw, OperationResponseTypeI.liquidityPoolWithdraw>, WithdrawLiquidityOperationResponse
```

**Source:** [src/horizon/server_api.ts:340](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/server_api.ts#L340)

## Horizon.getCurrentServerTime

Given a hostname, get the current time of that server (i.e., use the last-
recorded server time and offset it by the time since then.) If there IS no
recorded server time, or it's been 5 minutes since the last, return null.

```ts
getCurrentServerTime(hostname: string): number | null
```

**Parameters**

- `hostname` — Hostname of a Horizon server.

**Returns**

The UNIX timestamp (in seconds, not milliseconds)
representing the current time on that server, or `null` if we don't have
a record of that time.

**Source:** [src/horizon/horizon_axios_client.ts:96](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/horizon/horizon_axios_client.ts#L96)
