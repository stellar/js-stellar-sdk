import { describe, expect, it } from "vitest";
import {
  stringToUint8Array,
  uint8ArrayToHex,
  uint8ArrayToString,
} from "uint8array-extras";
import {
  Memo,
  MemoNone,
  MemoID,
  MemoText,
  MemoHash,
  MemoReturn,
} from "../../../src/base/memo.js";

describe("Memo", () => {
  describe("constructor", () => {
    it("throws error when type is invalid", () => {
      // @ts-expect-error testing invalid input
      expect(() => new Memo("test")).toThrow(/Invalid memo type/);
    });
  });

  describe(".none()", () => {
    it("converts to/from xdr object", () => {
      const memo = Memo.none();
      expect(memo.type).toBe(MemoNone);
      expect(memo.value).toBeNull();

      const xdrMemo = memo.toXdrObject();
      expect(xdrMemo.type).toBe("memoNone");

      const baseMemo = Memo.fromXdrObject(xdrMemo);
      expect(baseMemo.type).toBe(MemoNone);
      expect(baseMemo.value).toBeNull();
    });
  });

  describe(".text()", () => {
    it("accepts a plain Uint8Array for byte-exact content", () => {
      const bytes = new Uint8Array([0xe2, 0x82, 0xac]);
      const memo = Memo.text(bytes);
      expect(memo.type).toBe(MemoText);
      const xdrMemo = memo.toXdrObject();
      if (xdrMemo.type !== "memoText") throw new Error("expected memoText");
      expect(Array.from(xdrMemo.text.bytes)).toEqual(Array.from(bytes));
    });

    it("returns a value for a correct argument", () => {
      const memo = Memo.text("test");
      expect(memo.type).toBe(MemoText);
      expect(memo.value).toBe("test");

      const memoUtf8 = Memo.text("三代之時");
      expect(memoUtf8.type).toBe(MemoText);
      expect(memoUtf8.value).toBe("三代之時");

      const xdrMemoUtf8 = memoUtf8.toXdrObject();
      if (xdrMemoUtf8.type !== "memoText") {
        throw new Error("expected memoText");
      }
      // `text` is an XdrString wrapper — compare the raw bytes.
      const a = new Uint8Array(xdrMemoUtf8.text.bytes);
      const b = stringToUint8Array("三代之時");
      expect(a).toEqual(b);
    });

    it("returns a value for a correct argument (utf8)", () => {
      const memoText = new Memo(MemoText, new Uint8Array([0xd1]))
        .toXdrObject()
        .toXdr();
      const expected = new Uint8Array([
        // memo_text
        0x00, 0x00, 0x00, 0x01,
        // length
        0x00, 0x00, 0x00, 0x01,
        // value
        0xd1, 0x00, 0x00, 0x00,
      ]);
      expect(Array.from(memoText)).toEqual(Array.from(expected));
    });

    it("converts to/from xdr object", () => {
      const memo = Memo.text("test");
      expect(memo.type).toBe(MemoText);
      expect(memo.value).toBe("test");

      const xdrMemo = memo.toXdrObject();
      expect(xdrMemo.type).toBe("memoText");
      if (xdrMemo.type !== "memoText") throw new Error("expected memoText");
      // Arm field `.text` is XdrString (call `.toString()` to decode);
      // `.value` getter is the already-decoded string.
      expect(xdrMemo.text.toString()).toBe("test");
      expect(xdrMemo.value).toBe("test");

      const baseMemo = Memo.fromXdrObject(xdrMemo);
      expect(baseMemo.type).toBe(MemoText);
      // Memo wrapper surfaces the wire bytes as a Uint8Array.
      expect(uint8ArrayToString(baseMemo.value as Uint8Array)).toBe("test");
    });

    it("converts to/from xdr object (bytes)", () => {
      const buf = new Uint8Array([0xd1]);
      const text = uint8ArrayToString(buf);
      const memo = Memo.text(text);
      expect(memo.type).toBe(MemoText);
      expect(memo.value).toBe(text);

      const xdrMemo = memo.toXdrObject();
      expect(xdrMemo.type).toBe("memoText");
      if (xdrMemo.type !== "memoText") throw new Error("expected memoText");
      expect(xdrMemo.text.toString()).toBe(text);
      expect(xdrMemo.value).toBe(text);

      const baseMemo = Memo.fromXdrObject(xdrMemo);
      expect(baseMemo.type).toBe(MemoText);
      expect(uint8ArrayToString(baseMemo.value as Uint8Array)).toBe(text);
    });

    it("throws an error when invalid argument was passed", () => {
      // @ts-expect-error testing missing arg
      expect(() => Memo.text()).toThrow(
        /Expects string or Uint8Array, max 28 bytes/,
      );
      // @ts-expect-error testing invalid input
      expect(() => Memo.text({})).toThrow(
        /Expects string or Uint8Array, max 28 bytes/,
      );
      // @ts-expect-error testing invalid input
      expect(() => Memo.text(10)).toThrow(
        /Expects string or Uint8Array, max 28 bytes/,
      );
      // @ts-expect-error testing invalid input
      expect(() => Memo.text(Infinity)).toThrow(
        /Expects string or Uint8Array, max 28 bytes/,
      );
      // @ts-expect-error testing invalid input
      expect(() => Memo.text(NaN)).toThrow(
        /Expects string or Uint8Array, max 28 bytes/,
      );
    });

    // 16.2.0 and earlier accepted a plain array, encoding each element as one
    // byte. That input is documented as removed in 17.x (CHANGELOG, and
    // docs/UINT8ARRAY_MIGRATION.md § 3), so pin the rejection.
    it("rejects a plain array of bytes", () => {
      // @ts-expect-error testing input removed in 17.x
      expect(() => Memo.text([104, 105])).toThrow(
        /Expects string or Uint8Array, max 28 bytes/,
      );
    });

    it("throws an error when string is longer than 28 bytes", () => {
      expect(() => Memo.text("12345678901234567890123456789")).toThrow(
        /Expects string or Uint8Array, max 28 bytes/,
      );
      expect(() => Memo.text("三代之時三代之時三代之時")).toThrow(
        /Expects string or Uint8Array, max 28 bytes/,
      );
    });
  });

  describe(".id()", () => {
    it("returns a value for a correct argument", () => {
      expect(() => Memo.id("1000")).not.toThrow();
      expect(() => Memo.id("0")).not.toThrow();
    });

    it("converts to/from xdr object", () => {
      const memo = Memo.id("1000");
      expect(memo.type).toBe(MemoID);
      expect(memo.value).toBe("1000");

      const xdrMemo = memo.toXdrObject();
      expect(xdrMemo.type).toBe("memoId");
      if (xdrMemo.type !== "memoId") throw new Error("expected memoId");
      expect(xdrMemo.id.toString()).toBe("1000");

      const baseMemo = Memo.fromXdrObject(xdrMemo);
      expect(baseMemo.type).toBe(MemoID);
      expect(baseMemo.value).toBe("1000");
    });

    it("throws an error when invalid argument was passed", () => {
      // @ts-expect-error testing missing arg
      expect(() => Memo.id()).toThrow(/Expects a uint64/);
      // @ts-expect-error testing invalid input
      expect(() => Memo.id({})).toThrow(/Expects a uint64/);
      // @ts-expect-error testing invalid input
      expect(() => Memo.id(Infinity)).toThrow(/Expects a uint64/);
      // @ts-expect-error testing invalid input
      expect(() => Memo.id(NaN)).toThrow(/Expects a uint64/);
      expect(() => Memo.id("test")).toThrow(/Expects a uint64/);
    });

    it("throws an error for a negative value", () => {
      expect(() => Memo.id("-1")).toThrow(/Expects a uint64/);
    });

    it("throws an error for a decimal value", () => {
      expect(() => Memo.id("1.5")).toThrow(/Expects a uint64/);
    });

    it("throws an error when value exceeds uint64 max", () => {
      expect(() => Memo.id("18446744073709551616")).toThrow(/Expects a uint64/);
    });

    it("rejects scientific notation strings that BigInt cannot parse", () => {
      // "1e18" passes BigNumber validation but BigInt("1e18") throws.
      // Validation should reject it upfront instead of deferring the crash
      // to toXdrObject().
      expect(() => Memo.id("1e18")).toThrow(/Expects a uint64/);
    });

    it("rejects trailing-zero decimal strings that BigInt cannot parse", () => {
      // "1.0" passes BigNumber.isInteger() but BigInt("1.0") throws.
      expect(() => Memo.id("1.0")).toThrow(/Expects a uint64/);
    });

    it("scientific notation equivalent works when written as plain digits", () => {
      // The value itself is valid — it's the string format that's the problem.
      expect(() => Memo.id("1000000000000000000")).not.toThrow();
      const memo = Memo.id("1000000000000000000");
      const xdrMemo = memo.toXdrObject();
      if (xdrMemo.type !== "memoId") throw new Error("expected memoId");
      expect(xdrMemo.id.toString()).toBe("1000000000000000000");
    });
  });

  describe(".hash() & .return()", () => {
    it("hash converts to/from xdr object", () => {
      const buffer = new Uint8Array(32).fill(10);

      const memo = Memo.hash(buffer);
      expect(memo.type).toBe(MemoHash);
      expect(memo.value).toEqual(buffer);

      const xdrMemo = memo.toXdrObject();
      expect(xdrMemo.type).toBe("memoHash");
      if (xdrMemo.type !== "memoHash") throw new Error("expected memoHash");
      const hashBytes = xdrMemo.hash.toBytes();
      expect(hashBytes.length).toBe(32);
      expect(Array.from(hashBytes)).toEqual(Array.from(buffer));

      const baseMemo = Memo.fromXdrObject(xdrMemo);
      expect(baseMemo.type).toBe(MemoHash);
      expect((baseMemo.value as Uint8Array).length).toBe(32);
      expect(uint8ArrayToHex(baseMemo.value as Uint8Array)).toBe(
        uint8ArrayToHex(buffer),
      );
    });

    it("return converts to/from xdr object", () => {
      const buffer = new Uint8Array(32).fill(10);

      // Testing string hash
      const memo = Memo.return(uint8ArrayToHex(buffer));
      expect(memo.value).toEqual(buffer);
      expect(memo.type).toBe(MemoReturn);

      const xdrMemo = memo.toXdrObject();
      expect(xdrMemo.type).toBe("memoReturn");
      if (xdrMemo.type !== "memoReturn") throw new Error("expected memoReturn");
      const retHashBytes = xdrMemo.retHash.toBytes();
      expect(retHashBytes.length).toBe(32);
      expect(uint8ArrayToHex(new Uint8Array(retHashBytes))).toBe(
        uint8ArrayToHex(buffer),
      );

      const baseMemo = Memo.fromXdrObject(xdrMemo);
      expect(baseMemo.type).toBe(MemoReturn);
      expect(baseMemo.value).toBeInstanceOf(Uint8Array);
      expect((baseMemo.value as Uint8Array).length).toBe(32);
      expect(uint8ArrayToHex(baseMemo.value as Uint8Array)).toBe(
        uint8ArrayToHex(buffer),
      );
    });

    it("returns a value for a correct argument", () => {
      const methods = [Memo.hash, Memo.return] as const;
      for (const method of methods) {
        expect(() => method(uint8ArrayToHex(new Uint8Array(32)))).not.toThrow();
        expect(() =>
          method(
            "0000000000000000000000000000000000000000000000000000000000000000",
          ),
        ).not.toThrow();
      }
    });

    it("return accepts a Uint8Array directly", () => {
      const buffer = new Uint8Array(32).fill(10);
      const memo = Memo.return(buffer);
      expect(memo.type).toBe(MemoReturn);
      expect(memo.value).toEqual(buffer);
    });

    it("throws an error when invalid argument was passed", () => {
      const methods = [Memo.hash, Memo.return] as const;
      for (const method of methods) {
        // @ts-expect-error testing missing arg
        expect(() => method()).toThrow(/Expects a 32 byte hash value/);
        // @ts-expect-error testing invalid input
        expect(() => method({})).toThrow(/Expects a 32 byte hash value/);
        // @ts-expect-error testing invalid input
        expect(() => method(Infinity)).toThrow(/Expects a 32 byte hash value/);
        // @ts-expect-error testing invalid input
        expect(() => method(NaN)).toThrow(/Expects a 32 byte hash value/);
        expect(() => method("test")).toThrow(/Expects a 32 byte hash value/);
        // @ts-expect-error testing invalid input
        expect(() => method([0, 10, 20])).toThrow(
          /Expects a 32 byte hash value/,
        );
        expect(() => method(uint8ArrayToHex(new Uint8Array(33)))).toThrow(
          /Expects a 32 byte hash value/,
        );
        expect(() =>
          method(
            "00000000000000000000000000000000000000000000000000000000000000",
          ),
        ).toThrow(/Expects a 32 byte hash value/);
        expect(() =>
          method(
            "000000000000000000000000000000000000000000000000000000000000000000",
          ),
        ).toThrow(/Expects a 32 byte hash value/);
      }
    });
  });

  describe("immutability", () => {
    it("throws when setting type", () => {
      const memo = Memo.text("test");
      expect(() => {
        (memo as any).type = MemoNone;
      }).toThrow(/Memo is immutable/);
    });

    it("throws when setting value", () => {
      const memo = Memo.text("test");
      expect(() => {
        (memo as any).value = "other";
      }).toThrow(/Memo is immutable/);
    });
  });

  describe("value getter defensive copy", () => {
    it("returns a copy for MemoHash so mutations do not affect the original", () => {
      const buffer = new Uint8Array(32).fill(10);
      const memo = Memo.hash(buffer);

      const value = memo.value;
      value[0] = 0xff;

      expect(memo.value[0]).toBe(10);
    });

    it("returns a copy for MemoReturn so mutations do not affect the original", () => {
      const buffer = new Uint8Array(32).fill(20);
      const memo = Memo.return(buffer);

      const value = memo.value;
      value[0] = 0xff;

      expect(memo.value[0]).toBe(20);
    });
  });
});
