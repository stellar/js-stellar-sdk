// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { LedgerEntryChanges } from "./ledger-entry-changes.js";
import { TransactionMeta } from "./transaction-meta.js";
import { TransactionResultPair } from "./transaction-result-pair.js";
export interface TransactionResultMeta {
  readonly result: TransactionResultPair;
  readonly feeProcessing: LedgerEntryChanges;
  readonly txApplyProcessing: TransactionMeta;
}
export const TransactionResultMeta = xdr.struct("TransactionResultMeta", {
  result: xdr.lazy(() => TransactionResultPair),
  feeProcessing: xdr.lazy(() => LedgerEntryChanges),
  txApplyProcessing: xdr.lazy(() => TransactionMeta),
}) as xdr.XdrType<TransactionResultMeta>;
