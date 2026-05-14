// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LiquidityPoolEntryBody } from "./liquidity-pool-entry-body.js";
import { PoolId } from "./pool-id.js";
export interface LiquidityPoolEntry {
  readonly liquidityPoolId: PoolId;
  readonly body: LiquidityPoolEntryBody;
}
export const LiquidityPoolEntry = xdr.struct("LiquidityPoolEntry", {
  liquidityPoolId: xdr.lazy(() => PoolId),
  body: xdr.lazy(() => LiquidityPoolEntryBody),
}) as xdr.XdrType<LiquidityPoolEntry>;
