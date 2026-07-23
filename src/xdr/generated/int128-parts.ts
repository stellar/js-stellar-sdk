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

  static fromXdrObject(wire: Int128PartsWire): Int128Parts {
    return new Int128Parts({
      hi: wire.hi,
      lo: wire.lo,
    });
  }
}
