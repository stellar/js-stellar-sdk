import { describe, it, expect } from "vitest";

import { decodeStream, ScVal, XdrError } from "../../../src/xdr/index.js";

describe("decodeStream", () => {
  it("decodes several concatenated values of one type", () => {
    const values = [ScVal.scvU32(1), ScVal.scvU32(2), ScVal.scvSymbol("hi")];
    const buf = new Uint8Array(values.flatMap((v) => Array.from(v.toXdr())));

    const decoded = decodeStream(ScVal, buf);
    expect(decoded).toHaveLength(3);
    decoded.forEach((v, i) =>
      expect(v.toXdr("base64")).toBe(values[i].toXdr("base64")),
    );
  });

  it("returns an empty array for an empty buffer", () => {
    expect(decodeStream(ScVal, new Uint8Array(0))).toEqual([]);
  });

  it("throws when the buffer ends mid-value", () => {
    const bytes = ScVal.scvU32(1).toXdr().slice(0, -1);
    expect(() => decodeStream(ScVal, bytes)).toThrow(XdrError);
  });

  it("accepts encoded string input with an explicit format", () => {
    const b64 = ScVal.scvU32(7).toXdr("base64");
    const [v] = decodeStream(ScVal, b64, "base64");
    expect(v.type).toBe("scvU32");
    expect(v.value).toBe(7);
  });
});
