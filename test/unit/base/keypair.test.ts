import { describe, expect, it } from "vitest";
import { Keypair } from "../../src/keypair.js";
import { StrKey } from "../../src/strkey.js";
import { Networks } from "../../src/network.js";
import xdr from "../../src/xdr.js";

describe("Keypair.constructor", () => {
  it("fails when passes secret key does not match public key", () => {
    const secret = "SD7X7LEHBNMUIKQGKPARG5TDJNBHKC346OUARHGZL5ITC6IJPXHILY36";
    const kp = Keypair.fromSecret(secret);

    const secretKey = kp.rawSecretKey();
    const publicKey = StrKey.decodeEd25519PublicKey(kp.publicKey());
    publicKey[0] = 0; // Make public key invalid

    expect(
      () => new Keypair({ type: "ed25519", secretKey, publicKey }),
    ).toThrow(/secretKey does not match publicKey/);
  });

  it("fails when secretKey length is invalid", () => {
    const secretKey = Buffer.alloc(33);
    expect(() => new Keypair({ type: "ed25519", secretKey })).toThrow(
      /secretKey length is invalid/,
    );
  });

  it("fails when publicKey length is invalid", () => {
    const publicKey = Buffer.alloc(33);
    expect(() => new Keypair({ type: "ed25519", publicKey })).toThrow(
      /publicKey length is invalid/,
    );
  });
});

describe("Keypair.fromSecret", () => {
  it("creates a keypair correctly", () => {
    const secret = "SD7X7LEHBNMUIKQGKPARG5TDJNBHKC346OUARHGZL5ITC6IJPXHILY36";
    const kp = Keypair.fromSecret(secret);

    expect(kp).toBeInstanceOf(Keypair);
    expect(kp.publicKey()).toEqual(
      "GDFQVQCYYB7GKCGSCUSIQYXTPLV5YJ3XWDMWGQMDNM4EAXAL7LITIBQ7",
    );
    expect(kp.secret()).toEqual(secret);
  });

  it("throw an error if the arg isn't strkey encoded as a seed", () => {
    expect(() => Keypair.fromSecret("hel0")).toThrow();
    expect(() =>
      Keypair.fromSecret(
        "SBWUBZ3SIPLLF5CCXLWUB2Z6UBTYAW34KVXOLRQ5HDAZG4ZY7MHNBWJ1",
      ),
    ).toThrow();
    expect(() =>
      Keypair.fromSecret("masterpassphrasemasterpassphrase"),
    ).toThrow();
    expect(() =>
      Keypair.fromSecret("gsYRSEQhTffqA9opPepAENCr2WG6z5iBHHubxxbRzWaHf8FBWcu"),
    ).toThrow();
  });
});

describe("Keypair.fromRawEd25519Seed", () => {
  it("creates a keypair correctly", () => {
    const seed = "masterpassphrasemasterpassphrase";
    const kp = Keypair.fromRawEd25519Seed(seed as unknown as Buffer);

    expect(kp).toBeInstanceOf(Keypair);
    expect(kp.publicKey()).toEqual(
      "GAXDYNIBA5E4DXR5TJN522RRYESFQ5UNUXHIPTFGVLLD5O5K552DF5ZH",
    );
    expect(kp.secret()).toEqual(
      "SBWWC43UMVZHAYLTONYGQ4TBONSW2YLTORSXE4DBONZXA2DSMFZWLP2R",
    );
    expect(kp.rawPublicKey().toString("hex")).toEqual(
      "2e3c35010749c1de3d9a5bdd6a31c12458768da5ce87cca6aad63ebbaaef7432",
    );
  });

  it("throws an error if the arg isn't 32 bytes", () => {
    expect(() =>
      Keypair.fromRawEd25519Seed(
        "masterpassphrasemasterpassphras" as unknown as Buffer,
      ),
    ).toThrow();
    expect(() =>
      Keypair.fromRawEd25519Seed(
        "masterpassphrasemasterpassphrase1" as unknown as Buffer,
      ),
    ).toThrow();
    expect(() =>
      Keypair.fromRawEd25519Seed(null as unknown as Buffer),
    ).toThrow();
    expect(() =>
      Keypair.fromRawEd25519Seed(undefined as unknown as Buffer),
    ).toThrow();
  });
});

describe("Keypair.fromPublicKey", () => {
  it("creates a keypair correctly", () => {
    const kp = Keypair.fromPublicKey(
      "GAXDYNIBA5E4DXR5TJN522RRYESFQ5UNUXHIPTFGVLLD5O5K552DF5ZH",
    );
    expect(kp).toBeInstanceOf(Keypair);
    expect(kp.publicKey()).toEqual(
      "GAXDYNIBA5E4DXR5TJN522RRYESFQ5UNUXHIPTFGVLLD5O5K552DF5ZH",
    );
    expect(kp.rawPublicKey().toString("hex")).toEqual(
      "2e3c35010749c1de3d9a5bdd6a31c12458768da5ce87cca6aad63ebbaaef7432",
    );
  });

  it("throw an error if the arg isn't strkey encoded as a accountid", () => {
    expect(() => Keypair.fromPublicKey("hel0")).toThrow();
    expect(() =>
      Keypair.fromPublicKey("masterpassphrasemasterpassphrase"),
    ).toThrow();
    expect(() =>
      Keypair.fromPublicKey(
        "sfyjodTxbwLtRToZvi6yQ1KnpZriwTJ7n6nrASFR6goRviCU3Ff",
      ),
    ).toThrow();
  });

  it("throws an error if the address isn't 32 bytes", () => {
    expect(() =>
      Keypair.fromPublicKey("masterpassphrasemasterpassphrase"),
    ).toThrow();
    expect(() =>
      Keypair.fromPublicKey("masterpassphrasemasterpassphrase"),
    ).toThrow();
    expect(() => Keypair.fromPublicKey(null as unknown as string)).toThrow();
    expect(() =>
      Keypair.fromPublicKey(undefined as unknown as string),
    ).toThrow();
  });
});

describe("Keypair.random", () => {
  it("creates a keypair correctly", () => {
    const kp = Keypair.random();
    expect(kp).toBeInstanceOf(Keypair);
  });
});

describe("Keypair.xdrMuxedAccount", () => {
  it("returns a valid MuxedAccount with a Ed25519 key type", () => {
    const kp = Keypair.fromPublicKey(
      "GAXDYNIBA5E4DXR5TJN522RRYESFQ5UNUXHIPTFGVLLD5O5K552DF5ZH",
    );
    const muxed = kp.xdrMuxedAccount();
    expect(muxed).toBeInstanceOf(xdr.MuxedAccount);
    expect(muxed.switch()).toEqual(xdr.CryptoKeyType.keyTypeEd25519());
  });
});

describe("Keypair.sign*Decorated", () => {
  describe("returning the correct hints", () => {
    const secret = "SDVSYBKP7ESCODJSNGVDNXAJB63NPS5GQXSBZXLNT2Y4YVUJCFZWODGJ";
    const kp = Keypair.fromSecret(secret);

    // Note: these were generated using the Go SDK as a source of truth
    const CASES = [
      {
        data: [1, 2, 3, 4, 5, 6],
        regular: Buffer.from([8, 170, 203, 16]),
        payload: Buffer.from([11, 174, 206, 22]),
      },
      {
        data: [1, 2],
        regular: Buffer.from([8, 170, 203, 16]),
        payload: Buffer.from([9, 168, 203, 16]),
      },
      {
        data: [],
        regular: Buffer.from([8, 170, 203, 16]),
        payload: Buffer.from([8, 170, 203, 16]),
      },
    ];

    CASES.forEach((testCase) => {
      const data = testCase.data;
      const sig = kp.sign(data as unknown as Buffer);

      it(`signedPayloads#${data.length}`, () => {
        const expectedXdr = new xdr.DecoratedSignature({
          hint: testCase.payload,
          signature: sig,
        });

        const decoSig = kp.signPayloadDecorated(data as unknown as Buffer);
        expect(decoSig.toXDR("hex")).toEqual(expectedXdr.toXDR("hex"));
      });

      it(`regular#${data.length}`, () => {
        const expectedXdr = new xdr.DecoratedSignature({
          hint: testCase.regular,
          signature: sig,
        });

        const decoSig = kp.signDecorated(data as unknown as Buffer);
        expect(decoSig.toXDR("hex")).toEqual(expectedXdr.toXDR("hex"));
      });
    });
  });
});

// --- Additional coverage tests ---

describe("Keypair.constructor additional errors", () => {
  it("fails when type is not ed25519", () => {
    expect(
      () => new Keypair({ type: "rsa", publicKey: Buffer.alloc(32) } as any),
    ).toThrow(/Invalid keys type/);
  });

  it("fails when neither publicKey nor secretKey is provided", () => {
    expect(() => new Keypair({ type: "ed25519" } as any)).toThrow(
      /At least one of publicKey or secretKey must be provided/,
    );
  });
});

describe("Keypair.master", () => {
  it("creates a keypair from a network passphrase", () => {
    const kp = Keypair.master(Networks.TESTNET);
    expect(kp).toBeInstanceOf(Keypair);
    expect(kp.canSign()).toBe(true);
  });

  it("throws when no passphrase is provided", () => {
    expect(() => Keypair.master("" as string)).toThrow(/No network selected/);
  });
});

describe("Keypair public-key-only errors", () => {
  const kp = Keypair.fromPublicKey(
    "GAXDYNIBA5E4DXR5TJN522RRYESFQ5UNUXHIPTFGVLLD5O5K552DF5ZH",
  );

  it("secret() throws on public-key-only keypair", () => {
    expect(() => kp.secret()).toThrow(/no secret key available/);
  });

  it("rawSecretKey() throws on public-key-only keypair", () => {
    expect(() => kp.rawSecretKey()).toThrow(/no secret seed available/);
  });

  it("sign() throws on public-key-only keypair", () => {
    expect(() => kp.sign(Buffer.from("test"))).toThrow(
      /cannot sign: no secret key available/,
    );
  });
});

describe("Keypair.canSign", () => {
  it("returns true for a keypair with a secret key", () => {
    const kp = Keypair.fromSecret(
      "SD7X7LEHBNMUIKQGKPARG5TDJNBHKC346OUARHGZL5ITC6IJPXHILY36",
    );
    expect(kp.canSign()).toBe(true);
  });

  it("returns false for a public-key-only keypair", () => {
    const kp = Keypair.fromPublicKey(
      "GAXDYNIBA5E4DXR5TJN522RRYESFQ5UNUXHIPTFGVLLD5O5K552DF5ZH",
    );
    expect(kp.canSign()).toBe(false);
  });
});

describe("Keypair.verify", () => {
  it("returns true for a valid signature", () => {
    const kp = Keypair.fromSecret(
      "SD7X7LEHBNMUIKQGKPARG5TDJNBHKC346OUARHGZL5ITC6IJPXHILY36",
    );
    const data = Buffer.from("hello");
    const signature = kp.sign(data);
    expect(kp.verify(data, signature)).toBe(true);
  });

  it("returns false for an invalid signature", () => {
    const kp = Keypair.fromSecret(
      "SD7X7LEHBNMUIKQGKPARG5TDJNBHKC346OUARHGZL5ITC6IJPXHILY36",
    );
    const data = Buffer.from("hello");
    const signature = kp.sign(data);
    const firstByte = signature[0];

    if (firstByte === undefined) {
      throw new Error("signature is empty");
    }

    signature[0] = firstByte ^ 0xff; // corrupt the signature
    expect(kp.verify(data, signature)).toBe(false);
  });

  it("can verify using a public-key-only keypair", () => {
    const signingKp = Keypair.fromSecret(
      "SD7X7LEHBNMUIKQGKPARG5TDJNBHKC346OUARHGZL5ITC6IJPXHILY36",
    );
    const verifyKp = Keypair.fromPublicKey(signingKp.publicKey());
    const data = Buffer.from("hello");
    const signature = signingKp.sign(data);
    expect(verifyKp.verify(data, signature)).toBe(true);
  });
});

describe("Keypair.xdrMuxedAccount with id", () => {
  it("returns a MuxedAccount with keyTypeMuxedEd25519 when id is provided", () => {
    const kp = Keypair.fromPublicKey(
      "GAXDYNIBA5E4DXR5TJN522RRYESFQ5UNUXHIPTFGVLLD5O5K552DF5ZH",
    );
    const muxed = kp.xdrMuxedAccount("12345");
    expect(muxed).toBeInstanceOf(xdr.MuxedAccount);
    expect(muxed.switch()).toEqual(xdr.CryptoKeyType.keyTypeMuxedEd25519());
  });

  it("throws TypeError when id is not a string", () => {
    const kp = Keypair.fromPublicKey(
      "GAXDYNIBA5E4DXR5TJN522RRYESFQ5UNUXHIPTFGVLLD5O5K552DF5ZH",
    );
    expect(() => kp.xdrMuxedAccount(12345 as unknown as string)).toThrow(
      /expected string for ID/,
    );
  });
});

describe("Keypair.xdrAccountId", () => {
  it("returns a valid PublicKey XDR", () => {
    const kp = Keypair.fromPublicKey(
      "GAXDYNIBA5E4DXR5TJN522RRYESFQ5UNUXHIPTFGVLLD5O5K552DF5ZH",
    );
    const accountId = kp.xdrAccountId();
    expect(accountId).toBeInstanceOf(xdr.PublicKey);
    expect(accountId.switch()).toEqual(
      xdr.PublicKeyType.publicKeyTypeEd25519(),
    );
  });
});

describe("Keypair.xdrPublicKey", () => {
  it("returns a valid PublicKey XDR", () => {
    const kp = Keypair.fromPublicKey(
      "GAXDYNIBA5E4DXR5TJN522RRYESFQ5UNUXHIPTFGVLLD5O5K552DF5ZH",
    );
    const pubKey = kp.xdrPublicKey();
    expect(pubKey).toBeInstanceOf(xdr.PublicKey);
    expect(pubKey.switch()).toEqual(xdr.PublicKeyType.publicKeyTypeEd25519());
  });
});

describe("Keypair.signatureHint", () => {
  it("returns the last 4 bytes of the account ID XDR", () => {
    const kp = Keypair.fromPublicKey(
      "GAXDYNIBA5E4DXR5TJN522RRYESFQ5UNUXHIPTFGVLLD5O5K552DF5ZH",
    );
    const hint = kp.signatureHint();
    expect(hint).toBeInstanceOf(Buffer);
    expect(hint.length).toBe(4);

    // Verify hint matches the last 4 bytes of the XDR account ID
    const accountIdXdr = kp.xdrAccountId().toXDR();
    expect(hint).toEqual(accountIdXdr.subarray(accountIdXdr.length - 4));
  });
});
