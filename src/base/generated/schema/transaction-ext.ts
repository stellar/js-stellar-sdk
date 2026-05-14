// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SorobanTransactionData } from "./soroban-transaction-data.js";
export type TransactionExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly sorobanData: SorobanTransactionData;
    };
export const TransactionExt = xdr.union("TransactionExt", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case("case0", 0, xdr.void()),
    xdr.case(
      "sorobanData",
      1,
      xdr.field(
        "sorobanData",
        xdr.lazy(() => SorobanTransactionData),
      ),
    ),
  ] as const,
}) as xdr.XdrType<TransactionExt>;
