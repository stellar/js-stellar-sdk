import { beforeEach, describe, expect, it } from "vitest";
import {
  areUint8ArraysEqual,
  hexToUint8Array,
  uint8ArrayToHex,
} from "uint8array-extras";
import { StrKey, decodeCheck, encodeCheck } from "../../../src/base/strkey.js";
import {
  decodeAddressToMuxedAccount,
  encodeMuxedAccountToAddress,
  extractBaseAddress,
} from "../../../src/base/util/decode_encode_muxed_account.js";
import * as xdr from "../../../src/xdr/index.js";

const PUBKEY = "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";
const MPUBKEY =
  "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVAAAAAAAAAAAAAJLK";
const RAW_MPUBKEY = hexToUint8Array(
  "3f0c34bf93ad0d9971d04ccc90f705511c838aad9734a4a2fb0d7a03fc7fe89a8000000000000000",
);

describe("StrKey", () => {
  let unencodedBytes: Uint8Array;
  let accountIdEncoded: string;
  let seedEncoded: string;

  beforeEach(() => {
    unencodedBytes = StrKey.decodeEd25519PublicKey(PUBKEY);
    accountIdEncoded = PUBKEY;
    seedEncoded = StrKey.encodeEd25519SecretSeed(unencodedBytes);
  });

  describe("#decodeCheck", () => {
    it("decodes correctly", () => {
      expect(StrKey.decodeEd25519PublicKey(accountIdEncoded)).toEqual(
        unencodedBytes,
      );
      expect(StrKey.decodeEd25519SecretSeed(seedEncoded)).toEqual(
        unencodedBytes,
      );
    });

    it("throws an error when the version byte is wrong", () => {
      expect(() =>
        StrKey.decodeEd25519SecretSeed(
          "GBPXXOA5N4JYPESHAADMQKBPWZWQDQ64ZV6ZL2S3LAGW4SY7NTCMWIVL",
        ),
      ).toThrow(/invalid version/);
      expect(() =>
        StrKey.decodeEd25519PublicKey(
          "SBGWKM3CD4IL47QN6X54N6Y33T3JDNVI6AIJ6CD5IM47HG3IG4O36XCU",
        ),
      ).toThrow(/invalid version/);
    });

    it("throws an error when decoded data encodes to other string", () => {
      // accountId
      expect(() =>
        StrKey.decodeEd25519PublicKey(
          "GBPXX0A5N4JYPESHAADMQKBPWZWQDQ64ZV6ZL2S3LAGW4SY7NTCMWIVL",
        ),
      ).toThrow(/invalid character in base32 input/i);
      expect(
        () =>
          StrKey.decodeEd25519PublicKey(
            "GCFZB6L25D26RQFDWSSBDEYQ32JHLRMTT44ZYE3DZQUTYOL7WY43PLBG++",
          ),
        // 58 chars: rejected by the encoded-length guard before base32 decode
      ).toThrow(/invalid encoded string length/i);
      expect(() =>
        StrKey.decodeEd25519PublicKey(
          "GADE5QJ2TY7S5ZB65Q43DFGWYWCPHIYDJ2326KZGAGBN7AE5UY6JVDRRA",
        ),
      ).toThrow(
        /invalid (encoded string|base32 length|last chunk|character in base32 input)/i,
      );
      expect(() =>
        StrKey.decodeEd25519PublicKey(
          "GB6OWYST45X57HCJY5XWOHDEBULB6XUROWPIKW77L5DSNANBEQGUPADT2",
        ),
      ).toThrow(
        /invalid (encoded string|base32 length|last chunk|character in base32 input)/i,
      );
      expect(() =>
        StrKey.decodeEd25519PublicKey(
          "GB6OWYST45X57HCJY5XWOHDEBULB6XUROWPIKW77L5DSNANBEQGUPADT2T",
        ),
      ).toThrow(
        /invalid (encoded string|base32 length|last chunk|character in base32 input)/i,
      );
      // seed
      expect(() =>
        StrKey.decodeEd25519SecretSeed(
          "SB7OJNF5727F3RJUG5ASQJ3LUM44ELLNKW35ZZQDHMVUUQNGYW",
        ),
      ).toThrow(
        /invalid (encoded string|base32 length|last chunk|character in base32 input)/i,
      );
      expect(() =>
        StrKey.decodeEd25519SecretSeed(
          "SB7OJNF5727F3RJUG5ASQJ3LUM44ELLNKW35ZZQDHMVUUQNGYWMEGB2W2",
        ),
      ).toThrow(
        /invalid (encoded string|base32 length|last chunk|character in base32 input)/i,
      );
      expect(() =>
        StrKey.decodeEd25519SecretSeed(
          "SB7OJNF5727F3RJUG5ASQJ3LUM44ELLNKW35ZZQDHMVUUQNGYWMEGB2W2T",
        ),
      ).toThrow(
        /invalid (encoded string|base32 length|last chunk|character in base32 input)/i,
      );
      expect(() =>
        StrKey.decodeEd25519SecretSeed(
          "SCMB30FQCIQAWZ4WQTS6SVK37LGMAFJGXOZIHTH2PY6EXLP37G46H6DT",
        ),
      ).toThrow(
        /invalid (encoded string|base32 length|last chunk|character in base32 input)/i,
      );
      expect(
        () =>
          StrKey.decodeEd25519SecretSeed(
            "SAYC2LQ322EEHZYWNSKBEW6N66IRTDREEBUXXU5HPVZGMAXKLIZNM45H++",
          ),
        // 58 chars: rejected by the encoded-length guard before base32 decode
      ).toThrow(/invalid encoded string length/i);
    });

    it("throws an error when the checksum is wrong", () => {
      expect(() =>
        StrKey.decodeEd25519PublicKey(
          "GBPXXOA5N4JYPESHAADMQKBPWZWQDQ64ZV6ZL2S3LAGW4SY7NTCMWIVT",
        ),
      ).toThrow(/invalid checksum/);
      expect(() =>
        StrKey.decodeEd25519SecretSeed(
          "SBGWKM3CD4IL47QN6X54N6Y33T3JDNVI6AIJ6CD5IM47HG3IG4O36XCX",
        ),
      ).toThrow(/invalid checksum/);
    });
  });

  describe("#decodeCheck length bounds", () => {
    it("rejects an oversized G-shaped string before decoding", () => {
      const huge = `G${"A".repeat(1_000_000)}`;
      expect(() => StrKey.decodeEd25519PublicKey(huge)).toThrow(
        /invalid encoded string length: expected 56, got 1000001/,
      );
    });

    it("rejects oversized canonical T- and X-shaped strings", () => {
      const big = new Uint8Array(1024);
      expect(() =>
        StrKey.decodePreAuthTx(encodeCheck("preAuthTx", big)),
      ).toThrow(/invalid encoded string length/);
      expect(() =>
        StrKey.decodeSha256Hash(encodeCheck("sha256Hash", big)),
      ).toThrow(/invalid encoded string length/);
    });

    it("rejects a checksummed strkey with a wrong-sized payload", () => {
      // encodes fine (valid version byte + CRC16) but is not 32 bytes, so
      // decodeCheck must throw rather than return a 37-byte buffer
      const wrongSize = encodeCheck("ed25519PublicKey", new Uint8Array(37));
      expect(() => decodeCheck("ed25519PublicKey", wrongSize)).toThrow(
        /invalid encoded string length/,
      );
    });

    it("rejects unknown version byte names before decoding", () => {
      expect(() => decodeCheck("notAType", PUBKEY)).toThrow(
        /not a valid version byte name/,
      );
    });

    it("still decodes valid strkeys of every type (regression)", () => {
      const raw32 = StrKey.decodeEd25519PublicKey(PUBKEY);

      // 56-char fixed-length types
      expect(StrKey.decodeEd25519PublicKey(PUBKEY)).toHaveLength(32); // G
      expect(
        StrKey.decodeEd25519SecretSeed(StrKey.encodeEd25519SecretSeed(raw32)),
      ).toEqual(raw32); // S
      expect(StrKey.decodePreAuthTx(StrKey.encodePreAuthTx(raw32))).toEqual(
        raw32,
      ); // T
      expect(StrKey.decodeSha256Hash(StrKey.encodeSha256Hash(raw32))).toEqual(
        raw32,
      ); // X
      expect(
        StrKey.decodeContract(
          "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE",
        ),
      ).toHaveLength(32); // C
      expect(
        StrKey.decodeLiquidityPool(
          "LA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUPJN",
        ),
      ).toHaveLength(32); // L

      // 58-char B
      expect(
        StrKey.decodeClaimableBalance(
          "BAAD6DBUX6J22DMZOHIEZTEQ64CVCHEDRKWZONFEUL5Q26QD7R76RGR4TU",
        ),
      ).toHaveLength(33);

      // 69-char M
      expect(StrKey.decodeMed25519PublicKey(MPUBKEY)).toHaveLength(40);

      // variable-length P (32-byte and 29-byte payloads)
      expect(
        StrKey.decodeSignedPayload(
          "PA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAQACAQDAQCQMBYIBEFAWDANBYHRAEISCMKBKFQXDAMRUGY4DUPB6IBZGM",
        ),
      ).toHaveLength(32 + 4 + 32);
      expect(
        StrKey.decodeSignedPayload(
          "PA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAOQCAQDAQCQMBYIBEFAWDANBYHRAEISCMKBKFQXDAMRUGY4DUAAAAFGBU",
        ),
      ).toHaveLength(32 + 4 + 29 + 3); // payload zero-padded to 4-byte boundary
    });
  });

  describe("#encodeCheck", () => {
    it("encodes bytes correctly", () => {
      expect(StrKey.encodeEd25519PublicKey(unencodedBytes)).toEqual(
        accountIdEncoded,
      );
      expect(StrKey.encodeEd25519PublicKey(unencodedBytes)).toMatch(/^G/);
      expect(StrKey.encodeEd25519SecretSeed(unencodedBytes)).toEqual(
        seedEncoded,
      );
      expect(StrKey.encodeEd25519SecretSeed(unencodedBytes)).toMatch(/^S/);

      let strkeyEncoded = StrKey.encodePreAuthTx(unencodedBytes);
      expect(strkeyEncoded).toMatch(/^T/);
      expect(StrKey.decodePreAuthTx(strkeyEncoded)).toEqual(unencodedBytes);

      strkeyEncoded = StrKey.encodeSha256Hash(unencodedBytes);
      expect(strkeyEncoded).toMatch(/^X/);
      expect(StrKey.decodeSha256Hash(strkeyEncoded)).toEqual(unencodedBytes);
    });

    it("roundtrips the helper fns", () => {
      expect(encodeCheck("ed25519PublicKey", unencodedBytes)).toEqual(
        accountIdEncoded,
      );
      expect(decodeCheck("ed25519PublicKey", accountIdEncoded)).toEqual(
        unencodedBytes,
      );
    });

    it("throws an error when the data is null", () => {
      expect(() =>
        StrKey.encodeEd25519SecretSeed(null as unknown as Uint8Array),
      ).toThrow(/null data/);
      expect(() =>
        StrKey.encodeEd25519PublicKey(null as unknown as Uint8Array),
      ).toThrow(/null data/);
    });
  });

  describe("#isValidEd25519PublicKey", () => {
    it("returns true for valid public key", () => {
      const keys = [
        "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
        "GB7KKHHVYLDIZEKYJPAJUOTBE5E3NJAXPSDZK7O6O44WR3EBRO5HRPVT",
        "GD6WVYRVID442Y4JVWFWKWCZKB45UGHJAABBJRS22TUSTWGJYXIUR7N2",
        "GBCG42WTVWPO4Q6OZCYI3D6ZSTFSJIXIS6INCIUF23L6VN3ADE4337AP",
        "GDFX463YPLCO2EY7NGFMI7SXWWDQAMASGYZXCG2LATOF3PP5NQIUKBPT",
        "GBXEODUMM3SJ3QSX2VYUWFU3NRP7BQRC2ERWS7E2LZXDJXL2N66ZQ5PT",
        "GAJHORKJKDDEPYCD6URDFODV7CVLJ5AAOJKR6PG2VQOLWFQOF3X7XLOG",
        "GACXQEAXYBEZLBMQ2XETOBRO4P66FZAJENDHOQRYPUIXZIIXLKMZEXBJ",
        "GDD3XRXU3G4DXHVRUDH7LJM4CD4PDZTVP4QHOO4Q6DELKXUATR657OZV",
        "GDTYVCTAUQVPKEDZIBWEJGKBQHB4UGGXI2SXXUEW7LXMD4B7MK37CWLJ",
      ];

      for (const key of keys) {
        expect(StrKey.isValidEd25519PublicKey(key)).toBe(true);
      }
    });

    it("returns false for invalid public key", () => {
      const keys: Array<string | null> = [
        "GBPXX0A5N4JYPESHAADMQKBPWZWQDQ64ZV6ZL2S3LAGW4SY7NTCMWIVL",
        "GCFZB6L25D26RQFDWSSBDEYQ32JHLRMTT44ZYE3DZQUTYOL7WY43PLBG++",
        "GADE5QJ2TY7S5ZB65Q43DFGWYWCPHIYDJ2326KZGAGBN7AE5UY6JVDRRA",
        "GB6OWYST45X57HCJY5XWOHDEBULB6XUROWPIKW77L5DSNANBEQGUPADT2",
        "GB6OWYST45X57HCJY5XWOHDEBULB6XUROWPIKW77L5DSNANBEQGUPADT2T",
        "GDXIIZTKTLVYCBHURXL2UPMTYXOVNI7BRAEFQCP6EZCY4JLKY4VKFNLT",
        "SAB5556L5AN5KSR5WF7UOEFDCIODEWEO7H2UR4S5R62DFTQOGLKOVZDY",
        "gWRYUerEKuz53tstxEuR3NCkiQDcV4wzFHmvLnZmj7PUqxW2wt",
        "test",
        null,
        "g4VPBPrHZkfE8CsjuG2S4yBQNd455UWmk", // Old network key
      ];

      for (const key of keys) {
        expect(StrKey.isValidEd25519PublicKey(key as unknown as string)).toBe(
          false,
        );
      }
    });
  });

  describe("#isValidSecretKey", () => {
    it("returns true for valid secret key", () => {
      const keys = [
        "SAB5556L5AN5KSR5WF7UOEFDCIODEWEO7H2UR4S5R62DFTQOGLKOVZDY",
        "SCZTUEKSEH2VYZQC6VLOTOM4ZDLMAGV4LUMH4AASZ4ORF27V2X64F2S2",
        "SCGNLQKTZ4XCDUGVIADRVOD4DEVNYZ5A7PGLIIZQGH7QEHK6DYODTFEH",
        "SDH6R7PMU4WIUEXSM66LFE4JCUHGYRTLTOXVUV5GUEPITQEO3INRLHER",
        "SC2RDTRNSHXJNCWEUVO7VGUSPNRAWFCQDPP6BGN4JFMWDSEZBRAPANYW",
        "SCEMFYOSFZ5MUXDKTLZ2GC5RTOJO6FGTAJCF3CCPZXSLXA2GX6QUYOA7",
      ];

      for (const key of keys) {
        expect(StrKey.isValidEd25519SecretSeed(key)).toBe(true);
      }
    });

    it("returns false for invalid secret key", () => {
      const keys: Array<string | null> = [
        "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
        "SAB5556L5AN5KSR5WF7UOEFDCIODEWEO7H2UR4S5R62DFTQOGLKOVZDYT", // Too long
        "SAFGAMN5Z6IHVI3IVEPIILS7ITZDYSCEPLN4FN5Z3IY63DRH4CIYEV", // Too short
        "SAFGAMN5Z6IHVI3IVEPIILS7ITZDYSCEPLN4FN5Z3IY63DRH4CIYEVIT", // Checksum
        "test",
        null,
      ];

      for (const key of keys) {
        expect(StrKey.isValidEd25519SecretSeed(key as unknown as string)).toBe(
          false,
        );
      }
    });
  });

  describe("#muxedAccounts", () => {
    const rawPubkey = StrKey.decodeEd25519PublicKey(PUBKEY);
    const unmuxed = xdr.MuxedAccount.keyTypeEd25519(rawPubkey);

    it("encodes & decodes M... addresses correctly", () => {
      expect(StrKey.encodeMed25519PublicKey(RAW_MPUBKEY)).toBe(MPUBKEY);
      expect(
        areUint8ArraysEqual(
          StrKey.decodeMed25519PublicKey(MPUBKEY),
          RAW_MPUBKEY,
        ),
      ).toBe(true);
    });

    it("lets G... accounts pass through (unmuxed)", () => {
      const decoded = decodeAddressToMuxedAccount(PUBKEY);

      expect(decoded).toBeInstanceOf(xdr.MuxedAccount);
      expect(decoded.type).toBe("keyTypeEd25519");
      expect(Array.from((decoded as xdr.MuxedAccountEd25519).ed25519)).toEqual(
        Array.from(StrKey.decodeEd25519PublicKey(PUBKEY)),
      );
      expect(encodeMuxedAccountToAddress(decoded)).toBe(PUBKEY);
    });

    it("decodes underlying G... address correctly", () => {
      expect(extractBaseAddress(MPUBKEY)).toBe(PUBKEY);
      expect(extractBaseAddress(PUBKEY)).toBe(PUBKEY);
    });

    it("encodes & decodes unmuxed keys", () => {
      expect(unmuxed).toBeInstanceOf(xdr.MuxedAccount);
      expect(unmuxed.type).toBe("keyTypeEd25519");
      expect(Array.from(unmuxed.ed25519)).toEqual(Array.from(rawPubkey));

      const pubkey = encodeMuxedAccountToAddress(unmuxed);
      expect(pubkey).toBe(PUBKEY);
    });

    const cases = [
      {
        strkey:
          "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVAAAAAAAAAAAAAJLK",
        id: "9223372036854775808", // 0x8000...
      },
      {
        strkey:
          "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAFB4CJJBRKA",
        id: "1357924680",
      },
      {
        strkey:
          "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAE2JUG6",
        id: "1234",
      },
      {
        strkey:
          "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAACJUQ",
        id: "0",
      },
    ];

    for (const testCase of cases) {
      it(`encodes & decodes muxed key w/ ID=${testCase.id}`, () => {
        const muxed = decodeAddressToMuxedAccount(testCase.strkey);
        expect(muxed).toBeInstanceOf(xdr.MuxedAccount);
        expect(muxed.type).toBe("keyTypeMuxedEd25519");

        const innerMux = (muxed as xdr.MuxedAccountMuxedEd25519).med25519;
        expect(Array.from(innerMux.ed25519)).toEqual(
          Array.from(unmuxed.ed25519),
        );
        expect(innerMux.id).toEqual(BigInt(testCase.id));

        const mpubkey = encodeMuxedAccountToAddress(muxed);
        expect(mpubkey).toBe(testCase.strkey);
      });
    }
  });

  describe("#signedPayloads", () => {
    const happyPaths = [
      {
        desc: "valid w/ 32-byte payload",
        strkey:
          "PA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAQACAQDAQCQMBYIBEFAWDANBYHRAEISCMKBKFQXDAMRUGY4DUPB6IBZGM",
        ed25519: "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
        payload:
          "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20",
      },
      {
        desc: "valid w/ 29-byte payload",
        strkey:
          "PA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAOQCAQDAQCQMBYIBEFAWDANBYHRAEISCMKBKFQXDAMRUGY4DUAAAAFGBU",
        ed25519: "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
        payload: "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d",
      },
    ];

    for (const testCase of happyPaths) {
      it(testCase.desc, () => {
        const signedPayloadBuf = StrKey.decodeSignedPayload(testCase.strkey);
        const signedPayload = xdr.SignerKeyEd25519SignedPayload.fromXdr(
          signedPayloadBuf,
          "raw",
        );

        const signer = StrKey.encodeEd25519PublicKey(signedPayload.ed25519);
        expect(signer).toBe(testCase.ed25519);

        const payload = uint8ArrayToHex(new Uint8Array(signedPayload.payload));
        expect(payload).toBe(testCase.payload);

        const str = StrKey.encodeSignedPayload(signedPayload.toXdr("raw"));
        expect(str).toBe(testCase.strkey);
      });
    }

    describe("payload bounds", () => {
      const makeSignedPayload = (
        payload: Uint8Array,
      ): xdr.SignerKeyEd25519SignedPayload =>
        new xdr.SignerKeyEd25519SignedPayload({
          ed25519: StrKey.decodeEd25519PublicKey(PUBKEY),
          payload,
        });

      const isValid = (value: xdr.SignerKeyEd25519SignedPayload): boolean => {
        return StrKey.isValidSignedPayload(
          StrKey.encodeSignedPayload(value.toXdr("raw")),
        );
      };

      it("invalid with no payload", () => {
        expect(isValid(makeSignedPayload(new Uint8Array(0)))).toBe(false);
      });

      it("valid with 1-byte payload", () => {
        expect(isValid(makeSignedPayload(new Uint8Array(1)))).toBe(true);
      });

      it("throws with 65-byte payload", () => {
        expect(() => isValid(makeSignedPayload(new Uint8Array(65)))).toThrow(
          /XDR Write Error|exceeds max length|length/i,
        );
      });

      it("valid with 64-byte payload (max)", () => {
        expect(isValid(makeSignedPayload(new Uint8Array(64)))).toBe(true);
      });
    });

    describe("framing", () => {
      // builds a checksum-valid P-strkey whose 40-byte body declares `declared`
      // as its payload length but carries `tail` in the payload region
      const forge = (declared: number, tail: number[]): string => {
        const body = new Uint8Array(40);
        new DataView(body.buffer).setUint32(32, declared);
        body.set(tail, 36);
        return StrKey.encodeSignedPayload(body);
      };

      // the equivalent wire bytes: SignerKey discriminant + the strkey body
      const asWire = (body: Uint8Array): Uint8Array => {
        const wire = new Uint8Array(4 + body.length);
        new DataView(wire.buffer).setUint32(0, 3); // ed25519SignedPayload
        wire.set(body, 4);
        return wire;
      };

      const malformed = [
        {
          desc: "declared length exceeds the bytes present",
          declared: 64,
          tail: [1, 2, 3, 4],
        },
        {
          desc: "padding is non-zero",
          declared: 1,
          tail: [0xaa, 0xbb, 0xcc, 0xdd],
        },
      ];

      for (const testCase of malformed) {
        describe(testCase.desc, () => {
          const strkey = forge(testCase.declared, testCase.tail);

          it("is rejected by decodeSignedPayload", () => {
            expect(() => StrKey.decodeSignedPayload(strkey)).toThrow(
              /signed payload/,
            );
          });

          it("is rejected by isValidSignedPayload", () => {
            expect(StrKey.isValidSignedPayload(strkey)).toBe(false);
          });

          it("is rejected by SignerKey.fromJson", () => {
            expect(() => xdr.SignerKey.fromJson(strkey)).toThrow();
          });

          it("is rejected by both decoders, not just one", () => {
            // the JSON path used to silently rewrite these into a *different*
            // valid signer key while the wire path threw
            const body = new Uint8Array(40);
            new DataView(body.buffer).setUint32(32, testCase.declared);
            body.set(testCase.tail, 36);

            expect(() => xdr.SignerKey.fromXdr(asWire(body))).toThrow();
            expect(() => xdr.SignerKey.fromJson(strkey)).toThrow();
          });
        });
      }

      for (const size of [1, 64]) {
        it(`round-trips a well-formed ${size}-byte payload through JSON`, () => {
          const strkey = StrKey.encodeSignedPayload(
            new xdr.SignerKeyEd25519SignedPayload({
              ed25519: StrKey.decodeEd25519PublicKey(PUBKEY),
              payload: new Uint8Array(size).fill(0xab),
            }).toXdr("raw"),
          );

          expect(xdr.SignerKey.fromJson(strkey).toJson()).toBe(strkey);
        });
      }
    });
  });

  describe("#contracts", () => {
    it("valid w/ 32-byte payload", () => {
      const strkey = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
      const decoded = StrKey.decodeContract(strkey);

      expect(uint8ArrayToHex(decoded)).toBe(
        "363eaa3867841fbad0f4ed88c779e4fe66e56a2470dc98c0ec9c073d05c7b103",
      );
      expect(StrKey.encodeContract(decoded)).toBe(strkey);
    });

    it("isValid", () => {
      const valid = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
      expect(StrKey.isValidContract(valid)).toBe(true);

      const invalid =
        "GA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
      expect(StrKey.isValidContract(invalid)).toBe(false);
    });
  });

  describe("#liquidityPools", () => {
    it("valid w/ 32-byte hash", () => {
      const strkey = "LA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUPJN";
      const asHex =
        "3f0c34bf93ad0d9971d04ccc90f705511c838aad9734a4a2fb0d7a03fc7fe89a";

      expect(StrKey.isValidLiquidityPool(strkey)).toBe(true);
      expect(uint8ArrayToHex(StrKey.decodeLiquidityPool(strkey))).toBe(asHex);
      expect(StrKey.encodeLiquidityPool(hexToUint8Array(asHex))).toBe(strkey);
    });

    it("rejects invalid liquidity pool addresses", () => {
      expect(StrKey.isValidLiquidityPool("")).toBe(false);
      expect(StrKey.isValidLiquidityPool("LINVALID")).toBe(false);
      expect(
        StrKey.isValidLiquidityPool(
          "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
        ),
      ).toBe(false);
    });
  });

  describe("#claimableBalances", () => {
    it("valid w/ 33-byte strkey", () => {
      const strkey =
        "BAAD6DBUX6J22DMZOHIEZTEQ64CVCHEDRKWZONFEUL5Q26QD7R76RGR4TU";
      const asHex =
        "003f0c34bf93ad0d9971d04ccc90f705511c838aad9734a4a2fb0d7a03fc7fe89a";

      expect(StrKey.isValidClaimableBalance(strkey)).toBe(true);
      expect(uint8ArrayToHex(StrKey.decodeClaimableBalance(strkey))).toBe(
        asHex,
      );
      expect(StrKey.encodeClaimableBalance(hexToUint8Array(asHex))).toBe(
        strkey,
      );
    });

    it("rejects invalid claimable balance addresses", () => {
      expect(StrKey.isValidClaimableBalance("")).toBe(false);
      expect(StrKey.isValidClaimableBalance("BINVALID")).toBe(false);
      expect(
        StrKey.isValidClaimableBalance(
          "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
        ),
      ).toBe(false);
    });
  });

  describe("#isValidMed25519PublicKey", () => {
    it("returns true for a valid M-address", () => {
      expect(
        StrKey.isValidMed25519PublicKey(
          "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVAAAAAAAAAAAAAJLK",
        ),
      ).toBe(true);
    });

    it("rejects invalid M-addresses", () => {
      expect(StrKey.isValidMed25519PublicKey("")).toBe(false);
      expect(StrKey.isValidMed25519PublicKey("MINVALID")).toBe(false);
      expect(
        StrKey.isValidMed25519PublicKey(
          "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
        ),
      ).toBe(false);
    });
  });

  describe("#getVersionByteForPrefix", () => {
    it("returns the correct type for each prefix", () => {
      expect(StrKey.getVersionByteForPrefix("G...")).toBe("ed25519PublicKey");
      expect(StrKey.getVersionByteForPrefix("S...")).toBe("ed25519SecretSeed");
      expect(StrKey.getVersionByteForPrefix("M...")).toBe("med25519PublicKey");
      expect(StrKey.getVersionByteForPrefix("T...")).toBe("preAuthTx");
      expect(StrKey.getVersionByteForPrefix("X...")).toBe("sha256Hash");
      expect(StrKey.getVersionByteForPrefix("P...")).toBe("signedPayload");
      expect(StrKey.getVersionByteForPrefix("C...")).toBe("contract");
      expect(StrKey.getVersionByteForPrefix("L...")).toBe("liquidityPool");
      expect(StrKey.getVersionByteForPrefix("B...")).toBe("claimableBalance");
    });

    it("returns undefined for invalid prefixes", () => {
      expect(StrKey.getVersionByteForPrefix("")).toBeUndefined();
      expect(StrKey.getVersionByteForPrefix("Z...")).toBeUndefined();
      expect(StrKey.getVersionByteForPrefix("1...")).toBeUndefined();
    });
  });

  describe("#invalidStrKeys", () => {
    // From https://stellar.org/protocol/sep-23#invalid-test-cases
    const badStrkeys = [
      // The unused trailing bit must be zero in the encoding of the last three
      // bytes (24 bits) as five base-32 symbols (25 bits)
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAACJUR",
      // Invalid length (congruent to 1 mod 8)
      "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZA",
      // Invalid algorithm (low 3 bits of version byte are 7)
      "G47QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVP2I",
      // Invalid length (congruent to 6 mod 8)
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVAAAAAAAAAAAAAJLKA",
      // Invalid algorithm (low 3 bits of version byte are 7)
      "M47QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAACJUQ",
      // Padding bytes are not allowed
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAACJUK===",
      // Invalid checksum
      "MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAACJUO",
      // Trailing bits should be zeroes
      "BAAD6DBUX6J22DMZOHIEZTEQ64CVCHEDRKWZONFEUL5Q26QD7R76RGR4TV",
      // Length prefix specifies a length shorter than the payload present
      "PA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAQACAQDAQCQMBYIBEFAWDANBYHRAEISCMKBKFQXDAMRUGY4DUPB6IAAAAAAAAPM",
      // Length prefix specifies a length longer than the payload present
      "PA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAOQCAQDAQCQMBYIBEFAWDANBYHRAEISCMKBKFQXDAMRUGY4Z2PQ",
      // No zero padding after the payload
      "PA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAOQCAQDAQCQMBYIBEFAWDANBYHRAEISCMKBKFQXDAMRUGY4DXFH6",
    ];

    for (const address of badStrkeys) {
      it(`fails in expected case ${address}`, () => {
        const versionByteName = StrKey.getVersionByteForPrefix(address);
        if (versionByteName === "claimableBalance") {
          expect(StrKey.isValidClaimableBalance(address)).toBe(false);
          return;
        }

        expect(() => decodeCheck(versionByteName ?? "", address)).toThrow();
      });
    }

    it("current limitation: claimable balance discriminant is not validated", () => {
      const invalidDiscriminant =
        "BAAT6DBUX6J22DMZOHIEZTEQ64CVCHEDRKWZONFEUL5Q26QD7R76RGXACA";
      expect(() =>
        decodeCheck("claimableBalance", invalidDiscriminant),
      ).not.toThrow();
      expect(StrKey.isValidClaimableBalance(invalidDiscriminant)).toBe(true);
    });
  });
});
