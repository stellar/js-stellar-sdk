// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const RestoreFootprintResultCode = xdr.enumType(
  "RestoreFootprintResultCode",
  {
    restoreFootprintSuccess: 0,
    restoreFootprintMalformed: -1,
    restoreFootprintResourceLimitExceeded: -2,
    restoreFootprintInsufficientRefundableFee: -3,
  } as const,
);
export type RestoreFootprintResultCode = xdr.Infer<
  typeof RestoreFootprintResultCode
>;
