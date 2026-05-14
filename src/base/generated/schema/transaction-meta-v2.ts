// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerEntryChanges } from "./ledger-entry-changes.js";
import { OperationMeta } from "./operation-meta.js";
export interface TransactionMetaV2 {
  readonly txChangesBefore: LedgerEntryChanges;
  readonly operations: OperationMeta[];
  readonly txChangesAfter: LedgerEntryChanges;
}
export const TransactionMetaV2 = xdr.struct("TransactionMetaV2", {
  txChangesBefore: xdr.lazy(() => LedgerEntryChanges),
  operations: xdr.array(
    xdr.lazy(() => OperationMeta),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  txChangesAfter: xdr.lazy(() => LedgerEntryChanges),
}) as xdr.XdrType<TransactionMetaV2>;
