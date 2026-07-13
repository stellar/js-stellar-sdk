import { describe, it, expect } from "vitest";

import { XdrString } from "../../../src/xdr/index.js";

describe("XdrString", () => {
  describe("asStringOrBytes", () => {
    it("returns a string for valid UTF-8", () => {
      expect(new XdrString("hello").asStringOrBytes()).toBe("hello");
    });

    it("falls back to the raw bytes for invalid UTF-8", () => {
      const binary = new Uint8Array([0xff, 0xfe, 0x00]);
      const out = new XdrString(binary).asStringOrBytes();
      expect(out).toBeInstanceOf(Uint8Array);
      expect(Array.from(out as Uint8Array)).toEqual(Array.from(binary));
    });
  });
});
