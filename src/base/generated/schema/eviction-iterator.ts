// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface EvictionIterator {
  readonly bucketListLevel: number;
  readonly isCurrBucket: boolean;
  readonly bucketFileOffset: bigint;
}
export const EvictionIterator = xdr.struct("EvictionIterator", {
  bucketListLevel: xdr.uint32(),
  isCurrBucket: xdr.bool(),
  bucketFileOffset: xdr.uint64(),
}) as xdr.XdrType<EvictionIterator>;
