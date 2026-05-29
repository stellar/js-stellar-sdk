import { struct } from "../types/struct.js";
import { uint64 } from "../types/uint64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface Uint256PartsWire {
  hiHi: bigint;
  hiLo: bigint;
  loHi: bigint;
  loLo: bigint;
}

/**
 * ```xdr
 * struct UInt256Parts {
 *     uint64 hi_hi;
 *     uint64 hi_lo;
 *     uint64 lo_hi;
 *     uint64 lo_lo;
 * };
 * ```
 */
export class Uint256Parts extends XdrValue {
  readonly hiHi: bigint;
  readonly hiLo: bigint;
  readonly loHi: bigint;
  readonly loLo: bigint;

  static readonly schema: XdrType<Uint256PartsWire> = struct("Uint256Parts", {
    hiHi: uint64(),
    hiLo: uint64(),
    loHi: uint64(),
    loLo: uint64(),
  });

  constructor(input: {
    hiHi: bigint;
    hiLo: bigint;
    loHi: bigint;
    loLo: bigint;
  }) {
    super();
    this.hiHi = input.hiHi;
    this.hiLo = input.hiLo;
    this.loHi = input.loHi;
    this.loLo = input.loLo;
  }

  toXdrObject(): Uint256PartsWire {
    return {
      hiHi: this.hiHi,
      hiLo: this.hiLo,
      loHi: this.loHi,
      loLo: this.loLo,
    };
  }

  static fromXdrObject(wire: Uint256PartsWire): Uint256Parts {
    return new Uint256Parts({
      hiHi: wire.hiHi,
      hiLo: wire.hiLo,
      loHi: wire.loHi,
      loLo: wire.loLo,
    });
  }
}
