// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecTypeDef } from "./stellar-contract-spec-cycle.js";
export interface SCSpecUDTUnionCaseTupleV0 {
  readonly doc: string;
  readonly name: string;
  readonly type: SCSpecTypeDef[];
}
export const SCSpecUDTUnionCaseTupleV0 = xdr.struct(
  "SCSpecUDTUnionCaseTupleV0",
  {
    doc: xdr.string(1024),
    name: xdr.string(60),
    type: xdr.array(
      xdr.lazy(() => SCSpecTypeDef),
      xdr.UNBOUNDED_MAX_LENGTH,
    ),
  },
) as xdr.XdrType<SCSpecUDTUnionCaseTupleV0>;
