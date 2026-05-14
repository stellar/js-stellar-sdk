// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface LedgerBounds {
  readonly minLedger: number;
  readonly maxLedger: number;
}
export const LedgerBounds = xdr.struct("LedgerBounds", {
  minLedger: xdr.uint32(),
  maxLedger: xdr.uint32(),
}) as xdr.XdrType<LedgerBounds>;
