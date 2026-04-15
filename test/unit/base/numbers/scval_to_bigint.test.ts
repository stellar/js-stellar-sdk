/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { scValToBigInt } from "../../../src/numbers/index.js";
import xdr from "../../../src/xdr.js";

// ---------------------------------------------------------------------------
// scvU32
// ---------------------------------------------------------------------------
describe("scValToBigInt — scvU32", () => {
  it("converts 0", () => {
    expect(scValToBigInt(xdr.ScVal.scvU32(0))).toBe(0n);
  });

  it("converts 1", () => {
    expect(scValToBigInt(xdr.ScVal.scvU32(1))).toBe(1n);
  });

  it("converts max u32 (4294967295)", () => {
    expect(scValToBigInt(xdr.ScVal.scvU32(4294967295))).toBe(4294967295n);
  });

  it("converts mid-range value", () => {
    expect(scValToBigInt(xdr.ScVal.scvU32(123456))).toBe(123456n);
  });
});

// ---------------------------------------------------------------------------
// scvI32
// ---------------------------------------------------------------------------
describe("scValToBigInt — scvI32", () => {
  it("converts 0", () => {
    expect(scValToBigInt(xdr.ScVal.scvI32(0))).toBe(0n);
  });

  it("converts positive", () => {
    expect(scValToBigInt(xdr.ScVal.scvI32(42))).toBe(42n);
  });

  it("converts negative", () => {
    expect(scValToBigInt(xdr.ScVal.scvI32(-42))).toBe(-42n);
  });

  it("converts min i32 (-2147483648)", () => {
    expect(scValToBigInt(xdr.ScVal.scvI32(-2147483648))).toBe(-2147483648n);
  });

  it("converts max i32 (2147483647)", () => {
    expect(scValToBigInt(xdr.ScVal.scvI32(2147483647))).toBe(2147483647n);
  });
});

// ---------------------------------------------------------------------------
// scvU64
// ---------------------------------------------------------------------------
describe("scValToBigInt — scvU64", () => {
  it("converts 0", () => {
    const scv = xdr.ScVal.scvU64(new xdr.Uint64(0));
    expect(scValToBigInt(scv)).toBe(0n);
  });

  it("converts 1", () => {
    const scv = xdr.ScVal.scvU64(new xdr.Uint64(1));
    expect(scValToBigInt(scv)).toBe(1n);
  });

  it("converts large value", () => {
    const scv = xdr.ScVal.scvU64(new xdr.Uint64("18446744073709551615"));
    expect(scValToBigInt(scv)).toBe(18446744073709551615n);
  });

  it("converts mid-range value", () => {
    const scv = xdr.ScVal.scvU64(new xdr.Uint64(1000000n));
    expect(scValToBigInt(scv)).toBe(1000000n);
  });
});

// ---------------------------------------------------------------------------
// scvI64
// ---------------------------------------------------------------------------
describe("scValToBigInt — scvI64", () => {
  it("converts 0", () => {
    const scv = xdr.ScVal.scvI64(new xdr.Int64(0));
    expect(scValToBigInt(scv)).toBe(0n);
  });

  it("converts positive", () => {
    const scv = xdr.ScVal.scvI64(new xdr.Int64(999));
    expect(scValToBigInt(scv)).toBe(999n);
  });

  it("converts negative", () => {
    const scv = xdr.ScVal.scvI64(new xdr.Int64(-999));
    expect(scValToBigInt(scv)).toBe(-999n);
  });

  it("converts max i64", () => {
    const scv = xdr.ScVal.scvI64(new xdr.Int64("9223372036854775807"));
    expect(scValToBigInt(scv)).toBe(9223372036854775807n);
  });

  it("converts min i64", () => {
    const scv = xdr.ScVal.scvI64(new xdr.Int64("-9223372036854775808"));
    expect(scValToBigInt(scv)).toBe(-9223372036854775808n);
  });
});

// ---------------------------------------------------------------------------
// scvTimepoint
// ---------------------------------------------------------------------------
describe("scValToBigInt — scvTimepoint", () => {
  it("converts 0", () => {
    const scv = xdr.ScVal.scvTimepoint(new xdr.Uint64(0));
    expect(scValToBigInt(scv)).toBe(0n);
  });

  it("converts a realistic timestamp", () => {
    const scv = xdr.ScVal.scvTimepoint(new xdr.Uint64(1443571200n));
    expect(scValToBigInt(scv)).toBe(1443571200n);
  });

  it("converts max u64 timepoint", () => {
    const scv = xdr.ScVal.scvTimepoint(
      new xdr.Uint64("18446744073709551615"),
    );
    expect(scValToBigInt(scv)).toBe(18446744073709551615n);
  });
});

// ---------------------------------------------------------------------------
// scvDuration
// ---------------------------------------------------------------------------
describe("scValToBigInt — scvDuration", () => {
  it("converts 0", () => {
    const scv = xdr.ScVal.scvDuration(new xdr.Uint64(0));
    expect(scValToBigInt(scv)).toBe(0n);
  });

  it("converts small duration", () => {
    const scv = xdr.ScVal.scvDuration(new xdr.Uint64(3600n));
    expect(scValToBigInt(scv)).toBe(3600n);
  });

  it("converts large duration", () => {
    const scv = xdr.ScVal.scvDuration(new xdr.Uint64("18446744073709551615"));
    expect(scValToBigInt(scv)).toBe(18446744073709551615n);
  });
});

// ---------------------------------------------------------------------------
// scvU128
// ---------------------------------------------------------------------------
describe("scValToBigInt — scvU128", () => {
  it("converts 0", () => {
    const scv = xdr.ScVal.scvU128(
      new xdr.UInt128Parts({
        lo: new xdr.Uint64(0),
        hi: new xdr.Uint64(0),
      }),
    );
    expect(scValToBigInt(scv)).toBe(0n);
  });

  it("converts 1 (lo only)", () => {
    const scv = xdr.ScVal.scvU128(
      new xdr.UInt128Parts({
        lo: new xdr.Uint64(1),
        hi: new xdr.Uint64(0),
      }),
    );
    expect(scValToBigInt(scv)).toBe(1n);
  });

  it("converts value in hi part only", () => {
    const scv = xdr.ScVal.scvU128(
      new xdr.UInt128Parts({
        lo: new xdr.Uint64(0),
        hi: new xdr.Uint64(1),
      }),
    );
    // 1 << 64
    expect(scValToBigInt(scv)).toBe(1n << 64n);
  });

  it("converts value spanning both parts", () => {
    const scv = xdr.ScVal.scvU128(
      new xdr.UInt128Parts({
        lo: new xdr.Uint64(42),
        hi: new xdr.Uint64(1),
      }),
    );
    expect(scValToBigInt(scv)).toBe((1n << 64n) + 42n);
  });

  it("converts max u128", () => {
    const maxU64 = "18446744073709551615";
    const scv = xdr.ScVal.scvU128(
      new xdr.UInt128Parts({
        lo: new xdr.Uint64(maxU64),
        hi: new xdr.Uint64(maxU64),
      }),
    );
    const maxU128 = (1n << 128n) - 1n;
    expect(scValToBigInt(scv)).toBe(maxU128);
  });

  it("converts a known power of 2", () => {
    // 2^100 = hi: 2^36, lo: 0
    const scv = xdr.ScVal.scvU128(
      new xdr.UInt128Parts({
        lo: new xdr.Uint64(0),
        hi: new xdr.Uint64(1n << 36n),
      }),
    );
    expect(scValToBigInt(scv)).toBe(1n << 100n);
  });
});

// ---------------------------------------------------------------------------
// scvI128
// ---------------------------------------------------------------------------
describe("scValToBigInt — scvI128", () => {
  it("converts 0", () => {
    const scv = xdr.ScVal.scvI128(
      new xdr.Int128Parts({
        lo: new xdr.Uint64(0),
        hi: new xdr.Int64(0),
      }),
    );
    expect(scValToBigInt(scv)).toBe(0n);
  });

  it("converts positive value (lo only)", () => {
    const scv = xdr.ScVal.scvI128(
      new xdr.Int128Parts({
        lo: new xdr.Uint64(100),
        hi: new xdr.Int64(0),
      }),
    );
    expect(scValToBigInt(scv)).toBe(100n);
  });

  it("converts -1", () => {
    // -1 in two's complement i128: all bits set
    const maxU64 = "18446744073709551615";
    const scv = xdr.ScVal.scvI128(
      new xdr.Int128Parts({
        lo: new xdr.Uint64(maxU64),
        hi: new xdr.Int64(-1),
      }),
    );
    expect(scValToBigInt(scv)).toBe(-1n);
  });

  it("converts positive value spanning both parts", () => {
    const scv = xdr.ScVal.scvI128(
      new xdr.Int128Parts({
        lo: new xdr.Uint64(7),
        hi: new xdr.Int64(3),
      }),
    );
    expect(scValToBigInt(scv)).toBe((3n << 64n) + 7n);
  });

  it("converts negative value", () => {
    // -100: hi = -1, lo = (2^64 - 100)
    const lo = (1n << 64n) - 100n;
    const scv = xdr.ScVal.scvI128(
      new xdr.Int128Parts({
        lo: new xdr.Uint64(lo.toString()),
        hi: new xdr.Int64(-1),
      }),
    );
    expect(scValToBigInt(scv)).toBe(-100n);
  });
});

// ---------------------------------------------------------------------------
// scvU256
// ---------------------------------------------------------------------------
describe("scValToBigInt — scvU256", () => {
  it("converts 0", () => {
    const scv = xdr.ScVal.scvU256(
      new xdr.UInt256Parts({
        loLo: new xdr.Uint64(0),
        loHi: new xdr.Uint64(0),
        hiLo: new xdr.Uint64(0),
        hiHi: new xdr.Uint64(0),
      }),
    );
    expect(scValToBigInt(scv)).toBe(0n);
  });

  it("converts 1 (loLo only)", () => {
    const scv = xdr.ScVal.scvU256(
      new xdr.UInt256Parts({
        loLo: new xdr.Uint64(1),
        loHi: new xdr.Uint64(0),
        hiLo: new xdr.Uint64(0),
        hiHi: new xdr.Uint64(0),
      }),
    );
    expect(scValToBigInt(scv)).toBe(1n);
  });

  it("converts value in hiHi part", () => {
    const scv = xdr.ScVal.scvU256(
      new xdr.UInt256Parts({
        loLo: new xdr.Uint64(0),
        loHi: new xdr.Uint64(0),
        hiLo: new xdr.Uint64(0),
        hiHi: new xdr.Uint64(1),
      }),
    );
    // 1 << 192
    expect(scValToBigInt(scv)).toBe(1n << 192n);
  });

  it("converts value in loHi part", () => {
    const scv = xdr.ScVal.scvU256(
      new xdr.UInt256Parts({
        loLo: new xdr.Uint64(0),
        loHi: new xdr.Uint64(1),
        hiLo: new xdr.Uint64(0),
        hiHi: new xdr.Uint64(0),
      }),
    );
    expect(scValToBigInt(scv)).toBe(1n << 64n);
  });

  it("converts value in hiLo part", () => {
    const scv = xdr.ScVal.scvU256(
      new xdr.UInt256Parts({
        loLo: new xdr.Uint64(0),
        loHi: new xdr.Uint64(0),
        hiLo: new xdr.Uint64(1),
        hiHi: new xdr.Uint64(0),
      }),
    );
    expect(scValToBigInt(scv)).toBe(1n << 128n);
  });

  it("converts value spanning all parts", () => {
    const scv = xdr.ScVal.scvU256(
      new xdr.UInt256Parts({
        loLo: new xdr.Uint64(1),
        loHi: new xdr.Uint64(2),
        hiLo: new xdr.Uint64(3),
        hiHi: new xdr.Uint64(4),
      }),
    );
    const expected =
      1n + (2n << 64n) + (3n << 128n) + (4n << 192n);
    expect(scValToBigInt(scv)).toBe(expected);
  });

  it("converts max u256", () => {
    const maxU64 = "18446744073709551615";
    const scv = xdr.ScVal.scvU256(
      new xdr.UInt256Parts({
        loLo: new xdr.Uint64(maxU64),
        loHi: new xdr.Uint64(maxU64),
        hiLo: new xdr.Uint64(maxU64),
        hiHi: new xdr.Uint64(maxU64),
      }),
    );
    const maxU256 = (1n << 256n) - 1n;
    expect(scValToBigInt(scv)).toBe(maxU256);
  });

  it("converts 2^200", () => {
    // 2^200 = hiHi: 2^8, rest: 0
    const scv = xdr.ScVal.scvU256(
      new xdr.UInt256Parts({
        loLo: new xdr.Uint64(0),
        loHi: new xdr.Uint64(0),
        hiLo: new xdr.Uint64(0),
        hiHi: new xdr.Uint64(1n << 8n),
      }),
    );
    expect(scValToBigInt(scv)).toBe(1n << 200n);
  });
});

// ---------------------------------------------------------------------------
// scvI256
// ---------------------------------------------------------------------------
describe("scValToBigInt — scvI256", () => {
  it("converts 0", () => {
    const scv = xdr.ScVal.scvI256(
      new xdr.Int256Parts({
        loLo: new xdr.Uint64(0),
        loHi: new xdr.Uint64(0),
        hiLo: new xdr.Uint64(0),
        hiHi: new xdr.Int64(0),
      }),
    );
    expect(scValToBigInt(scv)).toBe(0n);
  });

  it("converts 1", () => {
    const scv = xdr.ScVal.scvI256(
      new xdr.Int256Parts({
        loLo: new xdr.Uint64(1),
        loHi: new xdr.Uint64(0),
        hiLo: new xdr.Uint64(0),
        hiHi: new xdr.Int64(0),
      }),
    );
    expect(scValToBigInt(scv)).toBe(1n);
  });

  it("converts -1", () => {
    const maxU64 = "18446744073709551615";
    const scv = xdr.ScVal.scvI256(
      new xdr.Int256Parts({
        loLo: new xdr.Uint64(maxU64),
        loHi: new xdr.Uint64(maxU64),
        hiLo: new xdr.Uint64(maxU64),
        hiHi: new xdr.Int64(-1),
      }),
    );
    expect(scValToBigInt(scv)).toBe(-1n);
  });

  it("converts positive value spanning parts", () => {
    const scv = xdr.ScVal.scvI256(
      new xdr.Int256Parts({
        loLo: new xdr.Uint64(5),
        loHi: new xdr.Uint64(0),
        hiLo: new xdr.Uint64(0),
        hiHi: new xdr.Int64(1),
      }),
    );
    expect(scValToBigInt(scv)).toBe((1n << 192n) + 5n);
  });

  it("converts negative value", () => {
    // -100: hiHi = -1, hiLo = maxU64, loHi = maxU64, loLo = maxU64 - 99
    const maxU64Str = "18446744073709551615";
    const loLo = (1n << 64n) - 100n;
    const scv = xdr.ScVal.scvI256(
      new xdr.Int256Parts({
        loLo: new xdr.Uint64(loLo.toString()),
        loHi: new xdr.Uint64(maxU64Str),
        hiLo: new xdr.Uint64(maxU64Str),
        hiHi: new xdr.Int64(-1),
      }),
    );
    expect(scValToBigInt(scv)).toBe(-100n);
  });
});

// ---------------------------------------------------------------------------
// Error cases
// ---------------------------------------------------------------------------
describe("scValToBigInt — error cases", () => {
  it("throws on scvVoid", () => {
    expect(() => scValToBigInt(xdr.ScVal.scvVoid())).toThrow(TypeError);
  });

  it("throws on scvBool", () => {
    expect(() => scValToBigInt(xdr.ScVal.scvBool(true))).toThrow(TypeError);
  });

  it("throws on scvString", () => {
    expect(() => scValToBigInt(xdr.ScVal.scvString("hello"))).toThrow(
      TypeError,
    );
  });

  it("throws on scvSymbol", () => {
    expect(() => scValToBigInt(xdr.ScVal.scvSymbol("sym"))).toThrow(TypeError);
  });

  it("throws on scvBytes", () => {
    expect(() =>
      scValToBigInt(xdr.ScVal.scvBytes(Buffer.from([1, 2, 3]))),
    ).toThrow(TypeError);
  });

  it("throws on scvVec", () => {
    expect(() =>
      scValToBigInt(xdr.ScVal.scvVec([xdr.ScVal.scvU32(1)])),
    ).toThrow(TypeError);
  });

  it("throws on scvMap", () => {
    expect(() => scValToBigInt(xdr.ScVal.scvMap([]))).toThrow(TypeError);
  });

  it("throws with message containing the type name", () => {
    expect(() => scValToBigInt(xdr.ScVal.scvBool(true))).toThrow(
      /expected integer type, got scvBool/,
    );
  });

  it("throws with message containing the type name for string", () => {
    expect(() => scValToBigInt(xdr.ScVal.scvString("x"))).toThrow(
      /expected integer type, got scvString/,
    );
  });
});

// ---------------------------------------------------------------------------
// Round-trip consistency: construct -> scValToBigInt -> verify
// ---------------------------------------------------------------------------
describe("scValToBigInt — round-trip consistency", () => {
  it("u32 and i32 produce the same bigint for the same positive value", () => {
    const u = scValToBigInt(xdr.ScVal.scvU32(100));
    const i = scValToBigInt(xdr.ScVal.scvI32(100));
    expect(u).toBe(i);
  });

  it("u64 and i64 produce the same bigint for the same positive value", () => {
    const u = scValToBigInt(xdr.ScVal.scvU64(new xdr.Uint64(100)));
    const i = scValToBigInt(xdr.ScVal.scvI64(new xdr.Int64(100)));
    expect(u).toBe(i);
  });

  it("u128 value 42 matches u64 value 42", () => {
    const from64 = scValToBigInt(xdr.ScVal.scvU64(new xdr.Uint64(42)));
    const from128 = scValToBigInt(
      xdr.ScVal.scvU128(
        new xdr.UInt128Parts({
          lo: new xdr.Uint64(42),
          hi: new xdr.Uint64(0),
        }),
      ),
    );
    expect(from64).toBe(from128);
  });

  it("u256 value 42 matches u128 value 42", () => {
    const from128 = scValToBigInt(
      xdr.ScVal.scvU128(
        new xdr.UInt128Parts({
          lo: new xdr.Uint64(42),
          hi: new xdr.Uint64(0),
        }),
      ),
    );
    const from256 = scValToBigInt(
      xdr.ScVal.scvU256(
        new xdr.UInt256Parts({
          loLo: new xdr.Uint64(42),
          loHi: new xdr.Uint64(0),
          hiLo: new xdr.Uint64(0),
          hiHi: new xdr.Uint64(0),
        }),
      ),
    );
    expect(from128).toBe(from256);
  });

  it("i128 negative matches i64 negative for small values", () => {
    const from64 = scValToBigInt(xdr.ScVal.scvI64(new xdr.Int64(-50)));
    const maxU64 = "18446744073709551615";
    const lo = (1n << 64n) - 50n;
    const from128 = scValToBigInt(
      xdr.ScVal.scvI128(
        new xdr.Int128Parts({
          lo: new xdr.Uint64(lo.toString()),
          hi: new xdr.Int64(-1),
        }),
      ),
    );
    expect(from64).toBe(from128);
  });

  it("timepoint and duration with same value produce same bigint", () => {
    const tp = scValToBigInt(xdr.ScVal.scvTimepoint(new xdr.Uint64(999)));
    const dur = scValToBigInt(xdr.ScVal.scvDuration(new xdr.Uint64(999)));
    expect(tp).toBe(dur);
  });
});