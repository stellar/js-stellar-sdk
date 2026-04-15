import { describe, it, expect } from "vitest";
import BigNumber from "bignumber.js";
import SDKBigNumber from "../../../src/util/bignumber.js";

describe("bignumber", () => {
  it("Debug mode has been enabled in the cloned bignumber", () => {
    expect(SDKBigNumber.DEBUG).toBe(true);
  });

  it("Debug mode has been disabled (default setting) in the original bignumber", () => {
    expect(BigNumber.DEBUG).toBeUndefined();
  });
});
