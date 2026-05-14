// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountId } from "./account-id.js";
import { Asset } from "./asset.js";
import { OfferEntryExt } from "./offer-entry-ext.js";
import { Price } from "./price.js";
export interface OfferEntry {
  readonly sellerId: AccountId;
  readonly offerId: bigint;
  readonly selling: Asset;
  readonly buying: Asset;
  readonly amount: bigint;
  readonly price: Price;
  readonly flags: number;
  readonly ext: OfferEntryExt;
}
export const OfferEntry = xdr.struct("OfferEntry", {
  sellerId: xdr.lazy(() => AccountId),
  offerId: xdr.int64(),
  selling: xdr.lazy(() => Asset),
  buying: xdr.lazy(() => Asset),
  amount: xdr.int64(),
  price: xdr.lazy(() => Price),
  flags: xdr.uint32(),
  ext: xdr.lazy(() => OfferEntryExt),
}) as xdr.XdrType<OfferEntry>;
