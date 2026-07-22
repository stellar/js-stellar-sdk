import { describe, it, expect } from "vitest";

import {
  Int32,
  Uint32,
  Int64,
  Uint64,
  Int128,
  Uint128,
} from "../../../src/xdr/index.js";

describe("Int64/Uint64 shims", () => {
  it("call form returns a native bigint", () => {
    expect(Int64("123")).toBe(123n);
    expect(Uint64(0)).toBe(0n);
  });

  it("throws a descriptive TypeError on `new`", () => {
    expect(() => new (Int64 as any)(5n)).toThrow(TypeError);
    expect(() => new (Int64 as any)(5n)).toThrow(/not supported/);
    expect(() => new (Uint64 as any)("7")).toThrow(/xdr\.Uint64\(value\)/);
  });

  it("still surfaces range errors before the `new` error", () => {
    expect(() => new (Uint64 as any)(-1n)).toThrow(/Uint64/);
  });

  describe("fromXdr", () => {
    it("rejects a string with format 'raw'", () => {
      expect(() => Int64.fromXdr("deadbeef")).toThrow();
    });

    it("decodes hex and base64 explicitly", () => {
      const bytes = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 5]);
      expect(Int64.fromXdr(bytes)).toBe(5n);
      expect(Int64.fromXdr("0000000000000005", "hex")).toBe(5n);
      expect(
        Int64.fromXdr(Buffer.from(bytes).toString("base64"), "base64"),
      ).toBe(5n);
    });

    it("requires exactly 8 bytes", () => {
      for (const len of [0, 1, 7, 9, 16]) {
        expect(() => Int64.fromXdr(new Uint8Array(len))).toThrow(
          /expected exactly 8 bytes/,
        );
        expect(() => Uint64.fromXdr(new Uint8Array(len))).toThrow(
          /expected exactly 8 bytes/,
        );
      }
      expect(Int64.fromXdr(new Uint8Array(8))).toBe(0n);
    });
  });
});

describe("Int32/Uint32 shims", () => {
  it("call form returns a native number", () => {
    expect(Int32("123")).toBe(123);
    expect(Uint32(0)).toBe(0);
  });

  it("throws a descriptive TypeError on `new`", () => {
    expect(() => new (Int32 as any)(5)).toThrow(TypeError);
    expect(() => new (Int32 as any)(5)).toThrow(/not supported/);
    expect(() => new (Uint32 as any)("7")).toThrow(/xdr\.Uint32\(value\)/);
  });

  it("still surfaces range errors before the `new` error", () => {
    expect(() => new (Uint32 as any)(-1)).toThrow(/Uint32/);
  });

  describe("fromXdr", () => {
    it("decodes raw, hex, and base64", () => {
      const bytes = new Uint8Array([0, 0, 0, 5]);
      expect(Int32.fromXdr(bytes)).toBe(5);
      expect(Int32.fromXdr("00000005", "hex")).toBe(5);
      expect(
        Int32.fromXdr(Buffer.from(bytes).toString("base64"), "base64"),
      ).toBe(5);
    });

    it("respects signedness", () => {
      const allOnes = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
      expect(Int32.fromXdr(allOnes)).toBe(-1);
      expect(Uint32.fromXdr(allOnes)).toBe(0xffffffff);
    });

    it("requires exactly 4 bytes", () => {
      for (const len of [0, 1, 3, 5, 8]) {
        expect(() => Int32.fromXdr(new Uint8Array(len))).toThrow(
          /expected exactly 4 bytes/,
        );
        expect(() => Uint32.fromXdr(new Uint8Array(len))).toThrow(
          /expected exactly 4 bytes/,
        );
      }
    });
  });
});

describe("wide-int constructors", () => {
  it("reject extra legacy slice arguments instead of dropping them", () => {
    expect(() => new (Int128 as any)(1n, 2n)).toThrow(TypeError);
    expect(() => new (Uint128 as any)(1n, 2n)).toThrow(/single value/);
  });
});
