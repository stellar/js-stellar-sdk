import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { LedgerUpgrade, type LedgerUpgradeWire } from "./ledger-upgrade.js";
import {
  LedgerEntryChange,
  type LedgerEntryChangeWire,
} from "./ledger-entry-change.js";

export interface UpgradeEntryMetaWire {
  upgrade: LedgerUpgradeWire;
  changes: LedgerEntryChangeWire[];
}

/**
 * ```xdr
 * struct UpgradeEntryMeta
 * {
 *     LedgerUpgrade upgrade;
 *     LedgerEntryChanges changes;
 * };
 * ```
 */
export class UpgradeEntryMeta extends XdrValue {
  readonly upgrade: LedgerUpgrade;
  readonly changes: LedgerEntryChange[];

  static readonly schema: XdrType<UpgradeEntryMetaWire> = struct(
    "UpgradeEntryMeta",
    {
      upgrade: LedgerUpgrade.schema,
      changes: array(LedgerEntryChange.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: { upgrade: LedgerUpgrade; changes: LedgerEntryChange[] }) {
    super();
    this.upgrade = input.upgrade;
    this.changes = input.changes;
  }

  toXdrObject(): UpgradeEntryMetaWire {
    return {
      upgrade: this.upgrade.toXdrObject(),
      changes: this.changes.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: UpgradeEntryMetaWire): UpgradeEntryMeta {
    return new UpgradeEntryMeta({
      upgrade: LedgerUpgrade.fromXdrObject(wire.upgrade),
      changes: wire.changes.map((w) => LedgerEntryChange.fromXdrObject(w)),
    });
  }
}
