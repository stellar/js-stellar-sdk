// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Liabilities } from "./liabilities.js";
import { TrustLineEntryV1Ext } from "./trust-line-entry-v1-ext.js";
export interface TrustLineEntryV1 {
  readonly liabilities: Liabilities;
  readonly ext: TrustLineEntryV1Ext;
}
export const TrustLineEntryV1 = xdr.struct("TrustLineEntryV1", {
  liabilities: xdr.lazy(() => Liabilities),
  ext: xdr.lazy(() => TrustLineEntryV1Ext),
}) as xdr.XdrType<TrustLineEntryV1>;
