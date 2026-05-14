// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ExtensionPoint } from "./extension-point.js";
import { TimePoint } from "./time-point.js";
export interface AccountEntryExtensionV3 {
  readonly ext: ExtensionPoint;
  readonly seqLedger: number;
  readonly seqTime: TimePoint;
}
export const AccountEntryExtensionV3 = xdr.struct("AccountEntryExtensionV3", {
  ext: xdr.lazy(() => ExtensionPoint),
  seqLedger: xdr.uint32(),
  seqTime: xdr.lazy(() => TimePoint),
}) as xdr.XdrType<AccountEntryExtensionV3>;
