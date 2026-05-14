// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerHeaderExtensionV1Ext } from "./ledger-header-extension-v1-ext.js";
export interface LedgerHeaderExtensionV1 {
  readonly flags: number;
  readonly ext: LedgerHeaderExtensionV1Ext;
}
export const LedgerHeaderExtensionV1 = xdr.struct("LedgerHeaderExtensionV1", {
  flags: xdr.uint32(),
  ext: xdr.lazy(() => LedgerHeaderExtensionV1Ext),
}) as xdr.XdrType<LedgerHeaderExtensionV1>;
