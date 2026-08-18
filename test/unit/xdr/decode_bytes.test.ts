import { describe, it, expect } from "vitest";

import {
  AssetCode4,
  Hash,
  ScVal,
  XdrError,
  decodeBytes,
} from "../../../src/xdr/index.js";

describe("decodeBytes", () => {
  it("throws XdrError on malformed hex", () => {
    expect(() => ScVal.fromXdr("zzzz", "hex")).toThrow(XdrError);
    expect(() => ScVal.fromXdr("zzzz", "hex")).toThrow(/invalid hex input/);
    // odd length, a different failure inside the hex decoder
    expect(() => ScVal.fromXdr("abc", "hex")).toThrow(XdrError);
  });

  it("throws XdrError on malformed base64", () => {
    expect(() => ScVal.fromXdr("not-valid-xdr", "base64")).toThrow(XdrError);
    expect(() => ScVal.fromXdr("not-valid-xdr", "base64")).toThrow(
      /invalid base64 input/,
    );
  });

  it("throws XdrError from byte-alias constructors too", () => {
    expect(() => new Hash("zz".repeat(32))).toThrow(XdrError);
  });

  it("keeps TypeError for a non-string input, which is caller error", () => {
    expect(() => decodeBytes(123 as never, "hex")).toThrow(TypeError);
    expect(() => decodeBytes(null as never, "base64")).toThrow(TypeError);
    expect(() => new Hash(123 as never)).toThrow(TypeError);
    // the ascii path reports the same class, from `uint8array-extras`
    expect(() => new AssetCode4(123 as never)).toThrow(TypeError);
  });

  it("reports the input type before the format, whatever the format", () => {
    expect(() => decodeBytes(123 as never, "raw")).toThrow(TypeError);
    expect(() => decodeBytes(123 as never, undefined)).toThrow(TypeError);
    expect(() => decodeBytes(123 as never, "bogus" as never)).toThrow(
      TypeError,
    );
  });

  it("still decodes valid input", () => {
    const hex = "ab".repeat(32);
    expect(decodeBytes(hex, "hex")).toEqual(new Uint8Array(32).fill(0xab));
    expect(new Hash(hex).toXdr("hex")).toBe(hex);
    expect(ScVal.fromXdr("AAAAAxI0Vng=", "base64").toXdr("base64")).toBe(
      "AAAAAxI0Vng=",
    );
    expect(new AssetCode4("USD").toXdr("hex")).toBe("55534400");
  });
});
