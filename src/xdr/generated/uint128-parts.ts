import {
  bigIntTo128Parts,
  check128Parts,
  checkBigInt,
  partsTo128BigInt,
} from "../values/bigint-parts.js";
import { struct, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface Uint128PartsWire {
  hi: bigint;
  lo: bigint;
}

/**
 * ```xdr
 * struct UInt128Parts {
 *     uint64 hi;
 *     uint64 lo;
 * };
 * ```
 */
export class Uint128Parts extends XdrValue {
  readonly hi: bigint;
  readonly lo: bigint;

  static readonly schema: XdrType<Uint128PartsWire> = struct("Uint128Parts", {
    hi: uint64(),
    lo: uint64(),
  });

  constructor(input: { hi: bigint; lo: bigint }) {
    super();
    this.hi = input.hi;
    this.lo = input.lo;
  }

  toXdrObject(): Uint128PartsWire {
    return {
      hi: this.hi,
      lo: this.lo,
    };
  }

  /** The integer these parts encode. Throws if a limb is out of range. */
  toBigInt(): bigint {
    return partsTo128BigInt(check128Parts(this, false, "Uint128Parts"), false);
  }

  /** Splits `value` into parts. Throws unless it is a bigint in range. */
  static fromBigInt(value: bigint): Uint128Parts {
    const checked = checkBigInt(value, false, 128, "Uint128");
    return new Uint128Parts(bigIntTo128Parts(checked, false));
  }

  static fromXdrObject(wire: Uint128PartsWire): Uint128Parts {
    return new Uint128Parts({
      hi: wire.hi,
      lo: wire.lo,
    });
  }
}
