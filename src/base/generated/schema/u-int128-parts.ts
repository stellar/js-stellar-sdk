// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface UInt128Parts {
  readonly hi: bigint;
  readonly lo: bigint;
}
export const UInt128Parts = xdr.struct("UInt128Parts", {
  hi: xdr.uint64(),
  lo: xdr.uint64(),
}) as xdr.XdrType<UInt128Parts>;
