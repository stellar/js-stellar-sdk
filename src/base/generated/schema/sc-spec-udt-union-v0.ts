// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecUDTUnionCaseV0 } from "./sc-spec-udt-union-case-v0.js";
export interface SCSpecUDTUnionV0 {
  readonly doc: string;
  readonly lib: string;
  readonly name: string;
  readonly cases: SCSpecUDTUnionCaseV0[];
}
export const SCSpecUDTUnionV0 = xdr.struct("SCSpecUDTUnionV0", {
  doc: xdr.string(1024),
  lib: xdr.string(80),
  name: xdr.string(60),
  cases: xdr.array(
    xdr.lazy(() => SCSpecUDTUnionCaseV0),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<SCSpecUDTUnionV0>;
