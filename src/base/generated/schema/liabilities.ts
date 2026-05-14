// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface Liabilities {
  readonly buying: bigint;
  readonly selling: bigint;
}
export const Liabilities = xdr.struct("Liabilities", {
  buying: xdr.int64(),
  selling: xdr.int64(),
}) as xdr.XdrType<Liabilities>;
