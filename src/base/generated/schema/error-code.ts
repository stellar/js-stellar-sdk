// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ErrorCode = xdr.enumType("ErrorCode", {
  errMisc: 0,
  errData: 1,
  errConf: 2,
  errAuth: 3,
  errLoad: 4,
} as const);
export type ErrorCode = xdr.Infer<typeof ErrorCode>;
