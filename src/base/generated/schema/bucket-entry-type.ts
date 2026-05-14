// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const BucketEntryType = xdr.enumType("BucketEntryType", {
  metaentry: -1,
  liveentry: 0,
  deadentry: 1,
  initentry: 2,
} as const);
export type BucketEntryType = xdr.Infer<typeof BucketEntryType>;
