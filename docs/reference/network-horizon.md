---
title: Network / Horizon
---

# Network / Horizon

## Horizon.HorizonApi.AccountMergeOperationResponse

```ts
interface AccountMergeOperationResponse extends BaseOperationResponse<OperationResponseType.accountMerge, OperationResponseTypeI.accountMerge> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  id: string;
  into: string;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: accountMerge;
  type_i: accountMerge;
}
```

**Source:** [src/horizon/horizon_api.ts:416](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L416)

### `accountMergeOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `accountMergeOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `accountMergeOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `accountMergeOperationResponse.into`

```ts
into: string;
```

**Source:** [src/horizon/horizon_api.ts:420](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L420)

### `accountMergeOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `accountMergeOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `accountMergeOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `accountMergeOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `accountMergeOperationResponse.type`

```ts
type: accountMerge;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `accountMergeOperationResponse.type_i`

```ts
type_i: accountMerge;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.AccountResponse

```ts
interface AccountResponse extends BaseResponse<"transactions" | "operations" | "payments" | "effects" | "offers" | "trades" | "data"> {
  _links: { data: ResponseLink; effects: ResponseLink; offers: ResponseLink; operations: ResponseLink; payments: ResponseLink; self: ResponseLink; trades: ResponseLink; transactions: ResponseLink };
  account_id: string;
  balances: (BalanceLineNative | BalanceLineLiquidityPool | BalanceLineAsset<"credit_alphanum4"> | BalanceLineAsset<"credit_alphanum12">)[];
  data: { [key: string]: string };
  flags: Flags;
  id: string;
  last_modified_ledger: number;
  last_modified_time: string;
  num_sponsored: number;
  num_sponsoring: number;
  paging_token: string;
  sequence: string;
  sequence_ledger?: number;
  sequence_time?: string;
  signers: AccountSigner[];
  sponsor?: string;
  subentry_count: number;
  thresholds: AccountThresholds;
}
```

**Source:** [src/horizon/horizon_api.ts:167](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L167)

### `accountResponse._links`

```ts
_links: { data: ResponseLink; effects: ResponseLink; offers: ResponseLink; operations: ResponseLink; payments: ResponseLink; self: ResponseLink; trades: ResponseLink; transactions: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `accountResponse.account_id`

```ts
account_id: string;
```

**Source:** [src/horizon/horizon_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L178)

### `accountResponse.balances`

```ts
balances: (BalanceLineNative | BalanceLineLiquidityPool | BalanceLineAsset<"credit_alphanum4"> | BalanceLineAsset<"credit_alphanum12">)[];
```

**Source:** [src/horizon/horizon_api.ts:187](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L187)

### `accountResponse.data`

```ts
data: { [key: string]: string };
```

**Source:** [src/horizon/horizon_api.ts:189](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L189)

### `accountResponse.flags`

```ts
flags: Flags;
```

**Source:** [src/horizon/horizon_api.ts:186](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L186)

### `accountResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:176](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L176)

### `accountResponse.last_modified_ledger`

```ts
last_modified_ledger: number;
```

**Source:** [src/horizon/horizon_api.ts:184](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L184)

### `accountResponse.last_modified_time`

```ts
last_modified_time: string;
```

**Source:** [src/horizon/horizon_api.ts:185](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L185)

### `accountResponse.num_sponsored`

```ts
num_sponsored: number;
```

**Source:** [src/horizon/horizon_api.ts:194](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L194)

### `accountResponse.num_sponsoring`

```ts
num_sponsoring: number;
```

**Source:** [src/horizon/horizon_api.ts:193](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L193)

### `accountResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L177)

### `accountResponse.sequence`

```ts
sequence: string;
```

**Source:** [src/horizon/horizon_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L179)

### `accountResponse.sequence_ledger`

```ts
sequence_ledger?: number;
```

**Source:** [src/horizon/horizon_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L180)

### `accountResponse.sequence_time`

```ts
sequence_time?: string;
```

**Source:** [src/horizon/horizon_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L181)

### `accountResponse.signers`

```ts
signers: AccountSigner[];
```

**Source:** [src/horizon/horizon_api.ts:188](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L188)

### `accountResponse.sponsor`

```ts
sponsor?: string;
```

**Source:** [src/horizon/horizon_api.ts:192](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L192)

### `accountResponse.subentry_count`

```ts
subentry_count: number;
```

**Source:** [src/horizon/horizon_api.ts:182](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L182)

### `accountResponse.thresholds`

```ts
thresholds: AccountThresholds;
```

**Source:** [src/horizon/horizon_api.ts:183](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L183)

## Horizon.HorizonApi.AccountSigner

```ts
interface AccountSigner {
  key: string;
  sponsor?: string;
  type: string;
  weight: number;
}
```

**Source:** [src/horizon/horizon_api.ts:161](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L161)

### `accountSigner.key`

```ts
key: string;
```

**Source:** [src/horizon/horizon_api.ts:162](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L162)

### `accountSigner.sponsor`

```ts
sponsor?: string;
```

**Source:** [src/horizon/horizon_api.ts:165](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L165)

### `accountSigner.type`

```ts
type: string;
```

**Source:** [src/horizon/horizon_api.ts:164](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L164)

### `accountSigner.weight`

```ts
weight: number;
```

**Source:** [src/horizon/horizon_api.ts:163](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L163)

## Horizon.HorizonApi.AccountThresholds

```ts
interface AccountThresholds {
  high_threshold: number;
  low_threshold: number;
  med_threshold: number;
}
```

**Source:** [src/horizon/horizon_api.ts:150](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L150)

### `accountThresholds.high_threshold`

```ts
high_threshold: number;
```

**Source:** [src/horizon/horizon_api.ts:153](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L153)

### `accountThresholds.low_threshold`

```ts
low_threshold: number;
```

**Source:** [src/horizon/horizon_api.ts:151](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L151)

### `accountThresholds.med_threshold`

```ts
med_threshold: number;
```

**Source:** [src/horizon/horizon_api.ts:152](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L152)

## Horizon.HorizonApi.AllowTrustOperationResponse

```ts
interface AllowTrustOperationResponse extends BaseOperationResponse<OperationResponseType.allowTrust, OperationResponseTypeI.allowTrust> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  asset_code: string;
  asset_issuer: string;
  asset_type: AssetType;
  authorize: boolean;
  authorize_to_maintain_liabilities: boolean;
  created_at: string;
  id: string;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  trustee: string;
  trustor: string;
  type: allowTrust;
  type_i: allowTrust;
}
```

**Source:** [src/horizon/horizon_api.ts:404](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L404)

### `allowTrustOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `allowTrustOperationResponse.asset_code`

```ts
asset_code: string;
```

**Source:** [src/horizon/horizon_api.ts:409](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L409)

### `allowTrustOperationResponse.asset_issuer`

```ts
asset_issuer: string;
```

**Source:** [src/horizon/horizon_api.ts:410](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L410)

### `allowTrustOperationResponse.asset_type`

```ts
asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:408](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L408)

### `allowTrustOperationResponse.authorize`

```ts
authorize: boolean;
```

**Source:** [src/horizon/horizon_api.ts:411](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L411)

### `allowTrustOperationResponse.authorize_to_maintain_liabilities`

```ts
authorize_to_maintain_liabilities: boolean;
```

**Source:** [src/horizon/horizon_api.ts:412](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L412)

### `allowTrustOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `allowTrustOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `allowTrustOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `allowTrustOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `allowTrustOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `allowTrustOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `allowTrustOperationResponse.trustee`

```ts
trustee: string;
```

**Source:** [src/horizon/horizon_api.ts:413](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L413)

### `allowTrustOperationResponse.trustor`

```ts
trustor: string;
```

**Source:** [src/horizon/horizon_api.ts:414](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L414)

### `allowTrustOperationResponse.type`

```ts
type: allowTrust;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `allowTrustOperationResponse.type_i`

```ts
type_i: allowTrust;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.AssetAccounts

```ts
interface AssetAccounts {
  authorized: number;
  authorized_to_maintain_liabilities: number;
  unauthorized: number;
}
```

**Source:** [src/horizon/horizon_api.ts:129](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L129)

### `assetAccounts.authorized`

```ts
authorized: number;
```

**Source:** [src/horizon/horizon_api.ts:130](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L130)

### `assetAccounts.authorized_to_maintain_liabilities`

```ts
authorized_to_maintain_liabilities: number;
```

**Source:** [src/horizon/horizon_api.ts:131](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L131)

### `assetAccounts.unauthorized`

```ts
unauthorized: number;
```

**Source:** [src/horizon/horizon_api.ts:132](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L132)

## Horizon.HorizonApi.AssetBalances

```ts
interface AssetBalances {
  authorized: string;
  authorized_to_maintain_liabilities: string;
  unauthorized: string;
}
```

**Source:** [src/horizon/horizon_api.ts:134](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L134)

### `assetBalances.authorized`

```ts
authorized: string;
```

**Source:** [src/horizon/horizon_api.ts:135](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L135)

### `assetBalances.authorized_to_maintain_liabilities`

```ts
authorized_to_maintain_liabilities: string;
```

**Source:** [src/horizon/horizon_api.ts:136](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L136)

### `assetBalances.unauthorized`

```ts
unauthorized: string;
```

**Source:** [src/horizon/horizon_api.ts:137](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L137)

## Horizon.HorizonApi.BalanceChange

```ts
interface BalanceChange {
  amount: string;
  asset_code?: string;
  asset_issuer?: string;
  asset_type: string;
  destination_muxed_id?: string;
  from: string;
  to: string;
  type: string;
}
```

**Source:** [src/horizon/horizon_api.ts:556](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L556)

### `balanceChange.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:564](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L564)

### `balanceChange.asset_code`

```ts
asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:558](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L558)

### `balanceChange.asset_issuer`

```ts
asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:559](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L559)

### `balanceChange.asset_type`

```ts
asset_type: string;
```

**Source:** [src/horizon/horizon_api.ts:557](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L557)

### `balanceChange.destination_muxed_id`

```ts
destination_muxed_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:565](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L565)

### `balanceChange.from`

```ts
from: string;
```

**Source:** [src/horizon/horizon_api.ts:562](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L562)

### `balanceChange.to`

```ts
to: string;
```

**Source:** [src/horizon/horizon_api.ts:563](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L563)

### `balanceChange.type`

```ts
type: string;
```

**Source:** [src/horizon/horizon_api.ts:561](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L561)

## Horizon.HorizonApi.BalanceLine

```ts
type BalanceLine<T extends AssetType = AssetType> = T extends AssetType.native ? BalanceLineNative : T extends (AssetType.credit4 | AssetType.credit12) ? BalanceLineAsset<T> : T extends AssetType.liquidityPoolShares ? BalanceLineLiquidityPool : BalanceLineNative | BalanceLineAsset | BalanceLineLiquidityPool
```

**Source:** [src/horizon/horizon_api.ts:120](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L120)

## Horizon.HorizonApi.BalanceLineAsset

```ts
interface BalanceLineAsset<T extends AssetType.credit4 | AssetType.credit12 = AssetType.credit4 | AssetType.credit12> {
  asset_code: string;
  asset_issuer: string;
  asset_type: T;
  balance: string;
  buying_liabilities: string;
  is_authorized: boolean;
  is_authorized_to_maintain_liabilities: boolean;
  is_clawback_enabled: boolean;
  last_modified_ledger: number;
  limit: string;
  selling_liabilities: string;
  sponsor?: string;
}
```

**Source:** [src/horizon/horizon_api.ts:102](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L102)

### `balanceLineAsset.asset_code`

```ts
asset_code: string;
```

**Source:** [src/horizon/horizon_api.ts:110](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L110)

### `balanceLineAsset.asset_issuer`

```ts
asset_issuer: string;
```

**Source:** [src/horizon/horizon_api.ts:111](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L111)

### `balanceLineAsset.asset_type`

```ts
asset_type: T;
```

**Source:** [src/horizon/horizon_api.ts:109](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L109)

### `balanceLineAsset.balance`

```ts
balance: string;
```

**Source:** [src/horizon/horizon_api.ts:107](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L107)

### `balanceLineAsset.buying_liabilities`

```ts
buying_liabilities: string;
```

**Source:** [src/horizon/horizon_api.ts:112](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L112)

### `balanceLineAsset.is_authorized`

```ts
is_authorized: boolean;
```

**Source:** [src/horizon/horizon_api.ts:115](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L115)

### `balanceLineAsset.is_authorized_to_maintain_liabilities`

```ts
is_authorized_to_maintain_liabilities: boolean;
```

**Source:** [src/horizon/horizon_api.ts:116](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L116)

### `balanceLineAsset.is_clawback_enabled`

```ts
is_clawback_enabled: boolean;
```

**Source:** [src/horizon/horizon_api.ts:117](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L117)

### `balanceLineAsset.last_modified_ledger`

```ts
last_modified_ledger: number;
```

**Source:** [src/horizon/horizon_api.ts:114](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L114)

### `balanceLineAsset.limit`

```ts
limit: string;
```

**Source:** [src/horizon/horizon_api.ts:108](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L108)

### `balanceLineAsset.selling_liabilities`

```ts
selling_liabilities: string;
```

**Source:** [src/horizon/horizon_api.ts:113](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L113)

### `balanceLineAsset.sponsor`

```ts
sponsor?: string;
```

**Source:** [src/horizon/horizon_api.ts:118](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L118)

## Horizon.HorizonApi.BalanceLineLiquidityPool

```ts
interface BalanceLineLiquidityPool {
  asset_type: "liquidity_pool_shares";
  balance: string;
  is_authorized: boolean;
  is_authorized_to_maintain_liabilities: boolean;
  is_clawback_enabled: boolean;
  last_modified_ledger: number;
  limit: string;
  liquidity_pool_id: string;
  sponsor?: string;
}
```

**Source:** [src/horizon/horizon_api.ts:91](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L91)

### `balanceLineLiquidityPool.asset_type`

```ts
asset_type: "liquidity_pool_shares";
```

**Source:** [src/horizon/horizon_api.ts:93](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L93)

### `balanceLineLiquidityPool.balance`

```ts
balance: string;
```

**Source:** [src/horizon/horizon_api.ts:94](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L94)

### `balanceLineLiquidityPool.is_authorized`

```ts
is_authorized: boolean;
```

**Source:** [src/horizon/horizon_api.ts:97](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L97)

### `balanceLineLiquidityPool.is_authorized_to_maintain_liabilities`

```ts
is_authorized_to_maintain_liabilities: boolean;
```

**Source:** [src/horizon/horizon_api.ts:98](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L98)

### `balanceLineLiquidityPool.is_clawback_enabled`

```ts
is_clawback_enabled: boolean;
```

**Source:** [src/horizon/horizon_api.ts:99](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L99)

### `balanceLineLiquidityPool.last_modified_ledger`

```ts
last_modified_ledger: number;
```

**Source:** [src/horizon/horizon_api.ts:96](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L96)

### `balanceLineLiquidityPool.limit`

```ts
limit: string;
```

**Source:** [src/horizon/horizon_api.ts:95](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L95)

### `balanceLineLiquidityPool.liquidity_pool_id`

```ts
liquidity_pool_id: string;
```

**Source:** [src/horizon/horizon_api.ts:92](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L92)

### `balanceLineLiquidityPool.sponsor`

```ts
sponsor?: string;
```

**Source:** [src/horizon/horizon_api.ts:100](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L100)

## Horizon.HorizonApi.BalanceLineNative

```ts
interface BalanceLineNative {
  asset_type: "native";
  balance: string;
  buying_liabilities: string;
  selling_liabilities: string;
}
```

**Source:** [src/horizon/horizon_api.ts:85](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L85)

### `balanceLineNative.asset_type`

```ts
asset_type: "native";
```

**Source:** [src/horizon/horizon_api.ts:87](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L87)

### `balanceLineNative.balance`

```ts
balance: string;
```

**Source:** [src/horizon/horizon_api.ts:86](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L86)

### `balanceLineNative.buying_liabilities`

```ts
buying_liabilities: string;
```

**Source:** [src/horizon/horizon_api.ts:88](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L88)

### `balanceLineNative.selling_liabilities`

```ts
selling_liabilities: string;
```

**Source:** [src/horizon/horizon_api.ts:89](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L89)

## Horizon.HorizonApi.BaseOperationResponse

```ts
interface BaseOperationResponse<T extends OperationResponseType = OperationResponseType, TI extends OperationResponseTypeI = OperationResponseTypeI> extends BaseResponse<"succeeds" | "precedes" | "effects" | "transaction"> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  id: string;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: T;
  type_i: TI;
}
```

**Source:** [src/horizon/horizon_api.ts:259](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L259)

### `baseOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `baseOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `baseOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `baseOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `baseOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `baseOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `baseOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `baseOperationResponse.type`

```ts
type: T;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `baseOperationResponse.type_i`

```ts
type_i: TI;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.BaseResponse

```ts
interface BaseResponse<T extends string = never> {
  _links: { [key in string]: ResponseLink };
}
```

**Source:** [src/horizon/horizon_api.ts:9](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L9)

### `baseResponse._links`

```ts
_links: { [key in string]: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

## Horizon.HorizonApi.BeginSponsoringFutureReservesOperationResponse

```ts
interface BeginSponsoringFutureReservesOperationResponse extends BaseOperationResponse<OperationResponseType.beginSponsoringFutureReserves, OperationResponseTypeI.beginSponsoringFutureReserves> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  id: string;
  paging_token: string;
  source_account: string;
  sponsored_id: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: beginSponsoringFutureReserves;
  type_i: beginSponsoringFutureReserves;
}
```

**Source:** [src/horizon/horizon_api.ts:470](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L470)

### `beginSponsoringFutureReservesOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `beginSponsoringFutureReservesOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `beginSponsoringFutureReservesOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `beginSponsoringFutureReservesOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `beginSponsoringFutureReservesOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `beginSponsoringFutureReservesOperationResponse.sponsored_id`

```ts
sponsored_id: string;
```

**Source:** [src/horizon/horizon_api.ts:474](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L474)

### `beginSponsoringFutureReservesOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `beginSponsoringFutureReservesOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `beginSponsoringFutureReservesOperationResponse.type`

```ts
type: beginSponsoringFutureReserves;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `beginSponsoringFutureReservesOperationResponse.type_i`

```ts
type_i: beginSponsoringFutureReserves;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.BumpFootprintExpirationOperationResponse

```ts
interface BumpFootprintExpirationOperationResponse extends BaseOperationResponse<OperationResponseType.bumpFootprintExpiration, OperationResponseTypeI.bumpFootprintExpiration> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  id: string;
  ledgers_to_expire: number;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: bumpFootprintExpiration;
  type_i: bumpFootprintExpiration;
}
```

**Source:** [src/horizon/horizon_api.ts:582](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L582)

### `bumpFootprintExpirationOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `bumpFootprintExpirationOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `bumpFootprintExpirationOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `bumpFootprintExpirationOperationResponse.ledgers_to_expire`

```ts
ledgers_to_expire: number;
```

**Source:** [src/horizon/horizon_api.ts:586](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L586)

### `bumpFootprintExpirationOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `bumpFootprintExpirationOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `bumpFootprintExpirationOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `bumpFootprintExpirationOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `bumpFootprintExpirationOperationResponse.type`

```ts
type: bumpFootprintExpiration;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `bumpFootprintExpirationOperationResponse.type_i`

```ts
type_i: bumpFootprintExpiration;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.BumpSequenceOperationResponse

```ts
interface BumpSequenceOperationResponse extends BaseOperationResponse<OperationResponseType.bumpSequence, OperationResponseTypeI.bumpSequence> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  bump_to: string;
  created_at: string;
  id: string;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: bumpSequence;
  type_i: bumpSequence;
}
```

**Source:** [src/horizon/horizon_api.ts:433](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L433)

### `bumpSequenceOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `bumpSequenceOperationResponse.bump_to`

```ts
bump_to: string;
```

**Source:** [src/horizon/horizon_api.ts:437](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L437)

### `bumpSequenceOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `bumpSequenceOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `bumpSequenceOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `bumpSequenceOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `bumpSequenceOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `bumpSequenceOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `bumpSequenceOperationResponse.type`

```ts
type: bumpSequence;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `bumpSequenceOperationResponse.type_i`

```ts
type_i: bumpSequence;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.ChangeTrustOperationResponse

```ts
interface ChangeTrustOperationResponse extends BaseOperationResponse<OperationResponseType.changeTrust, OperationResponseTypeI.changeTrust> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  asset_code?: string;
  asset_issuer?: string;
  asset_type: "credit_alphanum4" | "credit_alphanum12" | "liquidity_pool_shares";
  created_at: string;
  id: string;
  limit: string;
  liquidity_pool_id?: string;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  trustee?: string;
  trustor: string;
  type: changeTrust;
  type_i: changeTrust;
}
```

**Source:** [src/horizon/horizon_api.ts:389](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L389)

### `changeTrustOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `changeTrustOperationResponse.asset_code`

```ts
asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:397](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L397)

### `changeTrustOperationResponse.asset_issuer`

```ts
asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:398](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L398)

### `changeTrustOperationResponse.asset_type`

```ts
asset_type: "credit_alphanum4" | "credit_alphanum12" | "liquidity_pool_shares";
```

**Source:** [src/horizon/horizon_api.ts:393](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L393)

### `changeTrustOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `changeTrustOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `changeTrustOperationResponse.limit`

```ts
limit: string;
```

**Source:** [src/horizon/horizon_api.ts:402](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L402)

### `changeTrustOperationResponse.liquidity_pool_id`

```ts
liquidity_pool_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:399](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L399)

### `changeTrustOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `changeTrustOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `changeTrustOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `changeTrustOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `changeTrustOperationResponse.trustee`

```ts
trustee?: string;
```

**Source:** [src/horizon/horizon_api.ts:400](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L400)

### `changeTrustOperationResponse.trustor`

```ts
trustor: string;
```

**Source:** [src/horizon/horizon_api.ts:401](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L401)

### `changeTrustOperationResponse.type`

```ts
type: changeTrust;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `changeTrustOperationResponse.type_i`

```ts
type_i: changeTrust;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.ClaimClaimableBalanceOperationResponse

```ts
interface ClaimClaimableBalanceOperationResponse extends BaseOperationResponse<OperationResponseType.claimClaimableBalance, OperationResponseTypeI.claimClaimableBalance> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  balance_id: string;
  claimant: string;
  created_at: string;
  id: string;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: claimClaimableBalance;
  type_i: claimClaimableBalance;
}
```

**Source:** [src/horizon/horizon_api.ts:462](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L462)

### `claimClaimableBalanceOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `claimClaimableBalanceOperationResponse.balance_id`

```ts
balance_id: string;
```

**Source:** [src/horizon/horizon_api.ts:466](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L466)

### `claimClaimableBalanceOperationResponse.claimant`

```ts
claimant: string;
```

**Source:** [src/horizon/horizon_api.ts:467](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L467)

### `claimClaimableBalanceOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `claimClaimableBalanceOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `claimClaimableBalanceOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `claimClaimableBalanceOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `claimClaimableBalanceOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `claimClaimableBalanceOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `claimClaimableBalanceOperationResponse.type`

```ts
type: claimClaimableBalance;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `claimClaimableBalanceOperationResponse.type_i`

```ts
type_i: claimClaimableBalance;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.Claimant

```ts
interface Claimant {
  destination: string;
  predicate: Predicate;
}
```

**Source:** [src/horizon/horizon_api.ts:447](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L447)

### `claimant.destination`

```ts
destination: string;
```

**Source:** [src/horizon/horizon_api.ts:448](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L448)

### `claimant.predicate`

```ts
predicate: Predicate;
```

**Source:** [src/horizon/horizon_api.ts:449](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L449)

## Horizon.HorizonApi.ClawbackClaimableBalanceOperationResponse

```ts
interface ClawbackClaimableBalanceOperationResponse extends BaseOperationResponse<OperationResponseType.clawbackClaimableBalance, OperationResponseTypeI.clawbackClaimableBalance> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  balance_id: string;
  created_at: string;
  id: string;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: clawbackClaimableBalance;
  type_i: clawbackClaimableBalance;
}
```

**Source:** [src/horizon/horizon_api.ts:511](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L511)

### `clawbackClaimableBalanceOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `clawbackClaimableBalanceOperationResponse.balance_id`

```ts
balance_id: string;
```

**Source:** [src/horizon/horizon_api.ts:515](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L515)

### `clawbackClaimableBalanceOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `clawbackClaimableBalanceOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `clawbackClaimableBalanceOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `clawbackClaimableBalanceOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `clawbackClaimableBalanceOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `clawbackClaimableBalanceOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `clawbackClaimableBalanceOperationResponse.type`

```ts
type: clawbackClaimableBalance;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `clawbackClaimableBalanceOperationResponse.type_i`

```ts
type_i: clawbackClaimableBalance;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.ClawbackOperationResponse

```ts
interface ClawbackOperationResponse extends BaseOperationResponse<OperationResponseType.clawback, OperationResponseTypeI.clawback> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  asset_code: string;
  asset_issuer: string;
  asset_type: AssetType;
  created_at: string;
  from: string;
  id: string;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: clawback;
  type_i: clawback;
}
```

**Source:** [src/horizon/horizon_api.ts:500](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L500)

### `clawbackOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `clawbackOperationResponse.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:508](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L508)

### `clawbackOperationResponse.asset_code`

```ts
asset_code: string;
```

**Source:** [src/horizon/horizon_api.ts:505](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L505)

### `clawbackOperationResponse.asset_issuer`

```ts
asset_issuer: string;
```

**Source:** [src/horizon/horizon_api.ts:506](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L506)

### `clawbackOperationResponse.asset_type`

```ts
asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:504](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L504)

### `clawbackOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `clawbackOperationResponse.from`

```ts
from: string;
```

**Source:** [src/horizon/horizon_api.ts:507](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L507)

### `clawbackOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `clawbackOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `clawbackOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `clawbackOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `clawbackOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `clawbackOperationResponse.type`

```ts
type: clawback;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `clawbackOperationResponse.type_i`

```ts
type_i: clawback;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.CreateAccountOperationResponse

```ts
interface CreateAccountOperationResponse extends BaseOperationResponse<OperationResponseType.createAccount, OperationResponseTypeI.createAccount> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  account: string;
  created_at: string;
  funder: string;
  id: string;
  paging_token: string;
  source_account: string;
  starting_balance: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: createAccount;
  type_i: createAccount;
}
```

**Source:** [src/horizon/horizon_api.ts:272](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L272)

### `createAccountOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `createAccountOperationResponse.account`

```ts
account: string;
```

**Source:** [src/horizon/horizon_api.ts:276](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L276)

### `createAccountOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `createAccountOperationResponse.funder`

```ts
funder: string;
```

**Source:** [src/horizon/horizon_api.ts:277](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L277)

### `createAccountOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `createAccountOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `createAccountOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `createAccountOperationResponse.starting_balance`

```ts
starting_balance: string;
```

**Source:** [src/horizon/horizon_api.ts:278](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L278)

### `createAccountOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `createAccountOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `createAccountOperationResponse.type`

```ts
type: createAccount;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `createAccountOperationResponse.type_i`

```ts
type_i: createAccount;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.CreateClaimableBalanceOperationResponse

```ts
interface CreateClaimableBalanceOperationResponse extends BaseOperationResponse<OperationResponseType.createClaimableBalance, OperationResponseTypeI.createClaimableBalance> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  asset: string;
  claimants: Claimant[];
  created_at: string;
  id: string;
  paging_token: string;
  source_account: string;
  sponsor: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: createClaimableBalance;
  type_i: createClaimableBalance;
}
```

**Source:** [src/horizon/horizon_api.ts:452](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L452)

### `createClaimableBalanceOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `createClaimableBalanceOperationResponse.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:457](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L457)

### `createClaimableBalanceOperationResponse.asset`

```ts
asset: string;
```

**Source:** [src/horizon/horizon_api.ts:456](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L456)

### `createClaimableBalanceOperationResponse.claimants`

```ts
claimants: Claimant[];
```

**Source:** [src/horizon/horizon_api.ts:459](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L459)

### `createClaimableBalanceOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `createClaimableBalanceOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `createClaimableBalanceOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `createClaimableBalanceOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `createClaimableBalanceOperationResponse.sponsor`

```ts
sponsor: string;
```

**Source:** [src/horizon/horizon_api.ts:458](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L458)

### `createClaimableBalanceOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `createClaimableBalanceOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `createClaimableBalanceOperationResponse.type`

```ts
type: createClaimableBalance;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `createClaimableBalanceOperationResponse.type_i`

```ts
type_i: createClaimableBalance;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.DepositLiquidityOperationResponse

```ts
interface DepositLiquidityOperationResponse extends BaseOperationResponse<OperationResponseType.liquidityPoolDeposit, OperationResponseTypeI.liquidityPoolDeposit> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  id: string;
  liquidity_pool_id: string;
  max_price: string;
  max_price_r: PriceRShorthand;
  min_price: string;
  min_price_r: PriceRShorthand;
  paging_token: string;
  reserves_deposited: Reserve[];
  reserves_max: Reserve[];
  shares_received: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: liquidityPoolDeposit;
  type_i: liquidityPoolDeposit;
}
```

**Source:** [src/horizon/horizon_api.ts:533](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L533)

### `depositLiquidityOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `depositLiquidityOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `depositLiquidityOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `depositLiquidityOperationResponse.liquidity_pool_id`

```ts
liquidity_pool_id: string;
```

**Source:** [src/horizon/horizon_api.ts:537](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L537)

### `depositLiquidityOperationResponse.max_price`

```ts
max_price: string;
```

**Source:** [src/horizon/horizon_api.ts:541](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L541)

### `depositLiquidityOperationResponse.max_price_r`

```ts
max_price_r: PriceRShorthand;
```

**Source:** [src/horizon/horizon_api.ts:542](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L542)

### `depositLiquidityOperationResponse.min_price`

```ts
min_price: string;
```

**Source:** [src/horizon/horizon_api.ts:539](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L539)

### `depositLiquidityOperationResponse.min_price_r`

```ts
min_price_r: PriceRShorthand;
```

**Source:** [src/horizon/horizon_api.ts:540](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L540)

### `depositLiquidityOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `depositLiquidityOperationResponse.reserves_deposited`

```ts
reserves_deposited: Reserve[];
```

**Source:** [src/horizon/horizon_api.ts:543](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L543)

### `depositLiquidityOperationResponse.reserves_max`

```ts
reserves_max: Reserve[];
```

**Source:** [src/horizon/horizon_api.ts:538](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L538)

### `depositLiquidityOperationResponse.shares_received`

```ts
shares_received: string;
```

**Source:** [src/horizon/horizon_api.ts:544](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L544)

### `depositLiquidityOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `depositLiquidityOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `depositLiquidityOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `depositLiquidityOperationResponse.type`

```ts
type: liquidityPoolDeposit;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `depositLiquidityOperationResponse.type_i`

```ts
type_i: liquidityPoolDeposit;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.EndSponsoringFutureReservesOperationResponse

```ts
interface EndSponsoringFutureReservesOperationResponse extends BaseOperationResponse<OperationResponseType.endSponsoringFutureReserves, OperationResponseTypeI.endSponsoringFutureReserves> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  begin_sponsor: string;
  created_at: string;
  id: string;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: endSponsoringFutureReserves;
  type_i: endSponsoringFutureReserves;
}
```

**Source:** [src/horizon/horizon_api.ts:477](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L477)

### `endSponsoringFutureReservesOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `endSponsoringFutureReservesOperationResponse.begin_sponsor`

```ts
begin_sponsor: string;
```

**Source:** [src/horizon/horizon_api.ts:481](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L481)

### `endSponsoringFutureReservesOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `endSponsoringFutureReservesOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `endSponsoringFutureReservesOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `endSponsoringFutureReservesOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `endSponsoringFutureReservesOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `endSponsoringFutureReservesOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `endSponsoringFutureReservesOperationResponse.type`

```ts
type: endSponsoringFutureReserves;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `endSponsoringFutureReservesOperationResponse.type_i`

```ts
type_i: endSponsoringFutureReserves;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.ErrorResponseData

```ts
type ErrorResponseData = ErrorResponseData.RateLimitExceeded | ErrorResponseData.InternalServerError | ErrorResponseData.TransactionFailed
```

**Source:** [src/horizon/horizon_api.ts:630](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L630)

## Horizon.HorizonApi.ErrorResponseData.Base

```ts
interface Base {
  details: string;
  instance: string;
  status: number;
  title: string;
  type: string;
}
```

**Source:** [src/horizon/horizon_api.ts:636](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L636)

### `base.details`

```ts
details: string;
```

**Source:** [src/horizon/horizon_api.ts:640](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L640)

### `base.instance`

```ts
instance: string;
```

**Source:** [src/horizon/horizon_api.ts:641](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L641)

### `base.status`

```ts
status: number;
```

**Source:** [src/horizon/horizon_api.ts:637](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L637)

### `base.title`

```ts
title: string;
```

**Source:** [src/horizon/horizon_api.ts:638](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L638)

### `base.type`

```ts
type: string;
```

**Source:** [src/horizon/horizon_api.ts:639](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L639)

## Horizon.HorizonApi.ErrorResponseData.InternalServerError

```ts
interface InternalServerError extends Base {
  details: string;
  instance: string;
  status: 500;
  title: "Internal Server Error";
  type: string;
}
```

**Source:** [src/horizon/horizon_api.ts:648](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L648)

### `internalServerError.details`

```ts
details: string;
```

**Source:** [src/horizon/horizon_api.ts:640](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L640)

### `internalServerError.instance`

```ts
instance: string;
```

**Source:** [src/horizon/horizon_api.ts:641](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L641)

### `internalServerError.status`

```ts
status: 500;
```

**Source:** [src/horizon/horizon_api.ts:649](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L649)

### `internalServerError.title`

```ts
title: "Internal Server Error";
```

**Source:** [src/horizon/horizon_api.ts:650](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L650)

### `internalServerError.type`

```ts
type: string;
```

**Source:** [src/horizon/horizon_api.ts:639](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L639)

## Horizon.HorizonApi.ErrorResponseData.RateLimitExceeded

```ts
interface RateLimitExceeded extends Base {
  details: string;
  instance: string;
  status: 429;
  title: "Rate Limit Exceeded";
  type: string;
}
```

**Source:** [src/horizon/horizon_api.ts:644](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L644)

### `rateLimitExceeded.details`

```ts
details: string;
```

**Source:** [src/horizon/horizon_api.ts:640](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L640)

### `rateLimitExceeded.instance`

```ts
instance: string;
```

**Source:** [src/horizon/horizon_api.ts:641](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L641)

### `rateLimitExceeded.status`

```ts
status: 429;
```

**Source:** [src/horizon/horizon_api.ts:645](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L645)

### `rateLimitExceeded.title`

```ts
title: "Rate Limit Exceeded";
```

**Source:** [src/horizon/horizon_api.ts:646](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L646)

### `rateLimitExceeded.type`

```ts
type: string;
```

**Source:** [src/horizon/horizon_api.ts:639](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L639)

## Horizon.HorizonApi.ErrorResponseData.TransactionFailed

```ts
interface TransactionFailed extends Base {
  details: string;
  extras: TransactionFailedExtras;
  instance: string;
  status: 400;
  title: "Transaction Failed";
  type: string;
}
```

**Source:** [src/horizon/horizon_api.ts:652](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L652)

### `transactionFailed.details`

```ts
details: string;
```

**Source:** [src/horizon/horizon_api.ts:640](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L640)

### `transactionFailed.extras`

```ts
extras: TransactionFailedExtras;
```

**Source:** [src/horizon/horizon_api.ts:655](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L655)

### `transactionFailed.instance`

```ts
instance: string;
```

**Source:** [src/horizon/horizon_api.ts:641](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L641)

### `transactionFailed.status`

```ts
status: 400;
```

**Source:** [src/horizon/horizon_api.ts:653](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L653)

### `transactionFailed.title`

```ts
title: "Transaction Failed";
```

**Source:** [src/horizon/horizon_api.ts:654](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L654)

### `transactionFailed.type`

```ts
type: string;
```

**Source:** [src/horizon/horizon_api.ts:639](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L639)

## Horizon.HorizonApi.FeeBumpTransactionResponse

```ts
interface FeeBumpTransactionResponse {
  hash: string;
  signatures: string[];
}
```

**Source:** [src/horizon/horizon_api.ts:29](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L29)

### `feeBumpTransactionResponse.hash`

```ts
hash: string;
```

**Source:** [src/horizon/horizon_api.ts:30](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L30)

### `feeBumpTransactionResponse.signatures`

```ts
signatures: string[];
```

**Source:** [src/horizon/horizon_api.ts:31](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L31)

## Horizon.HorizonApi.FeeDistribution

```ts
interface FeeDistribution {
  max: string;
  min: string;
  mode: string;
  p10: string;
  p20: string;
  p30: string;
  p40: string;
  p50: string;
  p60: string;
  p70: string;
  p80: string;
  p90: string;
  p95: string;
  p99: string;
}
```

**Source:** [src/horizon/horizon_api.ts:606](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L606)

### `feeDistribution.max`

```ts
max: string;
```

**Source:** [src/horizon/horizon_api.ts:607](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L607)

### `feeDistribution.min`

```ts
min: string;
```

**Source:** [src/horizon/horizon_api.ts:608](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L608)

### `feeDistribution.mode`

```ts
mode: string;
```

**Source:** [src/horizon/horizon_api.ts:609](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L609)

### `feeDistribution.p10`

```ts
p10: string;
```

**Source:** [src/horizon/horizon_api.ts:610](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L610)

### `feeDistribution.p20`

```ts
p20: string;
```

**Source:** [src/horizon/horizon_api.ts:611](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L611)

### `feeDistribution.p30`

```ts
p30: string;
```

**Source:** [src/horizon/horizon_api.ts:612](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L612)

### `feeDistribution.p40`

```ts
p40: string;
```

**Source:** [src/horizon/horizon_api.ts:613](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L613)

### `feeDistribution.p50`

```ts
p50: string;
```

**Source:** [src/horizon/horizon_api.ts:614](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L614)

### `feeDistribution.p60`

```ts
p60: string;
```

**Source:** [src/horizon/horizon_api.ts:615](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L615)

### `feeDistribution.p70`

```ts
p70: string;
```

**Source:** [src/horizon/horizon_api.ts:616](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L616)

### `feeDistribution.p80`

```ts
p80: string;
```

**Source:** [src/horizon/horizon_api.ts:617](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L617)

### `feeDistribution.p90`

```ts
p90: string;
```

**Source:** [src/horizon/horizon_api.ts:618](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L618)

### `feeDistribution.p95`

```ts
p95: string;
```

**Source:** [src/horizon/horizon_api.ts:619](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L619)

### `feeDistribution.p99`

```ts
p99: string;
```

**Source:** [src/horizon/horizon_api.ts:620](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L620)

## Horizon.HorizonApi.FeeStatsResponse

```ts
interface FeeStatsResponse {
  fee_charged: FeeDistribution;
  last_ledger: string;
  last_ledger_base_fee: string;
  ledger_capacity_usage: string;
  max_fee: FeeDistribution;
}
```

**Source:** [src/horizon/horizon_api.ts:622](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L622)

### `feeStatsResponse.fee_charged`

```ts
fee_charged: FeeDistribution;
```

**Source:** [src/horizon/horizon_api.ts:626](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L626)

### `feeStatsResponse.last_ledger`

```ts
last_ledger: string;
```

**Source:** [src/horizon/horizon_api.ts:623](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L623)

### `feeStatsResponse.last_ledger_base_fee`

```ts
last_ledger_base_fee: string;
```

**Source:** [src/horizon/horizon_api.ts:624](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L624)

### `feeStatsResponse.ledger_capacity_usage`

```ts
ledger_capacity_usage: string;
```

**Source:** [src/horizon/horizon_api.ts:625](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L625)

### `feeStatsResponse.max_fee`

```ts
max_fee: FeeDistribution;
```

**Source:** [src/horizon/horizon_api.ts:627](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L627)

## Horizon.HorizonApi.Flags

```ts
interface Flags {
  auth_clawback_enabled: boolean;
  auth_immutable: boolean;
  auth_required: boolean;
  auth_revocable: boolean;
}
```

**Source:** [src/horizon/horizon_api.ts:155](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L155)

### `flags.auth_clawback_enabled`

```ts
auth_clawback_enabled: boolean;
```

**Source:** [src/horizon/horizon_api.ts:159](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L159)

### `flags.auth_immutable`

```ts
auth_immutable: boolean;
```

**Source:** [src/horizon/horizon_api.ts:156](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L156)

### `flags.auth_required`

```ts
auth_required: boolean;
```

**Source:** [src/horizon/horizon_api.ts:157](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L157)

### `flags.auth_revocable`

```ts
auth_revocable: boolean;
```

**Source:** [src/horizon/horizon_api.ts:158](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L158)

## Horizon.HorizonApi.InflationOperationResponse

```ts
interface InflationOperationResponse extends BaseOperationResponse<OperationResponseType.inflation, OperationResponseTypeI.inflation> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  id: string;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: inflation;
  type_i: inflation;
}
```

**Source:** [src/horizon/horizon_api.ts:422](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L422)

### `inflationOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `inflationOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `inflationOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `inflationOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `inflationOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `inflationOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `inflationOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `inflationOperationResponse.type`

```ts
type: inflation;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `inflationOperationResponse.type_i`

```ts
type_i: inflation;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.InnerTransactionResponse

```ts
interface InnerTransactionResponse {
  hash: string;
  max_fee: string;
  signatures: string[];
}
```

**Source:** [src/horizon/horizon_api.ts:34](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L34)

### `innerTransactionResponse.hash`

```ts
hash: string;
```

**Source:** [src/horizon/horizon_api.ts:35](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L35)

### `innerTransactionResponse.max_fee`

```ts
max_fee: string;
```

**Source:** [src/horizon/horizon_api.ts:37](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L37)

### `innerTransactionResponse.signatures`

```ts
signatures: string[];
```

**Source:** [src/horizon/horizon_api.ts:36](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L36)

## Horizon.HorizonApi.InvokeHostFunctionOperationResponse

```ts
interface InvokeHostFunctionOperationResponse extends BaseOperationResponse<OperationResponseType.invokeHostFunction, OperationResponseTypeI.invokeHostFunction> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  address: string;
  asset_balance_changes: BalanceChange[];
  created_at: string;
  function: string;
  id: string;
  paging_token: string;
  parameters: { type: string; value: string }[];
  salt: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: invokeHostFunction;
  type_i: invokeHostFunction;
}
```

**Source:** [src/horizon/horizon_api.ts:568](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L568)

### `invokeHostFunctionOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `invokeHostFunctionOperationResponse.address`

```ts
address: string;
```

**Source:** [src/horizon/horizon_api.ts:577](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L577)

### `invokeHostFunctionOperationResponse.asset_balance_changes`

```ts
asset_balance_changes: BalanceChange[];
```

**Source:** [src/horizon/horizon_api.ts:579](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L579)

### `invokeHostFunctionOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `invokeHostFunctionOperationResponse.function`

```ts
function: string;
```

**Source:** [src/horizon/horizon_api.ts:572](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L572)

### `invokeHostFunctionOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `invokeHostFunctionOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `invokeHostFunctionOperationResponse.parameters`

```ts
parameters: { type: string; value: string }[];
```

**Source:** [src/horizon/horizon_api.ts:573](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L573)

### `invokeHostFunctionOperationResponse.salt`

```ts
salt: string;
```

**Source:** [src/horizon/horizon_api.ts:578](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L578)

### `invokeHostFunctionOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `invokeHostFunctionOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `invokeHostFunctionOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `invokeHostFunctionOperationResponse.type`

```ts
type: invokeHostFunction;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `invokeHostFunctionOperationResponse.type_i`

```ts
type_i: invokeHostFunction;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.LiquidityPoolType

```ts
enum LiquidityPoolType
```

**Source:** [src/horizon/horizon_api.ts:197](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L197)

## Horizon.HorizonApi.ManageDataOperationResponse

```ts
interface ManageDataOperationResponse extends BaseOperationResponse<OperationResponseType.manageData, OperationResponseTypeI.manageData> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  id: string;
  name: string;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: manageData;
  type_i: manageData;
  value: Buffer;
}
```

**Source:** [src/horizon/horizon_api.ts:426](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L426)

### `manageDataOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `manageDataOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `manageDataOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `manageDataOperationResponse.name`

```ts
name: string;
```

**Source:** [src/horizon/horizon_api.ts:430](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L430)

### `manageDataOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `manageDataOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `manageDataOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `manageDataOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `manageDataOperationResponse.type`

```ts
type: manageData;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `manageDataOperationResponse.type_i`

```ts
type_i: manageData;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

### `manageDataOperationResponse.value`

```ts
value: Buffer;
```

**Source:** [src/horizon/horizon_api.ts:431](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L431)

## Horizon.HorizonApi.ManageOfferOperationResponse

```ts
interface ManageOfferOperationResponse extends BaseOperationResponse<OperationResponseType.manageOffer, OperationResponseTypeI.manageOffer> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  buying_asset_code?: string;
  buying_asset_issuer?: string;
  buying_asset_type: AssetType;
  created_at: string;
  id: string;
  offer_id: string | number;
  paging_token: string;
  price: string;
  price_r: PriceR;
  selling_asset_code?: string;
  selling_asset_issuer?: string;
  selling_asset_type: AssetType;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: manageOffer;
  type_i: manageOffer;
}
```

**Source:** [src/horizon/horizon_api.ts:335](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L335)

### `manageOfferOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `manageOfferOperationResponse.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:340](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L340)

### `manageOfferOperationResponse.buying_asset_code`

```ts
buying_asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:342](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L342)

### `manageOfferOperationResponse.buying_asset_issuer`

```ts
buying_asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:343](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L343)

### `manageOfferOperationResponse.buying_asset_type`

```ts
buying_asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:341](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L341)

### `manageOfferOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `manageOfferOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `manageOfferOperationResponse.offer_id`

```ts
offer_id: string | number;
```

**Source:** [src/horizon/horizon_api.ts:339](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L339)

### `manageOfferOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `manageOfferOperationResponse.price`

```ts
price: string;
```

**Source:** [src/horizon/horizon_api.ts:344](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L344)

### `manageOfferOperationResponse.price_r`

```ts
price_r: PriceR;
```

**Source:** [src/horizon/horizon_api.ts:345](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L345)

### `manageOfferOperationResponse.selling_asset_code`

```ts
selling_asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:347](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L347)

### `manageOfferOperationResponse.selling_asset_issuer`

```ts
selling_asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:348](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L348)

### `manageOfferOperationResponse.selling_asset_type`

```ts
selling_asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:346](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L346)

### `manageOfferOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `manageOfferOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `manageOfferOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `manageOfferOperationResponse.type`

```ts
type: manageOffer;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `manageOfferOperationResponse.type_i`

```ts
type_i: manageOffer;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.OperationResponseType

```ts
enum OperationResponseType
```

**Source:** [src/horizon/horizon_api.ts:201](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L201)

## Horizon.HorizonApi.OperationResponseTypeI

```ts
enum OperationResponseTypeI
```

**Source:** [src/horizon/horizon_api.ts:230](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L230)

## Horizon.HorizonApi.PassiveOfferOperationResponse

```ts
interface PassiveOfferOperationResponse extends BaseOperationResponse<OperationResponseType.createPassiveOffer, OperationResponseTypeI.createPassiveOffer> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  buying_asset_code?: string;
  buying_asset_issuer?: string;
  buying_asset_type: AssetType;
  created_at: string;
  id: string;
  offer_id: string | number;
  paging_token: string;
  price: string;
  price_r: PriceR;
  selling_asset_code?: string;
  selling_asset_issuer?: string;
  selling_asset_type: AssetType;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: createPassiveOffer;
  type_i: createPassiveOffer;
}
```

**Source:** [src/horizon/horizon_api.ts:350](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L350)

### `passiveOfferOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `passiveOfferOperationResponse.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:355](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L355)

### `passiveOfferOperationResponse.buying_asset_code`

```ts
buying_asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:357](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L357)

### `passiveOfferOperationResponse.buying_asset_issuer`

```ts
buying_asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:358](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L358)

### `passiveOfferOperationResponse.buying_asset_type`

```ts
buying_asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:356](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L356)

### `passiveOfferOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `passiveOfferOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `passiveOfferOperationResponse.offer_id`

```ts
offer_id: string | number;
```

**Source:** [src/horizon/horizon_api.ts:354](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L354)

### `passiveOfferOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `passiveOfferOperationResponse.price`

```ts
price: string;
```

**Source:** [src/horizon/horizon_api.ts:359](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L359)

### `passiveOfferOperationResponse.price_r`

```ts
price_r: PriceR;
```

**Source:** [src/horizon/horizon_api.ts:360](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L360)

### `passiveOfferOperationResponse.selling_asset_code`

```ts
selling_asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:362](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L362)

### `passiveOfferOperationResponse.selling_asset_issuer`

```ts
selling_asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:363](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L363)

### `passiveOfferOperationResponse.selling_asset_type`

```ts
selling_asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:361](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L361)

### `passiveOfferOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `passiveOfferOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `passiveOfferOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `passiveOfferOperationResponse.type`

```ts
type: createPassiveOffer;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `passiveOfferOperationResponse.type_i`

```ts
type_i: createPassiveOffer;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.PathPaymentOperationResponse

```ts
interface PathPaymentOperationResponse extends BaseOperationResponse<OperationResponseType.pathPayment, OperationResponseTypeI.pathPayment> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  asset_code?: string;
  asset_issuer?: string;
  asset_type: AssetType;
  created_at: string;
  from: string;
  id: string;
  paging_token: string;
  path: { asset_code: string; asset_issuer: string; asset_type: AssetType }[];
  source_account: string;
  source_amount: string;
  source_asset_code?: string;
  source_asset_issuer?: string;
  source_asset_type: AssetType;
  source_max: string;
  to: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: pathPayment;
  type_i: pathPayment;
}
```

**Source:** [src/horizon/horizon_api.ts:293](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L293)

### `pathPaymentOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `pathPaymentOperationResponse.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:297](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L297)

### `pathPaymentOperationResponse.asset_code`

```ts
asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:298](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L298)

### `pathPaymentOperationResponse.asset_issuer`

```ts
asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:299](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L299)

### `pathPaymentOperationResponse.asset_type`

```ts
asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:300](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L300)

### `pathPaymentOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `pathPaymentOperationResponse.from`

```ts
from: string;
```

**Source:** [src/horizon/horizon_api.ts:301](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L301)

### `pathPaymentOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `pathPaymentOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `pathPaymentOperationResponse.path`

```ts
path: { asset_code: string; asset_issuer: string; asset_type: AssetType }[];
```

**Source:** [src/horizon/horizon_api.ts:302](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L302)

### `pathPaymentOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `pathPaymentOperationResponse.source_amount`

```ts
source_amount: string;
```

**Source:** [src/horizon/horizon_api.ts:307](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L307)

### `pathPaymentOperationResponse.source_asset_code`

```ts
source_asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:308](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L308)

### `pathPaymentOperationResponse.source_asset_issuer`

```ts
source_asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:309](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L309)

### `pathPaymentOperationResponse.source_asset_type`

```ts
source_asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:310](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L310)

### `pathPaymentOperationResponse.source_max`

```ts
source_max: string;
```

**Source:** [src/horizon/horizon_api.ts:311](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L311)

### `pathPaymentOperationResponse.to`

```ts
to: string;
```

**Source:** [src/horizon/horizon_api.ts:312](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L312)

### `pathPaymentOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `pathPaymentOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `pathPaymentOperationResponse.type`

```ts
type: pathPayment;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `pathPaymentOperationResponse.type_i`

```ts
type_i: pathPayment;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.PathPaymentStrictSendOperationResponse

```ts
interface PathPaymentStrictSendOperationResponse extends BaseOperationResponse<OperationResponseType.pathPaymentStrictSend, OperationResponseTypeI.pathPaymentStrictSend> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  asset_code?: string;
  asset_issuer?: string;
  asset_type: AssetType;
  created_at: string;
  destination_min: string;
  from: string;
  id: string;
  paging_token: string;
  path: { asset_code: string; asset_issuer: string; asset_type: AssetType }[];
  source_account: string;
  source_amount: string;
  source_asset_code?: string;
  source_asset_issuer?: string;
  source_asset_type: AssetType;
  to: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: pathPaymentStrictSend;
  type_i: pathPaymentStrictSend;
}
```

**Source:** [src/horizon/horizon_api.ts:314](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L314)

### `pathPaymentStrictSendOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `pathPaymentStrictSendOperationResponse.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:318](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L318)

### `pathPaymentStrictSendOperationResponse.asset_code`

```ts
asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:319](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L319)

### `pathPaymentStrictSendOperationResponse.asset_issuer`

```ts
asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:320](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L320)

### `pathPaymentStrictSendOperationResponse.asset_type`

```ts
asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:321](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L321)

### `pathPaymentStrictSendOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `pathPaymentStrictSendOperationResponse.destination_min`

```ts
destination_min: string;
```

**Source:** [src/horizon/horizon_api.ts:322](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L322)

### `pathPaymentStrictSendOperationResponse.from`

```ts
from: string;
```

**Source:** [src/horizon/horizon_api.ts:323](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L323)

### `pathPaymentStrictSendOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `pathPaymentStrictSendOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `pathPaymentStrictSendOperationResponse.path`

```ts
path: { asset_code: string; asset_issuer: string; asset_type: AssetType }[];
```

**Source:** [src/horizon/horizon_api.ts:324](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L324)

### `pathPaymentStrictSendOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `pathPaymentStrictSendOperationResponse.source_amount`

```ts
source_amount: string;
```

**Source:** [src/horizon/horizon_api.ts:329](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L329)

### `pathPaymentStrictSendOperationResponse.source_asset_code`

```ts
source_asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:330](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L330)

### `pathPaymentStrictSendOperationResponse.source_asset_issuer`

```ts
source_asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:331](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L331)

### `pathPaymentStrictSendOperationResponse.source_asset_type`

```ts
source_asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:332](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L332)

### `pathPaymentStrictSendOperationResponse.to`

```ts
to: string;
```

**Source:** [src/horizon/horizon_api.ts:333](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L333)

### `pathPaymentStrictSendOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `pathPaymentStrictSendOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `pathPaymentStrictSendOperationResponse.type`

```ts
type: pathPaymentStrictSend;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `pathPaymentStrictSendOperationResponse.type_i`

```ts
type_i: pathPaymentStrictSend;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.PaymentOperationResponse

```ts
interface PaymentOperationResponse extends BaseOperationResponse<OperationResponseType.payment, OperationResponseTypeI.payment> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  asset_code?: string;
  asset_issuer?: string;
  asset_type: AssetType;
  created_at: string;
  from: string;
  id: string;
  paging_token: string;
  source_account: string;
  to: string;
  to_muxed?: string;
  to_muxed_id?: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: payment;
  type_i: payment;
}
```

**Source:** [src/horizon/horizon_api.ts:280](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L280)

### `paymentOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `paymentOperationResponse.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:289](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L289)

### `paymentOperationResponse.asset_code`

```ts
asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:287](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L287)

### `paymentOperationResponse.asset_issuer`

```ts
asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:288](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L288)

### `paymentOperationResponse.asset_type`

```ts
asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:286](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L286)

### `paymentOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `paymentOperationResponse.from`

```ts
from: string;
```

**Source:** [src/horizon/horizon_api.ts:284](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L284)

### `paymentOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `paymentOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `paymentOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `paymentOperationResponse.to`

```ts
to: string;
```

**Source:** [src/horizon/horizon_api.ts:285](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L285)

### `paymentOperationResponse.to_muxed`

```ts
to_muxed?: string;
```

**Source:** [src/horizon/horizon_api.ts:290](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L290)

### `paymentOperationResponse.to_muxed_id`

```ts
to_muxed_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:291](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L291)

### `paymentOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `paymentOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `paymentOperationResponse.type`

```ts
type: payment;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `paymentOperationResponse.type_i`

```ts
type_i: payment;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.Predicate

```ts
interface Predicate {
  abs_before?: string;
  and?: Predicate[];
  not?: Predicate;
  or?: Predicate[];
  rel_before?: string;
}
```

**Source:** [src/horizon/horizon_api.ts:439](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L439)

### `predicate.abs_before`

```ts
abs_before?: string;
```

**Source:** [src/horizon/horizon_api.ts:443](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L443)

### `predicate.and`

```ts
and?: Predicate[];
```

**Source:** [src/horizon/horizon_api.ts:440](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L440)

### `predicate.not`

```ts
not?: Predicate;
```

**Source:** [src/horizon/horizon_api.ts:442](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L442)

### `predicate.or`

```ts
or?: Predicate[];
```

**Source:** [src/horizon/horizon_api.ts:441](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L441)

### `predicate.rel_before`

```ts
rel_before?: string;
```

**Source:** [src/horizon/horizon_api.ts:444](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L444)

## Horizon.HorizonApi.PriceR

```ts
interface PriceR {
  denominator: number;
  numerator: number;
}
```

**Source:** [src/horizon/horizon_api.ts:140](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L140)

### `priceR.denominator`

```ts
denominator: number;
```

**Source:** [src/horizon/horizon_api.ts:142](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L142)

### `priceR.numerator`

```ts
numerator: number;
```

**Source:** [src/horizon/horizon_api.ts:141](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L141)

## Horizon.HorizonApi.PriceRShorthand

```ts
interface PriceRShorthand {
  d: number;
  n: number;
}
```

**Source:** [src/horizon/horizon_api.ts:145](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L145)

### `priceRShorthand.d`

```ts
d: number;
```

**Source:** [src/horizon/horizon_api.ts:147](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L147)

### `priceRShorthand.n`

```ts
n: number;
```

**Source:** [src/horizon/horizon_api.ts:146](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L146)

## Horizon.HorizonApi.Reserve

```ts
interface Reserve {
  amount: string;
  asset: string;
}
```

**Source:** [src/horizon/horizon_api.ts:529](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L529)

### `reserve.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:531](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L531)

### `reserve.asset`

```ts
asset: string;
```

**Source:** [src/horizon/horizon_api.ts:530](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L530)

## Horizon.HorizonApi.ResponseCollection

```ts
interface ResponseCollection<T extends BaseResponse = BaseResponse> {
  _embedded: { records: T[] };
  _links: { next: ResponseLink; prev: ResponseLink; self: ResponseLink };
}
```

**Source:** [src/horizon/horizon_api.ts:594](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L594)

### `responseCollection._embedded`

```ts
_embedded: { records: T[] };
```

**Source:** [src/horizon/horizon_api.ts:600](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L600)

### `responseCollection._links`

```ts
_links: { next: ResponseLink; prev: ResponseLink; self: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:595](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L595)

## Horizon.HorizonApi.ResponseLink

```ts
interface ResponseLink {
  href: string;
  templated?: boolean;
}
```

**Source:** [src/horizon/horizon_api.ts:5](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L5)

### `responseLink.href`

```ts
href: string;
```

**Source:** [src/horizon/horizon_api.ts:6](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L6)

### `responseLink.templated`

```ts
templated?: boolean;
```

**Source:** [src/horizon/horizon_api.ts:7](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L7)

## Horizon.HorizonApi.RestoreFootprintOperationResponse

```ts
interface RestoreFootprintOperationResponse extends BaseOperationResponse<OperationResponseType.restoreFootprint, OperationResponseTypeI.restoreFootprint> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  id: string;
  paging_token: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: restoreFootprint;
  type_i: restoreFootprint;
}
```

**Source:** [src/horizon/horizon_api.ts:589](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L589)

### `restoreFootprintOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `restoreFootprintOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `restoreFootprintOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `restoreFootprintOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `restoreFootprintOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `restoreFootprintOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `restoreFootprintOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `restoreFootprintOperationResponse.type`

```ts
type: restoreFootprint;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `restoreFootprintOperationResponse.type_i`

```ts
type_i: restoreFootprint;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.RevokeSponsorshipOperationResponse

```ts
interface RevokeSponsorshipOperationResponse extends BaseOperationResponse<OperationResponseType.revokeSponsorship, OperationResponseTypeI.revokeSponsorship> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  account_id?: string;
  claimable_balance_id?: string;
  created_at: string;
  data_account_id?: string;
  data_name?: string;
  id: string;
  offer_id?: string;
  paging_token: string;
  signer_account_id?: string;
  signer_key?: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  trustline_account_id?: string;
  trustline_asset?: string;
  trustline_liquidity_pool_id?: string;
  type: revokeSponsorship;
  type_i: revokeSponsorship;
}
```

**Source:** [src/horizon/horizon_api.ts:484](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L484)

### `revokeSponsorshipOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `revokeSponsorshipOperationResponse.account_id`

```ts
account_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:488](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L488)

### `revokeSponsorshipOperationResponse.claimable_balance_id`

```ts
claimable_balance_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:489](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L489)

### `revokeSponsorshipOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `revokeSponsorshipOperationResponse.data_account_id`

```ts
data_account_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:490](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L490)

### `revokeSponsorshipOperationResponse.data_name`

```ts
data_name?: string;
```

**Source:** [src/horizon/horizon_api.ts:491](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L491)

### `revokeSponsorshipOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `revokeSponsorshipOperationResponse.offer_id`

```ts
offer_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:492](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L492)

### `revokeSponsorshipOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `revokeSponsorshipOperationResponse.signer_account_id`

```ts
signer_account_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:496](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L496)

### `revokeSponsorshipOperationResponse.signer_key`

```ts
signer_key?: string;
```

**Source:** [src/horizon/horizon_api.ts:497](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L497)

### `revokeSponsorshipOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `revokeSponsorshipOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `revokeSponsorshipOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `revokeSponsorshipOperationResponse.trustline_account_id`

```ts
trustline_account_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:493](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L493)

### `revokeSponsorshipOperationResponse.trustline_asset`

```ts
trustline_asset?: string;
```

**Source:** [src/horizon/horizon_api.ts:494](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L494)

### `revokeSponsorshipOperationResponse.trustline_liquidity_pool_id`

```ts
trustline_liquidity_pool_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:495](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L495)

### `revokeSponsorshipOperationResponse.type`

```ts
type: revokeSponsorship;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `revokeSponsorshipOperationResponse.type_i`

```ts
type_i: revokeSponsorship;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.RootResponse

```ts
interface RootResponse {
  core_latest_ledger: number;
  core_supported_protocol_version: number;
  core_version: string;
  current_protocol_version: number;
  history_elder_ledger: number;
  history_latest_ledger: number;
  history_latest_ledger_closed_at: string;
  horizon_version: string;
  ingest_latest_ledger: number;
  network_passphrase: string;
  supported_protocol_version: number;
}
```

**Source:** [src/horizon/horizon_api.ts:686](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L686)

### `rootResponse.core_latest_ledger`

```ts
core_latest_ledger: number;
```

**Source:** [src/horizon/horizon_api.ts:693](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L693)

### `rootResponse.core_supported_protocol_version`

```ts
core_supported_protocol_version: number;
```

**Source:** [src/horizon/horizon_api.ts:697](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L697)

### `rootResponse.core_version`

```ts
core_version: string;
```

**Source:** [src/horizon/horizon_api.ts:688](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L688)

### `rootResponse.current_protocol_version`

```ts
current_protocol_version: number;
```

**Source:** [src/horizon/horizon_api.ts:695](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L695)

### `rootResponse.history_elder_ledger`

```ts
history_elder_ledger: number;
```

**Source:** [src/horizon/horizon_api.ts:692](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L692)

### `rootResponse.history_latest_ledger`

```ts
history_latest_ledger: number;
```

**Source:** [src/horizon/horizon_api.ts:690](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L690)

### `rootResponse.history_latest_ledger_closed_at`

```ts
history_latest_ledger_closed_at: string;
```

**Source:** [src/horizon/horizon_api.ts:691](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L691)

### `rootResponse.horizon_version`

```ts
horizon_version: string;
```

**Source:** [src/horizon/horizon_api.ts:687](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L687)

### `rootResponse.ingest_latest_ledger`

```ts
ingest_latest_ledger: number;
```

**Source:** [src/horizon/horizon_api.ts:689](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L689)

### `rootResponse.network_passphrase`

```ts
network_passphrase: string;
```

**Source:** [src/horizon/horizon_api.ts:694](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L694)

### `rootResponse.supported_protocol_version`

```ts
supported_protocol_version: number;
```

**Source:** [src/horizon/horizon_api.ts:696](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L696)

## Horizon.HorizonApi.SetOptionsOperationResponse

```ts
interface SetOptionsOperationResponse extends BaseOperationResponse<OperationResponseType.setOptions, OperationResponseTypeI.setOptions> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  clear_flags: (1 | 2 | 4)[];
  clear_flags_s: ("auth_required_flag" | "auth_revocable_flag" | "auth_clawback_enabled_flag")[];
  created_at: string;
  high_threshold?: number;
  home_domain?: string;
  id: string;
  low_threshold?: number;
  master_key_weight?: number;
  med_threshold?: number;
  paging_token: string;
  set_flags: (1 | 2 | 4)[];
  set_flags_s: ("auth_required_flag" | "auth_revocable_flag" | "auth_clawback_enabled_flag")[];
  signer_key?: string;
  signer_weight?: number;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: setOptions;
  type_i: setOptions;
}
```

**Source:** [src/horizon/horizon_api.ts:365](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L365)

### `setOptionsOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `setOptionsOperationResponse.clear_flags`

```ts
clear_flags: (1 | 2 | 4)[];
```

**Source:** [src/horizon/horizon_api.ts:382](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L382)

### `setOptionsOperationResponse.clear_flags_s`

```ts
clear_flags_s: ("auth_required_flag" | "auth_revocable_flag" | "auth_clawback_enabled_flag")[];
```

**Source:** [src/horizon/horizon_api.ts:383](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L383)

### `setOptionsOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `setOptionsOperationResponse.high_threshold`

```ts
high_threshold?: number;
```

**Source:** [src/horizon/horizon_api.ts:374](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L374)

### `setOptionsOperationResponse.home_domain`

```ts
home_domain?: string;
```

**Source:** [src/horizon/horizon_api.ts:375](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L375)

### `setOptionsOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `setOptionsOperationResponse.low_threshold`

```ts
low_threshold?: number;
```

**Source:** [src/horizon/horizon_api.ts:372](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L372)

### `setOptionsOperationResponse.master_key_weight`

```ts
master_key_weight?: number;
```

**Source:** [src/horizon/horizon_api.ts:371](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L371)

### `setOptionsOperationResponse.med_threshold`

```ts
med_threshold?: number;
```

**Source:** [src/horizon/horizon_api.ts:373](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L373)

### `setOptionsOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `setOptionsOperationResponse.set_flags`

```ts
set_flags: (1 | 2 | 4)[];
```

**Source:** [src/horizon/horizon_api.ts:376](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L376)

### `setOptionsOperationResponse.set_flags_s`

```ts
set_flags_s: ("auth_required_flag" | "auth_revocable_flag" | "auth_clawback_enabled_flag")[];
```

**Source:** [src/horizon/horizon_api.ts:377](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L377)

### `setOptionsOperationResponse.signer_key`

```ts
signer_key?: string;
```

**Source:** [src/horizon/horizon_api.ts:369](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L369)

### `setOptionsOperationResponse.signer_weight`

```ts
signer_weight?: number;
```

**Source:** [src/horizon/horizon_api.ts:370](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L370)

### `setOptionsOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `setOptionsOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `setOptionsOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `setOptionsOperationResponse.type`

```ts
type: setOptions;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `setOptionsOperationResponse.type_i`

```ts
type_i: setOptions;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.SetTrustLineFlagsOperationResponse

```ts
interface SetTrustLineFlagsOperationResponse extends BaseOperationResponse<OperationResponseType.setTrustLineFlags, OperationResponseTypeI.setTrustLineFlags> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  asset_code: string;
  asset_issuer: string;
  asset_type: AssetType;
  clear_flags: (1 | 2 | 4)[];
  created_at: string;
  id: string;
  paging_token: string;
  set_flags: (1 | 2 | 4)[];
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  trustor: string;
  type: setTrustLineFlags;
  type_i: setTrustLineFlags;
}
```

**Source:** [src/horizon/horizon_api.ts:518](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L518)

### `setTrustLineFlagsOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `setTrustLineFlagsOperationResponse.asset_code`

```ts
asset_code: string;
```

**Source:** [src/horizon/horizon_api.ts:523](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L523)

### `setTrustLineFlagsOperationResponse.asset_issuer`

```ts
asset_issuer: string;
```

**Source:** [src/horizon/horizon_api.ts:524](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L524)

### `setTrustLineFlagsOperationResponse.asset_type`

```ts
asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:522](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L522)

### `setTrustLineFlagsOperationResponse.clear_flags`

```ts
clear_flags: (1 | 2 | 4)[];
```

**Source:** [src/horizon/horizon_api.ts:527](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L527)

### `setTrustLineFlagsOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `setTrustLineFlagsOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `setTrustLineFlagsOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `setTrustLineFlagsOperationResponse.set_flags`

```ts
set_flags: (1 | 2 | 4)[];
```

**Source:** [src/horizon/horizon_api.ts:526](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L526)

### `setTrustLineFlagsOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `setTrustLineFlagsOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `setTrustLineFlagsOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `setTrustLineFlagsOperationResponse.trustor`

```ts
trustor: string;
```

**Source:** [src/horizon/horizon_api.ts:525](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L525)

### `setTrustLineFlagsOperationResponse.type`

```ts
type: setTrustLineFlags;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `setTrustLineFlagsOperationResponse.type_i`

```ts
type_i: setTrustLineFlags;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.HorizonApi.SubmitAsyncTransactionResponse

```ts
interface SubmitAsyncTransactionResponse {
  error_result_xdr: string;
  hash: string;
  tx_status: string;
}
```

**Source:** [src/horizon/horizon_api.ts:23](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L23)

### `submitAsyncTransactionResponse.error_result_xdr`

```ts
error_result_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:26](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L26)

### `submitAsyncTransactionResponse.hash`

```ts
hash: string;
```

**Source:** [src/horizon/horizon_api.ts:24](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L24)

### `submitAsyncTransactionResponse.tx_status`

```ts
tx_status: string;
```

**Source:** [src/horizon/horizon_api.ts:25](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L25)

## Horizon.HorizonApi.SubmitTransactionResponse

```ts
interface SubmitTransactionResponse {
  envelope_xdr: string;
  hash: string;
  ledger: number;
  paging_token: string;
  result_meta_xdr: string;
  result_xdr: string;
  successful: boolean;
}
```

**Source:** [src/horizon/horizon_api.ts:13](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L13)

### `submitTransactionResponse.envelope_xdr`

```ts
envelope_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:17](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L17)

### `submitTransactionResponse.hash`

```ts
hash: string;
```

**Source:** [src/horizon/horizon_api.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L14)

### `submitTransactionResponse.ledger`

```ts
ledger: number;
```

**Source:** [src/horizon/horizon_api.ts:15](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L15)

### `submitTransactionResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:20](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L20)

### `submitTransactionResponse.result_meta_xdr`

```ts
result_meta_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:19](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L19)

### `submitTransactionResponse.result_xdr`

```ts
result_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:18](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L18)

### `submitTransactionResponse.successful`

```ts
successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:16](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L16)

## Horizon.HorizonApi.TransactionFailedExtras

```ts
interface TransactionFailedExtras {
  envelope_xdr: string;
  result_codes: { operations: string[]; transaction: TransactionFailedResultCodes };
  result_xdr: string;
}
```

**Source:** [src/horizon/horizon_api.ts:677](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L677)

### `transactionFailedExtras.envelope_xdr`

```ts
envelope_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:678](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L678)

### `transactionFailedExtras.result_codes`

```ts
result_codes: { operations: string[]; transaction: TransactionFailedResultCodes };
```

**Source:** [src/horizon/horizon_api.ts:679](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L679)

### `transactionFailedExtras.result_xdr`

```ts
result_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:683](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L683)

## Horizon.HorizonApi.TransactionFailedResultCodes

```ts
enum TransactionFailedResultCodes
```

**Source:** [src/horizon/horizon_api.ts:659](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L659)

## Horizon.HorizonApi.TransactionPreconditions

```ts
interface TransactionPreconditions {
  extra_signers?: string[];
  ledgerbounds?: { max_ledger: number; min_ledger: number };
  min_account_sequence?: string;
  min_account_sequence_age?: string;
  min_account_sequence_ledger_gap?: number;
  timebounds?: { max_time: string; min_time: string };
}
```

**Source:** [src/horizon/horizon_api.ts:40](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L40)

### `transactionPreconditions.extra_signers`

```ts
extra_signers?: string[];
```

**Source:** [src/horizon/horizon_api.ts:52](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L52)

### `transactionPreconditions.ledgerbounds`

```ts
ledgerbounds?: { max_ledger: number; min_ledger: number };
```

**Source:** [src/horizon/horizon_api.ts:45](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L45)

### `transactionPreconditions.min_account_sequence`

```ts
min_account_sequence?: string;
```

**Source:** [src/horizon/horizon_api.ts:49](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L49)

### `transactionPreconditions.min_account_sequence_age`

```ts
min_account_sequence_age?: string;
```

**Source:** [src/horizon/horizon_api.ts:50](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L50)

### `transactionPreconditions.min_account_sequence_ledger_gap`

```ts
min_account_sequence_ledger_gap?: number;
```

**Source:** [src/horizon/horizon_api.ts:51](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L51)

### `transactionPreconditions.timebounds`

```ts
timebounds?: { max_time: string; min_time: string };
```

**Source:** [src/horizon/horizon_api.ts:41](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L41)

## Horizon.HorizonApi.TransactionResponse

```ts
interface TransactionResponse extends SubmitTransactionResponse, BaseResponse<"account" | "ledger" | "operations" | "effects" | "succeeds" | "precedes"> {
  _links: { account: ResponseLink; effects: ResponseLink; ledger: ResponseLink; operations: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink };
  created_at: string;
  envelope_xdr: string;
  fee_account: string;
  fee_bump_transaction?: FeeBumpTransactionResponse;
  fee_charged: string | number;
  fee_meta_xdr: string;
  hash: string;
  id: string;
  inner_transaction?: InnerTransactionResponse;
  ledger: number;
  max_fee: string | number;
  memo?: string;
  memo_bytes?: string;
  memo_type: MemoType;
  operation_count: number;
  paging_token: string;
  preconditions?: TransactionPreconditions;
  result_meta_xdr: string;
  result_xdr: string;
  signatures: string[];
  source_account: string;
  source_account_sequence: string;
  successful: boolean;
}
```

**Source:** [src/horizon/horizon_api.ts:55](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L55)

### `transactionResponse._links`

```ts
_links: { account: ResponseLink; effects: ResponseLink; ledger: ResponseLink; operations: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `transactionResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:66](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L66)

### `transactionResponse.envelope_xdr`

```ts
envelope_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:17](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L17)

### `transactionResponse.fee_account`

```ts
fee_account: string;
```

**Source:** [src/horizon/horizon_api.ts:79](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L79)

### `transactionResponse.fee_bump_transaction`

```ts
fee_bump_transaction?: FeeBumpTransactionResponse;
```

**Source:** [src/horizon/horizon_api.ts:81](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L81)

### `transactionResponse.fee_charged`

```ts
fee_charged: string | number;
```

**Source:** [src/horizon/horizon_api.ts:68](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L68)

### `transactionResponse.fee_meta_xdr`

```ts
fee_meta_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:67](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L67)

### `transactionResponse.hash`

```ts
hash: string;
```

**Source:** [src/horizon/horizon_api.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L14)

### `transactionResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:70](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L70)

### `transactionResponse.inner_transaction`

```ts
inner_transaction?: InnerTransactionResponse;
```

**Source:** [src/horizon/horizon_api.ts:80](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L80)

### `transactionResponse.ledger`

```ts
ledger: number;
```

**Source:** [src/horizon/horizon_api.ts:15](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L15)

### `transactionResponse.max_fee`

```ts
max_fee: string | number;
```

**Source:** [src/horizon/horizon_api.ts:69](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L69)

### `transactionResponse.memo`

```ts
memo?: string;
```

**Source:** [src/horizon/horizon_api.ts:72](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L72)

### `transactionResponse.memo_bytes`

```ts
memo_bytes?: string;
```

**Source:** [src/horizon/horizon_api.ts:73](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L73)

### `transactionResponse.memo_type`

```ts
memo_type: MemoType;
```

**Source:** [src/horizon/horizon_api.ts:71](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L71)

### `transactionResponse.operation_count`

```ts
operation_count: number;
```

**Source:** [src/horizon/horizon_api.ts:74](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L74)

### `transactionResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:75](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L75)

### `transactionResponse.preconditions`

```ts
preconditions?: TransactionPreconditions;
```

**Source:** [src/horizon/horizon_api.ts:82](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L82)

### `transactionResponse.result_meta_xdr`

```ts
result_meta_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:19](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L19)

### `transactionResponse.result_xdr`

```ts
result_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:18](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L18)

### `transactionResponse.signatures`

```ts
signatures: string[];
```

**Source:** [src/horizon/horizon_api.ts:76](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L76)

### `transactionResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:77](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L77)

### `transactionResponse.source_account_sequence`

```ts
source_account_sequence: string;
```

**Source:** [src/horizon/horizon_api.ts:78](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L78)

### `transactionResponse.successful`

```ts
successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:16](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L16)

## Horizon.HorizonApi.TransactionResponseCollection

```ts
interface TransactionResponseCollection extends ResponseCollection<TransactionResponse> {
  _embedded: { records: TransactionResponse[] };
  _links: { next: ResponseLink; prev: ResponseLink; self: ResponseLink };
}
```

**Source:** [src/horizon/horizon_api.ts:604](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L604)

### `transactionResponseCollection._embedded`

```ts
_embedded: { records: TransactionResponse[] };
```

**Source:** [src/horizon/horizon_api.ts:600](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L600)

### `transactionResponseCollection._links`

```ts
_links: { next: ResponseLink; prev: ResponseLink; self: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:595](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L595)

## Horizon.HorizonApi.WithdrawLiquidityOperationResponse

```ts
interface WithdrawLiquidityOperationResponse extends BaseOperationResponse<OperationResponseType.liquidityPoolWithdraw, OperationResponseTypeI.liquidityPoolWithdraw> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  id: string;
  liquidity_pool_id: string;
  paging_token: string;
  reserves_min: Reserve[];
  reserves_received: Reserve[];
  shares: string;
  source_account: string;
  transaction_hash: string;
  transaction_successful: boolean;
  type: liquidityPoolWithdraw;
  type_i: liquidityPoolWithdraw;
}
```

**Source:** [src/horizon/horizon_api.ts:546](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L546)

### `withdrawLiquidityOperationResponse._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `withdrawLiquidityOperationResponse.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `withdrawLiquidityOperationResponse.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `withdrawLiquidityOperationResponse.liquidity_pool_id`

```ts
liquidity_pool_id: string;
```

**Source:** [src/horizon/horizon_api.ts:550](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L550)

### `withdrawLiquidityOperationResponse.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `withdrawLiquidityOperationResponse.reserves_min`

```ts
reserves_min: Reserve[];
```

**Source:** [src/horizon/horizon_api.ts:551](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L551)

### `withdrawLiquidityOperationResponse.reserves_received`

```ts
reserves_received: Reserve[];
```

**Source:** [src/horizon/horizon_api.ts:553](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L553)

### `withdrawLiquidityOperationResponse.shares`

```ts
shares: string;
```

**Source:** [src/horizon/horizon_api.ts:552](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L552)

### `withdrawLiquidityOperationResponse.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `withdrawLiquidityOperationResponse.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `withdrawLiquidityOperationResponse.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `withdrawLiquidityOperationResponse.type`

```ts
type: liquidityPoolWithdraw;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `withdrawLiquidityOperationResponse.type_i`

```ts
type_i: liquidityPoolWithdraw;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

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

**Source:** [src/horizon/horizon_axios_client.ts:33](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_axios_client.ts#L33)

## Horizon.Server

Server handles the network connection to a [Horizon](https://developers.stellar.org/docs/data/horizon)
instance and exposes an interface for requests to that instance.

```ts
class Server {
  constructor(serverURL: string, opts: Options = {});
  readonly httpClient: HttpClient;
  readonly serverURL: URL;
  accounts(): AccountCallBuilder;
  assets(): AssetsCallBuilder;
  checkMemoRequired(transaction: Transaction | FeeBumpTransaction): Promise<void>;
  claimableBalances(): ClaimableBalanceCallBuilder;
  effects(): EffectCallBuilder;
  feeStats(): Promise<FeeStatsResponse>;
  fetchBaseFee(): Promise<number>;
  fetchTimebounds(seconds: number, _isRetry: boolean = false): Promise<Timebounds>;
  ledgers(): LedgerCallBuilder;
  liquidityPools(): LiquidityPoolCallBuilder;
  loadAccount(accountId: string): Promise<AccountResponse>;
  offers(): OfferCallBuilder;
  operations(): OperationCallBuilder;
  orderbook(selling: Asset, buying: Asset): OrderbookCallBuilder;
  payments(): PaymentCallBuilder;
  root(): Promise<RootResponse>;
  strictReceivePaths(source: string | Asset[], destinationAsset: Asset, destinationAmount: string): PathCallBuilder;
  strictSendPaths(sourceAsset: Asset, sourceAmount: string, destination: string | Asset[]): PathCallBuilder;
  submitAsyncTransaction(transaction: Transaction | FeeBumpTransaction, opts: SubmitTransactionOptions = ...): Promise<SubmitAsyncTransactionResponse>;
  submitTransaction(transaction: Transaction | FeeBumpTransaction, opts: SubmitTransactionOptions = ...): Promise<SubmitTransactionResponse>;
  tradeAggregation(base: Asset, counter: Asset, start_time: number, end_time: number, resolution: number, offset: number): TradeAggregationCallBuilder;
  trades(): TradesCallBuilder;
  transactions(): TransactionCallBuilder;
}
```

**Source:** [src/horizon/server.ts:70](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L70)

### `new Server(serverURL, opts)`

```ts
constructor(serverURL: string, opts: Options = {});
```

**Parameters**

- **`serverURL`** — `string` (required)
- **`opts`** — `Options` (optional) (default: `{}`)

**Source:** [src/horizon/server.ts:95](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L95)

### `server.httpClient`

HTTP client instance for making requests to Horizon.
Exposes interceptors, defaults, and other configuration options.

```ts
readonly httpClient: HttpClient;
```

**Example**

```ts
// Add authentication header
server.httpClient.defaults.headers['Authorization'] = 'Bearer token';

// Add request interceptor
server.httpClient.interceptors.request.use((config) => {
  console.log('Request:', config.url);
  return config;
});
```

**Source:** [src/horizon/server.ts:94](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L94)

### `server.serverURL`

Horizon Server URL (ex. `https://horizon-testnet.stellar.org`)

TODO: Solve `this.serverURL`.

```ts
readonly serverURL: URL;
```

**Source:** [src/horizon/server.ts:76](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L76)

### `server.accounts()`

```ts
accounts(): AccountCallBuilder;
```

**Returns**

New `AccountCallBuilder` object configured by a current Horizon server configuration.

**Source:** [src/horizon/server.ts:601](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L601)

### `server.assets()`

Get a new `AssetsCallBuilder` instance configured with the current
Horizon server configuration.

```ts
assets(): AssetsCallBuilder;
```

**Returns**

New AssetsCallBuilder instance

**Source:** [src/horizon/server.ts:784](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L784)

### `server.checkMemoRequired(transaction)`

Check if any of the destination accounts requires a memo.

This function implements a memo required check as defined in
[SEP-29](https://stellar.org/protocol/sep-29). It will load each account
which is the destination and check if it has the data field
`config.memo_required` set to `"MQ=="`.

Each account is checked sequentially instead of loading multiple accounts
at the same time from Horizon.

```ts
checkMemoRequired(transaction: Transaction | FeeBumpTransaction): Promise<void>;
```

**Parameters**

- **`transaction`** — `Transaction | FeeBumpTransaction` (required) — The transaction to check.

**Returns**

- If any of the destination account
requires a memo, the promise will throw `AccountRequiresMemoError`.

**See also**

- `SEP-29: Account Memo Requirements`

**Source:** [src/horizon/server.ts:850](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L850)

### `server.claimableBalances()`

```ts
claimableBalances(): ClaimableBalanceCallBuilder;
```

**Returns**

New `ClaimableBalanceCallBuilder` object configured by a current Horizon server configuration.

**Source:** [src/horizon/server.ts:608](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L608)

### `server.effects()`

```ts
effects(): EffectCallBuilder;
```

**Returns**

New `EffectCallBuilder` instance configured with the current
Horizon server configuration

**Source:** [src/horizon/server.ts:765](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L765)

### `server.feeStats()`

Fetch the fee stats endpoint.

```ts
feeStats(): Promise<FeeStatsResponse>;
```

**Returns**

Promise that resolves to the fee stats returned by Horizon.

**See also**

- `Fee Stats`

**Source:** [src/horizon/server.ts:204](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L204)

### `server.fetchBaseFee()`

Fetch the base fee. Since this hits the server, if the server call fails,
you might get an error. You should be prepared to use a default value if
that happens!

```ts
fetchBaseFee(): Promise<number>;
```

**Returns**

Promise that resolves to the base fee.

**Source:** [src/horizon/server.ts:193](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L193)

### `server.fetchTimebounds(seconds, _isRetry)`

Get timebounds for N seconds from now, when you're creating a transaction
with `TransactionBuilder`.

By default, `TransactionBuilder` uses the current local time, but
your machine's local time could be different from Horizon's. This gives you
more assurance that your timebounds will reflect what you want.

Note that this will generate your timebounds when you **init the transaction**,
not when you build or submit the transaction! So give yourself enough time to get
the transaction built and signed before submitting.

```ts
fetchTimebounds(seconds: number, _isRetry: boolean = false): Promise<Timebounds>;
```

**Parameters**

- **`seconds`** — `number` (required) — Number of seconds past the current time to wait.
- **`_isRetry`** — `boolean` (optional) (default: `false`) — (optional) True if this is a retry. Only set this internally!
  This is to avoid a scenario where Horizon is horking up the wrong date.

**Returns**

Promise that resolves a `Timebounds` object
(with the shape `{ minTime: 0, maxTime: N }`) that you can set the `timebounds` option to.

**Example**

```ts
const transaction = new StellarSdk.TransactionBuilder(accountId, {
  fee: await StellarSdk.Server.fetchBaseFee(),
  timebounds: await StellarSdk.Server.fetchTimebounds(100)
})
  .addOperation(operation)
  // normally we would need to call setTimeout here, but setting timebounds
  // earlier does the trick!
  .build();
```

**Source:** [src/horizon/server.ts:155](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L155)

### `server.ledgers()`

```ts
ledgers(): LedgerCallBuilder;
```

**Returns**

New `LedgerCallBuilder` object configured by a current Horizon server configuration.

**Source:** [src/horizon/server.ts:615](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L615)

### `server.liquidityPools()`

```ts
liquidityPools(): LiquidityPoolCallBuilder;
```

**Returns**

New `LiquidityPoolCallBuilder`
    object configured to the current Horizon server settings.

**Source:** [src/horizon/server.ts:680](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L680)

### `server.loadAccount(accountId)`

Fetches an account's most current state in the ledger, then creates and
returns an `AccountResponse` object.

```ts
loadAccount(accountId: string): Promise<AccountResponse>;
```

**Parameters**

- **`accountId`** — `string` (required) — The account to load.

**Returns**

Returns a promise to the `AccountResponse` object
with populated sequence number.

**Source:** [src/horizon/server.ts:797](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L797)

### `server.offers()`

People on the Stellar network can make offers to buy or sell assets. This endpoint represents all the offers on the DEX.

You can query all offers for account using the function `.accountId`.

```ts
offers(): OfferCallBuilder;
```

**Returns**

New `OfferCallBuilder` object

**Example**

```ts
server.offers()
  .forAccount(accountId).call()
  .then(function(offers) {
    console.log(offers);
  });
```

**Source:** [src/horizon/server.ts:642](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L642)

### `server.operations()`

```ts
operations(): OperationCallBuilder;
```

**Returns**

New `OperationCallBuilder` object configured by a current Horizon server configuration.

**Source:** [src/horizon/server.ts:672](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L672)

### `server.orderbook(selling, buying)`

```ts
orderbook(selling: Asset, buying: Asset): OrderbookCallBuilder;
```

**Parameters**

- **`selling`** — `Asset` (required) — Asset being sold
- **`buying`** — `Asset` (required) — Asset being bought

**Returns**

New `OrderbookCallBuilder` object configured by a current Horizon server configuration.

**Source:** [src/horizon/server.ts:651](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L651)

### `server.payments()`

```ts
payments(): PaymentCallBuilder;
```

**Returns**

New `PaymentCallBuilder` instance configured with the current
Horizon server configuration.

**Source:** [src/horizon/server.ts:757](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L757)

### `server.root()`

Fetch the Horizon server's root endpoint.

```ts
root(): Promise<RootResponse>;
```

**Returns**

Promise that resolves to the root endpoint returned by Horizon.

**Source:** [src/horizon/server.ts:217](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L217)

### `server.strictReceivePaths(source, destinationAsset, destinationAmount)`

The Stellar Network allows payments to be made between assets through path
payments. A strict receive path payment specifies a series of assets to
route a payment through, from source asset (the asset debited from the
payer) to destination asset (the asset credited to the payee).

A strict receive path search is specified using:

* The destination address.
* The source address or source assets.
* The asset and amount that the destination account should receive.

As part of the search, horizon will load a list of assets available to the
source address and will find any payment paths from those source assets to
the desired destination asset. The search's amount parameter will be used
to determine if there a given path can satisfy a payment of the desired
amount.

If a list of assets is passed as the source, horizon will find any payment
paths from those source assets to the desired destination asset.

```ts
strictReceivePaths(source: string | Asset[], destinationAsset: Asset, destinationAmount: string): PathCallBuilder;
```

**Parameters**

- **`source`** — `string | Asset[]` (required) — The sender's account ID or a list of assets. Any returned path will use a source that the sender can hold.
- **`destinationAsset`** — `Asset` (required) — The destination asset.
- **`destinationAmount`** — `string` (required) — The amount, denominated in the destination asset, that any returned path should be able to satisfy.

**Returns**

New `StrictReceivePathCallBuilder` object configured with the current Horizon server configuration.

**Source:** [src/horizon/server.ts:710](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L710)

### `server.strictSendPaths(sourceAsset, sourceAmount, destination)`

The Stellar Network allows payments to be made between assets through path payments. A strict send path payment specifies a
series of assets to route a payment through, from source asset (the asset debited from the payer) to destination
asset (the asset credited to the payee).

A strict send path search is specified using:

The asset and amount that is being sent.
The destination account or the destination assets.

```ts
strictSendPaths(sourceAsset: Asset, sourceAmount: string, destination: string | Asset[]): PathCallBuilder;
```

**Parameters**

- **`sourceAsset`** — `Asset` (required) — The asset to be sent.
- **`sourceAmount`** — `string` (required) — The amount, denominated in the source asset, that any returned path should be able to satisfy.
- **`destination`** — `string | Asset[]` (required) — The destination account or the destination assets.

**Returns**

New `StrictSendPathCallBuilder` object configured with the current Horizon server configuration.

**Source:** [src/horizon/server.ts:739](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L739)

### `server.submitAsyncTransaction(transaction, opts)`

Submits an asynchronous transaction to the network. Unlike the synchronous version, which blocks
and waits for the transaction to be ingested in Horizon, this endpoint relays the response from
core directly back to the user.

By default, this function calls `HorizonServer.checkMemoRequired`, you can
skip this check by setting the option `skipMemoRequiredCheck` to `true`.

```ts
submitAsyncTransaction(transaction: Transaction | FeeBumpTransaction, opts: SubmitTransactionOptions = ...): Promise<SubmitAsyncTransactionResponse>;
```

**Parameters**

- **`transaction`** — `Transaction | FeeBumpTransaction` (required) — The transaction to submit.
- **`opts`** — `SubmitTransactionOptions` (optional) (default: `...`) — (optional) Options object
    - `skipMemoRequiredCheck` (optional): Allow skipping memo
  required check, default: `false`. See
  [SEP0029](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0029.md).

**Returns**

Promise that resolves or rejects with response from
horizon.

**See also**

- [Submit-Async-Transaction](https://developers.stellar.org/docs/data/horizon/api-reference/resources/submit-async-transaction)

**Source:** [src/horizon/server.ts:559](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L559)

### `server.submitTransaction(transaction, opts)`

Submits a transaction to the network.

By default this function calls `Horizon.Server.checkMemoRequired`, you can
skip this check by setting the option `skipMemoRequiredCheck` to `true`.

If you submit any number of `manageOffer` operations, this will add an
attribute to the response that will help you analyze what happened with
your offers.

For example, you'll want to examine `offerResults` to add affordances like
these to your app:
- If `wasImmediatelyFilled` is true, then no offer was created. So if you
  normally watch the `Server.offers` endpoint for offer updates, you
  instead need to check `Server.trades` to find the result of this filled
  offer.
- If `wasImmediatelyDeleted` is true, then the offer you submitted was
  deleted without reaching the orderbook or being matched (possibly because
  your amounts were rounded down to zero). So treat the just-submitted
  offer request as if it never happened.
- If `wasPartiallyFilled` is true, you can tell the user that
  `amountBought` or `amountSold` have already been transferred.

```ts
submitTransaction(transaction: Transaction | FeeBumpTransaction, opts: SubmitTransactionOptions = ...): Promise<SubmitTransactionResponse>;
```

**Parameters**

- **`transaction`** — `Transaction | FeeBumpTransaction` (required) — The transaction to submit.
- **`opts`** — `SubmitTransactionOptions` (optional) (default: `...`) — (optional) Options object
    - `skipMemoRequiredCheck` (optional): Allow skipping memo
  required check, default: `false`. See
  [SEP0029](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0029.md).

**Returns**

Promise that resolves or rejects with response from
horizon.

**Example**

```ts
const res = {
  ...response,
  offerResults: [
    {
      // Exact ordered list of offers that executed, with the exception
      // that the last one may not have executed entirely.
      offersClaimed: [
        sellerId: String,
        offerId: String,
        assetSold: {
          type: 'native|credit_alphanum4|credit_alphanum12',

          // these are only present if the asset is not native
          assetCode: String,
          issuer: String,
        },

        // same shape as assetSold
        assetBought: {}
      ],

      // What effect your manageOffer op had
      effect: "manageOfferCreated|manageOfferUpdated|manageOfferDeleted",

      // Whether your offer immediately got matched and filled
      wasImmediatelyFilled: Boolean,

      // Whether your offer immediately got deleted, if for example the order was too small
      wasImmediatelyDeleted: Boolean,

      // Whether the offer was partially, but not completely, filled
      wasPartiallyFilled: Boolean,

      // The full requested amount of the offer is open for matching
      isFullyOpen: Boolean,

      // The total amount of tokens bought / sold during transaction execution
      amountBought: Number,
      amountSold: Number,

      // if the offer was created, updated, or partially filled, this is
      // the outstanding offer
      currentOffer: {
        offerId: String,
        amount: String,
        price: {
          n: String,
          d: String,
        },

        selling: {
          type: 'native|credit_alphanum4|credit_alphanum12',

          // these are only present if the asset is not native
          assetCode: String,
          issuer: String,
        },

        // same as `selling`
        buying: {},
      },

      // the index of this particular operation in the op stack
      operationIndex: Number
    }
  ]
}
```

**See also**

- `Submit a Transaction`

**Source:** [src/horizon/server.ts:328](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L328)

### `server.tradeAggregation(base, counter, start_time, end_time, resolution, offset)`

```ts
tradeAggregation(base: Asset, counter: Asset, start_time: number, end_time: number, resolution: number, offset: number): TradeAggregationCallBuilder;
```

**Parameters**

- **`base`** — `Asset` (required) — base asset
- **`counter`** — `Asset` (required) — counter asset
- **`start_time`** — `number` (required) — lower time boundary represented as millis since epoch
- **`end_time`** — `number` (required) — upper time boundary represented as millis since epoch
- **`resolution`** — `number` (required) — segment duration as millis since epoch. *Supported values are 5 minutes (300000), 15 minutes (900000), 1 hour (3600000), 1 day (86400000) and 1 week (604800000).
- **`offset`** — `number` (required) — segments can be offset using this parameter. Expressed in milliseconds. *Can only be used if the resolution is greater than 1 hour. Value must be in whole hours, less than the provided resolution, and less than 24 hours.
  Returns new `TradeAggregationCallBuilder` object configured with the current Horizon server configuration.

**Returns**

New TradeAggregationCallBuilder instance

**Source:** [src/horizon/server.ts:814](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L814)

### `server.trades()`

Returns

```ts
trades(): TradesCallBuilder;
```

**Returns**

New `TradesCallBuilder` object configured by a current Horizon server configuration.

**Source:** [src/horizon/server.ts:665](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L665)

### `server.transactions()`

```ts
transactions(): TransactionCallBuilder;
```

**Returns**

New `TransactionCallBuilder` object configured by a current Horizon server configuration.

**Source:** [src/horizon/server.ts:622](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L622)

## Horizon.Server.Options

Options for configuring connections to Horizon servers.

```ts
interface Options {
  allowHttp?: boolean;
  appName?: string;
  appVersion?: string;
  authToken?: string;
  headers?: Record<string, string>;
}
```

**Source:** [src/horizon/server.ts:917](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L917)

### `options.allowHttp`

Allow connecting to http servers, default: `false`. This must be set to false in production deployments! You can also use `Config` class to set this globally.

```ts
allowHttp?: boolean;
```

**Source:** [src/horizon/server.ts:919](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L919)

### `options.appName`

Allow set custom header `X-App-Name`, default: `undefined`.

```ts
appName?: string;
```

**Source:** [src/horizon/server.ts:921](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L921)

### `options.appVersion`

Allow set custom header `X-App-Version`, default: `undefined`.

```ts
appVersion?: string;
```

**Source:** [src/horizon/server.ts:923](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L923)

### `options.authToken`

Allow set custom header `X-Auth-Token`, default: `undefined`.

```ts
authToken?: string;
```

**Source:** [src/horizon/server.ts:925](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L925)

### `options.headers`

```ts
headers?: Record<string, string>;
```

**Source:** [src/horizon/server.ts:926](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L926)

## Horizon.Server.SubmitTransactionOptions

```ts
interface SubmitTransactionOptions {
  skipMemoRequiredCheck?: boolean;
}
```

**Source:** [src/horizon/server.ts:934](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L934)

### `submitTransactionOptions.skipMemoRequiredCheck`

```ts
skipMemoRequiredCheck?: boolean;
```

**Source:** [src/horizon/server.ts:935](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L935)

## Horizon.Server.Timebounds

```ts
interface Timebounds {
  maxTime: number;
  minTime: number;
}
```

**Source:** [src/horizon/server.ts:929](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L929)

### `timebounds.maxTime`

```ts
maxTime: number;
```

**Source:** [src/horizon/server.ts:931](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L931)

### `timebounds.minTime`

```ts
minTime: number;
```

**Source:** [src/horizon/server.ts:930](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server.ts#L930)

## Horizon.ServerApi.AccountMergeOperationRecord

```ts
interface AccountMergeOperationRecord extends BaseOperationRecord<OperationResponseType.accountMerge, OperationResponseTypeI.accountMerge>, AccountMergeOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  into: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: accountMerge;
  type_i: accountMerge;
}
```

**Source:** [src/horizon/server_api.ts:249](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L249)

### `accountMergeOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `accountMergeOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `accountMergeOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `accountMergeOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `accountMergeOperationRecord.into`

```ts
into: string;
```

**Source:** [src/horizon/horizon_api.ts:420](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L420)

### `accountMergeOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `accountMergeOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `accountMergeOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `accountMergeOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `accountMergeOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `accountMergeOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `accountMergeOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `accountMergeOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `accountMergeOperationRecord.type`

```ts
type: accountMerge;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `accountMergeOperationRecord.type_i`

```ts
type_i: accountMerge;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.AccountRecord

```ts
interface AccountRecord extends BaseResponse {
  _links: { self: ResponseLink };
  account_id: string;
  balances: (BalanceLineNative | BalanceLineLiquidityPool | BalanceLineAsset<"credit_alphanum4"> | BalanceLineAsset<"credit_alphanum12">)[];
  data: (options: { value: string }) => Promise<{ value: string }>;
  data_attr: { [key: string]: string };
  effects: CallCollectionFunction<EffectRecord>;
  flags: Flags;
  home_domain?: string;
  id: string;
  inflation_destination?: string;
  last_modified_ledger: number;
  last_modified_time: string;
  num_sponsored: number;
  num_sponsoring: number;
  offers: CallCollectionFunction<OfferRecord>;
  operations: CallCollectionFunction<OperationRecord>;
  paging_token: string;
  payments: CallCollectionFunction<PaymentOperationRecord>;
  sequence: string;
  sequence_ledger?: number;
  sequence_time?: string;
  signers: AccountRecordSigners[];
  sponsor?: string;
  subentry_count: number;
  thresholds: AccountThresholds;
  trades: CallCollectionFunction<TradeRecord>;
  transactions: CallCollectionFunction<TransactionRecord>;
}
```

**Source:** [src/horizon/server_api.ts:96](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L96)

### `accountRecord._links`

```ts
_links: { self: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `accountRecord.account_id`

```ts
account_id: string;
```

**Source:** [src/horizon/server_api.ts:99](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L99)

### `accountRecord.balances`

```ts
balances: (BalanceLineNative | BalanceLineLiquidityPool | BalanceLineAsset<"credit_alphanum4"> | BalanceLineAsset<"credit_alphanum12">)[];
```

**Source:** [src/horizon/server_api.ts:110](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L110)

### `accountRecord.data`

```ts
data: (options: { value: string }) => Promise<{ value: string }>;
```

**Source:** [src/horizon/server_api.ts:112](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L112)

### `accountRecord.data_attr`

```ts
data_attr: { [key: string]: string };
```

**Source:** [src/horizon/server_api.ts:113](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L113)

### `accountRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:120](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L120)

### `accountRecord.flags`

```ts
flags: Flags;
```

**Source:** [src/horizon/server_api.ts:109](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L109)

### `accountRecord.home_domain`

```ts
home_domain?: string;
```

**Source:** [src/horizon/server_api.ts:104](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L104)

### `accountRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/server_api.ts:97](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L97)

### `accountRecord.inflation_destination`

```ts
inflation_destination?: string;
```

**Source:** [src/horizon/server_api.ts:105](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L105)

### `accountRecord.last_modified_ledger`

```ts
last_modified_ledger: number;
```

**Source:** [src/horizon/server_api.ts:106](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L106)

### `accountRecord.last_modified_time`

```ts
last_modified_time: string;
```

**Source:** [src/horizon/server_api.ts:107](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L107)

### `accountRecord.num_sponsored`

```ts
num_sponsored: number;
```

**Source:** [src/horizon/server_api.ts:118](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L118)

### `accountRecord.num_sponsoring`

```ts
num_sponsoring: number;
```

**Source:** [src/horizon/server_api.ts:117](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L117)

### `accountRecord.offers`

```ts
offers: CallCollectionFunction<OfferRecord>;
```

**Source:** [src/horizon/server_api.ts:121](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L121)

### `accountRecord.operations`

```ts
operations: CallCollectionFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:122](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L122)

### `accountRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/server_api.ts:98](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L98)

### `accountRecord.payments`

```ts
payments: CallCollectionFunction<PaymentOperationRecord>;
```

**Source:** [src/horizon/server_api.ts:123](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L123)

### `accountRecord.sequence`

```ts
sequence: string;
```

**Source:** [src/horizon/server_api.ts:100](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L100)

### `accountRecord.sequence_ledger`

```ts
sequence_ledger?: number;
```

**Source:** [src/horizon/server_api.ts:101](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L101)

### `accountRecord.sequence_time`

```ts
sequence_time?: string;
```

**Source:** [src/horizon/server_api.ts:102](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L102)

### `accountRecord.signers`

```ts
signers: AccountRecordSigners[];
```

**Source:** [src/horizon/server_api.ts:111](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L111)

### `accountRecord.sponsor`

```ts
sponsor?: string;
```

**Source:** [src/horizon/server_api.ts:116](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L116)

### `accountRecord.subentry_count`

```ts
subentry_count: number;
```

**Source:** [src/horizon/server_api.ts:103](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L103)

### `accountRecord.thresholds`

```ts
thresholds: AccountThresholds;
```

**Source:** [src/horizon/server_api.ts:108](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L108)

### `accountRecord.trades`

```ts
trades: CallCollectionFunction<TradeRecord>;
```

**Source:** [src/horizon/server_api.ts:124](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L124)

### `accountRecord.transactions`

```ts
transactions: CallCollectionFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:119](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L119)

## Horizon.ServerApi.AccountRecordSigners

```ts
type AccountRecordSigners = AccountRecordSignersType
```

**Source:** [src/horizon/server_api.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L14)

## Horizon.ServerApi.AllowTrustOperationRecord

```ts
interface AllowTrustOperationRecord extends BaseOperationRecord<OperationResponseType.allowTrust, OperationResponseTypeI.allowTrust>, AllowTrustOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  asset_code: string;
  asset_issuer: string;
  asset_type: AssetType;
  authorize: boolean;
  authorize_to_maintain_liabilities: boolean;
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  trustee: string;
  trustor: string;
  type: allowTrust;
  type_i: allowTrust;
}
```

**Source:** [src/horizon/server_api.ts:242](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L242)

### `allowTrustOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `allowTrustOperationRecord.asset_code`

```ts
asset_code: string;
```

**Source:** [src/horizon/horizon_api.ts:409](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L409)

### `allowTrustOperationRecord.asset_issuer`

```ts
asset_issuer: string;
```

**Source:** [src/horizon/horizon_api.ts:410](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L410)

### `allowTrustOperationRecord.asset_type`

```ts
asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:408](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L408)

### `allowTrustOperationRecord.authorize`

```ts
authorize: boolean;
```

**Source:** [src/horizon/horizon_api.ts:411](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L411)

### `allowTrustOperationRecord.authorize_to_maintain_liabilities`

```ts
authorize_to_maintain_liabilities: boolean;
```

**Source:** [src/horizon/horizon_api.ts:412](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L412)

### `allowTrustOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `allowTrustOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `allowTrustOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `allowTrustOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `allowTrustOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `allowTrustOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `allowTrustOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `allowTrustOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `allowTrustOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `allowTrustOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `allowTrustOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `allowTrustOperationRecord.trustee`

```ts
trustee: string;
```

**Source:** [src/horizon/horizon_api.ts:413](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L413)

### `allowTrustOperationRecord.trustor`

```ts
trustor: string;
```

**Source:** [src/horizon/horizon_api.ts:414](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L414)

### `allowTrustOperationRecord.type`

```ts
type: allowTrust;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `allowTrustOperationRecord.type_i`

```ts
type_i: allowTrust;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.AssetRecord

```ts
type AssetRecord = AssetRecordType
```

**Source:** [src/horizon/server_api.ts:15](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L15)

## Horizon.ServerApi.BaseOperationRecord

```ts
interface BaseOperationRecord<T extends OperationResponseType = OperationResponseType, TI extends OperationResponseTypeI = OperationResponseTypeI> extends BaseOperationResponse<T, TI> {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: T;
  type_i: TI;
}
```

**Source:** [src/horizon/server_api.ts:173](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L173)

### `baseOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `baseOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `baseOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `baseOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `baseOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `baseOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `baseOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `baseOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `baseOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `baseOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `baseOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `baseOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `baseOperationRecord.type`

```ts
type: T;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `baseOperationRecord.type_i`

```ts
type_i: TI;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.BeginSponsoringFutureReservesOperationRecord

```ts
interface BeginSponsoringFutureReservesOperationRecord extends BaseOperationRecord<OperationResponseType.beginSponsoringFutureReserves, OperationResponseTypeI.beginSponsoringFutureReserves>, BeginSponsoringFutureReservesOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  sponsored_id: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: beginSponsoringFutureReserves;
  type_i: beginSponsoringFutureReserves;
}
```

**Source:** [src/horizon/server_api.ts:291](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L291)

### `beginSponsoringFutureReservesOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `beginSponsoringFutureReservesOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `beginSponsoringFutureReservesOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `beginSponsoringFutureReservesOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `beginSponsoringFutureReservesOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `beginSponsoringFutureReservesOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `beginSponsoringFutureReservesOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `beginSponsoringFutureReservesOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `beginSponsoringFutureReservesOperationRecord.sponsored_id`

```ts
sponsored_id: string;
```

**Source:** [src/horizon/horizon_api.ts:474](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L474)

### `beginSponsoringFutureReservesOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `beginSponsoringFutureReservesOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `beginSponsoringFutureReservesOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `beginSponsoringFutureReservesOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `beginSponsoringFutureReservesOperationRecord.type`

```ts
type: beginSponsoringFutureReserves;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `beginSponsoringFutureReservesOperationRecord.type_i`

```ts
type_i: beginSponsoringFutureReserves;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.BumpFootprintExpirationOperationRecord

```ts
interface BumpFootprintExpirationOperationRecord extends BaseOperationRecord<OperationResponseType.bumpFootprintExpiration, OperationResponseTypeI.bumpFootprintExpiration>, BumpFootprintExpirationOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  ledgers_to_expire: number;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: bumpFootprintExpiration;
  type_i: bumpFootprintExpiration;
}
```

**Source:** [src/horizon/server_api.ts:354](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L354)

### `bumpFootprintExpirationOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `bumpFootprintExpirationOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `bumpFootprintExpirationOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `bumpFootprintExpirationOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `bumpFootprintExpirationOperationRecord.ledgers_to_expire`

```ts
ledgers_to_expire: number;
```

**Source:** [src/horizon/horizon_api.ts:586](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L586)

### `bumpFootprintExpirationOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `bumpFootprintExpirationOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `bumpFootprintExpirationOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `bumpFootprintExpirationOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `bumpFootprintExpirationOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `bumpFootprintExpirationOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `bumpFootprintExpirationOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `bumpFootprintExpirationOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `bumpFootprintExpirationOperationRecord.type`

```ts
type: bumpFootprintExpiration;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `bumpFootprintExpirationOperationRecord.type_i`

```ts
type_i: bumpFootprintExpiration;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.BumpSequenceOperationRecord

```ts
interface BumpSequenceOperationRecord extends BaseOperationRecord<OperationResponseType.bumpSequence, OperationResponseTypeI.bumpSequence>, BumpSequenceOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  bump_to: string;
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: bumpSequence;
  type_i: bumpSequence;
}
```

**Source:** [src/horizon/server_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L270)

### `bumpSequenceOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `bumpSequenceOperationRecord.bump_to`

```ts
bump_to: string;
```

**Source:** [src/horizon/horizon_api.ts:437](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L437)

### `bumpSequenceOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `bumpSequenceOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `bumpSequenceOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `bumpSequenceOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `bumpSequenceOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `bumpSequenceOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `bumpSequenceOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `bumpSequenceOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `bumpSequenceOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `bumpSequenceOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `bumpSequenceOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `bumpSequenceOperationRecord.type`

```ts
type: bumpSequence;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `bumpSequenceOperationRecord.type_i`

```ts
type_i: bumpSequence;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.CallCollectionFunction

```ts
type CallCollectionFunction<T extends HorizonApi.BaseResponse = HorizonApi.BaseResponse> = (options?: CallFunctionTemplateOptions) => Promise<CollectionPage<T>>
```

**Source:** [src/horizon/server_api.ts:33](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L33)

## Horizon.ServerApi.CallFunction

```ts
type CallFunction<T extends HorizonApi.BaseResponse = HorizonApi.BaseResponse> = () => Promise<T>
```

**Source:** [src/horizon/server_api.ts:30](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L30)

## Horizon.ServerApi.CallFunctionTemplateOptions

```ts
interface CallFunctionTemplateOptions {
  cursor?: string | number;
  limit?: number;
  order?: "desc" | "asc";
}
```

**Source:** [src/horizon/server_api.ts:24](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L24)

### `callFunctionTemplateOptions.cursor`

```ts
cursor?: string | number;
```

**Source:** [src/horizon/server_api.ts:25](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L25)

### `callFunctionTemplateOptions.limit`

```ts
limit?: number;
```

**Source:** [src/horizon/server_api.ts:26](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L26)

### `callFunctionTemplateOptions.order`

```ts
order?: "desc" | "asc";
```

**Source:** [src/horizon/server_api.ts:27](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L27)

## Horizon.ServerApi.ChangeTrustOperationRecord

```ts
interface ChangeTrustOperationRecord extends BaseOperationRecord<OperationResponseType.changeTrust, OperationResponseTypeI.changeTrust>, ChangeTrustOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  asset_code?: string;
  asset_issuer?: string;
  asset_type: "credit_alphanum4" | "credit_alphanum12" | "liquidity_pool_shares";
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  limit: string;
  liquidity_pool_id?: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  trustee?: string;
  trustor: string;
  type: changeTrust;
  type_i: changeTrust;
}
```

**Source:** [src/horizon/server_api.ts:235](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L235)

### `changeTrustOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `changeTrustOperationRecord.asset_code`

```ts
asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:397](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L397)

### `changeTrustOperationRecord.asset_issuer`

```ts
asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:398](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L398)

### `changeTrustOperationRecord.asset_type`

```ts
asset_type: "credit_alphanum4" | "credit_alphanum12" | "liquidity_pool_shares";
```

**Source:** [src/horizon/horizon_api.ts:393](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L393)

### `changeTrustOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `changeTrustOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `changeTrustOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `changeTrustOperationRecord.limit`

```ts
limit: string;
```

**Source:** [src/horizon/horizon_api.ts:402](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L402)

### `changeTrustOperationRecord.liquidity_pool_id`

```ts
liquidity_pool_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:399](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L399)

### `changeTrustOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `changeTrustOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `changeTrustOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `changeTrustOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `changeTrustOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `changeTrustOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `changeTrustOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `changeTrustOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `changeTrustOperationRecord.trustee`

```ts
trustee?: string;
```

**Source:** [src/horizon/horizon_api.ts:400](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L400)

### `changeTrustOperationRecord.trustor`

```ts
trustor: string;
```

**Source:** [src/horizon/horizon_api.ts:401](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L401)

### `changeTrustOperationRecord.type`

```ts
type: changeTrust;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `changeTrustOperationRecord.type_i`

```ts
type_i: changeTrust;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.ClaimClaimableBalanceOperationRecord

```ts
interface ClaimClaimableBalanceOperationRecord extends BaseOperationRecord<OperationResponseType.claimClaimableBalance, OperationResponseTypeI.claimClaimableBalance>, ClaimClaimableBalanceOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  balance_id: string;
  claimant: string;
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: claimClaimableBalance;
  type_i: claimClaimableBalance;
}
```

**Source:** [src/horizon/server_api.ts:284](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L284)

### `claimClaimableBalanceOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `claimClaimableBalanceOperationRecord.balance_id`

```ts
balance_id: string;
```

**Source:** [src/horizon/horizon_api.ts:466](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L466)

### `claimClaimableBalanceOperationRecord.claimant`

```ts
claimant: string;
```

**Source:** [src/horizon/horizon_api.ts:467](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L467)

### `claimClaimableBalanceOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `claimClaimableBalanceOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `claimClaimableBalanceOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `claimClaimableBalanceOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `claimClaimableBalanceOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `claimClaimableBalanceOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `claimClaimableBalanceOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `claimClaimableBalanceOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `claimClaimableBalanceOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `claimClaimableBalanceOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `claimClaimableBalanceOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `claimClaimableBalanceOperationRecord.type`

```ts
type: claimClaimableBalance;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `claimClaimableBalanceOperationRecord.type_i`

```ts
type_i: claimClaimableBalance;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.ClaimableBalanceRecord

```ts
interface ClaimableBalanceRecord extends BaseResponse {
  _links: { self: ResponseLink };
  amount: string;
  asset: string;
  claimants: Claimant[];
  id: string;
  last_modified_ledger: number;
  paging_token: string;
  sponsor?: string;
}
```

**Source:** [src/horizon/server_api.ts:87](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L87)

### `claimableBalanceRecord._links`

```ts
_links: { self: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `claimableBalanceRecord.amount`

```ts
amount: string;
```

**Source:** [src/horizon/server_api.ts:91](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L91)

### `claimableBalanceRecord.asset`

```ts
asset: string;
```

**Source:** [src/horizon/server_api.ts:90](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L90)

### `claimableBalanceRecord.claimants`

```ts
claimants: Claimant[];
```

**Source:** [src/horizon/server_api.ts:94](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L94)

### `claimableBalanceRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/server_api.ts:88](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L88)

### `claimableBalanceRecord.last_modified_ledger`

```ts
last_modified_ledger: number;
```

**Source:** [src/horizon/server_api.ts:93](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L93)

### `claimableBalanceRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/server_api.ts:89](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L89)

### `claimableBalanceRecord.sponsor`

```ts
sponsor?: string;
```

**Source:** [src/horizon/server_api.ts:92](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L92)

## Horizon.ServerApi.ClawbackClaimableBalanceOperationRecord

```ts
interface ClawbackClaimableBalanceOperationRecord extends BaseOperationRecord<OperationResponseType.clawbackClaimableBalance, OperationResponseTypeI.clawbackClaimableBalance>, ClawbackClaimableBalanceOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  balance_id: string;
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: clawbackClaimableBalance;
  type_i: clawbackClaimableBalance;
}
```

**Source:** [src/horizon/server_api.ts:319](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L319)

### `clawbackClaimableBalanceOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `clawbackClaimableBalanceOperationRecord.balance_id`

```ts
balance_id: string;
```

**Source:** [src/horizon/horizon_api.ts:515](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L515)

### `clawbackClaimableBalanceOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `clawbackClaimableBalanceOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `clawbackClaimableBalanceOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `clawbackClaimableBalanceOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `clawbackClaimableBalanceOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `clawbackClaimableBalanceOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `clawbackClaimableBalanceOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `clawbackClaimableBalanceOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `clawbackClaimableBalanceOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `clawbackClaimableBalanceOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `clawbackClaimableBalanceOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `clawbackClaimableBalanceOperationRecord.type`

```ts
type: clawbackClaimableBalance;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `clawbackClaimableBalanceOperationRecord.type_i`

```ts
type_i: clawbackClaimableBalance;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.ClawbackOperationRecord

```ts
interface ClawbackOperationRecord extends BaseOperationRecord<OperationResponseType.clawback, OperationResponseTypeI.clawback>, ClawbackOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  asset_code: string;
  asset_issuer: string;
  asset_type: AssetType;
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  from: string;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: clawback;
  type_i: clawback;
}
```

**Source:** [src/horizon/server_api.ts:312](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L312)

### `clawbackOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `clawbackOperationRecord.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:508](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L508)

### `clawbackOperationRecord.asset_code`

```ts
asset_code: string;
```

**Source:** [src/horizon/horizon_api.ts:505](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L505)

### `clawbackOperationRecord.asset_issuer`

```ts
asset_issuer: string;
```

**Source:** [src/horizon/horizon_api.ts:506](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L506)

### `clawbackOperationRecord.asset_type`

```ts
asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:504](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L504)

### `clawbackOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `clawbackOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `clawbackOperationRecord.from`

```ts
from: string;
```

**Source:** [src/horizon/horizon_api.ts:507](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L507)

### `clawbackOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `clawbackOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `clawbackOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `clawbackOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `clawbackOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `clawbackOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `clawbackOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `clawbackOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `clawbackOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `clawbackOperationRecord.type`

```ts
type: clawback;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `clawbackOperationRecord.type_i`

```ts
type_i: clawback;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.CollectionPage

```ts
interface CollectionPage<T extends HorizonApi.BaseResponse = HorizonApi.BaseResponse> {
  next: () => Promise<CollectionPage<T>>;
  prev: () => Promise<CollectionPage<T>>;
  records: T[];
}
```

**Source:** [src/horizon/server_api.ts:16](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L16)

### `collectionPage.next`

```ts
next: () => Promise<CollectionPage<T>>;
```

**Source:** [src/horizon/server_api.ts:20](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L20)

### `collectionPage.prev`

```ts
prev: () => Promise<CollectionPage<T>>;
```

**Source:** [src/horizon/server_api.ts:21](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L21)

### `collectionPage.records`

```ts
records: T[];
```

**Source:** [src/horizon/server_api.ts:19](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L19)

## Horizon.ServerApi.CreateAccountOperationRecord

```ts
interface CreateAccountOperationRecord extends BaseOperationRecord<OperationResponseType.createAccount, OperationResponseTypeI.createAccount>, CreateAccountOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  account: string;
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  funder: string;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  starting_balance: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: createAccount;
  type_i: createAccount;
}
```

**Source:** [src/horizon/server_api.ts:183](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L183)

### `createAccountOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `createAccountOperationRecord.account`

```ts
account: string;
```

**Source:** [src/horizon/horizon_api.ts:276](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L276)

### `createAccountOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `createAccountOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `createAccountOperationRecord.funder`

```ts
funder: string;
```

**Source:** [src/horizon/horizon_api.ts:277](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L277)

### `createAccountOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `createAccountOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `createAccountOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `createAccountOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `createAccountOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `createAccountOperationRecord.starting_balance`

```ts
starting_balance: string;
```

**Source:** [src/horizon/horizon_api.ts:278](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L278)

### `createAccountOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `createAccountOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `createAccountOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `createAccountOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `createAccountOperationRecord.type`

```ts
type: createAccount;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `createAccountOperationRecord.type_i`

```ts
type_i: createAccount;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.CreateClaimableBalanceOperationRecord

```ts
interface CreateClaimableBalanceOperationRecord extends BaseOperationRecord<OperationResponseType.createClaimableBalance, OperationResponseTypeI.createClaimableBalance>, CreateClaimableBalanceOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  asset: string;
  claimants: Claimant[];
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  sponsor: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: createClaimableBalance;
  type_i: createClaimableBalance;
}
```

**Source:** [src/horizon/server_api.ts:277](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L277)

### `createClaimableBalanceOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `createClaimableBalanceOperationRecord.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:457](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L457)

### `createClaimableBalanceOperationRecord.asset`

```ts
asset: string;
```

**Source:** [src/horizon/horizon_api.ts:456](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L456)

### `createClaimableBalanceOperationRecord.claimants`

```ts
claimants: Claimant[];
```

**Source:** [src/horizon/horizon_api.ts:459](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L459)

### `createClaimableBalanceOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `createClaimableBalanceOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `createClaimableBalanceOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `createClaimableBalanceOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `createClaimableBalanceOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `createClaimableBalanceOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `createClaimableBalanceOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `createClaimableBalanceOperationRecord.sponsor`

```ts
sponsor: string;
```

**Source:** [src/horizon/horizon_api.ts:458](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L458)

### `createClaimableBalanceOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `createClaimableBalanceOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `createClaimableBalanceOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `createClaimableBalanceOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `createClaimableBalanceOperationRecord.type`

```ts
type: createClaimableBalance;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `createClaimableBalanceOperationRecord.type_i`

```ts
type_i: createClaimableBalance;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.DepositLiquidityOperationRecord

```ts
interface DepositLiquidityOperationRecord extends BaseOperationRecord<OperationResponseType.liquidityPoolDeposit, OperationResponseTypeI.liquidityPoolDeposit>, DepositLiquidityOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  liquidity_pool_id: string;
  max_price: string;
  max_price_r: PriceRShorthand;
  min_price: string;
  min_price_r: PriceRShorthand;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  reserves_deposited: Reserve[];
  reserves_max: Reserve[];
  self: CallFunction<OperationRecord>;
  shares_received: string;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: liquidityPoolDeposit;
  type_i: liquidityPoolDeposit;
}
```

**Source:** [src/horizon/server_api.ts:333](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L333)

### `depositLiquidityOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `depositLiquidityOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `depositLiquidityOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `depositLiquidityOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `depositLiquidityOperationRecord.liquidity_pool_id`

```ts
liquidity_pool_id: string;
```

**Source:** [src/horizon/horizon_api.ts:537](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L537)

### `depositLiquidityOperationRecord.max_price`

```ts
max_price: string;
```

**Source:** [src/horizon/horizon_api.ts:541](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L541)

### `depositLiquidityOperationRecord.max_price_r`

```ts
max_price_r: PriceRShorthand;
```

**Source:** [src/horizon/horizon_api.ts:542](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L542)

### `depositLiquidityOperationRecord.min_price`

```ts
min_price: string;
```

**Source:** [src/horizon/horizon_api.ts:539](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L539)

### `depositLiquidityOperationRecord.min_price_r`

```ts
min_price_r: PriceRShorthand;
```

**Source:** [src/horizon/horizon_api.ts:540](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L540)

### `depositLiquidityOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `depositLiquidityOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `depositLiquidityOperationRecord.reserves_deposited`

```ts
reserves_deposited: Reserve[];
```

**Source:** [src/horizon/horizon_api.ts:543](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L543)

### `depositLiquidityOperationRecord.reserves_max`

```ts
reserves_max: Reserve[];
```

**Source:** [src/horizon/horizon_api.ts:538](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L538)

### `depositLiquidityOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `depositLiquidityOperationRecord.shares_received`

```ts
shares_received: string;
```

**Source:** [src/horizon/horizon_api.ts:544](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L544)

### `depositLiquidityOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `depositLiquidityOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `depositLiquidityOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `depositLiquidityOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `depositLiquidityOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `depositLiquidityOperationRecord.type`

```ts
type: liquidityPoolDeposit;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `depositLiquidityOperationRecord.type_i`

```ts
type_i: liquidityPoolDeposit;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.EffectRecord

```ts
type EffectRecord = BaseEffectRecordFromTypes & EffectRecordMethods
```

**Source:** [src/horizon/server_api.ts:85](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L85)

## Horizon.ServerApi.EffectType

```ts
const EffectType: typeof EffectType
```

**Source:** [src/horizon/server_api.ts:86](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L86)

## Horizon.ServerApi.EndSponsoringFutureReservesOperationRecord

```ts
interface EndSponsoringFutureReservesOperationRecord extends BaseOperationRecord<OperationResponseType.endSponsoringFutureReserves, OperationResponseTypeI.endSponsoringFutureReserves>, EndSponsoringFutureReservesOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  begin_sponsor: string;
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: endSponsoringFutureReserves;
  type_i: endSponsoringFutureReserves;
}
```

**Source:** [src/horizon/server_api.ts:298](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L298)

### `endSponsoringFutureReservesOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `endSponsoringFutureReservesOperationRecord.begin_sponsor`

```ts
begin_sponsor: string;
```

**Source:** [src/horizon/horizon_api.ts:481](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L481)

### `endSponsoringFutureReservesOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `endSponsoringFutureReservesOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `endSponsoringFutureReservesOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `endSponsoringFutureReservesOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `endSponsoringFutureReservesOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `endSponsoringFutureReservesOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `endSponsoringFutureReservesOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `endSponsoringFutureReservesOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `endSponsoringFutureReservesOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `endSponsoringFutureReservesOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `endSponsoringFutureReservesOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `endSponsoringFutureReservesOperationRecord.type`

```ts
type: endSponsoringFutureReserves;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `endSponsoringFutureReservesOperationRecord.type_i`

```ts
type_i: endSponsoringFutureReserves;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.InflationOperationRecord

```ts
interface InflationOperationRecord extends BaseOperationRecord<OperationResponseType.inflation, OperationResponseTypeI.inflation>, InflationOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: inflation;
  type_i: inflation;
}
```

**Source:** [src/horizon/server_api.ts:256](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L256)

### `inflationOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `inflationOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `inflationOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `inflationOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `inflationOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `inflationOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `inflationOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `inflationOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `inflationOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `inflationOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `inflationOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `inflationOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `inflationOperationRecord.type`

```ts
type: inflation;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `inflationOperationRecord.type_i`

```ts
type_i: inflation;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.InvokeHostFunctionOperationRecord

```ts
interface InvokeHostFunctionOperationRecord extends BaseOperationRecord<OperationResponseType.invokeHostFunction, OperationResponseTypeI.invokeHostFunction>, InvokeHostFunctionOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  address: string;
  asset_balance_changes: BalanceChange[];
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  function: string;
  id: string;
  paging_token: string;
  parameters: { type: string; value: string }[];
  precedes: CallFunction<OperationRecord>;
  salt: string;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: invokeHostFunction;
  type_i: invokeHostFunction;
}
```

**Source:** [src/horizon/server_api.ts:347](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L347)

### `invokeHostFunctionOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `invokeHostFunctionOperationRecord.address`

```ts
address: string;
```

**Source:** [src/horizon/horizon_api.ts:577](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L577)

### `invokeHostFunctionOperationRecord.asset_balance_changes`

```ts
asset_balance_changes: BalanceChange[];
```

**Source:** [src/horizon/horizon_api.ts:579](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L579)

### `invokeHostFunctionOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `invokeHostFunctionOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `invokeHostFunctionOperationRecord.function`

```ts
function: string;
```

**Source:** [src/horizon/horizon_api.ts:572](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L572)

### `invokeHostFunctionOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `invokeHostFunctionOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `invokeHostFunctionOperationRecord.parameters`

```ts
parameters: { type: string; value: string }[];
```

**Source:** [src/horizon/horizon_api.ts:573](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L573)

### `invokeHostFunctionOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `invokeHostFunctionOperationRecord.salt`

```ts
salt: string;
```

**Source:** [src/horizon/horizon_api.ts:578](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L578)

### `invokeHostFunctionOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `invokeHostFunctionOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `invokeHostFunctionOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `invokeHostFunctionOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `invokeHostFunctionOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `invokeHostFunctionOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `invokeHostFunctionOperationRecord.type`

```ts
type: invokeHostFunction;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `invokeHostFunctionOperationRecord.type_i`

```ts
type_i: invokeHostFunction;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.LedgerRecord

```ts
interface LedgerRecord extends BaseResponse {
  _links: { self: ResponseLink };
  base_fee_in_stroops: number;
  base_reserve_in_stroops: number;
  closed_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  failed_transaction_count: number;
  fee_pool: string;
  hash: string;
  header_xdr: string;
  id: string;
  max_tx_set_size: number;
  operation_count: number;
  operations: CallCollectionFunction<OperationRecord>;
  paging_token: string;
  prev_hash: string;
  protocol_version: number;
  self: CallFunction<LedgerRecord>;
  sequence: number;
  successful_transaction_count: number;
  total_coins: string;
  transactions: CallCollectionFunction<TransactionRecord>;
  tx_set_operation_count: number | null;
}
```

**Source:** [src/horizon/server_api.ts:145](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L145)

### `ledgerRecord._links`

```ts
_links: { self: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `ledgerRecord.base_fee_in_stroops`

```ts
base_fee_in_stroops: number;
```

**Source:** [src/horizon/server_api.ts:161](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L161)

### `ledgerRecord.base_reserve_in_stroops`

```ts
base_reserve_in_stroops: number;
```

**Source:** [src/horizon/server_api.ts:162](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L162)

### `ledgerRecord.closed_at`

```ts
closed_at: string;
```

**Source:** [src/horizon/server_api.ts:155](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L155)

### `ledgerRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:164](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L164)

### `ledgerRecord.failed_transaction_count`

```ts
failed_transaction_count: number;
```

**Source:** [src/horizon/server_api.ts:152](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L152)

### `ledgerRecord.fee_pool`

```ts
fee_pool: string;
```

**Source:** [src/horizon/server_api.ts:157](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L157)

### `ledgerRecord.hash`

```ts
hash: string;
```

**Source:** [src/horizon/server_api.ts:148](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L148)

### `ledgerRecord.header_xdr`

```ts
header_xdr: string;
```

**Source:** [src/horizon/server_api.ts:160](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L160)

### `ledgerRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/server_api.ts:146](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L146)

### `ledgerRecord.max_tx_set_size`

```ts
max_tx_set_size: number;
```

**Source:** [src/horizon/server_api.ts:158](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L158)

### `ledgerRecord.operation_count`

```ts
operation_count: number;
```

**Source:** [src/horizon/server_api.ts:153](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L153)

### `ledgerRecord.operations`

```ts
operations: CallCollectionFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:165](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L165)

### `ledgerRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/server_api.ts:147](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L147)

### `ledgerRecord.prev_hash`

```ts
prev_hash: string;
```

**Source:** [src/horizon/server_api.ts:149](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L149)

### `ledgerRecord.protocol_version`

```ts
protocol_version: number;
```

**Source:** [src/horizon/server_api.ts:159](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L159)

### `ledgerRecord.self`

```ts
self: CallFunction<LedgerRecord>;
```

**Source:** [src/horizon/server_api.ts:166](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L166)

### `ledgerRecord.sequence`

```ts
sequence: number;
```

**Source:** [src/horizon/server_api.ts:150](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L150)

### `ledgerRecord.successful_transaction_count`

```ts
successful_transaction_count: number;
```

**Source:** [src/horizon/server_api.ts:151](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L151)

### `ledgerRecord.total_coins`

```ts
total_coins: string;
```

**Source:** [src/horizon/server_api.ts:156](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L156)

### `ledgerRecord.transactions`

```ts
transactions: CallCollectionFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:167](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L167)

### `ledgerRecord.tx_set_operation_count`

```ts
tx_set_operation_count: number | null;
```

**Source:** [src/horizon/server_api.ts:154](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L154)

## Horizon.ServerApi.LiquidityPoolRecord

```ts
interface LiquidityPoolRecord extends BaseResponse {
  _links: { self: ResponseLink };
  fee_bp: number;
  id: string;
  paging_token: string;
  reserves: Reserve[];
  total_shares: string;
  total_trustlines: string;
  type: LiquidityPoolType;
}
```

**Source:** [src/horizon/server_api.ts:126](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L126)

### `liquidityPoolRecord._links`

```ts
_links: { self: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `liquidityPoolRecord.fee_bp`

```ts
fee_bp: number;
```

**Source:** [src/horizon/server_api.ts:129](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L129)

### `liquidityPoolRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/server_api.ts:127](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L127)

### `liquidityPoolRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/server_api.ts:128](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L128)

### `liquidityPoolRecord.reserves`

```ts
reserves: Reserve[];
```

**Source:** [src/horizon/server_api.ts:133](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L133)

### `liquidityPoolRecord.total_shares`

```ts
total_shares: string;
```

**Source:** [src/horizon/server_api.ts:132](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L132)

### `liquidityPoolRecord.total_trustlines`

```ts
total_trustlines: string;
```

**Source:** [src/horizon/server_api.ts:131](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L131)

### `liquidityPoolRecord.type`

```ts
type: LiquidityPoolType;
```

**Source:** [src/horizon/server_api.ts:130](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L130)

## Horizon.ServerApi.ManageDataOperationRecord

```ts
interface ManageDataOperationRecord extends BaseOperationRecord<OperationResponseType.manageData, OperationResponseTypeI.manageData>, ManageDataOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  name: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: manageData;
  type_i: manageData;
  value: Buffer;
}
```

**Source:** [src/horizon/server_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L263)

### `manageDataOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `manageDataOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `manageDataOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `manageDataOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `manageDataOperationRecord.name`

```ts
name: string;
```

**Source:** [src/horizon/horizon_api.ts:430](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L430)

### `manageDataOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `manageDataOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `manageDataOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `manageDataOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `manageDataOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `manageDataOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `manageDataOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `manageDataOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `manageDataOperationRecord.type`

```ts
type: manageData;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `manageDataOperationRecord.type_i`

```ts
type_i: manageData;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

### `manageDataOperationRecord.value`

```ts
value: Buffer;
```

**Source:** [src/horizon/horizon_api.ts:431](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L431)

## Horizon.ServerApi.ManageOfferOperationRecord

```ts
interface ManageOfferOperationRecord extends BaseOperationRecord<OperationResponseType.manageOffer, OperationResponseTypeI.manageOffer>, ManageOfferOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  buying_asset_code?: string;
  buying_asset_issuer?: string;
  buying_asset_type: AssetType;
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  offer_id: string | number;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  price: string;
  price_r: PriceR;
  self: CallFunction<OperationRecord>;
  selling_asset_code?: string;
  selling_asset_issuer?: string;
  selling_asset_type: AssetType;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: manageOffer;
  type_i: manageOffer;
}
```

**Source:** [src/horizon/server_api.ts:214](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L214)

### `manageOfferOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `manageOfferOperationRecord.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:340](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L340)

### `manageOfferOperationRecord.buying_asset_code`

```ts
buying_asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:342](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L342)

### `manageOfferOperationRecord.buying_asset_issuer`

```ts
buying_asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:343](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L343)

### `manageOfferOperationRecord.buying_asset_type`

```ts
buying_asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:341](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L341)

### `manageOfferOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `manageOfferOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `manageOfferOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `manageOfferOperationRecord.offer_id`

```ts
offer_id: string | number;
```

**Source:** [src/horizon/horizon_api.ts:339](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L339)

### `manageOfferOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `manageOfferOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `manageOfferOperationRecord.price`

```ts
price: string;
```

**Source:** [src/horizon/horizon_api.ts:344](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L344)

### `manageOfferOperationRecord.price_r`

```ts
price_r: PriceR;
```

**Source:** [src/horizon/horizon_api.ts:345](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L345)

### `manageOfferOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `manageOfferOperationRecord.selling_asset_code`

```ts
selling_asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:347](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L347)

### `manageOfferOperationRecord.selling_asset_issuer`

```ts
selling_asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:348](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L348)

### `manageOfferOperationRecord.selling_asset_type`

```ts
selling_asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:346](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L346)

### `manageOfferOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `manageOfferOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `manageOfferOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `manageOfferOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `manageOfferOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `manageOfferOperationRecord.type`

```ts
type: manageOffer;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `manageOfferOperationRecord.type_i`

```ts
type_i: manageOffer;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.OfferRecord

```ts
type OfferRecord = OfferRecordType
```

**Source:** [src/horizon/server_api.ts:13](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L13)

## Horizon.ServerApi.OperationRecord

```ts
type OperationRecord = CreateAccountOperationRecord | PaymentOperationRecord | PathPaymentOperationRecord | ManageOfferOperationRecord | PassiveOfferOperationRecord | SetOptionsOperationRecord | ChangeTrustOperationRecord | AllowTrustOperationRecord | AccountMergeOperationRecord | InflationOperationRecord | ManageDataOperationRecord | BumpSequenceOperationRecord | PathPaymentStrictSendOperationRecord | CreateClaimableBalanceOperationRecord | ClaimClaimableBalanceOperationRecord | BeginSponsoringFutureReservesOperationRecord | EndSponsoringFutureReservesOperationRecord | RevokeSponsorshipOperationRecord | ClawbackClaimableBalanceOperationRecord | ClawbackOperationRecord | SetTrustLineFlagsOperationRecord | DepositLiquidityOperationRecord | WithdrawLiquidityOperationRecord | InvokeHostFunctionOperationRecord | BumpFootprintExpirationOperationRecord | RestoreFootprintOperationRecord
```

**Source:** [src/horizon/server_api.ts:369](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L369)

## Horizon.ServerApi.OrderbookRecord

```ts
interface OrderbookRecord extends BaseResponse {
  _links: { self: ResponseLink };
  asks: { amount: string; price: string; price_r: { d: number; n: number } }[];
  base: Asset;
  bids: { amount: string; price: string; price_r: { d: number; n: number } }[];
  counter: Asset;
}
```

**Source:** [src/horizon/server_api.ts:456](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L456)

### `orderbookRecord._links`

```ts
_links: { self: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `orderbookRecord.asks`

```ts
asks: { amount: string; price: string; price_r: { d: number; n: number } }[];
```

**Source:** [src/horizon/server_api.ts:465](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L465)

### `orderbookRecord.base`

```ts
base: Asset;
```

**Source:** [src/horizon/server_api.ts:473](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L473)

### `orderbookRecord.bids`

```ts
bids: { amount: string; price: string; price_r: { d: number; n: number } }[];
```

**Source:** [src/horizon/server_api.ts:457](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L457)

### `orderbookRecord.counter`

```ts
counter: Asset;
```

**Source:** [src/horizon/server_api.ts:474](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L474)

## Horizon.ServerApi.PassiveOfferOperationRecord

```ts
interface PassiveOfferOperationRecord extends BaseOperationRecord<OperationResponseType.createPassiveOffer, OperationResponseTypeI.createPassiveOffer>, PassiveOfferOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  buying_asset_code?: string;
  buying_asset_issuer?: string;
  buying_asset_type: AssetType;
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  offer_id: string | number;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  price: string;
  price_r: PriceR;
  self: CallFunction<OperationRecord>;
  selling_asset_code?: string;
  selling_asset_issuer?: string;
  selling_asset_type: AssetType;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: createPassiveOffer;
  type_i: createPassiveOffer;
}
```

**Source:** [src/horizon/server_api.ts:221](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L221)

### `passiveOfferOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `passiveOfferOperationRecord.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:355](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L355)

### `passiveOfferOperationRecord.buying_asset_code`

```ts
buying_asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:357](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L357)

### `passiveOfferOperationRecord.buying_asset_issuer`

```ts
buying_asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:358](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L358)

### `passiveOfferOperationRecord.buying_asset_type`

```ts
buying_asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:356](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L356)

### `passiveOfferOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `passiveOfferOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `passiveOfferOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `passiveOfferOperationRecord.offer_id`

```ts
offer_id: string | number;
```

**Source:** [src/horizon/horizon_api.ts:354](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L354)

### `passiveOfferOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `passiveOfferOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `passiveOfferOperationRecord.price`

```ts
price: string;
```

**Source:** [src/horizon/horizon_api.ts:359](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L359)

### `passiveOfferOperationRecord.price_r`

```ts
price_r: PriceR;
```

**Source:** [src/horizon/horizon_api.ts:360](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L360)

### `passiveOfferOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `passiveOfferOperationRecord.selling_asset_code`

```ts
selling_asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:362](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L362)

### `passiveOfferOperationRecord.selling_asset_issuer`

```ts
selling_asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:363](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L363)

### `passiveOfferOperationRecord.selling_asset_type`

```ts
selling_asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:361](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L361)

### `passiveOfferOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `passiveOfferOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `passiveOfferOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `passiveOfferOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `passiveOfferOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `passiveOfferOperationRecord.type`

```ts
type: createPassiveOffer;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `passiveOfferOperationRecord.type_i`

```ts
type_i: createPassiveOffer;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.PathPaymentOperationRecord

```ts
interface PathPaymentOperationRecord extends BaseOperationRecord<OperationResponseType.pathPayment, OperationResponseTypeI.pathPayment>, PathPaymentOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  asset_code?: string;
  asset_issuer?: string;
  asset_type: AssetType;
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  from: string;
  id: string;
  paging_token: string;
  path: { asset_code: string; asset_issuer: string; asset_type: AssetType }[];
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  source_amount: string;
  source_asset_code?: string;
  source_asset_issuer?: string;
  source_asset_type: AssetType;
  source_max: string;
  succeeds: CallFunction<OperationRecord>;
  to: string;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: pathPayment;
  type_i: pathPayment;
}
```

**Source:** [src/horizon/server_api.ts:200](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L200)

### `pathPaymentOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `pathPaymentOperationRecord.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:297](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L297)

### `pathPaymentOperationRecord.asset_code`

```ts
asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:298](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L298)

### `pathPaymentOperationRecord.asset_issuer`

```ts
asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:299](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L299)

### `pathPaymentOperationRecord.asset_type`

```ts
asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:300](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L300)

### `pathPaymentOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `pathPaymentOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `pathPaymentOperationRecord.from`

```ts
from: string;
```

**Source:** [src/horizon/horizon_api.ts:301](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L301)

### `pathPaymentOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `pathPaymentOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `pathPaymentOperationRecord.path`

```ts
path: { asset_code: string; asset_issuer: string; asset_type: AssetType }[];
```

**Source:** [src/horizon/horizon_api.ts:302](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L302)

### `pathPaymentOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `pathPaymentOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `pathPaymentOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `pathPaymentOperationRecord.source_amount`

```ts
source_amount: string;
```

**Source:** [src/horizon/horizon_api.ts:307](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L307)

### `pathPaymentOperationRecord.source_asset_code`

```ts
source_asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:308](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L308)

### `pathPaymentOperationRecord.source_asset_issuer`

```ts
source_asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:309](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L309)

### `pathPaymentOperationRecord.source_asset_type`

```ts
source_asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:310](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L310)

### `pathPaymentOperationRecord.source_max`

```ts
source_max: string;
```

**Source:** [src/horizon/horizon_api.ts:311](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L311)

### `pathPaymentOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `pathPaymentOperationRecord.to`

```ts
to: string;
```

**Source:** [src/horizon/horizon_api.ts:312](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L312)

### `pathPaymentOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `pathPaymentOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `pathPaymentOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `pathPaymentOperationRecord.type`

```ts
type: pathPayment;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `pathPaymentOperationRecord.type_i`

```ts
type_i: pathPayment;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.PathPaymentStrictSendOperationRecord

```ts
interface PathPaymentStrictSendOperationRecord extends BaseOperationRecord<OperationResponseType.pathPaymentStrictSend, OperationResponseTypeI.pathPaymentStrictSend>, PathPaymentStrictSendOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  asset_code?: string;
  asset_issuer?: string;
  asset_type: AssetType;
  created_at: string;
  destination_min: string;
  effects: CallCollectionFunction<EffectRecord>;
  from: string;
  id: string;
  paging_token: string;
  path: { asset_code: string; asset_issuer: string; asset_type: AssetType }[];
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  source_amount: string;
  source_asset_code?: string;
  source_asset_issuer?: string;
  source_asset_type: AssetType;
  succeeds: CallFunction<OperationRecord>;
  to: string;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: pathPaymentStrictSend;
  type_i: pathPaymentStrictSend;
}
```

**Source:** [src/horizon/server_api.ts:207](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L207)

### `pathPaymentStrictSendOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `pathPaymentStrictSendOperationRecord.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:318](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L318)

### `pathPaymentStrictSendOperationRecord.asset_code`

```ts
asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:319](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L319)

### `pathPaymentStrictSendOperationRecord.asset_issuer`

```ts
asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:320](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L320)

### `pathPaymentStrictSendOperationRecord.asset_type`

```ts
asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:321](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L321)

### `pathPaymentStrictSendOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `pathPaymentStrictSendOperationRecord.destination_min`

```ts
destination_min: string;
```

**Source:** [src/horizon/horizon_api.ts:322](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L322)

### `pathPaymentStrictSendOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `pathPaymentStrictSendOperationRecord.from`

```ts
from: string;
```

**Source:** [src/horizon/horizon_api.ts:323](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L323)

### `pathPaymentStrictSendOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `pathPaymentStrictSendOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `pathPaymentStrictSendOperationRecord.path`

```ts
path: { asset_code: string; asset_issuer: string; asset_type: AssetType }[];
```

**Source:** [src/horizon/horizon_api.ts:324](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L324)

### `pathPaymentStrictSendOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `pathPaymentStrictSendOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `pathPaymentStrictSendOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `pathPaymentStrictSendOperationRecord.source_amount`

```ts
source_amount: string;
```

**Source:** [src/horizon/horizon_api.ts:329](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L329)

### `pathPaymentStrictSendOperationRecord.source_asset_code`

```ts
source_asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:330](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L330)

### `pathPaymentStrictSendOperationRecord.source_asset_issuer`

```ts
source_asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:331](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L331)

### `pathPaymentStrictSendOperationRecord.source_asset_type`

```ts
source_asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:332](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L332)

### `pathPaymentStrictSendOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `pathPaymentStrictSendOperationRecord.to`

```ts
to: string;
```

**Source:** [src/horizon/horizon_api.ts:333](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L333)

### `pathPaymentStrictSendOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `pathPaymentStrictSendOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `pathPaymentStrictSendOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `pathPaymentStrictSendOperationRecord.type`

```ts
type: pathPaymentStrictSend;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `pathPaymentStrictSendOperationRecord.type_i`

```ts
type_i: pathPaymentStrictSend;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.PaymentOperationRecord

```ts
interface PaymentOperationRecord extends BaseOperationRecord<OperationResponseType.payment, OperationResponseTypeI.payment>, PaymentOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  amount: string;
  asset_code?: string;
  asset_issuer?: string;
  asset_type: AssetType;
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  from: string;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  receiver: CallFunction<AccountRecord>;
  self: CallFunction<OperationRecord>;
  sender: CallFunction<AccountRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  to: string;
  to_muxed?: string;
  to_muxed_id?: string;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: payment;
  type_i: payment;
}
```

**Source:** [src/horizon/server_api.ts:190](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L190)

### `paymentOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `paymentOperationRecord.amount`

```ts
amount: string;
```

**Source:** [src/horizon/horizon_api.ts:289](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L289)

### `paymentOperationRecord.asset_code`

```ts
asset_code?: string;
```

**Source:** [src/horizon/horizon_api.ts:287](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L287)

### `paymentOperationRecord.asset_issuer`

```ts
asset_issuer?: string;
```

**Source:** [src/horizon/horizon_api.ts:288](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L288)

### `paymentOperationRecord.asset_type`

```ts
asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:286](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L286)

### `paymentOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `paymentOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `paymentOperationRecord.from`

```ts
from: string;
```

**Source:** [src/horizon/horizon_api.ts:284](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L284)

### `paymentOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `paymentOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `paymentOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `paymentOperationRecord.receiver`

```ts
receiver: CallFunction<AccountRecord>;
```

**Source:** [src/horizon/server_api.ts:198](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L198)

### `paymentOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `paymentOperationRecord.sender`

```ts
sender: CallFunction<AccountRecord>;
```

**Source:** [src/horizon/server_api.ts:197](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L197)

### `paymentOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `paymentOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `paymentOperationRecord.to`

```ts
to: string;
```

**Source:** [src/horizon/horizon_api.ts:285](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L285)

### `paymentOperationRecord.to_muxed`

```ts
to_muxed?: string;
```

**Source:** [src/horizon/horizon_api.ts:290](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L290)

### `paymentOperationRecord.to_muxed_id`

```ts
to_muxed_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:291](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L291)

### `paymentOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `paymentOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `paymentOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `paymentOperationRecord.type`

```ts
type: payment;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `paymentOperationRecord.type_i`

```ts
type_i: payment;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.PaymentPathRecord

```ts
interface PaymentPathRecord extends BaseResponse {
  _links: { self: ResponseLink };
  destination_amount: string;
  destination_asset_code: string;
  destination_asset_issuer: string;
  destination_asset_type: string;
  path: { asset_code: string; asset_issuer: string; asset_type: string }[];
  source_amount: string;
  source_asset_code: string;
  source_asset_issuer: string;
  source_asset_type: string;
}
```

**Source:** [src/horizon/server_api.ts:476](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L476)

### `paymentPathRecord._links`

```ts
_links: { self: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `paymentPathRecord.destination_amount`

```ts
destination_amount: string;
```

**Source:** [src/horizon/server_api.ts:486](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L486)

### `paymentPathRecord.destination_asset_code`

```ts
destination_asset_code: string;
```

**Source:** [src/horizon/server_api.ts:488](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L488)

### `paymentPathRecord.destination_asset_issuer`

```ts
destination_asset_issuer: string;
```

**Source:** [src/horizon/server_api.ts:489](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L489)

### `paymentPathRecord.destination_asset_type`

```ts
destination_asset_type: string;
```

**Source:** [src/horizon/server_api.ts:487](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L487)

### `paymentPathRecord.path`

```ts
path: { asset_code: string; asset_issuer: string; asset_type: string }[];
```

**Source:** [src/horizon/server_api.ts:477](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L477)

### `paymentPathRecord.source_amount`

```ts
source_amount: string;
```

**Source:** [src/horizon/server_api.ts:482](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L482)

### `paymentPathRecord.source_asset_code`

```ts
source_asset_code: string;
```

**Source:** [src/horizon/server_api.ts:484](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L484)

### `paymentPathRecord.source_asset_issuer`

```ts
source_asset_issuer: string;
```

**Source:** [src/horizon/server_api.ts:485](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L485)

### `paymentPathRecord.source_asset_type`

```ts
source_asset_type: string;
```

**Source:** [src/horizon/server_api.ts:483](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L483)

## Horizon.ServerApi.RestoreFootprintOperationRecord

```ts
interface RestoreFootprintOperationRecord extends BaseOperationRecord<OperationResponseType.restoreFootprint, OperationResponseTypeI.restoreFootprint>, RestoreFootprintOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: restoreFootprint;
  type_i: restoreFootprint;
}
```

**Source:** [src/horizon/server_api.ts:361](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L361)

### `restoreFootprintOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `restoreFootprintOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `restoreFootprintOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `restoreFootprintOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `restoreFootprintOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `restoreFootprintOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `restoreFootprintOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `restoreFootprintOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `restoreFootprintOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `restoreFootprintOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `restoreFootprintOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `restoreFootprintOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `restoreFootprintOperationRecord.type`

```ts
type: restoreFootprint;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `restoreFootprintOperationRecord.type_i`

```ts
type_i: restoreFootprint;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.RevokeSponsorshipOperationRecord

```ts
interface RevokeSponsorshipOperationRecord extends BaseOperationRecord<OperationResponseType.revokeSponsorship, OperationResponseTypeI.revokeSponsorship>, RevokeSponsorshipOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  account_id?: string;
  claimable_balance_id?: string;
  created_at: string;
  data_account_id?: string;
  data_name?: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  offer_id?: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  signer_account_id?: string;
  signer_key?: string;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  trustline_account_id?: string;
  trustline_asset?: string;
  trustline_liquidity_pool_id?: string;
  type: revokeSponsorship;
  type_i: revokeSponsorship;
}
```

**Source:** [src/horizon/server_api.ts:305](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L305)

### `revokeSponsorshipOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `revokeSponsorshipOperationRecord.account_id`

```ts
account_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:488](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L488)

### `revokeSponsorshipOperationRecord.claimable_balance_id`

```ts
claimable_balance_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:489](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L489)

### `revokeSponsorshipOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `revokeSponsorshipOperationRecord.data_account_id`

```ts
data_account_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:490](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L490)

### `revokeSponsorshipOperationRecord.data_name`

```ts
data_name?: string;
```

**Source:** [src/horizon/horizon_api.ts:491](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L491)

### `revokeSponsorshipOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `revokeSponsorshipOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `revokeSponsorshipOperationRecord.offer_id`

```ts
offer_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:492](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L492)

### `revokeSponsorshipOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `revokeSponsorshipOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `revokeSponsorshipOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `revokeSponsorshipOperationRecord.signer_account_id`

```ts
signer_account_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:496](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L496)

### `revokeSponsorshipOperationRecord.signer_key`

```ts
signer_key?: string;
```

**Source:** [src/horizon/horizon_api.ts:497](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L497)

### `revokeSponsorshipOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `revokeSponsorshipOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `revokeSponsorshipOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `revokeSponsorshipOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `revokeSponsorshipOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `revokeSponsorshipOperationRecord.trustline_account_id`

```ts
trustline_account_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:493](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L493)

### `revokeSponsorshipOperationRecord.trustline_asset`

```ts
trustline_asset?: string;
```

**Source:** [src/horizon/horizon_api.ts:494](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L494)

### `revokeSponsorshipOperationRecord.trustline_liquidity_pool_id`

```ts
trustline_liquidity_pool_id?: string;
```

**Source:** [src/horizon/horizon_api.ts:495](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L495)

### `revokeSponsorshipOperationRecord.type`

```ts
type: revokeSponsorship;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `revokeSponsorshipOperationRecord.type_i`

```ts
type_i: revokeSponsorship;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.SetOptionsOperationRecord

```ts
interface SetOptionsOperationRecord extends BaseOperationRecord<OperationResponseType.setOptions, OperationResponseTypeI.setOptions>, SetOptionsOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  clear_flags: (1 | 2 | 4)[];
  clear_flags_s: ("auth_required_flag" | "auth_revocable_flag" | "auth_clawback_enabled_flag")[];
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  high_threshold?: number;
  home_domain?: string;
  id: string;
  low_threshold?: number;
  master_key_weight?: number;
  med_threshold?: number;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  set_flags: (1 | 2 | 4)[];
  set_flags_s: ("auth_required_flag" | "auth_revocable_flag" | "auth_clawback_enabled_flag")[];
  signer_key?: string;
  signer_weight?: number;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: setOptions;
  type_i: setOptions;
}
```

**Source:** [src/horizon/server_api.ts:228](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L228)

### `setOptionsOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `setOptionsOperationRecord.clear_flags`

```ts
clear_flags: (1 | 2 | 4)[];
```

**Source:** [src/horizon/horizon_api.ts:382](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L382)

### `setOptionsOperationRecord.clear_flags_s`

```ts
clear_flags_s: ("auth_required_flag" | "auth_revocable_flag" | "auth_clawback_enabled_flag")[];
```

**Source:** [src/horizon/horizon_api.ts:383](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L383)

### `setOptionsOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `setOptionsOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `setOptionsOperationRecord.high_threshold`

```ts
high_threshold?: number;
```

**Source:** [src/horizon/horizon_api.ts:374](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L374)

### `setOptionsOperationRecord.home_domain`

```ts
home_domain?: string;
```

**Source:** [src/horizon/horizon_api.ts:375](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L375)

### `setOptionsOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `setOptionsOperationRecord.low_threshold`

```ts
low_threshold?: number;
```

**Source:** [src/horizon/horizon_api.ts:372](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L372)

### `setOptionsOperationRecord.master_key_weight`

```ts
master_key_weight?: number;
```

**Source:** [src/horizon/horizon_api.ts:371](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L371)

### `setOptionsOperationRecord.med_threshold`

```ts
med_threshold?: number;
```

**Source:** [src/horizon/horizon_api.ts:373](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L373)

### `setOptionsOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `setOptionsOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `setOptionsOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `setOptionsOperationRecord.set_flags`

```ts
set_flags: (1 | 2 | 4)[];
```

**Source:** [src/horizon/horizon_api.ts:376](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L376)

### `setOptionsOperationRecord.set_flags_s`

```ts
set_flags_s: ("auth_required_flag" | "auth_revocable_flag" | "auth_clawback_enabled_flag")[];
```

**Source:** [src/horizon/horizon_api.ts:377](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L377)

### `setOptionsOperationRecord.signer_key`

```ts
signer_key?: string;
```

**Source:** [src/horizon/horizon_api.ts:369](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L369)

### `setOptionsOperationRecord.signer_weight`

```ts
signer_weight?: number;
```

**Source:** [src/horizon/horizon_api.ts:370](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L370)

### `setOptionsOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `setOptionsOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `setOptionsOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `setOptionsOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `setOptionsOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `setOptionsOperationRecord.type`

```ts
type: setOptions;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `setOptionsOperationRecord.type_i`

```ts
type_i: setOptions;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.SetTrustLineFlagsOperationRecord

```ts
interface SetTrustLineFlagsOperationRecord extends BaseOperationRecord<OperationResponseType.setTrustLineFlags, OperationResponseTypeI.setTrustLineFlags>, SetTrustLineFlagsOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  asset_code: string;
  asset_issuer: string;
  asset_type: AssetType;
  clear_flags: (1 | 2 | 4)[];
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  self: CallFunction<OperationRecord>;
  set_flags: (1 | 2 | 4)[];
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  trustor: string;
  type: setTrustLineFlags;
  type_i: setTrustLineFlags;
}
```

**Source:** [src/horizon/server_api.ts:326](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L326)

### `setTrustLineFlagsOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `setTrustLineFlagsOperationRecord.asset_code`

```ts
asset_code: string;
```

**Source:** [src/horizon/horizon_api.ts:523](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L523)

### `setTrustLineFlagsOperationRecord.asset_issuer`

```ts
asset_issuer: string;
```

**Source:** [src/horizon/horizon_api.ts:524](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L524)

### `setTrustLineFlagsOperationRecord.asset_type`

```ts
asset_type: AssetType;
```

**Source:** [src/horizon/horizon_api.ts:522](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L522)

### `setTrustLineFlagsOperationRecord.clear_flags`

```ts
clear_flags: (1 | 2 | 4)[];
```

**Source:** [src/horizon/horizon_api.ts:527](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L527)

### `setTrustLineFlagsOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `setTrustLineFlagsOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `setTrustLineFlagsOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `setTrustLineFlagsOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `setTrustLineFlagsOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `setTrustLineFlagsOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `setTrustLineFlagsOperationRecord.set_flags`

```ts
set_flags: (1 | 2 | 4)[];
```

**Source:** [src/horizon/horizon_api.ts:526](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L526)

### `setTrustLineFlagsOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `setTrustLineFlagsOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `setTrustLineFlagsOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `setTrustLineFlagsOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `setTrustLineFlagsOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `setTrustLineFlagsOperationRecord.trustor`

```ts
trustor: string;
```

**Source:** [src/horizon/horizon_api.ts:525](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L525)

### `setTrustLineFlagsOperationRecord.type`

```ts
type: setTrustLineFlags;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `setTrustLineFlagsOperationRecord.type_i`

```ts
type_i: setTrustLineFlags;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.ServerApi.TradeRecord

```ts
type TradeRecord = TradeRecord.Orderbook | TradeRecord.LiquidityPool
```

**Source:** [src/horizon/server_api.ts:397](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L397)

## Horizon.ServerApi.TradeRecord.LiquidityPool

```ts
interface LiquidityPool extends Base {
  _links: { self: ResponseLink };
  base: CallFunction<AccountRecord | LiquidityPoolRecord>;
  base_account?: string;
  base_amount: string;
  base_asset_code?: string;
  base_asset_issuer?: string;
  base_asset_type: string;
  base_is_seller: boolean;
  base_liquidity_pool_id?: string;
  counter: CallFunction<AccountRecord | LiquidityPoolRecord>;
  counter_account?: string;
  counter_amount: string;
  counter_asset_code?: string;
  counter_asset_issuer?: string;
  counter_asset_type: string;
  counter_liquidity_pool_id?: string;
  id: string;
  ledger_close_time: string;
  liquidity_pool_fee_bp: number;
  operation: CallFunction<OperationRecord>;
  paging_token: string;
  price?: { d: string; n: string };
  trade_type: liquidityPools;
}
```

**Source:** [src/horizon/server_api.ts:431](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L431)

### `liquidityPool._links`

```ts
_links: { self: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `liquidityPool.base`

```ts
base: CallFunction<AccountRecord | LiquidityPoolRecord>;
```

**Source:** [src/horizon/server_api.ts:437](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L437)

### `liquidityPool.base_account`

```ts
base_account?: string;
```

**Source:** [src/horizon/server_api.ts:403](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L403)

### `liquidityPool.base_amount`

```ts
base_amount: string;
```

**Source:** [src/horizon/server_api.ts:404](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L404)

### `liquidityPool.base_asset_code`

```ts
base_asset_code?: string;
```

**Source:** [src/horizon/server_api.ts:406](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L406)

### `liquidityPool.base_asset_issuer`

```ts
base_asset_issuer?: string;
```

**Source:** [src/horizon/server_api.ts:407](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L407)

### `liquidityPool.base_asset_type`

```ts
base_asset_type: string;
```

**Source:** [src/horizon/server_api.ts:405](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L405)

### `liquidityPool.base_is_seller`

```ts
base_is_seller: boolean;
```

**Source:** [src/horizon/server_api.ts:413](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L413)

### `liquidityPool.base_liquidity_pool_id`

```ts
base_liquidity_pool_id?: string;
```

**Source:** [src/horizon/server_api.ts:433](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L433)

### `liquidityPool.counter`

```ts
counter: CallFunction<AccountRecord | LiquidityPoolRecord>;
```

**Source:** [src/horizon/server_api.ts:438](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L438)

### `liquidityPool.counter_account`

```ts
counter_account?: string;
```

**Source:** [src/horizon/server_api.ts:408](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L408)

### `liquidityPool.counter_amount`

```ts
counter_amount: string;
```

**Source:** [src/horizon/server_api.ts:409](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L409)

### `liquidityPool.counter_asset_code`

```ts
counter_asset_code?: string;
```

**Source:** [src/horizon/server_api.ts:411](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L411)

### `liquidityPool.counter_asset_issuer`

```ts
counter_asset_issuer?: string;
```

**Source:** [src/horizon/server_api.ts:412](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L412)

### `liquidityPool.counter_asset_type`

```ts
counter_asset_type: string;
```

**Source:** [src/horizon/server_api.ts:410](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L410)

### `liquidityPool.counter_liquidity_pool_id`

```ts
counter_liquidity_pool_id?: string;
```

**Source:** [src/horizon/server_api.ts:434](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L434)

### `liquidityPool.id`

```ts
id: string;
```

**Source:** [src/horizon/server_api.ts:399](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L399)

### `liquidityPool.ledger_close_time`

```ts
ledger_close_time: string;
```

**Source:** [src/horizon/server_api.ts:401](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L401)

### `liquidityPool.liquidity_pool_fee_bp`

```ts
liquidity_pool_fee_bp: number;
```

**Source:** [src/horizon/server_api.ts:435](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L435)

### `liquidityPool.operation`

```ts
operation: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:419](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L419)

### `liquidityPool.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/server_api.ts:400](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L400)

### `liquidityPool.price`

```ts
price?: { d: string; n: string };
```

**Source:** [src/horizon/server_api.ts:414](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L414)

### `liquidityPool.trade_type`

```ts
trade_type: liquidityPools;
```

**Source:** [src/horizon/server_api.ts:432](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L432)

## Horizon.ServerApi.TradeRecord.Orderbook

```ts
interface Orderbook extends Base {
  _links: { self: ResponseLink };
  base: CallFunction<AccountRecord>;
  base_account: string;
  base_amount: string;
  base_asset_code?: string;
  base_asset_issuer?: string;
  base_asset_type: string;
  base_is_seller: boolean;
  base_offer_id: string;
  counter: CallFunction<AccountRecord>;
  counter_account: string;
  counter_amount: string;
  counter_asset_code?: string;
  counter_asset_issuer?: string;
  counter_asset_type: string;
  counter_offer_id: string;
  id: string;
  ledger_close_time: string;
  operation: CallFunction<OperationRecord>;
  paging_token: string;
  price?: { d: string; n: string };
  trade_type: orderbook;
}
```

**Source:** [src/horizon/server_api.ts:421](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L421)

### `orderbook._links`

```ts
_links: { self: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `orderbook.base`

```ts
base: CallFunction<AccountRecord>;
```

**Source:** [src/horizon/server_api.ts:428](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L428)

### `orderbook.base_account`

```ts
base_account: string;
```

**Source:** [src/horizon/server_api.ts:424](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L424)

### `orderbook.base_amount`

```ts
base_amount: string;
```

**Source:** [src/horizon/server_api.ts:404](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L404)

### `orderbook.base_asset_code`

```ts
base_asset_code?: string;
```

**Source:** [src/horizon/server_api.ts:406](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L406)

### `orderbook.base_asset_issuer`

```ts
base_asset_issuer?: string;
```

**Source:** [src/horizon/server_api.ts:407](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L407)

### `orderbook.base_asset_type`

```ts
base_asset_type: string;
```

**Source:** [src/horizon/server_api.ts:405](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L405)

### `orderbook.base_is_seller`

```ts
base_is_seller: boolean;
```

**Source:** [src/horizon/server_api.ts:413](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L413)

### `orderbook.base_offer_id`

```ts
base_offer_id: string;
```

**Source:** [src/horizon/server_api.ts:423](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L423)

### `orderbook.counter`

```ts
counter: CallFunction<AccountRecord>;
```

**Source:** [src/horizon/server_api.ts:429](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L429)

### `orderbook.counter_account`

```ts
counter_account: string;
```

**Source:** [src/horizon/server_api.ts:426](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L426)

### `orderbook.counter_amount`

```ts
counter_amount: string;
```

**Source:** [src/horizon/server_api.ts:409](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L409)

### `orderbook.counter_asset_code`

```ts
counter_asset_code?: string;
```

**Source:** [src/horizon/server_api.ts:411](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L411)

### `orderbook.counter_asset_issuer`

```ts
counter_asset_issuer?: string;
```

**Source:** [src/horizon/server_api.ts:412](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L412)

### `orderbook.counter_asset_type`

```ts
counter_asset_type: string;
```

**Source:** [src/horizon/server_api.ts:410](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L410)

### `orderbook.counter_offer_id`

```ts
counter_offer_id: string;
```

**Source:** [src/horizon/server_api.ts:425](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L425)

### `orderbook.id`

```ts
id: string;
```

**Source:** [src/horizon/server_api.ts:399](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L399)

### `orderbook.ledger_close_time`

```ts
ledger_close_time: string;
```

**Source:** [src/horizon/server_api.ts:401](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L401)

### `orderbook.operation`

```ts
operation: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:419](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L419)

### `orderbook.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/server_api.ts:400](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L400)

### `orderbook.price`

```ts
price?: { d: string; n: string };
```

**Source:** [src/horizon/server_api.ts:414](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L414)

### `orderbook.trade_type`

```ts
trade_type: orderbook;
```

**Source:** [src/horizon/server_api.ts:422](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L422)

## Horizon.ServerApi.TradeType

```ts
enum TradeType
```

**Source:** [src/horizon/server_api.ts:135](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L135)

## Horizon.ServerApi.TransactionRecord

```ts
interface TransactionRecord extends Omit<HorizonApi.TransactionResponse, "ledger"> {
  _links: { account: ResponseLink; effects: ResponseLink; ledger: ResponseLink; operations: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink };
  account: CallFunction<AccountRecord>;
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  envelope_xdr: string;
  fee_account: string;
  fee_bump_transaction?: FeeBumpTransactionResponse;
  fee_charged: string | number;
  fee_meta_xdr: string;
  hash: string;
  id: string;
  inner_transaction?: InnerTransactionResponse;
  ledger: CallFunction<LedgerRecord>;
  ledger_attr: number;
  max_fee: string | number;
  memo?: string;
  memo_bytes?: string;
  memo_type: MemoType;
  operation_count: number;
  operations: CallCollectionFunction<OperationRecord>;
  paging_token: string;
  precedes: CallFunction<TransactionRecord>;
  preconditions?: TransactionPreconditions;
  result_meta_xdr: string;
  result_xdr: string;
  self: CallFunction<TransactionRecord>;
  signatures: string[];
  source_account: string;
  source_account_sequence: string;
  succeeds: CallFunction<TransactionRecord>;
  successful: boolean;
}
```

**Source:** [src/horizon/server_api.ts:442](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L442)

### `transactionRecord._links`

```ts
_links: { account: ResponseLink; effects: ResponseLink; ledger: ResponseLink; operations: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `transactionRecord.account`

```ts
account: CallFunction<AccountRecord>;
```

**Source:** [src/horizon/server_api.ts:448](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L448)

### `transactionRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:66](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L66)

### `transactionRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:449](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L449)

### `transactionRecord.envelope_xdr`

```ts
envelope_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:17](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L17)

### `transactionRecord.fee_account`

```ts
fee_account: string;
```

**Source:** [src/horizon/horizon_api.ts:79](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L79)

### `transactionRecord.fee_bump_transaction`

```ts
fee_bump_transaction?: FeeBumpTransactionResponse;
```

**Source:** [src/horizon/horizon_api.ts:81](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L81)

### `transactionRecord.fee_charged`

```ts
fee_charged: string | number;
```

**Source:** [src/horizon/horizon_api.ts:68](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L68)

### `transactionRecord.fee_meta_xdr`

```ts
fee_meta_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:67](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L67)

### `transactionRecord.hash`

```ts
hash: string;
```

**Source:** [src/horizon/horizon_api.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L14)

### `transactionRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:70](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L70)

### `transactionRecord.inner_transaction`

```ts
inner_transaction?: InnerTransactionResponse;
```

**Source:** [src/horizon/horizon_api.ts:80](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L80)

### `transactionRecord.ledger`

```ts
ledger: CallFunction<LedgerRecord>;
```

**Source:** [src/horizon/server_api.ts:450](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L450)

### `transactionRecord.ledger_attr`

```ts
ledger_attr: number;
```

**Source:** [src/horizon/server_api.ts:446](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L446)

### `transactionRecord.max_fee`

```ts
max_fee: string | number;
```

**Source:** [src/horizon/horizon_api.ts:69](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L69)

### `transactionRecord.memo`

```ts
memo?: string;
```

**Source:** [src/horizon/horizon_api.ts:72](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L72)

### `transactionRecord.memo_bytes`

```ts
memo_bytes?: string;
```

**Source:** [src/horizon/horizon_api.ts:73](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L73)

### `transactionRecord.memo_type`

```ts
memo_type: MemoType;
```

**Source:** [src/horizon/horizon_api.ts:71](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L71)

### `transactionRecord.operation_count`

```ts
operation_count: number;
```

**Source:** [src/horizon/horizon_api.ts:74](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L74)

### `transactionRecord.operations`

```ts
operations: CallCollectionFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:451](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L451)

### `transactionRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:75](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L75)

### `transactionRecord.precedes`

```ts
precedes: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:452](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L452)

### `transactionRecord.preconditions`

```ts
preconditions?: TransactionPreconditions;
```

**Source:** [src/horizon/horizon_api.ts:82](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L82)

### `transactionRecord.result_meta_xdr`

```ts
result_meta_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:19](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L19)

### `transactionRecord.result_xdr`

```ts
result_xdr: string;
```

**Source:** [src/horizon/horizon_api.ts:18](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L18)

### `transactionRecord.self`

```ts
self: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:453](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L453)

### `transactionRecord.signatures`

```ts
signatures: string[];
```

**Source:** [src/horizon/horizon_api.ts:76](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L76)

### `transactionRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:77](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L77)

### `transactionRecord.source_account_sequence`

```ts
source_account_sequence: string;
```

**Source:** [src/horizon/horizon_api.ts:78](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L78)

### `transactionRecord.succeeds`

```ts
succeeds: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:454](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L454)

### `transactionRecord.successful`

```ts
successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:16](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L16)

## Horizon.ServerApi.WithdrawLiquidityOperationRecord

```ts
interface WithdrawLiquidityOperationRecord extends BaseOperationRecord<OperationResponseType.liquidityPoolWithdraw, OperationResponseTypeI.liquidityPoolWithdraw>, WithdrawLiquidityOperationResponse {
  _links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
  created_at: string;
  effects: CallCollectionFunction<EffectRecord>;
  id: string;
  liquidity_pool_id: string;
  paging_token: string;
  precedes: CallFunction<OperationRecord>;
  reserves_min: Reserve[];
  reserves_received: Reserve[];
  self: CallFunction<OperationRecord>;
  shares: string;
  source_account: string;
  succeeds: CallFunction<OperationRecord>;
  transaction: CallFunction<TransactionRecord>;
  transaction_hash: string;
  transaction_successful: boolean;
  type: liquidityPoolWithdraw;
  type_i: liquidityPoolWithdraw;
}
```

**Source:** [src/horizon/server_api.ts:340](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L340)

### `withdrawLiquidityOperationRecord._links`

```ts
_links: { effects: ResponseLink; precedes: ResponseLink; self: ResponseLink; succeeds: ResponseLink; transaction: ResponseLink };
```

**Source:** [src/horizon/horizon_api.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L10)

### `withdrawLiquidityOperationRecord.created_at`

```ts
created_at: string;
```

**Source:** [src/horizon/horizon_api.ts:268](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L268)

### `withdrawLiquidityOperationRecord.effects`

```ts
effects: CallCollectionFunction<EffectRecord>;
```

**Source:** [src/horizon/server_api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L180)

### `withdrawLiquidityOperationRecord.id`

```ts
id: string;
```

**Source:** [src/horizon/horizon_api.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L263)

### `withdrawLiquidityOperationRecord.liquidity_pool_id`

```ts
liquidity_pool_id: string;
```

**Source:** [src/horizon/horizon_api.ts:550](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L550)

### `withdrawLiquidityOperationRecord.paging_token`

```ts
paging_token: string;
```

**Source:** [src/horizon/horizon_api.ts:264](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L264)

### `withdrawLiquidityOperationRecord.precedes`

```ts
precedes: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L179)

### `withdrawLiquidityOperationRecord.reserves_min`

```ts
reserves_min: Reserve[];
```

**Source:** [src/horizon/horizon_api.ts:551](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L551)

### `withdrawLiquidityOperationRecord.reserves_received`

```ts
reserves_received: Reserve[];
```

**Source:** [src/horizon/horizon_api.ts:553](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L553)

### `withdrawLiquidityOperationRecord.self`

```ts
self: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:177](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L177)

### `withdrawLiquidityOperationRecord.shares`

```ts
shares: string;
```

**Source:** [src/horizon/horizon_api.ts:552](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L552)

### `withdrawLiquidityOperationRecord.source_account`

```ts
source_account: string;
```

**Source:** [src/horizon/horizon_api.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L265)

### `withdrawLiquidityOperationRecord.succeeds`

```ts
succeeds: CallFunction<OperationRecord>;
```

**Source:** [src/horizon/server_api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L178)

### `withdrawLiquidityOperationRecord.transaction`

```ts
transaction: CallFunction<TransactionRecord>;
```

**Source:** [src/horizon/server_api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/server_api.ts#L181)

### `withdrawLiquidityOperationRecord.transaction_hash`

```ts
transaction_hash: string;
```

**Source:** [src/horizon/horizon_api.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L269)

### `withdrawLiquidityOperationRecord.transaction_successful`

```ts
transaction_successful: boolean;
```

**Source:** [src/horizon/horizon_api.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L270)

### `withdrawLiquidityOperationRecord.type`

```ts
type: liquidityPoolWithdraw;
```

**Source:** [src/horizon/horizon_api.ts:266](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L266)

### `withdrawLiquidityOperationRecord.type_i`

```ts
type_i: liquidityPoolWithdraw;
```

**Source:** [src/horizon/horizon_api.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_api.ts#L267)

## Horizon.getCurrentServerTime

Given a hostname, get the current time of that server (i.e., use the last-
recorded server time and offset it by the time since then.) If there IS no
recorded server time, or it's been 5 minutes since the last, return null.

```ts
getCurrentServerTime(hostname: string): number | null
```

**Parameters**

- **`hostname`** — `string` (required) — Hostname of a Horizon server.

**Returns**

The UNIX timestamp (in seconds, not milliseconds)
representing the current time on that server, or `null` if we don't have
a record of that time.

**Source:** [src/horizon/horizon_axios_client.ts:96](https://github.com/stellar/js-stellar-sdk/blob/master/src/horizon/horizon_axios_client.ts#L96)
