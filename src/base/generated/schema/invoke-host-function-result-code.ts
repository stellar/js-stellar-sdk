// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const InvokeHostFunctionResultCode = xdr.enumType(
  "InvokeHostFunctionResultCode",
  {
    invokeHostFunctionSuccess: 0,
    invokeHostFunctionMalformed: -1,
    invokeHostFunctionTrapped: -2,
    invokeHostFunctionResourceLimitExceeded: -3,
    invokeHostFunctionEntryArchived: -4,
    invokeHostFunctionInsufficientRefundableFee: -5,
  } as const,
);
export type InvokeHostFunctionResultCode = xdr.Infer<
  typeof InvokeHostFunctionResultCode
>;
