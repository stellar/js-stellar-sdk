import {
  bigIntTo128Parts,
  check128Parts,
  checkBigInt,
  partsTo128BigInt,
} from "../values/bigint-parts.js";
import { int64, struct, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface Int128PartsWire {
  hi: bigint;
  lo: bigint;
}

/**
 * ```xdr
 * struct Int128Parts {
 *     int64 hi;
 *     uint64 lo;
 * };
 * ```
 */
export class Int128Parts extends XdrValue {
  readonly hi: bigint;
  readonly lo: bigint;

  static readonly schema: XdrType<Int128PartsWire> = struct("Int128Parts", {
    hi: int64(),
    lo: uint64(),
  });

  constructor(input: { hi: bigint; lo: bigint }) {
    super();
    this.hi = input.hi;
    this.lo = input.lo;
  }

  toXdrObject(): Int128PartsWire {
    return {
      hi: this.hi,
      lo: this.lo,
    };
  }

  /** The integer these parts encode. Throws if a limb is out of range. */
  toBigInt(): bigint {
    return partsTo128BigInt(check128Parts(this, true, "Int128Parts"), true);
  }

  /** Splits `value` into parts. Throws unless it is a bigint in range. */
  static fromBigInt(value: bigint): Int128Parts {
    const checked = checkBigInt(value, true, 128, "Int128");
    return new Int128Parts(bigIntTo128Parts(checked, true));
  }

  static fromXdrObject(wire: Int128PartsWire): Int128Parts {
    return new Int128Parts({
      hi: wire.hi,
      lo: wire.lo,
    });
  }
}
