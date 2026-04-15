import { describe, it, expect } from "vitest";
import { Asset } from "../../src/asset.js";
import { LiquidityPoolAsset } from "../../src/liquidity_pool_asset.js";
import { LiquidityPoolFeeV18 } from "../../src/get_liquidity_pool_id.js";
import { Keypair } from "../../src/keypair.js";
import xdr from "../../src/xdr.js";

const assetA = new Asset(
  "ARST",
  "GB7TAYRUZGE6TVT7NHP5SMIZRNQA6PLM423EYISAOAP3MKYIQMVYP2JO",
);
const assetB = new Asset(
  "USD",
  "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
);
const fee = LiquidityPoolFeeV18;

describe("LiquidityPoolAsset", () => {
  describe("constructor", () => {
    it("throws an error if assetA is invalid", () => {
      expect(() => new (LiquidityPoolAsset as any)()).toThrow(
        /assetA is invalid/,
      );

      expect(() => new (LiquidityPoolAsset as any)("random")).toThrow(
        /assetA is invalid/,
      );
    });

    it("throws an error if assetB is invalid", () => {
      expect(() => new (LiquidityPoolAsset as any)(assetA)).toThrow(
        /assetB is invalid/,
      );

      expect(
        () => new LiquidityPoolAsset(assetA, "random" as any, undefined as any),
      ).toThrow(/assetB is invalid/);
    });

    it("throws an error if assets are not ordered", () => {
      expect(() => new LiquidityPoolAsset(assetB, assetA, fee)).toThrow(
        /Assets are not in lexicographic order/,
      );
    });

    it("throws an error if fee is invalid", () => {
      expect(
        () => new LiquidityPoolAsset(assetA, assetB, undefined as any),
      ).toThrow(/fee is invalid/);
    });

    it("throws an error if fee is a non-zero invalid value", () => {
      expect(() => new LiquidityPoolAsset(assetA, assetB, 20 as any)).toThrow(
        /fee is invalid/,
      );
    });

    it("does not throw when using the correct attributes", () => {
      expect(() => new LiquidityPoolAsset(assetA, assetB, fee)).not.toThrow();
    });
  });

  describe("getLiquidityPoolParameters()", () => {
    it("returns liquidity pool parameters for a liquidity pool asset", () => {
      const asset = new LiquidityPoolAsset(assetA, assetB, fee);
      const gotPoolParams = asset.getLiquidityPoolParameters();
      expect(gotPoolParams.assetA).toBe(assetA);
      expect(gotPoolParams.assetB).toBe(assetB);
      expect(gotPoolParams.fee).toBe(fee);
    });
  });

  describe("getAssetType()", () => {
    it('returns "liquidity_pool_shares" if the trustline asset is a liquidity pool ID', () => {
      const asset = new LiquidityPoolAsset(assetA, assetB, fee);
      expect(asset.getAssetType()).toBe("liquidity_pool_shares");
    });
  });

  describe("toXDRObject()", () => {
    it("parses a liquidity pool trustline asset object", () => {
      const asset = new LiquidityPoolAsset(assetA, assetB, fee);
      const ctAsset = asset.toXDRObject();

      expect(ctAsset).toBeInstanceOf(xdr.ChangeTrustAsset);
      expect(ctAsset.switch()).toBe(xdr.AssetType.assetTypePoolShare());

      const gotPoolParams = asset.getLiquidityPoolParameters();
      expect(gotPoolParams.assetA).toBe(assetA);
      expect(gotPoolParams.assetB).toBe(assetB);
      expect(gotPoolParams.fee).toBe(fee);
    });
  });

  describe("fromOperation()", () => {
    it('throws an error if asset type is "assetTypeNative"', () => {
      const ctAsset = xdr.ChangeTrustAsset.assetTypeNative();
      expect(() => LiquidityPoolAsset.fromOperation(ctAsset)).toThrow(
        /Invalid asset type: assetTypeNative/,
      );
    });

    it('throws an error if asset type is "assetTypeCreditAlphanum4"', () => {
      const issuer = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
      const assetCode = "KHL";
      const assetXdr = new xdr.AlphaNum4({
        assetCode: assetCode + "\0",
        issuer: Keypair.fromPublicKey(issuer).xdrAccountId(),
      });
      const ctAsset = xdr.ChangeTrustAsset.assetTypeCreditAlphanum4(assetXdr);
      expect(() => LiquidityPoolAsset.fromOperation(ctAsset)).toThrow(
        /Invalid asset type: assetTypeCreditAlphanum4/,
      );
    });

    it('throws an error if asset type is "assetTypeCreditAlphanum12"', () => {
      const issuer = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
      const assetCode = "KHLTOKEN";
      const assetXdr = new xdr.AlphaNum12({
        assetCode: assetCode + "\0\0\0\0",
        issuer: Keypair.fromPublicKey(issuer).xdrAccountId(),
      });
      const ctAsset = xdr.ChangeTrustAsset.assetTypeCreditAlphanum12(assetXdr);
      expect(() => LiquidityPoolAsset.fromOperation(ctAsset)).toThrow(
        /Invalid asset type: assetTypeCreditAlphanum12/,
      );
    });

    it("parses a liquidityPool asset XDR", () => {
      const lpConstantProductParamsXdr =
        new xdr.LiquidityPoolConstantProductParameters({
          assetA: assetA.toXDRObject(),
          assetB: assetB.toXDRObject(),
          fee,
        });
      const lpParamsXdr =
        xdr.LiquidityPoolParameters.liquidityPoolConstantProduct(
          lpConstantProductParamsXdr,
        );
      const ctAsset = xdr.ChangeTrustAsset.assetTypePoolShare(lpParamsXdr);

      expect(ctAsset).toBeInstanceOf(xdr.ChangeTrustAsset);
      expect(ctAsset.switch()).toBe(xdr.AssetType.assetTypePoolShare());

      const asset = LiquidityPoolAsset.fromOperation(ctAsset);
      expect(asset).toBeInstanceOf(LiquidityPoolAsset);
      const gotPoolParams = asset.getLiquidityPoolParameters();
      expect(gotPoolParams.assetA).toEqual(assetA);
      expect(gotPoolParams.assetB).toEqual(assetB);
      expect(gotPoolParams.fee).toBe(fee);
      expect(asset.getAssetType()).toBe("liquidity_pool_shares");
    });
  });

  describe("equals()", () => {
    it("returns true when assetA and assetB are the same for both liquidity pools", () => {
      const lpAsset1 = new LiquidityPoolAsset(assetA, assetB, fee);
      const lpAsset2 = new LiquidityPoolAsset(assetA, assetB, fee);
      expect(lpAsset1.equals(lpAsset1)).toBe(true);
      expect(lpAsset1.equals(lpAsset2)).toBe(true);
      expect(lpAsset2.equals(lpAsset1)).toBe(true);
      expect(lpAsset1.equals(lpAsset2)).toBe(true);
    });

    it("returns false when assetA or assetB are different in the liquidity pools", () => {
      const lpAsset1 = new LiquidityPoolAsset(assetA, assetB, fee);

      const assetA2 = new Asset(
        "ARS2",
        "GB7TAYRUZGE6TVT7NHP5SMIZRNQA6PLM423EYISAOAP3MKYIQMVYP2JO",
      );
      const assetB2 = new Asset(
        "USD2",
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
      );

      let lpAsset2 = new LiquidityPoolAsset(assetA2, assetB, fee);
      expect(lpAsset1.equals(lpAsset2)).toBe(false);

      lpAsset2 = new LiquidityPoolAsset(assetA, assetB2, fee);
      expect(lpAsset1.equals(lpAsset2)).toBe(false);
    });
  });

  describe("toString()", () => {
    it("returns 'liquidity_pool:<pool_id>' for liquidity pool assets", () => {
      const asset = new LiquidityPoolAsset(assetA, assetB, fee);
      expect(asset.toString()).toBe(
        "liquidity_pool:dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7",
      );
    });
  });
});
