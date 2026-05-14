// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TransactionResultExt } from "./transaction-result-ext.js";
import { TransactionResultResult } from "./transaction-result-result.js";
export interface TransactionResult {
  readonly feeCharged: bigint;
  readonly result: TransactionResultResult;
  readonly ext: TransactionResultExt;
}
export const TransactionResult = xdr.struct("TransactionResult", {
  feeCharged: xdr.int64(),
  result: xdr.lazy(() => TransactionResultResult),
  ext: xdr.lazy(() => TransactionResultExt),
}) as xdr.XdrType<TransactionResult>;
