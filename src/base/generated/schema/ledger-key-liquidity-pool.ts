// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { PoolId } from "./pool-id.js";
export interface LedgerKeyLiquidityPool {
  readonly liquidityPoolId: PoolId;
}
export const LedgerKeyLiquidityPool = xdr.struct("LedgerKeyLiquidityPool", {
  liquidityPoolId: xdr.lazy(() => PoolId),
}) as xdr.XdrType<LedgerKeyLiquidityPool>;
