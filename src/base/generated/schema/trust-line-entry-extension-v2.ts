// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TrustLineEntryExtensionV2Ext } from "./trust-line-entry-extension-v2-ext.js";
export interface TrustLineEntryExtensionV2 {
  readonly liquidityPoolUseCount: number;
  readonly ext: TrustLineEntryExtensionV2Ext;
}
export const TrustLineEntryExtensionV2 = xdr.struct(
  "TrustLineEntryExtensionV2",
  {
    liquidityPoolUseCount: xdr.int32(),
    ext: xdr.lazy(() => TrustLineEntryExtensionV2Ext),
  },
) as xdr.XdrType<TrustLineEntryExtensionV2>;
