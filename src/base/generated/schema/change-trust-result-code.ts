// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ChangeTrustResultCode = xdr.enumType("ChangeTrustResultCode", {
  changeTrustSuccess: 0,
  changeTrustMalformed: -1,
  changeTrustNoIssuer: -2,
  changeTrustInvalidLimit: -3,
  changeTrustLowReserve: -4,
  changeTrustSelfNotAllowed: -5,
  changeTrustTrustLineMissing: -6,
  changeTrustCannotDelete: -7,
  changeTrustNotAuthMaintainLiabilities: -8,
} as const);
export type ChangeTrustResultCode = xdr.Infer<typeof ChangeTrustResultCode>;
