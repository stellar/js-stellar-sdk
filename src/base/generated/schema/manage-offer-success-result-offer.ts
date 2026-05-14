// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { ManageOfferEffect } from "./manage-offer-effect.js";
import { OfferEntry } from "./offer-entry.js";
export type ManageOfferSuccessResultOffer =
  | {
      readonly effect: 0;
      readonly offer: OfferEntry;
    }
  | {
      readonly effect: 1;
      readonly offer: OfferEntry;
    }
  | {
      readonly effect: 2;
    };
export const ManageOfferSuccessResultOffer = xdr.union(
  "ManageOfferSuccessResultOffer",
  {
    switchOn: xdr.lazy(() => ManageOfferEffect),
    switchKey: "effect",
    cases: [
      xdr.case(
        "manageOfferCreated",
        0,
        xdr.field(
          "offer",
          xdr.lazy(() => OfferEntry),
        ),
      ),
      xdr.case(
        "manageOfferUpdated",
        1,
        xdr.field(
          "offer",
          xdr.lazy(() => OfferEntry),
        ),
      ),
      xdr.case("manageOfferDeleted", 2, xdr.void()),
    ] as const,
  },
) as xdr.XdrType<ManageOfferSuccessResultOffer>;
