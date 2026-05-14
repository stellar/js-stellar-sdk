// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ClawbackClaimableBalanceResultCode = xdr.enumType(
  "ClawbackClaimableBalanceResultCode",
  {
    clawbackClaimableBalanceSuccess: 0,
    clawbackClaimableBalanceDoesNotExist: -1,
    clawbackClaimableBalanceNotIssuer: -2,
    clawbackClaimableBalanceNotClawbackEnabled: -3,
  } as const,
);
export type ClawbackClaimableBalanceResultCode = xdr.Infer<
  typeof ClawbackClaimableBalanceResultCode
>;
