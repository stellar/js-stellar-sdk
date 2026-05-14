// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ChangeTrustResultCode } from "./change-trust-result-code.js";
export type ChangeTrustResult =
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
    }
  | {
      readonly code: -4;
    }
  | {
      readonly code: -5;
    }
  | {
      readonly code: -6;
    }
  | {
      readonly code: -7;
    }
  | {
      readonly code: -8;
    };
export const ChangeTrustResult = xdr.union("ChangeTrustResult", {
  switchOn: xdr.lazy(() => ChangeTrustResultCode),
  switchKey: "code",
  cases: [
    xdr.case("changeTrustSuccess", 0, xdr.void()),
    xdr.case("changeTrustMalformed", -1, xdr.void()),
    xdr.case("changeTrustNoIssuer", -2, xdr.void()),
    xdr.case("changeTrustInvalidLimit", -3, xdr.void()),
    xdr.case("changeTrustLowReserve", -4, xdr.void()),
    xdr.case("changeTrustSelfNotAllowed", -5, xdr.void()),
    xdr.case("changeTrustTrustLineMissing", -6, xdr.void()),
    xdr.case("changeTrustCannotDelete", -7, xdr.void()),
    xdr.case("changeTrustNotAuthMaintainLiabilities", -8, xdr.void()),
  ] as const,
}) as xdr.XdrType<ChangeTrustResult>;
