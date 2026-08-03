import { describe, it, expect } from "vitest";
import { XdrError } from "@stellar/js-xdr";

import {
  Memo,
  ScVal,
  Int128,
  Uint128,
  Int256,
  Uint256,
} from "../../../src/xdr/index.js";
import { assertDecimalDigitBudget } from "../../../src/xdr/values/bigint-parts.js";

// JSON integer decode paths check the decimal string's length before calling
// BigInt() on it. A string longer than the target width's digit budget can
// never be in range, so it is rejected up front instead of being parsed first.

const HUGE = "9".repeat(1_000_000);

describe("assertDecimalDigitBudget (unit)", () => {
  // Budget = ceil(bits * log10(2)) + 2; the +2 covers a leading '-' plus one
  // digit of rounding headroom.
  it.each([
    [64, 22],
    [128, 41],
    [256, 80],
  ])("%d-bit budget is %d characters", (bits, budget) => {
    expect(() =>
      assertDecimalDigitBudget("9".repeat(budget), bits, "t"),
    ).not.toThrow();
    expect(() =>
      assertDecimalDigitBudget("9".repeat(budget + 1), bits, "t"),
    ).toThrow(XdrError);
  });

  it("includes the type name and budget in the error", () => {
    expect(() => assertDecimalDigitBudget(HUGE, 64, "Memo")).toThrow(
      /Memo: decimal string length 1000000 exceeds the 22-character budget/,
    );
  });
});

describe("over-long decimal strings are rejected before the BigInt parse", () => {
  it("walkFromJson uint64 (Memo.id) throws on a 1M-digit string", () => {
    expect(() => Memo.fromJson({ id: HUGE })).toThrow(/exceeds the/);
  });

  it("walkFromJson int64 (ScVal.i64) throws on a 1M-digit string", () => {
    expect(() => ScVal.fromJson({ i64: HUGE })).toThrow(/exceeds the/);
    expect(() => ScVal.fromJson({ i64: `-${HUGE}` })).toThrow(/exceeds the/);
  });

  it.each(["i128", "u128", "i256", "u256"] as const)(
    "%s Parts override throws on a 1M-digit string",
    (key) => {
      expect(() => ScVal.fromJson({ [key]: HUGE })).toThrow(/exceeds the/);
    },
  );

  it("rejects long non-canonical spellings BigInt() would tolerate", () => {
    // BigInt("000…001") === 1n, but SEP-51 fields are canonical decimal, so
    // padding past the digit budget is rejected (documented behavior change).
    expect(() => Memo.fromJson({ id: `${"0".repeat(10_000)}1` })).toThrow(
      /exceeds the/,
    );
  });

  it("reports the length budget, not an out-of-range value", () => {
    // The budget error proves the rejection happened before the parse: a
    // parse-then-check ordering would throw the `out of range` message from
    // assertBigIntFits and interpolate the whole 1M-digit value into it.
    expect(() => Memo.fromJson({ id: HUGE })).toThrow(
      /decimal string length 1000000 exceeds the 22-character budget/,
    );
    expect(() => Memo.fromJson({ id: HUGE })).not.toThrow(/out of range/);
  });
});

describe("extreme in-range values still parse", () => {
  it("uint64 max (2^64 - 1)", () => {
    expect(Memo.fromJson({ id: "18446744073709551615" }).value).toBe(
      18446744073709551615n,
    );
  });

  it("int64 max/min", () => {
    expect(ScVal.fromJson({ i64: "9223372036854775807" }).value).toBe(
      9223372036854775807n,
    );
    expect(ScVal.fromJson({ i64: "-9223372036854775808" }).value).toBe(
      -9223372036854775808n,
    );
  });

  const U128_MAX = (1n << 128n) - 1n;
  const I128_MAX = (1n << 127n) - 1n;
  const I128_MIN = -(1n << 127n);
  const U256_MAX = (1n << 256n) - 1n;
  const I256_MAX = (1n << 255n) - 1n;
  const I256_MIN = -(1n << 255n);

  it.each([
    ["u128 max", "u128", U128_MAX],
    ["i128 max", "i128", I128_MAX],
    ["i128 min", "i128", I128_MIN],
    ["u256 max", "u256", U256_MAX],
    ["i256 max", "i256", I256_MAX],
    ["i256 min", "i256", I256_MIN],
  ] as const)("%s via ScVal JSON", (_label, key, value) => {
    const round = ScVal.fromJson({ [key]: value.toString() });
    expect(round.toJson()).toEqual({ [key]: value.toString() });
  });

  it.each([
    [Uint128, U128_MAX],
    [Int128, I128_MAX],
    [Int128, I128_MIN],
    [Uint256, U256_MAX],
    [Int256, I256_MAX],
    [Int256, I256_MIN],
  ] as const)("wide-int constructor accepts extreme %#", (Ctor, value) => {
    expect(new Ctor(value.toString()).value).toBe(value);
  });
});
