// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export type ClaimableBalanceEntryExtensionV1Ext = {
  readonly v: 0;
};
export const ClaimableBalanceEntryExtensionV1Ext = xdr.union(
  "ClaimableBalanceEntryExtensionV1Ext",
  {
    switchOn: xdr.int32(),
    switchKey: "v",
    cases: [xdr.case("case0", 0, xdr.void())] as const,
  },
) as xdr.XdrType<ClaimableBalanceEntryExtensionV1Ext>;
