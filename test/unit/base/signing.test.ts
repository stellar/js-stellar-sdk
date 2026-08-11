// NOTE: key and signature constants were generated using rbnacl
import { describe, it, expect } from "vitest";
import {
  hexToUint8Array,
  stringToUint8Array,
  uint8ArrayToHex,
} from "uint8array-extras";
import { generate, sign, verify } from "../../../src/base/signing.js";

const seed = hexToUint8Array(
  "1123740522f11bfef6b3671f51e159ccf589ccf8965262dd5f97d1721d383dd4",
);
const publicKey = hexToUint8Array(
  "ffbdd7ef9933fe7249dc5ca1e7120b6d7b7b99a7a367e1a2fc6cb062fe420437",
);
const secretKey = seed;

describe("generate", () => {
  it("generates the correct public key from a known seed", () => {
    const generatedKey = generate(seed);
    expect(uint8ArrayToHex(generatedKey)).toEqual(uint8ArrayToHex(publicKey));
  });

  it("returns a Uint8Array", () => {
    const generatedKey = generate(seed);
    expect(generatedKey).toBeInstanceOf(Uint8Array);
  });
});

describe("sign", () => {
  const expectedSig =
    "587d4b472eeef7d07aafcd0b049640b0bb3f39784118c2e2b73a04fa2f64c9c538b4b2d0f5335e968a480021fdc23e98c0ddf424cb15d8131df8cb6c4bb58309";

  it("signs data correctly", () => {
    const data = stringToUint8Array("hello world");
    const actualSig = uint8ArrayToHex(sign(data, secretKey));
    expect(actualSig).toEqual(expectedSig);
  });

  it("can sign an array of bytes properly", () => {
    const data = new Uint8Array([
      104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
    ]);
    const actualSig = uint8ArrayToHex(sign(data, secretKey));
    expect(actualSig).toEqual(expectedSig);
  });
});

describe("verify", () => {
  const sig = hexToUint8Array(
    "587d4b472eeef7d07aafcd0b049640b0bb3f39784118c2e2b73a04fa2f64c9c538b4b2d0f5335e968a480021fdc23e98c0ddf424cb15d8131df8cb6c4bb58309",
  );
  const badSig = hexToUint8Array(
    "687d4b472eeef7d07aafcd0b049640b0bb3f39784118c2e2b73a04fa2f64c9c538b4b2d0f5335e968a480021fdc23e98c0ddf424cb15d8131df8cb6c4bb58309",
  );

  it("verifies data correctly", () => {
    const data = stringToUint8Array("hello world");
    expect(verify(data, sig, publicKey)).toBeTruthy();
    expect(verify(stringToUint8Array("corrupted"), sig, publicKey)).toBeFalsy();
    expect(verify(data, badSig, publicKey)).toBeFalsy();
  });

  it("can verify an array of bytes properly", () => {
    const data = new Uint8Array([
      104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
    ]);
    expect(verify(data, sig, publicKey)).toBeTruthy();
    expect(verify(stringToUint8Array("corrupted"), sig, publicKey)).toBeFalsy();
    expect(verify(data, badSig, publicKey)).toBeFalsy();
  });
});

describe("round-trip: generate -> sign -> verify", () => {
  it("generates a key, signs data, and verifies the signature", () => {
    const pk = generate(secretKey);
    const data = stringToUint8Array("round trip test");
    const signature = sign(data, secretKey);

    expect(verify(data, signature, pk)).toBe(true);
    expect(verify(stringToUint8Array("tampered"), signature, pk)).toBe(false);
  });
});
