// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LiquidityPoolConstantProductParameters } from "./liquidity-pool-constant-product-parameters.js";
export interface LiquidityPoolEntryConstantProduct {
  readonly params: LiquidityPoolConstantProductParameters;
  readonly reserveA: bigint;
  readonly reserveB: bigint;
  readonly totalPoolShares: bigint;
  readonly poolSharesTrustLineCount: bigint;
}
export const LiquidityPoolEntryConstantProduct = xdr.struct(
  "LiquidityPoolEntryConstantProduct",
  {
    params: xdr.lazy(() => LiquidityPoolConstantProductParameters),
    reserveA: xdr.int64(),
    reserveB: xdr.int64(),
    totalPoolShares: xdr.int64(),
    poolSharesTrustLineCount: xdr.int64(),
  },
) as xdr.XdrType<LiquidityPoolEntryConstantProduct>;
