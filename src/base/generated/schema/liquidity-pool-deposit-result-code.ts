// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const LiquidityPoolDepositResultCode = xdr.enumType(
  "LiquidityPoolDepositResultCode",
  {
    liquidityPoolDepositSuccess: 0,
    liquidityPoolDepositMalformed: -1,
    liquidityPoolDepositNoTrust: -2,
    liquidityPoolDepositNotAuthorized: -3,
    liquidityPoolDepositUnderfunded: -4,
    liquidityPoolDepositLineFull: -5,
    liquidityPoolDepositBadPrice: -6,
    liquidityPoolDepositPoolFull: -7,
    liquidityPoolDepositTrustlineFrozen: -8,
  } as const,
);
export type LiquidityPoolDepositResultCode = xdr.Infer<
  typeof LiquidityPoolDepositResultCode
>;
