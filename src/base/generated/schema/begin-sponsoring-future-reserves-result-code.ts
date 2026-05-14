// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const BeginSponsoringFutureReservesResultCode = xdr.enumType(
  "BeginSponsoringFutureReservesResultCode",
  {
    beginSponsoringFutureReservesSuccess: 0,
    beginSponsoringFutureReservesMalformed: -1,
    beginSponsoringFutureReservesAlreadySponsored: -2,
    beginSponsoringFutureReservesRecursive: -3,
  } as const,
);
export type BeginSponsoringFutureReservesResultCode = xdr.Infer<
  typeof BeginSponsoringFutureReservesResultCode
>;
