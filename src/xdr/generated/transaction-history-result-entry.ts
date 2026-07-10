import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  TransactionResultSet,
  type TransactionResultSetWire,
} from "./transaction-result-set.js";
import {
  TransactionHistoryResultEntryExt,
  type TransactionHistoryResultEntryExtWire,
} from "./transaction-history-result-entry-ext.js";

export interface TransactionHistoryResultEntryWire {
  ledgerSeq: number;
  txResultSet: TransactionResultSetWire;
  ext: TransactionHistoryResultEntryExtWire;
}

/**
 * ```xdr
 * struct TransactionHistoryResultEntry
 * {
 *     uint32 ledgerSeq;
 *     TransactionResultSet txResultSet;
 *
 *     // reserved for future use
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 *     ext;
 * };
 * ```
 */
export class TransactionHistoryResultEntry extends XdrValue {
  readonly ledgerSeq: number;
  readonly txResultSet: TransactionResultSet;
  readonly ext: TransactionHistoryResultEntryExt;

  static readonly schema: XdrType<TransactionHistoryResultEntryWire> = struct(
    "TransactionHistoryResultEntry",
    {
      ledgerSeq: uint32(),
      txResultSet: TransactionResultSet.schema,
      ext: TransactionHistoryResultEntryExt.schema,
    },
  );

  constructor(input: {
    ledgerSeq: number;
    txResultSet: TransactionResultSet;
    ext: TransactionHistoryResultEntryExt;
  }) {
    super();
    this.ledgerSeq = input.ledgerSeq;
    this.txResultSet = input.txResultSet;
    this.ext = input.ext;
  }

  toXdrObject(): TransactionHistoryResultEntryWire {
    return {
      ledgerSeq: this.ledgerSeq,
      txResultSet: this.txResultSet.toXdrObject(),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: TransactionHistoryResultEntryWire,
  ): TransactionHistoryResultEntry {
    return new TransactionHistoryResultEntry({
      ledgerSeq: wire.ledgerSeq,
      txResultSet: TransactionResultSet.fromXdrObject(wire.txResultSet),
      ext: TransactionHistoryResultEntryExt.fromXdrObject(wire.ext),
    });
  }
}
