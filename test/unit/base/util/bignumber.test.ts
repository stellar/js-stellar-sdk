import { describe, it, expect } from "vitest";
import BigNumber from "bignumber.js";
import SDKBigNumber from "../../../../src/base/util/bignumber.js";

describe("bignumber", () => {
  it("uses strict parsing in the cloned bignumber", () => {
    expect(SDKBigNumber.config().STRICT).toBe(true);
    expect(() => new SDKBigNumber("invalid")).toThrow(
      "[BigNumber Error] Not a number: invalid",
    );
  });

  it("is isolated from the original bignumber config", () => {
    BigNumber.config({ STRICT: false });

    try {
      expect(new BigNumber("invalid").isNaN()).toBe(true);
      expect(() => new SDKBigNumber("invalid")).toThrow(
        "[BigNumber Error] Not a number: invalid",
      );
    } finally {
      BigNumber.config({ STRICT: true });
    }
  });
});
