// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ChangeTrustAsset } from "./change-trust-asset.js";
export interface ChangeTrustOp {
  readonly line: ChangeTrustAsset;
  readonly limit: bigint;
}
export const ChangeTrustOp = xdr.struct("ChangeTrustOp", {
  line: xdr.lazy(() => ChangeTrustAsset),
  limit: xdr.int64(),
}) as xdr.XdrType<ChangeTrustOp>;
