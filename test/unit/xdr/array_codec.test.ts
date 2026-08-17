import { describe, it, expect } from "vitest";

import {
  decodeArray,
  encodeArray,
  ScVal,
  XdrError,
} from "../../../src/xdr/index.js";

describe("encodeArray / decodeArray", () => {
  const values = [ScVal.scvU32(1), ScVal.scvU32(2), ScVal.scvSymbol("hi")];

  it("round-trips a list through raw bytes", () => {
    const bytes = encodeArray(ScVal, values);
    const decoded = decodeArray(ScVal, bytes);
    expect(decoded).toHaveLength(3);
    decoded.forEach((v, i) => expect(v.equals(values[i])).toBe(true));
  });

  it("round-trips through base64 and hex", () => {
    const b64 = encodeArray(ScVal, values, "base64");
    expect(typeof b64).toBe("string");
    const fromB64 = decodeArray(ScVal, b64, "base64");
    fromB64.forEach((v, i) => expect(v.equals(values[i])).toBe(true));

    const hex = encodeArray(ScVal, values, "hex");
    const fromHex = decodeArray(ScVal, hex, "hex");
    fromHex.forEach((v, i) => expect(v.equals(values[i])).toBe(true));
  });

  it("emits the XDR var-array wire format: count prefix + elements", () => {
    const bytes = encodeArray(ScVal, values);
    expect(Array.from(bytes.subarray(0, 4))).toEqual([0, 0, 0, 3]);
    const elements = new Uint8Array(
      values.flatMap((v) => Array.from(v.toXdr())),
    );
    expect(Array.from(bytes.subarray(4))).toEqual(Array.from(elements));
  });

  it("encodes an empty list as a zero count and decodes it back", () => {
    const bytes = encodeArray(ScVal, []);
    expect(Array.from(bytes)).toEqual([0, 0, 0, 0]);
    expect(decodeArray(ScVal, bytes)).toEqual([]);
  });

  it("throws when the buffer ends mid-element", () => {
    const bytes = encodeArray(ScVal, values).slice(0, -1);
    expect(() => decodeArray(ScVal, bytes)).toThrow(XdrError);
  });

  it("throws on trailing bytes past the declared count", () => {
    const bytes = encodeArray(ScVal, values);
    const padded = new Uint8Array([...bytes, 0, 0, 0, 0]);
    expect(() => decodeArray(ScVal, padded)).toThrow(XdrError);
  });
});
