import { describe, it, expect } from "vitest";
import { Soroban } from "../../src/soroban.js";
import cereal from "../../src/jsxdr.js";

describe("Soroban", () => {
  it("should have XDR serialization", () => {
    expect(cereal).toBeDefined();
  });

  describe("formatTokenAmount", () => {
    const SUCCESS_TEST_CASES = [
      { amount: "1000000001", decimals: 7, expected: "100.0000001" },
      { amount: "10000000010", decimals: 5, expected: "100000.0001" },
      { amount: "10000000010", decimals: 0, expected: "10000000010" },
      { amount: "10000", decimals: 10, expected: "0.000001" },
      { amount: "10000", decimals: 4, expected: "1.0" },
      { amount: "1567890", decimals: 10, expected: "0.000156789" },
      { amount: "1230", decimals: 0, expected: "1230" },
      { amount: "1230", decimals: 1, expected: "123.0" },
      { amount: "123", decimals: 3, expected: "0.123" },
    ];

    const FAILED_TEST_CASES = [
      {
        amount: "1000000001.1",
        decimals: 7,
        expected: /No decimals are allowed/,
      },
      {
        amount: "10000.00001.1",
        decimals: 4,
        expected: /No decimals are allowed/,
      },
    ];

    SUCCESS_TEST_CASES.forEach((testCase) => {
      it(`returns ${testCase.expected} for ${testCase.amount} with ${testCase.decimals} decimals`, () => {
        expect(
          Soroban.formatTokenAmount(testCase.amount, testCase.decimals),
        ).toBe(testCase.expected);
      });
    });

    FAILED_TEST_CASES.forEach((testCase) => {
      it(`fails on the input with decimals`, () => {
        expect(() =>
          Soroban.formatTokenAmount(testCase.amount, testCase.decimals),
        ).toThrow(testCase.expected);
      });
    });

    it("handles negative amounts", () => {
      expect(Soroban.formatTokenAmount("-1000", 3)).toBe("-1.0");
    });

    it("handles negative amounts requiring zero-padding", () => {
      expect(Soroban.formatTokenAmount("-1", 3)).toBe("-0.001");
      expect(Soroban.formatTokenAmount("-1", 1)).toBe("-0.1");
      expect(Soroban.formatTokenAmount("-123", 4)).toBe("-0.0123");
      expect(Soroban.formatTokenAmount("-123", 5)).toBe("-0.00123");
    });
  });

  describe("parseTokenAmount", () => {
    const SUCCESS_TEST_CASES = [
      { amount: "100", decimals: 2, expected: "10000" },
      { amount: "123.4560", decimals: 5, expected: "12345600" },
      { amount: "100", decimals: 5, expected: "10000000" },
    ];

    const FAILED_TEST_CASES = [
      {
        amount: "1000000.001.1",
        decimals: 7,
        expected: /Invalid decimal value/i,
      },
      {
        amount: "1.123",
        decimals: 2,
        expected: /Too many decimal places/i,
      },
    ];

    SUCCESS_TEST_CASES.forEach((testCase) => {
      it(`returns ${testCase.expected} for ${testCase.amount} of a token with ${testCase.decimals} decimals`, () => {
        expect(
          Soroban.parseTokenAmount(testCase.amount, testCase.decimals),
        ).toBe(testCase.expected);
      });
    });

    FAILED_TEST_CASES.forEach((testCase) => {
      it(`fails on the input with more than one decimals`, () => {
        expect(() =>
          Soroban.parseTokenAmount(testCase.amount, testCase.decimals),
        ).toThrow(testCase.expected);
      });
    });

    it("handles decimals === 0", () => {
      expect(Soroban.parseTokenAmount("100", 0)).toBe("100");
    });

    it("handles trailing dot", () => {
      expect(Soroban.parseTokenAmount("100.", 3)).toBe("100000");
    });

    it("handles negative amounts", () => {
      expect(Soroban.parseTokenAmount("-100", 2)).toBe("-10000");
    });
  });
});
