// DX wrapper: `Uint128` exposes `Uint128Parts` as a single `bigint`.
import {
  BigIntValue,
  bigIntTo128Parts,
  partsTo128BigInt,
} from "../values/bigint-value.js";
import {
  Uint128Parts,
  type Uint128PartsWire,
} from "../generated/uint128-parts.js";

export class Uint128 extends BigIntValue {
  static readonly signed = false;
  static readonly bits = 128 as const;

  static readonly schema = Uint128Parts.schema;

  toXdrObject(): Uint128PartsWire {
    return bigIntTo128Parts(this.value, false);
  }

  toParts(): Uint128PartsWire {
    return this.toXdrObject();
  }

  static fromXdrObject(wire: Uint128PartsWire): Uint128 {
    return new Uint128(partsTo128BigInt(wire, false));
  }
}
