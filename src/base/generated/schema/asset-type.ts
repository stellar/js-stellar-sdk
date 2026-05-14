// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
export const AssetType = xdr.enumType("AssetType", {
  assetTypeNative: 0,
  assetTypeCreditAlphanum4: 1,
  assetTypeCreditAlphanum12: 2,
  assetTypePoolShare: 3,
} as const);
export type AssetType = xdr.Infer<typeof AssetType>;
