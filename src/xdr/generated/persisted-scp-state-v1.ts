import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ScpEnvelope, type ScpEnvelopeWire } from "./scp-envelope.js";
import { ScpQuorumSet, type ScpQuorumSetWire } from "./scp-quorum-set.js";

export interface PersistedScpStateV1Wire {
  scpEnvelopes: ScpEnvelopeWire[];
  quorumSets: ScpQuorumSetWire[];
}

/**
 * ```xdr
 * struct PersistedSCPStateV1
 * {
 * 	// Tx sets are saved separately
 * 	SCPEnvelope scpEnvelopes<>;
 * 	SCPQuorumSet quorumSets<>;
 * };
 * ```
 */
export class PersistedScpStateV1 extends XdrValue {
  readonly scpEnvelopes: ScpEnvelope[];
  readonly quorumSets: ScpQuorumSet[];

  static readonly schema: XdrType<PersistedScpStateV1Wire> = struct(
    "PersistedScpStateV1",
    {
      scpEnvelopes: array(ScpEnvelope.schema, UNBOUNDED_MAX_LENGTH),
      quorumSets: array(ScpQuorumSet.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    scpEnvelopes: ScpEnvelope[];
    quorumSets: ScpQuorumSet[];
  }) {
    super();
    this.scpEnvelopes = input.scpEnvelopes;
    this.quorumSets = input.quorumSets;
  }

  toXdrObject(): PersistedScpStateV1Wire {
    return {
      scpEnvelopes: this.scpEnvelopes.map((v) => v.toXdrObject()),
      quorumSets: this.quorumSets.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: PersistedScpStateV1Wire): PersistedScpStateV1 {
    return new PersistedScpStateV1({
      scpEnvelopes: wire.scpEnvelopes.map((w) => ScpEnvelope.fromXdrObject(w)),
      quorumSets: wire.quorumSets.map((w) => ScpQuorumSet.fromXdrObject(w)),
    });
  }
}
