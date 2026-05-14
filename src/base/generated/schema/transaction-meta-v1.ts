// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerEntryChanges } from "./ledger-entry-changes.js";
import { OperationMeta } from "./operation-meta.js";
export interface TransactionMetaV1 {
  readonly txChanges: LedgerEntryChanges;
  readonly operations: OperationMeta[];
}
export const TransactionMetaV1 = xdr.struct("TransactionMetaV1", {
  txChanges: xdr.lazy(() => LedgerEntryChanges),
  operations: xdr.array(
    xdr.lazy(() => OperationMeta),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<TransactionMetaV1>;
