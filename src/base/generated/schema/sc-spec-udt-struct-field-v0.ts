// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecTypeDef } from "./stellar-contract-spec-cycle.js";
export interface SCSpecUDTStructFieldV0 {
  readonly doc: string;
  readonly name: string;
  readonly type: SCSpecTypeDef;
}
export const SCSpecUDTStructFieldV0 = xdr.struct("SCSpecUDTStructFieldV0", {
  doc: xdr.string(1024),
  name: xdr.string(30),
  type: xdr.lazy(() => SCSpecTypeDef),
}) as xdr.XdrType<SCSpecUDTStructFieldV0>;
