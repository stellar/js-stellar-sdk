import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type AssetTypeWire = number;

export type AssetTypeName =
  | "assetTypeNative"
  | "assetTypeCreditAlphanum4"
  | "assetTypeCreditAlphanum12"
  | "assetTypePoolShare";

/**
 * ```xdr
 * enum AssetType
 * {
 *     ASSET_TYPE_NATIVE = 0,
 *     ASSET_TYPE_CREDIT_ALPHANUM4 = 1,
 *     ASSET_TYPE_CREDIT_ALPHANUM12 = 2,
 *     ASSET_TYPE_POOL_SHARE = 3
 * };
 * ```
 */
export class AssetType extends EnumValue<AssetTypeName> {
  static readonly assetTypeNative = new AssetType("assetTypeNative", 0);
  static readonly assetTypeCreditAlphanum4 = new AssetType(
    "assetTypeCreditAlphanum4",
    1,
  );
  static readonly assetTypeCreditAlphanum12 = new AssetType(
    "assetTypeCreditAlphanum12",
    2,
  );
  static readonly assetTypePoolShare = new AssetType("assetTypePoolShare", 3);

  static readonly schema = withMemberPrefix(
    enumType("AssetType", {
      assetTypeNative: 0,
      assetTypeCreditAlphanum4: 1,
      assetTypeCreditAlphanum12: 2,
      assetTypePoolShare: 3,
    }),
    "assetType",
  );

  static fromValue(value: number): AssetType {
    return enumFromValue("AssetType", AssetType.schema, AssetType, value);
  }

  static fromName(name: AssetTypeName): AssetType {
    return enumFromName("AssetType", AssetType, name);
  }

  static fromXdrObject(wire: number): AssetType {
    return AssetType.fromValue(wire);
  }
}
