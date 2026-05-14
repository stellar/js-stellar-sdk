// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecFunctionInputV0 } from "./sc-spec-function-input-v0.js";
import { SCSymbol } from "./sc-symbol.js";
import { SCSpecTypeDef } from "./stellar-contract-spec-cycle.js";
export interface SCSpecFunctionV0 {
  readonly doc: string;
  readonly name: SCSymbol;
  readonly inputs: SCSpecFunctionInputV0[];
  readonly outputs: SCSpecTypeDef[];
}
export const SCSpecFunctionV0 = xdr.struct("SCSpecFunctionV0", {
  doc: xdr.string(1024),
  name: xdr.lazy(() => SCSymbol),
  inputs: xdr.array(
    xdr.lazy(() => SCSpecFunctionInputV0),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  outputs: xdr.array(
    xdr.lazy(() => SCSpecTypeDef),
    1,
  ),
}) as xdr.XdrType<SCSpecFunctionV0>;
