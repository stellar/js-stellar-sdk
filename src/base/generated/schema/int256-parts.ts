// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface Int256Parts {
  readonly hi_hi: bigint;
  readonly hi_lo: bigint;
  readonly lo_hi: bigint;
  readonly lo_lo: bigint;
}
export const Int256Parts = xdr.struct("Int256Parts", {
  hi_hi: xdr.int64(),
  hi_lo: xdr.uint64(),
  lo_hi: xdr.uint64(),
  lo_lo: xdr.uint64(),
}) as xdr.XdrType<Int256Parts>;
