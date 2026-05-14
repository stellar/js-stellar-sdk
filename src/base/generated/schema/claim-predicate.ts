// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClaimPredicateType } from "./claim-predicate-type.js";
export type ClaimPredicate =
  | {
      readonly type: 0;
    }
  | {
      readonly type: 1;
      readonly andPredicates: ClaimPredicate[];
    }
  | {
      readonly type: 2;
      readonly orPredicates: ClaimPredicate[];
    }
  | {
      readonly type: 3;
      readonly notPredicate: ClaimPredicate | null;
    }
  | {
      readonly type: 4;
      readonly absBefore: bigint;
    }
  | {
      readonly type: 5;
      readonly relBefore: bigint;
    };
export const ClaimPredicate = xdr.union("ClaimPredicate", {
  switchOn: xdr.lazy(() => ClaimPredicateType),
  switchKey: "type",
  cases: [
    xdr.case("claimPredicateUnconditional", 0, xdr.void()),
    xdr.case(
      "claimPredicateAnd",
      1,
      xdr.field(
        "andPredicates",
        xdr.array(
          xdr.lazy(() => ClaimPredicate),
          2,
        ),
      ),
    ),
    xdr.case(
      "claimPredicateOr",
      2,
      xdr.field(
        "orPredicates",
        xdr.array(
          xdr.lazy(() => ClaimPredicate),
          2,
        ),
      ),
    ),
    xdr.case(
      "claimPredicateNot",
      3,
      xdr.field("notPredicate", xdr.option(xdr.lazy(() => ClaimPredicate))),
    ),
    xdr.case(
      "claimPredicateBeforeAbsoluteTime",
      4,
      xdr.field("absBefore", xdr.int64()),
    ),
    xdr.case(
      "claimPredicateBeforeRelativeTime",
      5,
      xdr.field("relBefore", xdr.int64()),
    ),
  ] as const,
}) as xdr.XdrType<ClaimPredicate>;
