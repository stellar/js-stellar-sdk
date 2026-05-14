---
title: Core / Assets
description: Asset and liquidity-pool primitives — native, alphanumeric, claimable balances, and pool IDs.
---

# Core / Assets

## Asset

Asset class represents an asset, either the native asset (`XLM`)
or an asset code / issuer account ID pair.

An asset describes an asset code and issuer pair. In the case of the native
asset XLM, the issuer will be undefined.

```ts
class Asset {
  constructor(code: string, issuer?: string);
  static compare(assetA: Asset, assetB: Asset): -1 | 0 | 1;
  static fromOperation(assetXdr: Asset): Asset;
  static native(): Asset;
  readonly code: string;
  readonly issuer: string | undefined;
  contractId(networkPassphrase: string): string;
  equals(asset: Asset): boolean;
  getAssetType(): AssetType;
  getCode(): string;
  getIssuer(): string | undefined;
  getRawAssetType(): AssetType;
  isNative(): boolean;
  toChangeTrustXDRObject(): ChangeTrustAsset;
  toString(): string;
  toTrustLineXDRObject(): TrustLineAsset;
  toXDRObject(): Asset;
}
```

**Source:** [src/base/asset.ts:46](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L46)

### `new Asset(code, issuer)`

```ts
constructor(code: string, issuer?: string);
```

**Parameters**

- **`code`** — `string` (required) — The asset code.
- **`issuer`** — `string` (optional) — The account ID of the issuer.

**Source:** [src/base/asset.ts:56](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L56)

### `Asset.compare(assetA, assetB)`

Compares two assets according to the criteria:

 1. First compare the type (`native < alphanum4 < alphanum12`).
 2. If the types are equal, compare the assets codes.
 3. If the asset codes are equal, compare the issuers.

```ts
static compare(assetA: Asset, assetB: Asset): -1 | 0 | 1;
```

**Parameters**

- **`assetA`** — `Asset` (required) — the first asset
- **`assetB`** — `Asset` (required) — the second asset

**Source:** [src/base/asset.ts:288](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L288)

### `Asset.fromOperation(assetXdr)`

Returns an asset object from its XDR object representation.

```ts
static fromOperation(assetXdr: Asset): Asset;
```

**Parameters**

- **`assetXdr`** — `Asset` (required) — The asset xdr object.

**Source:** [src/base/asset.ts:90](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L90)

### `Asset.native()`

Returns an asset object for the native asset.

```ts
static native(): Asset;
```

**Source:** [src/base/asset.ts:82](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L82)

### `asset.code`

The asset code.

```ts
readonly code: string;
```

**Source:** [src/base/asset.ts:48](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L48)

### `asset.issuer`

The account ID of the issuer. Undefined for the native asset.

```ts
readonly issuer: string | undefined;
```

**Source:** [src/base/asset.ts:50](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L50)

### `asset.contractId(networkPassphrase)`

Returns the would-be contract ID (`C...` format) for this asset on a given
network.

```ts
contractId(networkPassphrase: string): string;
```

**Parameters**

- **`networkPassphrase`** — `string` (required) — indicates which network the contract
     ID should refer to, since every network will have a unique ID for the
     same contract (see `Networks` for options)
  
  **Warning:** This makes no guarantee that this contract actually *exists*.

**Source:** [src/base/asset.ts:143](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L143)

### `asset.equals(asset)`

Returns true if this asset equals the given asset.

```ts
equals(asset: Asset): boolean;
```

**Parameters**

- **`asset`** — `Asset` (required) — Asset to compare

**Source:** [src/base/asset.ts:261](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L261)

### `asset.getAssetType()`

```ts
getAssetType(): AssetType;
```

**Throws**

- Throws `Error` if asset type is unsupported.

**See also**

- [Assets concept](https://developers.stellar.org/docs/glossary/assets/)
Returns the asset type. Can be one of following types:

 - `native`,
 - `credit_alphanum4`,
 - `credit_alphanum12`

**Source:** [src/base/asset.ts:219](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L219)

### `asset.getCode()`

Returns the asset code

```ts
getCode(): string;
```

**Source:** [src/base/asset.ts:196](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L196)

### `asset.getIssuer()`

Returns the asset issuer

```ts
getIssuer(): string | undefined;
```

**Source:** [src/base/asset.ts:203](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L203)

### `asset.getRawAssetType()`

Returns the raw XDR representation of the asset type

```ts
getRawAssetType(): AssetType;
```

**Source:** [src/base/asset.ts:237](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L237)

### `asset.isNative()`

Returns true if this asset object is the native asset.

```ts
isNative(): boolean;
```

**Source:** [src/base/asset.ts:252](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L252)

### `asset.toChangeTrustXDRObject()`

Returns the xdr.ChangeTrustAsset object for this asset.

```ts
toChangeTrustXDRObject(): ChangeTrustAsset;
```

**Source:** [src/base/asset.ts:122](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L122)

### `asset.toString()`

Returns a string representation of this asset.

Native assets return `"native"`. Non-native assets return `"code:issuer"`.

```ts
toString(): string;
```

**Source:** [src/base/asset.ts:270](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L270)

### `asset.toTrustLineXDRObject()`

Returns the xdr.TrustLineAsset object for this asset.

```ts
toTrustLineXDRObject(): TrustLineAsset;
```

**Source:** [src/base/asset.ts:129](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L129)

### `asset.toXDRObject()`

Returns the xdr.Asset object for this asset.

```ts
toXDRObject(): Asset;
```

**Source:** [src/base/asset.ts:115](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L115)

## AssetType

```ts
type AssetType = typeof AssetType[keyof typeof AssetType]
```

**Source:** [src/base/asset.ts:7](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L7)

## AssetType

```ts
const AssetType: { readonly credit12: "credit_alphanum12"; readonly credit4: "credit_alphanum4"; readonly liquidityPoolShares: "liquidity_pool_shares"; readonly native: "native" }
```

**Source:** [src/base/asset.ts:7](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L7)

## AssetType.credit12

```ts
type credit12 = "credit_alphanum12"
```

**Source:** [src/base/asset.ts:20](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L20)

## AssetType.credit4

```ts
type credit4 = "credit_alphanum4"
```

**Source:** [src/base/asset.ts:19](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L19)

## AssetType.liquidityPoolShares

```ts
type liquidityPoolShares = "liquidity_pool_shares"
```

**Source:** [src/base/asset.ts:21](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L21)

## AssetType.native

```ts
type native = "native"
```

**Source:** [src/base/asset.ts:18](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/asset.ts#L18)

## Claimant

Claimant class represents an xdr.Claimant

The claim predicate is optional, it defaults to unconditional if none is specified.

```ts
class Claimant {
  constructor(destination: string, predicate?: ClaimPredicate);
  static fromXDR(claimantXdr: Claimant): Claimant;
  static predicateAnd(left: ClaimPredicate, right: ClaimPredicate): ClaimPredicate;
  static predicateBeforeAbsoluteTime(absBefore: string): ClaimPredicate;
  static predicateBeforeRelativeTime(seconds: string): ClaimPredicate;
  static predicateNot(predicate: ClaimPredicate): ClaimPredicate;
  static predicateOr(left: ClaimPredicate, right: ClaimPredicate): ClaimPredicate;
  static predicateUnconditional(): ClaimPredicate;
  destination: string;
  predicate: ClaimPredicate;
  toXDRObject(): Claimant;
}
```

**Source:** [src/base/claimant.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/claimant.ts#L10)

### `new Claimant(destination, predicate)`

```ts
constructor(destination: string, predicate?: ClaimPredicate);
```

**Parameters**

- **`destination`** — `string` (required) — The destination account ID.
- **`predicate`** — `ClaimPredicate` (optional) — The claim predicate.

**Source:** [src/base/claimant.ts:18](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/claimant.ts#L18)

### `Claimant.fromXDR(claimantXdr)`

Returns a claimant object from its XDR object representation.

```ts
static fromXDR(claimantXdr: Claimant): Claimant;
```

**Parameters**

- **`claimantXdr`** — `Claimant` (required) — The claimant xdr object.

**Source:** [src/base/claimant.ts:124](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/claimant.ts#L124)

### `Claimant.predicateAnd(left, right)`

Returns an `and` claim predicate

```ts
static predicateAnd(left: ClaimPredicate, right: ClaimPredicate): ClaimPredicate;
```

**Parameters**

- **`left`** — `ClaimPredicate` (required) — an xdr.ClaimPredicate
- **`right`** — `ClaimPredicate` (required) — an xdr.ClaimPredicate

**Source:** [src/base/claimant.ts:45](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/claimant.ts#L45)

### `Claimant.predicateBeforeAbsoluteTime(absBefore)`

Returns a `BeforeAbsoluteTime` claim predicate

This predicate will be fulfilled if the closing time of the ledger that
includes the CreateClaimableBalance operation is less than this (absolute)
Unix timestamp (expressed in seconds).

```ts
static predicateBeforeAbsoluteTime(absBefore: string): ClaimPredicate;
```

**Parameters**

- **`absBefore`** — `string` (required) — Unix epoch (in seconds) as a string

**Source:** [src/base/claimant.ts:99](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/claimant.ts#L99)

### `Claimant.predicateBeforeRelativeTime(seconds)`

Returns a `BeforeRelativeTime` claim predicate

This predicate will be fulfilled if the closing time of the ledger that
includes the CreateClaimableBalance operation plus this relative time delta
(in seconds) is less than the current time.

```ts
static predicateBeforeRelativeTime(seconds: string): ClaimPredicate;
```

**Parameters**

- **`seconds`** — `string` (required) — seconds since closeTime of the ledger in which the ClaimableBalanceEntry was created (as string)

**Source:** [src/base/claimant.ts:114](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/claimant.ts#L114)

### `Claimant.predicateNot(predicate)`

Returns a `not` claim predicate

```ts
static predicateNot(predicate: ClaimPredicate): ClaimPredicate;
```

**Parameters**

- **`predicate`** — `ClaimPredicate` (required) — an xdr.ClaimPredicate

**Source:** [src/base/claimant.ts:82](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/claimant.ts#L82)

### `Claimant.predicateOr(left, right)`

Returns an `or` claim predicate

```ts
static predicateOr(left: ClaimPredicate, right: ClaimPredicate): ClaimPredicate;
```

**Parameters**

- **`left`** — `ClaimPredicate` (required) — an xdr.ClaimPredicate
- **`right`** — `ClaimPredicate` (required) — an xdr.ClaimPredicate

**Source:** [src/base/claimant.ts:64](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/claimant.ts#L64)

### `Claimant.predicateUnconditional()`

Returns an unconditional claim predicate

```ts
static predicateUnconditional(): ClaimPredicate;
```

**Source:** [src/base/claimant.ts:36](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/claimant.ts#L36)

### `claimant.destination`

The destination account ID.

```ts
destination: string;
```

**Source:** [src/base/claimant.ts:153](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/claimant.ts#L153)

### `claimant.predicate`

The claim predicate.

```ts
predicate: ClaimPredicate;
```

**Source:** [src/base/claimant.ts:164](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/claimant.ts#L164)

### `claimant.toXDRObject()`

Returns the xdr object for this claimant.

```ts
toXDRObject(): Claimant;
```

**Source:** [src/base/claimant.ts:141](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/claimant.ts#L141)

## LiquidityPoolAsset

LiquidityPoolAsset class represents a liquidity pool trustline change.

```ts
class LiquidityPoolAsset {
  constructor(assetA: Asset, assetB: Asset, fee: number);
  static fromOperation(ctAssetXdr: ChangeTrustAsset): LiquidityPoolAsset;
  assetA: Asset;
  assetB: Asset;
  fee: number;
  equals(other: LiquidityPoolAsset): boolean;
  getAssetType(): "liquidity_pool_shares";
  getLiquidityPoolParameters(): ConstantProduct;
  toString(): string;
  toXDRObject(): ChangeTrustAsset;
}
```

**Source:** [src/base/liquidity_pool_asset.ts:12](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_asset.ts#L12)

### `new LiquidityPoolAsset(assetA, assetB, fee)`

```ts
constructor(assetA: Asset, assetB: Asset, fee: number);
```

**Parameters**

- **`assetA`** — `Asset` (required) — The first asset in the Pool, it must respect the rule `assetA < assetB`. See `Asset.compare` for more details on how assets are sorted.
- **`assetB`** — `Asset` (required) — The second asset in the Pool, it must respect the rule `assetA < assetB`. See `Asset.compare` for more details on how assets are sorted.
- **`fee`** — `number` (required) — The liquidity pool fee. For now the only fee supported is `30`.

**Source:** [src/base/liquidity_pool_asset.ts:22](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_asset.ts#L22)

### `LiquidityPoolAsset.fromOperation(ctAssetXdr)`

Returns a liquidity pool asset object from its XDR ChangeTrustAsset object
representation.

```ts
static fromOperation(ctAssetXdr: ChangeTrustAsset): LiquidityPoolAsset;
```

**Parameters**

- **`ctAssetXdr`** — `ChangeTrustAsset` (required) — The asset XDR object.

**Source:** [src/base/liquidity_pool_asset.ts:50](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_asset.ts#L50)

### `liquidityPoolAsset.assetA`

```ts
assetA: Asset;
```

**Source:** [src/base/liquidity_pool_asset.ts:13](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_asset.ts#L13)

### `liquidityPoolAsset.assetB`

```ts
assetB: Asset;
```

**Source:** [src/base/liquidity_pool_asset.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_asset.ts#L14)

### `liquidityPoolAsset.fee`

```ts
fee: number;
```

**Source:** [src/base/liquidity_pool_asset.ts:15](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_asset.ts#L15)

### `liquidityPoolAsset.equals(other)`

Returns true if this liquidity pool asset equals the given one.

```ts
equals(other: LiquidityPoolAsset): boolean;
```

**Parameters**

- **`other`** — `LiquidityPoolAsset` (required) — the LiquidityPoolAsset to compare

**Source:** [src/base/liquidity_pool_asset.ts:116](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_asset.ts#L116)

### `liquidityPoolAsset.getAssetType()`

Returns the asset type, always `"liquidity_pool_shares"`.

```ts
getAssetType(): "liquidity_pool_shares";
```

**See also**

- [Assets concept](https://developers.stellar.org/docs/glossary/assets/)

**Source:** [src/base/liquidity_pool_asset.ts:107](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_asset.ts#L107)

### `liquidityPoolAsset.getLiquidityPoolParameters()`

Returns liquidity pool parameters.

```ts
getLiquidityPoolParameters(): ConstantProduct;
```

**Source:** [src/base/liquidity_pool_asset.ts:93](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_asset.ts#L93)

### `liquidityPoolAsset.toString()`

Returns a string representation in `liquidity_pool:<hex pool id>` format.

```ts
toString(): string;
```

**Source:** [src/base/liquidity_pool_asset.ts:125](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_asset.ts#L125)

### `liquidityPoolAsset.toXDRObject()`

Returns the `xdr.ChangeTrustAsset` object for this liquidity pool asset.

Note: To convert from an ``Asset`` to `xdr.ChangeTrustAsset`
please refer to the
``Asset.toChangeTrustXDRObject`` method.

```ts
toXDRObject(): ChangeTrustAsset;
```

**Source:** [src/base/liquidity_pool_asset.ts:75](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_asset.ts#L75)

## LiquidityPoolFeeV18

```ts
const LiquidityPoolFeeV18: 30
```

**Source:** [src/base/get_liquidity_pool_id.ts:22](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/get_liquidity_pool_id.ts#L22)

## LiquidityPoolId

LiquidityPoolId class represents the asset referenced by a trustline to a
liquidity pool.

```ts
class LiquidityPoolId {
  constructor(liquidityPoolId: string);
  static fromOperation(tlAssetXdr: TrustLineAsset): LiquidityPoolId;
  liquidityPoolId: string;
  equals(asset: LiquidityPoolId): boolean;
  getAssetType(): "liquidity_pool_shares";
  getLiquidityPoolId(): string;
  toString(): string;
  toXDRObject(): TrustLineAsset;
}
```

**Source:** [src/base/liquidity_pool_id.ts:7](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_id.ts#L7)

### `new LiquidityPoolId(liquidityPoolId)`

```ts
constructor(liquidityPoolId: string);
```

**Parameters**

- **`liquidityPoolId`** — `string` (required) — The ID of the liquidity pool in string 'hex'.

**Source:** [src/base/liquidity_pool_id.ts:13](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_id.ts#L13)

### `LiquidityPoolId.fromOperation(tlAssetXdr)`

Returns a liquidity pool ID object from its xdr.TrustLineAsset representation.

```ts
static fromOperation(tlAssetXdr: TrustLineAsset): LiquidityPoolId;
```

**Parameters**

- **`tlAssetXdr`** — `TrustLineAsset` (required) — The asset XDR object.

**Source:** [src/base/liquidity_pool_id.ts:28](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_id.ts#L28)

### `liquidityPoolId.liquidityPoolId`

```ts
liquidityPoolId: string;
```

**Source:** [src/base/liquidity_pool_id.ts:8](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_id.ts#L8)

### `liquidityPoolId.equals(asset)`

Returns true if this liquidity pool ID equals the given one.

```ts
equals(asset: LiquidityPoolId): boolean;
```

**Parameters**

- **`asset`** — `LiquidityPoolId` (required) — LiquidityPoolId to compare.

**Source:** [src/base/liquidity_pool_id.ts:77](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_id.ts#L77)

### `liquidityPoolId.getAssetType()`

Returns the asset type, always `"liquidity_pool_shares"`.

```ts
getAssetType(): "liquidity_pool_shares";
```

**See also**

- [Assets concept](https://developers.stellar.org/docs/glossary/assets/)

**Source:** [src/base/liquidity_pool_id.ts:68](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_id.ts#L68)

### `liquidityPoolId.getLiquidityPoolId()`

Returns the liquidity pool ID as a hex string.

```ts
getLiquidityPoolId(): string;
```

**Source:** [src/base/liquidity_pool_id.ts:59](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_id.ts#L59)

### `liquidityPoolId.toString()`

Returns a string representation of this liquidity pool ID.

```ts
toString(): string;
```

**Source:** [src/base/liquidity_pool_id.ts:84](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_id.ts#L84)

### `liquidityPoolId.toXDRObject()`

Returns the `xdr.TrustLineAsset` object for this liquidity pool ID.

Note: To convert from ``Asset`` to `xdr.TrustLineAsset` please
refer to the
``Asset.toTrustLineXDRObject`` method.

```ts
toXDRObject(): TrustLineAsset;
```

**Source:** [src/base/liquidity_pool_id.ts:48](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/liquidity_pool_id.ts#L48)

## LiquidityPoolParameters

```ts
type LiquidityPoolParameters = LiquidityPoolParameters.ConstantProduct
```

**Source:** [src/base/get_liquidity_pool_id.ts:12](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/get_liquidity_pool_id.ts#L12)

## LiquidityPoolParameters.ConstantProduct

```ts
interface ConstantProduct {
  assetA: Asset;
  assetB: Asset;
  fee: number;
}
```

**Source:** [src/base/get_liquidity_pool_id.ts:13](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/get_liquidity_pool_id.ts#L13)

### `constantProduct.assetA`

```ts
assetA: Asset;
```

**Source:** [src/base/get_liquidity_pool_id.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/get_liquidity_pool_id.ts#L14)

### `constantProduct.assetB`

```ts
assetB: Asset;
```

**Source:** [src/base/get_liquidity_pool_id.ts:15](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/get_liquidity_pool_id.ts#L15)

### `constantProduct.fee`

```ts
fee: number;
```

**Source:** [src/base/get_liquidity_pool_id.ts:16](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/get_liquidity_pool_id.ts#L16)

## LiquidityPoolType

```ts
type LiquidityPoolType = LiquidityPoolType.constantProduct
```

**Source:** [src/base/get_liquidity_pool_id.ts:7](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/get_liquidity_pool_id.ts#L7)

## LiquidityPoolType.constantProduct

```ts
type constantProduct = "constant_product"
```

**Source:** [src/base/get_liquidity_pool_id.ts:8](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/get_liquidity_pool_id.ts#L8)

## getLiquidityPoolId

Computes the Pool ID for the given assets, fee and pool type.

Returns the raw Pool ID buffer, which can be stringified with
`toString('hex')`.

```ts
getLiquidityPoolId(liquidityPoolType: "constant_product", liquidityPoolParameters: ConstantProduct): Buffer<ArrayBufferLike>
```

**Parameters**

- **`liquidityPoolType`** — `"constant_product"` (required) — A string representing the liquidity pool type.
- **`liquidityPoolParameters`** — `ConstantProduct` (required) — The liquidity pool parameters.
    - `assetA`: The first asset in the Pool, it must respect the rule `assetA < assetB`.
    - `assetB`: The second asset in the Pool, it must respect the rule `assetA < assetB`.
    - `fee`: The liquidity pool fee. For now the only fee supported is `30`.

**See also**

- [stellar-core getPoolID](https://github.com/stellar/stellar-core/blob/9f3a48c6a8f1aa77b6043a055d0638661f718080/src/ledger/test/LedgerTxnTests.cpp#L3746-L3751)

**Source:** [src/base/get_liquidity_pool_id.ts:38](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/get_liquidity_pool_id.ts#L38)
