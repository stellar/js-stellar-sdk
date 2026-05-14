// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const BucketListType = xdr.enumType("BucketListType", {
  live: 0,
  hotArchive: 1,
} as const);
export type BucketListType = xdr.Infer<typeof BucketListType>;
