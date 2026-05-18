import { XdrError } from "../core/error.js";
import { XdrValue, type JsonValue } from "./xdr-value.js";

export {
  bigIntTo128Parts,
  partsTo128BigInt,
  bigIntTo256Parts,
  partsTo256BigInt,
  type Int128Parts,
  type Int256Parts,
} from "./bigint-parts.js";

/**
 * Base for wide-int classes (Int128 / Uint128 / Int256 / Uint256).
 * Subclasses set `static readonly signed` and `static readonly bits` and
 * implement `toParts()`/`fromParts()` for wire-shape bridging.
 */
export abstract class BigIntValue extends XdrValue {
  readonly value: bigint;

  constructor(value: bigint | number | string) {
    super();
    const ctor = this.constructor as typeof BigIntValue & {
      readonly signed: boolean;
      readonly bits: 128 | 256;
    };
    const v = typeof value === "bigint" ? value : BigInt(value);
    const [min, max] = rangeFor(ctor.signed, ctor.bits);
    if (v < min || v > max) {
      throw new XdrError(
        `${ctor.name}: value ${v} out of range [${min}, ${max}]`,
      );
    }
    this.value = v;
  }

  toJson(): JsonValue {
    return this.value.toString();
  }
}

function rangeFor(signed: boolean, bits: 128 | 256): readonly [bigint, bigint] {
  const width = BigInt(bits);
  if (signed) {
    const max = (1n << (width - 1n)) - 1n;
    const min = -(1n << (width - 1n));
    return [min, max];
  }
  return [0n, (1n << width) - 1n];
}
