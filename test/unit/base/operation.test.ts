import { describe, it, expect } from "vitest";
import xdr from "../../src/xdr.js";
import {
  checkUnsignedIntValue,
  fromXDRAmount,
  fromXDRPrice,
  isValidAmount,
  toXDRAmount,
  toXDRPrice,
} from "../../src/util/operations.js";

describe("checkUnsignedIntValue()", () => {
  it("returns correct values for valid inputs", () => {
    const cases: Array<{
      value: number | string | undefined;
      expected: number | undefined;
    }> = [
      { value: 0, expected: 0 },
      { value: 10, expected: 10 },
      { value: "0", expected: 0 },
      { value: "10", expected: 10 },
      { value: undefined, expected: undefined },
    ];

    for (const { value, expected } of cases) {
      expect(checkUnsignedIntValue("field", value)).toBe(expected);
    }
  });

  it("throws for invalid values", () => {
    const invalids: unknown[] = [
      {},
      [],
      "",
      "test",
      "0.5",
      "-10",
      "-10.5",
      "Infinity",
      Infinity,
      "Nan",
      NaN,
    ];

    for (const value of invalids) {
      expect(() => checkUnsignedIntValue("field", value as number)).toThrow();
    }
  });

  it("applies isValidFunction when provided", () => {
    const lessThan10 = (v: number) => v < 10;

    expect(checkUnsignedIntValue("field", undefined, lessThan10)).toBe(
      undefined,
    );

    expect(checkUnsignedIntValue("field", 8, lessThan10)).toBe(8);
    expect(checkUnsignedIntValue("field", "8", lessThan10)).toBe(8);

    expect(() => checkUnsignedIntValue("field", 12, lessThan10)).toThrow();
    expect(() => checkUnsignedIntValue("field", "12", lessThan10)).toThrow();
  });
});

describe("isValidAmount()", () => {
  it("returns true for valid amounts", () => {
    const valid = ["10", "0.10", "0.1234567", "922337203685.4775807"];
    for (const amount of valid) {
      expect(isValidAmount(amount)).toBe(true);
    }
  });

  it("returns false for invalid amounts", () => {
    const invalid: unknown[] = [
      100,
      100.5,
      "",
      "test",
      "0",
      "-10",
      "-10.5",
      "0.12345678",
      "922337203685.4775808",
      "Infinity",
      Infinity,
      "Nan",
      NaN,
    ];
    for (const amount of invalid) {
      expect(isValidAmount(amount as string)).toBe(false);
    }
  });

  it("allows 0 only when allowZero is true", () => {
    expect(isValidAmount("0")).toBe(false);
    expect(isValidAmount("0", true)).toBe(true);
  });
});

describe("fromXDRAmount()", () => {
  it("correctly parses XDR amounts", () => {
    expect(fromXDRAmount(xdr.Int64.fromString("1"))).toBe("0.0000001");
    expect(fromXDRAmount(xdr.Int64.fromString("10000000"))).toBe("1.0000000");
    expect(fromXDRAmount(xdr.Int64.fromString("10000000000"))).toBe(
      "1000.0000000",
    );
    expect(fromXDRAmount(xdr.Int64.fromString("1000000000000000000"))).toBe(
      "100000000000.0000000",
    );
  });
});

describe("toXDRAmount()", () => {
  it("correctly converts string amounts to XDR Int64", () => {
    expect(toXDRAmount("0.0000001").toString()).toBe("1");
    expect(toXDRAmount("1.0000000").toString()).toBe("10000000");
    expect(toXDRAmount("1000.0000000").toString()).toBe("10000000000");
    expect(toXDRAmount("100000000000.0000000").toString()).toBe(
      "1000000000000000000",
    );
  });
});

describe("fromXDRPrice()", () => {
  it("converts an XDR Price to a decimal string", () => {
    expect(fromXDRPrice(new xdr.Price({ n: 1, d: 2 }))).toBe("0.5");
    expect(fromXDRPrice(new xdr.Price({ n: 11, d: 10 }))).toBe("1.1");
    expect(fromXDRPrice(new xdr.Price({ n: 1, d: 1 }))).toBe("1");
  });
});

describe("toXDRPrice()", () => {
  it("converts a string price to XDR", () => {
    const price = toXDRPrice("0.5");
    expect(price.n() / price.d()).toBeCloseTo(0.5);
  });

  it("converts a number price to XDR", () => {
    const price = toXDRPrice(1.5);
    expect(price.n() / price.d()).toBeCloseTo(1.5);
  });

  it("converts a {n, d} fraction to XDR", () => {
    const price = toXDRPrice({ n: 11, d: 10 });
    expect(price.n()).toBe(11);
    expect(price.d()).toBe(10);
  });

  it("throws for a negative price", () => {
    expect(() => toXDRPrice({ n: -1, d: 10 })).toThrow(
      /price must be positive/,
    );
    expect(() => toXDRPrice({ n: 1, d: -10 })).toThrow(
      /price must be positive/,
    );
  });

  it("throws for a zero denominator", () => {
    expect(() => toXDRPrice({ n: 1, d: 0 })).toThrow(/price must be positive/);
    expect(() => toXDRPrice({ n: 0, d: 0 })).toThrow(/price must be positive/);
  });

  it("throws 'price must be positive' for zero numeric price", () => {
    expect(() => toXDRPrice("0")).toThrow(/price must be positive/);
    expect(() => toXDRPrice(0)).toThrow(/price must be positive/);
  });

  it("throws for non-numeric string inputs", () => {
    expect(() => toXDRPrice("abc")).toThrow(/not a number/i);
    expect(() => toXDRPrice("")).toThrow(/not a number/i);
  });

  it("throws 'price must be positive' for NaN input", () => {
    expect(() => toXDRPrice(NaN)).toThrow(/price must be positive/);
  });

  it("throws 'price must be positive' for Infinity input", () => {
    expect(() => toXDRPrice(Infinity)).toThrow(/price must be positive/);
  });
});
