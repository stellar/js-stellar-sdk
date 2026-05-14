// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const OperationResultCode = xdr.enumType("OperationResultCode", {
  opInner: 0,
  opBadAuth: -1,
  opNoAccount: -2,
  opNotSupported: -3,
  opTooManySubentries: -4,
  opExceededWorkLimit: -5,
  opTooManySponsoring: -6,
} as const);
export type OperationResultCode = xdr.Infer<typeof OperationResultCode>;
