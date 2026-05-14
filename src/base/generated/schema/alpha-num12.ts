// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { AssetCode12 } from "./asset-code12.js";
export interface AlphaNum12 {
  readonly assetCode: AssetCode12;
  readonly issuer: AccountId;
}
export const AlphaNum12 = xdr.struct("AlphaNum12", {
  assetCode: xdr.lazy(() => AssetCode12),
  issuer: xdr.lazy(() => AccountId),
}) as xdr.XdrType<AlphaNum12>;
