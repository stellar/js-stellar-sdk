import { describe, expect, it } from "vitest";
import { LiquidityPoolId } from "../../src/liquidity_pool_id.js";
import { StrKey } from "../../src/strkey.js";
import xdr from "../../src/xdr.js";

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

    it("throws an error when pool ID is not a valid hash", () => {
      expect(() => new LiquidityPoolId("abc")).toThrow(
        /Liquidity pool ID is not a valid hash/,
      );
    });

    it("throws an error when pool ID is not all lowercase", () => {
      expect(
        () =>
          new LiquidityPoolId(
            "DD7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7",
          ),
      ).toThrow(/Liquidity pool ID is not a valid hash/);
    });

    it("does not throw an error when pool ID is a valid hash", () => {
      expect(() => new LiquidityPoolId(POOL_ID)).not.toThrow();
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

  describe("toXDRObject()", () => {
    it("parses a liquidity pool trustline asset object", () => {
      const asset = new LiquidityPoolId(POOL_ID);
      const tlAsset = asset.toXDRObject();

      expect(tlAsset).toBeInstanceOf(xdr.TrustLineAsset);
      // TODO: check generated XDR types to make sure they are up to date.
      // arm() exists at runtime on XDR union types but is not declared in types/curr.d.ts.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      expect((tlAsset as any).arm()).toBe("liquidityPoolId");
      expect(
        (tlAsset.liquidityPoolId() as unknown as Buffer).toString("hex"),
      ).toBe(POOL_ID);
      expect(
        (tlAsset.liquidityPoolId() as unknown as Buffer).toString("hex"),
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
        assetCode: Buffer.from("KHL\0"),
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
        assetCode: Buffer.from("KHLTOKEN\0\0\0\0"),
        issuer: issuerKey,
      });
      const tlAsset = xdr.TrustLineAsset.assetTypeCreditAlphanum12(assetXdr);
      expect(() => LiquidityPoolId.fromOperation(tlAsset)).toThrow(
        /Invalid asset type: assetTypeCreditAlphanum12/,
      );
    });

    it("parses a liquidityPoolId asset XDR", () => {
      const xdrPoolId = Buffer.from(POOL_ID, "hex") as unknown as xdr.PoolId;
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

  describe("toXDRObject() / fromOperation() round-trip", () => {
    it("round-trips correctly", () => {
      const original = new LiquidityPoolId(POOL_ID);
      const restored = LiquidityPoolId.fromOperation(original.toXDRObject());
      expect(original.equals(restored)).toBe(true);
    });
  });
});