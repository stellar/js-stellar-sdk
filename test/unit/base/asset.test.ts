import { describe, it, expect } from "vitest";
import { Asset } from "../../src/asset.js";
import { Keypair } from "../../src/keypair.js";
import { Networks } from "../../src/network.js";
import { expectDefined } from "../support/expect_defined.js";
import xdr from "../../src/xdr.js";

const ISSUER = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
const ISSUER_B = "GB7TAYRUZGE6TVT7NHP5SMIZRNQA6PLM423EYISAOAP3MKYIQMVYP2JO";

describe("Asset", () => {
  describe("constructor", () => {
    it("throws an error when there's no issuer for non XLM type asset", () => {
      expect(() => new Asset("USD")).toThrow(/Issuer cannot be null/);
    });

    it("throws an error when code is invalid", () => {
      expect(() => new Asset("", ISSUER)).toThrow(/Asset code is invalid/);
      expect(() => new Asset("1234567890123", ISSUER)).toThrow(
        /Asset code is invalid/,
      );
      expect(() => new Asset("ab_", ISSUER)).toThrow(/Asset code is invalid/);
    });

    it("throws an error when issuer is invalid", () => {
      expect(() => new Asset("USD", "GCEZWKCA5")).toThrow(/Issuer is invalid/);
    });
  });

  describe("getCode()", () => {
    it("returns a code for a native asset object", () => {
      const asset = Asset.native();
      expect(asset.getCode()).toBe("XLM");
    });

    it("returns a code for a non-native asset", () => {
      const asset = new Asset("USD", ISSUER);
      expect(asset.getCode()).toBe("USD");
    });
  });

  describe("getIssuer()", () => {
    it("returns undefined for a native asset object", () => {
      const asset = Asset.native();
      expect(asset.getIssuer()).toBeUndefined();
    });

    it("returns the issuer for a non-native asset", () => {
      const asset = new Asset("USD", ISSUER);
      expect(asset.getIssuer()).toBe(ISSUER);
    });
  });

  describe("getAssetType()", () => {
    it("returns native for native assets", () => {
      const asset = Asset.native();
      expect(asset.getAssetType()).toBe("native");
    });

    it("returns credit_alphanum4 if the asset code length is between 1 and 4", () => {
      const asset = new Asset("ABCD", ISSUER);
      expect(asset.getAssetType()).toBe("credit_alphanum4");
    });

    it("returns credit_alphanum12 if the asset code length is between 5 and 12", () => {
      const asset = new Asset("ABCDEF", ISSUER);
      expect(asset.getAssetType()).toBe("credit_alphanum12");
    });
  });

  describe("toXDRObject(), toChangeTrustXDRObject(), toTrustLineXDRObject()", () => {
    it("parses a native asset object", () => {
      const asset = Asset.native();
      const nativeXdr = Buffer.from([0, 0, 0, 0]).toString();

      let assetXdr = asset.toXDRObject();
      expect(assetXdr).toBeInstanceOf(xdr.Asset);
      expect(assetXdr.toXDR().toString()).toBe(nativeXdr);

      let changeTrustXdr = asset.toChangeTrustXDRObject();
      expect(changeTrustXdr).toBeInstanceOf(xdr.ChangeTrustAsset);
      expect(changeTrustXdr.toXDR().toString()).toBe(nativeXdr);

      let trustLineXdr = asset.toTrustLineXDRObject();
      expect(trustLineXdr).toBeInstanceOf(xdr.TrustLineAsset);
      expect(trustLineXdr.toXDR().toString()).toBe(nativeXdr);
    });

    it("parses a 3-alphanum asset object", () => {
      const asset = new Asset("USD", ISSUER);

      let assetXdr = asset.toXDRObject();
      expect(assetXdr).toBeInstanceOf(xdr.Asset);
      expect(() => assetXdr.toXDR("hex")).not.toThrow();
      expect(assetXdr.switch().name).toBe("assetTypeCreditAlphanum4");
      expect(assetXdr.alphaNum4().assetCode()).toBe("USD\0");

      let changeTrustXdr = asset.toChangeTrustXDRObject();
      expect(changeTrustXdr).toBeInstanceOf(xdr.ChangeTrustAsset);
      expect(() => changeTrustXdr.toXDR("hex")).not.toThrow();
      expect(changeTrustXdr.switch().name).toBe("assetTypeCreditAlphanum4");
      expect(changeTrustXdr.alphaNum4().assetCode()).toBe("USD\0");

      let trustLineXdr = asset.toTrustLineXDRObject();
      expect(trustLineXdr).toBeInstanceOf(xdr.TrustLineAsset);
      expect(() => trustLineXdr.toXDR("hex")).not.toThrow();
      expect(trustLineXdr.switch().name).toBe("assetTypeCreditAlphanum4");
      expect(trustLineXdr.alphaNum4().assetCode()).toBe("USD\0");
    });

    it("parses a 4-alphanum asset object", () => {
      const asset = new Asset("BART", ISSUER);

      let assetXdr = asset.toXDRObject();
      expect(assetXdr).toBeInstanceOf(xdr.Asset);
      expect(() => assetXdr.toXDR("hex")).not.toThrow();
      expect(assetXdr.switch().name).toBe("assetTypeCreditAlphanum4");
      expect(assetXdr.alphaNum4().assetCode()).toBe("BART");

      let changeTrustXdr = asset.toChangeTrustXDRObject();
      expect(changeTrustXdr).toBeInstanceOf(xdr.ChangeTrustAsset);
      expect(() => changeTrustXdr.toXDR("hex")).not.toThrow();
      expect(changeTrustXdr.switch().name).toBe("assetTypeCreditAlphanum4");
      expect(changeTrustXdr.alphaNum4().assetCode()).toBe("BART");

      let trustLineXdr = asset.toTrustLineXDRObject();
      expect(trustLineXdr).toBeInstanceOf(xdr.TrustLineAsset);
      expect(() => trustLineXdr.toXDR("hex")).not.toThrow();
      expect(trustLineXdr.switch().name).toBe("assetTypeCreditAlphanum4");
      expect(trustLineXdr.alphaNum4().assetCode()).toBe("BART");
    });

    it("parses a 5-alphanum asset object", () => {
      const asset = new Asset("12345", ISSUER);

      let assetXdr = asset.toXDRObject();
      expect(assetXdr).toBeInstanceOf(xdr.Asset);
      expect(() => assetXdr.toXDR("hex")).not.toThrow();
      expect(assetXdr.switch().name).toBe("assetTypeCreditAlphanum12");
      expect(assetXdr.alphaNum12().assetCode()).toBe("12345\0\0\0\0\0\0\0");

      let changeTrustXdr = asset.toChangeTrustXDRObject();
      expect(changeTrustXdr).toBeInstanceOf(xdr.ChangeTrustAsset);
      expect(() => changeTrustXdr.toXDR("hex")).not.toThrow();
      expect(changeTrustXdr.switch().name).toBe("assetTypeCreditAlphanum12");
      expect(changeTrustXdr.alphaNum12().assetCode()).toBe(
        "12345\0\0\0\0\0\0\0",
      );

      let trustLineXdr = asset.toTrustLineXDRObject();
      expect(trustLineXdr).toBeInstanceOf(xdr.TrustLineAsset);
      expect(() => trustLineXdr.toXDR("hex")).not.toThrow();
      expect(trustLineXdr.switch().name).toBe("assetTypeCreditAlphanum12");
      expect(trustLineXdr.alphaNum12().assetCode()).toBe("12345\0\0\0\0\0\0\0");
    });

    it("parses a 12-alphanum asset object", () => {
      const asset = new Asset("123456789012", ISSUER);

      let assetXdr = asset.toXDRObject();
      expect(assetXdr).toBeInstanceOf(xdr.Asset);
      expect(() => assetXdr.toXDR("hex")).not.toThrow();
      expect(assetXdr.switch().name).toBe("assetTypeCreditAlphanum12");
      expect(assetXdr.alphaNum12().assetCode()).toBe("123456789012");

      let changeTrustXdr = asset.toChangeTrustXDRObject();
      expect(changeTrustXdr).toBeInstanceOf(xdr.ChangeTrustAsset);
      expect(() => changeTrustXdr.toXDR("hex")).not.toThrow();
      expect(changeTrustXdr.switch().name).toBe("assetTypeCreditAlphanum12");
      expect(changeTrustXdr.alphaNum12().assetCode()).toBe("123456789012");

      let trustLineXdr = asset.toTrustLineXDRObject();
      expect(trustLineXdr).toBeInstanceOf(xdr.TrustLineAsset);
      expect(() => trustLineXdr.toXDR("hex")).not.toThrow();
      expect(trustLineXdr.switch().name).toBe("assetTypeCreditAlphanum12");
      expect(trustLineXdr.alphaNum12().assetCode()).toBe("123456789012");
    });
  });

  describe("fromOperation()", () => {
    it("parses a native asset XDR", () => {
      const assetXdr = xdr.Asset.assetTypeNative();
      const asset = Asset.fromOperation(assetXdr);

      expect(asset).toBeInstanceOf(Asset);
      expect(asset.isNative()).toBe(true);
    });

    it("parses a 4-alphanum asset XDR", () => {
      const assetCode = "KHL";
      const assetType = new xdr.AlphaNum4({
        assetCode: assetCode + "\0",
        issuer: Keypair.fromPublicKey(ISSUER).xdrAccountId(),
      });
      const assetXdr = xdr.Asset.assetTypeCreditAlphanum4(assetType);

      const asset = Asset.fromOperation(assetXdr);

      expect(asset).toBeInstanceOf(Asset);
      expect(asset.getCode()).toBe(assetCode);
      expect(asset.getIssuer()).toBe(ISSUER);
    });

    it("parses a 12-alphanum asset XDR", () => {
      const assetCode = "KHLTOKEN";
      const assetType = new xdr.AlphaNum12({
        assetCode: assetCode + "\0\0\0\0",
        issuer: Keypair.fromPublicKey(ISSUER).xdrAccountId(),
      });
      const assetXdr = xdr.Asset.assetTypeCreditAlphanum12(assetType);

      const asset = Asset.fromOperation(assetXdr);

      expect(asset).toBeInstanceOf(Asset);
      expect(asset.getCode()).toBe(assetCode);
      expect(asset.getIssuer()).toBe(ISSUER);
    });
  });

  describe("toString()", () => {
    it("returns 'native' for native asset", () => {
      const asset = Asset.native();
      expect(asset.toString()).toBe("native");
    });

    it("returns 'code:issuer' for non-native asset", () => {
      const asset = new Asset("USD", ISSUER);
      expect(asset.toString()).toBe(`USD:${ISSUER}`);
    });
  });

  describe("compare()", () => {
    const assetA = new Asset("ARST", ISSUER_B);
    const assetB = new Asset("USD", ISSUER);

    it("throws an error if the input assets are invalid", () => {
      expect(() => Asset.compare(undefined as any, assetB)).toThrow(
        /assetA is invalid/,
      );
      expect(() => Asset.compare(assetA, undefined as any)).toThrow(
        /assetB is invalid/,
      );
      expect(() => Asset.compare(assetA, assetB)).not.toThrow();
    });

    it("returns 0 if assets are equal", () => {
      const XLM = Asset.native();
      expect(Asset.compare(XLM, XLM)).toBe(0);
      expect(Asset.compare(assetA, assetA)).toBe(0);
      expect(Asset.compare(assetB, assetB)).toBe(0);
    });

    it("validates asset types as native < anum4 < anum12", () => {
      const XLM = Asset.native();
      const anum4 = new Asset("ARST", ISSUER_B);
      const anum12 = new Asset("ARSTANUM12", ISSUER_B);

      expect(Asset.compare(XLM, XLM)).toBe(0);
      expect(Asset.compare(XLM, anum4)).toBe(-1);
      expect(Asset.compare(XLM, anum12)).toBe(-1);

      expect(Asset.compare(anum4, XLM)).toBe(1);
      expect(Asset.compare(anum4, anum4)).toBe(0);
      expect(Asset.compare(anum4, anum12)).toBe(-1);

      expect(Asset.compare(anum12, XLM)).toBe(1);
      expect(Asset.compare(anum12, anum4)).toBe(1);
      expect(Asset.compare(anum12, anum12)).toBe(0);
    });

    it("validates asset codes as assetCodeA < assetCodeB", () => {
      const assetARST = new Asset("ARST", ISSUER_B);
      const issuer = expectDefined(assetARST.getIssuer());
      const assetUSDX = new Asset("USDA", issuer);

      expect(Asset.compare(assetARST, assetARST)).toBe(0);
      expect(Asset.compare(assetARST, assetUSDX)).toBe(-1);

      expect(Asset.compare(assetUSDX, assetARST)).toBe(1);
      expect(Asset.compare(assetUSDX, assetUSDX)).toBe(0);

      // uppercase should be smaller
      const assetLower = new Asset("aRST", issuer);
      expect(Asset.compare(assetARST, assetLower)).toBe(-1);
      expect(Asset.compare(assetLower, assetA)).toBe(1);
    });

    it("validates asset issuers as assetIssuerA < assetIssuerB", () => {
      const assetIssuerA = new Asset("ARST", ISSUER_B);
      const assetIssuerB = new Asset("ARST", ISSUER);

      expect(Asset.compare(assetIssuerA, assetIssuerB)).toBe(-1);
      expect(Asset.compare(assetIssuerA, assetIssuerA)).toBe(0);

      expect(Asset.compare(assetIssuerB, assetIssuerA)).toBe(1);
      expect(Asset.compare(assetIssuerB, assetIssuerB)).toBe(0);
    });

    it("sorts upper-case letters before lower-case letters", () => {
      const issuer = "GA7NLOF4EHWMJF6DBXXV2H6AYI7IHYWNFZR6R52BYBLY7TE5Q74AIDRA";
      const upper = new Asset("B", issuer);
      const lower = new Asset("a", issuer);

      expect(Asset.compare(upper, lower)).toBe(-1);
    });
  });

  describe("contractId()", () => {
    it("creates the correct contract IDs", () => {
      const cases: [Asset, string][] = [
        [
          Asset.native(),
          "CB64D3G7SM2RTH6JSGG34DDTFTQ5CFDKVDZJZSODMCX4NJ2HV2KN7OHT",
        ],
        [
          new Asset(
            "USD",
            "GCP2QKBFLLEEWYVKAIXIJIJNCZ6XEBIE4PCDB6BF3GUB6FGE2RQ3HDVP",
          ),
          "CCWNZPARJG7KQ6N4BGZ5OBWKSSK4AVQ5URLDRXB4ZJXKGEJQTIIRPAHN",
        ],
      ];

      cases.forEach(([asset, contractId]) => {
        expect(asset.contractId(Networks.FUTURENET)).toBe(contractId);
      });
    });
  });

  // ---------------------------------------------------------------
  // Additional tests for uncovered code paths
  // ---------------------------------------------------------------

  describe("constructor edge cases", () => {
    it("normalizes XLM case variants to uppercase", () => {
      expect(new Asset("xlm").getCode()).toBe("XLM");
      expect(new Asset("Xlm").getCode()).toBe("XLM");
      expect(new Asset("xLM").getCode()).toBe("XLM");
    });

    it("allows XLM without an issuer (native)", () => {
      const asset = new Asset("XLM");
      expect(asset.isNative()).toBe(true);
      expect(asset.getIssuer()).toBeUndefined();
    });
  });

  describe("isNative()", () => {
    it("returns true for native asset", () => {
      expect(Asset.native().isNative()).toBe(true);
    });

    it("returns false for non-native asset", () => {
      expect(new Asset("USD", ISSUER).isNative()).toBe(false);
    });
  });

  describe("equals()", () => {
    it("returns true for identical assets", () => {
      const a = new Asset("USD", ISSUER);
      const b = new Asset("USD", ISSUER);
      expect(a.equals(b)).toBe(true);
    });

    it("returns false when codes differ", () => {
      const a = new Asset("USD", ISSUER);
      const b = new Asset("EUR", ISSUER);
      expect(a.equals(b)).toBe(false);
    });

    it("returns false when issuers differ", () => {
      const a = new Asset("USD", ISSUER);
      const b = new Asset("USD", ISSUER_B);
      expect(a.equals(b)).toBe(false);
    });

    it("returns true for two native assets", () => {
      expect(Asset.native().equals(Asset.native())).toBe(true);
    });
  });

  describe("getRawAssetType()", () => {
    it("returns assetTypeNative for native", () => {
      expect(Asset.native().getRawAssetType()).toEqual(
        xdr.AssetType.assetTypeNative(),
      );
    });

    it("returns assetTypeCreditAlphanum4 for short codes", () => {
      expect(new Asset("USD", ISSUER).getRawAssetType()).toEqual(
        xdr.AssetType.assetTypeCreditAlphanum4(),
      );
    });

    it("returns assetTypeCreditAlphanum12 for long codes", () => {
      expect(new Asset("LONGASSET", ISSUER).getRawAssetType()).toEqual(
        xdr.AssetType.assetTypeCreditAlphanum12(),
      );
    });
  });

  describe("XDR round-trip", () => {
    it("round-trips a 4-alphanum asset through toXDRObject/fromOperation", () => {
      const original = new Asset("USD", ISSUER);
      const restored = Asset.fromOperation(original.toXDRObject());
      expect(original.equals(restored)).toBe(true);
    });

    it("round-trips a 12-alphanum asset through toXDRObject/fromOperation", () => {
      const original = new Asset("LONGASSET", ISSUER);
      const restored = Asset.fromOperation(original.toXDRObject());
      expect(original.equals(restored)).toBe(true);
    });

    it("round-trips a native asset through toXDRObject/fromOperation", () => {
      const original = Asset.native();
      const restored = Asset.fromOperation(original.toXDRObject());
      expect(original.equals(restored)).toBe(true);
    });
  });

  describe("compare() edge cases", () => {
    it("throws when assetA is a non-Asset object", () => {
      expect(() => Asset.compare({} as any, Asset.native())).toThrow(
        /assetA is invalid/,
      );
    });

    it("throws when assetB is a non-Asset object", () => {
      expect(() => Asset.compare(Asset.native(), {} as any)).toThrow(
        /assetB is invalid/,
      );
    });
  });

  describe("contractId() for non-native asset", () => {
    it("returns a C... strkey for a credit asset", () => {
      const asset = new Asset("USD", ISSUER);
      const id = asset.contractId(Networks.FUTURENET);
      expect(id).toMatch(/^C[A-Z0-9]{55}$/);
    });
  });
});
