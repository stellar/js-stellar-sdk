import { describe, expect, it } from "vitest";
import { SignerKey } from "../../src/signerkey.js";
import xdr from "../../src/xdr.js";

describe("SignerKey", () => {
  describe("encode/decode roundtrip", () => {
    const testCases = [
      {
        strkey: "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
        type: xdr.SignerKeyType.signerKeyTypeEd25519()
      },
      {
        strkey: "TBU2RRGLXH3E5CQHTD3ODLDF2BWDCYUSSBLLZ5GNW7JXHDIYKXZWHXL7",
        type: xdr.SignerKeyType.signerKeyTypePreAuthTx()
      },
      {
        strkey: "XBU2RRGLXH3E5CQHTD3ODLDF2BWDCYUSSBLLZ5GNW7JXHDIYKXZWGTOG",
        type: xdr.SignerKeyType.signerKeyTypeHashX()
      },
      {
        strkey:
          "PA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAQACAQDAQCQMBYIBEFAWDANBYHRAEISCMKBKFQXDAMRUGY4DUPB6IBZGM",
        type: xdr.SignerKeyType.signerKeyTypeEd25519SignedPayload()
      }
    ] as const;

    for (const testCase of testCases) {
      it(`works for ${testCase.strkey.slice(0, 5)}...`, () => {
        const signerKey = SignerKey.decodeAddress(testCase.strkey);
        expect(signerKey.switch()).toEqual(testCase.type);

        const rawXdr = signerKey.toXDR("raw");
        const rawSignerKey = xdr.SignerKey.fromXDR(rawXdr, "raw");
        expect(rawSignerKey).toEqual(signerKey);

        const address = SignerKey.encodeSignerKey(signerKey);
        expect(address).toBe(testCase.strkey);
      });
    }
  });

  describe("error cases", () => {
    const invalidSignerTypes = [
      // these are valid strkeys, just not valid signers
      "SAB5556L5AN5KSR5WF7UOEFDCIODEWEO7H2UR4S5R62DFTQOGLKOVZDY",
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVAAAAAAAAAAAAAJLK",
      // this is (literal) nonsense
      "NONSENSE"
    ] as const;

    for (const strkey of invalidSignerTypes) {
      it(`fails on ${strkey.slice(0, 5)}...`, () => {
        expect(() => {
          SignerKey.decodeAddress(strkey);
        }).toThrow(/invalid signer key type/i);
      });
    }

    it("fails on invalid strkey", () => {
      expect(() =>
        // address taken from strkey_test.js#invalidStrKeys
        SignerKey.decodeAddress(
          "G47QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVP2I"
        )
      ).toThrow(/invalid version byte/i);
    });
  });
});
