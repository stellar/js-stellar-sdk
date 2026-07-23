import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("ClaimableBalanceIdType", {
    claimableBalanceIdTypeV0: 0,
  });

  static fromValue(value: number): ClaimableBalanceIdType {
    return enumFromValue(
      "ClaimableBalanceIdType",
      ClaimableBalanceIdType.schema,
      ClaimableBalanceIdType,
      value,
    );
  }

  static fromName(name: ClaimableBalanceIdTypeName): ClaimableBalanceIdType {
    return enumFromName("ClaimableBalanceIdType", ClaimableBalanceIdType, name);
  }

  static fromXdrObject(wire: number): ClaimableBalanceIdType {
    return ClaimableBalanceIdType.fromValue(wire);
  }
}
