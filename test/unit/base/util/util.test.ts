import { describe, it, expect } from "vitest";
import { trimEnd } from "../../../src/util/util.js";

describe("trimEnd", () => {
  describe("with string input", () => {
    it("removes trailing occurrences of the given character", () => {
      expect(trimEnd("hello***", "*")).toBe("hello");
    });

    it("removes trailing null characters (real-world usage)", () => {
      expect(trimEnd("USD\0\0\0\0", "\0")).toBe("USD");
      expect(trimEnd("MOBI\0\0\0\0\0\0\0\0", "\0")).toBe("MOBI");
    });

    it("returns the string unchanged when it does not end with the character", () => {
      expect(trimEnd("hello", "*")).toBe("hello");
    });

    it("removes all characters when string is entirely the trim character", () => {
      expect(trimEnd("***", "*")).toBe("");
    });

    it("returns empty string unchanged", () => {
      expect(trimEnd("", "*")).toBe("");
    });

    it("only removes from the end, not the beginning or middle", () => {
      expect(trimEnd("\0USD\0\0", "\0")).toBe("\0USD");
    });

    it("removes a single trailing occurrence", () => {
      expect(trimEnd("test*", "*")).toBe("test");
    });
  });

  describe("with number input", () => {
    it("trims trailing character and returns a number", () => {
      expect(trimEnd(1000, "0")).toBe(1);
    });

    it("returns the number unchanged when it does not end with the character", () => {
      expect(trimEnd(123, "0")).toBe(123);
    });

    it("trims multiple trailing characters from a number", () => {
      expect(trimEnd(54300, "0")).toBe(543);
    });

    it("returns a number type, not a string", () => {
      const result = trimEnd(1000, "0");
      expect(typeof result).toBe("number");
    });
  });

  describe("return type matches input type", () => {
    it("returns a string when given a string", () => {
      const result = trimEnd("hello", "o");
      expect(typeof result).toBe("string");
    });

    it("returns a number when given a number", () => {
      const result = trimEnd(100, "0");
      expect(typeof result).toBe("number");
    });
  });
});
