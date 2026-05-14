// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const SCValType = xdr.enumType("SCValType", {
  scvBool: 0,
  scvVoid: 1,
  scvError: 2,
  scvU32: 3,
  scvI32: 4,
  scvU64: 5,
  scvI64: 6,
  scvTimepoint: 7,
  scvDuration: 8,
  scvU128: 9,
  scvI128: 10,
  scvU256: 11,
  scvI256: 12,
  scvBytes: 13,
  scvString: 14,
  scvSymbol: 15,
  scvVec: 16,
  scvMap: 17,
  scvAddress: 18,
  scvContractInstance: 19,
  scvLedgerKeyContractInstance: 20,
  scvLedgerKeyNonce: 21,
} as const);
export type SCValType = xdr.Infer<typeof SCValType>;
