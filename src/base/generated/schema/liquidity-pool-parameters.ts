// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LiquidityPoolConstantProductParameters } from "./liquidity-pool-constant-product-parameters.js";
import { LiquidityPoolType } from "./liquidity-pool-type.js";
export type LiquidityPoolParameters = {
  readonly type: 0;
  readonly constantProduct: LiquidityPoolConstantProductParameters;
};
export const LiquidityPoolParameters = xdr.union("LiquidityPoolParameters", {
  switchOn: xdr.lazy(() => LiquidityPoolType),
  switchKey: "type",
  cases: [
    xdr.case(
      "liquidityPoolConstantProduct",
      0,
      xdr.field(
        "constantProduct",
        xdr.lazy(() => LiquidityPoolConstantProductParameters),
      ),
    ),
  ] as const,
}) as xdr.XdrType<LiquidityPoolParameters>;
