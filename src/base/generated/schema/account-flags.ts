// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const AccountFlags = xdr.enumType("AccountFlags", {
  authRequiredFlag: 1,
  authRevocableFlag: 2,
  authImmutableFlag: 4,
  authClawbackEnabledFlag: 8,
} as const);
export type AccountFlags = xdr.Infer<typeof AccountFlags>;
