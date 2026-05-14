// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecUDTStructFieldV0 } from "./sc-spec-udt-struct-field-v0.js";
export interface SCSpecUDTStructV0 {
  readonly doc: string;
  readonly lib: string;
  readonly name: string;
  readonly fields: SCSpecUDTStructFieldV0[];
}
export const SCSpecUDTStructV0 = xdr.struct("SCSpecUDTStructV0", {
  doc: xdr.string(1024),
  lib: xdr.string(80),
  name: xdr.string(60),
  fields: xdr.array(
    xdr.lazy(() => SCSpecUDTStructFieldV0),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<SCSpecUDTStructV0>;
