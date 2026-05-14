// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const SCErrorCode = xdr.enumType("SCErrorCode", {
  scecArithDomain: 0,
  scecIndexBounds: 1,
  scecInvalidInput: 2,
  scecMissingValue: 3,
  scecExistingValue: 4,
  scecExceededLimit: 5,
  scecInvalidAction: 6,
  scecInternalError: 7,
  scecUnexpectedType: 8,
  scecUnexpectedSize: 9,
} as const);
export type SCErrorCode = xdr.Infer<typeof SCErrorCode>;
