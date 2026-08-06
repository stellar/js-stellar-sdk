import { describe, it, expect } from "vitest";

import {
  Price,
  ScVal,
  TransactionEnvelope,
  AssetType,
} from "../../../src/xdr/index.js";

describe("validateXdr", () => {
  it("returns true for valid raw bytes", () => {
    const bytes = new Price({ n: 1, d: 2 }).toXdr();
    expect(Price.validateXdr(bytes)).toBe(true);
  });

  it("returns true for valid base64 and hex strings", () => {
    const val = ScVal.scvSymbol("hi");
    expect(ScVal.validateXdr(val.toXdr("base64"), "base64")).toBe(true);
    expect(ScVal.validateXdr(val.toXdr("hex"), "hex")).toBe(true);
  });

  it("works on enums", () => {
    const bytes = AssetType.assetTypeNative.toXdr();
    expect(AssetType.validateXdr(bytes)).toBe(true);
    expect(AssetType.validateXdr(new Uint8Array([0, 0, 0, 99]))).toBe(false);
  });

  it("returns false for bytes of the wrong type", () => {
    const bytes = new Price({ n: 1, d: 2 }).toXdr();
    expect(TransactionEnvelope.validateXdr(bytes)).toBe(false);
  });

  it("returns false for trailing bytes", () => {
    const bytes = new Price({ n: 1, d: 2 }).toXdr();
    const padded = new Uint8Array([...bytes, 0, 0, 0, 0]);
    expect(Price.validateXdr(padded)).toBe(false);
  });

  it("returns false for truncated input", () => {
    const bytes = new Price({ n: 1, d: 2 }).toXdr().slice(0, -1);
    expect(Price.validateXdr(bytes)).toBe(false);
  });

  it("returns false (not a throw) on malformed base64 and hex", () => {
    expect(ScVal.validateXdr("not base64!!!", "base64")).toBe(false);
    expect(ScVal.validateXdr("zz-not-hex", "hex")).toBe(false);
  });
});
