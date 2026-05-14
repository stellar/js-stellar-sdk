// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TransactionHistoryResultEntryExt } from "./transaction-history-result-entry-ext.js";
import { TransactionResultSet } from "./transaction-result-set.js";
export interface TransactionHistoryResultEntry {
  readonly ledgerSeq: number;
  readonly txResultSet: TransactionResultSet;
  readonly ext: TransactionHistoryResultEntryExt;
}
export const TransactionHistoryResultEntry = xdr.struct(
  "TransactionHistoryResultEntry",
  {
    ledgerSeq: xdr.uint32(),
    txResultSet: xdr.lazy(() => TransactionResultSet),
    ext: xdr.lazy(() => TransactionHistoryResultEntryExt),
  },
) as xdr.XdrType<TransactionHistoryResultEntry>;
