// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ExtendFootprintTTLResultCode } from "./extend-footprint-ttl-result-code.js";
export type ExtendFootprintTTLResult =
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
export const ExtendFootprintTTLResult = xdr.union("ExtendFootprintTTLResult", {
  switchOn: xdr.lazy(() => ExtendFootprintTTLResultCode),
  switchKey: "code",
  cases: [
    xdr.case("extendFootprintTtlSuccess", 0, xdr.void()),
    xdr.case("extendFootprintTtlMalformed", -1, xdr.void()),
    xdr.case("extendFootprintTtlResourceLimitExceeded", -2, xdr.void()),
    xdr.case("extendFootprintTtlInsufficientRefundableFee", -3, xdr.void()),
  ] as const,
}) as xdr.XdrType<ExtendFootprintTTLResult>;
