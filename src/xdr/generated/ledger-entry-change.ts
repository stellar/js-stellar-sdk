/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { LedgerEntryChangeType } from "./ledger-entry-change-type.js";
import { LedgerEntry, type LedgerEntryWire } from "./ledger-entry.js";
import { LedgerKey, type LedgerKeyWire } from "./ledger-key.js";

export type LedgerEntryChangeWire =
  | { type: 0; created: LedgerEntryWire }
  | { type: 1; updated: LedgerEntryWire }
  | { type: 2; removed: LedgerKeyWire }
  | { type: 3; state: LedgerEntryWire }
  | { type: 4; restored: LedgerEntryWire };

export type LedgerEntryChangeVariantName =
  | "ledgerEntryCreated"
  | "ledgerEntryUpdated"
  | "ledgerEntryRemoved"
  | "ledgerEntryState"
  | "ledgerEntryRestored";

/**
 * ```xdr
 * union LedgerEntryChange switch (LedgerEntryChangeType type)
 * {
 * case LEDGER_ENTRY_CREATED:
 *     LedgerEntry created;
 * case LEDGER_ENTRY_UPDATED:
 *     LedgerEntry updated;
 * case LEDGER_ENTRY_REMOVED:
 *     LedgerKey removed;
 * case LEDGER_ENTRY_STATE:
 *     LedgerEntry state;
 * case LEDGER_ENTRY_RESTORED:
 *     LedgerEntry restored;
 * };
 * ```
 */
abstract class LedgerEntryChangeBase extends XdrValue {
  abstract readonly type: LedgerEntryChangeVariantName;

  static readonly schema: XdrType<LedgerEntryChangeWire> = union(
    "LedgerEntryChange",
    {
      switchOn: LedgerEntryChangeType.schema,
      cases: [
        case_("ledgerEntryCreated", 0, field("created", LedgerEntry.schema)),
        case_("ledgerEntryUpdated", 1, field("updated", LedgerEntry.schema)),
        case_("ledgerEntryRemoved", 2, field("removed", LedgerKey.schema)),
        case_("ledgerEntryState", 3, field("state", LedgerEntry.schema)),
        case_("ledgerEntryRestored", 4, field("restored", LedgerEntry.schema)),
      ],
    },
  );

  static ledgerEntryCreated(created: LedgerEntry): LedgerEntryChangeCreated {
    return new LedgerEntryChangeCreated(created);
  }

  static ledgerEntryUpdated(updated: LedgerEntry): LedgerEntryChangeUpdated {
    return new LedgerEntryChangeUpdated(updated);
  }

  static ledgerEntryRemoved(removed: LedgerKey): LedgerEntryChangeRemoved {
    return new LedgerEntryChangeRemoved(removed);
  }

  static ledgerEntryState(state: LedgerEntry): LedgerEntryChangeState {
    return new LedgerEntryChangeState(state);
  }

  static ledgerEntryRestored(restored: LedgerEntry): LedgerEntryChangeRestored {
    return new LedgerEntryChangeRestored(restored);
  }

  static fromXdrObject(wire: LedgerEntryChangeWire): LedgerEntryChange {
    switch (wire.type) {
      case 0:
        return new LedgerEntryChangeCreated(
          LedgerEntry.fromXdrObject(wire.created),
        );
      case 1:
        return new LedgerEntryChangeUpdated(
          LedgerEntry.fromXdrObject(wire.updated),
        );
      case 2:
        return new LedgerEntryChangeRemoved(
          LedgerKey.fromXdrObject(wire.removed),
        );
      case 3:
        return new LedgerEntryChangeState(
          LedgerEntry.fromXdrObject(wire.state),
        );
      case 4:
        return new LedgerEntryChangeRestored(
          LedgerEntry.fromXdrObject(wire.restored),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete LedgerEntryChange variant.
   * Use this instead of `instanceof LedgerEntryChange`: the exported `LedgerEntryChange` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `LedgerEntryChange.is(x)` narrows to the union.
   */
  static is(value: unknown): value is LedgerEntryChange {
    return value instanceof LedgerEntryChangeBase;
  }

  abstract toXdrObject(): LedgerEntryChangeWire;
}

export class LedgerEntryChangeCreated extends LedgerEntryChangeBase {
  readonly type = "ledgerEntryCreated" as const;
  readonly created: LedgerEntry;

  constructor(created: LedgerEntry) {
    super();
    this.created = created;
  }

  get value(): LedgerEntry {
    return this.created;
  }

  toXdrObject(): Extract<LedgerEntryChangeWire, { type: 0 }> {
    return { type: 0, created: this.created.toXdrObject() };
  }
}

export class LedgerEntryChangeUpdated extends LedgerEntryChangeBase {
  readonly type = "ledgerEntryUpdated" as const;
  readonly updated: LedgerEntry;

  constructor(updated: LedgerEntry) {
    super();
    this.updated = updated;
  }

  get value(): LedgerEntry {
    return this.updated;
  }

  toXdrObject(): Extract<LedgerEntryChangeWire, { type: 1 }> {
    return { type: 1, updated: this.updated.toXdrObject() };
  }
}

export class LedgerEntryChangeRemoved extends LedgerEntryChangeBase {
  readonly type = "ledgerEntryRemoved" as const;
  readonly removed: LedgerKey;

  constructor(removed: LedgerKey) {
    super();
    this.removed = removed;
  }

  get value(): LedgerKey {
    return this.removed;
  }

  toXdrObject(): Extract<LedgerEntryChangeWire, { type: 2 }> {
    return { type: 2, removed: this.removed.toXdrObject() };
  }
}

export class LedgerEntryChangeState extends LedgerEntryChangeBase {
  readonly type = "ledgerEntryState" as const;
  readonly state: LedgerEntry;

  constructor(state: LedgerEntry) {
    super();
    this.state = state;
  }

  get value(): LedgerEntry {
    return this.state;
  }

  toXdrObject(): Extract<LedgerEntryChangeWire, { type: 3 }> {
    return { type: 3, state: this.state.toXdrObject() };
  }
}

export class LedgerEntryChangeRestored extends LedgerEntryChangeBase {
  readonly type = "ledgerEntryRestored" as const;
  readonly restored: LedgerEntry;

  constructor(restored: LedgerEntry) {
    super();
    this.restored = restored;
  }

  get value(): LedgerEntry {
    return this.restored;
  }

  toXdrObject(): Extract<LedgerEntryChangeWire, { type: 4 }> {
    return { type: 4, restored: this.restored.toXdrObject() };
  }
}

export type LedgerEntryChange =
  | LedgerEntryChangeCreated
  | LedgerEntryChangeUpdated
  | LedgerEntryChangeRemoved
  | LedgerEntryChangeState
  | LedgerEntryChangeRestored;
export const LedgerEntryChange = LedgerEntryChangeBase;
