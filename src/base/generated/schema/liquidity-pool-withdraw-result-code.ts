// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const LiquidityPoolWithdrawResultCode = xdr.enumType(
  "LiquidityPoolWithdrawResultCode",
  {
    liquidityPoolWithdrawSuccess: 0,
    liquidityPoolWithdrawMalformed: -1,
    liquidityPoolWithdrawNoTrust: -2,
    liquidityPoolWithdrawUnderfunded: -3,
    liquidityPoolWithdrawLineFull: -4,
    liquidityPoolWithdrawUnderMinimum: -5,
    liquidityPoolWithdrawTrustlineFrozen: -6,
  } as const,
);
export type LiquidityPoolWithdrawResultCode = xdr.Infer<
  typeof LiquidityPoolWithdrawResultCode
>;
