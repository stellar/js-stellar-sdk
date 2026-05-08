---
title: Core / Assets
category: Core / Assets
---

# Core / Assets

## Asset

Asset class represents an asset, either the native asset (`XLM`)
or an asset code / issuer account ID pair.

An asset describes an asset code and issuer pair. In the case of the native
asset XLM, the issuer will be undefined.

```ts
class Asset
```

**Source:** [src/base/asset.ts:46](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/asset.ts#L46)

## AssetType

```ts
type AssetType = typeof AssetType[keyof typeof AssetType]
```

**Source:** [src/base/asset.ts:7](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/asset.ts#L7)

## AssetType

```ts
const AssetType: { readonly credit12: "credit_alphanum12"; readonly credit4: "credit_alphanum4"; readonly liquidityPoolShares: "liquidity_pool_shares"; readonly native: "native" }
```

**Source:** [src/base/asset.ts:7](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/asset.ts#L7)

## AssetType.credit12

```ts
type credit12 = "credit_alphanum12"
```

**Source:** [src/base/asset.ts:20](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/asset.ts#L20)

## AssetType.credit4

```ts
type credit4 = "credit_alphanum4"
```

**Source:** [src/base/asset.ts:19](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/asset.ts#L19)

## AssetType.liquidityPoolShares

```ts
type liquidityPoolShares = "liquidity_pool_shares"
```

**Source:** [src/base/asset.ts:21](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/asset.ts#L21)

## AssetType.native

```ts
type native = "native"
```

**Source:** [src/base/asset.ts:18](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/asset.ts#L18)

## Claimant

Claimant class represents an xdr.Claimant

The claim predicate is optional, it defaults to unconditional if none is specified.

```ts
class Claimant
```

**Source:** [src/base/claimant.ts:10](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/claimant.ts#L10)

## LiquidityPoolAsset

LiquidityPoolAsset class represents a liquidity pool trustline change.

```ts
class LiquidityPoolAsset
```

**Source:** [src/base/liquidity_pool_asset.ts:12](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/liquidity_pool_asset.ts#L12)

## LiquidityPoolFeeV18

```ts
const LiquidityPoolFeeV18: 30
```

**Source:** [src/base/get_liquidity_pool_id.ts:22](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/get_liquidity_pool_id.ts#L22)

## LiquidityPoolId

LiquidityPoolId class represents the asset referenced by a trustline to a
liquidity pool.

```ts
class LiquidityPoolId
```

**Source:** [src/base/liquidity_pool_id.ts:7](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/liquidity_pool_id.ts#L7)

## LiquidityPoolParameters

```ts
type LiquidityPoolParameters = LiquidityPoolParameters.ConstantProduct
```

**Source:** [src/base/get_liquidity_pool_id.ts:12](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/get_liquidity_pool_id.ts#L12)

## LiquidityPoolParameters.ConstantProduct

```ts
interface ConstantProduct
```

**Source:** [src/base/get_liquidity_pool_id.ts:13](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/get_liquidity_pool_id.ts#L13)

## LiquidityPoolType

```ts
type LiquidityPoolType = LiquidityPoolType.constantProduct
```

**Source:** [src/base/get_liquidity_pool_id.ts:7](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/get_liquidity_pool_id.ts#L7)

## LiquidityPoolType.constantProduct

```ts
type constantProduct = "constant_product"
```

**Source:** [src/base/get_liquidity_pool_id.ts:8](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/get_liquidity_pool_id.ts#L8)

## getLiquidityPoolId

Computes the Pool ID for the given assets, fee and pool type.

Returns the raw Pool ID buffer, which can be stringified with
`toString('hex')`.

```ts
getLiquidityPoolId(liquidityPoolType: "constant_product", liquidityPoolParameters: ConstantProduct): Buffer<ArrayBufferLike>
```

**Parameters**

- `liquidityPoolType` — A string representing the liquidity pool type.
- `liquidityPoolParameters` — The liquidity pool parameters.
  - `assetA`: The first asset in the Pool, it must respect the rule `assetA < assetB`.
  - `assetB`: The second asset in the Pool, it must respect the rule `assetA < assetB`.
  - `fee`: The liquidity pool fee. For now the only fee supported is `30`.

**See also**

- [stellar-core getPoolID](https://github.com/stellar/stellar-core/blob/9f3a48c6a8f1aa77b6043a055d0638661f718080/src/ledger/test/LedgerTxnTests.cpp#L3746-L3751)

**Source:** [src/base/get_liquidity_pool_id.ts:38](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/base/get_liquidity_pool_id.ts#L38)
