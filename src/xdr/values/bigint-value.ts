import { assertBigIntFits } from "./bigint-parts.js";
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

  constructor(value: bigint | number | string, ...legacySlices: never[]) {
    super();
    // The legacy LargeInt classes accepted multiple slice arguments
    // (`new Uint128(lo, hi)`). Silently ignoring the extras would encode a
    // wrong value, so reject them with a pointer to the supported path.
    if (legacySlices.length > 0) {
      throw new TypeError(
        `${this.constructor.name} takes a single value; to combine ` +
          `little-endian 64-bit slices use ` +
          `new XdrLargeInt("<type>", [lo, hi, …]).toBigInt()`,
      );
    }
    const ctor = this.constructor as typeof BigIntValue & {
      readonly signed: boolean;
      readonly bits: 128 | 256;
    };
    const v = typeof value === "bigint" ? value : BigInt(value);
    assertBigIntFits(v, ctor.signed, ctor.bits, ctor.name);
    this.value = v;
  }

  toJson(): JsonValue {
    return this.value.toString();
  }
}
