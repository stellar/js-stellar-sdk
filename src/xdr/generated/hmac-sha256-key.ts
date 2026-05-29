import { struct } from "../types/struct.js";
import { opaque } from "../types/opaque.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface HmacSha256KeyWire {
  key: Uint8Array;
}

/**
 * ```xdr
 * struct HmacSha256Key
 * {
 *     opaque key[32];
 * };
 * ```
 */
export class HmacSha256Key extends XdrValue {
  readonly key: Uint8Array;

  static readonly schema: XdrType<HmacSha256KeyWire> = struct("HmacSha256Key", {
    key: opaque(32),
  });

  constructor(input: { key: Uint8Array }) {
    super();
    this.key = input.key;
  }

  toXdrObject(): HmacSha256KeyWire {
    return {
      key: this.key,
    };
  }

  static fromXdrObject(wire: HmacSha256KeyWire): HmacSha256Key {
    return new HmacSha256Key({
      key: wire.key,
    });
  }
}
