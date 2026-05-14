// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const LedgerHeaderFlags = xdr.enumType("LedgerHeaderFlags", {
  disableLiquidityPoolTradingFlag: 1,
  disableLiquidityPoolDepositFlag: 2,
  disableLiquidityPoolWithdrawalFlag: 4,
} as const);
export type LedgerHeaderFlags = xdr.Infer<typeof LedgerHeaderFlags>;
