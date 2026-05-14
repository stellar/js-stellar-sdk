// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { RestoreFootprintResultCode } from "./restore-footprint-result-code.js";
export type RestoreFootprintResult =
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
export const RestoreFootprintResult = xdr.union("RestoreFootprintResult", {
  switchOn: xdr.lazy(() => RestoreFootprintResultCode),
  switchKey: "code",
  cases: [
    xdr.case("restoreFootprintSuccess", 0, xdr.void()),
    xdr.case("restoreFootprintMalformed", -1, xdr.void()),
    xdr.case("restoreFootprintResourceLimitExceeded", -2, xdr.void()),
    xdr.case("restoreFootprintInsufficientRefundableFee", -3, xdr.void()),
  ] as const,
}) as xdr.XdrType<RestoreFootprintResult>;
