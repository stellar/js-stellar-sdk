// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface ShortHashSeed {
  readonly seed: Uint8Array;
}
export const ShortHashSeed = xdr.struct("ShortHashSeed", {
  seed: xdr.opaque(16),
}) as xdr.XdrType<ShortHashSeed>;
