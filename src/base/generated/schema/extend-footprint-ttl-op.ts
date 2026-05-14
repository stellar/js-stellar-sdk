// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ExtensionPoint } from "./extension-point.js";
export interface ExtendFootprintTTLOp {
  readonly ext: ExtensionPoint;
  readonly extendTo: number;
}
export const ExtendFootprintTTLOp = xdr.struct("ExtendFootprintTTLOp", {
  ext: xdr.lazy(() => ExtensionPoint),
  extendTo: xdr.uint32(),
}) as xdr.XdrType<ExtendFootprintTTLOp>;
