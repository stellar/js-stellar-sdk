// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const AccountMergeResultCode = xdr.enumType("AccountMergeResultCode", {
  accountMergeSuccess: 0,
  accountMergeMalformed: -1,
  accountMergeNoAccount: -2,
  accountMergeImmutableSet: -3,
  accountMergeHasSubEntries: -4,
  accountMergeSeqnumTooFar: -5,
  accountMergeDestFull: -6,
  accountMergeIsSponsor: -7,
} as const);
export type AccountMergeResultCode = xdr.Infer<typeof AccountMergeResultCode>;
