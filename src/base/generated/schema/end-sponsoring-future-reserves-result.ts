// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { EndSponsoringFutureReservesResultCode } from "./end-sponsoring-future-reserves-result-code.js";
export type EndSponsoringFutureReservesResult =
  | {
      readonly code: 0;
    }
  | {
      readonly code: -1;
    };
export const EndSponsoringFutureReservesResult = xdr.union(
  "EndSponsoringFutureReservesResult",
  {
    switchOn: xdr.lazy(() => EndSponsoringFutureReservesResultCode),
    switchKey: "code",
    cases: [
      xdr.case("endSponsoringFutureReservesSuccess", 0, xdr.void()),
      xdr.case("endSponsoringFutureReservesNotSponsored", -1, xdr.void()),
    ] as const,
  },
) as xdr.XdrType<EndSponsoringFutureReservesResult>;
