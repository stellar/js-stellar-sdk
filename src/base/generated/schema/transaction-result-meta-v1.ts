// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ExtensionPoint } from "./extension-point.js";
import { LedgerEntryChanges } from "./ledger-entry-changes.js";
import { TransactionMeta } from "./transaction-meta.js";
import { TransactionResultPair } from "./transaction-result-pair.js";
export interface TransactionResultMetaV1 {
  readonly ext: ExtensionPoint;
  readonly result: TransactionResultPair;
  readonly feeProcessing: LedgerEntryChanges;
  readonly txApplyProcessing: TransactionMeta;
  readonly postTxApplyFeeProcessing: LedgerEntryChanges;
}
export const TransactionResultMetaV1 = xdr.struct("TransactionResultMetaV1", {
  ext: xdr.lazy(() => ExtensionPoint),
  result: xdr.lazy(() => TransactionResultPair),
  feeProcessing: xdr.lazy(() => LedgerEntryChanges),
  txApplyProcessing: xdr.lazy(() => TransactionMeta),
  postTxApplyFeeProcessing: xdr.lazy(() => LedgerEntryChanges),
}) as xdr.XdrType<TransactionResultMetaV1>;
