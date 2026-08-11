import { describe, expect, it } from "vitest";

import {
  bigIntTo128Parts,
  partsTo128BigInt,
  bigIntTo256Parts,
  partsTo256BigInt,
  XdrError,
} from "../../../src/xdr/index.js";
// `intRange` / `assertBigIntFits` are internal helpers (not part of the public
// barrel), so they're imported straight from the module under test.
import {
  intRange,
  assertBigIntFits,
  assertIntFits,
} from "../../../src/xdr/values/bigint-parts.js";

// Port of js-xdr's `bigint-encoder_test.js`. That file tested
// `encodeBigIntFromBits` (build a bigint *from* chunked parts) and
// `sliceBigInt` (split a bigint *into* chunks). The class-XDR layer replaces
// both with the pure helpers in `values/bigint-parts.ts`:
//
//   partsTo128BigInt / partsTo256BigInt  — construction from parts
//   bigIntTo128Parts / bigIntTo256Parts  — destruction into parts
//
// The wire shape uses 64-bit halves ({hi, lo}) and quarters ({hiHi, hiLo,
// loHi, loLo}) rather than the legacy 32-bit chunks, so the cases below use
// 64-bit slices. The signed `hi`/`hiHi` half is two's-complement; lower halves
// are always unsigned.

const MAX_U64 = 0xffffffffffffffffn;

interface Case128 {
  parts: { hi: bigint; lo: bigint };
  signed: boolean;
  expected: bigint;
}

const CASES_128: Case128[] = [
  // i128
  { parts: { hi: 0n, lo: 0n }, signed: true, expected: 0n },
  { parts: { hi: 0n, lo: 1n }, signed: true, expected: 1n },
  { parts: { hi: -1n, lo: MAX_U64 }, signed: true, expected: -1n },
  { parts: { hi: 1n, lo: 1n }, signed: true, expected: 2n ** 64n + 1n },
  {
    parts: { hi: 0x7fffffffffffffffn, lo: MAX_U64 },
    signed: true,
    expected: 2n ** 127n - 1n, // i128 MAX
  },
  {
    parts: { hi: -0x8000000000000000n, lo: 0n },
    signed: true,
    expected: -(2n ** 127n), // i128 MIN
  },
  // u128
  { parts: { hi: 0n, lo: 0n }, signed: false, expected: 0n },
  { parts: { hi: 0n, lo: 1n }, signed: false, expected: 1n },
  {
    parts: { hi: MAX_U64, lo: MAX_U64 },
    signed: false,
    expected: 2n ** 128n - 1n, // u128 MAX
  },
];

interface Case256 {
  parts: { hiHi: bigint; hiLo: bigint; loHi: bigint; loLo: bigint };
  signed: boolean;
  expected: bigint;
}

const CASES_256: Case256[] = [
  // i256
  {
    parts: { hiHi: 0n, hiLo: 0n, loHi: 0n, loLo: 0n },
    signed: true,
    expected: 0n,
  },
  {
    parts: { hiHi: 0n, hiLo: 0n, loHi: 0n, loLo: 1n },
    signed: true,
    expected: 1n,
  },
  {
    parts: { hiHi: -1n, hiLo: MAX_U64, loHi: MAX_U64, loLo: MAX_U64 },
    signed: true,
    expected: -1n,
  },
  {
    parts: { hiHi: 4n, hiLo: 3n, loHi: 2n, loLo: 1n },
    signed: true,
    expected: (4n << 192n) | (3n << 128n) | (2n << 64n) | 1n,
  },
  {
    parts: {
      hiHi: 0x7fffffffffffffffn,
      hiLo: MAX_U64,
      loHi: MAX_U64,
      loLo: MAX_U64,
    },
    signed: true,
    expected: 2n ** 255n - 1n, // i256 MAX
  },
  {
    parts: { hiHi: -0x8000000000000000n, hiLo: 0n, loHi: 0n, loLo: 0n },
    signed: true,
    expected: -(2n ** 255n), // i256 MIN
  },
  // u256
  {
    parts: { hiHi: 0n, hiLo: 0n, loHi: 0n, loLo: 0n },
    signed: false,
    expected: 0n,
  },
  {
    parts: { hiHi: MAX_U64, hiLo: MAX_U64, loHi: MAX_U64, loLo: MAX_U64 },
    signed: false,
    expected: 2n ** 256n - 1n, // u256 MAX
  },
];

// ---------- Construction from parts ----------

describe("partsTo128BigInt (construction from {hi, lo})", () => {
  for (const { parts, signed, expected } of CASES_128) {
    it(`${signed ? "i128" : "u128"} {hi:${parts.hi}, lo:${parts.lo}} -> ${expected}`, () => {
      expect(partsTo128BigInt(parts, signed)).toBe(expected);
    });
  }
});

describe("partsTo256BigInt (construction from {hiHi, hiLo, loHi, loLo})", () => {
  for (const { parts, signed, expected } of CASES_256) {
    it(`${signed ? "i256" : "u256"} -> ${expected}`, () => {
      expect(partsTo256BigInt(parts, signed)).toBe(expected);
    });
  }
});

// ---------- Destruction into parts ----------

describe("bigIntTo128Parts (destruction into {hi, lo})", () => {
  for (const { parts, signed, expected } of CASES_128) {
    it(`${signed ? "i128" : "u128"} ${expected} -> {hi:${parts.hi}, lo:${parts.lo}}`, () => {
      expect(bigIntTo128Parts(expected, signed)).toEqual(parts);
    });
  }
});

describe("bigIntTo256Parts (destruction into {hiHi, hiLo, loHi, loLo})", () => {
  for (const { parts, signed, expected } of CASES_256) {
    it(`${signed ? "i256" : "u256"} ${expected} -> parts`, () => {
      expect(bigIntTo256Parts(expected, signed)).toEqual(parts);
    });
  }
});

// ---------- Round-trip ----------

describe("128-bit parts round-trip", () => {
  const signedValues = [0n, 1n, -1n, 42n, -42n, 2n ** 127n - 1n, -(2n ** 127n)];
  const unsignedValues = [0n, 1n, 42n, 2n ** 128n - 1n];

  for (const value of signedValues) {
    it(`i128 round-trips ${value}`, () => {
      expect(partsTo128BigInt(bigIntTo128Parts(value, true), true)).toBe(value);
    });
  }
  for (const value of unsignedValues) {
    it(`u128 round-trips ${value}`, () => {
      expect(partsTo128BigInt(bigIntTo128Parts(value, false), false)).toBe(
        value,
      );
    });
  }
});

describe("256-bit parts round-trip", () => {
  const signedValues = [0n, 1n, -1n, 42n, -42n, 2n ** 255n - 1n, -(2n ** 255n)];
  const unsignedValues = [0n, 1n, 42n, 2n ** 256n - 1n];

  for (const value of signedValues) {
    it(`i256 round-trips ${value}`, () => {
      expect(partsTo256BigInt(bigIntTo256Parts(value, true), true)).toBe(value);
    });
  }
  for (const value of unsignedValues) {
    it(`u256 round-trips ${value}`, () => {
      expect(partsTo256BigInt(bigIntTo256Parts(value, false), false)).toBe(
        value,
      );
    });
  }
});

// ---------- Range helpers ----------
// The shared bounds + validator that every construction / JSON-decode entry
// point routes through (the `BigIntValue` constructor, `*Parts.fromJson`, and
// the `Int64`/`Uint64` shims). Enforcement at those call sites is covered in
// `large_int.test.ts`; here we unit-test the helpers directly.

describe("intRange", () => {
  it("returns inclusive two's-complement bounds by width and sign", () => {
    expect(intRange(true, 32)).toEqual([-(2n ** 31n), 2n ** 31n - 1n]);
    expect(intRange(false, 32)).toEqual([0n, 2n ** 32n - 1n]);
    expect(intRange(true, 64)).toEqual([-(2n ** 63n), 2n ** 63n - 1n]);
    expect(intRange(false, 64)).toEqual([0n, 2n ** 64n - 1n]);
    expect(intRange(true, 128)).toEqual([-(2n ** 127n), 2n ** 127n - 1n]);
    expect(intRange(false, 128)).toEqual([0n, 2n ** 128n - 1n]);
    expect(intRange(true, 256)).toEqual([-(2n ** 255n), 2n ** 255n - 1n]);
    expect(intRange(false, 256)).toEqual([0n, 2n ** 256n - 1n]);
  });
});

describe("assertBigIntFits", () => {
  it("accepts values within range, including exact boundaries", () => {
    expect(() => assertBigIntFits(0n, true, 128, "Int128")).not.toThrow();
    expect(() =>
      assertBigIntFits(2n ** 127n - 1n, true, 128, "Int128"),
    ).not.toThrow();
    expect(() =>
      assertBigIntFits(-(2n ** 127n), true, 128, "Int128"),
    ).not.toThrow();
    expect(() =>
      assertBigIntFits(2n ** 128n - 1n, false, 128, "Uint128"),
    ).not.toThrow();
  });

  it("throws XdrError naming the type, value, and range when out of bounds", () => {
    expect(() => assertBigIntFits(2n ** 127n, true, 128, "Int128")).toThrow(
      XdrError,
    );
    expect(() => assertBigIntFits(2n ** 127n, true, 128, "Int128")).toThrow(
      /Int128: value .* out of range/,
    );
    expect(() => assertBigIntFits(-1n, false, 128, "Uint128")).toThrow(
      /out of range/i,
    );
  });
});

describe("assertIntFits", () => {
  it("accepts in-range integers including boundaries", () => {
    expect(() => assertIntFits(0, true, 32, "Int32")).not.toThrow();
    expect(() => assertIntFits(2 ** 31 - 1, true, 32, "Int32")).not.toThrow();
    expect(() => assertIntFits(-(2 ** 31), true, 32, "Int32")).not.toThrow();
    expect(() => assertIntFits(2 ** 32 - 1, false, 32, "Uint32")).not.toThrow();
  });

  it("rejects non-integers", () => {
    expect(() => assertIntFits(1.9, true, 32, "Int32")).toThrow(XdrError);
    expect(() => assertIntFits(1.9, true, 32, "Int32")).toThrow(/integer/i);
  });

  it("rejects out-of-range integers", () => {
    expect(() => assertIntFits(2 ** 31, true, 32, "Int32")).toThrow(
      /out of range/i,
    );
    expect(() => assertIntFits(-1, false, 32, "Uint32")).toThrow(
      /out of range/i,
    );
  });
});
