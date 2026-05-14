// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecUDTErrorEnumCaseV0 } from "./sc-spec-udt-error-enum-case-v0.js";
export interface SCSpecUDTErrorEnumV0 {
  readonly doc: string;
  readonly lib: string;
  readonly name: string;
  readonly cases: SCSpecUDTErrorEnumCaseV0[];
}
export const SCSpecUDTErrorEnumV0 = xdr.struct("SCSpecUDTErrorEnumV0", {
  doc: xdr.string(1024),
  lib: xdr.string(80),
  name: xdr.string(60),
  cases: xdr.array(
    xdr.lazy(() => SCSpecUDTErrorEnumCaseV0),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<SCSpecUDTErrorEnumV0>;
