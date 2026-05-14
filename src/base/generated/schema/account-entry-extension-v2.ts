// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountEntryExtensionV2Ext } from "./account-entry-extension-v2-ext.js";
import { SponsorshipDescriptor } from "./sponsorship-descriptor.js";
export interface AccountEntryExtensionV2 {
  readonly numSponsored: number;
  readonly numSponsoring: number;
  readonly signerSponsoringIDs: SponsorshipDescriptor[];
  readonly ext: AccountEntryExtensionV2Ext;
}
export const AccountEntryExtensionV2 = xdr.struct("AccountEntryExtensionV2", {
  numSponsored: xdr.uint32(),
  numSponsoring: xdr.uint32(),
  signerSponsoringIDs: xdr.array(
    xdr.lazy(() => SponsorshipDescriptor),
    20,
  ),
  ext: xdr.lazy(() => AccountEntryExtensionV2Ext),
}) as xdr.XdrType<AccountEntryExtensionV2>;
