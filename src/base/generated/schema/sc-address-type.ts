// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const SCAddressType = xdr.enumType("SCAddressType", {
  scAddressTypeAccount: 0,
  scAddressTypeContract: 1,
  scAddressTypeMuxedAccount: 2,
  scAddressTypeClaimableBalance: 3,
  scAddressTypeLiquidityPool: 4,
} as const);
export type SCAddressType = xdr.Infer<typeof SCAddressType>;
