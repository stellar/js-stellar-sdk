import { describe, it, expect } from "vitest";

import { Memo, ScVal, XdrString } from "../../../src/xdr/index.js";

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

  describe("`.value` on string<N> union arms", () => {
    type Input = string | XdrString | Uint8Array;
    const arms: {
      name: string;
      build: (v: Input) => { value: string; field: XdrString };
    }[] = [
      {
        name: "Memo.memoText",
        build: (v) => {
          const m = Memo.memoText(v);
          return { value: m.value, field: m.text };
        },
      },
      {
        name: "ScVal.scvString",
        build: (v) => {
          const s = ScVal.scvString(v);
          return { value: s.value, field: s.str };
        },
      },
      {
        name: "ScVal.scvSymbol",
        build: (v) => {
          const s = ScVal.scvSymbol(v);
          return { value: s.value, field: s.sym };
        },
      },
      {
        name: "ScVal.scvExecutableTag",
        build: (v) => {
          const s = ScVal.scvExecutableTag(v);
          return { value: s.value, field: s.executableTag };
        },
      },
    ];

    it.each(arms)(
      "$name: `.value` decodes leniently and the arm field keeps the bytes",
      ({ build }) => {
        const arm = build(new Uint8Array([0xff]));
        expect(arm.value).toBe("\uFFFD");
        expect(Array.from(arm.field.bytes)).toEqual([0xff]);
        expect(Array.from(build(arm.field).field.bytes)).toEqual([0xff]);
        expect(Array.from(build(arm.value).field.bytes)).toEqual([
          0xef, 0xbf, 0xbd,
        ]);
      },
    );

    it("changes decoded wire bytes when a memo is rebuilt from `.value`", () => {
      const memo = Memo.fromXdr("0000000100000001ff000000", "hex");
      if (memo.type !== "memoText") throw new Error("expected memoText");
      expect(Memo.memoText(memo.value).toXdr("hex")).toBe(
        "0000000100000003efbfbd00",
      );
      expect(Memo.memoText(memo.text).toXdr("hex")).toBe(
        "0000000100000001ff000000",
      );
    });
  });

  describe("lone surrogates", () => {
    it.each([
      { name: "lone high", input: "\uD800", bytes: [0xef, 0xbf, 0xbd] },
      { name: "lone low", input: "\uDC00", bytes: [0xef, 0xbf, 0xbd] },
      {
        name: "pair cut at the end",
        input: "a😀".slice(0, 2),
        bytes: [0x61, 0xef, 0xbf, 0xbd],
      },
      {
        name: "pair cut at the start",
        input: "😀b".slice(1),
        bytes: [0xef, 0xbf, 0xbd, 0x62],
      },
      {
        name: "reversed pair",
        input: "\uDE00\uD83D",
        bytes: [0xef, 0xbf, 0xbd, 0xef, 0xbf, 0xbd],
      },
    ])("encodes a $name as U+FFFD without throwing", ({ input, bytes }) => {
      expect(Array.from(new XdrString(input).bytes)).toEqual(bytes);
    });
  });

  describe("well-formed edge shapes", () => {
    it.each([
      { name: "empty string", input: "", bytes: [] },
      { name: "surrogate pair", input: "😀", bytes: [0xf0, 0x9f, 0x98, 0x80] },
      { name: "NUL", input: "a\0b", bytes: [0x61, 0x00, 0x62] },
    ])("round-trips $name through `.value`", ({ input, bytes }) => {
      const memo = Memo.memoText(input);
      expect(Array.from(memo.text.bytes)).toEqual(bytes);
      expect(memo.value).toBe(input);
      expect(Array.from(Memo.memoText(memo.value).text.bytes)).toEqual(bytes);
    });
  });
});
