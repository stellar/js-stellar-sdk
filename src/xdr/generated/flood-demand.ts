import { array, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { OWNED, copyArray } from "../values/owned.js";
import { Hash, type HashWire } from "./hash.js";

export interface FloodDemandWire {
  txHashes: HashWire[];
}

/**
 * ```xdr
 * struct FloodDemand
 * {
 *     TxDemandVector txHashes;
 * };
 * ```
 */
export class FloodDemand extends XdrValue {
  readonly txHashes: Hash[];

  static readonly schema: XdrType<FloodDemandWire> = struct("FloodDemand", {
    txHashes: array(Hash.schema, 1000),
  });

  constructor(
    input: {
      txHashes: Hash[];
    },
    owned?: typeof OWNED,
  ) {
    super();
    this.txHashes =
      owned === OWNED
        ? input.txHashes
        : copyArray(input.txHashes, (v) =>
            v instanceof Hash ? v : new Hash(v),
          );
  }

  toXdrObject(): FloodDemandWire {
    return {
      txHashes: this.txHashes.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: FloodDemandWire): FloodDemand {
    return new FloodDemand(
      {
        txHashes: wire.txHashes.map((w) => Hash.fromXdrObject(w)),
      },
      OWNED,
    );
  }
}
