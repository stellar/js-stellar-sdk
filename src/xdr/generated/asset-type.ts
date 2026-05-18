import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<Record<number, AssetType>> = {
    0: AssetType.assetTypeNative,
    1: AssetType.assetTypeCreditAlphanum4,
    2: AssetType.assetTypeCreditAlphanum12,
    3: AssetType.assetTypePoolShare,
  };

  static readonly schema = enumType("AssetType", {
    assetTypeNative: 0,
    assetTypeCreditAlphanum4: 1,
    assetTypeCreditAlphanum12: 2,
    assetTypePoolShare: 3,
  });

  static fromValue(value: number): AssetType {
    return enumLookup("AssetType", AssetType.byValue, value) as AssetType;
  }

  static fromName(name: AssetTypeName): AssetType {
    switch (name) {
      case "assetTypeNative":
        return AssetType.assetTypeNative;
      case "assetTypeCreditAlphanum4":
        return AssetType.assetTypeCreditAlphanum4;
      case "assetTypeCreditAlphanum12":
        return AssetType.assetTypeCreditAlphanum12;
      case "assetTypePoolShare":
        return AssetType.assetTypePoolShare;
      default:
        throw new XdrError(`AssetType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): AssetType {
    return AssetType.fromValue(wire);
  }
}
