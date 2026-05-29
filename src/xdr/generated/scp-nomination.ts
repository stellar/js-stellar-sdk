import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import { Value, type ValueWire } from "./value.js";

export interface ScpNominationWire {
  quorumSetHash: HashWire;
  votes: ValueWire[];
  accepted: ValueWire[];
}

/**
 * ```xdr
 * struct SCPNomination
 * {
 *     Hash quorumSetHash; // D
 *     Value votes<>;      // X
 *     Value accepted<>;   // Y
 * };
 * ```
 */
export class ScpNomination extends XdrValue {
  readonly quorumSetHash: Hash;
  readonly votes: Value[];
  readonly accepted: Value[];

  static readonly schema: XdrType<ScpNominationWire> = struct("ScpNomination", {
    quorumSetHash: Hash.schema,
    votes: array(Value.schema, UNBOUNDED_MAX_LENGTH),
    accepted: array(Value.schema, UNBOUNDED_MAX_LENGTH),
  });

  constructor(input: {
    quorumSetHash: Hash | Uint8Array | string;
    votes: (Value | Uint8Array | string)[];
    accepted: (Value | Uint8Array | string)[];
  }) {
    super();
    this.quorumSetHash =
      input.quorumSetHash instanceof Hash
        ? input.quorumSetHash
        : new Hash(input.quorumSetHash);
    this.votes = input.votes.map((v) =>
      v instanceof Value ? v : new Value(v),
    );
    this.accepted = input.accepted.map((v) =>
      v instanceof Value ? v : new Value(v),
    );
  }

  toXdrObject(): ScpNominationWire {
    return {
      quorumSetHash: this.quorumSetHash.toXdrObject(),
      votes: this.votes.map((v) => v.toXdrObject()),
      accepted: this.accepted.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: ScpNominationWire): ScpNomination {
    return new ScpNomination({
      quorumSetHash: Hash.fromXdrObject(wire.quorumSetHash),
      votes: wire.votes.map((w) => Value.fromXdrObject(w)),
      accepted: wire.accepted.map((w) => Value.fromXdrObject(w)),
    });
  }
}
