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

  describe("maxLength", () => {
    it("accepts a list at the limit", () => {
      const bytes = encodeArray(ScVal, values, { maxLength: 3 });
      const decoded = decodeArray(ScVal, bytes, { maxLength: 3 });
      decoded.forEach((v, i) => expect(v.equals(values[i])).toBe(true));
    });

    it("rejects encoding more elements than the limit", () => {
      expect(() => encodeArray(ScVal, values, { maxLength: 2 })).toThrow(
        XdrError,
      );
      expect(() =>
        encodeArray(ScVal, values, "base64", { maxLength: 2 }),
      ).toThrow(XdrError);
    });

    it("rejects decoding a count past the limit", () => {
      const bytes = encodeArray(ScVal, values);
      expect(() => decodeArray(ScVal, bytes, { maxLength: 2 })).toThrow(
        XdrError,
      );

      const b64 = encodeArray(ScVal, values, "base64");
      expect(() => decodeArray(ScVal, b64, "base64", { maxLength: 2 })).toThrow(
        XdrError,
      );
    });

    it("rejects an inflated count before reading any element", () => {
      // A 4-byte header claiming 2^31 elements over an otherwise empty body:
      // the count check must fire instead of allocating for the claim.
      const bogus = new Uint8Array([0x7f, 0xff, 0xff, 0xff]);
      expect(() => decodeArray(ScVal, bogus, { maxLength: 16 })).toThrow(
        XdrError,
      );
    });
  });

  describe("maxDepth", () => {
    /** An `ScVal` vector nested `depth` levels deep around a u32. */
    const nest = (depth: number): ScVal => {
      let v: ScVal = ScVal.scvU32(1);
      for (let i = 0; i < depth; i++) v = ScVal.scvVec([v]);
      return v;
    };

    it("rejects encoding past the limit", () => {
      expect(() => encodeArray(ScVal, [nest(8)], { maxDepth: 4 })).toThrow(
        XdrError,
      );
    });

    it("rejects decoding past the limit", () => {
      const bytes = encodeArray(ScVal, [nest(8)]);
      expect(() => decodeArray(ScVal, bytes, { maxDepth: 4 })).toThrow(
        XdrError,
      );
      // Same bytes, same helper — only the cap makes them unacceptable.
      expect(decodeArray(ScVal, bytes)).toHaveLength(1);
    });

    it("counts the array itself as a level", () => {
      // Flat elements, so a cap of 1 leaves no room past the array itself.
      // (How many levels a given element costs is a js-xdr detail — an
      // ScVal union arm nests through option/array/lazy wrappers.)
      const bytes = encodeArray(ScVal, values);
      expect(() => decodeArray(ScVal, bytes, { maxDepth: 1 })).toThrow(
        XdrError,
      );
      expect(decodeArray(ScVal, bytes, { maxDepth: 2 })).toHaveLength(3);
    });
  });
});
