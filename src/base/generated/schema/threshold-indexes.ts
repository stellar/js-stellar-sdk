// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ThresholdIndexes = xdr.enumType("ThresholdIndexes", {
  thresholdMasterWeight: 0,
  thresholdLow: 1,
  thresholdMed: 2,
  thresholdHigh: 3,
} as const);
export type ThresholdIndexes = xdr.Infer<typeof ThresholdIndexes>;
