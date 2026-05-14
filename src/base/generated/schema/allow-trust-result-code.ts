// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const AllowTrustResultCode = xdr.enumType("AllowTrustResultCode", {
  allowTrustSuccess: 0,
  allowTrustMalformed: -1,
  allowTrustNoTrustLine: -2,
  allowTrustTrustNotRequired: -3,
  allowTrustCantRevoke: -4,
  allowTrustSelfNotAllowed: -5,
  allowTrustLowReserve: -6,
} as const);
export type AllowTrustResultCode = xdr.Infer<typeof AllowTrustResultCode>;
