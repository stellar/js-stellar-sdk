// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ClaimClaimableBalanceResultCode = xdr.enumType(
  "ClaimClaimableBalanceResultCode",
  {
    claimClaimableBalanceSuccess: 0,
    claimClaimableBalanceDoesNotExist: -1,
    claimClaimableBalanceCannotClaim: -2,
    claimClaimableBalanceLineFull: -3,
    claimClaimableBalanceNoTrust: -4,
    claimClaimableBalanceNotAuthorized: -5,
    claimClaimableBalanceTrustlineFrozen: -6,
  } as const,
);
export type ClaimClaimableBalanceResultCode = xdr.Infer<
  typeof ClaimClaimableBalanceResultCode
>;
