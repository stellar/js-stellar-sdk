// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface SCSpecTypeBytesN {
  readonly n: number;
}
export const SCSpecTypeBytesN = xdr.struct("SCSpecTypeBytesN", {
  n: xdr.uint32(),
}) as xdr.XdrType<SCSpecTypeBytesN>;
