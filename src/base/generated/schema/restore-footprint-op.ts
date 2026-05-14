// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ExtensionPoint } from "./extension-point.js";
export interface RestoreFootprintOp {
  readonly ext: ExtensionPoint;
}
export const RestoreFootprintOp = xdr.struct("RestoreFootprintOp", {
  ext: xdr.lazy(() => ExtensionPoint),
}) as xdr.XdrType<RestoreFootprintOp>;
