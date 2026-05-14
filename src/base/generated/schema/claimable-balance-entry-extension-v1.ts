// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClaimableBalanceEntryExtensionV1Ext } from "./claimable-balance-entry-extension-v1-ext.js";
export interface ClaimableBalanceEntryExtensionV1 {
  readonly ext: ClaimableBalanceEntryExtensionV1Ext;
  readonly flags: number;
}
export const ClaimableBalanceEntryExtensionV1 = xdr.struct(
  "ClaimableBalanceEntryExtensionV1",
  {
    ext: xdr.lazy(() => ClaimableBalanceEntryExtensionV1Ext),
    flags: xdr.uint32(),
  },
) as xdr.XdrType<ClaimableBalanceEntryExtensionV1>;
