// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const SorobanCredentialsType = xdr.enumType("SorobanCredentialsType", {
  sorobanCredentialsSourceAccount: 0,
  sorobanCredentialsAddress: 1,
} as const);
export type SorobanCredentialsType = xdr.Infer<typeof SorobanCredentialsType>;
