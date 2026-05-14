// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecTypeDef } from "./stellar-contract-spec-cycle.js";
export interface SCSpecFunctionInputV0 {
  readonly doc: string;
  readonly name: string;
  readonly type: SCSpecTypeDef;
}
export const SCSpecFunctionInputV0 = xdr.struct("SCSpecFunctionInputV0", {
  doc: xdr.string(1024),
  name: xdr.string(30),
  type: xdr.lazy(() => SCSpecTypeDef),
}) as xdr.XdrType<SCSpecFunctionInputV0>;
