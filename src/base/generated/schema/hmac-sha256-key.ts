// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface HmacSha256Key {
  readonly key: Uint8Array;
}
export const HmacSha256Key = xdr.struct("HmacSha256Key", {
  key: xdr.opaque(32),
}) as xdr.XdrType<HmacSha256Key>;
