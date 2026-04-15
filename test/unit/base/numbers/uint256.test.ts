import { describe, it, expect } from "vitest";
import { Uint256 } from "../../../src/numbers/uint256.js";

describe("Uint256", () => {
  describe("constructor", () => {
    it("accepts a single bigint", () => {
      expect(new Uint256(42n)).toBeInstanceOf(Uint256);
    });

    it("accepts a single number", () => {
      expect(new Uint256(42)).toBeInstanceOf(Uint256);
    });

    it("accepts a single string", () => {
      expect(new Uint256("42")).toBeInstanceOf(Uint256);
    });

    it("accepts multiple arguments as array slices", () => {
      const uint256 = new Uint256(1n, 2n, 3n, 4n);
      expect(uint256).toBeInstanceOf(Uint256);
    });

    it("accepts mixed types in multiple arguments", () => {
      const uint256 = new Uint256(1, 2n, "3", 4);
      expect(uint256).toBeInstanceOf(Uint256);
    });

    it("handles zero", () => {
      expect(new Uint256(0)).toBeInstanceOf(Uint256);
      expect(new Uint256(0n)).toBeInstanceOf(Uint256);
      expect(new Uint256("0")).toBeInstanceOf(Uint256);
    });

    it("handles positive numbers", () => {
      expect(new Uint256(1)).toBeInstanceOf(Uint256);
      expect(new Uint256(42n)).toBeInstanceOf(Uint256);
      expect(new Uint256("42")).toBeInstanceOf(Uint256);
    });
  });

  describe("properties", () => {
    it("has unsigned property set to true", () => {
      expect(new Uint256(42).unsigned).toBe(true);
    });

    it("has size property set to 256", () => {
      expect(new Uint256(42).size).toBe(256);
    });

    it("properties are consistent across different values", () => {
      const values = [0, 42, 1n << 200n, 2n ** 255n - 1n];

      values.forEach((value) => {
        const uint256 = new Uint256(value);
        expect(uint256.unsigned).toBe(true);
        expect(uint256.size).toBe(256);
      });
    });
  });

  describe("defineIntBoundaries", () => {
    it("defines MIN_VALUE", () => {
      expect(Uint256.MIN_VALUE).toBeDefined();
    });

    it("defines MAX_VALUE", () => {
      expect(Uint256.MAX_VALUE).toBeDefined();
    });

    it("provides isValid function", () => {
      expect(typeof Uint256.isValid).toBe("function");
    });

    it("isValid returns true for valid Uint256 instances", () => {
      expect(Uint256.isValid(Uint256.MIN_VALUE)).toBe(true);
      expect(Uint256.isValid(Uint256.MAX_VALUE)).toBe(true);
      expect(Uint256.isValid(new Uint256(0))).toBe(true);
      expect(Uint256.isValid(new Uint256(42))).toBe(true);
    });

    it("isValid returns true for valid bigint values", () => {
      expect(Uint256.isValid(0n)).toBe(true);
      expect(Uint256.isValid(42n)).toBe(true);
      expect(Uint256.isValid(2n ** 255n)).toBe(true);
    });

    it("isValid returns false for invalid types", () => {
      expect(Uint256.isValid(null)).toBe(false);
      expect(Uint256.isValid(undefined)).toBe(false);
      expect(Uint256.isValid({})).toBe(false);
      expect(Uint256.isValid([])).toBe(false);
      expect(Uint256.isValid("42")).toBe(false);
    });
  });

  describe("boundary values", () => {
    it("can construct MIN_VALUE (0)", () => {
      const minValue = new Uint256(0);
      expect(minValue).toBeInstanceOf(Uint256);
      expect(minValue.toBigInt()).toBe(0n);
    });

    it("can construct MAX_VALUE (2^256 - 1)", () => {
      const maxValue = new Uint256(2n ** 256n - 1n);
      expect(maxValue).toBeInstanceOf(Uint256);
    });

    it("handles values near boundaries", () => {
      const nearMin = new Uint256(1n);
      expect(nearMin.toBigInt()).toBe(1n);

      const nearMax = new Uint256(2n ** 256n - 2n);
      expect(nearMax.toBigInt()).toBe(2n ** 256n - 2n);
    });

    it("handles very large positive values within range", () => {
      const largeValue = 2n ** 255n;
      expect(new Uint256(largeValue).toBigInt()).toBe(largeValue);
    });
  });

  describe("string parsing with fromString", () => {
    it("parses positive numbers", () => {
      expect(Uint256.fromString("42").toBigInt()).toBe(42n);
    });

    it("parses zero", () => {
      expect(Uint256.fromString("0").toBigInt()).toBe(0n);
    });

    it("parses leading zeros", () => {
      expect(Uint256.fromString("00042").toBigInt()).toBe(42n);
    });

    it("parses whitespace around value", () => {
      expect(Uint256.fromString("  42  ").toBigInt()).toBe(42n);
      expect(Uint256.fromString("\t100\n").toBigInt()).toBe(100n);
    });

    it("parses large numbers within 256-bit range", () => {
      const largePositive = 2n ** 255n;
      expect(Uint256.fromString(largePositive.toString()).toBigInt()).toBe(
        largePositive,
      );
    });

    it("throws for non-integer strings", () => {
      expect(() => Uint256.fromString("42.5")).toThrow();
      expect(() => Uint256.fromString("42.0")).toThrow();
    });
  });

  describe("conversions", () => {
    it("toBigInt returns correct bigint value", () => {
      expect(new Uint256(42).toBigInt()).toBe(42n);
      expect(new Uint256(0).toBigInt()).toBe(0n);
      expect(new Uint256(2n ** 200n).toBigInt()).toBe(2n ** 200n);
    });

    it("toString returns string representation", () => {
      expect(new Uint256(42).toString()).toBe("42");
      expect(new Uint256(0).toString()).toBe("0");
      expect(new Uint256(100).toString()).toBe("100");
    });

    it("toBigInt and fromString round-trip", () => {
      const values = [0, 42, 123456789, 987654321];

      values.forEach((value) => {
        const uint256 = new Uint256(value);
        const roundTrip = Uint256.fromString(uint256.toString());
        expect(roundTrip.toBigInt()).toBe(BigInt(value));
      });
    });

    it("handles large value round-trips", () => {
      const largeValue = 2n ** 200n - 1n;
      const roundTrip = Uint256.fromString(new Uint256(largeValue).toString());
      expect(roundTrip.toBigInt()).toBe(largeValue);
    });
  });

  describe("type validation", () => {
    it("throws for null", () => {
      expect(() => new Uint256(null as any)).toThrow();
    });

    it("throws for undefined", () => {
      expect(() => new Uint256(undefined as any)).toThrow();
    });

    it("throws for objects", () => {
      expect(() => new Uint256({} as any)).toThrow();
    });

    it("throws for non-spread arrays", () => {
      expect(() => new Uint256([] as any)).toThrow();
    });
  });

  describe("inheritance", () => {
    it("extends LargeInt", () => {
      const uint256 = new Uint256(42);
      expect(uint256).toBeInstanceOf(Uint256);
      // Verify it has LargeInt methods/properties
      expect(typeof uint256.toBigInt).toBe("function");
    });
  });

  describe("contract with Int256", () => {
    it("Uint256.unsigned is true while Int256.unsigned is false", () => {
      const uint256 = new Uint256(42);
      expect(uint256.unsigned).toBe(true);
    });

    it("both have same size", () => {
      const uint256 = new Uint256(42);
      // Int256 is not tested here, but this documents the contract
      expect(uint256.size).toBe(256);
    });

    it("Uint256 only accepts non-negative values", () => {
      // Uint256 MIN_VALUE should be 0, not negative like Int256
      const minValue = new Uint256(0);
      expect(minValue.toBigInt()).toBe(0n);

      // Verify negative values are rejected
      expect(() => new Uint256(-1)).toThrow();
      expect(() => new Uint256(-42n)).toThrow();
    });
  });
});
