// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ContractExecutableType } from "./contract-executable-type.js";
import { Hash } from "./hash.js";
export type ContractExecutable =
  | {
      readonly type: 0;
      readonly wasm_hash: Hash;
    }
  | {
      readonly type: 1;
    };
export const ContractExecutable = xdr.union("ContractExecutable", {
  switchOn: xdr.lazy(() => ContractExecutableType),
  switchKey: "type",
  cases: [
    xdr.case(
      "contractExecutableWasm",
      0,
      xdr.field(
        "wasm_hash",
        xdr.lazy(() => Hash),
      ),
    ),
    xdr.case("contractExecutableStellarAsset", 1, xdr.void()),
  ] as const,
}) as xdr.XdrType<ContractExecutable>;
