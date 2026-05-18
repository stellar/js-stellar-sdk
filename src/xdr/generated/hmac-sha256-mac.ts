import { struct } from "../types/struct.js";
import { opaque } from "../types/opaque.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface HmacSha256MacWire {
  mac: Uint8Array;
}

/**
 * ```xdr
 * struct HmacSha256Mac
 * {
 *     opaque mac[32];
 * };
 * ```
 */
export class HmacSha256Mac extends XdrValue {
  readonly mac: Uint8Array;

  static readonly schema: XdrType<HmacSha256MacWire> = struct("HmacSha256Mac", {
    mac: opaque(32),
  });

  constructor(input: { mac: Uint8Array }) {
    super();
    this.mac = input.mac;
  }

  toXdrObject(): HmacSha256MacWire {
    return {
      mac: this.mac,
    };
  }

  static fromXdrObject(wire: HmacSha256MacWire): HmacSha256Mac {
    return new HmacSha256Mac({
      mac: wire.mac,
    });
  }
}
