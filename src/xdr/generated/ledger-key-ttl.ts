import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";

export interface LedgerKeyTtlWire {
  keyHash: HashWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         // Hash of the LedgerKey that is associated with this TTLEntry
 *         Hash keyHash;
 *     }
 * ```
 */
export class LedgerKeyTtl extends XdrValue {
  readonly keyHash: Hash;

  static readonly schema: XdrType<LedgerKeyTtlWire> = struct("LedgerKeyTtl", {
    keyHash: Hash.schema,
  });

  constructor(input: { keyHash: Hash | Uint8Array | string }) {
    super();
    this.keyHash =
      input.keyHash instanceof Hash ? input.keyHash : new Hash(input.keyHash);
  }

  toXdrObject(): LedgerKeyTtlWire {
    return {
      keyHash: this.keyHash.toXdrObject(),
    };
  }

  static fromXdrObject(wire: LedgerKeyTtlWire): LedgerKeyTtl {
    return new LedgerKeyTtl({
      keyHash: Hash.fromXdrObject(wire.keyHash),
    });
  }
}
