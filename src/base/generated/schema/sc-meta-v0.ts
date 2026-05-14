// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface SCMetaV0 {
  readonly key: string;
  readonly val: string;
}
export const SCMetaV0 = xdr.struct("SCMetaV0", {
  key: xdr.string(xdr.UNBOUNDED_MAX_LENGTH),
  val: xdr.string(xdr.UNBOUNDED_MAX_LENGTH),
}) as xdr.XdrType<SCMetaV0>;
