import { struct } from "../types/struct.js";
import { option } from "../types/option.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import { ScpBallot, type ScpBallotWire } from "./scp-ballot.js";

export interface ScpStatementPrepareWire {
  quorumSetHash: HashWire;
  ballot: ScpBallotWire;
  prepared: ScpBallotWire | null;
  preparedPrime: ScpBallotWire | null;
  nC: number;
  nH: number;
}

/**
 * ```xdr
 * struct
 *         {
 *             Hash quorumSetHash;       // D
 *             SCPBallot ballot;         // b
 *             SCPBallot* prepared;      // p
 *             SCPBallot* preparedPrime; // p'
 *             uint32 nC;                // c.n
 *             uint32 nH;                // h.n
 *         }
 * ```
 */
export class ScpStatementPrepare extends XdrValue {
  readonly quorumSetHash: Hash;
  readonly ballot: ScpBallot;
  readonly prepared: ScpBallot | null;
  readonly preparedPrime: ScpBallot | null;
  readonly nC: number;
  readonly nH: number;

  static readonly schema: XdrType<ScpStatementPrepareWire> = struct(
    "ScpStatementPrepare",
    {
      quorumSetHash: Hash.schema,
      ballot: ScpBallot.schema,
      prepared: option(ScpBallot.schema),
      preparedPrime: option(ScpBallot.schema),
      nC: uint32(),
      nH: uint32(),
    },
  );

  constructor(input: {
    quorumSetHash: Hash | Uint8Array | string;
    ballot: ScpBallot;
    prepared: ScpBallot | null;
    preparedPrime: ScpBallot | null;
    nC: number;
    nH: number;
  }) {
    super();
    this.quorumSetHash =
      input.quorumSetHash instanceof Hash
        ? input.quorumSetHash
        : new Hash(input.quorumSetHash);
    this.ballot = input.ballot;
    this.prepared = input.prepared;
    this.preparedPrime = input.preparedPrime;
    this.nC = input.nC;
    this.nH = input.nH;
  }

  toXdrObject(): ScpStatementPrepareWire {
    return {
      quorumSetHash: this.quorumSetHash.toXdrObject(),
      ballot: this.ballot.toXdrObject(),
      prepared: this.prepared === null ? null : this.prepared.toXdrObject(),
      preparedPrime:
        this.preparedPrime === null ? null : this.preparedPrime.toXdrObject(),
      nC: this.nC,
      nH: this.nH,
    };
  }

  static fromXdrObject(wire: ScpStatementPrepareWire): ScpStatementPrepare {
    return new ScpStatementPrepare({
      quorumSetHash: Hash.fromXdrObject(wire.quorumSetHash),
      ballot: ScpBallot.fromXdrObject(wire.ballot),
      prepared:
        wire.prepared === null ? null : ScpBallot.fromXdrObject(wire.prepared),
      preparedPrime:
        wire.preparedPrime === null
          ? null
          : ScpBallot.fromXdrObject(wire.preparedPrime),
      nC: wire.nC,
      nH: wire.nH,
    });
  }
}
