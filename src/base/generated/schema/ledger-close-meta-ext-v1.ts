// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ExtensionPoint } from "./extension-point.js";
export interface LedgerCloseMetaExtV1 {
  readonly ext: ExtensionPoint;
  readonly sorobanFeeWrite1KB: bigint;
}
export const LedgerCloseMetaExtV1 = xdr.struct("LedgerCloseMetaExtV1", {
  ext: xdr.lazy(() => ExtensionPoint),
  sorobanFeeWrite1KB: xdr.int64(),
}) as xdr.XdrType<LedgerCloseMetaExtV1>;
