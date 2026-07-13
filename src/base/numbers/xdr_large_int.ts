import {
  Int128Parts,
  Int256Parts,
  ScVal,
  Uint128Parts,
  Uint256Parts,
} from "../../xdr/index.js";

type BigIntLike = { toBigInt(): bigint };
type XdrLargeIntValues =
  | Array<BigIntLike | bigint | number | string>
  | BigIntLike
  | bigint
  | number
  | string;

export type ScIntType =
  | "duration"
  | "i64"
  | "i128"
  | "i256"
  | "timepoint"
  | "u64"
  | "u128"
  | "u256";

const SIZE: Readonly<Record<ScIntType, 64 | 128 | 256>> = {
  i64: 64,
  u64: 64,
  timepoint: 64,
  duration: 64,
  i128: 128,
  u128: 128,
  i256: 256,
  u256: 256,
};

const SIGNED: Readonly<Record<ScIntType, boolean>> = {
  i64: true,
  i128: true,
  i256: true,
  u64: false,
  u128: false,
  u256: false,
  timepoint: false,
  duration: false,
};

/**
 * A wrapper class to represent large XDR-encodable integers.
 *
 * This operates at a lower level than {@link ScInt} by forcing you to specify
 * the type / width / size in bits of the integer you're targeting, regardless
 * of the input value(s) you provide.
 */
export class XdrLargeInt {
  /** The underlying bigint value (always exact, untruncated). */
  readonly value: bigint;
  readonly type: ScIntType;

  /**
   * @param type - specifies a data type to use to represent the integer, one
   *    of: 'i64', 'u64', 'i128', 'u128', 'i256', 'u256', 'timepoint', and 'duration'
   *    (see {@link XdrLargeInt.isType})
   * @param values - a single integer-like value, or a list of slices in
   *    **little-endian** order (parts[0] is the least-significant slice),
   *    matching the legacy `LargeInt` contract — e.g.
   *    `new XdrLargeInt("i128", [parts.lo, parts.hi])`. Slice width is
   *    `SIZE[type] / values.length`; each slice must fit its width or a
   *    `RangeError` is thrown.
   */
  constructor(type: ScIntType, values: XdrLargeIntValues) {
    if (!XdrLargeInt.isType(type)) {
      throw new TypeError(`invalid type: ${type as string}`);
    }

    const parts: bigint[] = (Array.isArray(values) ? values : [values]).map(
      (i) => {
        if (typeof i === "bigint") return i;
        if (
          typeof i === "object" &&
          i !== null &&
          "toBigInt" in i &&
          typeof (i as BigIntLike).toBigInt === "function"
        ) {
          return (i as BigIntLike).toBigInt();
        }
        return BigInt(i as number | string);
      },
    );

    // Combine slices into a single bigint. Slice width is derived from the
    // total width and the number of parts (matching legacy `LargeInt`):
    //   - 1 part:           pass through (no shifting)
    //   - N>1 parts:        sliceBits = SIZE[type] / N, with parts in
    //                       little-endian order (parts[0] is least
    //                       significant) to match the legacy
    //                       `LargeInt(...args)` contract.
    // For signed types the combined value is interpreted as two's complement.
    const value = combineParts(parts, SIZE[type], SIGNED[type]);

    // Range-check the final value against the declared type width. The legacy
    // `LargeInt`-backed implementation enforced this at construction time and
    // several callers (notably `nativeToScVal` via `ScInt`) depend on it.
    if (parts.length === 1) {
      const bits = SIZE[type];
      if (SIGNED[type]) {
        if (BigInt.asIntN(bits, value) !== value) {
          throw new RangeError(
            `value too large for ${bits}-bit ${type}: ${value}`,
          );
        }
      } else if (value < 0n || BigInt.asUintN(bits, value) !== value) {
        throw new RangeError(
          `value too large for ${bits}-bit ${type}: ${value}`,
        );
      }
    }

    this.value = value;
    this.type = type;
  }

  /**
   * Converts to a native JS number.
   *
   * @throws {RangeError} if the value can't fit into a Number
   */
  toNumber(): number {
    const bi = this.value;
    if (bi > Number.MAX_SAFE_INTEGER || bi < Number.MIN_SAFE_INTEGER) {
      throw RangeError(
        `value ${bi} not in range for Number ` +
          `[${Number.MAX_SAFE_INTEGER}, ${Number.MIN_SAFE_INTEGER}]`,
      );
    }
    return Number(bi);
  }

  /** Converts to a native BigInt. */
  toBigInt(): bigint {
    return this.value;
  }

  /**
   * The integer encoded with `ScValType = I64`.
   *
   * @throws {RangeError} if the value cannot fit in 64 bits
   */
  toI64(): ScVal {
    this._sizeCheck(64);
    const v = this.value;
    if (BigInt.asIntN(64, v) !== v) {
      throw RangeError(`value too large for i64: ${v}`);
    }
    return ScVal.scvI64(v);
  }

  /** The integer encoded with `ScValType = U64` */
  toU64(): ScVal {
    this._sizeCheck(64);
    return ScVal.scvU64(BigInt.asUintN(64, this.value));
  }

  /** The integer encoded with `ScValType = Timepoint` */
  toTimepoint(): ScVal {
    this._sizeCheck(64);
    return ScVal.scvTimepoint(BigInt.asUintN(64, this.value));
  }

  /** The integer encoded with `ScValType = Duration` */
  toDuration(): ScVal {
    this._sizeCheck(64);
    return ScVal.scvDuration(BigInt.asUintN(64, this.value));
  }

  /**
   * The integer encoded with `ScValType = I128`.
   *
   * @throws {RangeError} if the value cannot fit in 128 bits
   */
  toI128(): ScVal {
    this._sizeCheck(128);
    const v = this.value;
    if (BigInt.asIntN(128, v) !== v) {
      throw RangeError(`value too large for i128: ${v}`);
    }
    return ScVal.scvI128(
      new Int128Parts({
        hi: BigInt.asIntN(64, v >> 64n),
        lo: BigInt.asUintN(64, v),
      }),
    );
  }

  /**
   * The integer encoded with `ScValType = U128`.
   *
   * @throws {RangeError} if the value cannot fit in 128 bits
   */
  toU128(): ScVal {
    this._sizeCheck(128);
    const v = this.value;
    return ScVal.scvU128(
      new Uint128Parts({
        hi: BigInt.asUintN(64, v >> 64n),
        lo: BigInt.asUintN(64, v),
      }),
    );
  }

  /**
   * The integer encoded with `ScValType = I256`
   *
   * @throws {RangeError} if the value cannot fit in a signed 256-bit integer
   */
  toI256(): ScVal {
    const v = this.value;
    if (BigInt.asIntN(256, v) !== v) {
      throw RangeError(`value too large for i256: ${v}`);
    }
    return ScVal.scvI256(
      new Int256Parts({
        hiHi: BigInt.asIntN(64, v >> 192n),
        hiLo: BigInt.asUintN(64, v >> 128n),
        loHi: BigInt.asUintN(64, v >> 64n),
        loLo: BigInt.asUintN(64, v),
      }),
    );
  }

  /**
   * The integer encoded with `ScValType = U256`
   *
   * Note: No size check needed - U256 is the largest unsigned type.
   */
  toU256(): ScVal {
    const v = this.value;
    return ScVal.scvU256(
      new Uint256Parts({
        hiHi: BigInt.asUintN(64, v >> 192n),
        hiLo: BigInt.asUintN(64, v >> 128n),
        loHi: BigInt.asUintN(64, v >> 64n),
        loLo: BigInt.asUintN(64, v),
      }),
    );
  }

  /** The smallest interpretation of the stored value */
  toScVal(): ScVal {
    switch (this.type) {
      case "i64":
        return this.toI64();
      case "i128":
        return this.toI128();
      case "i256":
        return this.toI256();
      case "u64":
        return this.toU64();
      case "u128":
        return this.toU128();
      case "u256":
        return this.toU256();
      case "timepoint":
        return this.toTimepoint();
      case "duration":
        return this.toDuration();
      default:
        throw TypeError(`invalid type: ${this.type as string}`);
    }
  }

  /** Returns the primitive value of this integer. */
  valueOf(): bigint {
    return this.value;
  }

  /** Returns the string representation of this integer. */
  toString(): string {
    return this.value.toString();
  }

  /** Returns a JSON-friendly representation with `value` and `type` fields. */
  toJson(): { value: string; type: string } {
    return {
      value: this.value.toString(),
      type: this.type,
    };
  }

  /**
   * JavaScript-standard `JSON.stringify` hook. Without it, stringify would
   * enumerate the bigint `value` field and throw a TypeError.
   */
  toJSON(): { value: string; type: string } {
    return this.toJson();
  }

  private _sizeCheck(bits: number): void {
    if (SIZE[this.type] > bits) {
      throw RangeError(`value too large for ${bits} bits (${this.type})`);
    }
  }

  /** Returns true if the given string is a valid XDR large integer type name. */
  static isType(type: string): type is ScIntType {
    switch (type) {
      case "i64":
      case "i128":
      case "i256":
      case "u64":
      case "u128":
      case "u256":
      case "timepoint":
      case "duration":
        return true;
      default:
        return false;
    }
  }

  /**
   * Convert the raw `ScValType` string (e.g. 'scvI128', generated by the XDR)
   * to a type description for {@link XdrLargeInt} construction (e.g. 'i128')
   *
   * @param scvType - the `xdr.ScValType` as a string
   * @returns the corresponding {@link ScIntType} if it's an integer type, or
   *    `undefined` if it's not an integer type
   */
  static getType(scvType: string): ScIntType | undefined {
    const type = scvType.slice(3).toLowerCase();
    if (this.isType(type)) {
      return type;
    }
    return undefined;
  }
}

/**
 * Combine an array of slices into a single bigint. Slice width is
 * `totalBits / parts.length` (matching the legacy `LargeInt(...args)` behavior
 * — `Int128(lo, hi)` used 64-bit slices, `Int128(a, b, c, d)` used 32-bit
 * slices). Parts are interpreted in **little-endian** order: parts[0] is the
 * least-significant slice, parts[n-1] the most — the same order the legacy
 * runtime used (`new Hyper(low, high)`). For signed types the combined value
 * is interpreted as two's complement.
 *
 * Each slice must fit its width (negative slices are accepted as the two's-
 * complement form of their width and masked); an oversize slice throws a
 * `RangeError` rather than being silently truncated, matching the legacy
 * runtime's slice checks.
 *
 * Single-element input is passed through unchanged so callers that supply a
 * whole bigint (the common case) work as expected.
 */
function combineParts(
  parts: bigint[],
  totalBits: 64 | 128 | 256,
  signed: boolean,
): bigint {
  if (parts.length === 0) return 0n;
  if (parts.length === 1) return parts[0];

  if (totalBits % parts.length !== 0) {
    throw new TypeError(
      `${parts.length} slices do not evenly divide ${totalBits} bits`,
    );
  }
  const sliceBits = totalBits / parts.length;
  const width = BigInt(sliceBits);
  let value = 0n;
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (
      BigInt.asUintN(sliceBits, p) !== p &&
      BigInt.asIntN(sliceBits, p) !== p
    ) {
      throw new RangeError(
        `slice value ${p} does not fit in ${sliceBits} bits`,
      );
    }
    value = (value << width) | BigInt.asUintN(sliceBits, p);
  }
  return signed ? BigInt.asIntN(totalBits, value) : value;
}
