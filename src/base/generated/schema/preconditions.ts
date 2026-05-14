// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { PreconditionType } from "./precondition-type.js";
import { PreconditionsV2 } from "./preconditions-v2.js";
import { TimeBounds } from "./time-bounds.js";
export type Preconditions =
  | {
      readonly type: 0;
    }
  | {
      readonly type: 1;
      readonly timeBounds: TimeBounds;
    }
  | {
      readonly type: 2;
      readonly v2: PreconditionsV2;
    };
export const Preconditions = xdr.union("Preconditions", {
  switchOn: xdr.lazy(() => PreconditionType),
  switchKey: "type",
  cases: [
    xdr.case("precondNone", 0, xdr.void()),
    xdr.case(
      "precondTime",
      1,
      xdr.field(
        "timeBounds",
        xdr.lazy(() => TimeBounds),
      ),
    ),
    xdr.case(
      "precondV2",
      2,
      xdr.field(
        "v2",
        xdr.lazy(() => PreconditionsV2),
      ),
    ),
  ] as const,
}) as xdr.XdrType<Preconditions>;
