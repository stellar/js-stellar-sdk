import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface ScSpecTypeBytesNWire {
  n: number;
}

/**
 * ```xdr
 * struct SCSpecTypeBytesN
 * {
 *     uint32 n;
 * };
 * ```
 */
export class ScSpecTypeBytesN extends XdrValue {
  readonly n: number;

  static readonly schema: XdrType<ScSpecTypeBytesNWire> = struct(
    "ScSpecTypeBytesN",
    {
      n: uint32(),
    },
  );

  constructor(input: { n: number }) {
    super();
    this.n = input.n;
  }

  toXdrObject(): ScSpecTypeBytesNWire {
    return {
      n: this.n,
    };
  }

  static fromXdrObject(wire: ScSpecTypeBytesNWire): ScSpecTypeBytesN {
    return new ScSpecTypeBytesN({
      n: wire.n,
    });
  }
}
