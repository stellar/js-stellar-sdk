import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("ManageOfferEffect", {
    manageOfferCreated: 0,
    manageOfferUpdated: 1,
    manageOfferDeleted: 2,
  });

  static fromValue(value: number): ManageOfferEffect {
    return enumFromValue(
      "ManageOfferEffect",
      ManageOfferEffect.schema,
      ManageOfferEffect,
      value,
    );
  }

  static fromName(name: ManageOfferEffectName): ManageOfferEffect {
    return enumFromName("ManageOfferEffect", ManageOfferEffect, name);
  }

  static fromXdrObject(wire: number): ManageOfferEffect {
    return ManageOfferEffect.fromValue(wire);
  }
}
