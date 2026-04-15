import { describe, it, expect } from "vitest";
import { ScInt } from "../../../src/numbers/sc_int.js";
import { Int128 } from "../../../src/numbers/int128.js";
import { Uint128 } from "../../../src/numbers/uint128.js";
import { Int256 } from "../../../src/numbers/int256.js";
import { Uint256 } from "../../../src/numbers/uint256.js";
import {
  ScIntType,
  scValToBigInt,
  XdrLargeInt,
} from "../../../src/numbers/index.js";
import xdr from "../../../src/xdr.js";

describe("ScInt", () => {
  describe("constructor - input type conversion", () => {
    describe("bigint inputs", () => {
      it("accepts positive bigints", () => {
        const sci = new ScInt(42n);
        expect(sci.toBigInt()).toBe(42n);
      });

      it("accepts negative bigints", () => {
        const sci = new ScInt(-42n);
        expect(sci.toBigInt()).toBe(-42n);
      });

      it("accepts zero as bigint", () => {
        const sci = new ScInt(0n);
        expect(sci.toBigInt()).toBe(0n);
      });

      it("accepts large bigints", () => {
        const large = 1n << 200n;
        const sci = new ScInt(large);
        expect(sci.toBigInt()).toBe(large);
      });
    });

    describe("number inputs", () => {
      it("accepts positive integers", () => {
        const sci = new ScInt(42);
        expect(sci.toBigInt()).toBe(42n);
      });

      it("accepts negative integers", () => {
        const sci = new ScInt(-42);
        expect(sci.toBigInt()).toBe(-42n);
      });

      it("accepts zero", () => {
        const sci = new ScInt(0);
        expect(sci.toBigInt()).toBe(0n);
      });

      it("accepts hex literals", () => {
        const sci = new ScInt(0xdeadbeef);
        // 0xdeadbeef in decimal is 3735928559
        expect(sci.toBigInt()).toBe(3735928559n);
      });

      it("throws on decimal numbers", () => {
        expect(() => new ScInt(3.14)).toThrow();
      });

      it("throws on Infinity", () => {
        expect(() => new ScInt(Infinity)).toThrow();
      });

      it("throws on NaN", () => {
        expect(() => new ScInt(NaN)).toThrow();
      });
    });

    describe("string inputs", () => {
      it("accepts numeric strings", () => {
        const sci = new ScInt("123456789");
        expect(sci.toBigInt()).toBe(123456789n);
      });

      it("accepts negative numeric strings", () => {
        const sci = new ScInt("-123456789");
        expect(sci.toBigInt()).toBe(-123456789n);
      });

      it("accepts zero string", () => {
        const sci = new ScInt("0");
        expect(sci.toBigInt()).toBe(0n);
      });

      it("accepts numeric strings up to safe conversion range", () => {
        // Large strings may overflow; testing with 16-digit string
        const largeStr = "9999999999999999";
        const sci = new ScInt(largeStr);
        expect(sci.toBigInt()).toBe(BigInt(largeStr));
      });

      it("throws on non-numeric strings", () => {
        expect(() => new ScInt("hello")).toThrow(SyntaxError);
      });

      it("throws on decimal strings", () => {
        expect(() => new ScInt("3.14")).toThrow(SyntaxError);
      });

      it("handles empty string", () => {
        // Empty string is treated as zero or doesn't throw
        const sci = new ScInt("");
        expect(sci.toBigInt()).toBe(0n);
      });
    });
  });

  describe("type auto-selection", () => {
    it("selects u64 for small positive numbers", () => {
      const sci = new ScInt(100n);
      expect(sci.type).toBe("u64");
    });

    it("selects i64 for small negative numbers", () => {
      const sci = new ScInt(-100n);
      expect(sci.type).toBe("i64");
    });

    it("selects u64 for numbers up to u64 max", () => {
      const max = (1n << 64n) - 1n;
      const sci = new ScInt(max);
      expect(sci.type).toBe("u64");
    });

    it("selects u128 for numbers between u64 and u128 max", () => {
      const val = 1n << 64n;
      const sci = new ScInt(val);
      expect(sci.type).toBe("u128");
    });

    it("selects u128 for numbers up to u128 max", () => {
      const max = (1n << 128n) - 1n;
      const sci = new ScInt(max);
      expect(sci.type).toBe("u128");
    });

    it("selects u256 for numbers between u128 and u256 max", () => {
      const val = 1n << 128n;
      const sci = new ScInt(val);
      expect(sci.type).toBe("u256");
    });

    it("selects u256 for numbers up to u256 max", () => {
      const max = (1n << 256n) - 1n;
      const sci = new ScInt(max);
      expect(sci.type).toBe("u256");
    });

    it("throws for numbers exceeding u256 max", () => {
      const tooLarge = 1n << 256n;
      expect(() => new ScInt(tooLarge)).toThrow(RangeError);
    });

    it("selects i64 for negative numbers in i64 range", () => {
      const sci = new ScInt(-(1n << 63n) + 1n);
      expect(sci.type).toBe("i64");
    });

    it("selects i64 for the exact i64 minimum (-(2^63))", () => {
      const min = -(2n ** 63n);
      const sci = new ScInt(min);
      expect(sci.type).toBe("i64");
    });

    it("selects i128 for the exact i128 minimum (-(2^127))", () => {
      const min = -(2n ** 127n);
      const sci = new ScInt(min);
      expect(sci.type).toBe("i128");
    });

    it("selects i256 for the exact i256 minimum (-(2^255))", () => {
      const min = -(2n ** 255n);
      const sci = new ScInt(min);
      expect(sci.type).toBe("i256");
    });

    it("selects i128 for -(2^63)-1 (just below i64 minimum)", () => {
      const val = -(2n ** 63n) - 1n;
      const sci = new ScInt(val);
      expect(sci.type).toBe("i128");
      expect(sci.toBigInt()).toBe(val);
    });

    it("selects i256 for -(2^127)-1 (just below i128 minimum)", () => {
      const val = -(2n ** 127n) - 1n;
      const sci = new ScInt(val);
      expect(sci.type).toBe("i256");
      expect(sci.toBigInt()).toBe(val);
    });

    it("throws for -(2^255)-1 (below i256 minimum)", () => {
      const val = -(2n ** 255n) - 1n;
      expect(() => new ScInt(val)).toThrow(RangeError);
    });

    it("selects i128 for negative numbers beyond i64 range", () => {
      const val = -(1n << 64n);
      const sci = new ScInt(val);
      expect(sci.type).toBe("i128");
    });

    it("selects i256 for large negative numbers", () => {
      const val = -(1n << 200n);
      const sci = new ScInt(val);
      expect(sci.type).toBe("i256");
    });
  });

  describe("opts.type parameter", () => {
    it("forces u64 type", () => {
      const sci = new ScInt(42n, { type: "u64" });
      expect(sci.type).toBe("u64");
    });

    it("forces i64 type", () => {
      const sci = new ScInt(42n, { type: "i64" });
      expect(sci.type).toBe("i64");
    });

    it("forces u128 type", () => {
      const sci = new ScInt(42n, { type: "u128" });
      expect(sci.type).toBe("u128");
    });

    it("forces i128 type", () => {
      const sci = new ScInt(42n, { type: "i128" });
      expect(sci.type).toBe("i128");
    });

    it("forces u256 type", () => {
      const sci = new ScInt(42n, { type: "u256" });
      expect(sci.type).toBe("u256");
    });

    it("forces i256 type", () => {
      const sci = new ScInt(42n, { type: "i256" });
      expect(sci.type).toBe("i256");
    });

    it("preserves the original value with forced type", () => {
      const sci = new ScInt(12345n, { type: "u256" });
      expect(sci.toBigInt()).toBe(12345n);
    });

    it("allows extra properties in opts", () => {
      const sci = new ScInt(42n, { type: "u64", extraProp: "value" });
      expect(sci.toBigInt()).toBe(42n);
    });
  });

  describe("signedness validation", () => {
    it("throws when negative value with unsigned type u64", () => {
      expect(() => new ScInt(-1n, { type: "u64" })).toThrow(TypeError);
    });

    it("throws when negative value with unsigned type u128", () => {
      expect(() => new ScInt(-1n, { type: "u128" })).toThrow(TypeError);
    });

    it("throws when negative value with unsigned type u256", () => {
      expect(() => new ScInt(-1n, { type: "u256" })).toThrow(TypeError);
    });

    it("error message includes the specified type", () => {
      try {
        new ScInt(-42n, { type: "u64" });
        expect.fail("should have thrown");
      } catch (e) {
        if (e instanceof TypeError) {
          expect(e.message).toContain("u64");
        } else {
          throw e;
        }
      }
    });

    it("error message includes the negative value", () => {
      try {
        new ScInt(-42n, { type: "u128" });
        expect.fail("should have thrown");
      } catch (e) {
        if (e instanceof TypeError) {
          expect(e.message).toContain("-42");
        } else {
          throw e;
        }
      }
    });

    it("allows negative values with signed types", () => {
      const i64 = new ScInt(-42n, { type: "i64" });
      expect(i64.toBigInt()).toBe(-42n);

      const i128 = new ScInt(-42n, { type: "i128" });
      expect(i128.toBigInt()).toBe(-42n);

      const i256 = new ScInt(-42n, { type: "i256" });
      expect(i256.toBigInt()).toBe(-42n);
    });

    it("allows positive values with signed types", () => {
      const sci = new ScInt(42n, { type: "i64" });
      expect(sci.toBigInt()).toBe(42n);
    });
  });

  describe("edge cases", () => {
    it("handles zero with any type", () => {
      const types = ["u64", "i64", "u128", "i128", "u256", "i256"] as const;
      types.forEach((type) => {
        const sci = new ScInt(0n, { type });
        expect(sci.toBigInt()).toBe(0n);
      });
    });

    it("handles max u64 value", () => {
      const max = (1n << 64n) - 1n;
      const sci = new ScInt(max, { type: "u64" });
      expect(sci.toBigInt()).toBe(max);
    });

    it("handles min i64 value", () => {
      const min = -(1n << 63n);
      const sci = new ScInt(min, { type: "i64" });
      expect(sci.toBigInt()).toBe(min);
    });

    it("handles max i64 value", () => {
      const max = (1n << 63n) - 1n;
      const sci = new ScInt(max, { type: "i64" });
      expect(sci.toBigInt()).toBe(max);
    });

    // TODO: @stellar/js-xdr@4.0.0 now throws RangeError for oversized values
    // instead of silently wrapping. Once the XDR upgrade is finalized, change
    // this test to: expect(() => new ScInt(tooLarge, { type: "u64" })).toThrow(RangeError);
    it("wraps oversized values for specified type (overflow to zero)", () => {
      const tooLarge = 1n << 64n;
      const sci = new ScInt(tooLarge, { type: "u64" });
      // Value overflows and wraps to 0 when type is u64
      expect(sci.toBigInt()).toBe(0n);
    });

    it("converts string negative to bigint correctly", () => {
      const sci = new ScInt("-999999999999999999");
      expect(sci.toBigInt()).toBe(-999999999999999999n);
      expect(sci.type).toMatch(/^i/);
    });
  });

  describe("optional opts parameter", () => {
    it("works without opts parameter", () => {
      const sci = new ScInt(42n);
      expect(sci.toBigInt()).toBe(42n);
    });

    it("works with undefined opts", () => {
      const sci = new ScInt(42n, undefined);
      expect(sci.toBigInt()).toBe(42n);
    });

    it("works with empty opts object", () => {
      const sci = new ScInt(42n, {});
      expect(sci.toBigInt()).toBe(42n);
    });
  });

  describe("integration with parent class", () => {
    it("returns a valid ScInt instance", () => {
      const sci = new ScInt(42n);
      expect(sci).toBeInstanceOf(ScInt);
    });

    it("has type property from parent", () => {
      const sci = new ScInt(42n);
      expect(sci).toHaveProperty("type");
    });

    it("has toBigInt method from parent", () => {
      const sci = new ScInt(42n);
      expect(typeof sci.toBigInt).toBe("function");
    });
  });

  // ========================================
  // Tests migrated from scint_test.js
  // Ensuring no test coverage is lost during JS to TS migration
  // ========================================

  describe("creating large integers - from scint_test.js", () => {
    describe("picks the right types", () => {
      const typeTests = {
        u64: [1, "1", 0xdeadbeef, (1n << 64n) - 1n],
        u128: [1n << 64n, (1n << 128n) - 1n, "18446744073709551616"],
        u256: [
          1n << 128n,
          (1n << 256n) - 1n,
          "340282366920938463463374607431768211456",
        ],
      };

      Object.entries(typeTests).forEach(([type, values]) => {
        values.forEach((value) => {
          it(`picks ${type} for ${value}`, () => {
            const bi = new ScInt(value);
            expect(bi.type).toBe(type);
            expect(bi.toBigInt()).toBe(BigInt(value));
          });
        });
      });
    });

    it("has correct utility methods", () => {
      const v =
        123456789123456789123456789123456789123456789123456789123456789123456789n;
      const i = new ScInt(v);
      expect(i.valueOf()).toEqual(new Uint256(v));
      expect(i.toString()).toBe(
        "123456789123456789123456789123456789123456789123456789123456789123456789",
      );
      expect(i.toJSON()).toEqual({ value: v.toString(), type: "u256" });
    });

    describe("64 bit inputs", () => {
      const sentinel = 800000085n;

      it("handles u64", () => {
        let b = new ScInt(sentinel);
        expect(b.toBigInt()).toBe(sentinel);
        expect(b.toNumber()).toBe(Number(sentinel));
        let u64 = b.toU64().u64();
        expect(u64.low).toBe(Number(sentinel));
        expect(u64.high).toBe(0);

        b = new ScInt(-sentinel);
        expect(b.toBigInt()).toBe(-sentinel);
        expect(b.toNumber()).toBe(Number(-sentinel));
        u64 = b.toU64().u64();
        expect(u64.low).toBe(b.toNumber());
        expect(u64.high).toBe(-1);
      });

      it("handles timepoint", () => {
        const b = new ScInt(sentinel);
        expect(b.toBigInt()).toBe(sentinel);
        expect(b.toNumber()).toBe(Number(sentinel));
        const u64 = b.toTimepoint().timepoint();
        expect(u64.low).toBe(Number(sentinel));
        expect(u64.high).toBe(0);
      });

      it("handles duration", () => {
        const b = new ScInt(sentinel);
        expect(b.toBigInt()).toBe(sentinel);
        expect(b.toNumber()).toBe(Number(sentinel));
        const u64 = b.toDuration().duration();
        expect(u64.low).toBe(Number(sentinel));
        expect(u64.high).toBe(0);
      });

      it("handles i64", () => {
        const b = new ScInt(sentinel);
        expect(b.toBigInt()).toBe(sentinel);
        expect(b.toNumber()).toBe(Number(sentinel));
        const i64 = b.toI64().i64();

        expect(new xdr.Int64([i64.low, i64.high]).toBigInt()).toBe(sentinel);
      });

      it("upscales u64 to 128", () => {
        const b = new ScInt(sentinel);
        const i128 = b.toI128().i128();
        expect(i128.lo().toBigInt()).toBe(sentinel);
        expect(i128.hi().toBigInt()).toBe(0n);
      });

      it("upscales i64 to 128", () => {
        const b = new ScInt(-sentinel);
        const i128 = b.toI128().i128();
        const hi = i128.hi().toBigInt();
        const lo = i128.lo().toBigInt();

        const assembled = new Int128(lo, hi).toBigInt();
        expect(assembled).toBe(-sentinel);
      });

      it("upscales i64 to 256", () => {
        const b = new ScInt(sentinel);
        const i = b.toI256().i256();

        const [hiHi, hiLo, loHi, loLo] = [
          i.hiHi(),
          i.hiLo(),
          i.loHi(),
          i.loLo(),
        ].map((i) => i.toBigInt()) as [bigint, bigint, bigint, bigint];

        expect(hiHi).toBe(0n);
        expect(hiLo).toBe(0n);
        expect(loHi).toBe(0n);
        expect(loLo).toBe(sentinel);

        let assembled = new Int256(loLo, loHi, hiLo, hiHi).toBigInt();
        expect(assembled).toBe(sentinel);

        assembled = new Uint256(loLo, loHi, hiLo, hiHi).toBigInt();
        expect(assembled).toBe(sentinel);
      });

      it("upscales negative i64 to 256", () => {
        const b = new ScInt(-sentinel);
        const i = b.toI256().i256();

        const [hiHi, hiLo, loHi, loLo] = [
          i.hiHi(),
          i.hiLo(),
          i.loHi(),
          i.loLo(),
        ].map((i) => i.toBigInt()) as [bigint, bigint, bigint, bigint];

        expect(hiHi).toBe(-1n);
        expect(hiLo).toBe(BigInt.asUintN(64, -1n));
        expect(loHi).toBe(BigInt.asUintN(64, -1n));
        expect(loLo).toBe(BigInt.asUintN(64, -sentinel));

        let assembled = new Int256(loLo, loHi, hiLo, hiHi).toBigInt();
        expect(assembled).toBe(-sentinel);

        assembled = new Uint256(loLo, loHi, hiLo, hiHi).toBigInt();
        expect(assembled).toBe(BigInt.asUintN(256, -sentinel));
      });
    });

    describe("128 bit inputs", () => {
      const sentinel = 800000000000000000000085n; // 80 bits long

      it("handles inputs", () => {
        let b = new ScInt(sentinel);
        expect(b.toBigInt()).toBe(sentinel);
        expect(() => b.toNumber()).toThrow(/not in range/i);
        expect(() => b.toU64()).toThrow(/too large/i);
        expect(() => b.toI64()).toThrow(/too large/i);

        let u128 = b.toU128().u128();
        expect(
          new Uint128(
            u128.lo().low,
            u128.lo().high,
            u128.hi().low,
            u128.hi().high,
          ).toBigInt(),
        ).toBe(sentinel);

        b = new ScInt(-sentinel);
        u128 = b.toU128().u128();
        expect(
          new Uint128(
            u128.lo().low,
            u128.lo().high,
            u128.hi().low,
            u128.hi().high,
          ).toBigInt(),
        ).toBe(BigInt.asUintN(128, -sentinel));

        b = new ScInt(sentinel);
        let i128 = b.toI128().i128();
        expect(
          new Int128(
            i128.lo().low,
            i128.lo().high,
            i128.hi().low,
            i128.hi().high,
          ).toBigInt(),
        ).toBe(sentinel);

        b = new ScInt(-sentinel);
        i128 = b.toI128().i128();
        expect(
          new Int128(
            i128.lo().low,
            i128.lo().high,
            i128.hi().low,
            i128.hi().high,
          ).toBigInt(),
        ).toBe(-sentinel);
      });

      it("upscales to 256 bits", () => {
        const sentinel = 800000000000000000000085n;
        const b = new ScInt(-sentinel);
        const i256 = b.toI256().i256();
        const u256 = b.toU256().u256();

        expect(
          new Int256(
            i256.loLo().low,
            i256.loLo().high,
            i256.loHi().low,
            i256.loHi().high,
            i256.hiLo().low,
            i256.hiLo().high,
            i256.hiHi().low,
            i256.hiHi().high,
          ).toBigInt(),
        ).toBe(-sentinel);

        expect(
          new Uint256(
            u256.loLo().low,
            u256.loLo().high,
            u256.loHi().low,
            u256.loHi().high,
            u256.hiLo().low,
            u256.hiLo().high,
            u256.hiHi().low,
            u256.hiHi().high,
          ).toBigInt(),
        ).toBe(BigInt.asUintN(256, -sentinel));
      });
    });

    describe("conversion to/from ScVals", () => {
      const v = 80000085n;
      const i = new ScInt(v);

      (
        [
          [i.toI64(), "i64"],
          [i.toU64(), "u64"],
          [i.toI128(), "i128"],
          [i.toU128(), "u128"],
          [i.toI256(), "i256"],
          [i.toU256(), "u256"],
        ] as const
      ).forEach(([scv, scvType]) => {
        it(`works for ${scvType}`, () => {
          expect(scv.switch().name).toBe(`scv${scvType.toUpperCase()}`);
          expect(typeof scv.toXDR("base64")).toBe("string");

          const bigi = scValToBigInt(scv);
          expect(bigi).toBe(v);
          expect(new ScInt(bigi, { type: scvType }).toJSON()).toEqual({
            ...i.toJSON(),
            type: scvType,
          });
        });
      });

      it("works for 32-bit", () => {
        const i32 = xdr.ScVal.scvI32(Number(v));
        const u32 = xdr.ScVal.scvU32(Number(v));

        expect(scValToBigInt(i32)).toBe(v);
        expect(scValToBigInt(u32)).toBe(v);
      });

      it("throws for non-integers", () => {
        expect(() => scValToBigInt(xdr.ScVal.scvString("hello"))).toThrow(
          /integer/i,
        );
      });
    });

    describe("error handling", () => {
      ["u64", "u128", "u256"].forEach((type) => {
        it(`throws when signed parts and {type: '${type}'}`, () => {
          expect(() => new ScInt(-2, { type: type as ScIntType })).toThrow(
            /negative/i,
          );
        });
      });

      it("correctly sizes 2^64 passed as a string", () => {
        const i = new ScInt("18446744073709551616");

        expect(i.type).toBe("u128");
        expect(i.toBigInt()).toBe(18446744073709551616n);
      });

      it("throws when too big", () => {
        expect(() => new ScInt(1n << 400n)).toThrow(/expected/i);
      });

      it("throws when big interpreted as small", () => {
        let big: ScInt;

        big = new ScInt(1n << 64n);
        expect(() => big.toNumber()).toThrow(/not in range/i);

        big = new ScInt(Number.MAX_SAFE_INTEGER + 1);
        expect(() => big.toNumber()).toThrow(/not in range/i);

        big = new ScInt(1, { type: "i128" });
        expect(() => big.toU64()).toThrow(/too large/i);
        expect(() => big.toI64()).toThrow(/too large/i);

        big = new ScInt(1, { type: "i256" });
        expect(() => big.toU64()).toThrow(/too large/i);
        expect(() => big.toI64()).toThrow(/too large/i);
        expect(() => big.toI128()).toThrow(/too large/i);
        expect(() => big.toU128()).toThrow(/too large/i);
      });
    });
  });

  describe("creating raw large XDR integers - from scint_test.js", () => {
    describe("array inputs", () => {
      (
        [
          ["i64", 2],
          ["i128", 4],
          ["i256", 8],
        ] as const
      ).forEach(([type, count]) => {
        it(`works for ${type}`, () => {
          const input: bigint[] = Array.from({ length: count }, () => 1n);
          const xdrI = new XdrLargeInt(type, input);

          const expected = input.reduce((accum, v) => {
            return (accum << 32n) | v;
          }, 0n);

          expect(xdrI.toBigInt()).toBe(expected);
        });
      });
    });
  });
});
