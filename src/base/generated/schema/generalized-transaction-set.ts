// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { TransactionSetV1 } from "./transaction-set-v1.js";
export type GeneralizedTransactionSet = {
  readonly v: 1;
  readonly v1TxSet: TransactionSetV1;
};
export const GeneralizedTransactionSet = xdr.union(
  "GeneralizedTransactionSet",
  {
    switchOn: xdr.int32(),
    switchKey: "v",
    cases: [
      xdr.case(
        "v1TxSet",
        1,
        xdr.field(
          "v1TxSet",
          xdr.lazy(() => TransactionSetV1),
        ),
      ),
    ] as const,
  },
) as xdr.XdrType<GeneralizedTransactionSet>;
