// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface SCSpecUDTEnumCaseV0 {
  readonly doc: string;
  readonly name: string;
  readonly value: number;
}
export const SCSpecUDTEnumCaseV0 = xdr.struct("SCSpecUDTEnumCaseV0", {
  doc: xdr.string(1024),
  name: xdr.string(60),
  value: xdr.uint32(),
}) as xdr.XdrType<SCSpecUDTEnumCaseV0>;
