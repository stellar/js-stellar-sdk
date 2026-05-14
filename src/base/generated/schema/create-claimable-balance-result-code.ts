// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const CreateClaimableBalanceResultCode = xdr.enumType(
  "CreateClaimableBalanceResultCode",
  {
    createClaimableBalanceSuccess: 0,
    createClaimableBalanceMalformed: -1,
    createClaimableBalanceLowReserve: -2,
    createClaimableBalanceNoTrust: -3,
    createClaimableBalanceNotAuthorized: -4,
    createClaimableBalanceUnderfunded: -5,
  } as const,
);
export type CreateClaimableBalanceResultCode = xdr.Infer<
  typeof CreateClaimableBalanceResultCode
>;
