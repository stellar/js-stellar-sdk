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

  describe("BOM handling", () => {
    const withBom = new Uint8Array([0xef, 0xbb, 0xbf, 0x68, 0x69]);

    it("keeps a leading BOM in the strict decode", () => {
      expect(new XdrString(withBom).toStringStrict()).toBe("﻿hi");
    });

    it("keeps a leading BOM in the lenient decode", () => {
      expect(new XdrString(withBom).toString()).toBe("﻿hi");
    });

    it("round-trips a BOM-prefixed payload byte for byte", () => {
      const out = new XdrString(withBom).asStringOrBytes();
      expect(new XdrString(out as string).bytes).toEqual(withBom);
    });
  });

  describe("copy construction", () => {
    it("copies the bytes instead of aliasing the original", () => {
      const original = new XdrString("A");
      const copy = new XdrString(original);
      original.bytes[0] = "B".charCodeAt(0);
      expect(copy.toString()).toBe("A");
      expect(original.toString()).toBe("B");
    });
  });
});
