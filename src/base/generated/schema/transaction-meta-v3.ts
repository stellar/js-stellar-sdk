// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ExtensionPoint } from "./extension-point.js";
import { LedgerEntryChanges } from "./ledger-entry-changes.js";
import { OperationMeta } from "./operation-meta.js";
import { SorobanTransactionMeta } from "./soroban-transaction-meta.js";
export interface TransactionMetaV3 {
  readonly ext: ExtensionPoint;
  readonly txChangesBefore: LedgerEntryChanges;
  readonly operations: OperationMeta[];
  readonly txChangesAfter: LedgerEntryChanges;
  readonly sorobanMeta: SorobanTransactionMeta | null;
}
export const TransactionMetaV3 = xdr.struct("TransactionMetaV3", {
  ext: xdr.lazy(() => ExtensionPoint),
  txChangesBefore: xdr.lazy(() => LedgerEntryChanges),
  operations: xdr.array(
    xdr.lazy(() => OperationMeta),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  txChangesAfter: xdr.lazy(() => LedgerEntryChanges),
  sorobanMeta: xdr.option(xdr.lazy(() => SorobanTransactionMeta)),
}) as xdr.XdrType<TransactionMetaV3>;
