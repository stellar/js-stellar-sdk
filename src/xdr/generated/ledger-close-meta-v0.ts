import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  LedgerHeaderHistoryEntry,
  type LedgerHeaderHistoryEntryWire,
} from "./ledger-header-history-entry.js";
import { TransactionSet, type TransactionSetWire } from "./transaction-set.js";
import {
  TransactionResultMeta,
  type TransactionResultMetaWire,
} from "./transaction-result-meta.js";
import {
  UpgradeEntryMeta,
  type UpgradeEntryMetaWire,
} from "./upgrade-entry-meta.js";
import {
  ScpHistoryEntry,
  type ScpHistoryEntryWire,
} from "./scp-history-entry.js";

export interface LedgerCloseMetaV0Wire {
  ledgerHeader: LedgerHeaderHistoryEntryWire;
  txSet: TransactionSetWire;
  txProcessing: TransactionResultMetaWire[];
  upgradesProcessing: UpgradeEntryMetaWire[];
  scpInfo: ScpHistoryEntryWire[];
}

/**
 * ```xdr
 * struct LedgerCloseMetaV0
 * {
 *     LedgerHeaderHistoryEntry ledgerHeader;
 *     // NB: txSet is sorted in "Hash order"
 *     TransactionSet txSet;
 *
 *     // NB: transactions are sorted in apply order here
 *     // fees for all transactions are processed first
 *     // followed by applying transactions
 *     TransactionResultMeta txProcessing<>;
 *
 *     // upgrades are applied last
 *     UpgradeEntryMeta upgradesProcessing<>;
 *
 *     // other misc information attached to the ledger close
 *     SCPHistoryEntry scpInfo<>;
 * };
 * ```
 */
export class LedgerCloseMetaV0 extends XdrValue {
  readonly ledgerHeader: LedgerHeaderHistoryEntry;
  readonly txSet: TransactionSet;
  readonly txProcessing: TransactionResultMeta[];
  readonly upgradesProcessing: UpgradeEntryMeta[];
  readonly scpInfo: ScpHistoryEntry[];

  static readonly schema: XdrType<LedgerCloseMetaV0Wire> = struct(
    "LedgerCloseMetaV0",
    {
      ledgerHeader: LedgerHeaderHistoryEntry.schema,
      txSet: TransactionSet.schema,
      txProcessing: array(TransactionResultMeta.schema, UNBOUNDED_MAX_LENGTH),
      upgradesProcessing: array(UpgradeEntryMeta.schema, UNBOUNDED_MAX_LENGTH),
      scpInfo: array(ScpHistoryEntry.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    ledgerHeader: LedgerHeaderHistoryEntry;
    txSet: TransactionSet;
    txProcessing: TransactionResultMeta[];
    upgradesProcessing: UpgradeEntryMeta[];
    scpInfo: ScpHistoryEntry[];
  }) {
    super();
    this.ledgerHeader = input.ledgerHeader;
    this.txSet = input.txSet;
    this.txProcessing = input.txProcessing;
    this.upgradesProcessing = input.upgradesProcessing;
    this.scpInfo = input.scpInfo;
  }

  toXdrObject(): LedgerCloseMetaV0Wire {
    return {
      ledgerHeader: this.ledgerHeader.toXdrObject(),
      txSet: this.txSet.toXdrObject(),
      txProcessing: this.txProcessing.map((v) => v.toXdrObject()),
      upgradesProcessing: this.upgradesProcessing.map((v) => v.toXdrObject()),
      scpInfo: this.scpInfo.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: LedgerCloseMetaV0Wire): LedgerCloseMetaV0 {
    return new LedgerCloseMetaV0({
      ledgerHeader: LedgerHeaderHistoryEntry.fromXdrObject(wire.ledgerHeader),
      txSet: TransactionSet.fromXdrObject(wire.txSet),
      txProcessing: wire.txProcessing.map((w) =>
        TransactionResultMeta.fromXdrObject(w),
      ),
      upgradesProcessing: wire.upgradesProcessing.map((w) =>
        UpgradeEntryMeta.fromXdrObject(w),
      ),
      scpInfo: wire.scpInfo.map((w) => ScpHistoryEntry.fromXdrObject(w)),
    });
  }
}
