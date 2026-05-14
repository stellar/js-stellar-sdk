// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const HotArchiveBucketEntryType = xdr.enumType(
  "HotArchiveBucketEntryType",
  {
    hotArchiveMetaentry: -1,
    hotArchiveArchived: 0,
    hotArchiveLive: 1,
  } as const,
);
export type HotArchiveBucketEntryType = xdr.Infer<
  typeof HotArchiveBucketEntryType
>;
