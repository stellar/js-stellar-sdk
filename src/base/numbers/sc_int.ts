import { XdrLargeInt, type ScIntType } from "./xdr_large_int.js";

/**
 * Provides an easier way to manipulate large numbers for Stellar operations.
 *
 * You can instantiate this "**s**mart **c**ontract integer" value either from
 * bigints, strings, or numbers (whole numbers, or this will throw).
 *
 * If you need to create a native BigInt from a list of integer "parts" (for
 * example, you have a series of encoded 32-bit integers that represent a larger
 * value), you can use the lower level abstraction {@link XdrLargeInt}. For
 * example, you could do `new XdrLargeInt('u128', bytes...).toBigInt()`.
 *
 * @example
 * import { xdr, ScInt, scValToBigInt } from "@stellar/stellar-base";
 *
 * // You have an ScVal from a contract and want to parse it into JS native.
 * const value = xdr.ScVal.fromXDR(someXdr, "base64");
 * const bigi = scValToBigInt(value); // grab it as a BigInt
 * let sci = new ScInt(bigi);
 *
 * sci.toNumber(); // gives native JS type (w/ size check)
 * sci.toBigInt(); // gives the native BigInt value
 * sci.toU64();    // gives ScValType-specific XDR constructs (with size checks)
 *
 * // You have a number and want to shove it into a contract.
 * sci = new ScInt(0xdeadcafebabe);
 * sci.toBigInt() // returns 244838016400062n
 * sci.toNumber() // throws: too large
 *
 * // Pass any to e.g. a Contract.call(), conversion happens automatically
 * // regardless of the initial type.
 * const scValU128 = sci.toU128();
 * const scValI256 = sci.toI256();
 * const scValU64  = sci.toU64();
 *
 * // Lots of ways to initialize:
 * new ScInt("123456789123456789")
 * new ScInt(123456789123456789n);
 * new ScInt(1n << 140n);
 * new ScInt(-42);
 * new ScInt(scValToBigInt(scValU128)); // from above
 *
 * // If you know the type ahead of time (accessing `.raw` is faster than
 * // conversions), you can specify the type directly (otherwise, it's
 * // interpreted from the numbers you pass in):
 * const i = new ScInt(123456789n, { type: "u256" });
 *
 * // For example, you can use the underlying `sdk.U256` and convert it to an
 * // `xdr.ScVal` directly like so:
 * const scv = new xdr.ScVal.scvU256(i.raw);
 *
 * // Or reinterpret it as a different type (size permitting):
 * const scv = i.toI64();
 *
 * @throws if the `value` is invalid (e.g. floating point), too
 *    large (i.e. exceeds a 256-bit value), doesn't fit in the `opts.type`,
 *    the signedness of `opts.type` doesn't match the input `value`, or a
 *    string `value` can't be parsed as a big integer
 */
export class ScInt extends XdrLargeInt {
  /**
   * @param value - a single, integer-like value which will
   *    be interpreted in the smallest appropriate XDR type supported by Stellar
   *    (64, 128, or 256 bit integer values). signed values are supported, though
   *    they are sanity-checked against `opts.type`. if you need 32-bit values,
   *    you can construct them directly without needing this wrapper, e.g.
   *    `xdr.ScVal.scvU32(1234)`.
   * @param opts - an optional object controlling optional parameters
   * @param opts.type - specify a type ('i64', 'u64', 'i128', 'u128', 'i256',
   *    or 'u256') to override the default type selection. If not specified, the
   *    smallest type that fits the value is used.
   */
  constructor(
    value: bigint | number | string,
    opts?: { type?: ScIntType; [key: string]: unknown },
  ) {
    const bigValue = BigInt(value);
    const signed = bigValue < 0n;

    let type = opts?.type ?? "";
    if (type.startsWith("u") && signed) {
      throw TypeError(`specified type ${opts?.type} yet negative (${value})`);
    }

    // If unspecified, we make a best guess at the type based on the bit length
    // of the value, treating 64 as a minimum and 256 as a maximum.
    if (type === "") {
      type = signed ? "i" : "u";
      const bitlen = nearestBigIntSize(bigValue);

      switch (bitlen) {
        case 64:
        case 128:
        case 256:
          type += bitlen.toString();
          break;

        default:
          throw RangeError(
            `expected 64/128/256 bits for input (${value}), got ${bitlen}`,
          );
      }
    }

    super(type as ScIntType, bigValue);
  }
}

function nearestBigIntSize(bigI: bigint): number {
  if (bigI < 0n) {
    // Two's complement: N bits represent -(2^(N-1)) to 2^(N-1)-1.
    // For negative values, compute the signed bit width as
    // (bitlen of abs-1) + 1 to account for the sign bit. This correctly
    // classifies -(2^63) as 64 bits (fits i64) and -(2^63)-1 as 65 bits
    // (needs i128).
    const abs = -bigI;
    const bitlen = (abs - 1n).toString(2).length + 1;
    return [64, 128, 256].find((len) => bitlen <= len) ?? bitlen;
  }

  const bitlen = bigI.toString(2).length;
  return [64, 128, 256].find((len) => bitlen <= len) ?? bitlen;
}
