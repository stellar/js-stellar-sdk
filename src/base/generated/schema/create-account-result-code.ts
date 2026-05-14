// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const CreateAccountResultCode = xdr.enumType("CreateAccountResultCode", {
  createAccountSuccess: 0,
  createAccountMalformed: -1,
  createAccountUnderfunded: -2,
  createAccountLowReserve: -3,
  createAccountAlreadyExist: -4,
} as const);
export type CreateAccountResultCode = xdr.Infer<typeof CreateAccountResultCode>;
