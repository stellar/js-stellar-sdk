// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface Auth {
  readonly flags: number;
}
export const Auth = xdr.struct("Auth", {
  flags: xdr.int32(),
}) as xdr.XdrType<Auth>;
