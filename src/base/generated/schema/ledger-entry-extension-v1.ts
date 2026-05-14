// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerEntryExtensionV1Ext } from "./ledger-entry-extension-v1-ext.js";
import { SponsorshipDescriptor } from "./sponsorship-descriptor.js";
export interface LedgerEntryExtensionV1 {
  readonly sponsoringId: SponsorshipDescriptor;
  readonly ext: LedgerEntryExtensionV1Ext;
}
export const LedgerEntryExtensionV1 = xdr.struct("LedgerEntryExtensionV1", {
  sponsoringId: xdr.lazy(() => SponsorshipDescriptor),
  ext: xdr.lazy(() => LedgerEntryExtensionV1Ext),
}) as xdr.XdrType<LedgerEntryExtensionV1>;
