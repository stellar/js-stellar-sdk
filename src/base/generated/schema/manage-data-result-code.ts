// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ManageDataResultCode = xdr.enumType("ManageDataResultCode", {
  manageDataSuccess: 0,
  manageDataNotSupportedYet: -1,
  manageDataNameNotFound: -2,
  manageDataLowReserve: -3,
  manageDataInvalidName: -4,
} as const);
export type ManageDataResultCode = xdr.Infer<typeof ManageDataResultCode>;
