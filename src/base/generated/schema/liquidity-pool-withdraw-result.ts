// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LiquidityPoolWithdrawResultCode } from "./liquidity-pool-withdraw-result-code.js";
export type LiquidityPoolWithdrawResult =
  | {
      readonly code: 0;
    }
  | {
      readonly code: -1;
    }
  | {
      readonly code: -2;
    }
  | {
      readonly code: -3;
    }
  | {
      readonly code: -4;
    }
  | {
      readonly code: -5;
    }
  | {
      readonly code: -6;
    };
export const LiquidityPoolWithdrawResult = xdr.union(
  "LiquidityPoolWithdrawResult",
  {
    switchOn: xdr.lazy(() => LiquidityPoolWithdrawResultCode),
    switchKey: "code",
    cases: [
      xdr.case("liquidityPoolWithdrawSuccess", 0, xdr.void()),
      xdr.case("liquidityPoolWithdrawMalformed", -1, xdr.void()),
      xdr.case("liquidityPoolWithdrawNoTrust", -2, xdr.void()),
      xdr.case("liquidityPoolWithdrawUnderfunded", -3, xdr.void()),
      xdr.case("liquidityPoolWithdrawLineFull", -4, xdr.void()),
      xdr.case("liquidityPoolWithdrawUnderMinimum", -5, xdr.void()),
      xdr.case("liquidityPoolWithdrawTrustlineFrozen", -6, xdr.void()),
    ] as const,
  },
) as xdr.XdrType<LiquidityPoolWithdrawResult>;
