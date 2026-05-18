/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { HotArchiveBucketEntryType } from "./hot-archive-bucket-entry-type.js";
import { LedgerEntry, type LedgerEntryWire } from "./ledger-entry.js";
import { LedgerKey, type LedgerKeyWire } from "./ledger-key.js";
import { BucketMetadata, type BucketMetadataWire } from "./bucket-metadata.js";

export type HotArchiveBucketEntryWire =
  | { type: 0; archivedEntry: LedgerEntryWire }
  | { type: 1; key: LedgerKeyWire }
  | { type: -1; metaEntry: BucketMetadataWire };

export type HotArchiveBucketEntryVariantName =
  | "hotArchiveArchived"
  | "hotArchiveLive"
  | "hotArchiveMetaentry";

/**
 * ```xdr
 * union HotArchiveBucketEntry switch (HotArchiveBucketEntryType type)
 * {
 * case HOT_ARCHIVE_ARCHIVED:
 *     LedgerEntry archivedEntry;
 *
 * case HOT_ARCHIVE_LIVE:
 *     LedgerKey key;
 * case HOT_ARCHIVE_METAENTRY:
 *     BucketMetadata metaEntry;
 * };
 * ```
 */
abstract class HotArchiveBucketEntryBase extends XdrValue {
  abstract readonly type: HotArchiveBucketEntryVariantName;

  static readonly schema: XdrType<HotArchiveBucketEntryWire> = union(
    "HotArchiveBucketEntry",
    {
      switchOn: HotArchiveBucketEntryType.schema,
      cases: [
        case_(
          "hotArchiveArchived",
          0,
          field("archivedEntry", LedgerEntry.schema),
        ),
        case_("hotArchiveLive", 1, field("key", LedgerKey.schema)),
        case_(
          "hotArchiveMetaentry",
          -1,
          field("metaEntry", BucketMetadata.schema),
        ),
      ],
    },
  );

  static hotArchiveArchived(
    archivedEntry: LedgerEntry,
  ): HotArchiveBucketEntryArchived {
    return new HotArchiveBucketEntryArchived(archivedEntry);
  }

  static hotArchiveLive(key: LedgerKey): HotArchiveBucketEntryLive {
    return new HotArchiveBucketEntryLive(key);
  }

  static hotArchiveMetaentry(
    metaEntry: BucketMetadata,
  ): HotArchiveBucketEntryMetaentry {
    return new HotArchiveBucketEntryMetaentry(metaEntry);
  }

  static fromXdrObject(wire: HotArchiveBucketEntryWire): HotArchiveBucketEntry {
    switch (wire.type) {
      case 0:
        return new HotArchiveBucketEntryArchived(
          LedgerEntry.fromXdrObject(wire.archivedEntry),
        );
      case 1:
        return new HotArchiveBucketEntryLive(LedgerKey.fromXdrObject(wire.key));
      case -1:
        return new HotArchiveBucketEntryMetaentry(
          BucketMetadata.fromXdrObject(wire.metaEntry),
        );
    }
  }

  abstract toXdrObject(): HotArchiveBucketEntryWire;
}

export class HotArchiveBucketEntryArchived extends HotArchiveBucketEntryBase {
  readonly type = "hotArchiveArchived" as const;
  readonly archivedEntry: LedgerEntry;

  constructor(archivedEntry: LedgerEntry) {
    super();
    this.archivedEntry = archivedEntry;
  }

  get value(): LedgerEntry {
    return this.archivedEntry;
  }

  toXdrObject(): Extract<HotArchiveBucketEntryWire, { type: 0 }> {
    return { type: 0, archivedEntry: this.archivedEntry.toXdrObject() };
  }
}

export class HotArchiveBucketEntryLive extends HotArchiveBucketEntryBase {
  readonly type = "hotArchiveLive" as const;
  readonly key: LedgerKey;

  constructor(key: LedgerKey) {
    super();
    this.key = key;
  }

  get value(): LedgerKey {
    return this.key;
  }

  toXdrObject(): Extract<HotArchiveBucketEntryWire, { type: 1 }> {
    return { type: 1, key: this.key.toXdrObject() };
  }
}

export class HotArchiveBucketEntryMetaentry extends HotArchiveBucketEntryBase {
  readonly type = "hotArchiveMetaentry" as const;
  readonly metaEntry: BucketMetadata;

  constructor(metaEntry: BucketMetadata) {
    super();
    this.metaEntry = metaEntry;
  }

  get value(): BucketMetadata {
    return this.metaEntry;
  }

  toXdrObject(): Extract<HotArchiveBucketEntryWire, { type: -1 }> {
    return { type: -1, metaEntry: this.metaEntry.toXdrObject() };
  }
}

export type HotArchiveBucketEntry =
  | HotArchiveBucketEntryArchived
  | HotArchiveBucketEntryLive
  | HotArchiveBucketEntryMetaentry;
export const HotArchiveBucketEntry = HotArchiveBucketEntryBase;
