import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScpBallot, type ScpBallotWire } from "./scp-ballot.js";
import { Hash, type HashWire } from "./hash.js";

export interface ScpStatementConfirmWire {
  ballot: ScpBallotWire;
  nPrepared: number;
  nCommit: number;
  nH: number;
  quorumSetHash: HashWire;
}

/**
 * ```xdr
 * struct
 *         {
 *             SCPBallot ballot;   // b
 *             uint32 nPrepared;   // p.n
 *             uint32 nCommit;     // c.n
 *             uint32 nH;          // h.n
 *             Hash quorumSetHash; // D
 *         }
 * ```
 */
export class ScpStatementConfirm extends XdrValue {
  readonly ballot: ScpBallot;
  readonly nPrepared: number;
  readonly nCommit: number;
  readonly nH: number;
  readonly quorumSetHash: Hash;

  static readonly schema: XdrType<ScpStatementConfirmWire> = struct(
    "ScpStatementConfirm",
    {
      ballot: ScpBallot.schema,
      nPrepared: uint32(),
      nCommit: uint32(),
      nH: uint32(),
      quorumSetHash: Hash.schema,
    },
  );

  constructor(input: {
    ballot: ScpBallot;
    nPrepared: number;
    nCommit: number;
    nH: number;
    quorumSetHash: Hash | Uint8Array | string;
  }) {
    super();
    this.ballot = input.ballot;
    this.nPrepared = input.nPrepared;
    this.nCommit = input.nCommit;
    this.nH = input.nH;
    this.quorumSetHash =
      input.quorumSetHash instanceof Hash
        ? input.quorumSetHash
        : new Hash(input.quorumSetHash);
  }

  toXdrObject(): ScpStatementConfirmWire {
    return {
      ballot: this.ballot.toXdrObject(),
      nPrepared: this.nPrepared,
      nCommit: this.nCommit,
      nH: this.nH,
      quorumSetHash: this.quorumSetHash.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ScpStatementConfirmWire): ScpStatementConfirm {
    return new ScpStatementConfirm({
      ballot: ScpBallot.fromXdrObject(wire.ballot),
      nPrepared: wire.nPrepared,
      nCommit: wire.nCommit,
      nH: wire.nH,
      quorumSetHash: Hash.fromXdrObject(wire.quorumSetHash),
    });
  }
}
