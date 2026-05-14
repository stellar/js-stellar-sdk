// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const ClaimAtomType = xdr.enumType("ClaimAtomType", {
  claimAtomTypeV0: 0,
  claimAtomTypeOrderBook: 1,
  claimAtomTypeLiquidityPool: 2,
} as const);
export type ClaimAtomType = xdr.Infer<typeof ClaimAtomType>;
