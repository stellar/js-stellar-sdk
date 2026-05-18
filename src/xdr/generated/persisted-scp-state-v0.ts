import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScpEnvelope, type ScpEnvelopeWire } from "./scp-envelope.js";
import { ScpQuorumSet, type ScpQuorumSetWire } from "./scp-quorum-set.js";
import {
  StoredTransactionSet,
  type StoredTransactionSetWire,
} from "./stored-transaction-set.js";

export interface PersistedScpStateV0Wire {
  scpEnvelopes: ScpEnvelopeWire[];
  quorumSets: ScpQuorumSetWire[];
  txSets: StoredTransactionSetWire[];
}

/**
 * ```xdr
 * struct PersistedSCPStateV0
 * {
 * 	SCPEnvelope scpEnvelopes<>;
 * 	SCPQuorumSet quorumSets<>;
 * 	StoredTransactionSet txSets<>;
 * };
 * ```
 */
export class PersistedScpStateV0 extends XdrValue {
  readonly scpEnvelopes: ScpEnvelope[];
  readonly quorumSets: ScpQuorumSet[];
  readonly txSets: StoredTransactionSet[];

  static readonly schema: XdrType<PersistedScpStateV0Wire> = struct(
    "PersistedScpStateV0",
    {
      scpEnvelopes: array(ScpEnvelope.schema, UNBOUNDED_MAX_LENGTH),
      quorumSets: array(ScpQuorumSet.schema, UNBOUNDED_MAX_LENGTH),
      txSets: array(StoredTransactionSet.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    scpEnvelopes: ScpEnvelope[];
    quorumSets: ScpQuorumSet[];
    txSets: StoredTransactionSet[];
  }) {
    super();
    this.scpEnvelopes = input.scpEnvelopes;
    this.quorumSets = input.quorumSets;
    this.txSets = input.txSets;
  }

  toXdrObject(): PersistedScpStateV0Wire {
    return {
      scpEnvelopes: this.scpEnvelopes.map((v) => v.toXdrObject()),
      quorumSets: this.quorumSets.map((v) => v.toXdrObject()),
      txSets: this.txSets.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: PersistedScpStateV0Wire): PersistedScpStateV0 {
    return new PersistedScpStateV0({
      scpEnvelopes: wire.scpEnvelopes.map((w) => ScpEnvelope.fromXdrObject(w)),
      quorumSets: wire.quorumSets.map((w) => ScpQuorumSet.fromXdrObject(w)),
      txSets: wire.txSets.map((w) => StoredTransactionSet.fromXdrObject(w)),
    });
  }
}
