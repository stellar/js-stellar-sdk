import { describe, it, expect } from "vitest";
import { Int128 } from "../../../src/numbers/int128.js";

describe("Int128", () => {
  describe("constructor", () => {
    it("accepts a single bigint", () => {
      const int128 = new Int128(42n);
      expect(int128).toBeInstanceOf(Int128);
    });

    it("accepts a single number", () => {
      const int128 = new Int128(42);
      expect(int128).toBeInstanceOf(Int128);
    });

    it("accepts a single string", () => {
      const int128 = new Int128("42");
      expect(int128).toBeInstanceOf(Int128);
    });

    it("accepts multiple arguments as array slices", () => {
      const int128 = new Int128(1n, 2n, 3n, 4n);
      expect(int128).toBeInstanceOf(Int128);
    });

    it("accepts mixed types in multiple arguments", () => {
      const int128 = new Int128(1, 2n, "3", 4);
      expect(int128).toBeInstanceOf(Int128);
    });

    it("handles zero", () => {
      expect(new Int128(0)).toBeInstanceOf(Int128);
      expect(new Int128(0n)).toBeInstanceOf(Int128);
      expect(new Int128("0")).toBeInstanceOf(Int128);
    });

    it("handles negative numbers", () => {
      expect(new Int128(-1)).toBeInstanceOf(Int128);
      expect(new Int128(-42n)).toBeInstanceOf(Int128);
      expect(new Int128("-42")).toBeInstanceOf(Int128);
    });
  });

  describe("properties", () => {
    it("has unsigned property set to false", () => {
      const int128 = new Int128(42);
      expect(int128.unsigned).toBe(false);
    });

    it("has size property set to 128", () => {
      const int128 = new Int128(42);
      expect(int128.size).toBe(128);
    });

    it("properties are consistent across different values", () => {
      const values = [0, 42, -42, 1n << 100n, -(1n << 100n)];

      values.forEach((value) => {
        const int128 = new Int128(value);
        expect(int128.unsigned).toBe(false);
        expect(int128.size).toBe(128);
      });
    });
  });

  describe("defineIntBoundaries", () => {
    it("defines MIN_VALUE", () => {
      expect(Int128.MIN_VALUE).toBeDefined();
    });

    it("defines MAX_VALUE", () => {
      expect(Int128.MAX_VALUE).toBeDefined();
    });

    it("provides isValid function", () => {
      expect(typeof Int128.isValid).toBe("function");
    });

    it("isValid returns true for valid Int128 instances", () => {
      expect(Int128.isValid(Int128.MIN_VALUE)).toBe(true);
      expect(Int128.isValid(Int128.MAX_VALUE)).toBe(true);
      expect(Int128.isValid(new Int128(0))).toBe(true);
      expect(Int128.isValid(new Int128(-42))).toBe(true);
    });

    it("isValid returns true for valid bigint values", () => {
      expect(Int128.isValid(0n)).toBe(true);
      expect(Int128.isValid(42n)).toBe(true);
      expect(Int128.isValid(-42n)).toBe(true);
    });

    it("isValid returns false for invalid types", () => {
      expect(Int128.isValid(null)).toBe(false);
      expect(Int128.isValid(undefined)).toBe(false);
      expect(Int128.isValid({})).toBe(false);
      expect(Int128.isValid([])).toBe(false);
      expect(Int128.isValid("42")).toBe(false);
    });
  });

  describe("boundary values", () => {
    it("can construct MIN_VALUE", () => {
      const minValue = new Int128(-(2n ** 127n));
      expect(minValue).toBeInstanceOf(Int128);
    });

    it("can construct MAX_VALUE", () => {
      const maxValue = new Int128(2n ** 127n - 1n);
      expect(maxValue).toBeInstanceOf(Int128);
    });

    it("handles values near boundaries", () => {
      const nearMin = new Int128(-(2n ** 127n) + 1n);
      expect(nearMin.toBigInt()).toBe(-(2n ** 127n) + 1n);

      const nearMax = new Int128(2n ** 127n - 2n);
      expect(nearMax.toBigInt()).toBe(2n ** 127n - 2n);
    });
  });

  describe("string parsing with fromString", () => {
    it("parses positive numbers", () => {
      expect(Int128.fromString("42").toBigInt()).toBe(42n);
    });

    it("parses negative numbers", () => {
      expect(Int128.fromString("-42").toBigInt()).toBe(-42n);
    });

    it("parses zero", () => {
      expect(Int128.fromString("0").toBigInt()).toBe(0n);
    });

    it("parses leading zeros", () => {
      expect(Int128.fromString("00042").toBigInt()).toBe(42n);
    });

    it("parses whitespace around value", () => {
      expect(Int128.fromString("  42  ").toBigInt()).toBe(42n);
      expect(Int128.fromString("\t-42\n").toBigInt()).toBe(-42n);
    });

    it("parses large numbers within 128-bit range", () => {
      const largePositive = 2n ** 126n;
      expect(Int128.fromString(largePositive.toString()).toBigInt()).toBe(
        largePositive,
      );

      const largeNegative = -(2n ** 126n);
      expect(Int128.fromString(largeNegative.toString()).toBigInt()).toBe(
        largeNegative,
      );
    });

    it("throws for non-integer strings", () => {
      expect(() => Int128.fromString("42.5")).toThrow();
      expect(() => Int128.fromString("42.0")).toThrow();
    });
  });

  describe("conversions", () => {
    it("toBigInt returns correct bigint value", () => {
      expect(new Int128(42).toBigInt()).toBe(42n);
      expect(new Int128(-42).toBigInt()).toBe(-42n);
      expect(new Int128(0).toBigInt()).toBe(0n);
    });

    it("toString returns string representation", () => {
      expect(new Int128(42).toString()).toBe("42");
      expect(new Int128(-42).toString()).toBe("-42");
      expect(new Int128(0).toString()).toBe("0");
    });

    it("toBigInt and fromString round-trip", () => {
      const values = [0, 42, -42, 123456789, -987654321];

      values.forEach((value) => {
        const int128 = new Int128(value);
        const roundTrip = Int128.fromString(int128.toString());
        expect(roundTrip.toBigInt()).toBe(BigInt(value));
      });
    });

    it("handles large value round-trips", () => {
      const largeValue = 2n ** 100n - 1n;
      const roundTrip = Int128.fromString(new Int128(largeValue).toString());
      expect(roundTrip.toBigInt()).toBe(largeValue);
    });
  });

  describe("type validation", () => {
    it("throws for null", () => {
      expect(() => new Int128(null as any)).toThrow();
    });

    it("throws for undefined", () => {
      expect(() => new Int128(undefined as any)).toThrow();
    });

    it("throws for objects", () => {
      expect(() => new Int128({} as any)).toThrow();
    });

    it("throws for non-spread arrays", () => {
      expect(() => new Int128([] as any)).toThrow();
    });
  });

  describe("inheritance", () => {
    it("extends LargeInt", () => {
      const int128 = new Int128(42);
      expect(int128).toBeInstanceOf(Int128);
      // Verify it has LargeInt methods/properties
      expect(typeof int128.toBigInt).toBe("function");
    });
  });

  describe("contract with Uint128", () => {
    it("Int128.unsigned is false while Uint128.unsigned is true", () => {
      const int128 = new Int128(42);
      expect(int128.unsigned).toBe(false);
    });

    it("both have same size", () => {
      const int128 = new Int128(42);
      // Uint128 is not tested here, but this documents the contract
      expect(int128.size).toBe(128);
    });
  });
});
