import {
  Int32,
  ScBytes,
  ScErrorCode,
  ScMapEntry,
  ScVal,
  Uint32,
} from "../xdr/index.js";
import { Keypair } from "./keypair.js";
import { Address } from "./address.js";
import { Contract } from "./contract.js";
import { ScInt, XdrLargeInt, scValToBigInt } from "./numbers/index.js";
import type { ScIntType } from "./numbers/index.js";

type ScValIntType = ScIntType | "i32" | "u32";
type ScValStringType = ScValIntType | "address" | "string" | "symbol";
type ScValBytesType = "bytes" | "string" | "symbol";
type ScValType = ScValBytesType | ScValIntType | ScValStringType | "bool";

type ScValMapTypeSpec = Record<
  string,
  [(ScValType | null)?, (ScValType | null)?]
>;

export interface NativeToScValOpts {
  type?: (ScValType | null)[] | ScValMapTypeSpec | ScValType | undefined;
}

/**
 * Attempts to convert native types into smart contract values
 * ({@link xdr.ScVal}).
 *
 * Provides conversions from smart contract XDR values ({@link xdr.ScVal}) to
 * native JavaScript types.
 *
 * The conversions are as follows:
 *
 *  - xdr.ScVal -> passthrough
 *  - null/undefined -> scvVoid
 *  - string -> scvString (a copy is made)
 *  - UintArray8 -> scvBytes (a copy is made)
 *  - boolean -> scvBool
 *
 *  - number/bigint -> the smallest possible XDR integer type that will fit the
 *    input value (if you want a specific type, use {@link ScInt})
 *
 *  - {@link Address} or {@link Contract} -> scvAddress (for contracts and
 *    public keys)
 *
 *  - Array<T> -> scvVec after attempting to convert each item of type `T` to an
 *    xdr.ScVal (recursively). note that all values must be the same type!
 *
 *  - object -> scvMap after attempting to convert each key and value to an
 *    xdr.ScVal (recursively). note that there is no restriction on types
 *    matching anywhere (unlike arrays)
 *
 * When passing an integer-like native value, you can also optionally specify a
 * type which will force a particular interpretation of that value.
 *
 * Note that not all type specifications are compatible with all `ScVal`s, e.g.
 * `toScVal("a string", {type: "i256"})` will throw.
 *
 * @param val -       a native (or convertible) input value to wrap
 * @param opts - an optional set of hints around the type of
 *    conversion you'd like to see
 * @param opts.type - there is different behavior for different input
 *    types for `val`:
 *
 *     - when `val` is an integer-like type (i.e. number|bigint), this will be
 *       forwarded to {@link ScInt} or forced to be u32/i32.
 *
 *     - when `val` is an array type, this is forwarded to the recursion
 *
 *     - when `val` is an object type (key-value entries), this should be an
 *       object in which each key has a pair of types (to represent forced types
 *       for the key and the value), where `null` (or a missing entry) indicates
 *       the default interpretation(s) (refer to the examples, below)
 *
 *     - when `val` is a string type, this can be 'string' or 'symbol' to force
 *       a particular interpretation of `val`.
 *
 *     - when `val` is a bytes-like type, this can be 'string', 'symbol', or
 *       'bytes' to force a particular interpretation
 *
 *    As a simple example, `nativeToScVal("hello", {type: 'symbol'})` will
 *    return an `scvSymbol`, whereas without the type it would have been an
 *    `scvString`.
 *
 * @throws {TypeError} if...
 *  - there are arrays with more than one type in them
 *  - there are values that do not have a sensible conversion (e.g. random XDR
 *    types, custom classes)
 *  - the type of the input object (or some inner value of said object) cannot
 *    be determined (via `typeof`)
 *  - the type you specified (via `opts.type`) is incompatible with the value
 *    you passed in (`val`), e.g. `nativeToScVal("a string", { type: 'i128' })`,
 *    though this does not apply for types that ignore `opts` (e.g. addresses).
 * @see scValToNative
 *
 * @example
 * nativeToScVal(1000);                   // gives ScValType === scvU64
 * nativeToScVal(1000n);                  // gives ScValType === scvU64
 * nativeToScVal(1n << 100n);             // gives ScValType === scvU128
 * nativeToScVal(1000, { type: 'u32' });  // gives ScValType === scvU32
 * nativeToScVal(1000, { type: 'i125' }); // gives ScValType === scvI256
 * nativeToScVal("a string");                     // gives ScValType === scvString
 * nativeToScVal("a string", { type: 'symbol' }); // gives scvSymbol
 * nativeToScVal(new Uint8Array(5));                      // scvBytes
 * nativeToScVal(new Uint8Array(5), { type: 'symbol' });  // scvSymbol
 * nativeToScVal(null); // scvVoid
 * nativeToScVal(true); // scvBool
 * nativeToScVal([1, 2, 3]);                    // gives scvVec with each element as scvU64
 * nativeToScVal([1, 2, 3], { type: 'i128' });  // scvVec<scvI128>
 * nativeToScVal([1, '2'], { type: ['i128', 'symbol'] });  // scvVec with diff types
 * nativeToScVal([1, '2', 3], { type: ['i128', 'symbol'] });
 *    // scvVec with diff types, using the default when omitted
 * nativeToScVal({ 'hello': 1, 'world': [ true, false ] }, {
 *   type: {
 *     'hello': [ 'symbol', 'i128' ],
 *   }
 * })
 * // gives scvMap with entries: [
 * //     [ scvSymbol, scvI128 ],
 * //     [ scvString, scvArray<scvBool> ]
 * // ]
 *
 * @example
 * import {
 *   nativeToScVal,
 *   scValToNative,
 *   ScInt,
 *   xdr
 * } from '@stellar/stellar-base';
 *
 * let gigaMap = {
 *   bool: true,
 *   void: null,
 *   u32: xdr.ScVal.scvU32(1),
 *   i32: xdr.ScVal.scvI32(1),
 *   u64: 1n,
 *   i64: -1n,
 *   u128: new ScInt(1).toU128(),
 *   i128: new ScInt(1).toI128(),
 *   u256: new ScInt(1).toU256(),
 *   i256: new ScInt(1).toI256(),
 *   map: {
 *     arbitrary: 1n,
 *     nested: 'values',
 *     etc: false
 *   },
 *   vec: ['same', 'type', 'list'],
 *   vec: ['diff', 1, 'type', 2, 'list'],
 * };
 *
 * // then, simply:
 * let scv = nativeToScVal(gigaMap);    // scv.type === "scvMap"
 *
 * // then...
 * someContract.call("method", scv);
 *
 * // Similarly, the inverse should work:
 * scValToNative(scv) == gigaMap;       // true
 */
export function nativeToScVal(
  val: unknown,
  opts: NativeToScValOpts = {},
): ScVal {
  switch (typeof val) {
    case "object": {
      if (val === null) {
        return ScVal.scvVoid();
      }

      if (ScVal.is(val)) {
        return val;
      }

      if (val instanceof Address) {
        return val.toScVal();
      }

      if (val instanceof Keypair) {
        return nativeToScVal(val.publicKey(), { type: "address" });
      }

      if (val instanceof Contract) {
        return val.address().toScVal();
      }

      if (val instanceof Uint8Array || Buffer.isBuffer(val)) {
        const copy = Uint8Array.from(val);
        switch ((opts?.type as string) ?? "bytes") {
          case "bytes":
            return ScVal.scvBytes(new ScBytes(copy));
          case "symbol":
            return ScVal.scvSymbol(new TextDecoder().decode(copy));
          case "string":
            return ScVal.scvString(new TextDecoder().decode(copy));
          default:
            throw new TypeError(
              `invalid type (${JSON.stringify(opts.type)}) specified for bytes-like value`,
            );
        }
      }

      if (Array.isArray(val)) {
        return ScVal.scvVec(
          val.map((v: unknown, idx: number) => {
            // There may be different type specifications for each element in
            // the array, so we need to apply those accordingly.
            if (Array.isArray(opts.type)) {
              return nativeToScVal(
                v,
                // only include a `{ type: ... }` if it's present (safer than
                // `{type: undefined}`)
                {
                  ...(opts.type.length > idx && {
                    type: opts.type[idx] as ScValType,
                  }),
                },
              );
            }

            // Otherwise apply a generic (or missing) type specifier on it.
            return nativeToScVal(v, opts);
          }),
        );
      }

      if (Object.getPrototypeOf(val) !== Object.prototype) {
        throw new TypeError(
          `cannot interpret ${
            val.constructor?.name
          } value as ScVal (${JSON.stringify(val)})`,
        );
      }

      const mapTypeSpec = (opts?.type ?? {}) as ScValMapTypeSpec;

      return ScVal.scvMap(
        Object.entries(val as Record<string, unknown>)
          // The Soroban runtime expects maps to have their keys in sorted
          // order, so let's do that here as part of the conversion to prevent
          // confusing error messages on execution.
          .sort(([key1], [key2]) => (key1 < key2 ? -1 : key1 > key2 ? 1 : 0))
          .map(([k, v]) => {
            // the type can be specified with an entry for the key and the value,
            // e.g. val = { 'hello': 1 } and opts.type = { hello: [ 'symbol',
            // 'u128' ]} or you can use `null` for the default interpretation
            const [keyType, valType] = Object.hasOwn(mapTypeSpec, k)
              ? (mapTypeSpec[k] ?? [null, null])
              : [null, null];
            const keyOpts: NativeToScValOpts = keyType ? { type: keyType } : {};
            const valOpts: NativeToScValOpts = valType ? { type: valType } : {};

            return new ScMapEntry({
              key: nativeToScVal(k, keyOpts),
              val: nativeToScVal(v, valOpts),
            });
          }),
      );
    }

    case "number":
    case "bigint": {
      const bigintVal = BigInt(val);
      switch (opts?.type) {
        case "u32":
          if (
            bigintVal < BigInt(Uint32.MIN_VALUE) ||
            bigintVal > BigInt(Uint32.MAX_VALUE)
          ) {
            throw new TypeError(`invalid value (${val}) for type u32`);
          }
          return ScVal.scvU32(Number(val));
        case "i32":
          if (
            bigintVal < BigInt(Int32.MIN_VALUE) ||
            bigintVal > BigInt(Int32.MAX_VALUE)
          ) {
            throw new TypeError(`invalid value (${val}) for type i32`);
          }
          return ScVal.scvI32(Number(val));

        default:
          break;
      }

      return new ScInt(val, { type: opts?.type as ScIntType }).toScVal();
    }
    case "string": {
      const optType = (opts?.type as string) ?? "string";
      switch (optType) {
        case "string":
          return ScVal.scvString(val);

        case "symbol":
          return ScVal.scvSymbol(val);

        case "address":
          return new Address(val).toScVal();

        case "u32": {
          const bigintVal = BigInt(val);
          if (
            bigintVal < BigInt(Uint32.MIN_VALUE) ||
            bigintVal > BigInt(Uint32.MAX_VALUE)
          ) {
            throw new TypeError(`invalid value (${val}) for type u32`);
          }
          return ScVal.scvU32(Number(bigintVal));
        }

        case "i32": {
          const bigintVal = BigInt(val);
          if (
            bigintVal < BigInt(Int32.MIN_VALUE) ||
            bigintVal > BigInt(Int32.MAX_VALUE)
          ) {
            throw new TypeError(`invalid value (${val}) for type i32`);
          }
          return ScVal.scvI32(Number(bigintVal));
        }

        default:
          if (XdrLargeInt.isType(optType)) {
            return new XdrLargeInt(optType, val).toScVal();
          }

          throw new TypeError(
            `invalid type (${JSON.stringify(opts.type)}) specified for string value`,
          );
      }
    }

    case "boolean":
      return ScVal.scvBool(val);

    case "undefined":
      return ScVal.scvVoid();

    case "function": // FIXME: Is this too helpful?
      return nativeToScVal((val as () => unknown)());

    default:
      throw new TypeError(
        `failed to convert typeof ${typeof val} (${JSON.stringify(val)})`,
      );
  }
}

/**
 * Given a smart contract value, attempt to convert it to a native type.
 * Possible conversions include:
 *
 *  - void -> `null`
 *  - u32, i32 -> `number`
 *  - u64, i64, u128, i128, u256, i256, timepoint, duration -> `bigint`
 *  - vec -> `Array` of any of the above (via recursion)
 *  - map -> key-value object of any of the above (via recursion)
 *  - bool -> `boolean`
 *  - bytes -> `Uint8Array`
 *  - symbol -> `string`
 *  - string -> `string` IF the underlying buffer can be decoded as ascii/utf8,
 *              `Uint8Array` of the raw contents in any error case
 *
 * If no viable conversion can be determined, this just "unwraps" the smart
 * value to return its underlying XDR value.
 *
 * @param scv - the input smart contract value
 *
 * @see nativeToScVal
 */

export function scValToNative(scv: ScVal): any {
  // we use the verbose xdr.ScValType.<type>.value form here because it's faster
  // than string comparisons and the underlying constants never need to be
  // updated
  switch (scv.type) {
    case "scvVoid":
      return null;

    // these can be converted to bigints directly
    case "scvU64":
    case "scvI64":
      return scv.value;

    // these can be parsed by internal abstractions note that this can also
    // handle the above two cases, but it's not as efficient (another
    // type-check, parsing, etc.)
    case "scvU128":
    case "scvI128":
    case "scvU256":
    case "scvI256":
      return scValToBigInt(scv);

    case "scvVec":
      return (scv.value ?? []).map(scValToNative);

    case "scvAddress":
      return Address.fromScVal(scv).toString();

    case "scvMap":
      return Object.fromEntries(
        (scv.value ?? []).map((entry: ScMapEntry) => [
          scValToNative(entry.key),
          scValToNative(entry.val),
        ]),
      );

    // these return the primitive type directly
    case "scvBool":
    case "scvU32":
    case "scvI32":
      return scv.value;
    case "scvBytes":
      return scv.value.value;

    // Symbols are limited to [a-zA-Z0-9_]+, so we can safely make ascii strings
    //
    // Strings, however, are "presented" as strings and we treat them as such
    // (in other words, string = bytes with a hint that it's text). If the user
    // encoded non-printable bytes in their string value, that's on them.
    //
    // Note that we assume a utf8 encoding (ascii-compatible). For other
    // encodings, you should probably use bytes anyway. If it cannot be decoded,
    // the raw bytes are returned.
    case "scvSymbol":
      // Reach the raw XdrString wrapper (the `.value` getter would do a
      // strict UTF-8 decode that throws on invalid bytes; we want a best-
      // effort decode that falls back to raw bytes for binary content).
      return scv.sym.asStringOrBytes();
    case "scvString":
      return scv.str.asStringOrBytes();

    // these can be converted to bigint
    case "scvTimepoint":
    case "scvDuration":
      return scv.value;

    case "scvError": {
      const err = scv.value;
      // Distinguish errors from the user contract.
      if (err.type === "sceContract") {
        return { type: "contract", code: err.value };
      }
      const code = err.value as ScErrorCode;
      return {
        type: "system",
        code: code.value,
        value: code.name,
      };
    }

    case "scvContractInstance":
    case "scvLedgerKeyNonce":
      return scv.value;
    case "scvLedgerKeyContractInstance":
      return undefined;

    default:
      // @ts-expect-error this should be unreachable if the XDR types are correct, but we return the underlying value just in case
      return scv.value;
  }
}

/**
 * Build a sorted ScVal map from unsorted entries, sorted by key.
 *
 * @param items - the unsorted map entries
 */
export function scvSortedMap(items: ScMapEntry[]): ScVal {
  const sorted = Array.from(items).sort((a, b) => {
    // Both a and b are `ScMapEntry`s, so we need to sort by underlying key.
    //
    // We couldn't possibly handle every combination of keys since Soroban
    // maps don't enforce consistent types, so we do a best-effort and try
    // sorting by "number-like" or "string-like."
    const nativeA = scValToNative(a.key) as bigint | number | string;
    const nativeB = scValToNative(b.key) as bigint | number | string;

    switch (typeof nativeA) {
      case "number":
      case "bigint":
        if (nativeA === nativeB) return 0;
        return nativeA < (nativeB as bigint | number) ? -1 : 1;

      default: {
        const strA = nativeA.toString();
        const strB = nativeB.toString();
        return strA < strB ? -1 : strA > strB ? 1 : 0;
      }
    }
  });

  return ScVal.scvMap(sorted);
}
