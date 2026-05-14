// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClawbackClaimableBalanceResultCode } from "./clawback-claimable-balance-result-code.js";
export type ClawbackClaimableBalanceResult =
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
    };
export const ClawbackClaimableBalanceResult = xdr.union(
  "ClawbackClaimableBalanceResult",
  {
    switchOn: xdr.lazy(() => ClawbackClaimableBalanceResultCode),
    switchKey: "code",
    cases: [
      xdr.case("clawbackClaimableBalanceSuccess", 0, xdr.void()),
      xdr.case("clawbackClaimableBalanceDoesNotExist", -1, xdr.void()),
      xdr.case("clawbackClaimableBalanceNotIssuer", -2, xdr.void()),
      xdr.case("clawbackClaimableBalanceNotClawbackEnabled", -3, xdr.void()),
    ] as const,
  },
) as xdr.XdrType<ClawbackClaimableBalanceResult>;
