// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountEntryExtensionV1Ext } from "./account-entry-extension-v1-ext.js";
import { Liabilities } from "./liabilities.js";
export interface AccountEntryExtensionV1 {
  readonly liabilities: Liabilities;
  readonly ext: AccountEntryExtensionV1Ext;
}
export const AccountEntryExtensionV1 = xdr.struct("AccountEntryExtensionV1", {
  liabilities: xdr.lazy(() => Liabilities),
  ext: xdr.lazy(() => AccountEntryExtensionV1Ext),
}) as xdr.XdrType<AccountEntryExtensionV1>;
