import { describe, it, expect, afterEach, vi } from "vitest";
import {
  authorizeEntry,
  authorizeInvocation,
  SigningCallback,
} from "../../../src/base/auth.js";
import { Keypair } from "../../../src/base/keypair.js";
import { Address } from "../../../src/base/address.js";
import { StrKey } from "../../../src/base/strkey.js";
import { hash } from "../../../src/base/hashing.js";
import { scValToNative } from "../../../src/base/scval.js";
import { expectDefined } from "./support/expect_defined.js";
import { Networks } from "../../../src/base/network.js";
import xdr from "../../../src/base/xdr.js";

describe("building authorization entries", () => {
  const kp = Keypair.random();
  const contractId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";

  const authEntry = {
    rootInvocation: {
      function:
        xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn({
          contractAddress: new Address(contractId).toScAddress(),
          functionName: "hello",
          args: [xdr.ScVal.scvU64(BigInt(1234n))],
        }),
      subInvocations: [],
    },
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress({
      address: new Address(kp.publicKey()).toScAddress(),
      nonce: BigInt(123456789101112n),
      signatureExpirationLedger: 0,
      signature: xdr.ScVal.scvVec([]),
    }),
  };

  it("builds a mock entry correctly", () => {
    expect(() => xdr.SorobanAuthorizationEntry.toXDR(authEntry)).not.toThrow();
  });

  describe("authorizeEntry", () => {
    it("signs the entry correctly with a Keypair", async () => {
      const signedEntry = await authorizeEntry(
        authEntry,
        kp,
        10,
        Networks.TESTNET,
      );

      expect(
        xdr.SorobanAuthorizedInvocation.toXDR(signedEntry.rootInvocation),
      ).toEqual(
        xdr.SorobanAuthorizedInvocation.toXDR(authEntry.rootInvocation),
      );
      if (signedEntry.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanCredentialsAddress");
      }
      if (authEntry.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanAddressCredentials");
      }
      const signedAddr = signedEntry.credentials.address;
      const entryAddr = authEntry.credentials.address;
      expect(signedAddr.signatureExpirationLedger).toBe(10);
      expect(xdr.ScAddress.toXDR(signedAddr.address, "base64")).toEqual(
        xdr.ScAddress.toXDR(entryAddr.address, "base64"),
      );
      expect(signedAddr.nonce).toBe(entryAddr.nonce);

      if (signedAddr.signature.type !== "scvVec") {
        throw new Error("Expected signature to be scvVec");
      }
      const sigArgs = expectDefined(signedAddr.signature.vec).map((v) =>
        scValToNative(v),
      );
      expect(sigArgs).toHaveLength(1);

      const sig = sigArgs[0] as { public_key: Buffer; signature: Buffer };
      expect(sig).toHaveProperty("public_key");
      expect(sig).toHaveProperty("signature");
      expect(StrKey.encodeEd25519PublicKey(sig.public_key)).toBe(
        kp.publicKey(),
      );
    });

    it("signs the entry correctly with a callback", async () => {
      const callback: SigningCallback = async (preimage) =>
        kp.sign(hash(Buffer.from(xdr.HashIdPreimage.toXDR(preimage))));

      const signedEntry = await authorizeEntry(
        authEntry,
        callback,
        10,
        Networks.TESTNET,
      );
      if (signedEntry.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanCredentialsAddress");
      }
      const signedAddr = signedEntry.credentials.address;
      expect(signedAddr.signatureExpirationLedger).toBe(10);
      if (signedAddr.signature.type !== "scvVec") {
        throw new Error("Expected signature to be scvVec");
      }
      const sigArgs = expectDefined(signedAddr.signature.vec).map((v) =>
        scValToNative(v),
      );
      expect(sigArgs).toHaveLength(1);

      const sig = sigArgs[0] as { public_key: Buffer; signature: Buffer };
      expect(StrKey.encodeEd25519PublicKey(sig.public_key)).toBe(
        kp.publicKey(),
      );
    });

    it("signs the entry correctly with a callback returning an object", async () => {
      const callback: SigningCallback = async (preimage) => ({
        signature: kp.sign(
          hash(Buffer.from(xdr.HashIdPreimage.toXDR(preimage))),
        ),
        publicKey: kp.publicKey(),
      });

      const signedEntry = await authorizeEntry(
        authEntry,
        callback,
        10,
        Networks.TESTNET,
      );

      if (signedEntry.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanCredentialsAddress");
      }
      const signedAddr = signedEntry.credentials.address;
      expect(signedAddr.signatureExpirationLedger).toBe(10);
      if (signedAddr.signature.type !== "scvVec") {
        throw new Error("Expected signature to be scvVec");
      }
      const sigArgs = expectDefined(signedAddr.signature.vec).map((v) =>
        scValToNative(v),
      );
      expect(sigArgs).toHaveLength(1);

      const sig = sigArgs[0] as { public_key: Buffer; signature: Buffer };
      expect(StrKey.encodeEd25519PublicKey(sig.public_key)).toBe(
        kp.publicKey(),
      );
    });

    it("returns entry unchanged for source account credentials (no-op)", async () => {
      const sourceAccountEntry = {
        rootInvocation: authEntry.rootInvocation,
        credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
      };

      const result = await authorizeEntry(
        sourceAccountEntry,
        kp,
        10,
        Networks.TESTNET,
      );
      expect(xdr.SorobanAuthorizationEntry.toXDR(result)).toEqual(
        xdr.SorobanAuthorizationEntry.toXDR(sourceAccountEntry),
      );
    });

    it("succeeds with a different signer (signs with the given keypair)", async () => {
      // When a random keypair is passed, it signs with its own key and the
      // verification still passes because Keypair.verify uses the signer's
      // own publicKey — the function does NOT enforce that the signer matches
      // the entry's credential address.
      const randomKp = Keypair.random();

      // Build an entry whose credential address matches randomKp
      const entryForRandom = {
        rootInvocation: authEntry.rootInvocation,
        credentials: xdr.SorobanCredentials.sorobanCredentialsAddress({
          address: new Address(randomKp.publicKey()).toScAddress(),
          nonce: BigInt(123456789101112n),
          signatureExpirationLedger: 0,
          signature: xdr.ScVal.scvVec([]),
        }),
      };

      const signed = await authorizeEntry(
        entryForRandom,
        randomKp,
        10,
        Networks.TESTNET,
      );
      if (signed.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanCredentialsAddress");
      }
      expect(signed.credentials.address.signatureExpirationLedger).toBe(10);
    });

    it("throws when signature verification fails", async () => {
      // Use a callback that returns a valid-looking signature from a
      // different key, paired with the entry's publicKey — verification
      // will fail because the signature doesn't match.
      const wrongKp = Keypair.random();
      const badCallback: SigningCallback = async (preimage) => ({
        signature: wrongKp.sign(
          hash(Buffer.from(xdr.HashIdPreimage.toXDR(preimage))),
        ),
        publicKey: kp.publicKey(), // claims to be kp but signed with wrongKp
      });

      await expect(
        authorizeEntry(authEntry, badCallback, 10, Networks.TESTNET),
      ).rejects.toThrow(/signature doesn't match payload/);
    });

    it("throws with a bad signature from a callback", async () => {
      const badCallback: SigningCallback = async () => ({
        signature: Buffer.from("bad-signature-data"),
        publicKey: kp.publicKey(),
      });

      await expect(
        authorizeEntry(authEntry, badCallback, 10, Networks.TESTNET),
      ).rejects.toThrow(/signature doesn't match payload/);
    });

    it("produces different signatures for different networks", async () => {
      const signedTestnet = await authorizeEntry(
        authEntry,
        kp,
        10,
        Networks.TESTNET,
      );
      const signedPublic = await authorizeEntry(
        authEntry,
        kp,
        10,
        Networks.PUBLIC,
      );
      if (signedTestnet.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanCredentialsAddress");
      }
      const sigTestnet = xdr.ScVal.toXDR(
        signedTestnet.credentials.address.signature,
        "hex",
      );
      if (signedPublic.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanCredentialsAddress");
      }
      const sigPublic = xdr.ScVal.toXDR(
        signedPublic.credentials.address.signature,
        "hex",
      );

      expect(sigTestnet).not.toBe(sigPublic);
    });
  });

  describe("authorizeInvocation", () => {
    it("can build from scratch with a Keypair", async () => {
      const signedEntry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation,
        networkPassphrase: Networks.TESTNET,
      });

      expect(
        xdr.SorobanAuthorizedInvocation.toXDR(signedEntry.rootInvocation),
      ).toEqual(
        xdr.SorobanAuthorizedInvocation.toXDR(authEntry.rootInvocation),
      );
      if (signedEntry.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanCredentialsAddress");
      }
      const signedAddr = signedEntry.credentials.address;
      expect(signedAddr.signatureExpirationLedger).toBe(10);

      const addrStr = Address.fromScAddress(signedAddr.address).toString();
      expect(addrStr).toBe(kp.publicKey());
    });

    it("can build from scratch with explicit publicKey", async () => {
      const callback: SigningCallback = async (preimage) => ({
        signature: kp.sign(
          hash(Buffer.from(xdr.HashIdPreimage.toXDR(preimage))),
        ),
        publicKey: kp.publicKey(),
      });

      const signedEntry = await authorizeInvocation({
        signer: callback,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation,
        networkPassphrase: Networks.TESTNET,
        publicKey: kp.publicKey(),
      });
      if (signedEntry.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanCredentialsAddress");
      }
      const signedAddr = signedEntry.credentials.address;
      expect(signedAddr.signatureExpirationLedger).toBe(10);

      const addrStr = Address.fromScAddress(signedAddr.address).toString();
      expect(addrStr).toBe(kp.publicKey());
    });

    it("throws when signer has no publicKey method and none provided", () => {
      const callback: SigningCallback = async (preimage) =>
        kp.sign(hash(Buffer.from(xdr.HashIdPreimage.toXDR(preimage))));

      // When called with a non-Keypair signer and no explicit publicKey, the
      // implementation throws Error("authorizeInvocation requires publicKey parameter").
      expect(() =>
        authorizeInvocation({
          signer: callback,
          validUntilLedgerSeq: 10,
          invocation: authEntry.rootInvocation,
          networkPassphrase: Networks.TESTNET,
        }),
      ).toThrow("authorizeInvocation requires publicKey parameter");
    });
  });

  describe("nonce generation uses all 8 bytes", () => {
    function stubRawBytes(first8: number[]): void {
      const raw = new Uint8Array(first8.length);
      raw.set(first8);
      vi.spyOn(Keypair, "random").mockReturnValue({
        rawPublicKey: () => raw,
      } as unknown as Keypair);
    }

    afterEach(() => {
      vi.restoreAllMocks();
    });

    // Regression: the old `<<` (Int32 shift) implementation discarded the upper 4
    // bytes. bytes [0,0,0,1, 0,0,0,0] — after consuming bytes 0-3 the accumulator
    // reaches 1, then four more left-shifts overflow Int32 back to 0. The nonce was
    // 0 instead of the correct 2^32.
    it("upper 4 bytes contribute to the nonce", async () => {
      stubRawBytes([0, 0, 0, 1, 0, 0, 0, 0]);
      const entry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation,
        networkPassphrase: Networks.TESTNET,
      });
      if (entry.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanCredentialsAddress");
      }
      const addr = entry.credentials.address;
      expect(addr.nonce).toBe(4294967296n); // 2^32
    });

    it("all-0xFF bytes produce nonce -1 (signed Int64 all-bits-set)", async () => {
      stubRawBytes([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
      const entry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation,
        networkPassphrase: Networks.TESTNET,
      });
      if (entry.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanCredentialsAddress");
      }
      const addr = entry.credentials.address;
      expect(addr.nonce).toBe(-1n);
    });

    it("high bit set produces Int64 minimum value", async () => {
      stubRawBytes([0x80, 0, 0, 0, 0, 0, 0, 0]);
      const entry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation,
        networkPassphrase: Networks.TESTNET,
      });
      if (entry.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanCredentialsAddress");
      }
      const addr = entry.credentials.address;
      expect(addr.nonce).toBe(-9223372036854775808n); // -(2^63), Int64 minimum
    });

    it("all-zero bytes produce nonce 0", async () => {
      stubRawBytes([0, 0, 0, 0, 0, 0, 0, 0]);
      const entry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation,
        networkPassphrase: Networks.TESTNET,
      });
      if (entry.credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected sorobanCredentialsAddress");
      }
      const addr = entry.credentials.address;
      expect(addr.nonce).toBe(0n);
    });

    it("throws if fewer than 8 bytes are available", () => {
      stubRawBytes([0, 0, 0]); // only 3 bytes

      expect(() =>
        authorizeInvocation({
          signer: kp,
          validUntilLedgerSeq: 10,
          invocation: authEntry.rootInvocation,
          networkPassphrase: Networks.TESTNET,
        }),
      ).toThrow(/need at least 8 bytes to convert to Int64, got 3/);
    });
  });
});
