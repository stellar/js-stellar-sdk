import { describe, expect, it } from "vitest";

import {
  AssetType,
  type AssetTypeName,
  XdrError,
} from "../../../src/xdr/index.js";

describe("EnumValue helpers", () => {
  it("reuses schema metadata to look up enum singletons by value", () => {
    expect(AssetType.fromValue(0)).toBe(AssetType.assetTypeNative);
    expect(AssetType.fromValue(3)).toBe(AssetType.assetTypePoolShare);
  });

  it("rejects unknown enum values", () => {
    expect(() => AssetType.fromValue(99)).toThrow(XdrError);
    expect(() => AssetType.fromValue(99)).toThrow(
      "AssetType: unknown enum value 99",
    );
  });

  it("rejects names that are static class properties but not enum members", () => {
    expect(() =>
      AssetType.fromName("schema" as unknown as AssetTypeName),
    ).toThrow("AssetType: unknown name schema");
  });
});
