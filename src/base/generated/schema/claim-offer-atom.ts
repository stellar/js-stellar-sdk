// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { Asset } from "./asset.js";
export interface ClaimOfferAtom {
  readonly sellerId: AccountId;
  readonly offerId: bigint;
  readonly assetSold: Asset;
  readonly amountSold: bigint;
  readonly assetBought: Asset;
  readonly amountBought: bigint;
}
export const ClaimOfferAtom = xdr.struct("ClaimOfferAtom", {
  sellerId: xdr.lazy(() => AccountId),
  offerId: xdr.int64(),
  assetSold: xdr.lazy(() => Asset),
  amountSold: xdr.int64(),
  assetBought: xdr.lazy(() => Asset),
  amountBought: xdr.int64(),
}) as xdr.XdrType<ClaimOfferAtom>;
