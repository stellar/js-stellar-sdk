// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractCodeEntryV1 } from "./contract-code-entry-v1.js";
export type ContractCodeEntryExt =
  | {
      readonly v: 0;
    }
  | {
      readonly v: 1;
      readonly v1: ContractCodeEntryV1;
    };
export const ContractCodeEntryExt = xdr.union("ContractCodeEntryExt", {
  switchOn: xdr.int32(),
  switchKey: "v",
  cases: [
    xdr.case("case0", 0, xdr.void()),
    xdr.case(
      "v1",
      1,
      xdr.field(
        "v1",
        xdr.lazy(() => ContractCodeEntryV1),
      ),
    ),
  ] as const,
}) as xdr.XdrType<ContractCodeEntryExt>;
