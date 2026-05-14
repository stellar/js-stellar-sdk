// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ExtendFootprintTTLResultCode = xdr.enumType(
  "ExtendFootprintTTLResultCode",
  {
    extendFootprintTtlSuccess: 0,
    extendFootprintTtlMalformed: -1,
    extendFootprintTtlResourceLimitExceeded: -2,
    extendFootprintTtlInsufficientRefundableFee: -3,
  } as const,
);
export type ExtendFootprintTTLResultCode = xdr.Infer<
  typeof ExtendFootprintTTLResultCode
>;
