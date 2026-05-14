// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { BucketMetadataExt } from "./bucket-metadata-ext.js";
export interface BucketMetadata {
  readonly ledgerVersion: number;
  readonly ext: BucketMetadataExt;
}
export const BucketMetadata = xdr.struct("BucketMetadata", {
  ledgerVersion: xdr.uint32(),
  ext: xdr.lazy(() => BucketMetadataExt),
}) as xdr.XdrType<BucketMetadata>;
