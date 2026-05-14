// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Hash } from "./hash.js";
import { InvokeHostFunctionResultCode } from "./invoke-host-function-result-code.js";
export type InvokeHostFunctionResult =
  | {
      readonly code: 0;
      readonly success: Hash;
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
export const InvokeHostFunctionResult = xdr.union("InvokeHostFunctionResult", {
  switchOn: xdr.lazy(() => InvokeHostFunctionResultCode),
  switchKey: "code",
  cases: [
    xdr.case(
      "invokeHostFunctionSuccess",
      0,
      xdr.field(
        "success",
        xdr.lazy(() => Hash),
      ),
    ),
    xdr.case("invokeHostFunctionMalformed", -1, xdr.void()),
    xdr.case("invokeHostFunctionTrapped", -2, xdr.void()),
    xdr.case("invokeHostFunctionResourceLimitExceeded", -3, xdr.void()),
    xdr.case("invokeHostFunctionEntryArchived", -4, xdr.void()),
    xdr.case("invokeHostFunctionInsufficientRefundableFee", -5, xdr.void()),
  ] as const,
}) as xdr.XdrType<InvokeHostFunctionResult>;
