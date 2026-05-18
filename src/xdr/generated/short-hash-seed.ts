import { struct } from "../types/struct.js";
import { opaque } from "../types/opaque.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface ShortHashSeedWire {
  seed: Uint8Array;
}

/**
 * ```xdr
 * struct ShortHashSeed
 * {
 *     opaque seed[16];
 * };
 * ```
 */
export class ShortHashSeed extends XdrValue {
  readonly seed: Uint8Array;

  static readonly schema: XdrType<ShortHashSeedWire> = struct("ShortHashSeed", {
    seed: opaque(16),
  });

  constructor(input: { seed: Uint8Array }) {
    super();
    this.seed = input.seed;
  }

  toXdrObject(): ShortHashSeedWire {
    return {
      seed: this.seed,
    };
  }

  static fromXdrObject(wire: ShortHashSeedWire): ShortHashSeed {
    return new ShortHashSeed({
      seed: wire.seed,
    });
  }
}
