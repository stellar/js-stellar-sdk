// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { SorobanResourcesExtV0 } from "./soroban-resources-ext-v0.js";
export type SorobanTransactionDataExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly resourceExt: SorobanResourcesExtV0;
    };
export const SorobanTransactionDataExt = xdr.union(
  "SorobanTransactionDataExt",
  {
    switchOn: xdr.int32(),
    switchKey: "v",
    cases: [
      xdr.case("case0", 0, xdr.void()),
      xdr.case(
        "resourceExt",
        1,
        xdr.field(
          "resourceExt",
          xdr.lazy(() => SorobanResourcesExtV0),
        ),
      ),
    ] as const,
  },
) as xdr.XdrType<SorobanTransactionDataExt>;
