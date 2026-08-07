import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";

export interface LedgerKeyContractCodeWire {
  hash: HashWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         Hash hash;
 *     }
 * ```
 */
export class LedgerKeyContractCode extends XdrValue {
  readonly hash: Hash;

  static readonly schema: XdrType<LedgerKeyContractCodeWire> = struct(
    "LedgerKeyContractCode",
    {
      hash: Hash.schema,
    },
  );

  constructor(input: { hash: Hash | Uint8Array | string }) {
    super();
    this.hash = input.hash instanceof Hash ? input.hash : new Hash(input.hash);
  }

  toXdrObject(): LedgerKeyContractCodeWire {
    return {
      hash: this.hash.toXdrObject(),
    };
  }

  static fromXdrObject(wire: LedgerKeyContractCodeWire): LedgerKeyContractCode {
    return new LedgerKeyContractCode({
      hash: Hash.fromXdrObject(wire.hash),
    });
  }
}
