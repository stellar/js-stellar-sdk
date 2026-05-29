import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { uint64 } from "../types/uint64.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
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
  TransactionResultMetaV1,
  type TransactionResultMetaV1Wire,
} from "./transaction-result-meta-v1.js";
import {
  UpgradeEntryMeta,
  type UpgradeEntryMetaWire,
} from "./upgrade-entry-meta.js";
import {
  ScpHistoryEntry,
  type ScpHistoryEntryWire,
} from "./scp-history-entry.js";
import { LedgerKey, type LedgerKeyWire } from "./ledger-key.js";

export interface LedgerCloseMetaV2Wire {
  ext: LedgerCloseMetaExtWire;
  ledgerHeader: LedgerHeaderHistoryEntryWire;
  txSet: GeneralizedTransactionSetWire;
  txProcessing: TransactionResultMetaV1Wire[];
  upgradesProcessing: UpgradeEntryMetaWire[];
  scpInfo: ScpHistoryEntryWire[];
  totalByteSizeOfLiveSorobanState: bigint;
  evictedKeys: LedgerKeyWire[];
}

/**
 * ```xdr
 * struct LedgerCloseMetaV2
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
 *     TransactionResultMetaV1 txProcessing<>;
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
 * };
 * ```
 */
export class LedgerCloseMetaV2 extends XdrValue {
  readonly ext: LedgerCloseMetaExt;
  readonly ledgerHeader: LedgerHeaderHistoryEntry;
  readonly txSet: GeneralizedTransactionSet;
  readonly txProcessing: TransactionResultMetaV1[];
  readonly upgradesProcessing: UpgradeEntryMeta[];
  readonly scpInfo: ScpHistoryEntry[];
  readonly totalByteSizeOfLiveSorobanState: bigint;
  readonly evictedKeys: LedgerKey[];

  static readonly schema: XdrType<LedgerCloseMetaV2Wire> = struct(
    "LedgerCloseMetaV2",
    {
      ext: LedgerCloseMetaExt.schema,
      ledgerHeader: LedgerHeaderHistoryEntry.schema,
      txSet: GeneralizedTransactionSet.schema,
      txProcessing: array(TransactionResultMetaV1.schema, UNBOUNDED_MAX_LENGTH),
      upgradesProcessing: array(UpgradeEntryMeta.schema, UNBOUNDED_MAX_LENGTH),
      scpInfo: array(ScpHistoryEntry.schema, UNBOUNDED_MAX_LENGTH),
      totalByteSizeOfLiveSorobanState: uint64(),
      evictedKeys: array(LedgerKey.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    ext: LedgerCloseMetaExt;
    ledgerHeader: LedgerHeaderHistoryEntry;
    txSet: GeneralizedTransactionSet;
    txProcessing: TransactionResultMetaV1[];
    upgradesProcessing: UpgradeEntryMeta[];
    scpInfo: ScpHistoryEntry[];
    totalByteSizeOfLiveSorobanState: bigint;
    evictedKeys: LedgerKey[];
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
  }

  toXdrObject(): LedgerCloseMetaV2Wire {
    return {
      ext: this.ext.toXdrObject(),
      ledgerHeader: this.ledgerHeader.toXdrObject(),
      txSet: this.txSet.toXdrObject(),
      txProcessing: this.txProcessing.map((v) => v.toXdrObject()),
      upgradesProcessing: this.upgradesProcessing.map((v) => v.toXdrObject()),
      scpInfo: this.scpInfo.map((v) => v.toXdrObject()),
      totalByteSizeOfLiveSorobanState: this.totalByteSizeOfLiveSorobanState,
      evictedKeys: this.evictedKeys.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: LedgerCloseMetaV2Wire): LedgerCloseMetaV2 {
    return new LedgerCloseMetaV2({
      ext: LedgerCloseMetaExt.fromXdrObject(wire.ext),
      ledgerHeader: LedgerHeaderHistoryEntry.fromXdrObject(wire.ledgerHeader),
      txSet: GeneralizedTransactionSet.fromXdrObject(wire.txSet),
      txProcessing: wire.txProcessing.map((w) =>
        TransactionResultMetaV1.fromXdrObject(w),
      ),
      upgradesProcessing: wire.upgradesProcessing.map((w) =>
        UpgradeEntryMeta.fromXdrObject(w),
      ),
      scpInfo: wire.scpInfo.map((w) => ScpHistoryEntry.fromXdrObject(w)),
      totalByteSizeOfLiveSorobanState: wire.totalByteSizeOfLiveSorobanState,
      evictedKeys: wire.evictedKeys.map((w) => LedgerKey.fromXdrObject(w)),
    });
  }
}
