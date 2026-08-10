import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  StoredTransactionSet,
  type StoredTransactionSetWire,
} from "./stored-transaction-set.js";
import { StellarValue, type StellarValueWire } from "./stellar-value.js";

export interface StoredDebugTransactionSetWire {
  txSet: StoredTransactionSetWire;
  ledgerSeq: number;
  scpValue: StellarValueWire;
}

/**
 * ```xdr
 * struct StoredDebugTransactionSet
 * {
 * 	StoredTransactionSet txSet;
 * 	uint32 ledgerSeq;
 * 	StellarValue scpValue;
 * };
 * ```
 */
export class StoredDebugTransactionSet extends XdrValue {
  readonly txSet: StoredTransactionSet;
  readonly ledgerSeq: number;
  readonly scpValue: StellarValue;

  static readonly schema: XdrType<StoredDebugTransactionSetWire> = struct(
    "StoredDebugTransactionSet",
    {
      txSet: StoredTransactionSet.schema,
      ledgerSeq: uint32(),
      scpValue: StellarValue.schema,
    },
  );

  constructor(input: {
    txSet: StoredTransactionSet;
    ledgerSeq: number;
    scpValue: StellarValue;
  }) {
    super();
    this.txSet = input.txSet;
    this.ledgerSeq = input.ledgerSeq;
    this.scpValue = input.scpValue;
  }

  toXdrObject(): StoredDebugTransactionSetWire {
    return {
      txSet: this.txSet.toXdrObject(),
      ledgerSeq: this.ledgerSeq,
      scpValue: this.scpValue.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: StoredDebugTransactionSetWire,
  ): StoredDebugTransactionSet {
    return new StoredDebugTransactionSet({
      txSet: StoredTransactionSet.fromXdrObject(wire.txSet),
      ledgerSeq: wire.ledgerSeq,
      scpValue: StellarValue.fromXdrObject(wire.scpValue),
    });
  }
}
