// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ContractEventType = xdr.enumType("ContractEventType", {
  system: 0,
  contract: 1,
  diagnostic: 2,
} as const);
export type ContractEventType = xdr.Infer<typeof ContractEventType>;
