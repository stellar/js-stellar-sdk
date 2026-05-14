// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SCSpecEntryKind } from "./sc-spec-entry-kind.js";
import { SCSpecEventV0 } from "./sc-spec-event-v0.js";
import { SCSpecFunctionV0 } from "./sc-spec-function-v0.js";
import { SCSpecUDTEnumV0 } from "./sc-spec-udt-enum-v0.js";
import { SCSpecUDTErrorEnumV0 } from "./sc-spec-udt-error-enum-v0.js";
import { SCSpecUDTStructV0 } from "./sc-spec-udt-struct-v0.js";
import { SCSpecUDTUnionV0 } from "./sc-spec-udt-union-v0.js";
export type SCSpecEntry =
  | {
      readonly kind: 0;
      readonly functionV0: SCSpecFunctionV0;
    }
  | {
      readonly kind: 1;
      readonly udtStructV0: SCSpecUDTStructV0;
    }
  | {
      readonly kind: 2;
      readonly udtUnionV0: SCSpecUDTUnionV0;
    }
  | {
      readonly kind: 3;
      readonly udtEnumV0: SCSpecUDTEnumV0;
    }
  | {
      readonly kind: 4;
      readonly udtErrorEnumV0: SCSpecUDTErrorEnumV0;
    }
  | {
      readonly kind: 5;
      readonly eventV0: SCSpecEventV0;
    };
export const SCSpecEntry = xdr.union("SCSpecEntry", {
  switchOn: xdr.lazy(() => SCSpecEntryKind),
  switchKey: "kind",
  cases: [
    xdr.case(
      "scSpecEntryFunctionV0",
      0,
      xdr.field(
        "functionV0",
        xdr.lazy(() => SCSpecFunctionV0),
      ),
    ),
    xdr.case(
      "scSpecEntryUdtStructV0",
      1,
      xdr.field(
        "udtStructV0",
        xdr.lazy(() => SCSpecUDTStructV0),
      ),
    ),
    xdr.case(
      "scSpecEntryUdtUnionV0",
      2,
      xdr.field(
        "udtUnionV0",
        xdr.lazy(() => SCSpecUDTUnionV0),
      ),
    ),
    xdr.case(
      "scSpecEntryUdtEnumV0",
      3,
      xdr.field(
        "udtEnumV0",
        xdr.lazy(() => SCSpecUDTEnumV0),
      ),
    ),
    xdr.case(
      "scSpecEntryUdtErrorEnumV0",
      4,
      xdr.field(
        "udtErrorEnumV0",
        xdr.lazy(() => SCSpecUDTErrorEnumV0),
      ),
    ),
    xdr.case(
      "scSpecEntryEventV0",
      5,
      xdr.field(
        "eventV0",
        xdr.lazy(() => SCSpecEventV0),
      ),
    ),
  ] as const,
}) as xdr.XdrType<SCSpecEntry>;
