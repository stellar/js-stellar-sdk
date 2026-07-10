import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("BucketListType", {
    live: 0,
    hotArchive: 1,
  });

  static fromValue(value: number): BucketListType {
    return enumFromValue(
      "BucketListType",
      BucketListType.schema,
      BucketListType,
      value,
    );
  }

  static fromName(name: BucketListTypeName): BucketListType {
    return enumFromName("BucketListType", BucketListType, name);
  }

  static fromXdrObject(wire: number): BucketListType {
    return BucketListType.fromValue(wire);
  }
}
