import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type BucketListTypeWire = number;

export type BucketListTypeName = "live" | "hotArchive";

/**
 * ```xdr
 * enum BucketListType
 * {
 *     LIVE = 0,
 *     HOT_ARCHIVE = 1
 * };
 * ```
 */
export class BucketListType extends EnumValue<BucketListTypeName> {
  static readonly live = new BucketListType("live", 0);
  static readonly hotArchive = new BucketListType("hotArchive", 1);

  private static readonly byValue: Readonly<Record<number, BucketListType>> = {
    0: BucketListType.live,
    1: BucketListType.hotArchive,
  };

  static readonly schema = enumType("BucketListType", {
    live: 0,
    hotArchive: 1,
  });

  static fromValue(value: number): BucketListType {
    return enumLookup(
      "BucketListType",
      BucketListType.byValue,
      value,
    ) as BucketListType;
  }

  static fromName(name: BucketListTypeName): BucketListType {
    switch (name) {
      case "live":
        return BucketListType.live;
      case "hotArchive":
        return BucketListType.hotArchive;
      default:
        throw new XdrError(`BucketListType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): BucketListType {
    return BucketListType.fromValue(wire);
  }
}
