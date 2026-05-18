import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<Record<number, ClaimAtomType>> = {
    0: ClaimAtomType.claimAtomTypeV0,
    1: ClaimAtomType.claimAtomTypeOrderBook,
    2: ClaimAtomType.claimAtomTypeLiquidityPool,
  };

  static readonly schema = enumType("ClaimAtomType", {
    claimAtomTypeV0: 0,
    claimAtomTypeOrderBook: 1,
    claimAtomTypeLiquidityPool: 2,
  });

  static fromValue(value: number): ClaimAtomType {
    return enumLookup(
      "ClaimAtomType",
      ClaimAtomType.byValue,
      value,
    ) as ClaimAtomType;
  }

  static fromName(name: ClaimAtomTypeName): ClaimAtomType {
    switch (name) {
      case "claimAtomTypeV0":
        return ClaimAtomType.claimAtomTypeV0;
      case "claimAtomTypeOrderBook":
        return ClaimAtomType.claimAtomTypeOrderBook;
      case "claimAtomTypeLiquidityPool":
        return ClaimAtomType.claimAtomTypeLiquidityPool;
      default:
        throw new XdrError(`ClaimAtomType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ClaimAtomType {
    return ClaimAtomType.fromValue(wire);
  }
}
