// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { AssetCode4 } from "./asset-code4.js";
export interface AlphaNum4 {
  readonly assetCode: AssetCode4;
  readonly issuer: AccountId;
}
export const AlphaNum4 = xdr.struct("AlphaNum4", {
  assetCode: xdr.lazy(() => AssetCode4),
  issuer: xdr.lazy(() => AccountId),
}) as xdr.XdrType<AlphaNum4>;
