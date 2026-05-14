// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
export interface LedgerKeyTtl {
  readonly keyHash: Hash;
}
export const LedgerKeyTtl = xdr.struct("LedgerKeyTtl", {
  keyHash: xdr.lazy(() => Hash),
}) as xdr.XdrType<LedgerKeyTtl>;
