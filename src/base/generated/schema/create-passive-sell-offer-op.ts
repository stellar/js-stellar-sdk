// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { Asset } from "./asset.js";
import { Price } from "./price.js";
export interface CreatePassiveSellOfferOp {
  readonly selling: Asset;
  readonly buying: Asset;
  readonly amount: bigint;
  readonly price: Price;
}
export const CreatePassiveSellOfferOp = xdr.struct("CreatePassiveSellOfferOp", {
  selling: xdr.lazy(() => Asset),
  buying: xdr.lazy(() => Asset),
  amount: xdr.int64(),
  price: xdr.lazy(() => Price),
}) as xdr.XdrType<CreatePassiveSellOfferOp>;
