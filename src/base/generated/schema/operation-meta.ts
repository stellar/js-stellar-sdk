// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerEntryChanges } from "./ledger-entry-changes.js";
export interface OperationMeta {
  readonly changes: LedgerEntryChanges;
}
export const OperationMeta = xdr.struct("OperationMeta", {
  changes: xdr.lazy(() => LedgerEntryChanges),
}) as xdr.XdrType<OperationMeta>;
