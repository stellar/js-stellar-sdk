// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { BucketListType } from "./bucket-list-type.js";
export type BucketMetadataExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly bucketListType: BucketListType;
    };
export const BucketMetadataExt = xdr.union("BucketMetadataExt", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case("case0", 0, xdr.void()),
    xdr.case(
      "bucketListType",
      1,
      xdr.field(
        "bucketListType",
        xdr.lazy(() => BucketListType),
      ),
    ),
  ] as const,
}) as xdr.XdrType<BucketMetadataExt>;
