// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClaimableBalanceIdType } from "./claimable-balance-id-type.js";
import { Hash } from "./hash.js";
export type ClaimableBalanceId = {
  readonly type: 0;
  readonly v0: Hash;
};
export const ClaimableBalanceId = xdr.union("ClaimableBalanceID", {
  switchOn: xdr.lazy(() => ClaimableBalanceIdType),
  switchKey: "type",
  cases: [
    xdr.case(
      "claimableBalanceIdTypeV0",
      0,
      xdr.field(
        "v0",
        xdr.lazy(() => Hash),
      ),
    ),
  ] as const,
}) as xdr.XdrType<ClaimableBalanceId>;
