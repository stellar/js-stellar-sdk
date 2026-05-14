// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ContractIdPreimageType = xdr.enumType("ContractIDPreimageType", {
  contractIdPreimageFromAddress: 0,
  contractIdPreimageFromAsset: 1,
} as const);
export type ContractIdPreimageType = xdr.Infer<typeof ContractIdPreimageType>;
