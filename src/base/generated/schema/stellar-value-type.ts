// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const StellarValueType = xdr.enumType("StellarValueType", {
  stellarValueBasic: 0,
  stellarValueSigned: 1,
} as const);
export type StellarValueType = xdr.Infer<typeof StellarValueType>;
