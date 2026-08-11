// DX wrapper: `Uint256` exposes `Uint256Parts` as a single `bigint`.
import {
  BigIntValue,
  bigIntTo256Parts,
  partsTo256BigInt,
} from "../values/bigint-value.js";
import { intRange } from "../values/bigint-parts.js";
import {
  Uint256Parts,
  type Uint256PartsWire,
} from "../generated/uint256-parts.js";

const [MIN, MAX] = intRange(false, 256);

export class Uint256 extends BigIntValue {
  static readonly signed = false;
  static readonly bits = 256 as const;

  static readonly MIN_VALUE = MIN;
  static readonly MAX_VALUE = MAX;

  static readonly schema = Uint256Parts.schema;

  toXdrObject(): Uint256PartsWire {
    return bigIntTo256Parts(this.value, false);
  }

  toParts(): Uint256PartsWire {
    return this.toXdrObject();
  }

  static fromXdrObject(wire: Uint256PartsWire): Uint256 {
    return new Uint256(partsTo256BigInt(wire, false));
  }
}
