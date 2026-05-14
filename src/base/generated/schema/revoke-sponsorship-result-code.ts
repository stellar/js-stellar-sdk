// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const RevokeSponsorshipResultCode = xdr.enumType(
  "RevokeSponsorshipResultCode",
  {
    revokeSponsorshipSuccess: 0,
    revokeSponsorshipDoesNotExist: -1,
    revokeSponsorshipNotSponsor: -2,
    revokeSponsorshipLowReserve: -3,
    revokeSponsorshipOnlyTransferable: -4,
    revokeSponsorshipMalformed: -5,
  } as const,
);
export type RevokeSponsorshipResultCode = xdr.Infer<
  typeof RevokeSponsorshipResultCode
>;
