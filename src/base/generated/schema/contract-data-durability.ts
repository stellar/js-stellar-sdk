// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ContractDataDurability = xdr.enumType("ContractDataDurability", {
  temporary: 0,
  persistent: 1,
} as const);
export type ContractDataDurability = xdr.Infer<typeof ContractDataDurability>;
