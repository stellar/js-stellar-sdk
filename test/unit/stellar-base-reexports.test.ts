/**
 * This test validates that the scval conversion functions work correctly.
 * These functions are re-exported from @stellar/stellar-base with added JSDoc.
 *
 * Note: This test imports from stellar-base directly to test functionality.
 * The JSDoc improvements can be verified by checking the generated lib/index.d.ts
 * file or by using an IDE with the built package.
 *
 * To verify JSDoc appears in IDE tooltips:
 * 1. Build the package: yarn build:node
 * 2. Import from the built lib: import { nativeToScVal } from './lib/index'
 * 3. Hover over the function in your IDE to see the full documentation
 */

import { describe, it, expect } from "vitest";
import {
  nativeToScVal,
  scValToNative,
  scValToBigInt,
} from "@stellar/stellar-base";

describe("stellar-base re-exports with JSDoc", () => {
  it("nativeToScVal should convert native values to ScVal", () => {
    const scVal = nativeToScVal(1234n);
    expect(scVal).toBeDefined();
    expect(scVal.switch()).toBeDefined();
  });

  it("scValToNative should convert ScVal to native values", () => {
    const scVal = nativeToScVal(5678n);
    const native = scValToNative(scVal);
    expect(native).toBe(5678n);
  });

  it("scValToBigInt should extract BigInt from ScVal", () => {
    const scVal = nativeToScVal(9999n);
    const bigIntVal = scValToBigInt(scVal);
    expect(bigIntVal).toBe(9999n);
  });

  it("nativeToScVal should handle type options", () => {
    const val = nativeToScVal("test", { type: "symbol" });
    expect(val).toBeDefined();

    const converted = scValToNative(val);
    expect(typeof converted).toBe("string");
  });

  it("nativeToScVal should handle complex types", () => {
    const complexValue = {
      a: 1n,
      b: "test",
      c: [1, 2, 3],
    };
    const scVal = nativeToScVal(complexValue);
    expect(scVal).toBeDefined();

    const native = scValToNative(scVal);
    expect(native).toBeDefined();
  });
});
