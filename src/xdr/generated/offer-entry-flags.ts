import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type OfferEntryFlagsWire = number;

export type OfferEntryFlagsName = "passiveFlag";

/**
 * ```xdr
 * enum OfferEntryFlags
 * {
 *     // an offer with this flag will not act on and take a reverse offer of equal
 *     // price
 *     PASSIVE_FLAG = 1
 * };
 * ```
 */
export class OfferEntryFlags extends EnumValue<OfferEntryFlagsName> {
  static readonly passiveFlag = new OfferEntryFlags("passiveFlag", 1);

  static readonly schema = enumType("OfferEntryFlags", {
    passiveFlag: 1,
  });

  static fromValue(value: number): OfferEntryFlags {
    return enumFromValue(
      "OfferEntryFlags",
      OfferEntryFlags.schema,
      OfferEntryFlags,
      value,
    );
  }

  static fromName(name: OfferEntryFlagsName): OfferEntryFlags {
    return enumFromName("OfferEntryFlags", OfferEntryFlags, name);
  }

  static fromXdrObject(wire: number): OfferEntryFlags {
    return OfferEntryFlags.fromValue(wire);
  }
}
