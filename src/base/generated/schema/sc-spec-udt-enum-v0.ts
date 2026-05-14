// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecUDTEnumCaseV0 } from "./sc-spec-udt-enum-case-v0.js";
export interface SCSpecUDTEnumV0 {
  readonly doc: string;
  readonly lib: string;
  readonly name: string;
  readonly cases: SCSpecUDTEnumCaseV0[];
}
export const SCSpecUDTEnumV0 = xdr.struct("SCSpecUDTEnumV0", {
  doc: xdr.string(1024),
  lib: xdr.string(80),
  name: xdr.string(60),
  cases: xdr.array(
    xdr.lazy(() => SCSpecUDTEnumCaseV0),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<SCSpecUDTEnumV0>;
