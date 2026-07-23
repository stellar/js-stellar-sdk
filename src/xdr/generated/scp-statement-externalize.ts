import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ScpBallot, type ScpBallotWire } from "./scp-ballot.js";
import { Hash, type HashWire } from "./hash.js";

export interface ScpStatementExternalizeWire {
  commit: ScpBallotWire;
  nH: number;
  commitQuorumSetHash: HashWire;
}

/**
 * ```xdr
 * struct
 *         {
 *             SCPBallot commit;         // c
 *             uint32 nH;                // h.n
 *             Hash commitQuorumSetHash; // D used before EXTERNALIZE
 *         }
 * ```
 */
export class ScpStatementExternalize extends XdrValue {
  readonly commit: ScpBallot;
  readonly nH: number;
  readonly commitQuorumSetHash: Hash;

  static readonly schema: XdrType<ScpStatementExternalizeWire> = struct(
    "ScpStatementExternalize",
    {
      commit: ScpBallot.schema,
      nH: uint32(),
      commitQuorumSetHash: Hash.schema,
    },
  );

  constructor(input: {
    commit: ScpBallot;
    nH: number;
    commitQuorumSetHash: Hash | Uint8Array | string;
  }) {
    super();
    this.commit = input.commit;
    this.nH = input.nH;
    this.commitQuorumSetHash =
      input.commitQuorumSetHash instanceof Hash
        ? input.commitQuorumSetHash
        : new Hash(input.commitQuorumSetHash);
  }

  toXdrObject(): ScpStatementExternalizeWire {
    return {
      commit: this.commit.toXdrObject(),
      nH: this.nH,
      commitQuorumSetHash: this.commitQuorumSetHash.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: ScpStatementExternalizeWire,
  ): ScpStatementExternalize {
    return new ScpStatementExternalize({
      commit: ScpBallot.fromXdrObject(wire.commit),
      nH: wire.nH,
      commitQuorumSetHash: Hash.fromXdrObject(wire.commitQuorumSetHash),
    });
  }
}
