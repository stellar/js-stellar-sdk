import {
  bigIntTo256Parts,
  check256Parts,
  checkBigInt,
  partsTo256BigInt,
} from "../values/bigint-parts.js";
import { int64, struct, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface Int256PartsWire {
  hiHi: bigint;
  hiLo: bigint;
  loHi: bigint;
  loLo: bigint;
}

/**
 * ```xdr
 * struct Int256Parts {
 *     int64 hi_hi;
 *     uint64 hi_lo;
 *     uint64 lo_hi;
 *     uint64 lo_lo;
 * };
 * ```
 */
export class Int256Parts extends XdrValue {
  readonly hiHi: bigint;
  readonly hiLo: bigint;
  readonly loHi: bigint;
  readonly loLo: bigint;

  static readonly schema: XdrType<Int256PartsWire> = struct("Int256Parts", {
    hiHi: int64(),
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

  toXdrObject(): Int256PartsWire {
    return {
      hiHi: this.hiHi,
      hiLo: this.hiLo,
      loHi: this.loHi,
      loLo: this.loLo,
    };
  }

  /** The integer these parts encode. Throws if a limb is out of range. */
  toBigInt(): bigint {
    return partsTo256BigInt(check256Parts(this, true, "Int256Parts"), true);
  }

  /** Splits `value` into parts. Throws unless it is a bigint in range. */
  static fromBigInt(value: bigint): Int256Parts {
    const checked = checkBigInt(value, true, 256, "Int256");
    return new Int256Parts(bigIntTo256Parts(checked, true));
  }

  static fromXdrObject(wire: Int256PartsWire): Int256Parts {
    return new Int256Parts({
      hiHi: wire.hiHi,
      hiLo: wire.hiLo,
      loHi: wire.loHi,
      loLo: wire.loLo,
    });
  }
}
