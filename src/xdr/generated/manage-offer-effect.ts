import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ManageOfferEffectWire = number;

export type ManageOfferEffectName =
  | "manageOfferCreated"
  | "manageOfferUpdated"
  | "manageOfferDeleted";

/**
 * ```xdr
 * enum ManageOfferEffect
 * {
 *     MANAGE_OFFER_CREATED = 0,
 *     MANAGE_OFFER_UPDATED = 1,
 *     MANAGE_OFFER_DELETED = 2
 * };
 * ```
 */
export class ManageOfferEffect extends EnumValue<ManageOfferEffectName> {
  static readonly manageOfferCreated = new ManageOfferEffect(
    "manageOfferCreated",
    0,
  );
  static readonly manageOfferUpdated = new ManageOfferEffect(
    "manageOfferUpdated",
    1,
  );
  static readonly manageOfferDeleted = new ManageOfferEffect(
    "manageOfferDeleted",
    2,
  );

  private static readonly byValue: Readonly<Record<number, ManageOfferEffect>> =
    {
      0: ManageOfferEffect.manageOfferCreated,
      1: ManageOfferEffect.manageOfferUpdated,
      2: ManageOfferEffect.manageOfferDeleted,
    };

  static readonly schema = enumType("ManageOfferEffect", {
    manageOfferCreated: 0,
    manageOfferUpdated: 1,
    manageOfferDeleted: 2,
  });

  static fromValue(value: number): ManageOfferEffect {
    return enumLookup(
      "ManageOfferEffect",
      ManageOfferEffect.byValue,
      value,
    ) as ManageOfferEffect;
  }

  static fromName(name: ManageOfferEffectName): ManageOfferEffect {
    switch (name) {
      case "manageOfferCreated":
        return ManageOfferEffect.manageOfferCreated;
      case "manageOfferUpdated":
        return ManageOfferEffect.manageOfferUpdated;
      case "manageOfferDeleted":
        return ManageOfferEffect.manageOfferDeleted;
      default:
        throw new XdrError(`ManageOfferEffect: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ManageOfferEffect {
    return ManageOfferEffect.fromValue(wire);
  }
}
