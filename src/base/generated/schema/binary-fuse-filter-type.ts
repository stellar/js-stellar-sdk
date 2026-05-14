// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const BinaryFuseFilterType = xdr.enumType("BinaryFuseFilterType", {
  binaryFuseFilter8Bit: 0,
  binaryFuseFilter16Bit: 1,
  binaryFuseFilter32Bit: 2,
} as const);
export type BinaryFuseFilterType = xdr.Infer<typeof BinaryFuseFilterType>;
