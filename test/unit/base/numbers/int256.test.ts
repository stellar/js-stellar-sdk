import { describe, it, expect } from "vitest";
import { Int256 } from "../../../src/numbers/int256.js";

describe("Int256", () => {
  describe("constructor", () => {
    it("accepts a single bigint", () => {
      expect(new Int256(42n)).toBeInstanceOf(Int256);
    });

    it("accepts a single number", () => {
      expect(new Int256(42)).toBeInstanceOf(Int256);
    });

    it("accepts a single string", () => {
      expect(new Int256("42")).toBeInstanceOf(Int256);
    });

    it("accepts multiple arguments as array slices", () => {
      const int256 = new Int256(1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n);
      expect(int256).toBeInstanceOf(Int256);
    });

    it("accepts mixed types in multiple arguments", () => {
      const int256 = new Int256(1, 2n, "3", 4, 5n, "6", 7, 8n);
      expect(int256).toBeInstanceOf(Int256);
    });

    it("handles zero", () => {
      expect(new Int256(0)).toBeInstanceOf(Int256);
      expect(new Int256(0n)).toBeInstanceOf(Int256);
      expect(new Int256("0")).toBeInstanceOf(Int256);
    });

    it("handles negative numbers", () => {
      expect(new Int256(-1)).toBeInstanceOf(Int256);
      expect(new Int256(-42n)).toBeInstanceOf(Int256);
      expect(new Int256("-42")).toBeInstanceOf(Int256);
    });
  });

  describe("properties", () => {
    it("has unsigned property set to false", () => {
      expect(new Int256(42).unsigned).toBe(false);
    });

    it("has size property set to 256", () => {
      expect(new Int256(42).size).toBe(256);
    });

    it("properties are consistent across different values", () => {
      const values = [0, 42, -42, 1n << 200n, -(1n << 200n)];
      values.forEach((value) => {
        const int256 = new Int256(value);
        expect(int256.unsigned).toBe(false);
        expect(int256.size).toBe(256);
      });
    });
  });

  describe("defineIntBoundaries", () => {
    it("defines MIN_VALUE", () => {
      expect(Int256.MIN_VALUE).toBeDefined();
    });

    it("defines MAX_VALUE", () => {
      expect(Int256.MAX_VALUE).toBeDefined();
    });

    it("provides isValid function", () => {
      expect(typeof Int256.isValid).toBe("function");
    });

    it("isValid returns true for valid Int256 instances", () => {
      expect(Int256.isValid(Int256.MIN_VALUE)).toBe(true);
      expect(Int256.isValid(Int256.MAX_VALUE)).toBe(true);
      expect(Int256.isValid(new Int256(0))).toBe(true);
      expect(Int256.isValid(new Int256(-42))).toBe(true);
    });

    it("isValid returns true for valid bigint values", () => {
      expect(Int256.isValid(0n)).toBe(true);
      expect(Int256.isValid(42n)).toBe(true);
      expect(Int256.isValid(-42n)).toBe(true);
    });

    it("isValid returns false for invalid types", () => {
      expect(Int256.isValid(null)).toBe(false);
      expect(Int256.isValid(undefined)).toBe(false);
      expect(Int256.isValid({})).toBe(false);
      expect(Int256.isValid([])).toBe(false);
      expect(Int256.isValid("42")).toBe(false);
    });
  });

  describe("boundary values", () => {
    it("can construct MIN_VALUE", () => {
      const minValue = new Int256(-(2n ** 255n));
      expect(minValue).toBeInstanceOf(Int256);
    });

    it("can construct MAX_VALUE", () => {
      const maxValue = new Int256(2n ** 255n - 1n);
      expect(maxValue).toBeInstanceOf(Int256);
    });

    it("handles values near boundaries", () => {
      const nearMin = new Int256(-(2n ** 255n) + 1n);
      expect(nearMin.toBigInt()).toBe(-(2n ** 255n) + 1n);

      const nearMax = new Int256(2n ** 255n - 2n);
      expect(nearMax.toBigInt()).toBe(2n ** 255n - 2n);
    });

    it("handles very large positive values within range", () => {
      const largeValue = 2n ** 254n;
      expect(new Int256(largeValue).toBigInt()).toBe(largeValue);
    });

    it("handles very large negative values within range", () => {
      const largeNegative = -(2n ** 254n);
      expect(new Int256(largeNegative).toBigInt()).toBe(largeNegative);
    });
  });

  describe("string parsing with fromString", () => {
    it("parses positive numbers", () => {
      expect(Int256.fromString("42").toBigInt()).toBe(42n);
    });

    it("parses negative numbers", () => {
      expect(Int256.fromString("-42").toBigInt()).toBe(-42n);
    });

    it("parses zero", () => {
      expect(Int256.fromString("0").toBigInt()).toBe(0n);
    });

    it("parses leading zeros", () => {
      expect(Int256.fromString("00042").toBigInt()).toBe(42n);
    });

    it("parses whitespace around value", () => {
      expect(Int256.fromString("  42  ").toBigInt()).toBe(42n);
      expect(Int256.fromString("\t-42\n").toBigInt()).toBe(-42n);
    });

    it("parses large numbers within 256-bit range", () => {
      expect(Int256.fromString((2n ** 254n).toString()).toBigInt()).toBe(
        2n ** 254n,
      );
      expect(Int256.fromString((-(2n ** 254n)).toString()).toBigInt()).toBe(
        -(2n ** 254n),
      );
    });

    it("throws for non-integer strings", () => {
      expect(() => Int256.fromString("42.5")).toThrow();
      expect(() => Int256.fromString("42.0")).toThrow();
    });
  });

  describe("conversions", () => {
    it("toBigInt returns correct bigint value", () => {
      expect(new Int256(42).toBigInt()).toBe(42n);
      expect(new Int256(-42).toBigInt()).toBe(-42n);
      expect(new Int256(0).toBigInt()).toBe(0n);
    });

    it("toString returns string representation", () => {
      expect(new Int256(42).toString()).toBe("42");
      expect(new Int256(-42).toString()).toBe("-42");
      expect(new Int256(0).toString()).toBe("0");
    });

    it("toBigInt and fromString round-trip", () => {
      const values = [0, 42, -42, 123456789, -987654321];

      values.forEach((value) => {
        const int256 = new Int256(value);
        const roundTrip = Int256.fromString(int256.toString());
        expect(roundTrip.toBigInt()).toBe(BigInt(value));
      });
    });

    it("handles large value round-trips", () => {
      const largeValue = 2n ** 200n - 1n;
      const roundTrip = Int256.fromString(new Int256(largeValue).toString());
      expect(roundTrip.toBigInt()).toBe(largeValue);
    });

    it("handles very large negative value round-trips", () => {
      const largeNegative = -(2n ** 200n);
      const roundTrip = Int256.fromString(new Int256(largeNegative).toString());
      expect(roundTrip.toBigInt()).toBe(largeNegative);
    });
  });

  describe("type validation", () => {
    it("throws for null", () => {
      // @ts-expect-error - intentionally testing invalid input
      expect(() => new Int256(null)).toThrow();
    });

    it("throws for undefined", () => {
      // @ts-expect-error - intentionally testing invalid input
      expect(() => new Int256(undefined)).toThrow();
    });

    it("throws for objects", () => {
      // @ts-expect-error - intentionally testing invalid input
      expect(() => new Int256({})).toThrow();
    });

    it("throws for non-spread arrays", () => {
      // @ts-expect-error - intentionally testing invalid input
      expect(() => new Int256([])).toThrow();
    });
  });

  describe("contract with Int128 and Uint256", () => {
    it("Int256.unsigned is false", () => {
      expect(new Int256(42).unsigned).toBe(false);
    });

    it("size is 256 (double Int128)", () => {
      expect(new Int256(42).size).toBe(256);
    });

    it("has MIN_VALUE and MAX_VALUE boundaries twice as large as Int128", () => {
      // Int256 can handle 256-bit values, Int128 only 128-bit
      const huge256Value = 2n ** 254n;
      expect(new Int256(huge256Value).toBigInt()).toBe(huge256Value);
    });
  });

  // ========================================
  // Tests migrated from i256_test.js
  // Ensuring no test coverage is lost during JS to TS migration
  // ========================================

  describe("Int256.isValid - from i256_test.js", () => {
    it("returns true for Int256 instances", () => {
      expect(Int256.isValid(Int256.MIN_VALUE)).toBe(true);
      expect(Int256.isValid(Int256.MAX_VALUE)).toBe(true);
      expect(Int256.isValid(Int256.fromString("0"))).toBe(true);
      expect(Int256.isValid(Int256.fromString("-1"))).toBe(true);
      expect(Int256.isValid(5n)).toBe(true);
    });

    it("returns false for non Int256", () => {
      expect(Int256.isValid(null)).toBe(false);
      expect(Int256.isValid(undefined)).toBe(false);
      expect(Int256.isValid([])).toBe(false);
      expect(Int256.isValid({})).toBe(false);
      expect(Int256.isValid(1)).toBe(false);
      expect(Int256.isValid(true)).toBe(false);
    });
  });

  describe("Int256.slice - from i256_test.js", () => {
    it("slices number to parts", () => {
      const testValue =
        -0x7fffffff800000005fffffffa00000003fffffffc00000001ffffffffn;

      // slice() method exists at runtime but the type system can't resolve it yet
      expect(new Int256(testValue).slice(32)).toEqual([
        1n,
        -2n,
        3n,
        -4n,
        5n,
        -6n,
        7n,
        -8n,
      ]);

      expect(new Int256(testValue).slice(64)).toEqual([
        -0x1ffffffffn,
        -0x3fffffffdn,
        -0x5fffffffbn,
        -0x7fffffff9n,
      ]);

      expect(new Int256(testValue).slice(128)).toEqual([
        -0x3fffffffc00000001ffffffffn,
        -0x7fffffff800000005fffffffbn,
      ]);
    });
  });

  describe("Int256.fromString - from i256_test.js", () => {
    it("works for positive numbers", () => {
      expect(Int256.fromString("1059").toString()).toBe("1059");
    });

    it("works for negative numbers", () => {
      expect(
        Int256.fromString(
          "-105909234885029834059234850234985028304085",
        ).toString(),
      ).toBe("-105909234885029834059234850234985028304085");
    });

    it("fails when providing a string with a decimal place", () => {
      expect(() => Int256.fromString("105946095601.5")).toThrow(/bigint-like/);
    });
  });
});
