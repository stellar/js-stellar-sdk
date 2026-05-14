// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecUDTUnionCaseTupleV0 } from "./sc-spec-udt-union-case-tuple-v0.js";
import { SCSpecUDTUnionCaseV0Kind } from "./sc-spec-udt-union-case-v0-kind.js";
import { SCSpecUDTUnionCaseVoidV0 } from "./sc-spec-udt-union-case-void-v0.js";
export type SCSpecUDTUnionCaseV0 =
  | {
      readonly kind: 0;
      readonly voidCase: SCSpecUDTUnionCaseVoidV0;
    }
  | {
      readonly kind: 1;
      readonly tupleCase: SCSpecUDTUnionCaseTupleV0;
    };
export const SCSpecUDTUnionCaseV0 = xdr.union("SCSpecUDTUnionCaseV0", {
  switchOn: xdr.lazy(() => SCSpecUDTUnionCaseV0Kind),
  switchKey: "kind",
  cases: [
    xdr.case(
      "scSpecUdtUnionCaseVoidV0",
      0,
      xdr.field(
        "voidCase",
        xdr.lazy(() => SCSpecUDTUnionCaseVoidV0),
      ),
    ),
    xdr.case(
      "scSpecUdtUnionCaseTupleV0",
      1,
      xdr.field(
        "tupleCase",
        xdr.lazy(() => SCSpecUDTUnionCaseTupleV0),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SCSpecUDTUnionCaseV0>;
