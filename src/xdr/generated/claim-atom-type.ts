import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type ClaimAtomTypeWire = number;

export type ClaimAtomTypeName =
  | "claimAtomTypeV0"
  | "claimAtomTypeOrderBook"
  | "claimAtomTypeLiquidityPool";

/**
 * ```xdr
 * enum ClaimAtomType
 * {
 *     CLAIM_ATOM_TYPE_V0 = 0,
 *     CLAIM_ATOM_TYPE_ORDER_BOOK = 1,
 *     CLAIM_ATOM_TYPE_LIQUIDITY_POOL = 2
 * };
 * ```
 */
export class ClaimAtomType extends EnumValue<ClaimAtomTypeName> {
  static readonly claimAtomTypeV0 = new ClaimAtomType("claimAtomTypeV0", 0);
  static readonly claimAtomTypeOrderBook = new ClaimAtomType(
    "claimAtomTypeOrderBook",
    1,
  );
  static readonly claimAtomTypeLiquidityPool = new ClaimAtomType(
    "claimAtomTypeLiquidityPool",
    2,
  );

  static readonly schema = enumType("ClaimAtomType", {
    claimAtomTypeV0: 0,
    claimAtomTypeOrderBook: 1,
    claimAtomTypeLiquidityPool: 2,
  });

  static fromValue(value: number): ClaimAtomType {
    return enumFromValue(
      "ClaimAtomType",
      ClaimAtomType.schema,
      ClaimAtomType,
      value,
    );
  }

  static fromName(name: ClaimAtomTypeName): ClaimAtomType {
    return enumFromName("ClaimAtomType", ClaimAtomType, name);
  }

  static fromXdrObject(wire: number): ClaimAtomType {
    return ClaimAtomType.fromValue(wire);
  }
}
