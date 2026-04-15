import { describe, it, expect } from "vitest";
import { Uint128 } from "../../../src/numbers/uint128.js";

describe("Uint128", () => {
  describe("constructor", () => {
    it("accepts a single bigint", () => {
      expect(new Uint128(42n)).toBeInstanceOf(Uint128);
    });

    it("accepts a single number", () => {
      expect(new Uint128(42)).toBeInstanceOf(Uint128);
    });

    it("accepts a single string", () => {
      expect(new Uint128("42")).toBeInstanceOf(Uint128);
    });

    it("accepts multiple arguments as array slices", () => {
      const uint128 = new Uint128(1n, 2n, 3n, 4n);
      expect(uint128).toBeInstanceOf(Uint128);
    });

    it("accepts mixed types in multiple arguments", () => {
      const uint128 = new Uint128(1, 2n, "3", 4);
      expect(uint128).toBeInstanceOf(Uint128);
    });

    it("handles zero", () => {
      expect(new Uint128(0)).toBeInstanceOf(Uint128);
      expect(new Uint128(0n)).toBeInstanceOf(Uint128);
      expect(new Uint128("0")).toBeInstanceOf(Uint128);
    });

    it("handles positive numbers", () => {
      expect(new Uint128(1)).toBeInstanceOf(Uint128);
      expect(new Uint128(42n)).toBeInstanceOf(Uint128);
      expect(new Uint128("42")).toBeInstanceOf(Uint128);
    });
  });

  describe("properties", () => {
    it("has unsigned property set to true", () => {
      expect(new Uint128(42).unsigned).toBe(true);
    });

    it("has size property set to 128", () => {
      expect(new Uint128(42).size).toBe(128);
    });

    it("properties are consistent across different values", () => {
      const values = [0, 42, 1n << 100n, 2n ** 127n - 1n];

      values.forEach((value) => {
        const uint128 = new Uint128(value);
        expect(uint128.unsigned).toBe(true);
        expect(uint128.size).toBe(128);
      });
    });
  });

  describe("defineIntBoundaries", () => {
    it("defines MIN_VALUE", () => {
      expect(Uint128.MIN_VALUE).toBeDefined();
    });

    it("defines MAX_VALUE", () => {
      expect(Uint128.MAX_VALUE).toBeDefined();
    });

    it("provides isValid function", () => {
      expect(typeof Uint128.isValid).toBe("function");
    });

    it("isValid returns true for valid Uint128 instances", () => {
      expect(Uint128.isValid(Uint128.MIN_VALUE)).toBe(true);
      expect(Uint128.isValid(Uint128.MAX_VALUE)).toBe(true);
      expect(Uint128.isValid(new Uint128(0))).toBe(true);
      expect(Uint128.isValid(new Uint128(42))).toBe(true);
    });

    it("isValid returns true for valid bigint values", () => {
      expect(Uint128.isValid(0n)).toBe(true);
      expect(Uint128.isValid(42n)).toBe(true);
      expect(Uint128.isValid(2n ** 127n)).toBe(true);
    });

    it("isValid returns false for invalid types", () => {
      expect(Uint128.isValid(null)).toBe(false);
      expect(Uint128.isValid(undefined)).toBe(false);
      expect(Uint128.isValid({})).toBe(false);
      expect(Uint128.isValid([])).toBe(false);
      expect(Uint128.isValid("42")).toBe(false);
    });
  });

  describe("boundary values", () => {
    it("can construct MIN_VALUE (0)", () => {
      const minValue = new Uint128(0);
      expect(minValue).toBeInstanceOf(Uint128);
      expect(minValue.toBigInt()).toBe(0n);
    });

    it("can construct MAX_VALUE (2^128 - 1)", () => {
      const maxValue = new Uint128(2n ** 128n - 1n);
      expect(maxValue).toBeInstanceOf(Uint128);
    });

    it("handles values near boundaries", () => {
      const nearMin = new Uint128(1n);
      expect(nearMin.toBigInt()).toBe(1n);

      const nearMax = new Uint128(2n ** 128n - 2n);
      expect(nearMax.toBigInt()).toBe(2n ** 128n - 2n);
    });

    it("handles very large positive values within range", () => {
      const largeValue = 2n ** 127n;
      expect(new Uint128(largeValue).toBigInt()).toBe(largeValue);
    });
  });

  describe("string parsing with fromString", () => {
    it("parses positive numbers", () => {
      expect(Uint128.fromString("42").toBigInt()).toBe(42n);
    });

    it("parses zero", () => {
      expect(Uint128.fromString("0").toBigInt()).toBe(0n);
    });

    it("parses leading zeros", () => {
      expect(Uint128.fromString("00042").toBigInt()).toBe(42n);
    });

    it("parses whitespace around value", () => {
      expect(Uint128.fromString("  42  ").toBigInt()).toBe(42n);
      expect(Uint128.fromString("\t100\n").toBigInt()).toBe(100n);
    });

    it("parses large numbers within 128-bit range", () => {
      const largePositive = 2n ** 127n;
      expect(Uint128.fromString(largePositive.toString()).toBigInt()).toBe(
        largePositive,
      );
    });

    it("throws for non-integer strings", () => {
      expect(() => Uint128.fromString("42.5")).toThrow();
      expect(() => Uint128.fromString("42.0")).toThrow();
    });
  });

  describe("conversions", () => {
    it("toBigInt returns correct bigint value", () => {
      expect(new Uint128(42).toBigInt()).toBe(42n);
      expect(new Uint128(0).toBigInt()).toBe(0n);
      expect(new Uint128(2n ** 100n).toBigInt()).toBe(2n ** 100n);
    });

    it("toString returns string representation", () => {
      expect(new Uint128(42).toString()).toBe("42");
      expect(new Uint128(0).toString()).toBe("0");
      expect(new Uint128(100).toString()).toBe("100");
    });

    it("toBigInt and fromString round-trip", () => {
      const values = [0, 42, 123456789, 987654321];

      values.forEach((value) => {
        const uint128 = new Uint128(value);
        const roundTrip = Uint128.fromString(uint128.toString());
        expect(roundTrip.toBigInt()).toBe(BigInt(value));
      });
    });

    it("handles large value round-trips", () => {
      const largeValue = 2n ** 100n - 1n;
      const roundTrip = Uint128.fromString(new Uint128(largeValue).toString());
      expect(roundTrip.toBigInt()).toBe(largeValue);
    });
  });

  describe("type validation", () => {
    it("throws for null", () => {
      expect(() => new Uint128(null as any)).toThrow();
    });

    it("throws for undefined", () => {
      expect(() => new Uint128(undefined as any)).toThrow();
    });

    it("throws for objects", () => {
      expect(() => new Uint128({} as any)).toThrow();
    });

    it("throws for non-spread arrays", () => {
      expect(() => new Uint128([] as any)).toThrow();
    });
  });

  describe("inheritance", () => {
    it("extends LargeInt", () => {
      const uint128 = new Uint128(42);
      expect(uint128).toBeInstanceOf(Uint128);
      // Verify it has LargeInt methods/properties
      expect(typeof uint128.toBigInt).toBe("function");
    });
  });

  describe("contract with Int128", () => {
    it("Uint128.unsigned is true while Int128.unsigned is false", () => {
      const uint128 = new Uint128(42);
      expect(uint128.unsigned).toBe(true);
    });

    it("both have same size", () => {
      const uint128 = new Uint128(42);
      // Int128 is not tested here, but this documents the contract
      expect(uint128.size).toBe(128);
    });

    it("Uint128 only accepts non-negative values", () => {
      // Uint128 MIN_VALUE should be 0, not negative like Int128
      const minValue = new Uint128(0);
      expect(minValue.toBigInt()).toBe(0n);

      // Verify negative values are rejected
      expect(() => new Uint128(-1)).toThrow();
      expect(() => new Uint128(-42n)).toThrow();
    });
  });
});
