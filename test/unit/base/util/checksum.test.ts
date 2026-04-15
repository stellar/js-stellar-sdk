import { describe, it, expect } from "vitest";
import { verifyChecksum } from "../../../src/util/checksum.js";

describe("verifyChecksum", () => {
  it("returns true for identical arrays", () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 3]);
    expect(verifyChecksum(a, b)).toBe(true);
  });

  it("returns false for different contents", () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 4]);
    expect(verifyChecksum(a, b)).toBe(false);
  });

  it("returns false for different lengths", () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2]);
    expect(verifyChecksum(a, b)).toBe(false);
  });

  it("returns true for two empty arrays", () => {
    expect(verifyChecksum(new Uint8Array([]), new Uint8Array([]))).toBe(true);
  });

  it("returns true for single matching byte", () => {
    expect(verifyChecksum(new Uint8Array([0xff]), new Uint8Array([0xff]))).toBe(
      true
    );
  });

  it("returns false when first byte differs", () => {
    const a = new Uint8Array([0, 2, 3]);
    const b = new Uint8Array([1, 2, 3]);
    expect(verifyChecksum(a, b)).toBe(false);
  });

  it("returns false when last byte differs", () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 0]);
    expect(verifyChecksum(a, b)).toBe(false);
  });
});
