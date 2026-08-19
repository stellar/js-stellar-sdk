import { describe, it, expect } from "vitest";
import {
  base64ToUint8Array as referenceDecode,
  uint8ArrayToBase64 as referenceEncode,
} from "uint8array-extras";
import {
  base64ToUint8Array,
  uint8ArrayToBase64,
} from "../../../../src/base/util/base64.js";

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

describe("uint8ArrayToBase64", () => {
  it("matches uint8array-extras for a spread of lengths", () => {
    for (const length of [0, 1, 2, 3, 4, 31, 32, 33, 288, 4096, 70000]) {
      const bytes = randomBytes(length);
      expect(uint8ArrayToBase64(bytes)).toBe(referenceEncode(bytes));
    }
  });

  it("encodes all byte values", () => {
    const bytes = new Uint8Array(256).map((_, i) => i);
    expect(uint8ArrayToBase64(bytes)).toBe(referenceEncode(bytes));
  });

  it("throws TypeError on non-Uint8Array input", () => {
    const inputs = [
      null,
      undefined,
      "AQID",
      [1, 2, 3],
      new Uint8Array([1, 2, 3]).buffer,
      new DataView(new Uint8Array([1, 2, 3]).buffer),
    ];
    for (const input of inputs) {
      expect(() => uint8ArrayToBase64(input as never)).toThrow(TypeError);
    }
  });

  it("accepts Uint8Array subclasses like Buffer", () => {
    class Sub extends Uint8Array {}
    expect(uint8ArrayToBase64(new Sub([1, 2, 3]))).toBe("AQID");
  });

  it("respects the view's offset and length", () => {
    const backing = new Uint8Array([9, 9, 1, 2, 3, 9, 9]);
    const view = backing.subarray(2, 5);
    expect(uint8ArrayToBase64(view)).toBe(
      referenceEncode(new Uint8Array([1, 2, 3])),
    );
  });
});

describe("base64ToUint8Array", () => {
  it("round-trips with uint8ArrayToBase64", () => {
    for (const length of [0, 1, 2, 3, 288, 4096, 70000]) {
      const bytes = randomBytes(length);
      expect(base64ToUint8Array(uint8ArrayToBase64(bytes))).toEqual(bytes);
    }
  });

  it("matches uint8array-extras on padded and unpadded input", () => {
    for (const input of ["", "AA==", "AAA=", "AAAA", "AA", "AAA", "TWFu"]) {
      expect(base64ToUint8Array(input)).toEqual(referenceDecode(input));
    }
  });

  it("returns a plain standalone Uint8Array", () => {
    const bytes = base64ToUint8Array("AQID");
    expect(bytes.constructor).toBe(Uint8Array);
    expect(bytes.byteOffset).toBe(0);
    expect(bytes.buffer.byteLength).toBe(bytes.byteLength);
  });

  it("accepts base64url input like the uint8array-extras decoder does", () => {
    for (const input of ["q83v_-7dvA", "-_-_", "PDw_Pz8-Pg"]) {
      expect(base64ToUint8Array(input)).toEqual(referenceDecode(input));
    }
  });

  it("throws TypeError on non-string input", () => {
    for (const input of [null, undefined, 42, new Uint8Array(3)]) {
      expect(() => base64ToUint8Array(input as never)).toThrow(TypeError);
    }
  });

  it("throws on invalid input like the uint8array-extras decoder does", () => {
    for (const input of ["not base64!!", "AAAA=", "A", "å∫ç", "AB=A"]) {
      expect(() => base64ToUint8Array(input), input).toThrow();
    }
  });

  // The two cases below pin deliberate divergences from the Buffer-era and
  // uint8array-extras decoders, which both re-padded short input and (Buffer
  // only) silently skipped invalid characters.
  it("rejects short-padded input that Buffer and uint8array-extras accepted", () => {
    for (const input of ["QQ=", "AA=", "AAAAQQ="]) {
      expect(() => base64ToUint8Array(input), input).toThrow();
    }
  });

  it("rejects invalid characters that Buffer silently skipped", () => {
    for (const input of ["QQ$$", "AQ*ID"]) {
      expect(() => base64ToUint8Array(input), input).toThrow();
    }
  });

  it("ignores ASCII whitespace like the Buffer-era decoder did", () => {
    expect(base64ToUint8Array("AA A A")).toEqual(new Uint8Array([0, 0, 0]));
    expect(base64ToUint8Array("\nQQ==\n")).toEqual(new Uint8Array([0x41]));
    expect(base64ToUint8Array(" AQ\tID ")).toEqual(new Uint8Array([1, 2, 3]));
  });
});
