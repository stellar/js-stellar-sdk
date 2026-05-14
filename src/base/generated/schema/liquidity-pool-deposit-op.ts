// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { PoolId } from "./pool-id.js";
import { Price } from "./price.js";
export interface LiquidityPoolDepositOp {
  readonly liquidityPoolId: PoolId;
  readonly maxAmountA: bigint;
  readonly maxAmountB: bigint;
  readonly minPrice: Price;
  readonly maxPrice: Price;
}
export const LiquidityPoolDepositOp = xdr.struct("LiquidityPoolDepositOp", {
  liquidityPoolId: xdr.lazy(() => PoolId),
  maxAmountA: xdr.int64(),
  maxAmountB: xdr.int64(),
  minPrice: xdr.lazy(() => Price),
  maxPrice: xdr.lazy(() => Price),
}) as xdr.XdrType<LiquidityPoolDepositOp>;
