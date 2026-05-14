// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { PoolId } from "./pool-id.js";
export interface LiquidityPoolWithdrawOp {
  readonly liquidityPoolId: PoolId;
  readonly amount: bigint;
  readonly minAmountA: bigint;
  readonly minAmountB: bigint;
}
export const LiquidityPoolWithdrawOp = xdr.struct("LiquidityPoolWithdrawOp", {
  liquidityPoolId: xdr.lazy(() => PoolId),
  amount: xdr.int64(),
  minAmountA: xdr.int64(),
  minAmountB: xdr.int64(),
}) as xdr.XdrType<LiquidityPoolWithdrawOp>;
