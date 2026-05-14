// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { TrustLineAsset } from "./trust-line-asset.js";
import { TrustLineEntryExt } from "./trust-line-entry-ext.js";
export interface TrustLineEntry {
  readonly accountId: AccountId;
  readonly asset: TrustLineAsset;
  readonly balance: bigint;
  readonly limit: bigint;
  readonly flags: number;
  readonly ext: TrustLineEntryExt;
}
export const TrustLineEntry = xdr.struct("TrustLineEntry", {
  accountId: xdr.lazy(() => AccountId),
  asset: xdr.lazy(() => TrustLineAsset),
  balance: xdr.int64(),
  limit: xdr.int64(),
  flags: xdr.uint32(),
  ext: xdr.lazy(() => TrustLineEntryExt),
}) as xdr.XdrType<TrustLineEntry>;
