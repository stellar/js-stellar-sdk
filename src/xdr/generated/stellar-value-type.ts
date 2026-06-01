import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("StellarValueType", {
      stellarValueBasic: 0,
      stellarValueSigned: 1,
    }),
    "stellarValue",
  );

  static fromValue(value: number): StellarValueType {
    return enumFromValue(
      "StellarValueType",
      StellarValueType.schema,
      StellarValueType,
      value,
    );
  }

  static fromName(name: StellarValueTypeName): StellarValueType {
    return enumFromName("StellarValueType", StellarValueType, name);
  }

  static fromXdrObject(wire: number): StellarValueType {
    return StellarValueType.fromValue(wire);
  }
}
