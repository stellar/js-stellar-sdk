/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ManageOfferEffect } from "./manage-offer-effect.js";
import { OfferEntry, type OfferEntryWire } from "./offer-entry.js";

export type ManageOfferSuccessResultOfferWire =
  | { effect: 0; offer: OfferEntryWire }
  | { effect: 1; offer: OfferEntryWire }
  | { effect: 2 };

export type ManageOfferSuccessResultOfferVariantName =
  | "manageOfferCreated"
  | "manageOfferUpdated"
  | "manageOfferDeleted";

/**
 * ```xdr
 * union switch (ManageOfferEffect effect)
 *     {
 *     case MANAGE_OFFER_CREATED:
 *     case MANAGE_OFFER_UPDATED:
 *         OfferEntry offer;
 *     case MANAGE_OFFER_DELETED:
 *         void;
 *     }
 * ```
 */
abstract class ManageOfferSuccessResultOfferBase extends XdrValue {
  abstract readonly type: ManageOfferSuccessResultOfferVariantName;

  static readonly schema: XdrType<ManageOfferSuccessResultOfferWire> = union(
    "ManageOfferSuccessResultOffer",
    {
      switchOn: ManageOfferEffect.schema,
      cases: [
        case_("manageOfferCreated", 0, field("offer", OfferEntry.schema)),
        case_("manageOfferUpdated", 1, field("offer", OfferEntry.schema)),
        case_("manageOfferDeleted", 2, voidType()),
      ],
      switchKey: "effect",
    },
  );

  static manageOfferCreated(
    offer: OfferEntry,
  ): ManageOfferSuccessResultOfferCreated {
    return new ManageOfferSuccessResultOfferCreated(offer);
  }

  static manageOfferUpdated(
    offer: OfferEntry,
  ): ManageOfferSuccessResultOfferUpdated {
    return new ManageOfferSuccessResultOfferUpdated(offer);
  }

  static manageOfferDeleted(): ManageOfferSuccessResultOfferDeleted {
    return new ManageOfferSuccessResultOfferDeleted();
  }

  static fromXdrObject(
    wire: ManageOfferSuccessResultOfferWire,
  ): ManageOfferSuccessResultOffer {
    switch (wire.effect) {
      case 0:
        return new ManageOfferSuccessResultOfferCreated(
          OfferEntry.fromXdrObject(wire.offer),
        );
      case 1:
        return new ManageOfferSuccessResultOfferUpdated(
          OfferEntry.fromXdrObject(wire.offer),
        );
      case 2:
        return new ManageOfferSuccessResultOfferDeleted();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ManageOfferSuccessResultOffer variant.
   * Use this instead of `instanceof ManageOfferSuccessResultOffer`: the exported `ManageOfferSuccessResultOffer` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ManageOfferSuccessResultOffer.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ManageOfferSuccessResultOffer {
    return value instanceof ManageOfferSuccessResultOfferBase;
  }

  abstract toXdrObject(): ManageOfferSuccessResultOfferWire;
}

export class ManageOfferSuccessResultOfferCreated extends ManageOfferSuccessResultOfferBase {
  readonly type = "manageOfferCreated" as const;
  readonly offer: OfferEntry;

  constructor(offer: OfferEntry) {
    super();
    this.offer = offer;
  }

  get value(): OfferEntry {
    return this.offer;
  }

  toXdrObject(): Extract<ManageOfferSuccessResultOfferWire, { effect: 0 }> {
    return { effect: 0, offer: this.offer.toXdrObject() };
  }
}

export class ManageOfferSuccessResultOfferUpdated extends ManageOfferSuccessResultOfferBase {
  readonly type = "manageOfferUpdated" as const;
  readonly offer: OfferEntry;

  constructor(offer: OfferEntry) {
    super();
    this.offer = offer;
  }

  get value(): OfferEntry {
    return this.offer;
  }

  toXdrObject(): Extract<ManageOfferSuccessResultOfferWire, { effect: 1 }> {
    return { effect: 1, offer: this.offer.toXdrObject() };
  }
}

export class ManageOfferSuccessResultOfferDeleted extends ManageOfferSuccessResultOfferBase {
  readonly type = "manageOfferDeleted" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ManageOfferSuccessResultOfferWire, { effect: 2 }> {
    return { effect: 2 };
  }
}

export type ManageOfferSuccessResultOffer =
  | ManageOfferSuccessResultOfferCreated
  | ManageOfferSuccessResultOfferUpdated
  | ManageOfferSuccessResultOfferDeleted;
export const ManageOfferSuccessResultOffer = ManageOfferSuccessResultOfferBase;
