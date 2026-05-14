// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { ContractIdPreimageFromAddress } from "./contract-id-preimage-from-address.js";
import { ContractIdPreimageType } from "./contract-id-preimage-type.js";
export type ContractIdPreimage =
  | {
      readonly type: 0;
      readonly fromAddress: ContractIdPreimageFromAddress;
    }
  | {
      readonly type: 1;
      readonly fromAsset: Asset;
    };
export const ContractIdPreimage = xdr.union("ContractIDPreimage", {
  switchOn: xdr.lazy(() => ContractIdPreimageType),
  switchKey: "type",
  cases: [
    xdr.case(
      "contractIdPreimageFromAddress",
      0,
      xdr.field(
        "fromAddress",
        xdr.lazy(() => ContractIdPreimageFromAddress),
      ),
    ),
    xdr.case(
      "contractIdPreimageFromAsset",
      1,
      xdr.field(
        "fromAsset",
        xdr.lazy(() => Asset),
      ),
    ),
  ] as const,
}) as xdr.XdrType<ContractIdPreimage>;
