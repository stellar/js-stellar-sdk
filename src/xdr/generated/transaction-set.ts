import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import {
  TransactionEnvelope,
  type TransactionEnvelopeWire,
} from "./transaction-envelope.js";

export interface TransactionSetWire {
  previousLedgerHash: HashWire;
  txs: TransactionEnvelopeWire[];
}

/**
 * ```xdr
 * struct TransactionSet
 * {
 *     Hash previousLedgerHash;
 *     TransactionEnvelope txs<>;
 * };
 * ```
 */
export class TransactionSet extends XdrValue {
  readonly previousLedgerHash: Hash;
  readonly txs: TransactionEnvelope[];

  static readonly schema: XdrType<TransactionSetWire> = struct(
    "TransactionSet",
    {
      previousLedgerHash: Hash.schema,
      txs: array(TransactionEnvelope.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    previousLedgerHash: Hash | Uint8Array | string;
    txs: TransactionEnvelope[];
  }) {
    super();
    this.previousLedgerHash =
      input.previousLedgerHash instanceof Hash
        ? input.previousLedgerHash
        : new Hash(input.previousLedgerHash);
    this.txs = input.txs;
  }

  toXdrObject(): TransactionSetWire {
    return {
      previousLedgerHash: this.previousLedgerHash.toXdrObject(),
      txs: this.txs.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: TransactionSetWire): TransactionSet {
    return new TransactionSet({
      previousLedgerHash: Hash.fromXdrObject(wire.previousLedgerHash),
      txs: wire.txs.map((w) => TransactionEnvelope.fromXdrObject(w)),
    });
  }
}
