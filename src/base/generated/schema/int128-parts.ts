// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface Int128Parts {
  readonly hi: bigint;
  readonly lo: bigint;
}
export const Int128Parts = xdr.struct("Int128Parts", {
  hi: xdr.int64(),
  lo: xdr.uint64(),
}) as xdr.XdrType<Int128Parts>;
