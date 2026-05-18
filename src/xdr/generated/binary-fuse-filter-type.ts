import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type BinaryFuseFilterTypeWire = number;

export type BinaryFuseFilterTypeName =
  | "binaryFuseFilter8Bit"
  | "binaryFuseFilter16Bit"
  | "binaryFuseFilter32Bit";

/**
 * ```xdr
 * enum BinaryFuseFilterType
 * {
 *     BINARY_FUSE_FILTER_8_BIT = 0,
 *     BINARY_FUSE_FILTER_16_BIT = 1,
 *     BINARY_FUSE_FILTER_32_BIT = 2
 * };
 * ```
 */
export class BinaryFuseFilterType extends EnumValue<BinaryFuseFilterTypeName> {
  static readonly binaryFuseFilter8Bit = new BinaryFuseFilterType(
    "binaryFuseFilter8Bit",
    0,
  );
  static readonly binaryFuseFilter16Bit = new BinaryFuseFilterType(
    "binaryFuseFilter16Bit",
    1,
  );
  static readonly binaryFuseFilter32Bit = new BinaryFuseFilterType(
    "binaryFuseFilter32Bit",
    2,
  );

  private static readonly byValue: Readonly<
    Record<number, BinaryFuseFilterType>
  > = {
    0: BinaryFuseFilterType.binaryFuseFilter8Bit,
    1: BinaryFuseFilterType.binaryFuseFilter16Bit,
    2: BinaryFuseFilterType.binaryFuseFilter32Bit,
  };

  static readonly schema = enumType("BinaryFuseFilterType", {
    binaryFuseFilter8Bit: 0,
    binaryFuseFilter16Bit: 1,
    binaryFuseFilter32Bit: 2,
  });

  static fromValue(value: number): BinaryFuseFilterType {
    return enumLookup(
      "BinaryFuseFilterType",
      BinaryFuseFilterType.byValue,
      value,
    ) as BinaryFuseFilterType;
  }

  static fromName(name: BinaryFuseFilterTypeName): BinaryFuseFilterType {
    switch (name) {
      case "binaryFuseFilter8Bit":
        return BinaryFuseFilterType.binaryFuseFilter8Bit;
      case "binaryFuseFilter16Bit":
        return BinaryFuseFilterType.binaryFuseFilter16Bit;
      case "binaryFuseFilter32Bit":
        return BinaryFuseFilterType.binaryFuseFilter32Bit;
      default:
        throw new XdrError(`BinaryFuseFilterType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): BinaryFuseFilterType {
    return BinaryFuseFilterType.fromValue(wire);
  }
}
