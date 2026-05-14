// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { TransactionResult } from "./transaction-result.js";
export interface TransactionResultPair {
  readonly transactionHash: Hash;
  readonly result: TransactionResult;
}
export const TransactionResultPair = xdr.struct("TransactionResultPair", {
  transactionHash: xdr.lazy(() => Hash),
  result: xdr.lazy(() => TransactionResult),
}) as xdr.XdrType<TransactionResultPair>;
