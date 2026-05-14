// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ContractExecutableType = xdr.enumType("ContractExecutableType", {
  contractExecutableWasm: 0,
  contractExecutableStellarAsset: 1,
} as const);
export type ContractExecutableType = xdr.Infer<typeof ContractExecutableType>;
