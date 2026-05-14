// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TransactionHistoryEntryExt } from "./transaction-history-entry-ext.js";
import { TransactionSet } from "./transaction-set.js";
export interface TransactionHistoryEntry {
  readonly ledgerSeq: number;
  readonly txSet: TransactionSet;
  readonly ext: TransactionHistoryEntryExt;
}
export const TransactionHistoryEntry = xdr.struct("TransactionHistoryEntry", {
  ledgerSeq: xdr.uint32(),
  txSet: xdr.lazy(() => TransactionSet),
  ext: xdr.lazy(() => TransactionHistoryEntryExt),
}) as xdr.XdrType<TransactionHistoryEntry>;
