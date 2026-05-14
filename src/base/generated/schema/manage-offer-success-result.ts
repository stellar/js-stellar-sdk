// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ClaimAtom } from "./claim-atom.js";
import { ManageOfferSuccessResultOffer } from "./manage-offer-success-result-offer.js";
export interface ManageOfferSuccessResult {
  readonly offersClaimed: ClaimAtom[];
  readonly offer: ManageOfferSuccessResultOffer;
}
export const ManageOfferSuccessResult = xdr.struct("ManageOfferSuccessResult", {
  offersClaimed: xdr.array(
    xdr.lazy(() => ClaimAtom),
    xdr.UNBOUNDED_MAX_LENGTH,
  ),
  offer: xdr.lazy(() => ManageOfferSuccessResultOffer),
}) as xdr.XdrType<ManageOfferSuccessResult>;
