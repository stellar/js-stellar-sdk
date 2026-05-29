import { struct } from "../types/struct.js";
import { opaque } from "../types/opaque.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface Curve25519PublicWire {
  key: Uint8Array;
}

/**
 * ```xdr
 * struct Curve25519Public
 * {
 *     opaque key[32];
 * };
 * ```
 */
export class Curve25519Public extends XdrValue {
  readonly key: Uint8Array;

  static readonly schema: XdrType<Curve25519PublicWire> = struct(
    "Curve25519Public",
    {
      key: opaque(32),
    },
  );

  constructor(input: { key: Uint8Array }) {
    super();
    this.key = input.key;
  }

  toXdrObject(): Curve25519PublicWire {
    return {
      key: this.key,
    };
  }

  static fromXdrObject(wire: Curve25519PublicWire): Curve25519Public {
    return new Curve25519Public({
      key: wire.key,
    });
  }
}
