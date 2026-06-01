import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type HotArchiveBucketEntryTypeWire = number;

export type HotArchiveBucketEntryTypeName =
  | "hotArchiveMetaentry"
  | "hotArchiveArchived"
  | "hotArchiveLive";

/**
 * ```xdr
 * enum HotArchiveBucketEntryType
 * {
 *     HOT_ARCHIVE_METAENTRY = -1, // Bucket metadata, should come first.
 *     HOT_ARCHIVE_ARCHIVED = 0,   // Entry is Archived
 *     HOT_ARCHIVE_LIVE = 1        // Entry was previously HOT_ARCHIVE_ARCHIVED, but
 *                                 // has been added back to the live BucketList.
 *                                 // Does not need to be persisted.
 * };
 * ```
 */
export class HotArchiveBucketEntryType extends EnumValue<HotArchiveBucketEntryTypeName> {
  static readonly hotArchiveMetaentry = new HotArchiveBucketEntryType(
    "hotArchiveMetaentry",
    -1,
  );
  static readonly hotArchiveArchived = new HotArchiveBucketEntryType(
    "hotArchiveArchived",
    0,
  );
  static readonly hotArchiveLive = new HotArchiveBucketEntryType(
    "hotArchiveLive",
    1,
  );

  static readonly schema = withMemberPrefix(
    enumType("HotArchiveBucketEntryType", {
      hotArchiveMetaentry: -1,
      hotArchiveArchived: 0,
      hotArchiveLive: 1,
    }),
    "hotArchive",
  );

  static fromValue(value: number): HotArchiveBucketEntryType {
    return enumFromValue(
      "HotArchiveBucketEntryType",
      HotArchiveBucketEntryType.schema,
      HotArchiveBucketEntryType,
      value,
    );
  }

  static fromName(
    name: HotArchiveBucketEntryTypeName,
  ): HotArchiveBucketEntryType {
    return enumFromName(
      "HotArchiveBucketEntryType",
      HotArchiveBucketEntryType,
      name,
    );
  }

  static fromXdrObject(wire: number): HotArchiveBucketEntryType {
    return HotArchiveBucketEntryType.fromValue(wire);
  }
}
