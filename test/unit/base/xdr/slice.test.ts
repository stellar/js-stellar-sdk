import { describe, it, expect } from "vitest";
import { Buffer } from "buffer";
import { uint8ArrayToBase64, stringToUint8Array } from "uint8array-extras";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import legacyTypes from "../../../fixtures/legacy-xdr/curr_generated.js";
const legacyXdr = legacyTypes as any;

import {
  AssetType,
  AssetCode4,
  AlphaNum4,
  AlphaNum12,
  Asset,
  AssetNative,
  AssetCreditAlphanum4,
  AssetCreditAlphanum12,
  PublicKey,
  PublicKeyEd25519,
  Int128,
} from "../../../../src/xdr/index.js";

const ISSUER_ED25519 = new Uint8Array(32);
for (let i = 0; i < 32; i += 1) ISSUER_ED25519[i] = i + 1;

function asciiCode(s: string, length: number): Uint8Array {
  const buf = new Uint8Array(length);
  buf.set(stringToUint8Array(s));
  return buf;
}

describe("AssetType (enum)", () => {
  it("singletons round-trip through fromXdr/toXdr", () => {
    const cases: AssetType[] = [
      AssetType.assetTypeNative,
      AssetType.assetTypeCreditAlphanum4,
      AssetType.assetTypeCreditAlphanum12,
      AssetType.assetTypePoolShare,
    ];
    for (const enumValue of cases) {
      const bytes = enumValue.toXdr();
      const decoded = AssetType.fromXdr(bytes);
      expect(decoded).toBe(enumValue);
      expect(decoded.name).toBe(enumValue.name);
      expect(decoded.value).toBe(enumValue.value);
    }
  });

  it("JSON round-trips through the SEP-0051 snake_case form", () => {
    const json = AssetType.assetTypeCreditAlphanum4.toJson();
    expect(json).toBe("credit_alphanum4");
    expect(AssetType.fromJson(json)).toBe(AssetType.assetTypeCreditAlphanum4);
  });

  it("rejects unknown enum values", () => {
    expect(() => AssetType.fromValue(99)).toThrow(/unknown enum value/);
  });
});

describe("AssetCode4 (canonical hex-encoded bytes)", () => {
  it("round-trips through XDR bytes", () => {
    const original = new AssetCode4(asciiCode("EUR", 4));
    const decoded = AssetCode4.fromXdr(original.toXdr());
    expect(decoded.value).toEqual(original.value);
  });

  it("JSON is the trimmed text form per SEP-0051", () => {
    const code = new AssetCode4(asciiCode("USD", 4));
    expect(code.toJson()).toBe("USD");
  });
});

describe("PublicKey (single-arm union, with dx ed25519 alias)", () => {
  it("round-trips through XDR", () => {
    const pk = PublicKey.publicKeyTypeEd25519(ISSUER_ED25519);
    const bytes = pk.toXdr();
    expect(bytes.length).toBe(36);
    const decoded = PublicKey.fromXdr(bytes);
    expect(decoded.type).toBe("publicKeyTypeEd25519");
    expect(decoded.value).toEqual(ISSUER_ED25519);
    // DX getter from dx/public-key.ts:
    expect(decoded.ed25519).toEqual(ISSUER_ED25519);
    expect(decoded).toBeInstanceOf(PublicKeyEd25519);
  });
});

describe("AlphaNum4 (struct)", () => {
  it("round-trips through XDR", () => {
    const original = new AlphaNum4({
      assetCode: asciiCode("USD", 4),
      issuer: PublicKey.publicKeyTypeEd25519(ISSUER_ED25519),
    });
    const decoded = AlphaNum4.fromXdr(original.toXdr());
    expect(decoded.assetCode.value).toEqual(asciiCode("USD", 4));
    expect(decoded.issuer.ed25519).toEqual(ISSUER_ED25519);
  });
});

describe("Asset (union with void + payload arms)", () => {
  const native = Asset.assetTypeNative();
  const usd = Asset.assetTypeCreditAlphanum4(
    new AlphaNum4({
      assetCode: asciiCode("USD", 4),
      issuer: PublicKey.publicKeyTypeEd25519(ISSUER_ED25519),
    }),
  );
  const tether = Asset.assetTypeCreditAlphanum12(
    new AlphaNum12({
      assetCode: asciiCode("USDTether", 12),
      issuer: PublicKey.publicKeyTypeEd25519(ISSUER_ED25519),
    }),
  );

  it("native round-trips through XDR (4 bytes, discriminator only)", () => {
    const bytes = native.toXdr();
    expect(bytes.length).toBe(4);
    const decoded = Asset.fromXdr(bytes);
    expect(decoded).toBeInstanceOf(AssetNative);
    expect(decoded.type).toBe("assetTypeNative");
  });

  it("credit_alphanum4 round-trips through XDR", () => {
    const decoded = Asset.fromXdr(usd.toXdr());
    expect(decoded).toBeInstanceOf(AssetCreditAlphanum4);
    if (decoded.type === "assetTypeCreditAlphanum4") {
      expect(decoded.value.assetCode.value).toEqual(asciiCode("USD", 4));
      expect(decoded.value.issuer.ed25519).toEqual(ISSUER_ED25519);
    }
  });

  it("credit_alphanum12 round-trips through XDR", () => {
    const decoded = Asset.fromXdr(tether.toXdr());
    expect(decoded).toBeInstanceOf(AssetCreditAlphanum12);
    if (decoded.type === "assetTypeCreditAlphanum12") {
      expect(decoded.value.assetCode.value).toEqual(asciiCode("USDTether", 12));
    }
  });

  it("`switch (asset.type)` narrows without casts", () => {
    function describeAsset(a: Asset): string {
      switch (a.type) {
        case "assetTypeNative":
          return "native";
        case "assetTypeCreditAlphanum4":
          return `alphanum4:${a.value.assetCode.toJson()}`;
        case "assetTypeCreditAlphanum12":
          return `alphanum12:${a.value.assetCode.toJson()}`;
      }
    }
    expect(describeAsset(native)).toBe("native");
    expect(describeAsset(usd)).toContain("alphanum4:");
    expect(describeAsset(tether)).toContain("alphanum12:");
  });

  it("produces byte-compatible XDR with legacy @stellar/js-xdr", () => {
    const legacyDecoded = legacyXdr.Asset.fromXDR(Buffer.from(usd.toXdr()));
    expect(legacyDecoded.switch().name).toBe("assetTypeCreditAlphanum4");
    const reencoded = new Uint8Array(legacyDecoded.toXDR());
    expect(uint8ArrayToBase64(reencoded)).toBe(uint8ArrayToBase64(usd.toXdr()));
  });
});

describe("Int128 (DX wrapper of Int128Parts struct)", () => {
  it("zero round-trips", () => {
    const z = new Int128(0n);
    expect(z.toXdr().length).toBe(16);
    expect(Int128.fromXdr(z.toXdr()).value).toBe(0n);
  });

  it("positive value round-trips", () => {
    const v = new Int128(123456789012345678901234567890n);
    expect(Int128.fromXdr(v.toXdr()).value).toBe(v.value);
  });

  it("negative value round-trips (two's complement)", () => {
    const v = new Int128(-(1n << 100n));
    expect(Int128.fromXdr(v.toXdr()).value).toBe(v.value);
  });

  it("rejects out-of-range values", () => {
    expect(() => new Int128(1n << 127n)).toThrow(/out of range/);
    expect(() => new Int128(-(1n << 127n) - 1n)).toThrow(/out of range/);
  });

  it("toParts exposes hi/lo wire shape", () => {
    const v = new Int128((1n << 64n) + 7n);
    const parts = v.toParts();
    expect(parts.hi).toBe(1n);
    expect(parts.lo).toBe(7n);
  });

  it("JSON round-trips as decimal string", () => {
    const v = new Int128(-12345n);
    const json = v.toJson();
    expect(json).toBe("-12345");
    expect(Int128.fromJson(json).value).toBe(-12345n);
  });
});
