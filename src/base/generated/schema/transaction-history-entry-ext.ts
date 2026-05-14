// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { GeneralizedTransactionSet } from "./generalized-transaction-set.js";
export type TransactionHistoryEntryExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly generalizedTxSet: GeneralizedTransactionSet;
    };
export const TransactionHistoryEntryExt = xdr.union(
  "TransactionHistoryEntryExt",
  {
    switchOn: xdr.int32(),
    switchKey: "v",
    cases: [
      xdr.case("case0", 0, xdr.void()),
      xdr.case(
        "generalizedTxSet",
        1,
        xdr.field(
          "generalizedTxSet",
          xdr.lazy(() => GeneralizedTransactionSet),
        ),
      ),
    ] as const,
  },
) as xdr.XdrType<TransactionHistoryEntryExt>;
