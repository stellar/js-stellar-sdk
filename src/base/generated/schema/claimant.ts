// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClaimantType } from "./claimant-type.js";
import { ClaimantV0 } from "./claimant-v0.js";
export type Claimant = {
  readonly type: 0;
  readonly v0: ClaimantV0;
};
export const Claimant = xdr.union("Claimant", {
  switchOn: xdr.lazy(() => ClaimantType),
  switchKey: "type",
  cases: [
    xdr.case(
      "claimantTypeV0",
      0,
      xdr.field(
        "v0",
        xdr.lazy(() => ClaimantV0),
      ),
    ),
  ] as const,
}) as xdr.XdrType<Claimant>;
