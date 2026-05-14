// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { DiagnosticEvent } from "./diagnostic-event.js";
import { ExtensionPoint } from "./extension-point.js";
import { LedgerEntryChanges } from "./ledger-entry-changes.js";
import { OperationMetaV2 } from "./operation-meta-v2.js";
import { SorobanTransactionMetaV2 } from "./soroban-transaction-meta-v2.js";
import { TransactionEvent } from "./transaction-event.js";
export interface TransactionMetaV4 {
  readonly ext: ExtensionPoint;
  readonly txChangesBefore: LedgerEntryChanges;
  readonly operations: OperationMetaV2[];
  readonly txChangesAfter: LedgerEntryChanges;
  readonly sorobanMeta: SorobanTransactionMetaV2 | null;
  readonly events: TransactionEvent[];
  readonly diagnosticEvents: DiagnosticEvent[];
}
export const TransactionMetaV4 = xdr.struct("TransactionMetaV4", {
  ext: xdr.lazy(() => ExtensionPoint),
  txChangesBefore: xdr.lazy(() => LedgerEntryChanges),
  operations: xdr.array(
    xdr.lazy(() => OperationMetaV2),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  txChangesAfter: xdr.lazy(() => LedgerEntryChanges),
  sorobanMeta: xdr.option(xdr.lazy(() => SorobanTransactionMetaV2)),
  events: xdr.array(
    xdr.lazy(() => TransactionEvent),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  diagnosticEvents: xdr.array(
    xdr.lazy(() => DiagnosticEvent),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<TransactionMetaV4>;
