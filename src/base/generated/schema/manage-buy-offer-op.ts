// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { Price } from "./price.js";
export interface ManageBuyOfferOp {
  readonly selling: Asset;
  readonly buying: Asset;
  readonly buyAmount: bigint;
  readonly price: Price;
  readonly offerId: bigint;
}
export const ManageBuyOfferOp = xdr.struct("ManageBuyOfferOp", {
  selling: xdr.lazy(() => Asset),
  buying: xdr.lazy(() => Asset),
  buyAmount: xdr.int64(),
  price: xdr.lazy(() => Price),
  offerId: xdr.int64(),
}) as xdr.XdrType<ManageBuyOfferOp>;
