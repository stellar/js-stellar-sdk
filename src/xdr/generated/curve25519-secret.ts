import { struct } from "../types/struct.js";
import { opaque } from "../types/opaque.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface Curve25519SecretWire {
  key: Uint8Array;
}

/**
 * ```xdr
 * struct Curve25519Secret
 * {
 *     opaque key[32];
 * };
 * ```
 */
export class Curve25519Secret extends XdrValue {
  readonly key: Uint8Array;

  static readonly schema: XdrType<Curve25519SecretWire> = struct(
    "Curve25519Secret",
    {
      key: opaque(32),
    },
  );

  constructor(input: { key: Uint8Array }) {
    super();
    this.key = input.key;
  }

  toXdrObject(): Curve25519SecretWire {
    return {
      key: this.key,
    };
  }

  static fromXdrObject(wire: Curve25519SecretWire): Curve25519Secret {
    return new Curve25519Secret({
      key: wire.key,
    });
  }
}
