import { describe, it, expect } from "vitest";

import { Int64, Uint64, Int128, Uint128 } from "../../../src/xdr/index.js";

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
  });
});

describe("wide-int constructors", () => {
  it("reject extra legacy slice arguments instead of dropping them", () => {
    expect(() => new (Int128 as any)(1n, 2n)).toThrow(TypeError);
    expect(() => new (Uint128 as any)(1n, 2n)).toThrow(/single value/);
  });
});
