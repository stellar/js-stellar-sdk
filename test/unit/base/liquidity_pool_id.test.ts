import { describe, expect, it } from "vitest";
import {
  hexToUint8Array,
  stringToUint8Array,
  uint8ArrayToHex,
} from "uint8array-extras";
import { LiquidityPoolId } from "../../../src/base/liquidity_pool_id.js";
import { StrKey } from "../../../src/base/strkey.js";
import * as xdr from "../../../src/xdr/index.js";

const POOL_ID =
  "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7";
const ISSUER = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";

describe("LiquidityPoolId", () => {
  describe("constructor", () => {
    it("throws an error when no parameter is provided", () => {
      // @ts-expect-error testing missing argument
      expect(() => new LiquidityPoolId()).toThrow(
        /liquidityPoolId cannot be empty/,
      );
    });

    it.each([
      ["fewer than 64 characters", POOL_ID.slice(1)],
      ["more than 64 characters", `${POOL_ID}a`],
      ["a prefix", `prefix-${POOL_ID}`],
      ["a suffix", `${POOL_ID}-suffix`],
      ["non-hexadecimal characters", `${POOL_ID.slice(0, -1)}g`],
    ])("throws an error when pool ID has %s", (_description, invalidId) => {
      expect(() => new LiquidityPoolId(invalidId)).toThrow(
        /Liquidity pool ID is not a valid hash/,
      );
    });

    it("accepts valid lowercase and mixed-case hashes", () => {
      expect(() => new LiquidityPoolId(POOL_ID)).not.toThrow();
      expect(
        () => new LiquidityPoolId(`DD7B1AB8${POOL_ID.slice(8)}`),
      ).not.toThrow();
    });
  });

  describe("getLiquidityPoolId()", () => {
    it("returns liquidity pool ID of liquidity pool asset", () => {
      const asset = new LiquidityPoolId(POOL_ID);
      expect(asset.getLiquidityPoolId()).toBe(POOL_ID);
    });
  });

  describe("getAssetType()", () => {
    it('returns "liquidity_pool_shares" if the trustline asset is a liquidity pool ID', () => {
      const asset = new LiquidityPoolId(POOL_ID);
      expect(asset.getAssetType()).toBe("liquidity_pool_shares");
    });
  });

  describe("toXdrObject()", () => {
    it("parses a liquidity pool trustline asset object", () => {
      const asset = new LiquidityPoolId(POOL_ID);
      const tlAsset = asset.toXdrObject();

      expect(tlAsset).toBeInstanceOf(xdr.TrustLineAsset);
      expect(tlAsset.type).toBe("assetTypePoolShare");
      if (tlAsset.type !== "assetTypePoolShare") {
        throw new Error("expected assetTypePoolShare");
      }
      expect(
        uint8ArrayToHex(new Uint8Array(tlAsset.liquidityPoolId.toBytes())),
      ).toBe(POOL_ID);
      expect(
        uint8ArrayToHex(new Uint8Array(tlAsset.liquidityPoolId.toBytes())),
      ).toBe(asset.getLiquidityPoolId());
    });
  });

  describe("fromOperation()", () => {
    it('throws an error if asset type is "assetTypeNative"', () => {
      const tlAsset = xdr.TrustLineAsset.assetTypeNative();
      expect(() => LiquidityPoolId.fromOperation(tlAsset)).toThrow(
        /Invalid asset type: assetTypeNative/,
      );
    });

    it('throws an error if asset type is "assetTypeCreditAlphanum4"', () => {
      const issuerKey = xdr.PublicKey.publicKeyTypeEd25519(
        StrKey.decodeEd25519PublicKey(ISSUER),
      );
      const assetXdr = new xdr.AlphaNum4({
        assetCode: stringToUint8Array("KHL\0"),
        issuer: issuerKey,
      });
      const tlAsset = xdr.TrustLineAsset.assetTypeCreditAlphanum4(assetXdr);
      expect(() => LiquidityPoolId.fromOperation(tlAsset)).toThrow(
        /Invalid asset type: assetTypeCreditAlphanum4/,
      );
    });

    it('throws an error if asset type is "assetTypeCreditAlphanum12"', () => {
      const issuerKey = xdr.PublicKey.publicKeyTypeEd25519(
        StrKey.decodeEd25519PublicKey(ISSUER),
      );
      const assetXdr = new xdr.AlphaNum12({
        assetCode: stringToUint8Array("KHLTOKEN\0\0\0\0"),
        issuer: issuerKey,
      });
      const tlAsset = xdr.TrustLineAsset.assetTypeCreditAlphanum12(assetXdr);
      expect(() => LiquidityPoolId.fromOperation(tlAsset)).toThrow(
        /Invalid asset type: assetTypeCreditAlphanum12/,
      );
    });

    it("parses a liquidityPoolId asset XDR", () => {
      const xdrPoolId = new xdr.PoolId(hexToUint8Array(POOL_ID));
      const tlAsset = xdr.TrustLineAsset.assetTypePoolShare(xdrPoolId);

      const asset = LiquidityPoolId.fromOperation(tlAsset);
      expect(asset).toBeInstanceOf(LiquidityPoolId);
      expect(asset.getLiquidityPoolId()).toBe(POOL_ID);
      expect(asset.getAssetType()).toBe("liquidity_pool_shares");
    });
  });

  describe("toString()", () => {
    it("returns 'liquidity_pool:<id>' for liquidity pool assets", () => {
      const asset = new LiquidityPoolId(POOL_ID);
      expect(asset.toString()).toBe(`liquidity_pool:${POOL_ID}`);
    });
  });

  describe("equals()", () => {
    it("returns true when pool IDs are the same", () => {
      const a = new LiquidityPoolId(POOL_ID);
      const b = new LiquidityPoolId(POOL_ID);
      expect(a.equals(b)).toBe(true);
    });

    it("returns false when pool IDs differ", () => {
      const a = new LiquidityPoolId(POOL_ID);
      const b = new LiquidityPoolId(
        "aa7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7",
      );
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("toXdrObject() / fromOperation() round-trip", () => {
    it("round-trips correctly", () => {
      const original = new LiquidityPoolId(POOL_ID);
      const restored = LiquidityPoolId.fromOperation(original.toXdrObject());
      expect(original.equals(restored)).toBe(true);
    });
  });
});
