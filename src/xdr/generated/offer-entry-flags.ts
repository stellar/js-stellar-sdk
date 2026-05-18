import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<Record<number, OfferEntryFlags>> = {
    1: OfferEntryFlags.passiveFlag,
  };

  static readonly schema = enumType("OfferEntryFlags", {
    passiveFlag: 1,
  });

  static fromValue(value: number): OfferEntryFlags {
    return enumLookup(
      "OfferEntryFlags",
      OfferEntryFlags.byValue,
      value,
    ) as OfferEntryFlags;
  }

  static fromName(name: OfferEntryFlagsName): OfferEntryFlags {
    switch (name) {
      case "passiveFlag":
        return OfferEntryFlags.passiveFlag;
      default:
        throw new XdrError(`OfferEntryFlags: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): OfferEntryFlags {
    return OfferEntryFlags.fromValue(wire);
  }
}
