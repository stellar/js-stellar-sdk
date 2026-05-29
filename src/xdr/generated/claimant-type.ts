import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type ClaimantTypeWire = number;

export type ClaimantTypeName = "claimantTypeV0";

/**
 * ```xdr
 * enum ClaimantType
 * {
 *     CLAIMANT_TYPE_V0 = 0
 * };
 * ```
 */
export class ClaimantType extends EnumValue<ClaimantTypeName> {
  static readonly claimantTypeV0 = new ClaimantType("claimantTypeV0", 0);

  static readonly schema = enumType("ClaimantType", {
    claimantTypeV0: 0,
  });

  static fromValue(value: number): ClaimantType {
    return enumFromValue(
      "ClaimantType",
      ClaimantType.schema,
      ClaimantType,
      value,
    );
  }

  static fromName(name: ClaimantTypeName): ClaimantType {
    return enumFromName("ClaimantType", ClaimantType, name);
  }

  static fromXdrObject(wire: number): ClaimantType {
    return ClaimantType.fromValue(wire);
  }
}
