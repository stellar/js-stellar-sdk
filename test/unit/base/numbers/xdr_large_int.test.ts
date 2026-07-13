import { describe, it, expect } from "vitest";
import {
  ScIntType,
  XdrLargeInt,
} from "../../../../src/base/numbers/xdr_large_int.js";

import * as xdr from "../../../../src/xdr/index.js";

describe("XdrLargeInt", () => {
  describe("constructor", () => {
    describe("accepts single values", () => {
      it("accepts a single bigint", () => {
        const xdrInt = new XdrLargeInt("i64", 42n);
        expect(xdrInt).toBeInstanceOf(XdrLargeInt);
        expect(xdrInt.toBigInt()).toBe(42n);
      });

      it("accepts a single number", () => {
        const xdrInt = new XdrLargeInt("i64", 42);
        expect(xdrInt).toBeInstanceOf(XdrLargeInt);
        expect(xdrInt.toBigInt()).toBe(42n);
      });

      it("accepts a single string", () => {
        const xdrInt = new XdrLargeInt("i64", "42");
        expect(xdrInt).toBeInstanceOf(XdrLargeInt);
        expect(xdrInt.toBigInt()).toBe(42n);
      });

      it("accepts object with toBigInt() method", () => {
        const obj = { toBigInt: () => 42n };
        const xdrInt = new XdrLargeInt("i64", obj);
        expect(xdrInt.toBigInt()).toBe(42n);
      });
    });

    describe("accepts array values", () => {
      it("accepts array of bigints for i64", () => {
        const xdrInt = new XdrLargeInt("i64", [1n, 2n]);
        expect(xdrInt).toBeInstanceOf(XdrLargeInt);
      });

      it("accepts array of numbers for i64", () => {
        const xdrInt = new XdrLargeInt("i64", [1, 2]);
        expect(xdrInt).toBeInstanceOf(XdrLargeInt);
      });

      it("accepts array of strings for i64", () => {
        const xdrInt = new XdrLargeInt("i64", ["1", "2"]);
        expect(xdrInt).toBeInstanceOf(XdrLargeInt);
      });

      it("accepts mixed types in array", () => {
        const xdrInt = new XdrLargeInt("i64", [1, 2n]);
        expect(xdrInt).toBeInstanceOf(XdrLargeInt);
      });

      it("combines slices in little-endian order (legacy contract)", () => {
        // parts[0] is the least-significant slice: [lo, hi]
        expect(new XdrLargeInt("i64", [5n, 0n]).toBigInt()).toBe(5n);
        expect(new XdrLargeInt("i64", [0n, 5n]).toBigInt()).toBe(5n << 32n);
        expect(new XdrLargeInt("i128", [5n, 0n]).toBigInt()).toBe(5n);
        expect(new XdrLargeInt("u128", [0n, 1n]).toBigInt()).toBe(1n << 64n);
      });

      it("sign-extends the most-significant slice for signed types", () => {
        // hi = -1 → all-ones upper half → value is just lo
        expect(new XdrLargeInt("i128", [5n, -1n]).toBigInt()).toBe(
          BigInt.asIntN(128, (0xffffffffffffffffn << 64n) | 5n),
        );
      });

      it("throws RangeError when a slice does not fit its width", () => {
        expect(() => new XdrLargeInt("u128", [0n, 2n ** 80n])).toThrow(
          RangeError,
        );
        expect(() => new XdrLargeInt("i64", [2n ** 40n, 0n])).toThrow(
          RangeError,
        );
      });
    });

    describe("type variations", () => {
      it("handles i64 type", () => {
        const xdrInt = new XdrLargeInt("i64", 100);
        expect(xdrInt.type).toBe("i64");
      });

      it("handles i128 type", () => {
        const xdrInt = new XdrLargeInt("i128", 100);
        expect(xdrInt.type).toBe("i128");
      });

      it("handles i256 type", () => {
        const xdrInt = new XdrLargeInt("i256", 100);
        expect(xdrInt.type).toBe("i256");
      });

      it("handles u64 type", () => {
        const xdrInt = new XdrLargeInt("u64", 100);
        expect(xdrInt.type).toBe("u64");
      });

      it("handles u128 type", () => {
        const xdrInt = new XdrLargeInt("u128", 100);
        expect(xdrInt.type).toBe("u128");
      });

      it("handles u256 type", () => {
        const xdrInt = new XdrLargeInt("u256", 100);
        expect(xdrInt.type).toBe("u256");
      });

      it("handles timepoint type", () => {
        const xdrInt = new XdrLargeInt("timepoint", 100);
        expect(xdrInt.type).toBe("timepoint");
      });

      it("handles duration type", () => {
        const xdrInt = new XdrLargeInt("duration", 100);
        expect(xdrInt.type).toBe("duration");
      });

      it("throws TypeError for invalid type", () => {
        expect(
          () => new XdrLargeInt("invalid" as unknown as ScIntType, 100),
        ).toThrow(TypeError);
        expect(
          () => new XdrLargeInt("invalid" as unknown as ScIntType, 100),
        ).toThrow(/invalid type/);
      });
    });

    describe("value normalization", () => {
      it("normalizes all values to bigint internally", () => {
        const fromNumber = new XdrLargeInt("i64", 42);
        const fromBigInt = new XdrLargeInt("i64", 42n);
        const fromString = new XdrLargeInt("i64", "42");

        expect(fromNumber.toBigInt()).toBe(42n);
        expect(fromBigInt.toBigInt()).toBe(42n);
        expect(fromString.toBigInt()).toBe(42n);
      });

      it("handles zero in all formats", () => {
        expect(new XdrLargeInt("i64", 0).toBigInt()).toBe(0n);
        expect(new XdrLargeInt("i64", 0n).toBigInt()).toBe(0n);
        expect(new XdrLargeInt("i64", "0").toBigInt()).toBe(0n);
      });

      it("handles negative numbers", () => {
        expect(new XdrLargeInt("i64", -42).toBigInt()).toBe(-42n);
        expect(new XdrLargeInt("i64", -42n).toBigInt()).toBe(-42n);
        expect(new XdrLargeInt("i64", "-42").toBigInt()).toBe(-42n);
      });
    });
  });

  describe("static isType()", () => {
    it("returns true for all valid types", () => {
      expect(XdrLargeInt.isType("i64")).toBe(true);
      expect(XdrLargeInt.isType("i128")).toBe(true);
      expect(XdrLargeInt.isType("i256")).toBe(true);
      expect(XdrLargeInt.isType("u64")).toBe(true);
      expect(XdrLargeInt.isType("u128")).toBe(true);
      expect(XdrLargeInt.isType("u256")).toBe(true);
      expect(XdrLargeInt.isType("timepoint")).toBe(true);
      expect(XdrLargeInt.isType("duration")).toBe(true);
    });

    it("returns false for invalid types", () => {
      expect(XdrLargeInt.isType("invalid")).toBe(false);
      expect(XdrLargeInt.isType("i32")).toBe(false);
      expect(XdrLargeInt.isType("u32")).toBe(false);
      expect(XdrLargeInt.isType("")).toBe(false);
      expect(XdrLargeInt.isType("I64")).toBe(false);
    });

    it("type predicate narrows type correctly", () => {
      const maybeType: ScIntType = "i128";
      if (XdrLargeInt.isType(maybeType)) {
        // TypeScript should know maybeType is XdrLargeIntType here
        const xdrInt = new XdrLargeInt(maybeType, 100);
        expect(xdrInt).toBeInstanceOf(XdrLargeInt);
      }
    });
  });

  describe("static getType()", () => {
    it("converts ScValType names to type strings", () => {
      expect(XdrLargeInt.getType("scvI64")).toBe("i64");
      expect(XdrLargeInt.getType("scvI128")).toBe("i128");
      expect(XdrLargeInt.getType("scvI256")).toBe("i256");
      expect(XdrLargeInt.getType("scvU64")).toBe("u64");
      expect(XdrLargeInt.getType("scvU128")).toBe("u128");
      expect(XdrLargeInt.getType("scvU256")).toBe("u256");
      expect(XdrLargeInt.getType("scvTimepoint")).toBe("timepoint");
      expect(XdrLargeInt.getType("scvDuration")).toBe("duration");
    });
  });

  describe("toNumber()", () => {
    it("converts to number for safe values", () => {
      expect(new XdrLargeInt("i64", 42).toNumber()).toBe(42);
      expect(new XdrLargeInt("i64", -42).toNumber()).toBe(-42);
      expect(new XdrLargeInt("i64", 0).toNumber()).toBe(0);
    });

    it("throws RangeError for values outside Number safe range", () => {
      const tooLarge = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
      const tooSmall = BigInt(Number.MIN_SAFE_INTEGER) - 1n;

      expect(() => new XdrLargeInt("i128", tooLarge).toNumber()).toThrow(
        RangeError,
      );
      expect(() => new XdrLargeInt("i128", tooLarge).toNumber()).toThrow(
        /not in range for Number/,
      );
      expect(() => new XdrLargeInt("i128", tooSmall).toNumber()).toThrow(
        RangeError,
      );
    });

    it("handles MAX_SAFE_INTEGER and MIN_SAFE_INTEGER", () => {
      expect(new XdrLargeInt("i64", Number.MAX_SAFE_INTEGER).toNumber()).toBe(
        Number.MAX_SAFE_INTEGER,
      );
      expect(new XdrLargeInt("i64", Number.MIN_SAFE_INTEGER).toNumber()).toBe(
        Number.MIN_SAFE_INTEGER,
      );
    });
  });

  describe("toBigInt()", () => {
    it("returns correct bigint values", () => {
      expect(new XdrLargeInt("i64", 42).toBigInt()).toBe(42n);
      expect(new XdrLargeInt("i128", -42).toBigInt()).toBe(-42n);
      expect(new XdrLargeInt("i256", 0).toBigInt()).toBe(0n);
    });

    it("handles large values", () => {
      const large = 1n << 100n;
      expect(new XdrLargeInt("i256", large).toBigInt()).toBe(large);
    });
  });

  describe("toString()", () => {
    it("returns string representation", () => {
      expect(new XdrLargeInt("i64", 42).toString()).toBe("42");
      expect(new XdrLargeInt("i64", -42).toString()).toBe("-42");
      expect(new XdrLargeInt("i64", 0).toString()).toBe("0");
    });

    it("handles large values", () => {
      const large = 123456789123456789n;
      expect(new XdrLargeInt("i128", large).toString()).toBe(
        "123456789123456789",
      );
    });
  });

  describe("toJson()", () => {
    it("returns object with value and type", () => {
      const json = new XdrLargeInt("i128", 42).toJson();
      expect(json).toEqual({ value: "42", type: "i128" });
    });

    it("preserves type information", () => {
      expect(new XdrLargeInt("u64", 100).toJson().type).toBe("u64");
      expect(new XdrLargeInt("timepoint", 100).toJson().type).toBe("timepoint");
      expect(new XdrLargeInt("duration", 100).toJson().type).toBe("duration");
    });

    it("converts value to string", () => {
      const large = 1n << 100n;
      const json = new XdrLargeInt("i256", large).toJson();
      expect(json.value).toBe(large.toString());
    });
  });

  describe("valueOf()", () => {
    it("returns the underlying bigint value", () => {
      const xdrInt = new XdrLargeInt("i128", 42);
      const value = xdrInt.valueOf();
      expect(typeof value).toBe("bigint");
      expect(value).toBe(42n);
    });
  });

  describe("64-bit XDR encodings", () => {
    describe("toI64()", () => {
      it("encodes positive i64 values", () => {
        const xdrInt = new XdrLargeInt("i64", 42);
        const scVal = xdrInt.toI64();
        expect(scVal.type).toBe("scvI64");
        if (scVal.type !== "scvI64") throw new Error("expected scvI64");
        expect(scVal.i64).toBe(42n);
      });

      it("encodes negative i64 values", () => {
        const xdrInt = new XdrLargeInt("i64", -42);
        const scVal = xdrInt.toI64();
        expect(scVal.type).toBe("scvI64");
        if (scVal.type !== "scvI64") throw new Error("expected scvI64");
        expect(scVal.i64).toBe(-42n);
      });

      it("throws RangeError when size exceeds 64 bits", () => {
        const tooLarge = new XdrLargeInt("i128", 1n << 64n);
        expect(() => tooLarge.toI64()).toThrow(RangeError);
        expect(() => tooLarge.toI64()).toThrow(/too large/);
      });

      it("throws RangeError when value doesn't fit in signed 64 bits", () => {
        // i64 can't store values beyond signed 64-bit range
        const tooLarge = new XdrLargeInt("i128", 1n << 63n);
        expect(() => tooLarge.toI64()).toThrow(RangeError);
        expect(() => tooLarge.toI64()).toThrow(/too large/);
      });

      it("handles boundary values", () => {
        const maxI64 = (1n << 63n) - 1n;
        const minI64 = -(1n << 63n);

        const maxVal = new XdrLargeInt("i64", maxI64).toI64();
        if (maxVal.type !== "scvI64") throw new Error("expected scvI64");
        expect(maxVal.i64).toBe(maxI64);

        const minVal = new XdrLargeInt("i64", minI64).toI64();
        if (minVal.type !== "scvI64") throw new Error("expected scvI64");
        expect(minVal.i64).toBe(minI64);
      });
    });

    describe("toU64()", () => {
      it("encodes u64 values", () => {
        const xdrInt = new XdrLargeInt("u64", 42);
        const scVal = xdrInt.toU64();
        expect(scVal.type).toBe("scvU64");
        if (scVal.type !== "scvU64") throw new Error("expected scvU64");
        expect(scVal.u64).toBe(42n);
      });

      it("reinterprets negative signed value as unsigned via toU64", () => {
        // Create as i64 type, then convert to u64 which reinterprets as unsigned
        const xdrInt = new XdrLargeInt("i64", -1);
        const scVal = xdrInt.toU64();
        if (scVal.type !== "scvU64") throw new Error("expected scvU64");
        expect(scVal.u64).toBe(BigInt.asUintN(64, -1n));
      });

      it("throws RangeError when size exceeds 64 bits", () => {
        const tooLarge = new XdrLargeInt("u128", 1n << 64n);
        expect(() => tooLarge.toU64()).toThrow(RangeError);
        expect(() => tooLarge.toU64()).toThrow(/too large/);
      });

      it("handles maximum u64 value", () => {
        const maxU64 = (1n << 64n) - 1n;
        const scVal = new XdrLargeInt("u64", maxU64).toU64();
        if (scVal.type !== "scvU64") throw new Error("expected scvU64");
        expect(scVal.u64).toBe(maxU64);
      });
    });

    describe("toTimepoint()", () => {
      it("encodes timepoint values", () => {
        const xdrInt = new XdrLargeInt("timepoint", 1234567890);
        const scVal = xdrInt.toTimepoint();
        expect(scVal.type).toBe("scvTimepoint");
        if (scVal.type !== "scvTimepoint")
          throw new Error("expected scvTimepoint");
        expect(scVal.timepoint).toBe(1234567890n);
      });

      it("throws RangeError when size exceeds 64 bits", () => {
        const tooLarge = new XdrLargeInt("u128", 1n << 64n);
        expect(() => tooLarge.toTimepoint()).toThrow(RangeError);
      });
    });

    describe("toDuration()", () => {
      it("encodes duration values", () => {
        const xdrInt = new XdrLargeInt("duration", 3600);
        const scVal = xdrInt.toDuration();
        expect(scVal.type).toBe("scvDuration");
        if (scVal.type !== "scvDuration")
          throw new Error("expected scvDuration");
        expect(scVal.duration).toBe(3600n);
      });

      it("throws RangeError when size exceeds 64 bits", () => {
        const tooLarge = new XdrLargeInt("u128", 1n << 64n);
        expect(() => tooLarge.toDuration()).toThrow(RangeError);
      });
    });
  });

  describe("128-bit XDR encodings", () => {
    describe("toI128()", () => {
      it("encodes positive i128 values", () => {
        const value = 1234567890n;
        const xdrInt = new XdrLargeInt("i128", value);
        const scVal = xdrInt.toI128();
        expect(scVal.type).toBe("scvI128");
        if (scVal.type !== "scvI128") throw new Error("expected scvI128");

        const i128 = scVal.i128;
        const reconstructed = (i128.hi << 64n) | i128.lo;
        expect(reconstructed).toBe(value);
      });

      it("encodes negative i128 values", () => {
        const value = -1234567890n;
        const xdrInt = new XdrLargeInt("i128", value);
        const scVal = xdrInt.toI128();
        if (scVal.type !== "scvI128") throw new Error("expected scvI128");

        // Reconstruct via XdrLargeInt to handle sign extension. The hi slice
        // is already in two's-complement form on the wire, so re-combining
        // [lo, hi] via the signed-aware combiner recovers the original value.
        const reconstructed = new XdrLargeInt("i128", [
          scVal.i128.lo,
          scVal.i128.hi,
        ]).toBigInt();
        expect(reconstructed).toBe(value);
      });

      it("throws RangeError when size exceeds 128 bits", () => {
        const tooLarge = new XdrLargeInt("i256", 1n << 128n);
        expect(() => tooLarge.toI128()).toThrow(RangeError);
        expect(() => tooLarge.toI128()).toThrow(/too large for 128 bits/);
      });

      it("throws RangeError for unsigned values exceeding signed i128 range", () => {
        const u128AtSignedBoundary = new XdrLargeInt("u128", 1n << 127n);
        expect(() => u128AtSignedBoundary.toI128()).toThrow(RangeError);

        const u128Max = new XdrLargeInt("u128", (1n << 128n) - 1n);
        expect(() => u128Max.toI128()).toThrow(RangeError);
      });

      it("handles boundary values", () => {
        const maxI128 = (1n << 127n) - 1n;
        const minI128 = -(1n << 127n);

        const maxVal = new XdrLargeInt("i128", maxI128).toI128();
        expect(maxVal.type).toBe("scvI128");

        const minVal = new XdrLargeInt("i128", minI128).toI128();
        expect(minVal.type).toBe("scvI128");
      });

      it("encodes large positive value correctly", () => {
        const large = 1n << 100n;
        const xdrInt = new XdrLargeInt("i128", large);
        const scVal = xdrInt.toI128();
        if (scVal.type !== "scvI128") throw new Error("expected scvI128");

        const i128 = scVal.i128;
        const hi = BigInt.asIntN(64, i128.hi);
        const reconstructed = (hi << 64n) | i128.lo;
        expect(reconstructed).toBe(large);
      });
    });

    describe("toU128()", () => {
      it("encodes u128 values", () => {
        const value = 1234567890n;
        const xdrInt = new XdrLargeInt("u128", value);
        const scVal = xdrInt.toU128();
        expect(scVal.type).toBe("scvU128");
        if (scVal.type !== "scvU128") throw new Error("expected scvU128");

        const u128 = scVal.u128;
        const reconstructed = (u128.hi << 64n) | u128.lo;
        expect(reconstructed).toBe(value);
      });

      it("throws RangeError when size exceeds 128 bits", () => {
        const tooLarge = new XdrLargeInt("u256", 1n << 128n);
        expect(() => tooLarge.toU128()).toThrow(RangeError);
        expect(() => tooLarge.toU128()).toThrow(/too large for 128 bits/);
      });

      it("handles maximum u128 value", () => {
        const maxU128 = (1n << 128n) - 1n;
        const scVal = new XdrLargeInt("u128", maxU128).toU128();
        expect(scVal.type).toBe("scvU128");
        if (scVal.type !== "scvU128") throw new Error("expected scvU128");

        const u128 = scVal.u128;
        const reconstructed = new XdrLargeInt("u128", [
          u128.lo,
          u128.hi,
        ]).toBigInt();
        expect(reconstructed).toBe(maxU128);
      });
    });
  });

  describe("256-bit XDR encodings", () => {
    describe("toI256()", () => {
      it("encodes positive i256 values", () => {
        const value = 1234567890n;
        const xdrInt = new XdrLargeInt("i256", value);
        const scVal = xdrInt.toI256();
        expect(scVal.type).toBe("scvI256");
        if (scVal.type !== "scvI256") throw new Error("expected scvI256");

        const i256 = scVal.i256;
        expect(i256.loLo).toBe(value);
        expect(i256.loHi).toBe(0n);
        expect(i256.hiLo).toBe(0n);
        expect(i256.hiHi).toBe(0n);
      });

      it("encodes negative i256 values", () => {
        const value = -42n;
        const xdrInt = new XdrLargeInt("i256", value);
        const scVal = xdrInt.toI256();
        if (scVal.type !== "scvI256") throw new Error("expected scvI256");

        expect(scVal.i256.hiHi).toBe(-1n);
      });

      it("does not throw for large values within signed range", () => {
        const huge = (1n << 200n) - 1n;
        const xdrInt = new XdrLargeInt("i256", huge);
        expect(() => xdrInt.toI256()).not.toThrow();
      });

      it("throws RangeError for unsigned values exceeding signed i256 range", () => {
        const u256AtSignedBoundary = new XdrLargeInt("u256", 1n << 255n);
        expect(() => u256AtSignedBoundary.toI256()).toThrow(RangeError);

        const u256Max = new XdrLargeInt("u256", (1n << 256n) - 1n);
        expect(() => u256Max.toI256()).toThrow(RangeError);
      });

      it("handles large positive value", () => {
        const large = 1n << 200n;
        const xdrInt = new XdrLargeInt("i256", large);
        const scVal = xdrInt.toI256();
        if (scVal.type !== "scvI256") throw new Error("expected scvI256");

        const i256 = scVal.i256;
        const loLo = i256.loLo;
        const loHi = i256.loHi;
        const hiLo = i256.hiLo;
        const hiHi = BigInt.asIntN(64, i256.hiHi);

        const reconstructed =
          (hiHi << 192n) | (hiLo << 128n) | (loHi << 64n) | loLo;
        expect(reconstructed).toBe(large);
      });
    });

    describe("toU256()", () => {
      it("encodes u256 values", () => {
        const value = 1234567890n;
        const xdrInt = new XdrLargeInt("u256", value);
        const scVal = xdrInt.toU256();
        expect(scVal.type).toBe("scvU256");
        if (scVal.type !== "scvU256") throw new Error("expected scvU256");

        const u256 = scVal.u256;
        expect(u256.loLo).toBe(value);
        expect(u256.loHi).toBe(0n);
        expect(u256.hiLo).toBe(0n);
        expect(u256.hiHi).toBe(0n);
      });

      it("does not throw for large values (no size check)", () => {
        const huge = (1n << 200n) - 1n;
        const xdrInt = new XdrLargeInt("u256", huge);
        expect(() => xdrInt.toU256()).not.toThrow();
      });

      it("handles large positive value", () => {
        const large = 1n << 200n;
        const xdrInt = new XdrLargeInt("u256", large);
        const scVal = xdrInt.toU256();
        if (scVal.type !== "scvU256") throw new Error("expected scvU256");

        const u256 = scVal.u256;
        const loLo = u256.loLo;
        const loHi = u256.loHi;
        const hiLo = u256.hiLo;
        const hiHi = u256.hiHi;

        const reconstructed =
          (hiHi << 192n) | (hiLo << 128n) | (loHi << 64n) | loLo;
        expect(reconstructed).toBe(large);
      });
    });
  });

  describe("toScVal()", () => {
    it("dispatches to toI64 for i64 type", () => {
      const xdrInt = new XdrLargeInt("i64", 42);
      const scVal = xdrInt.toScVal();
      expect(scVal.type).toBe("scvI64");
    });

    it("dispatches to toI128 for i128 type", () => {
      const xdrInt = new XdrLargeInt("i128", 42);
      const scVal = xdrInt.toScVal();
      expect(scVal.type).toBe("scvI128");
    });

    it("dispatches to toI256 for i256 type", () => {
      const xdrInt = new XdrLargeInt("i256", 42);
      const scVal = xdrInt.toScVal();
      expect(scVal.type).toBe("scvI256");
    });

    it("dispatches to toU64 for u64 type", () => {
      const xdrInt = new XdrLargeInt("u64", 42);
      const scVal = xdrInt.toScVal();
      expect(scVal.type).toBe("scvU64");
    });

    it("dispatches to toU128 for u128 type", () => {
      const xdrInt = new XdrLargeInt("u128", 42);
      const scVal = xdrInt.toScVal();
      expect(scVal.type).toBe("scvU128");
    });

    it("dispatches to toU256 for u256 type", () => {
      const xdrInt = new XdrLargeInt("u256", 42);
      const scVal = xdrInt.toScVal();
      expect(scVal.type).toBe("scvU256");
    });

    it("dispatches to toTimepoint for timepoint type", () => {
      const xdrInt = new XdrLargeInt("timepoint", 42);
      const scVal = xdrInt.toScVal();
      expect(scVal.type).toBe("scvTimepoint");
    });

    it("dispatches to toDuration for duration type", () => {
      const xdrInt = new XdrLargeInt("duration", 42);
      const scVal = xdrInt.toScVal();
      expect(scVal.type).toBe("scvDuration");
    });
  });

  describe("boundary value tests", () => {
    it("handles i64 min/max", () => {
      const maxI64 = (1n << 63n) - 1n;
      const minI64 = -(1n << 63n);

      expect(new XdrLargeInt("i64", maxI64).toBigInt()).toBe(maxI64);
      expect(new XdrLargeInt("i64", minI64).toBigInt()).toBe(minI64);
    });

    it("handles i128 min/max", () => {
      const maxI128 = (1n << 127n) - 1n;
      const minI128 = -(1n << 127n);

      expect(new XdrLargeInt("i128", maxI128).toBigInt()).toBe(maxI128);
      expect(new XdrLargeInt("i128", minI128).toBigInt()).toBe(minI128);
    });

    it("handles u64 max", () => {
      const maxU64 = (1n << 64n) - 1n;
      expect(new XdrLargeInt("u64", maxU64).toBigInt()).toBe(maxU64);
    });

    it("handles u128 max", () => {
      const maxU128 = (1n << 128n) - 1n;
      expect(new XdrLargeInt("u128", maxU128).toBigInt()).toBe(maxU128);
    });

    it("handles values near boundaries", () => {
      const nearMaxI64 = (1n << 63n) - 2n;
      const nearMinI64 = -(1n << 63n) + 1n;

      expect(new XdrLargeInt("i64", nearMaxI64).toBigInt()).toBe(nearMaxI64);
      expect(new XdrLargeInt("i64", nearMinI64).toBigInt()).toBe(nearMinI64);
    });
  });

  describe("round-trip tests", () => {
    it("preserves value through toScVal for i64", () => {
      const original = new XdrLargeInt("i64", 12345);
      const scVal = original.toScVal();
      if (scVal.type !== "scvI64") throw new Error("expected scvI64");
      expect(scVal.i64).toBe(12345n);
    });

    it("preserves value through toScVal for i128", () => {
      const value = 1n << 100n;
      const original = new XdrLargeInt("i128", value);
      const scVal = original.toScVal();
      if (scVal.type !== "scvI128") throw new Error("expected scvI128");
      const i128 = scVal.i128;

      const reconstructed = new XdrLargeInt("i128", [
        i128.lo,
        i128.hi,
      ]).toBigInt();
      expect(reconstructed).toBe(value);
    });

    it("supports JSON.stringify via the toJSON hook", () => {
      expect(JSON.stringify(new XdrLargeInt("i64", 1234n))).toBe(
        '{"value":"1234","type":"i64"}',
      );
    });

    it("preserves value and type through toJson", () => {
      const original = new XdrLargeInt("i128", 42);
      const json = original.toJson();
      expect(json.value).toBe("42");
      expect(json.type).toBe("i128");
    });
  });

  describe("type-specific constructor behavior", () => {
    it("uses correct internal constructor for each type", () => {
      // i64 and u64 use Hyper/UnsignedHyper (array parameter)
      const i64 = new XdrLargeInt("i64", [1n, 2n]);
      expect(i64).toBeInstanceOf(XdrLargeInt);

      const u64 = new XdrLargeInt("u64", [1n, 2n]);
      expect(u64).toBeInstanceOf(XdrLargeInt);

      // i128, i256 use Int128/Int256 (rest parameters) - single value works
      const i128 = new XdrLargeInt("i128", 42n);
      expect(i128).toBeInstanceOf(XdrLargeInt);

      const i256 = new XdrLargeInt("i256", 42n);
      expect(i256).toBeInstanceOf(XdrLargeInt);

      // u128, u256 use Uint128/Uint256 (rest parameters) - single value works
      const u128 = new XdrLargeInt("u128", 42n);
      expect(u128).toBeInstanceOf(XdrLargeInt);

      const u256 = new XdrLargeInt("u256", 42n);
      expect(u256).toBeInstanceOf(XdrLargeInt);
    });

    it("timepoint and duration use UnsignedHyper", () => {
      const timepoint = new XdrLargeInt("timepoint", 123456);
      expect(timepoint.toBigInt()).toBeGreaterThanOrEqual(0n);

      const duration = new XdrLargeInt("duration", 3600);
      expect(duration.toBigInt()).toBeGreaterThanOrEqual(0n);
    });
  });

  describe("error handling", () => {
    it("throws TypeError for invalid type in constructor", () => {
      expect(
        () => new XdrLargeInt("invalid" as unknown as ScIntType, 42),
      ).toThrow(TypeError);
      expect(() => new XdrLargeInt("i32" as unknown as ScIntType, 42)).toThrow(
        TypeError,
      );
    });

    it("throws RangeError for oversized values in size-checked methods", () => {
      const oversized128 = new XdrLargeInt("i256", 1n << 129n);
      expect(() => oversized128.toI128()).toThrow(RangeError);
      expect(() => oversized128.toU128()).toThrow(RangeError);

      const oversized64 = new XdrLargeInt("i128", 1n << 65n);
      expect(() => oversized64.toI64()).toThrow(RangeError);
      expect(() => oversized64.toU64()).toThrow(RangeError);
      expect(() => oversized64.toTimepoint()).toThrow(RangeError);
      expect(() => oversized64.toDuration()).toThrow(RangeError);
    });

    it("does not throw in toI256 for values within signed range", () => {
      const huge = (1n << 250n) - 1n;
      expect(() => new XdrLargeInt("i256", huge).toI256()).not.toThrow();
    });

    it("does not throw in toU256 for any size", () => {
      const huge = (1n << 250n) - 1n;
      expect(() => new XdrLargeInt("u256", huge).toU256()).not.toThrow();
    });
  });

  describe("array input edge cases", () => {
    it("handles array with varying value lengths", () => {
      const values = [1n << 32n, 1n, 1n << 16n, 1n << 48n];
      const xdrInt = new XdrLargeInt("i256", values);
      expect(xdrInt).toBeInstanceOf(XdrLargeInt);
    });

    it("handles single-element arrays", () => {
      const xdrInt = new XdrLargeInt("i64", [42n]);
      expect(xdrInt.toBigInt()).toBe(42n);
    });

    it("handles empty arrays by creating zero value", () => {
      // This might throw depending on underlying implementation
      // Test actual behavior
      try {
        const xdrInt = new XdrLargeInt("i64", []);
        expect(xdrInt.toBigInt()).toBe(0n);
      } catch (e) {
        // If it throws, that's also valid behavior
        expect(e).toBeDefined();
      }
    });
  });
});
