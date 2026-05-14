// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SorobanTransactionMetaExtV1 } from "./soroban-transaction-meta-ext-v1.js";
export type SorobanTransactionMetaExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly v1: SorobanTransactionMetaExtV1;
    };
export const SorobanTransactionMetaExt = xdr.union(
  "SorobanTransactionMetaExt",
  {
    switchOn: xdr.int32(),
    switchKey: "v",
    cases: [
      xdr.case("case0", 0, xdr.void()),
      xdr.case(
        "v1",
        1,
        xdr.field(
          "v1",
          xdr.lazy(() => SorobanTransactionMetaExtV1),
        ),
      ),
    ] as const,
  },
) as xdr.XdrType<SorobanTransactionMetaExt>;
