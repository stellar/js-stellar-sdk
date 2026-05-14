// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface SCSpecTypeUDT {
  readonly name: string;
}
export const SCSpecTypeUDT = xdr.struct("SCSpecTypeUDT", {
  name: xdr.string(60),
}) as xdr.XdrType<SCSpecTypeUDT>;
