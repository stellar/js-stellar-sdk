import { describe, it, expect } from "vitest";
import { best_r } from "../../../src/util/continued_fraction.js";
import BigNumber from "bignumber.js";

describe("best_r", () => {
  it("correctly calculates the best rational approximation", () => {
    const tests: [string, BigNumber | string][] = [
      ["1,10", "0.1"],
      ["1,100", "0.01"],
      ["1,1000", "0.001"],
      ["54301793,100000", "543.017930"],
      ["31969983,100000", "319.69983"],
      ["93,100", "0.93"],
      ["1,2", "0.5"],
      ["173,100", "1.730"],
      ["5333399,6250000", "0.85334384"],
      ["11,2", "5.5"],
      ["272783,100000", "2.72783"],
      ["638082,1", "638082.0"],
      ["36731261,12500000", "2.93850088"],
      ["1451,25", "58.04"],
      ["8253,200", "41.265"],
      ["12869,2500", "5.1476"],
      ["4757,50", "95.14"],
      ["3729,5000", "0.74580"],
      ["4119,1", "4119.0"],
      ["118,37", new BigNumber(118).div(37)],
    ];

    for (const [expected, input] of tests) {
      expect(best_r(input).toString()).toBe(expected);
    }
  });

  it("handles negative input values", () => {
    expect(best_r("-0.5").toString()).toBe("-1,2");
    expect(best_r("-1.73").toString()).toBe("-173,100");
  });

  it("approximates values near int32 boundaries", () => {
    // Very small value: best int32 approximation is 1/MAX_INT
    expect(best_r("0.0000000003").toString()).toBe("1,2147483647");
    // Value just above MAX_INT: best int32 approximation is MAX_INT/1
    expect(best_r("2147483648").toString()).toBe("2147483647,1");
  });

  it("round-trips XDR prices at int32 boundaries", () => {
    // Regression: fromXDRPrice({n:1, d:2147483647}) produces a string like
    // "4.6566128752457969e-10" which must survive best_r without throwing.
    const BigNum = new BigNumber(1).div(new BigNumber(2147483647));
    const [n, d] = best_r(BigNum);
    expect(n).toBe(1);
    expect(d).toBe(2147483647);
  });

  it("throws an error for zero", () => {
    expect(() => best_r("0")).toThrowError(/Couldn't find approximation/);
  });
});
