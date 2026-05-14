// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ClaimPredicateType = xdr.enumType("ClaimPredicateType", {
  claimPredicateUnconditional: 0,
  claimPredicateAnd: 1,
  claimPredicateOr: 2,
  claimPredicateNot: 3,
  claimPredicateBeforeAbsoluteTime: 4,
  claimPredicateBeforeRelativeTime: 5,
} as const);
export type ClaimPredicateType = xdr.Infer<typeof ClaimPredicateType>;
