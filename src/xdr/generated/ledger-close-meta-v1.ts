import { array, struct, uint64 } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  LedgerCloseMetaExt,
  type LedgerCloseMetaExtWire,
} from "./ledger-close-meta-ext.js";
import {
  LedgerHeaderHistoryEntry,
  type LedgerHeaderHistoryEntryWire,
} from "./ledger-header-history-entry.js";
import {
  GeneralizedTransactionSet,
  type GeneralizedTransactionSetWire,
} from "./generalized-transaction-set.js";
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
import { LedgerKey, type LedgerKeyWire } from "./ledger-key.js";
import { LedgerEntry, type LedgerEntryWire } from "./ledger-entry.js";

export interface LedgerCloseMetaV1Wire {
  ext: LedgerCloseMetaExtWire;
  ledgerHeader: LedgerHeaderHistoryEntryWire;
  txSet: GeneralizedTransactionSetWire;
  txProcessing: TransactionResultMetaWire[];
  upgradesProcessing: UpgradeEntryMetaWire[];
  scpInfo: ScpHistoryEntryWire[];
  totalByteSizeOfLiveSorobanState: bigint;
  evictedKeys: LedgerKeyWire[];
  unused: LedgerEntryWire[];
}

/**
 * ```xdr
 * struct LedgerCloseMetaV1
 * {
 *     LedgerCloseMetaExt ext;
 *
 *     LedgerHeaderHistoryEntry ledgerHeader;
 *
 *     GeneralizedTransactionSet txSet;
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
 *
 *     // Size in bytes of live Soroban state, to support downstream
 *     // systems calculating storage fees correctly.
 *     uint64 totalByteSizeOfLiveSorobanState;
 *
 *     // TTL and data/code keys that have been evicted at this ledger.
 *     LedgerKey evictedKeys<>;
 *
 *     // Maintained for backwards compatibility, should never be populated.
 *     LedgerEntry unused<>;
 * };
 * ```
 */
export class LedgerCloseMetaV1 extends XdrValue {
  readonly ext: LedgerCloseMetaExt;
  readonly ledgerHeader: LedgerHeaderHistoryEntry;
  readonly txSet: GeneralizedTransactionSet;
  readonly txProcessing: TransactionResultMeta[];
  readonly upgradesProcessing: UpgradeEntryMeta[];
  readonly scpInfo: ScpHistoryEntry[];
  readonly totalByteSizeOfLiveSorobanState: bigint;
  readonly evictedKeys: LedgerKey[];
  readonly unused: LedgerEntry[];

  static readonly schema: XdrType<LedgerCloseMetaV1Wire> = struct(
    "LedgerCloseMetaV1",
    {
      ext: LedgerCloseMetaExt.schema,
      ledgerHeader: LedgerHeaderHistoryEntry.schema,
      txSet: GeneralizedTransactionSet.schema,
      txProcessing: array(TransactionResultMeta.schema, UNBOUNDED_MAX_LENGTH),
      upgradesProcessing: array(UpgradeEntryMeta.schema, UNBOUNDED_MAX_LENGTH),
      scpInfo: array(ScpHistoryEntry.schema, UNBOUNDED_MAX_LENGTH),
      totalByteSizeOfLiveSorobanState: uint64(),
      evictedKeys: array(LedgerKey.schema, UNBOUNDED_MAX_LENGTH),
      unused: array(LedgerEntry.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    ext: LedgerCloseMetaExt;
    ledgerHeader: LedgerHeaderHistoryEntry;
    txSet: GeneralizedTransactionSet;
    txProcessing: TransactionResultMeta[];
    upgradesProcessing: UpgradeEntryMeta[];
    scpInfo: ScpHistoryEntry[];
    totalByteSizeOfLiveSorobanState: bigint;
    evictedKeys: LedgerKey[];
    unused: LedgerEntry[];
  }) {
    super();
    this.ext = input.ext;
    this.ledgerHeader = input.ledgerHeader;
    this.txSet = input.txSet;
    this.txProcessing = input.txProcessing;
    this.upgradesProcessing = input.upgradesProcessing;
    this.scpInfo = input.scpInfo;
    this.totalByteSizeOfLiveSorobanState =
      input.totalByteSizeOfLiveSorobanState;
    this.evictedKeys = input.evictedKeys;
    this.unused = input.unused;
  }

  toXdrObject(): LedgerCloseMetaV1Wire {
    return {
      ext: this.ext.toXdrObject(),
      ledgerHeader: this.ledgerHeader.toXdrObject(),
      txSet: this.txSet.toXdrObject(),
      txProcessing: this.txProcessing.map((v) => v.toXdrObject()),
      upgradesProcessing: this.upgradesProcessing.map((v) => v.toXdrObject()),
      scpInfo: this.scpInfo.map((v) => v.toXdrObject()),
      totalByteSizeOfLiveSorobanState: this.totalByteSizeOfLiveSorobanState,
      evictedKeys: this.evictedKeys.map((v) => v.toXdrObject()),
      unused: this.unused.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: LedgerCloseMetaV1Wire): LedgerCloseMetaV1 {
    return new LedgerCloseMetaV1({
      ext: LedgerCloseMetaExt.fromXdrObject(wire.ext),
      ledgerHeader: LedgerHeaderHistoryEntry.fromXdrObject(wire.ledgerHeader),
      txSet: GeneralizedTransactionSet.fromXdrObject(wire.txSet),
      txProcessing: wire.txProcessing.map((w) =>
        TransactionResultMeta.fromXdrObject(w),
      ),
      upgradesProcessing: wire.upgradesProcessing.map((w) =>
        UpgradeEntryMeta.fromXdrObject(w),
      ),
      scpInfo: wire.scpInfo.map((w) => ScpHistoryEntry.fromXdrObject(w)),
      totalByteSizeOfLiveSorobanState: wire.totalByteSizeOfLiveSorobanState,
      evictedKeys: wire.evictedKeys.map((w) => LedgerKey.fromXdrObject(w)),
      unused: wire.unused.map((w) => LedgerEntry.fromXdrObject(w)),
    });
  }
}
