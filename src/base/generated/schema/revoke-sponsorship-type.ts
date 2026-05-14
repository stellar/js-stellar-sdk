// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const RevokeSponsorshipType = xdr.enumType("RevokeSponsorshipType", {
  revokeSponsorshipLedgerEntry: 0,
  revokeSponsorshipSigner: 1,
} as const);
export type RevokeSponsorshipType = xdr.Infer<typeof RevokeSponsorshipType>;
