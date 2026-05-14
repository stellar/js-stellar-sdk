// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { PoolId } from "./pool-id.js";
export interface ClaimLiquidityAtom {
  readonly liquidityPoolId: PoolId;
  readonly assetSold: Asset;
  readonly amountSold: bigint;
  readonly assetBought: Asset;
  readonly amountBought: bigint;
}
export const ClaimLiquidityAtom = xdr.struct("ClaimLiquidityAtom", {
  liquidityPoolId: xdr.lazy(() => PoolId),
  assetSold: xdr.lazy(() => Asset),
  amountSold: xdr.int64(),
  assetBought: xdr.lazy(() => Asset),
  amountBought: xdr.int64(),
}) as xdr.XdrType<ClaimLiquidityAtom>;
