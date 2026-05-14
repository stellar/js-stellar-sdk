// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { GeneralizedTransactionSet } from "./generalized-transaction-set.js";
import { TransactionSet } from "./transaction-set.js";
export type StoredTransactionSet =
  | {
      readonly v: 0;
      readonly txSet: TransactionSet;
    }
  | {
      readonly v: 1;
      readonly generalizedTxSet: GeneralizedTransactionSet;
    };
export const StoredTransactionSet = xdr.union("StoredTransactionSet", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case(
      "txSet",
      0,
      xdr.field(
        "txSet",
        xdr.lazy(() => TransactionSet),
      ),
    ),
    xdr.case(
      "generalizedTxSet",
      1,
      xdr.field(
        "generalizedTxSet",
        xdr.lazy(() => GeneralizedTransactionSet),
      ),
    ),
  ] as const,
}) as xdr.XdrType<StoredTransactionSet>;
