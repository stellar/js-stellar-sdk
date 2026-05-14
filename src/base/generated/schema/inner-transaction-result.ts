// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { InnerTransactionResultExt } from "./inner-transaction-result-ext.js";
import { InnerTransactionResultResult } from "./inner-transaction-result-result.js";
export interface InnerTransactionResult {
  readonly feeCharged: bigint;
  readonly result: InnerTransactionResultResult;
  readonly ext: InnerTransactionResultExt;
}
export const InnerTransactionResult = xdr.struct("InnerTransactionResult", {
  feeCharged: xdr.int64(),
  result: xdr.lazy(() => InnerTransactionResultResult),
  ext: xdr.lazy(() => InnerTransactionResultExt),
}) as xdr.XdrType<InnerTransactionResult>;
