// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const SCErrorType = xdr.enumType("SCErrorType", {
  sceContract: 0,
  sceWasmVm: 1,
  sceContext: 2,
  sceStorage: 3,
  sceObject: 4,
  sceCrypto: 5,
  sceEvents: 6,
  sceBudget: 7,
  sceValue: 8,
  sceAuth: 9,
} as const);
export type SCErrorType = xdr.Infer<typeof SCErrorType>;
