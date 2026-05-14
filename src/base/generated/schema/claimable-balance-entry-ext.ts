// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClaimableBalanceEntryExtensionV1 } from "./claimable-balance-entry-extension-v1.js";
export type ClaimableBalanceEntryExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly v1: ClaimableBalanceEntryExtensionV1;
    };
export const ClaimableBalanceEntryExt = xdr.union("ClaimableBalanceEntryExt", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case("case0", 0, xdr.void()),
    xdr.case(
      "v1",
      1,
      xdr.field(
        "v1",
        xdr.lazy(() => ClaimableBalanceEntryExtensionV1),
      ),
    ),
  ] as const,
}) as xdr.XdrType<ClaimableBalanceEntryExt>;
