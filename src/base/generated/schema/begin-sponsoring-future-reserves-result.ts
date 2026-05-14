// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { BeginSponsoringFutureReservesResultCode } from "./begin-sponsoring-future-reserves-result-code.js";
export type BeginSponsoringFutureReservesResult =
  | {
      readonly code: 0;
    }
  | {
      readonly code: -1;
    }
  | {
      readonly code: -2;
    }
  | {
      readonly code: -3;
    };
export const BeginSponsoringFutureReservesResult = xdr.union(
  "BeginSponsoringFutureReservesResult",
  {
    switchOn: xdr.lazy(() => BeginSponsoringFutureReservesResultCode),
    switchKey: "code",
    cases: [
      xdr.case("beginSponsoringFutureReservesSuccess", 0, xdr.void()),
      xdr.case("beginSponsoringFutureReservesMalformed", -1, xdr.void()),
      xdr.case("beginSponsoringFutureReservesAlreadySponsored", -2, xdr.void()),
      xdr.case("beginSponsoringFutureReservesRecursive", -3, xdr.void()),
    ] as const,
  },
) as xdr.XdrType<BeginSponsoringFutureReservesResult>;
