// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
export interface LiquidityPoolConstantProductParameters {
  readonly assetA: Asset;
  readonly assetB: Asset;
  readonly fee: number;
}
export const LiquidityPoolConstantProductParameters = xdr.struct(
  "LiquidityPoolConstantProductParameters",
  {
    assetA: xdr.lazy(() => Asset),
    assetB: xdr.lazy(() => Asset),
    fee: xdr.int32(),
  },
) as xdr.XdrType<LiquidityPoolConstantProductParameters>;
