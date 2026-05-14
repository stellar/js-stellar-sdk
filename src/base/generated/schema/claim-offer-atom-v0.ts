// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { uint256 } from "./uint256.js";
export interface ClaimOfferAtomV0 {
  readonly sellerEd25519: uint256;
  readonly offerId: bigint;
  readonly assetSold: Asset;
  readonly amountSold: bigint;
  readonly assetBought: Asset;
  readonly amountBought: bigint;
}
export const ClaimOfferAtomV0 = xdr.struct("ClaimOfferAtomV0", {
  sellerEd25519: xdr.lazy(() => uint256),
  offerId: xdr.int64(),
  assetSold: xdr.lazy(() => Asset),
  amountSold: xdr.int64(),
  assetBought: xdr.lazy(() => Asset),
  amountBought: xdr.int64(),
}) as xdr.XdrType<ClaimOfferAtomV0>;
