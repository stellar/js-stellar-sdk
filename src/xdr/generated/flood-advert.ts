import { array, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { OWNED } from "../values/owned.js";
import { Hash, type HashWire } from "./hash.js";

export interface FloodAdvertWire {
  txHashes: HashWire[];
}

/**
 * ```xdr
 * struct FloodAdvert
 * {
 *     TxAdvertVector txHashes;
 * };
 * ```
 */
export class FloodAdvert extends XdrValue {
  readonly txHashes: Hash[];

  static readonly schema: XdrType<FloodAdvertWire> = struct("FloodAdvert", {
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
        : input.txHashes.map((v) => (v instanceof Hash ? v : new Hash(v)));
  }

  toXdrObject(): FloodAdvertWire {
    return {
      txHashes: this.txHashes.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: FloodAdvertWire): FloodAdvert {
    return new FloodAdvert(
      {
        txHashes: wire.txHashes.map((w) => Hash.fromXdrObject(w)),
      },
      OWNED,
    );
  }
}
