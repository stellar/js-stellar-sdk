import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { TransactionSet, type TransactionSetWire } from "./transaction-set.js";
import {
  TransactionHistoryEntryExt,
  type TransactionHistoryEntryExtWire,
} from "./transaction-history-entry-ext.js";

export interface TransactionHistoryEntryWire {
  ledgerSeq: number;
  txSet: TransactionSetWire;
  ext: TransactionHistoryEntryExtWire;
}

/**
 * ```xdr
 * struct TransactionHistoryEntry
 * {
 *     uint32 ledgerSeq;
 *     TransactionSet txSet;
 *
 *     // when v != 0, txSet must be empty
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         GeneralizedTransactionSet generalizedTxSet;
 *     }
 *     ext;
 * };
 * ```
 */
export class TransactionHistoryEntry extends XdrValue {
  readonly ledgerSeq: number;
  readonly txSet: TransactionSet;
  readonly ext: TransactionHistoryEntryExt;

  static readonly schema: XdrType<TransactionHistoryEntryWire> = struct(
    "TransactionHistoryEntry",
    {
      ledgerSeq: uint32(),
      txSet: TransactionSet.schema,
      ext: TransactionHistoryEntryExt.schema,
    },
  );

  constructor(input: {
    ledgerSeq: number;
    txSet: TransactionSet;
    ext: TransactionHistoryEntryExt;
  }) {
    super();
    this.ledgerSeq = input.ledgerSeq;
    this.txSet = input.txSet;
    this.ext = input.ext;
  }

  toXdrObject(): TransactionHistoryEntryWire {
    return {
      ledgerSeq: this.ledgerSeq,
      txSet: this.txSet.toXdrObject(),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: TransactionHistoryEntryWire,
  ): TransactionHistoryEntry {
    return new TransactionHistoryEntry({
      ledgerSeq: wire.ledgerSeq,
      txSet: TransactionSet.fromXdrObject(wire.txSet),
      ext: TransactionHistoryEntryExt.fromXdrObject(wire.ext),
    });
  }
}
