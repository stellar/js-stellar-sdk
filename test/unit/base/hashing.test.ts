import { describe, it, expect } from "vitest";
import { stringToUint8Array, uint8ArrayToHex } from "uint8array-extras";
import { hash } from "../../../src/base/hashing.js";

describe("hash", () => {
  const expectedHex =
    "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";

  it("hashes a string properly, using SHA256", () => {
    const actualHex = uint8ArrayToHex(hash("hello world"));
    expect(actualHex).toEqual(expectedHex);
  });

  it("hashes a byte array properly, using SHA256", () => {
    const msg = stringToUint8Array("hello world");
    const actualHex = uint8ArrayToHex(hash(msg));
    expect(actualHex).toEqual(expectedHex);
  });

  it("hashes an array of bytes properly, using SHA256", () => {
    const msg = new Uint8Array([
      104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
    ]);
    const actualHex = uint8ArrayToHex(hash(msg));
    expect(actualHex).toEqual(expectedHex);
  });

  it("produces the same result as Web Crypto", async () => {
    const input = "I really hope this works";
    const encoded = new TextEncoder().encode(input);
    const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded);
    const cryptoHash = new Uint8Array(digest);
    const newHash = hash(input);
    expect(uint8ArrayToHex(newHash)).toEqual(uint8ArrayToHex(cryptoHash));
  });
});
