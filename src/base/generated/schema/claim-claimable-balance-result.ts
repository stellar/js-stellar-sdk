// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClaimClaimableBalanceResultCode } from "./claim-claimable-balance-result-code.js";
export type ClaimClaimableBalanceResult =
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
export const ClaimClaimableBalanceResult = xdr.union(
  "ClaimClaimableBalanceResult",
  {
    switchOn: xdr.lazy(() => ClaimClaimableBalanceResultCode),
    switchKey: "code",
    cases: [
      xdr.case("claimClaimableBalanceSuccess", 0, xdr.void()),
      xdr.case("claimClaimableBalanceDoesNotExist", -1, xdr.void()),
      xdr.case("claimClaimableBalanceCannotClaim", -2, xdr.void()),
      xdr.case("claimClaimableBalanceLineFull", -3, xdr.void()),
      xdr.case("claimClaimableBalanceNoTrust", -4, xdr.void()),
      xdr.case("claimClaimableBalanceNotAuthorized", -5, xdr.void()),
      xdr.case("claimClaimableBalanceTrustlineFrozen", -6, xdr.void()),
    ] as const,
  },
) as xdr.XdrType<ClaimClaimableBalanceResult>;
