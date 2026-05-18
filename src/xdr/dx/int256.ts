// DX wrapper: `Int256` exposes `Int256Parts` as a single `bigint`.
import {
  BigIntValue,
  bigIntTo256Parts,
  partsTo256BigInt,
} from "../values/bigint-value.js";
import {
  Int256Parts,
  type Int256PartsWire,
} from "../generated/int256-parts.js";

export class Int256 extends BigIntValue {
  static readonly signed = true;
  static readonly bits = 256 as const;

  static readonly schema = Int256Parts.schema;

  toXdrObject(): Int256PartsWire {
    return bigIntTo256Parts(this.value, true);
  }

  toParts(): Int256PartsWire {
    return this.toXdrObject();
  }

  static fromXdrObject(wire: Int256PartsWire): Int256 {
    return new Int256(partsTo256BigInt(wire, true));
  }
}
