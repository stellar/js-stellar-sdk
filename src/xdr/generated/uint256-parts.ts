import {
  bigIntTo256Parts,
  check256Parts,
  checkBigInt,
  partsTo256BigInt,
} from "../values/bigint-parts.js";
import { struct, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
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

  /** The integer these parts encode. Throws if a limb is out of range. */
  toBigInt(): bigint {
    return partsTo256BigInt(check256Parts(this, false, "Uint256Parts"), false);
  }

  /** Splits `value` into parts. Throws unless it is a bigint in range. */
  static fromBigInt(value: bigint): Uint256Parts {
    const checked = checkBigInt(value, false, 256, "Uint256");
    return new Uint256Parts(bigIntTo256Parts(checked, false));
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
