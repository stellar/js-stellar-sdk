import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import {
  TransactionPhase,
  type TransactionPhaseWire,
} from "./transaction-phase.js";

export interface TransactionSetV1Wire {
  previousLedgerHash: HashWire;
  phases: TransactionPhaseWire[];
}

/**
 * ```xdr
 * struct TransactionSetV1
 * {
 *     Hash previousLedgerHash;
 *     TransactionPhase phases<>;
 * };
 * ```
 */
export class TransactionSetV1 extends XdrValue {
  readonly previousLedgerHash: Hash;
  readonly phases: TransactionPhase[];

  static readonly schema: XdrType<TransactionSetV1Wire> = struct(
    "TransactionSetV1",
    {
      previousLedgerHash: Hash.schema,
      phases: array(TransactionPhase.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    previousLedgerHash: Hash | Uint8Array | string;
    phases: TransactionPhase[];
  }) {
    super();
    this.previousLedgerHash =
      input.previousLedgerHash instanceof Hash
        ? input.previousLedgerHash
        : new Hash(input.previousLedgerHash);
    this.phases = input.phases;
  }

  toXdrObject(): TransactionSetV1Wire {
    return {
      previousLedgerHash: this.previousLedgerHash.toXdrObject(),
      phases: this.phases.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: TransactionSetV1Wire): TransactionSetV1 {
    return new TransactionSetV1({
      previousLedgerHash: Hash.fromXdrObject(wire.previousLedgerHash),
      phases: wire.phases.map((w) => TransactionPhase.fromXdrObject(w)),
    });
  }
}
