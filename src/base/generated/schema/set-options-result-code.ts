// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const SetOptionsResultCode = xdr.enumType("SetOptionsResultCode", {
  setOptionsSuccess: 0,
  setOptionsLowReserve: -1,
  setOptionsTooManySigners: -2,
  setOptionsBadFlags: -3,
  setOptionsInvalidInflation: -4,
  setOptionsCantChange: -5,
  setOptionsUnknownFlag: -6,
  setOptionsThresholdOutOfRange: -7,
  setOptionsBadSigner: -8,
  setOptionsInvalidHomeDomain: -9,
  setOptionsAuthRevocableRequired: -10,
} as const);
export type SetOptionsResultCode = xdr.Infer<typeof SetOptionsResultCode>;
