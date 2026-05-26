import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";

export interface FreezeBypassTxsDeltaWire {
  addTxs: HashWire[];
  removeTxs: HashWire[];
}

/**
 * ```xdr
 * struct FreezeBypassTxsDelta {
 *     Hash addTxs<>;
 *     Hash removeTxs<>;
 * };
 * ```
 */
export class FreezeBypassTxsDelta extends XdrValue {
  readonly addTxs: Hash[];
  readonly removeTxs: Hash[];

  static readonly schema: XdrType<FreezeBypassTxsDeltaWire> = struct(
    "FreezeBypassTxsDelta",
    {
      addTxs: array(Hash.schema, UNBOUNDED_MAX_LENGTH),
      removeTxs: array(Hash.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    addTxs: (Hash | Uint8Array | string)[];
    removeTxs: (Hash | Uint8Array | string)[];
  }) {
    super();
    this.addTxs = input.addTxs.map((v) =>
      v instanceof Hash ? v : new Hash(v),
    );
    this.removeTxs = input.removeTxs.map((v) =>
      v instanceof Hash ? v : new Hash(v),
    );
  }

  toXdrObject(): FreezeBypassTxsDeltaWire {
    return {
      addTxs: this.addTxs.map((v) => v.toXdrObject()),
      removeTxs: this.removeTxs.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: FreezeBypassTxsDeltaWire): FreezeBypassTxsDelta {
    return new FreezeBypassTxsDelta({
      addTxs: wire.addTxs.map((w) => Hash.fromXdrObject(w)),
      removeTxs: wire.removeTxs.map((w) => Hash.fromXdrObject(w)),
    });
  }
}
