// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { RevokeSponsorshipResultCode } from "./revoke-sponsorship-result-code.js";
export type RevokeSponsorshipResult =
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
    };
export const RevokeSponsorshipResult = xdr.union("RevokeSponsorshipResult", {
  switchOn: xdr.lazy(() => RevokeSponsorshipResultCode),
  switchKey: "code",
  cases: [
    xdr.case("revokeSponsorshipSuccess", 0, xdr.void()),
    xdr.case("revokeSponsorshipDoesNotExist", -1, xdr.void()),
    xdr.case("revokeSponsorshipNotSponsor", -2, xdr.void()),
    xdr.case("revokeSponsorshipLowReserve", -3, xdr.void()),
    xdr.case("revokeSponsorshipOnlyTransferable", -4, xdr.void()),
    xdr.case("revokeSponsorshipMalformed", -5, xdr.void()),
  ] as const,
}) as xdr.XdrType<RevokeSponsorshipResult>;
