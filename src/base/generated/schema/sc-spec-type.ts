// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const SCSpecType = xdr.enumType("SCSpecType", {
  scSpecTypeVal: 0,
  scSpecTypeBool: 1,
  scSpecTypeVoid: 2,
  scSpecTypeError: 3,
  scSpecTypeU32: 4,
  scSpecTypeI32: 5,
  scSpecTypeU64: 6,
  scSpecTypeI64: 7,
  scSpecTypeTimepoint: 8,
  scSpecTypeDuration: 9,
  scSpecTypeU128: 10,
  scSpecTypeI128: 11,
  scSpecTypeU256: 12,
  scSpecTypeI256: 13,
  scSpecTypeBytes: 14,
  scSpecTypeString: 16,
  scSpecTypeSymbol: 17,
  scSpecTypeAddress: 19,
  scSpecTypeMuxedAddress: 20,
  scSpecTypeOption: 1000,
  scSpecTypeResult: 1001,
  scSpecTypeVec: 1002,
  scSpecTypeMap: 1004,
  scSpecTypeTuple: 1005,
  scSpecTypeBytesN: 1006,
  scSpecTypeUdt: 2000,
} as const);
export type SCSpecType = xdr.Infer<typeof SCSpecType>;
