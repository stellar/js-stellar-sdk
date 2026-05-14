// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClawbackResultCode } from "./clawback-result-code.js";
export type ClawbackResult =
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
    };
export const ClawbackResult = xdr.union("ClawbackResult", {
  switchOn: xdr.lazy(() => ClawbackResultCode),
  switchKey: "code",
  cases: [
    xdr.case("clawbackSuccess", 0, xdr.void()),
    xdr.case("clawbackMalformed", -1, xdr.void()),
    xdr.case("clawbackNotClawbackEnabled", -2, xdr.void()),
    xdr.case("clawbackNoTrust", -3, xdr.void()),
    xdr.case("clawbackUnderfunded", -4, xdr.void()),
  ] as const,
}) as xdr.XdrType<ClawbackResult>;
