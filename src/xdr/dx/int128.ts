// DX wrapper: `Int128` exposes `Int128Parts` as a single `bigint`. The XDR
// wire shape is the {hi, lo} struct (from `generated/int128-parts.ts`); this
// class hides that split behind a bigint value, which is what callers want.
import {
  BigIntValue,
  bigIntTo128Parts,
  partsTo128BigInt,
} from "../values/bigint-value.js";
import {
  Int128Parts,
  type Int128PartsWire,
} from "../generated/int128-parts.js";

export class Int128 extends BigIntValue {
  static readonly signed = true;
  static readonly bits = 128 as const;

  // Reuse the generated `Int128Parts` schema — the wire shape is identical.
  static readonly schema = Int128Parts.schema;

  toXdrObject(): Int128PartsWire {
    return bigIntTo128Parts(this.value, true);
  }

  toParts(): Int128PartsWire {
    return this.toXdrObject();
  }

  static fromXdrObject(wire: Int128PartsWire): Int128 {
    return new Int128(partsTo128BigInt(wire, true));
  }
}
