// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const TrustLineFlags = xdr.enumType("TrustLineFlags", {
  authorizedFlag: 1,
  authorizedToMaintainLiabilitiesFlag: 2,
  trustlineClawbackEnabledFlag: 4,
} as const);
export type TrustLineFlags = xdr.Infer<typeof TrustLineFlags>;
