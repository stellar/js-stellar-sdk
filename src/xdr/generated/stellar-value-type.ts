import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type StellarValueTypeWire = number;

export type StellarValueTypeName = "stellarValueBasic" | "stellarValueSigned";

/**
 * ```xdr
 * enum StellarValueType
 * {
 *     STELLAR_VALUE_BASIC = 0,
 *     STELLAR_VALUE_SIGNED = 1
 * };
 * ```
 */
export class StellarValueType extends EnumValue<StellarValueTypeName> {
  static readonly stellarValueBasic = new StellarValueType(
    "stellarValueBasic",
    0,
  );
  static readonly stellarValueSigned = new StellarValueType(
    "stellarValueSigned",
    1,
  );

  private static readonly byValue: Readonly<Record<number, StellarValueType>> =
    {
      0: StellarValueType.stellarValueBasic,
      1: StellarValueType.stellarValueSigned,
    };

  static readonly schema = enumType("StellarValueType", {
    stellarValueBasic: 0,
    stellarValueSigned: 1,
  });

  static fromValue(value: number): StellarValueType {
    return enumLookup(
      "StellarValueType",
      StellarValueType.byValue,
      value,
    ) as StellarValueType;
  }

  static fromName(name: StellarValueTypeName): StellarValueType {
    switch (name) {
      case "stellarValueBasic":
        return StellarValueType.stellarValueBasic;
      case "stellarValueSigned":
        return StellarValueType.stellarValueSigned;
      default:
        throw new XdrError(`StellarValueType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): StellarValueType {
    return StellarValueType.fromValue(wire);
  }
}
