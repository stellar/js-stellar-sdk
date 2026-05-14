// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AllowTrustResultCode } from "./allow-trust-result-code.js";
export type AllowTrustResult =
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
    };
export const AllowTrustResult = xdr.union("AllowTrustResult", {
  switchOn: xdr.lazy(() => AllowTrustResultCode),
  switchKey: "code",
  cases: [
    xdr.case("allowTrustSuccess", 0, xdr.void()),
    xdr.case("allowTrustMalformed", -1, xdr.void()),
    xdr.case("allowTrustNoTrustLine", -2, xdr.void()),
    xdr.case("allowTrustTrustNotRequired", -3, xdr.void()),
    xdr.case("allowTrustCantRevoke", -4, xdr.void()),
    xdr.case("allowTrustSelfNotAllowed", -5, xdr.void()),
    xdr.case("allowTrustLowReserve", -6, xdr.void()),
  ] as const,
}) as xdr.XdrType<AllowTrustResult>;
