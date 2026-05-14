// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LiquidityPoolEntryConstantProduct } from "./liquidity-pool-entry-constant-product.js";
import { LiquidityPoolType } from "./liquidity-pool-type.js";
export type LiquidityPoolEntryBody = {
  readonly type: 0;
  readonly constantProduct: LiquidityPoolEntryConstantProduct;
};
export const LiquidityPoolEntryBody = xdr.union("LiquidityPoolEntryBody", {
  switchOn: xdr.lazy(() => LiquidityPoolType),
  switchKey: "type",
  cases: [
    xdr.case(
      "liquidityPoolConstantProduct",
      0,
      xdr.field(
        "constantProduct",
        xdr.lazy(() => LiquidityPoolEntryConstantProduct),
      ),
    ),
  ] as const,
}) as xdr.XdrType<LiquidityPoolEntryBody>;
