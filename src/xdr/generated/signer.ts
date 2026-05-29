import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { SignerKey, type SignerKeyWire } from "./signer-key.js";

export interface SignerWire {
  key: SignerKeyWire;
  weight: number;
}

/**
 * ```xdr
 * struct Signer
 * {
 *     SignerKey key;
 *     uint32 weight; // really only need 1 byte
 * };
 * ```
 */
export class Signer extends XdrValue {
  readonly key: SignerKey;
  readonly weight: number;

  static readonly schema: XdrType<SignerWire> = struct("Signer", {
    key: SignerKey.schema,
    weight: uint32(),
  });

  constructor(input: { key: SignerKey; weight: number }) {
    super();
    this.key = input.key;
    this.weight = input.weight;
  }

  toXdrObject(): SignerWire {
    return {
      key: this.key.toXdrObject(),
      weight: this.weight,
    };
  }

  static fromXdrObject(wire: SignerWire): Signer {
    return new Signer({
      key: SignerKey.fromXdrObject(wire.key),
      weight: wire.weight,
    });
  }
}
