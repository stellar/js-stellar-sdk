import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";

export interface FreezeBypassTxsWire {
  txHashes: HashWire[];
}

/**
 * ```xdr
 * struct FreezeBypassTxs {
 *     Hash txHashes<>;
 * };
 * ```
 */
export class FreezeBypassTxs extends XdrValue {
  readonly txHashes: Hash[];

  static readonly schema: XdrType<FreezeBypassTxsWire> = struct(
    "FreezeBypassTxs",
    {
      txHashes: array(Hash.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: { txHashes: Hash[] }) {
    super();
    this.txHashes = input.txHashes;
  }

  toXdrObject(): FreezeBypassTxsWire {
    return {
      txHashes: this.txHashes.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: FreezeBypassTxsWire): FreezeBypassTxs {
    return new FreezeBypassTxs({
      txHashes: wire.txHashes.map((w) => Hash.fromXdrObject(w)),
    });
  }
}
