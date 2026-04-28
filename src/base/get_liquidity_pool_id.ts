import xdr from "./xdr.js";
import { Asset } from "./asset.js";
import { hash } from "./hashing.js";

// Using namespace to keep the current structure of the code, but it can be easily refactored to use a more modern approach with union types and interfaces if needed.
/* eslint-disable @typescript-eslint/no-namespace */
export namespace LiquidityPoolType {
  export type constantProduct = "constant_product";
}
export type LiquidityPoolType = LiquidityPoolType.constantProduct;

export namespace LiquidityPoolParameters {
  export interface ConstantProduct {
    assetA: Asset;
    assetB: Asset;
    fee: number;
  }
}
export type LiquidityPoolParameters = LiquidityPoolParameters.ConstantProduct;
/* eslint-enable @typescript-eslint/no-namespace */

// LiquidityPoolFeeV18 is the default liquidity pool fee in protocol v18. It defaults to 30 base points (0.3%).
export const LiquidityPoolFeeV18 = 30;

/**
 * Computes the Pool ID for the given assets, fee and pool type.
 *
 * Returns the raw Pool ID buffer, which can be stringified with
 * `toString('hex')`.
 *
 * @see [stellar-core getPoolID](https://github.com/stellar/stellar-core/blob/9f3a48c6a8f1aa77b6043a055d0638661f718080/src/ledger/test/LedgerTxnTests.cpp#L3746-L3751)
 *
 * @param liquidityPoolType - A string representing the liquidity pool type.
 * @param liquidityPoolParameters - The liquidity pool parameters.
 * @param liquidityPoolParameters.assetA - The first asset in the Pool, it must respect the rule assetA < assetB.
 * @param liquidityPoolParameters.assetB - The second asset in the Pool, it must respect the rule assetA < assetB.
 * @param liquidityPoolParameters.fee - The liquidity pool fee. For now the only fee supported is `30`.
 */
export function getLiquidityPoolId(
  liquidityPoolType: LiquidityPoolType,
  liquidityPoolParameters: LiquidityPoolParameters,
) {
  if (liquidityPoolType !== "constant_product") {
    throw new Error("liquidityPoolType is invalid");
  }

  const { assetA, assetB, fee } =
    liquidityPoolParameters ?? ({} as LiquidityPoolParameters);

  if (!assetA || !(assetA instanceof Asset)) {
    throw new Error("assetA is invalid");
  }

  if (!assetB || !(assetB instanceof Asset)) {
    throw new Error("assetB is invalid");
  }

  if (!fee || fee !== LiquidityPoolFeeV18) {
    throw new Error("fee is invalid");
  }

  if (Asset.compare(assetA, assetB) !== -1) {
    throw new Error("Assets are not in lexicographic order");
  }

  const payload = xdr.LiquidityPoolParameters.liquidityPoolConstantProduct(
    new xdr.LiquidityPoolConstantProductParameters({
      assetA: assetA.toXDRObject(),
      assetB: assetB.toXDRObject(),
      fee,
    }),
  ).toXDR();

  return hash(payload);
}
