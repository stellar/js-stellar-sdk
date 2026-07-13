import { describe, it, expect, afterEach, vi } from "vitest";
import {
  authorizeEntry,
  authorizeInvocation,
  buildAuthorizationEntryPreimage,
  buildWithDelegatesEntry,
  SigningCallback,
} from "../../../src/base/auth.js";
import { Keypair } from "../../../src/base/keypair.js";
import { Address } from "../../../src/base/address.js";
import { StrKey } from "../../../src/base/strkey.js";
import { hash } from "../../../src/base/hashing.js";
import { scValToNative } from "../../../src/base/scval.js";
import { expectDefined } from "./support/expect_defined.js";
import { Networks } from "../../../src/base/network.js";
import { expectUnionVariant } from "../../../src/xdr/index.js";
import * as xdr from "../../../src/xdr/index.js";

describe("building authorization entries", () => {
  const kp = Keypair.random();
  const contractId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";

  const authEntry = new xdr.SorobanAuthorizationEntry({
    rootInvocation: new xdr.SorobanAuthorizedInvocation({
      function:
        xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
          new xdr.InvokeContractArgs({
            contractAddress: new Address(contractId).toScAddress(),
            functionName: "hello",
            args: [xdr.ScVal.scvU64(1234n)],
          }),
        ),
      subInvocations: [],
    }),
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
      new xdr.SorobanAddressCredentials({
        address: new Address(kp.publicKey()).toScAddress(),
        nonce: 123456789101112n,
        signatureExpirationLedger: 0,
        signature: xdr.ScVal.scvVec([]),
      }),
    ),
  });

  it("builds a mock entry correctly", () => {
    expect(() => authEntry.toXdr()).not.toThrow();
  });

  describe("authorizeEntry", () => {
    it("signs the entry correctly with a Keypair", async () => {
      const signedEntry = await authorizeEntry(
        authEntry,
        kp,
        10,
        Networks.TESTNET,
      );

      expect(signedEntry.rootInvocation.toXdr()).toEqual(
        authEntry.rootInvocation.toXdr(),
      );

      const signedAddr = (
        signedEntry.credentials as xdr.SorobanCredentialsAddress
      ).value;
      const entryAddr = (authEntry.credentials as xdr.SorobanCredentialsAddress)
        .value;
      expect(signedAddr.signatureExpirationLedger).toBe(10);
      expect(signedAddr.address.toXdr()).toEqual(entryAddr.address.toXdr());
      expect(signedAddr.nonce).toBe(entryAddr.nonce);

      const sigArgs = expectDefined(
        (signedAddr.signature as xdr.ScValVec).vec,
      ).map((v) => scValToNative(v));
      expect(sigArgs).toHaveLength(1);

      const sig = sigArgs[0] as { public_key: Buffer; signature: Buffer };
      expect(sig).toHaveProperty("public_key");
      expect(sig).toHaveProperty("signature");
      expect(StrKey.encodeEd25519PublicKey(sig.public_key)).toBe(
        kp.publicKey(),
      );
    });

    it("signs the entry correctly with a callback", async () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      const callback: SigningCallback = async (preimage) =>
        kp.sign(hash(Buffer.from(preimage.toXdr())));

      const signedEntry = await authorizeEntry(
        authEntry,
        callback,
        10,
        Networks.TESTNET,
      );

      const signedAddr = (
        signedEntry.credentials as xdr.SorobanCredentialsAddress
      ).value;
      expect(signedAddr.signatureExpirationLedger).toBe(10);

      const sigArgs = expectDefined(
        (signedAddr.signature as xdr.ScValVec).vec,
      ).map((v) => scValToNative(v));
      expect(sigArgs).toHaveLength(1);

      const sig = sigArgs[0] as { public_key: Buffer; signature: Buffer };
      expect(StrKey.encodeEd25519PublicKey(sig.public_key)).toBe(
        kp.publicKey(),
      );
    });

    it("signs the entry correctly with a callback returning an object", async () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      const callback: SigningCallback = async (preimage) => ({
        signature: kp.sign(hash(Buffer.from(preimage.toXdr()))),
        publicKey: kp.publicKey(),
      });

      const signedEntry = await authorizeEntry(
        authEntry,
        callback,
        10,
        Networks.TESTNET,
      );

      const signedAddr = (
        signedEntry.credentials as xdr.SorobanCredentialsAddress
      ).value;
      expect(signedAddr.signatureExpirationLedger).toBe(10);

      const sigArgs = expectDefined(
        (signedAddr.signature as xdr.ScValVec).vec,
      ).map((v) => scValToNative(v));
      expect(sigArgs).toHaveLength(1);

      const sig = sigArgs[0] as { public_key: Buffer; signature: Buffer };
      expect(StrKey.encodeEd25519PublicKey(sig.public_key)).toBe(
        kp.publicKey(),
      );
    });

    it("invokes the signing callback", async () => {
      // the callback only records that it ran; the assertion lives in the test
      // body (after the await), never inside the callback
      let invoked = false;
      await authorizeEntry(
        authEntry,
        // eslint-disable-next-line @typescript-eslint/require-await
        async (preimage) => {
          invoked = true;
          return kp.sign(hash(Buffer.from(preimage.toXdr())));
        },
        10,
        Networks.TESTNET,
      );

      expect(invoked).toBe(true);
    });

    it("returns entry unchanged for source account credentials (no-op)", async () => {
      const sourceAccountEntry = new xdr.SorobanAuthorizationEntry({
        rootInvocation: authEntry.rootInvocation,
        credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
      });

      const result = await authorizeEntry(
        sourceAccountEntry,
        kp,
        10,
        Networks.TESTNET,
      );
      expect(result.toXdr()).toEqual(sourceAccountEntry.toXdr());
    });

    it("succeeds with a different signer (signs with the given keypair)", async () => {
      // When a random keypair is passed, it signs with its own key and the
      // verification still passes because Keypair.verify uses the signer's
      // own publicKey — the function does NOT enforce that the signer matches
      // the entry's credential address.
      const randomKp = Keypair.random();

      // Build an entry whose credential address matches randomKp
      const entryForRandom = new xdr.SorobanAuthorizationEntry({
        rootInvocation: authEntry.rootInvocation,
        credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
          new xdr.SorobanAddressCredentials({
            address: new Address(randomKp.publicKey()).toScAddress(),
            nonce: 123456789101112n,
            signatureExpirationLedger: 0,
            signature: xdr.ScVal.scvVec([]),
          }),
        ),
      });

      const signed = await authorizeEntry(
        entryForRandom,
        randomKp,
        10,
        Networks.TESTNET,
      );
      expect(
        (signed.credentials as xdr.SorobanCredentialsAddress).value
          .signatureExpirationLedger,
      ).toBe(10);
    });

    it("throws when signature verification fails", async () => {
      // Use a callback that returns a valid-looking signature from a
      // different key, paired with the entry's publicKey — verification
      // will fail because the signature doesn't match.
      const wrongKp = Keypair.random();
      // eslint-disable-next-line @typescript-eslint/require-await
      const badCallback: SigningCallback = async (preimage) => ({
        signature: wrongKp.sign(hash(Buffer.from(preimage.toXdr()))),
        publicKey: kp.publicKey(), // claims to be kp but signed with wrongKp
      });

      await expect(
        authorizeEntry(authEntry, badCallback, 10, Networks.TESTNET),
      ).rejects.toThrow(/signature doesn't match payload/);
    });

    it("throws with a bad signature from a callback", async () => {
      // eslint-disable-next-line @typescript-eslint/require-await
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

      const sigTestnet = (
        signedTestnet.credentials as xdr.SorobanCredentialsAddress
      ).value.signature.toXdr("hex");
      const sigPublic = (
        signedPublic.credentials as xdr.SorobanCredentialsAddress
      ).value.signature.toXdr("hex");

      expect(sigTestnet).not.toBe(sigPublic);
    });
  });

  describe("credential type switching", () => {
    const EXPIRATION = 4242;
    const NONCE = 987654321n;

    function makeAddrCreds(): xdr.SorobanAddressCredentials {
      return new xdr.SorobanAddressCredentials({
        address: new Address(kp.publicKey()).toScAddress(),
        nonce: NONCE,
        signatureExpirationLedger: 0,
        signature: xdr.ScVal.scvVec([]),
      });
    }

    function entryWith(
      credentials: xdr.SorobanCredentials,
    ): xdr.SorobanAuthorizationEntry {
      return new xdr.SorobanAuthorizationEntry({
        rootInvocation: authEntry.rootInvocation,
        credentials,
      });
    }

    // Captures the preimage handed to the signer so we can assert which
    // HashIdPreimage variant authorizeEntry built (and what it committed to).
    function capturingSigner(capture: {
      preimage?: xdr.HashIdPreimage;
    }): SigningCallback {
      // eslint-disable-next-line @typescript-eslint/require-await
      return async (preimage) => {
        capture.preimage = preimage;
        return kp.sign(hash(Buffer.from(preimage.toXdr())));
      };
    }

    const expectedNetworkId = (passphrase: string) =>
      hash(Buffer.from(passphrase)).toString("hex");

    it("ADDRESS switches to the non-address-bound preimage", async () => {
      const capture: { preimage?: xdr.HashIdPreimage } = {};
      const signed = await authorizeEntry(
        entryWith(
          xdr.SorobanCredentials.sorobanCredentialsAddress(makeAddrCreds()),
        ),
        capturingSigner(capture),
        EXPIRATION,
        Networks.TESTNET,
      );

      const preimage = expectDefined(capture.preimage);
      expect(preimage.type).toBe("envelopeTypeSorobanAuthorization");

      const inner = (preimage as xdr.HashIdPreimageSorobanAuthorizationArm)
        .value;
      expect(inner.signatureExpirationLedger).toBe(EXPIRATION);
      expect(inner.nonce).toBe(NONCE);
      expect(inner.networkId.toXdr("hex")).toBe(
        expectedNetworkId(Networks.TESTNET),
      );

      // the signature + expiration land on the ADDRESS arm
      const addr = (signed.credentials as xdr.SorobanCredentialsAddress).value;
      expect(addr.signatureExpirationLedger).toBe(EXPIRATION);
      expect(addr.signature.type).toBe("scvVec");
    });

    it("ADDRESS_V2 switches to the address-bound preimage", async () => {
      const capture: { preimage?: xdr.HashIdPreimage } = {};
      const signed = await authorizeEntry(
        entryWith(
          xdr.SorobanCredentials.sorobanCredentialsAddressV2(makeAddrCreds()),
        ),
        capturingSigner(capture),
        EXPIRATION,
        Networks.TESTNET,
      );

      const preimage = expectDefined(capture.preimage);
      expect(preimage.type).toBe("envelopeTypeSorobanAuthorizationWithAddress");

      const inner = (
        preimage as xdr.HashIdPreimageSorobanAuthorizationWithAddressArm
      ).value;
      expect(inner.signatureExpirationLedger).toBe(EXPIRATION);
      expect(inner.nonce).toBe(NONCE);
      expect(inner.networkId.toXdr("hex")).toBe(
        expectedNetworkId(Networks.TESTNET),
      );
      // the address is bound into the signed payload
      expect(inner.address.toXdr()).toEqual(
        new Address(kp.publicKey()).toScAddress().toXdr(),
      );

      const addr = (signed.credentials as xdr.SorobanCredentialsAddressV2)
        .value;
      expect(addr.signatureExpirationLedger).toBe(EXPIRATION);
      expect(addr.signature.type).toBe("scvVec");
    });

    it("ADDRESS_WITH_DELEGATES uses the address-bound preimage and signs the inner credentials", async () => {
      const capture: { preimage?: xdr.HashIdPreimage } = {};
      const signed = await authorizeEntry(
        entryWith(
          xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
            new xdr.SorobanAddressCredentialsWithDelegates({
              addressCredentials: makeAddrCreds(),
              delegates: [],
            }),
          ),
        ),
        capturingSigner(capture),
        EXPIRATION,
        Networks.TESTNET,
      );

      const preimage = expectDefined(capture.preimage);
      expect(preimage.type).toBe("envelopeTypeSorobanAuthorizationWithAddress");

      const inner = (
        preimage as xdr.HashIdPreimageSorobanAuthorizationWithAddressArm
      ).value;
      expect(inner.signatureExpirationLedger).toBe(EXPIRATION);
      expect(inner.address.toXdr()).toEqual(
        new Address(kp.publicKey()).toScAddress().toXdr(),
      );

      // the signature + expiration land on the wrapped addressCredentials
      const wrapped = (
        signed.credentials as xdr.SorobanCredentialsAddressWithDelegates
      ).value;
      expect(wrapped.addressCredentials.signatureExpirationLedger).toBe(
        EXPIRATION,
      );
      expect(wrapped.addressCredentials.signature.type).toBe("scvVec");
      // the (empty) delegate set is preserved
      expect(wrapped.delegates).toHaveLength(0);
    });

    it("ADDRESS_WITH_DELEGATES fills the matching delegate node, binding the payload to the top-level address", async () => {
      const delegate = Keypair.random();
      const capture: { preimage?: xdr.HashIdPreimage } = {};
      // eslint-disable-next-line @typescript-eslint/require-await
      const signer: SigningCallback = async (preimage) => {
        capture.preimage = preimage;
        return {
          signature: delegate.sign(hash(Buffer.from(preimage.toXdr()))),
          publicKey: delegate.publicKey(),
        };
      };

      const signed = await authorizeEntry(
        entryWith(
          xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
            new xdr.SorobanAddressCredentialsWithDelegates({
              addressCredentials: makeAddrCreds(),
              delegates: [
                new xdr.SorobanDelegateSignature({
                  address: new Address(delegate.publicKey()).toScAddress(),
                  signature: xdr.ScVal.scvVoid(),
                  nestedDelegates: [],
                }),
              ],
            }),
          ),
        ),
        signer,
        EXPIRATION,
        Networks.TESTNET,
        delegate.publicKey(),
      );

      // the signed payload is bound to the *top-level* address, not the
      // delegate's (CAP-71-01: the payload is shared across all signers)
      const preimage = expectDefined(capture.preimage);
      expect(
        (
          preimage as xdr.HashIdPreimageSorobanAuthorizationWithAddressArm
        ).value.address.toXdr(),
      ).toEqual(new Address(kp.publicKey()).toScAddress().toXdr());

      const wrapped = (
        signed.credentials as xdr.SorobanCredentialsAddressWithDelegates
      ).value;
      // the top-level signature is left untouched (still the placeholder)
      expect(wrapped.addressCredentials.signature.type).toBe("scvVec");
      expect(
        expectDefined(
          (wrapped.addressCredentials.signature as xdr.ScValVec).vec,
        ),
      ).toHaveLength(0);
      // the delegate's node now carries the signature, attributed to the
      // delegate's key
      const signedDelegate = wrapped.delegates[0];
      expect(signedDelegate.signature.type).toBe("scvVec");
      const sigArgs = expectDefined(
        (signedDelegate.signature as xdr.ScValVec).vec,
      ).map((v) => scValToNative(v));
      const sig = sigArgs[0] as { public_key: Buffer; signature: Buffer };
      expect(StrKey.encodeEd25519PublicKey(sig.public_key)).toBe(
        delegate.publicKey(),
      );
    });

    it("throws when forAddress matches no node in the entry", async () => {
      const stranger = Keypair.random();
      await expect(
        authorizeEntry(
          entryWith(
            xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
              new xdr.SorobanAddressCredentialsWithDelegates({
                addressCredentials: makeAddrCreds(),
                delegates: [],
              }),
            ),
          ),
          kp,
          EXPIRATION,
          Networks.TESTNET,
          stranger.publicKey(),
        ),
      ).rejects.toThrow(/no credential node for address/);
    });

    it("commits the expiration ledger into the signed payload (not the original)", async () => {
      // Regression: the preimage must be built *after* the expiration is
      // updated, otherwise the signature commits to the stale expiration (0)
      // and the network rejects it.
      const capture: { preimage?: xdr.HashIdPreimage } = {};
      await authorizeEntry(
        entryWith(
          xdr.SorobanCredentials.sorobanCredentialsAddress(makeAddrCreds()),
        ),
        capturingSigner(capture),
        EXPIRATION,
        Networks.TESTNET,
      );

      expect(
        (
          expectDefined(
            capture.preimage,
          ) as xdr.HashIdPreimageSorobanAuthorizationArm
        ).value.signatureExpirationLedger,
      ).toBe(EXPIRATION);
    });

    it("ADDRESS and ADDRESS_V2 produce different payloads for the same invocation", async () => {
      const legacy: { preimage?: xdr.HashIdPreimage } = {};
      const v2: { preimage?: xdr.HashIdPreimage } = {};

      await authorizeEntry(
        entryWith(
          xdr.SorobanCredentials.sorobanCredentialsAddress(makeAddrCreds()),
        ),
        capturingSigner(legacy),
        EXPIRATION,
        Networks.TESTNET,
      );
      await authorizeEntry(
        entryWith(
          xdr.SorobanCredentials.sorobanCredentialsAddressV2(makeAddrCreds()),
        ),
        capturingSigner(v2),
        EXPIRATION,
        Networks.TESTNET,
      );

      // address-binding changes the signed payload
      expect(expectDefined(legacy.preimage).toXdr("hex")).not.toBe(
        expectDefined(v2.preimage).toXdr("hex"),
      );
    });

    it("infers the public key from the V2 address arm on the naked-signature path", async () => {
      // The backwards-compat (naked signature) path derives the public key
      // from the entry's address; this exercises addrAuth.address on the V2
      // arm rather than the legacy ADDRESS arm.
      const signed = await authorizeEntry(
        entryWith(
          xdr.SorobanCredentials.sorobanCredentialsAddressV2(makeAddrCreds()),
        ),
        // eslint-disable-next-line @typescript-eslint/require-await
        async (preimage) => kp.sign(hash(Buffer.from(preimage.toXdr()))),
        EXPIRATION,
        Networks.TESTNET,
      );

      const sigArgs = expectDefined(
        (
          (signed.credentials as xdr.SorobanCredentialsAddressV2).value
            .signature as xdr.ScValVec
        ).vec,
      ).map((v) => scValToNative(v));
      const sig = sigArgs[0] as { public_key: Buffer; signature: Buffer };
      expect(StrKey.encodeEd25519PublicKey(sig.public_key)).toBe(
        kp.publicKey(),
      );
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

      expect(signedEntry.rootInvocation.toXdr()).toEqual(
        authEntry.rootInvocation.toXdr(),
      );

      // authorizeInvocation defaults to legacy SOROBAN_CREDENTIALS_ADDRESS
      // entries (CAP-71 V2 is opt-in via `authV2`).
      expect(signedEntry.credentials.type).toBe("sorobanCredentialsAddress");
      const signedAddr = (
        signedEntry.credentials as xdr.SorobanCredentialsAddress
      ).value;
      expect(signedAddr.signatureExpirationLedger).toBe(10);

      const addrStr = Address.fromScAddress(signedAddr.address).toString();
      expect(addrStr).toBe(kp.publicKey());
    });

    it("can build from scratch with explicit publicKey", async () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      const callback: SigningCallback = async (preimage) => ({
        signature: kp.sign(hash(Buffer.from(preimage.toXdr()))),
        publicKey: kp.publicKey(),
      });

      const signedEntry = await authorizeInvocation({
        signer: callback,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation,
        networkPassphrase: Networks.TESTNET,
        publicKey: kp.publicKey(),
      });

      expect(signedEntry.credentials.type).toBe("sorobanCredentialsAddress");
      const signedAddr = (
        signedEntry.credentials as xdr.SorobanCredentialsAddress
      ).value;
      expect(signedAddr.signatureExpirationLedger).toBe(10);

      const addrStr = Address.fromScAddress(signedAddr.address).toString();
      expect(addrStr).toBe(kp.publicKey());
    });

    it("builds SOROBAN_CREDENTIALS_ADDRESS_V2 entries when authV2 is set", async () => {
      const signedEntry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation,
        networkPassphrase: Networks.TESTNET,
        authV2: true,
      });

      expect(signedEntry.credentials.type).toBe("sorobanCredentialsAddressV2");
      const signedAddr = (
        signedEntry.credentials as xdr.SorobanCredentialsAddressV2
      ).value;
      expect(signedAddr.signatureExpirationLedger).toBe(10);

      const addrStr = Address.fromScAddress(signedAddr.address).toString();
      expect(addrStr).toBe(kp.publicKey());
    });

    it("throws when signer has no publicKey method and none provided", () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      const callback: SigningCallback = async (preimage) =>
        kp.sign(hash(Buffer.from(preimage.toXdr())));

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
      const credentials = expectUnionVariant(
        entry.credentials,
        "sorobanCredentialsAddress",
      );
      expect(credentials.address.nonce).toBe(4294967296n); // 2^32
    });

    it("all-0xFF bytes produce nonce -1 (signed Int64 all-bits-set)", async () => {
      stubRawBytes([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
      const entry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation,
        networkPassphrase: Networks.TESTNET,
      });
      const credentials = expectUnionVariant(
        entry.credentials,
        "sorobanCredentialsAddress",
      );
      expect(credentials.address.nonce).toBe(-1n);
    });

    it("high bit set produces Int64 minimum value", async () => {
      stubRawBytes([0x80, 0, 0, 0, 0, 0, 0, 0]);
      const entry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation,
        networkPassphrase: Networks.TESTNET,
      });
      const credentials = expectUnionVariant(
        entry.credentials,
        "sorobanCredentialsAddress",
      );
      expect(credentials.address.nonce).toBe(-9223372036854775808n); // -(2^63), Int64 minimum
    });

    it("all-zero bytes produce nonce 0", async () => {
      stubRawBytes([0, 0, 0, 0, 0, 0, 0, 0]);
      const entry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation,
        networkPassphrase: Networks.TESTNET,
      });
      const credentials = expectUnionVariant(
        entry.credentials,
        "sorobanCredentialsAddress",
      );
      expect(credentials.address.nonce).toBe(0n);
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

  describe("delegate credential builders", () => {
    // an ADDRESS_V2 entry as simulation would return it (Void signature
    // placeholder), for the given top-level account
    function addressV2Entry(
      pk = kp.publicKey(),
    ): xdr.SorobanAuthorizationEntry {
      return new xdr.SorobanAuthorizationEntry({
        rootInvocation: authEntry.rootInvocation,
        credentials: xdr.SorobanCredentials.sorobanCredentialsAddressV2(
          new xdr.SorobanAddressCredentials({
            address: new Address(pk).toScAddress(),
            nonce: 777n,
            signatureExpirationLedger: 0,
            signature: xdr.ScVal.scvVoid(),
          }),
        ),
      });
    }

    describe("buildAuthorizationEntryPreimage", () => {
      it("builds the address-bound preimage for ADDRESS_V2, bound to the top-level address", () => {
        const preimage = buildAuthorizationEntryPreimage(
          addressV2Entry(),
          4242,
          Networks.TESTNET,
        );
        expect(preimage.type).toBe(
          "envelopeTypeSorobanAuthorizationWithAddress",
        );
        const inner = (
          preimage as xdr.HashIdPreimageSorobanAuthorizationWithAddressArm
        ).value;
        expect(inner.signatureExpirationLedger).toBe(4242);
        expect(inner.nonce).toBe(777n);
        expect(inner.address.toXdr()).toEqual(
          new Address(kp.publicKey()).toScAddress().toXdr(),
        );
      });

      it("builds the legacy non-address-bound preimage for ADDRESS", () => {
        const entry = new xdr.SorobanAuthorizationEntry({
          rootInvocation: authEntry.rootInvocation,
          credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
            new xdr.SorobanAddressCredentials({
              address: new Address(kp.publicKey()).toScAddress(),
              nonce: 5n,
              signatureExpirationLedger: 0,
              signature: xdr.ScVal.scvVoid(),
            }),
          ),
        });
        const preimage = buildAuthorizationEntryPreimage(
          entry,
          10,
          Networks.TESTNET,
        );
        expect(preimage.type).toBe("envelopeTypeSorobanAuthorization");
        expect(
          (preimage as xdr.HashIdPreimageSorobanAuthorizationArm).value
            .signatureExpirationLedger,
        ).toBe(10);
      });

      it("matches the payload authorizeEntry actually signs", async () => {
        const entry = addressV2Entry();
        const capture: { preimage?: xdr.HashIdPreimage } = {};
        await authorizeEntry(
          entry,
          // eslint-disable-next-line @typescript-eslint/require-await
          async (preimage) => {
            capture.preimage = preimage;
            return kp.sign(hash(Buffer.from(preimage.toXdr())));
          },
          4242,
          Networks.TESTNET,
        );
        const built = buildAuthorizationEntryPreimage(
          entry,
          4242,
          Networks.TESTNET,
        );
        expect(built.toXdr("hex")).toBe(
          expectDefined(capture.preimage).toXdr("hex"),
        );
      });

      it("throws for source-account credentials", () => {
        const entry = new xdr.SorobanAuthorizationEntry({
          rootInvocation: authEntry.rootInvocation,
          credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
        });
        expect(() =>
          buildAuthorizationEntryPreimage(entry, 10, Networks.TESTNET),
        ).toThrow(/cannot build a signature payload/);
      });
    });

    describe("buildWithDelegatesEntry", () => {
      it("wraps ADDRESS_V2 creds, defaulting the top-level signature to Void", () => {
        const delegate = Keypair.random();
        const wrapped = buildWithDelegatesEntry({
          entry: addressV2Entry(),
          validUntilLedgerSeq: 100,
          delegates: [{ address: delegate.publicKey() }],
        });

        expect(wrapped.credentials.type).toBe(
          "sorobanCredentialsAddressWithDelegates",
        );
        const wd = (
          wrapped.credentials as xdr.SorobanCredentialsAddressWithDelegates
        ).value;
        // top-level address + nonce preserved, expiration set, signature Void
        expect(wd.addressCredentials.address.toXdr()).toEqual(
          new Address(kp.publicKey()).toScAddress().toXdr(),
        );
        expect(wd.addressCredentials.nonce).toBe(777n);
        expect(wd.addressCredentials.signatureExpirationLedger).toBe(100);
        expect(wd.addressCredentials.signature.type).toBe("scvVoid");
        // delegate placeholder present with a Void signature
        expect(wd.delegates).toHaveLength(1);
        expect(Address.fromScAddress(wd.delegates[0].address).toString()).toBe(
          delegate.publicKey(),
        );
        expect(wd.delegates[0].signature.type).toBe("scvVoid");
      });

      it("sorts each delegates array ascending by address", () => {
        const kps = [Keypair.random(), Keypair.random(), Keypair.random()];
        const expectedOrder = kps
          .map((k) => k.publicKey())
          .sort((a, b) =>
            Buffer.compare(
              new Address(a).toScAddress().toXdr(),
              new Address(b).toScAddress().toXdr(),
            ),
          );

        const wrapped = buildWithDelegatesEntry({
          entry: addressV2Entry(),
          validUntilLedgerSeq: 100,
          delegates: kps.map((k) => ({ address: k.publicKey() })),
        });

        const order = (
          wrapped.credentials as xdr.SorobanCredentialsAddressWithDelegates
        ).value.delegates.map((node: xdr.SorobanDelegateSignature) =>
          Address.fromScAddress(node.address).toString(),
        );
        expect(order).toEqual(expectedOrder);
      });

      it("throws on duplicate delegate addresses within a level", () => {
        const delegate = Keypair.random();
        expect(() =>
          buildWithDelegatesEntry({
            entry: addressV2Entry(),
            validUntilLedgerSeq: 100,
            delegates: [
              { address: delegate.publicKey() },
              { address: delegate.publicKey() },
            ],
          }),
        ).toThrow(/duplicate delegate address/);
      });

      it("rejects entries that are already ADDRESS_WITH_DELEGATES", () => {
        const wrapped = buildWithDelegatesEntry({
          entry: addressV2Entry(),
          validUntilLedgerSeq: 100,
          delegates: [],
        });
        expect(() =>
          buildWithDelegatesEntry({
            entry: wrapped,
            validUntilLedgerSeq: 100,
            delegates: [],
          }),
        ).toThrow(/expects ADDRESS or ADDRESS_V2 credentials/);
      });

      it("composes with authorizeEntry to fill a delegate signature end-to-end", async () => {
        const delegate = Keypair.random();
        const wrapped = buildWithDelegatesEntry({
          entry: addressV2Entry(),
          validUntilLedgerSeq: 100,
          delegates: [{ address: delegate.publicKey() }],
        });

        // the delegate signs the shared (top-level-bound) payload; passing its
        // address as `forAddress` writes the signature into the delegate node
        const signed = await authorizeEntry(
          wrapped,
          delegate,
          100,
          Networks.TESTNET,
          delegate.publicKey(),
        );

        const wd = (
          signed.credentials as xdr.SorobanCredentialsAddressWithDelegates
        ).value;
        // top-level stays Void; only the delegate signed
        expect(wd.addressCredentials.signature.type).toBe("scvVoid");
        const sigArgs = expectDefined(
          (wd.delegates[0].signature as xdr.ScValVec).vec,
        ).map((v) => scValToNative(v));
        const sig = sigArgs[0] as { public_key: Buffer; signature: Buffer };
        expect(StrKey.encodeEd25519PublicKey(sig.public_key)).toBe(
          delegate.publicKey(),
        );
      });
    });
  });
});
