/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { BucketEntryType } from "./bucket-entry-type.js";
import { LedgerEntry, type LedgerEntryWire } from "./ledger-entry.js";
import { LedgerKey, type LedgerKeyWire } from "./ledger-key.js";
import { BucketMetadata, type BucketMetadataWire } from "./bucket-metadata.js";

export type BucketEntryWire =
  | { type: 0; liveEntry: LedgerEntryWire }
  | { type: 2; liveEntry: LedgerEntryWire }
  | { type: 1; deadEntry: LedgerKeyWire }
  | { type: -1; metaEntry: BucketMetadataWire };

export type BucketEntryVariantName =
  | "liveentry"
  | "initentry"
  | "deadentry"
  | "metaentry";

/**
 * ```xdr
 * union BucketEntry switch (BucketEntryType type)
 * {
 * case LIVEENTRY:
 * case INITENTRY:
 *     LedgerEntry liveEntry;
 *
 * case DEADENTRY:
 *     LedgerKey deadEntry;
 * case METAENTRY:
 *     BucketMetadata metaEntry;
 * };
 * ```
 */
abstract class BucketEntryBase extends XdrValue {
  abstract readonly type: BucketEntryVariantName;

  static readonly schema: XdrType<BucketEntryWire> = union("BucketEntry", {
    switchOn: BucketEntryType.schema,
    cases: [
      case_("liveentry", 0, field("liveEntry", LedgerEntry.schema)),
      case_("initentry", 2, field("liveEntry", LedgerEntry.schema)),
      case_("deadentry", 1, field("deadEntry", LedgerKey.schema)),
      case_("metaentry", -1, field("metaEntry", BucketMetadata.schema)),
    ],
  });

  static liveentry(liveEntry: LedgerEntry): BucketEntryLiveentry {
    return new BucketEntryLiveentry(liveEntry);
  }

  static initentry(liveEntry: LedgerEntry): BucketEntryInitentry {
    return new BucketEntryInitentry(liveEntry);
  }

  static deadentry(deadEntry: LedgerKey): BucketEntryDeadentry {
    return new BucketEntryDeadentry(deadEntry);
  }

  static metaentry(metaEntry: BucketMetadata): BucketEntryMetaentry {
    return new BucketEntryMetaentry(metaEntry);
  }

  static fromXdrObject(wire: BucketEntryWire): BucketEntry {
    switch (wire.type) {
      case 0:
        return new BucketEntryLiveentry(
          LedgerEntry.fromXdrObject(wire.liveEntry),
        );
      case 2:
        return new BucketEntryInitentry(
          LedgerEntry.fromXdrObject(wire.liveEntry),
        );
      case 1:
        return new BucketEntryDeadentry(
          LedgerKey.fromXdrObject(wire.deadEntry),
        );
      case -1:
        return new BucketEntryMetaentry(
          BucketMetadata.fromXdrObject(wire.metaEntry),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete BucketEntry variant.
   * Use this instead of `instanceof BucketEntry`: the exported `BucketEntry` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `BucketEntry.is(x)` narrows to the union.
   */
  static is(value: unknown): value is BucketEntry {
    return value instanceof BucketEntryBase;
  }

  abstract toXdrObject(): BucketEntryWire;
}

export class BucketEntryLiveentry extends BucketEntryBase {
  readonly type = "liveentry" as const;
  readonly liveEntry: LedgerEntry;

  constructor(liveEntry: LedgerEntry) {
    super();
    this.liveEntry = liveEntry;
  }

  get value(): LedgerEntry {
    return this.liveEntry;
  }

  toXdrObject(): Extract<BucketEntryWire, { type: 0 }> {
    return { type: 0, liveEntry: this.liveEntry.toXdrObject() };
  }
}

export class BucketEntryInitentry extends BucketEntryBase {
  readonly type = "initentry" as const;
  readonly liveEntry: LedgerEntry;

  constructor(liveEntry: LedgerEntry) {
    super();
    this.liveEntry = liveEntry;
  }

  get value(): LedgerEntry {
    return this.liveEntry;
  }

  toXdrObject(): Extract<BucketEntryWire, { type: 2 }> {
    return { type: 2, liveEntry: this.liveEntry.toXdrObject() };
  }
}

export class BucketEntryDeadentry extends BucketEntryBase {
  readonly type = "deadentry" as const;
  readonly deadEntry: LedgerKey;

  constructor(deadEntry: LedgerKey) {
    super();
    this.deadEntry = deadEntry;
  }

  get value(): LedgerKey {
    return this.deadEntry;
  }

  toXdrObject(): Extract<BucketEntryWire, { type: 1 }> {
    return { type: 1, deadEntry: this.deadEntry.toXdrObject() };
  }
}

export class BucketEntryMetaentry extends BucketEntryBase {
  readonly type = "metaentry" as const;
  readonly metaEntry: BucketMetadata;

  constructor(metaEntry: BucketMetadata) {
    super();
    this.metaEntry = metaEntry;
  }

  get value(): BucketMetadata {
    return this.metaEntry;
  }

  toXdrObject(): Extract<BucketEntryWire, { type: -1 }> {
    return { type: -1, metaEntry: this.metaEntry.toXdrObject() };
  }
}

export type BucketEntry =
  | BucketEntryLiveentry
  | BucketEntryInitentry
  | BucketEntryDeadentry
  | BucketEntryMetaentry;
export const BucketEntry = BucketEntryBase;
