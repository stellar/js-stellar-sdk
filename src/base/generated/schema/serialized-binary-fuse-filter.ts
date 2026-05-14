// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { BinaryFuseFilterType } from "./binary-fuse-filter-type.js";
import { ShortHashSeed } from "./short-hash-seed.js";
export interface SerializedBinaryFuseFilter {
  readonly type: BinaryFuseFilterType;
  readonly inputHashSeed: ShortHashSeed;
  readonly filterSeed: ShortHashSeed;
  readonly segmentLength: number;
  readonly segementLengthMask: number;
  readonly segmentCount: number;
  readonly segmentCountLength: number;
  readonly fingerprintLength: number;
  readonly fingerprints: Uint8Array;
}
export const SerializedBinaryFuseFilter = xdr.struct(
  "SerializedBinaryFuseFilter",
  {
    type: xdr.lazy(() => BinaryFuseFilterType),
    inputHashSeed: xdr.lazy(() => ShortHashSeed),
    filterSeed: xdr.lazy(() => ShortHashSeed),
    segmentLength: xdr.uint32(),
    segementLengthMask: xdr.uint32(),
    segmentCount: xdr.uint32(),
    segmentCountLength: xdr.uint32(),
    fingerprintLength: xdr.uint32(),
    fingerprints: xdr.varOpaque(xdr.UNBOUNDED_MAX_LENGTH),
  },
) as xdr.XdrType<SerializedBinaryFuseFilter>;
