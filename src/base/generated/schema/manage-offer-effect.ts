// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ManageOfferEffect = xdr.enumType("ManageOfferEffect", {
  manageOfferCreated: 0,
  manageOfferUpdated: 1,
  manageOfferDeleted: 2,
} as const);
export type ManageOfferEffect = xdr.Infer<typeof ManageOfferEffect>;
