// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const SCSpecEventDataFormat = xdr.enumType("SCSpecEventDataFormat", {
  scSpecEventDataFormatSingleValue: 0,
  scSpecEventDataFormatVec: 1,
  scSpecEventDataFormatMap: 2,
} as const);
export type SCSpecEventDataFormat = xdr.Infer<typeof SCSpecEventDataFormat>;
