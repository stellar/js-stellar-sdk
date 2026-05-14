// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface HmacSha256Mac {
  readonly mac: Uint8Array;
}
export const HmacSha256Mac = xdr.struct("HmacSha256Mac", {
  mac: xdr.opaque(32),
}) as xdr.XdrType<HmacSha256Mac>;
