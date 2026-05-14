// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface Price {
  readonly n: number;
  readonly d: number;
}
export const Price = xdr.struct("Price", {
  n: xdr.int32(),
  d: xdr.int32(),
}) as xdr.XdrType<Price>;
