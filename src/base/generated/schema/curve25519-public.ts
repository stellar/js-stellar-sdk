// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface Curve25519Public {
  readonly key: Uint8Array;
}
export const Curve25519Public = xdr.struct("Curve25519Public", {
  key: xdr.opaque(32),
}) as xdr.XdrType<Curve25519Public>;
