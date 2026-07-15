// Class-XDR public surface. This file is the single entry point for the
// class-based XDR layer:
//
//   - The generated kitchen-sink barrel (one named export per XDR type)
//   - The DX overlays (Int128/Uint128/Int256/Uint256 — bigint wrappers
//     around the generated parts structs)
//   - Base classes and primitives consumers may reach for (XdrValue,
//     BytesValue, EnumValue, BigIntValue, XdrError, …)
//   - Thin Int64/Uint64/Int32/Uint32 shims that let legacy
//     `xdr.Int64(v)` / `Int64.MAX_VALUE` / `Int64.fromXdr(...)` call
//     sites keep working over native bigint/number primitives.
//
// `import * as xdr from "./xdr/index.js"` gives you a namespace object
// containing all of the above. Top-level callers (src/base/index.ts) build
// the `xdr` namespace from this module, so users only ever see one entry
// point.

import { XdrError } from "@stellar/js-xdr";
import {
  assertBigIntFits,
  assertIntFits,
  intRange,
} from "./values/bigint-parts.js";
import { decodeBytes } from "./values/xdr-value.js";

// Bases (XdrValue, BytesValue, …) and the schema-builder primitives.
//
// Curated re-exports of the js-xdr runtime surface consumers need to work
// with SDK schemas (typing schema-generic helpers). Re-exported here so
// consumers get the exact copy the SDK's schemas were built against —
// Reader/Writer and the schema-builder factories (struct, union,
// enumType, …) are internal runtime/authoring APIs and are deliberately
// not re-exported.
export { XdrError, BaseType } from "@stellar/js-xdr";
export type { XdrType, DecodeOptions, EncodeOptions } from "@stellar/js-xdr";
export {
  XdrValue,
  encodeBytes,
  decodeBytes,
  decodeStream,
  type XdrFormat,
  type JsonValue,
  type XdrValueConstructor,
} from "./values/xdr-value.js";
export { BytesValue, type BytesEncoding } from "./values/bytes-value.js";
export { EnumValue } from "./values/enum-value.js";
export { XdrString, xdrString } from "./values/xdr-string.js";
export {
  BigIntValue,
  bigIntTo128Parts,
  partsTo128BigInt,
  bigIntTo256Parts,
  partsTo256BigInt,
  type Int128Parts as Int128PartsLegacy,
  type Int256Parts as Int256PartsLegacy,
} from "./values/bigint-value.js";

// Every generated class — full kitchen-sink barrel so consumers can name any
// XDR type from `src/xdr/index.js` without knowing its kebab-case path.
export * from "./generated/index.js";

// DX overlays. The bigint-valued `Int128`/`Uint128`/`Int256`/`Uint256` wrap
// the generated parts structs without changing wire shape.
export { Int128 } from "./dx/int128.js";
export { Uint128 } from "./dx/uint128.js";
export { Int256 } from "./dx/int256.js";
export { Uint256 } from "./dx/uint256.js";

// -----------------------------------------------------------------------------
// Primitive shims — `Int64`/`Uint64`/`Int32`/`Uint32`
//
// Legacy `@stellar/js-xdr` exposed these as class wrappers. The new layer
// uses native primitives (bigint / number); these shims accept the same
// constructor args and expose `MIN_VALUE`/`MAX_VALUE`/`fromString`/`fromXdr`.
// Calling with `new` throws a descriptive TypeError (a construct trap can
// only return an object, and a boxed bigint fails the runtime's typeof
// checks at encode time — better to fail at the call site).
// -----------------------------------------------------------------------------

export type Int64 = bigint;
export const Int64 = makeBigIntShim(true, 64);
export type Uint64 = bigint;
export const Uint64 = makeBigIntShim(false, 64);
export type Int32 = number;
export const Int32 = makeIntShim(true, 32);
export type Uint32 = number;
export const Uint32 = makeIntShim(false, 32);

function makeBigIntShim(signed: boolean, bits: 64) {
  const [min, max] = intRange(signed, bits);
  const name = signed ? `Int${bits}` : `Uint${bits}`;
  function Shim(
    v: bigint | number | string | (bigint | number | string)[],
  ): bigint {
    let value: bigint;
    if (Array.isArray(v) && v.length === 2) {
      // Two-32-bit-halves legacy form: `new Int64([low, high])`.
      const lo = BigInt.asUintN(32, BigInt(v[0]));
      const hi = BigInt(v[1]);
      const combined = (hi << 32n) | lo;
      value = signed
        ? BigInt.asIntN(64, combined)
        : BigInt.asUintN(64, combined);
    } else {
      value = typeof v === "bigint" ? v : BigInt(v as bigint | number | string);
    }
    assertBigIntFits(value, signed, bits, name);
    return value;
  }
  Shim.fromXdr = (
    input: Uint8Array | string,
    format: "raw" | "hex" | "base64" = "raw",
  ): bigint => {
    const bytes = decodeBytes(input, format);
    if (bytes.length !== 8) {
      throw new XdrError(
        `${name}.fromXdr: expected exactly 8 bytes, got ${bytes.length}`,
      );
    }
    let value = 0n;
    for (const byte of bytes) {
      value = (value << 8n) + BigInt(byte);
    }
    return signed ? BigInt.asIntN(bits, value) : BigInt.asUintN(bits, value);
  };
  Shim.fromString = (s: string): bigint => {
    const value = BigInt(s);
    assertBigIntFits(value, signed, bits, name);
    return value;
  };
  Shim.MAX_VALUE = max;
  Shim.MIN_VALUE = min;
  return new Proxy(Shim, {
    construct(_target, args) {
      // A construct trap must return an object, and a boxed bigint fails the
      // runtime's `typeof value === "bigint"` checks at encode time — a
      // confusing failure far from the mistake. Fail fast here instead.
      Shim(args[0]); // still surface range/parse errors first
      throw new TypeError(
        `new xdr.${name}(...) is not supported: XDR ${name.toLowerCase()} ` +
          `values are native bigints. Call xdr.${name}(value) (no \`new\`) ` +
          `or pass a bigint literal instead.`,
      );
    },
  });
}

export { expectUnionVariant, isUnionVariant } from "./util.js";

function makeIntShim(signed: boolean, bits: 32) {
  const max = signed ? 2 ** (bits - 1) - 1 : 2 ** bits - 1;
  const min = signed ? -(2 ** (bits - 1)) : 0;
  const name = signed ? `Int${bits}` : `Uint${bits}`;
  function Shim(v: number | string): number {
    const value = typeof v === "number" ? v : Number(v);
    assertIntFits(value, signed, bits, name);
    return value;
  }
  Shim.fromString = (s: string): number => {
    const value = Number(s);
    assertIntFits(value, signed, bits, name);
    return value;
  };
  Shim.MAX_VALUE = max;
  Shim.MIN_VALUE = min;
  return Shim;
}
