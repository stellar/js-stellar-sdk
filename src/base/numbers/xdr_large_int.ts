import { Hyper, LargeInt, UnsignedHyper } from "@stellar/js-xdr";

import { Uint128 } from "./uint128.js";
import { Uint256 } from "./uint256.js";
import { Int128 } from "./int128.js";
import { Int256 } from "./int256.js";

import xdr from "../xdr.js";

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

/**
 * A wrapper class to represent large XDR-encodable integers.
 *
 * This operates at a lower level than {@link ScInt} by forcing you to specify
 * the type / width / size in bits of the integer you're targeting, regardless
 * of the input value(s) you provide.
 */
export class XdrLargeInt {
  int: LargeInt;
  type: ScIntType;

  /**
   * @param type - specifies a data type to use to represent the integer, one
   *    of: 'i64', 'u64', 'i128', 'u128', 'i256', 'u256', 'timepoint', and 'duration'
   *    (see {@link XdrLargeInt.isType})
   * @param values - a list of integer-like values interpreted in big-endian order
   */
  constructor(type: ScIntType, values: XdrLargeIntValues) {
    if (!(values instanceof Array)) {
      values = [values];
    }

    // normalize values to one type
    const normalizedValues: bigint[] = values.map((i) => {
      // micro-optimization to no-op on the likeliest input value:
      if (typeof i === "bigint") {
        return i;
      }
      if (
        typeof i === "object" &&
        i !== null &&
        "toBigInt" in i &&
        typeof i.toBigInt === "function"
      ) {
        return i.toBigInt();
      }
      return BigInt(i as number | string);
    });

    // Note: API difference in XDR constructors:
    // - Hyper/UnsignedHyper accept an array parameter
    // - Int128/Uint128/Int256/Uint256 accept rest parameters (require spread operator)
    switch (type) {
      case "i64":
        this.int = new Hyper(normalizedValues);
        break;
      case "i128":
        this.int = new Int128(...normalizedValues);
        break;
      case "i256":
        this.int = new Int256(...normalizedValues);
        break;
      case "u64":
      case "timepoint":
      case "duration":
        this.int = new UnsignedHyper(normalizedValues);
        break;
      case "u128":
        this.int = new Uint128(...normalizedValues);
        break;
      case "u256":
        this.int = new Uint256(...normalizedValues);
        break;
      default:
        throw TypeError(`invalid type: ${type as string}`);
    }

    this.type = type;
  }

  /**
   * Converts to a native JS number.
   *
   * @throws if the value can't fit into a Number
   */
  toNumber(): number {
    const bi = this.int.toBigInt();
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
    return this.int.toBigInt();
  }

  /**
   * The integer encoded with `ScValType = I64`.
   *
   * @throws if the value cannot fit in 64 bits
   */
  toI64(): xdr.ScVal {
    this._sizeCheck(64);
    const v = this.toBigInt();
    if (BigInt.asIntN(64, v) !== v) {
      throw RangeError(`value too large for i64: ${v}`);
    }

    return xdr.ScVal.scvI64(new xdr.Int64(v));
  }

  /** The integer encoded with `ScValType = U64` */
  toU64(): xdr.ScVal {
    this._sizeCheck(64);
    return xdr.ScVal.scvU64(
      new xdr.Uint64(BigInt.asUintN(64, this.toBigInt())), // reiterpret as unsigned
    );
  }

  /** The integer encoded with `ScValType = Timepoint` */
  toTimepoint(): xdr.ScVal {
    this._sizeCheck(64);
    return xdr.ScVal.scvTimepoint(
      new xdr.Uint64(BigInt.asUintN(64, this.toBigInt())), // reiterpret as unsigned
    );
  }

  /** The integer encoded with `ScValType = Duration` */
  toDuration(): xdr.ScVal {
    this._sizeCheck(64);
    return xdr.ScVal.scvDuration(
      new xdr.Uint64(BigInt.asUintN(64, this.toBigInt())), // reiterpret as unsigned
    );
  }

  /**
   * The integer encoded with `ScValType = I128`.
   *
   * @throws if the value cannot fit in 128 bits
   */
  toI128(): xdr.ScVal {
    this._sizeCheck(128);

    const v = this.int.toBigInt();
    if (BigInt.asIntN(128, v) !== v) {
      throw RangeError(`value too large for i128: ${v}`);
    }
    const hi64 = BigInt.asIntN(64, v >> 64n); // encode top 64 w/ sign bit
    const lo64 = BigInt.asUintN(64, v); // grab btm 64, encode sign

    return xdr.ScVal.scvI128(
      new xdr.Int128Parts({
        hi: new xdr.Int64(hi64),
        lo: new xdr.Uint64(lo64),
      }),
    );
  }

  /**
   * The integer encoded with `ScValType = U128`.
   *
   * @throws if the value cannot fit in 128 bits
   */
  toU128(): xdr.ScVal {
    this._sizeCheck(128);
    const v = this.int.toBigInt();

    return xdr.ScVal.scvU128(
      new xdr.UInt128Parts({
        hi: new xdr.Uint64(BigInt.asUintN(64, v >> 64n)),
        lo: new xdr.Uint64(BigInt.asUintN(64, v)),
      }),
    );
  }

  /**
   * The integer encoded with `ScValType = I256`
   *
   * @throws if the value cannot fit in a signed 256-bit integer
   */
  toI256(): xdr.ScVal {
    const v = this.int.toBigInt();
    if (BigInt.asIntN(256, v) !== v) {
      throw RangeError(`value too large for i256: ${v}`);
    }
    const hiHi64 = BigInt.asIntN(64, v >> 192n); // keep sign bit
    const hiLo64 = BigInt.asUintN(64, v >> 128n);
    const loHi64 = BigInt.asUintN(64, v >> 64n);
    const loLo64 = BigInt.asUintN(64, v);

    return xdr.ScVal.scvI256(
      new xdr.Int256Parts({
        hiHi: new xdr.Int64(hiHi64),
        hiLo: new xdr.Uint64(hiLo64),
        loHi: new xdr.Uint64(loHi64),
        loLo: new xdr.Uint64(loLo64),
      }),
    );
  }

  /**
   * The integer encoded with `ScValType = U256`
   *
   * Note: No size check needed - U256 is the largest unsigned type.
   */
  toU256(): xdr.ScVal {
    const v = this.int.toBigInt();
    const hiHi64 = BigInt.asUintN(64, v >> 192n); // encode sign bit
    const hiLo64 = BigInt.asUintN(64, v >> 128n);
    const loHi64 = BigInt.asUintN(64, v >> 64n);
    const loLo64 = BigInt.asUintN(64, v);

    return xdr.ScVal.scvU256(
      new xdr.UInt256Parts({
        hiHi: new xdr.Uint64(hiHi64),
        hiLo: new xdr.Uint64(hiLo64),
        loHi: new xdr.Uint64(loHi64),
        loLo: new xdr.Uint64(loLo64),
      }),
    );
  }

  /** The smallest interpretation of the stored value */
  toScVal(): xdr.ScVal {
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
        // This should be unreachable if the compiler enforces valid types
        // This serves as a runtime check if the type is somehow invalid
        // (e.g. from user input or a future extension)
        throw TypeError(`invalid type: ${this.type as string}`);
    }
  }

  /** Returns the primitive value of this integer. */
  valueOf(): unknown {
    return this.int.valueOf();
  }

  /** Returns the string representation of this integer. */
  toString(): string {
    return this.int.toString();
  }

  /** Returns a JSON-friendly representation with `value` and `type` fields. */
  toJSON(): { value: string; type: string } {
    return {
      value: this.toBigInt().toString(),
      type: this.type,
    };
  }

  private _sizeCheck(bits: number): void {
    if (this.int.size > bits) {
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
