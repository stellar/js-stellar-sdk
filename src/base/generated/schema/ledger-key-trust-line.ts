// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { TrustLineAsset } from "./trust-line-asset.js";
export interface LedgerKeyTrustLine {
  readonly accountId: AccountId;
  readonly asset: TrustLineAsset;
}
export const LedgerKeyTrustLine = xdr.struct("LedgerKeyTrustLine", {
  accountId: xdr.lazy(() => AccountId),
  asset: xdr.lazy(() => TrustLineAsset),
}) as xdr.XdrType<LedgerKeyTrustLine>;
