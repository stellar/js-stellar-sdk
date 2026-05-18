import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, HotArchiveBucketEntryType>
  > = {
    "-1": HotArchiveBucketEntryType.hotArchiveMetaentry,
    0: HotArchiveBucketEntryType.hotArchiveArchived,
    1: HotArchiveBucketEntryType.hotArchiveLive,
  };

  static readonly schema = enumType("HotArchiveBucketEntryType", {
    hotArchiveMetaentry: -1,
    hotArchiveArchived: 0,
    hotArchiveLive: 1,
  });

  static fromValue(value: number): HotArchiveBucketEntryType {
    return enumLookup(
      "HotArchiveBucketEntryType",
      HotArchiveBucketEntryType.byValue,
      value,
    ) as HotArchiveBucketEntryType;
  }

  static fromName(
    name: HotArchiveBucketEntryTypeName,
  ): HotArchiveBucketEntryType {
    switch (name) {
      case "hotArchiveMetaentry":
        return HotArchiveBucketEntryType.hotArchiveMetaentry;
      case "hotArchiveArchived":
        return HotArchiveBucketEntryType.hotArchiveArchived;
      case "hotArchiveLive":
        return HotArchiveBucketEntryType.hotArchiveLive;
      default:
        throw new XdrError(`HotArchiveBucketEntryType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): HotArchiveBucketEntryType {
    return HotArchiveBucketEntryType.fromValue(wire);
  }
}
