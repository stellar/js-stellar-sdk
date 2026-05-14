// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TransactionResultPair } from "./transaction-result-pair.js";
export interface TransactionResultSet {
  readonly results: TransactionResultPair[];
}
export const TransactionResultSet = xdr.struct("TransactionResultSet", {
  results: xdr.array(
    xdr.lazy(() => TransactionResultPair),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
}) as xdr.XdrType<TransactionResultSet>;
