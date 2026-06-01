import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("BinaryFuseFilterType", {
      binaryFuseFilter8Bit: 0,
      binaryFuseFilter16Bit: 1,
      binaryFuseFilter32Bit: 2,
    }),
    "binaryFuseFilter",
  );

  static fromValue(value: number): BinaryFuseFilterType {
    return enumFromValue(
      "BinaryFuseFilterType",
      BinaryFuseFilterType.schema,
      BinaryFuseFilterType,
      value,
    );
  }

  static fromName(name: BinaryFuseFilterTypeName): BinaryFuseFilterType {
    return enumFromName("BinaryFuseFilterType", BinaryFuseFilterType, name);
  }

  static fromXdrObject(wire: number): BinaryFuseFilterType {
    return BinaryFuseFilterType.fromValue(wire);
  }
}
