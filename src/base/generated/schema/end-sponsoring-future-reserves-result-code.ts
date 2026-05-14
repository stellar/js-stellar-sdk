// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const EndSponsoringFutureReservesResultCode = xdr.enumType(
  "EndSponsoringFutureReservesResultCode",
  {
    endSponsoringFutureReservesSuccess: 0,
    endSponsoringFutureReservesNotSponsored: -1,
  } as const,
);
export type EndSponsoringFutureReservesResultCode = xdr.Infer<
  typeof EndSponsoringFutureReservesResultCode
>;
