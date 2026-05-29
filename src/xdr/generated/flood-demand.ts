import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
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
    txHashes: array(Hash.schema, UNBOUNDED_MAX_LENGTH),
  });

  constructor(input: { txHashes: Hash[] }) {
    super();
    this.txHashes = input.txHashes;
  }

  toXdrObject(): FloodDemandWire {
    return {
      txHashes: this.txHashes.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: FloodDemandWire): FloodDemand {
    return new FloodDemand({
      txHashes: wire.txHashes.map((w) => Hash.fromXdrObject(w)),
    });
  }
}
