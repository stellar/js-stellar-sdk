// NOTE: key and signature constants were generated using rbnacl
import { describe, it, expect } from "vitest";
import { generate, sign, verify } from "../../src/signing.js";

const seed = Buffer.from(
  "1123740522f11bfef6b3671f51e159ccf589ccf8965262dd5f97d1721d383dd4",
  "hex",
);
const publicKey = Buffer.from(
  "ffbdd7ef9933fe7249dc5ca1e7120b6d7b7b99a7a367e1a2fc6cb062fe420437",
  "hex",
);
const secretKey = seed;

describe("generate", () => {
  it("generates the correct public key from a known seed", () => {
    const generatedKey = generate(seed);
    expect(generatedKey.toString("hex")).toEqual(publicKey.toString("hex"));
  });

  it("returns a Buffer", () => {
    const generatedKey = generate(seed);
    expect(Buffer.isBuffer(generatedKey)).toBe(true);
  });
});

describe("sign", () => {
  const expectedSig =
    "587d4b472eeef7d07aafcd0b049640b0bb3f39784118c2e2b73a04fa2f64c9c538b4b2d0f5335e968a480021fdc23e98c0ddf424cb15d8131df8cb6c4bb58309";

  it("signs data correctly", () => {
    const data = Buffer.from("hello world", "utf8");
    const actualSig = sign(data, secretKey).toString("hex");
    expect(actualSig).toEqual(expectedSig);
  });

  it("can sign an array of bytes properly", () => {
    const data = Buffer.from([
      104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
    ]);
    const actualSig = sign(data, secretKey).toString("hex");
    expect(actualSig).toEqual(expectedSig);
  });
});

describe("verify", () => {
  const sig = Buffer.from(
    "587d4b472eeef7d07aafcd0b049640b0bb3f39784118c2e2b73a04fa2f64c9c538b4b2d0f5335e968a480021fdc23e98c0ddf424cb15d8131df8cb6c4bb58309",
    "hex",
  );
  const badSig = Buffer.from(
    "687d4b472eeef7d07aafcd0b049640b0bb3f39784118c2e2b73a04fa2f64c9c538b4b2d0f5335e968a480021fdc23e98c0ddf424cb15d8131df8cb6c4bb58309",
    "hex",
  );

  it("verifies data correctly", () => {
    const data = Buffer.from("hello world", "utf8");
    expect(verify(data, sig, publicKey)).toBeTruthy();
    expect(
      verify(Buffer.from("corrupted", "utf8"), sig, publicKey),
    ).toBeFalsy();
    expect(verify(data, badSig, publicKey)).toBeFalsy();
  });

  it("can verify an array of bytes properly", () => {
    const data = Buffer.from([
      104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
    ]);
    expect(verify(data, sig, publicKey)).toBeTruthy();
    expect(
      verify(Buffer.from("corrupted", "utf8"), sig, publicKey),
    ).toBeFalsy();
    expect(verify(data, badSig, publicKey)).toBeFalsy();
  });
});

describe("round-trip: generate -> sign -> verify", () => {
  it("generates a key, signs data, and verifies the signature", () => {
    const pk = generate(secretKey);
    const data = Buffer.from("round trip test", "utf8");
    const signature = sign(data, secretKey);

    expect(verify(data, signature, pk)).toBe(true);
    expect(verify(Buffer.from("tampered", "utf8"), signature, pk)).toBe(false);
  });
});
