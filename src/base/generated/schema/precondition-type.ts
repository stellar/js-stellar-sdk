// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const PreconditionType = xdr.enumType("PreconditionType", {
  precondNone: 0,
  precondTime: 1,
  precondV2: 2,
} as const);
export type PreconditionType = xdr.Infer<typeof PreconditionType>;
