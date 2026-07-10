import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ClaimAtom, type ClaimAtomWire } from "./claim-atom.js";
import {
  ManageOfferSuccessResultOffer,
  type ManageOfferSuccessResultOfferWire,
} from "./manage-offer-success-result-offer.js";

export interface ManageOfferSuccessResultWire {
  offersClaimed: ClaimAtomWire[];
  offer: ManageOfferSuccessResultOfferWire;
}

/**
 * ```xdr
 * struct ManageOfferSuccessResult
 * {
 *     // offers that got claimed while creating this offer
 *     ClaimAtom offersClaimed<>;
 *
 *     union switch (ManageOfferEffect effect)
 *     {
 *     case MANAGE_OFFER_CREATED:
 *     case MANAGE_OFFER_UPDATED:
 *         OfferEntry offer;
 *     case MANAGE_OFFER_DELETED:
 *         void;
 *     }
 *     offer;
 * };
 * ```
 */
export class ManageOfferSuccessResult extends XdrValue {
  readonly offersClaimed: ClaimAtom[];
  readonly offer: ManageOfferSuccessResultOffer;

  static readonly schema: XdrType<ManageOfferSuccessResultWire> = struct(
    "ManageOfferSuccessResult",
    {
      offersClaimed: array(ClaimAtom.schema, UNBOUNDED_MAX_LENGTH),
      offer: ManageOfferSuccessResultOffer.schema,
    },
  );

  constructor(input: {
    offersClaimed: ClaimAtom[];
    offer: ManageOfferSuccessResultOffer;
  }) {
    super();
    this.offersClaimed = input.offersClaimed;
    this.offer = input.offer;
  }

  toXdrObject(): ManageOfferSuccessResultWire {
    return {
      offersClaimed: this.offersClaimed.map((v) => v.toXdrObject()),
      offer: this.offer.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: ManageOfferSuccessResultWire,
  ): ManageOfferSuccessResult {
    return new ManageOfferSuccessResult({
      offersClaimed: wire.offersClaimed.map((w) => ClaimAtom.fromXdrObject(w)),
      offer: ManageOfferSuccessResultOffer.fromXdrObject(wire.offer),
    });
  }
}
