import { describe, expect, it } from "vitest";

import {
  Int128,
  Uint128,
  Int256,
  Uint256,
  Int64,
  Uint64,
  Int32,
  Uint32,
  Int128Parts,
  Uint128Parts,
  Int256Parts,
  Uint256Parts,
  XdrError,
} from "../../../src/xdr/index.js";

// Tests for the public wide-int surface and that range validation is enforced
// across every entry point that reaches it:
//   - the DX wrappers `Int128`/`Uint128`/`Int256`/`Uint256` (port of js-xdr's
//     `large-int-128_test.js`, extended to the 256-bit types)
//   - the `*Parts.fromJson` JSON decoders
//   - the legacy `Int64`/`Uint64`/`Int32`/`Uint32` primitive shims
//
// The legacy `LargeInt` was a variadic-chunk class with static
// `MIN_VALUE`/`MAX_VALUE`/`isValid`/`fromString`/`read`/`write`. The class-XDR
// `Int128`/`Uint128`/`Int256`/`Uint256` instead wrap a single `bigint`,
// range-check it in the `BigIntValue` constructor, and bridge to the wire via
// `toXdr`/`fromXdr` (bytes) and `toParts`/`fromXdrObject` (the {hi, lo} struct).
// All these entry points share one validator (`assertBigIntFits` in
// `values/bigint-parts.ts`), which is unit-tested in `bigint_parts.test.ts`.

// Boundaries the constructor range-checks against (legacy MIN/MAX_VALUE).
const I128_MAX = 2n ** 127n - 1n;
const I128_MIN = -(2n ** 127n);
const U128_MAX = 2n ** 128n - 1n;
const I256_MAX = 2n ** 255n - 1n;
const I256_MIN = -(2n ** 255n);
const U256_MAX = 2n ** 256n - 1n;
const I64_MAX = 2n ** 63n - 1n;
const U64_MAX = 2n ** 64n - 1n;

// Each wide-int type, paired with its inclusive [min, max] range. Constructors
// share the inherited `BigIntValue(value)` signature, so a single table drives
// the range-enforcement tests below.
type WideIntCtor = new (value: bigint | number | string) => { value: bigint };

const RANGES: ReadonlyArray<{
  name: string;
  ctor: WideIntCtor;
  min: bigint;
  max: bigint;
}> = [
  { name: "Int128", ctor: Int128, min: I128_MIN, max: I128_MAX },
  { name: "Uint128", ctor: Uint128, min: 0n, max: U128_MAX },
  { name: "Int256", ctor: Int256, min: I256_MIN, max: I256_MAX },
  { name: "Uint256", ctor: Uint256, min: 0n, max: U256_MAX },
];

// ---------- Construction ----------

describe("Int128 construction", () => {
  it("constructs zero, positive, and negative values", () => {
    expect(new Int128(0n).value).toBe(0n);
    expect(new Int128(123456789012345678901234n).value).toBe(
      123456789012345678901234n,
    );
    expect(new Int128(-42n).value).toBe(-42n);
  });

  it("coerces number and string inputs to bigint", () => {
    expect(new Int128(42).value).toBe(42n);
    expect(new Int128("-999").value).toBe(-999n);
  });
});

describe("Uint128 construction", () => {
  it("constructs zero and positive values", () => {
    expect(new Uint128(0n).value).toBe(0n);
    expect(new Uint128(123456789012345678901234n).value).toBe(
      123456789012345678901234n,
    );
  });
});

describe("Int256 construction", () => {
  it("constructs zero, positive, and negative values", () => {
    expect(new Int256(0n).value).toBe(0n);
    expect(new Int256(42n).value).toBe(42n);
    expect(new Int256(-1n).value).toBe(-1n);
  });
});

describe("Uint256 construction", () => {
  it("constructs zero and positive values", () => {
    expect(new Uint256(0n).value).toBe(0n);
    expect(new Uint256(42n).value).toBe(42n);
  });
});

// ---------- Range enforcement (overflow / underflow) ----------
// Every wide-int type must accept its exact MIN and MAX but reject one step
// beyond either bound. (Legacy js-xdr threw /positive/ for negative unsigned
// values; the class-XDR layer reports them as out of the [0, MAX] range.)

describe("wide-int range enforcement", () => {
  for (const { name, ctor, min, max } of RANGES) {
    it(`${name} accepts exact MIN and MAX`, () => {
      expect(new ctor(min).value).toBe(min);
      expect(new ctor(max).value).toBe(max);
    });

    it(`${name} throws one above MAX`, () => {
      expect(() => new ctor(max + 1n)).toThrow(XdrError);
      expect(() => new ctor(max + 1n)).toThrow(/out of range/i);
    });

    it(`${name} throws one below MIN`, () => {
      expect(() => new ctor(min - 1n)).toThrow(XdrError);
      expect(() => new ctor(min - 1n)).toThrow(/out of range/i);
    });
  }

  it("throws for values far outside the range", () => {
    expect(() => new Int128(2n ** 300n)).toThrow(/out of range/i);
    expect(() => new Uint128(2n ** 300n)).toThrow(/out of range/i);
    expect(() => new Int256(-(2n ** 300n))).toThrow(/out of range/i);
  });

  it("names the offending type and value in the error message", () => {
    expect(() => new Int128(I128_MAX + 1n)).toThrow(
      /Int128: value .* out of range/,
    );
  });
});

// ---------- XDR byte round-trip (toXdr / fromXdr) ----------

describe("Int128 XDR byte round-trip", () => {
  for (const value of [
    0n,
    123456789012345678901234n,
    -987654321098765432109876n,
    I128_MAX,
    I128_MIN,
  ]) {
    it(`round-trips ${value}`, () => {
      const bytes = new Int128(value).toXdr();
      expect(bytes).toHaveLength(16);
      expect(Int128.fromXdr(bytes).value).toBe(value);
    });
  }
});

describe("Uint128 XDR byte round-trip", () => {
  for (const value of [0n, 1n, U128_MAX]) {
    it(`round-trips ${value}`, () => {
      const bytes = new Uint128(value).toXdr();
      expect(bytes).toHaveLength(16);
      expect(Uint128.fromXdr(bytes).value).toBe(value);
    });
  }
});

describe("Int256 XDR byte round-trip", () => {
  for (const value of [0n, 42n, -42n, I256_MAX, I256_MIN]) {
    it(`round-trips ${value}`, () => {
      const bytes = new Int256(value).toXdr();
      expect(bytes).toHaveLength(32);
      expect(Int256.fromXdr(bytes).value).toBe(value);
    });
  }
});

describe("Uint256 XDR byte round-trip", () => {
  for (const value of [0n, 1n, U256_MAX]) {
    it(`round-trips ${value}`, () => {
      const bytes = new Uint256(value).toXdr();
      expect(bytes).toHaveLength(32);
      expect(Uint256.fromXdr(bytes).value).toBe(value);
    });
  }
});

// ---------- Parts bridging (toParts / fromXdrObject) ----------
// The class-XDR analog of constructing a LargeInt "from chunks": the wire shape
// is the generated Int128Parts/{hi, lo} (and Int256Parts/{hiHi, hiLo, loHi,
// loLo}) struct of 64-bit halves.

describe("wide-int parts bridging", () => {
  it("Int128.toParts exposes {hi, lo} 64-bit halves", () => {
    // low=1, high=1 => 1 * 2^64 + 1
    expect(new Int128(2n ** 64n + 1n).toParts()).toEqual({ hi: 1n, lo: 1n });
    expect(new Int128(-1n).toParts()).toEqual({
      hi: -1n,
      lo: 0xffffffffffffffffn,
    });
  });

  it("round-trips Int128 through its parts", () => {
    for (const v of [0n, 42n, -42n, I128_MAX, I128_MIN]) {
      expect(Int128.fromXdrObject(new Int128(v).toParts()).value).toBe(v);
    }
  });

  it("round-trips Uint128 through its parts", () => {
    for (const v of [0n, 1n, U128_MAX]) {
      expect(Uint128.fromXdrObject(new Uint128(v).toParts()).value).toBe(v);
    }
  });

  it("Int256.toParts exposes four 64-bit quarters", () => {
    const value = (4n << 192n) | (3n << 128n) | (2n << 64n) | 1n;
    expect(new Int256(value).toParts()).toEqual({
      hiHi: 4n,
      hiLo: 3n,
      loHi: 2n,
      loLo: 1n,
    });
  });

  it("round-trips Int256 through its parts", () => {
    for (const v of [0n, 42n, -42n, I256_MAX, I256_MIN]) {
      expect(Int256.fromXdrObject(new Int256(v).toParts()).value).toBe(v);
    }
  });

  it("round-trips Uint256 through its parts", () => {
    for (const v of [0n, 1n, U256_MAX]) {
      expect(Uint256.fromXdrObject(new Uint256(v).toParts()).value).toBe(v);
    }
  });
});

// ---------- toJson ----------
// Legacy js-xdr's `toJSON()` returned `{ _value: '999' }`; the class-XDR layer
// serializes the value as a bare decimal string.

describe("wide-int toJson", () => {
  it("serializes the value as a decimal string", () => {
    expect(new Int128(999n).toJson()).toBe("999");
    expect(new Int128(-42n).toJson()).toBe("-42");
    expect(new Uint256(U256_MAX).toJson()).toBe(U256_MAX.toString());
  });
});

// ---------- JSON-decode entry points (*Parts.fromJson) ----------
// The decoders previously masked out-of-range JSON into the wire shape (so
// e.g. `2^128 + 7` silently decoded to `7`); they now reject it.

describe("wide-int *Parts.fromJson range enforcement", () => {
  it("rejects values above the unsigned max instead of wrapping", () => {
    expect(() => Uint128Parts.fromJson((U128_MAX + 8n).toString())).toThrow(
      XdrError,
    );
    expect(() => Uint128Parts.fromJson((U128_MAX + 8n).toString())).toThrow(
      /out of range/i,
    );
    expect(() => Uint256Parts.fromJson((U256_MAX + 1n).toString())).toThrow(
      /out of range/i,
    );
  });

  it("rejects negatives for unsigned parts", () => {
    expect(() => Uint128Parts.fromJson("-1")).toThrow(/out of range/i);
  });

  it("rejects values outside the signed range", () => {
    expect(() => Int128Parts.fromJson((I128_MAX + 1n).toString())).toThrow(
      /out of range/i,
    );
    expect(() => Int256Parts.fromJson((I256_MIN - 1n).toString())).toThrow(
      /out of range/i,
    );
  });

  it("still accepts in-range values (round-trip preserved)", () => {
    expect(Uint128Parts.fromJson(U128_MAX.toString()).toJson()).toBe(
      U128_MAX.toString(),
    );
    expect(Int128Parts.fromJson("-5").toJson()).toBe("-5");
  });
});

// ---------- Legacy primitive shims (Int64/Uint64/Int32/Uint32) ----------
// These accept the same args as the old `@stellar/js-xdr` class wrappers but
// produce native bigint/number primitives; they now range-check like the
// wrappers do instead of returning out-of-range values.

describe("Int64 / Uint64 shim range enforcement", () => {
  it("accepts exact boundaries", () => {
    expect(Int64(I64_MAX)).toBe(I64_MAX);
    expect(Int64(-(2n ** 63n))).toBe(-(2n ** 63n));
    expect(Uint64(U64_MAX)).toBe(U64_MAX);
    expect(Uint64(0n)).toBe(0n);
  });

  it("rejects out-of-range scalar construction", () => {
    expect(() => Int64(2n ** 63n)).toThrow(/out of range/i);
    expect(() => Uint64(-1n)).toThrow(/out of range/i);
    expect(() => Uint64(2n ** 64n)).toThrow(/out of range/i);
  });

  it("rejects out-of-range fromString", () => {
    expect(() => Int64.fromString((2n ** 63n).toString())).toThrow(
      /out of range/i,
    );
    expect(() => Uint64.fromString("-1")).toThrow(/out of range/i);
  });

  it("still parses in-range fromString", () => {
    expect(Int64.fromString("9223372036854775807")).toBe(I64_MAX);
    expect(Uint64.fromString("18446744073709551615")).toBe(U64_MAX);
  });
});

describe("Int32 / Uint32 shim range enforcement", () => {
  it("rejects out-of-range and non-integer values", () => {
    expect(() => Int32(2 ** 31)).toThrow(XdrError);
    expect(() => Uint32(-1)).toThrow(XdrError);
    expect(() => Int32(1.9)).toThrow(/integer/i);
    expect(() => Uint32.fromString("4294967296")).toThrow(XdrError);
  });

  it("still accepts in-range integers", () => {
    expect(Int32(-2147483648)).toBe(-2147483648);
    expect(Uint32(4294967295)).toBe(4294967295);
    expect(Uint32.fromString("42")).toBe(42);
  });
});
