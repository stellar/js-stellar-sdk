// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LiquidityPoolDepositResultCode } from "./liquidity-pool-deposit-result-code.js";
export type LiquidityPoolDepositResult =
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
    }
  | {
      readonly code: -7;
    }
  | {
      readonly code: -8;
    };
export const LiquidityPoolDepositResult = xdr.union(
  "LiquidityPoolDepositResult",
  {
    switchOn: xdr.lazy(() => LiquidityPoolDepositResultCode),
    switchKey: "code",
    cases: [
      xdr.case("liquidityPoolDepositSuccess", 0, xdr.void()),
      xdr.case("liquidityPoolDepositMalformed", -1, xdr.void()),
      xdr.case("liquidityPoolDepositNoTrust", -2, xdr.void()),
      xdr.case("liquidityPoolDepositNotAuthorized", -3, xdr.void()),
      xdr.case("liquidityPoolDepositUnderfunded", -4, xdr.void()),
      xdr.case("liquidityPoolDepositLineFull", -5, xdr.void()),
      xdr.case("liquidityPoolDepositBadPrice", -6, xdr.void()),
      xdr.case("liquidityPoolDepositPoolFull", -7, xdr.void()),
      xdr.case("liquidityPoolDepositTrustlineFrozen", -8, xdr.void()),
    ] as const,
  },
) as xdr.XdrType<LiquidityPoolDepositResult>;
