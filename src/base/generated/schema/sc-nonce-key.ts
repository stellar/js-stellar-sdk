// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface SCNonceKey {
  readonly nonce: bigint;
}
export const SCNonceKey = xdr.struct("SCNonceKey", {
  nonce: xdr.int64(),
}) as xdr.XdrType<SCNonceKey>;
