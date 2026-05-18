import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<Record<number, ClaimantType>> = {
    0: ClaimantType.claimantTypeV0,
  };

  static readonly schema = enumType("ClaimantType", {
    claimantTypeV0: 0,
  });

  static fromValue(value: number): ClaimantType {
    return enumLookup(
      "ClaimantType",
      ClaimantType.byValue,
      value,
    ) as ClaimantType;
  }

  static fromName(name: ClaimantTypeName): ClaimantType {
    switch (name) {
      case "claimantTypeV0":
        return ClaimantType.claimantTypeV0;
      default:
        throw new XdrError(`ClaimantType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ClaimantType {
    return ClaimantType.fromValue(wire);
  }
}
