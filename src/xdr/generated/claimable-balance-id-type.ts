import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ClaimableBalanceIdTypeWire = number;

export type ClaimableBalanceIdTypeName = "claimableBalanceIdTypeV0";

/**
 * ```xdr
 * enum ClaimableBalanceIDType
 * {
 *     CLAIMABLE_BALANCE_ID_TYPE_V0 = 0
 * };
 * ```
 */
export class ClaimableBalanceIdType extends EnumValue<ClaimableBalanceIdTypeName> {
  static readonly claimableBalanceIdTypeV0 = new ClaimableBalanceIdType(
    "claimableBalanceIdTypeV0",
    0,
  );

  private static readonly byValue: Readonly<
    Record<number, ClaimableBalanceIdType>
  > = {
    0: ClaimableBalanceIdType.claimableBalanceIdTypeV0,
  };

  static readonly schema = enumType("ClaimableBalanceIdType", {
    claimableBalanceIdTypeV0: 0,
  });

  static fromValue(value: number): ClaimableBalanceIdType {
    return enumLookup(
      "ClaimableBalanceIdType",
      ClaimableBalanceIdType.byValue,
      value,
    ) as ClaimableBalanceIdType;
  }

  static fromName(name: ClaimableBalanceIdTypeName): ClaimableBalanceIdType {
    switch (name) {
      case "claimableBalanceIdTypeV0":
        return ClaimableBalanceIdType.claimableBalanceIdTypeV0;
      default:
        throw new XdrError(`ClaimableBalanceIdType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ClaimableBalanceIdType {
    return ClaimableBalanceIdType.fromValue(wire);
  }
}
