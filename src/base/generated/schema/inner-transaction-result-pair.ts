// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { InnerTransactionResult } from "./inner-transaction-result.js";
export interface InnerTransactionResultPair {
  readonly transactionHash: Hash;
  readonly result: InnerTransactionResult;
}
export const InnerTransactionResultPair = xdr.struct(
  "InnerTransactionResultPair",
  {
    transactionHash: xdr.lazy(() => Hash),
    result: xdr.lazy(() => InnerTransactionResult),
  },
) as xdr.XdrType<InnerTransactionResultPair>;
