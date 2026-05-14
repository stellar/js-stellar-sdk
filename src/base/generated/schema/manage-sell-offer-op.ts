// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { Price } from "./price.js";
export interface ManageSellOfferOp {
  readonly selling: Asset;
  readonly buying: Asset;
  readonly amount: bigint;
  readonly price: Price;
  readonly offerId: bigint;
}
export const ManageSellOfferOp = xdr.struct("ManageSellOfferOp", {
  selling: xdr.lazy(() => Asset),
  buying: xdr.lazy(() => Asset),
  amount: xdr.int64(),
  price: xdr.lazy(() => Price),
  offerId: xdr.int64(),
}) as xdr.XdrType<ManageSellOfferOp>;
