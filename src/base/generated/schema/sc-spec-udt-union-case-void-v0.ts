// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export interface SCSpecUDTUnionCaseVoidV0 {
  readonly doc: string;
  readonly name: string;
}
export const SCSpecUDTUnionCaseVoidV0 = xdr.struct("SCSpecUDTUnionCaseVoidV0", {
  doc: xdr.string(1024),
  name: xdr.string(60),
}) as xdr.XdrType<SCSpecUDTUnionCaseVoidV0>;
