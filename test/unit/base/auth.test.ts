import { describe, it, expect, afterEach, vi } from "vitest";
import {
  authorizeEntry,
  authorizeInvocation,
  buildAuthorizationEntryPreimage,
  buildWithDelegatesEntry,
  inspectAuthEntry,
  checkAuthEntryReadiness,
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

  const authEntry = new xdr.SorobanAuthorizationEntry({
    rootInvocation: new xdr.SorobanAuthorizedInvocation({
      function:
        xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
          new xdr.InvokeContractArgs({
            contractAddress: new Address(contractId).toScAddress(),
            functionName: "hello",
            args: [xdr.ScVal.scvU64(new xdr.Uint64(1234n))],
          }),
        ),
      subInvocations: [],
    }),
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
      new xdr.SorobanAddressCredentials({
        address: new Address(kp.publicKey()).toScAddress(),
        nonce: new xdr.Int64(123456789101112n),
        signatureExpirationLedger: 0,
        signature: xdr.ScVal.scvVec([]),
      }),
    ),
  });

  it("builds a mock entry correctly", () => {
    expect(() => authEntry.toXDR()).not.toThrow();
  });

  describe("authorizeEntry", () => {
    it("signs the entry correctly with a Keypair", async () => {
      const signedEntry = await authorizeEntry(
        authEntry,
        kp,
        10,
        Networks.TESTNET,
      );

      expect(signedEntry.rootInvocation().toXDR()).toEqual(
        authEntry.rootInvocation().toXDR(),
      );

      const signedAddr = signedEntry.credentials().address();
      const entryAddr = authEntry.credentials().address();
      expect(signedAddr.signatureExpirationLedger()).toBe(10);
      expect(signedAddr.address().toXDR()).toEqual(entryAddr.address().toXDR());
      expect(signedAddr.nonce().toBigInt()).toBe(entryAddr.nonce().toBigInt());

      const sigArgs = expectDefined(signedAddr.signature().vec()).map((v) =>
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
      const callback: SigningCallback = (preimage) =>
        Promise.resolve(kp.sign(hash(preimage.toXDR())));

      const signedEntry = await authorizeEntry(
        authEntry,
        callback,
        10,
        Networks.TESTNET,
      );

      const signedAddr = signedEntry.credentials().address();
      expect(signedAddr.signatureExpirationLedger()).toBe(10);

      const sigArgs = expectDefined(signedAddr.signature().vec()).map((v) =>
        scValToNative(v),
      );
      expect(sigArgs).toHaveLength(1);

      const sig = sigArgs[0] as { public_key: Buffer; signature: Buffer };
      expect(StrKey.encodeEd25519PublicKey(sig.public_key)).toBe(
        kp.publicKey(),
      );
    });

    it("signs the entry correctly with a callback returning an object", async () => {
      const callback: SigningCallback = (preimage) =>
        Promise.resolve({
          signature: kp.sign(hash(preimage.toXDR())),
          publicKey: kp.publicKey(),
        });

      const signedEntry = await authorizeEntry(
        authEntry,
        callback,
        10,
        Networks.TESTNET,
      );

      const signedAddr = signedEntry.credentials().address();
      expect(signedAddr.signatureExpirationLedger()).toBe(10);

      const sigArgs = expectDefined(signedAddr.signature().vec()).map((v) =>
        scValToNative(v),
      );
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
        (preimage) => {
          invoked = true;
          return Promise.resolve(kp.sign(hash(preimage.toXDR())));
        },
        10,
        Networks.TESTNET,
      );

      expect(invoked).toBe(true);
    });

    it("returns entry unchanged for source account credentials (no-op)", async () => {
      const sourceAccountEntry = new xdr.SorobanAuthorizationEntry({
        rootInvocation: authEntry.rootInvocation(),
        credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
      });

      const result = await authorizeEntry(
        sourceAccountEntry,
        kp,
        10,
        Networks.TESTNET,
      );
      expect(result.toXDR()).toEqual(sourceAccountEntry.toXDR());
    });

    it("succeeds with a different signer (signs with the given keypair)", async () => {
      // When a random keypair is passed, it signs with its own key and the
      // verification still passes because Keypair.verify uses the signer's
      // own publicKey — the function does NOT enforce that the signer matches
      // the entry's credential address.
      const randomKp = Keypair.random();

      // Build an entry whose credential address matches randomKp
      const entryForRandom = new xdr.SorobanAuthorizationEntry({
        rootInvocation: authEntry.rootInvocation(),
        credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
          new xdr.SorobanAddressCredentials({
            address: new Address(randomKp.publicKey()).toScAddress(),
            nonce: new xdr.Int64(123456789101112n),
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
      expect(signed.credentials().address().signatureExpirationLedger()).toBe(
        10,
      );
    });

    it("throws when signature verification fails", async () => {
      // Use a callback that returns a valid-looking signature from a
      // different key, paired with the entry's publicKey — verification
      // will fail because the signature doesn't match.
      const wrongKp = Keypair.random();
      const badCallback: SigningCallback = (preimage) =>
        Promise.resolve({
          signature: wrongKp.sign(hash(preimage.toXDR())),
          publicKey: kp.publicKey(), // claims to be kp but signed with wrongKp
        });

      await expect(
        authorizeEntry(authEntry, badCallback, 10, Networks.TESTNET),
      ).rejects.toThrow(/signature doesn't match payload/);
    });

    it("throws with a bad signature from a callback", async () => {
      const badCallback: SigningCallback = () =>
        Promise.resolve({
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

      const sigTestnet = signedTestnet
        .credentials()
        .address()
        .signature()
        .toXDR("hex");
      const sigPublic = signedPublic
        .credentials()
        .address()
        .signature()
        .toXDR("hex");

      expect(sigTestnet).not.toBe(sigPublic);
    });
  });

  describe("credential type switching", () => {
    const EXPIRATION = 4242;
    const NONCE = 987654321n;

    function makeAddrCreds(): xdr.SorobanAddressCredentials {
      return new xdr.SorobanAddressCredentials({
        address: new Address(kp.publicKey()).toScAddress(),
        nonce: new xdr.Int64(NONCE),
        signatureExpirationLedger: 0,
        signature: xdr.ScVal.scvVec([]),
      });
    }

    function entryWith(
      credentials: xdr.SorobanCredentials,
    ): xdr.SorobanAuthorizationEntry {
      return new xdr.SorobanAuthorizationEntry({
        rootInvocation: authEntry.rootInvocation(),
        credentials,
      });
    }

    // Captures the preimage handed to the signer so we can assert which
    // HashIdPreimage variant authorizeEntry built (and what it committed to).
    function capturingSigner(capture: {
      preimage?: xdr.HashIdPreimage;
    }): SigningCallback {
      return (preimage) => {
        capture.preimage = preimage;
        return Promise.resolve(kp.sign(hash(preimage.toXDR())));
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
      expect(preimage.switch().name).toBe("envelopeTypeSorobanAuthorization");

      const inner = preimage.sorobanAuthorization();
      expect(inner.signatureExpirationLedger()).toBe(EXPIRATION);
      expect(inner.nonce().toBigInt()).toBe(NONCE);
      expect(inner.networkId().toString("hex")).toBe(
        expectedNetworkId(Networks.TESTNET),
      );

      // the signature + expiration land on the ADDRESS arm
      const addr = signed.credentials().address();
      expect(addr.signatureExpirationLedger()).toBe(EXPIRATION);
      expect(addr.signature().switch().name).toBe("scvVec");
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
      expect(preimage.switch().name).toBe(
        "envelopeTypeSorobanAuthorizationWithAddress",
      );

      const inner = preimage.sorobanAuthorizationWithAddress();
      expect(inner.signatureExpirationLedger()).toBe(EXPIRATION);
      expect(inner.nonce().toBigInt()).toBe(NONCE);
      expect(inner.networkId().toString("hex")).toBe(
        expectedNetworkId(Networks.TESTNET),
      );
      // the address is bound into the signed payload
      expect(inner.address().toXDR()).toEqual(
        new Address(kp.publicKey()).toScAddress().toXDR(),
      );

      const addr = signed.credentials().addressV2();
      expect(addr.signatureExpirationLedger()).toBe(EXPIRATION);
      expect(addr.signature().switch().name).toBe("scvVec");
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
      expect(preimage.switch().name).toBe(
        "envelopeTypeSorobanAuthorizationWithAddress",
      );

      const inner = preimage.sorobanAuthorizationWithAddress();
      expect(inner.signatureExpirationLedger()).toBe(EXPIRATION);
      expect(inner.address().toXDR()).toEqual(
        new Address(kp.publicKey()).toScAddress().toXDR(),
      );

      // the signature + expiration land on the wrapped addressCredentials
      const wrapped = signed.credentials().addressWithDelegates();
      expect(wrapped.addressCredentials().signatureExpirationLedger()).toBe(
        EXPIRATION,
      );
      expect(wrapped.addressCredentials().signature().switch().name).toBe(
        "scvVec",
      );
      // the (empty) delegate set is preserved
      expect(wrapped.delegates()).toHaveLength(0);
    });

    it("ADDRESS_WITH_DELEGATES fills the matching delegate node, binding the payload to the top-level address", async () => {
      const delegate = Keypair.random();
      const capture: { preimage?: xdr.HashIdPreimage } = {};
      const signer: SigningCallback = (preimage) => {
        capture.preimage = preimage;
        return Promise.resolve({
          signature: delegate.sign(hash(preimage.toXDR())),
          publicKey: delegate.publicKey(),
        });
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
        preimage.sorobanAuthorizationWithAddress().address().toXDR(),
      ).toEqual(new Address(kp.publicKey()).toScAddress().toXDR());

      const wrapped = signed.credentials().addressWithDelegates();
      // the top-level signature is left untouched (still the placeholder)
      expect(wrapped.addressCredentials().signature().switch().name).toBe(
        "scvVec",
      );
      expect(
        expectDefined(wrapped.addressCredentials().signature().vec()),
      ).toHaveLength(0);
      // the delegate's node now carries the signature, attributed to the
      // delegate's key
      const signedDelegate = wrapped.delegates()[0];
      expect(signedDelegate.signature().switch().name).toBe("scvVec");
      const sigArgs = expectDefined(signedDelegate.signature().vec()).map((v) =>
        scValToNative(v),
      );
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
        expectDefined(capture.preimage)
          .sorobanAuthorization()
          .signatureExpirationLedger(),
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
      expect(expectDefined(legacy.preimage).toXDR("hex")).not.toBe(
        expectDefined(v2.preimage).toXDR("hex"),
      );
    });

    it("infers the public key from the V2 address arm on the naked-signature path", async () => {
      // The backwards-compat (naked signature) path derives the public key
      // from the entry's address; this exercises addrAuth.address() on the V2
      // arm rather than the legacy ADDRESS arm.
      const signed = await authorizeEntry(
        entryWith(
          xdr.SorobanCredentials.sorobanCredentialsAddressV2(makeAddrCreds()),
        ),
        (preimage) => Promise.resolve(kp.sign(hash(preimage.toXDR()))),
        EXPIRATION,
        Networks.TESTNET,
      );

      const sigArgs = expectDefined(
        signed.credentials().addressV2().signature().vec(),
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
        invocation: authEntry.rootInvocation(),
        networkPassphrase: Networks.TESTNET,
      });

      expect(signedEntry.rootInvocation().toXDR()).toEqual(
        authEntry.rootInvocation().toXDR(),
      );

      // authorizeInvocation defaults to legacy SOROBAN_CREDENTIALS_ADDRESS
      // entries (CAP-71 V2 is opt-in via `authV2`).
      expect(signedEntry.credentials().switch().name).toBe(
        "sorobanCredentialsAddress",
      );
      const signedAddr = signedEntry.credentials().address();
      expect(signedAddr.signatureExpirationLedger()).toBe(10);

      const addrStr = Address.fromScAddress(signedAddr.address()).toString();
      expect(addrStr).toBe(kp.publicKey());
    });

    it("can build from scratch with explicit publicKey", async () => {
      const callback: SigningCallback = (preimage) =>
        Promise.resolve({
          signature: kp.sign(hash(preimage.toXDR())),
          publicKey: kp.publicKey(),
        });

      const signedEntry = await authorizeInvocation({
        signer: callback,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation(),
        networkPassphrase: Networks.TESTNET,
        publicKey: kp.publicKey(),
      });

      expect(signedEntry.credentials().switch().name).toBe(
        "sorobanCredentialsAddress",
      );
      const signedAddr = signedEntry.credentials().address();
      expect(signedAddr.signatureExpirationLedger()).toBe(10);

      const addrStr = Address.fromScAddress(signedAddr.address()).toString();
      expect(addrStr).toBe(kp.publicKey());
    });

    it("builds SOROBAN_CREDENTIALS_ADDRESS_V2 entries when authV2 is set", async () => {
      const signedEntry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation(),
        networkPassphrase: Networks.TESTNET,
        authV2: true,
      });

      expect(signedEntry.credentials().switch().name).toBe(
        "sorobanCredentialsAddressV2",
      );
      const signedAddr = signedEntry.credentials().addressV2();
      expect(signedAddr.signatureExpirationLedger()).toBe(10);

      const addrStr = Address.fromScAddress(signedAddr.address()).toString();
      expect(addrStr).toBe(kp.publicKey());
    });

    it("throws when signer has no publicKey method and none provided", () => {
      const callback: SigningCallback = (preimage) =>
        Promise.resolve(kp.sign(hash(preimage.toXDR())));

      // When called with a non-Keypair signer and no explicit publicKey, the
      // implementation throws Error("authorizeInvocation requires publicKey parameter").
      expect(() =>
        authorizeInvocation({
          signer: callback,
          validUntilLedgerSeq: 10,
          invocation: authEntry.rootInvocation(),
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
        invocation: authEntry.rootInvocation(),
        networkPassphrase: Networks.TESTNET,
      });
      expect(entry.credentials().address().nonce().toBigInt()).toBe(
        4294967296n,
      ); // 2^32
    });

    it("all-0xFF bytes produce nonce -1 (signed Int64 all-bits-set)", async () => {
      stubRawBytes([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
      const entry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation(),
        networkPassphrase: Networks.TESTNET,
      });
      expect(entry.credentials().address().nonce().toBigInt()).toBe(-1n);
    });

    it("high bit set produces Int64 minimum value", async () => {
      stubRawBytes([0x80, 0, 0, 0, 0, 0, 0, 0]);
      const entry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation(),
        networkPassphrase: Networks.TESTNET,
      });
      expect(entry.credentials().address().nonce().toBigInt()).toBe(
        -9223372036854775808n,
      ); // -(2^63), Int64 minimum
    });

    it("all-zero bytes produce nonce 0", async () => {
      stubRawBytes([0, 0, 0, 0, 0, 0, 0, 0]);
      const entry = await authorizeInvocation({
        signer: kp,
        validUntilLedgerSeq: 10,
        invocation: authEntry.rootInvocation(),
        networkPassphrase: Networks.TESTNET,
      });
      expect(entry.credentials().address().nonce().toBigInt()).toBe(0n);
    });

    it("throws if fewer than 8 bytes are available", () => {
      stubRawBytes([0, 0, 0]); // only 3 bytes

      expect(() =>
        authorizeInvocation({
          signer: kp,
          validUntilLedgerSeq: 10,
          invocation: authEntry.rootInvocation(),
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
        rootInvocation: authEntry.rootInvocation(),
        credentials: xdr.SorobanCredentials.sorobanCredentialsAddressV2(
          new xdr.SorobanAddressCredentials({
            address: new Address(pk).toScAddress(),
            nonce: new xdr.Int64(777n),
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
        expect(preimage.switch().name).toBe(
          "envelopeTypeSorobanAuthorizationWithAddress",
        );
        const inner = preimage.sorobanAuthorizationWithAddress();
        expect(inner.signatureExpirationLedger()).toBe(4242);
        expect(inner.nonce().toBigInt()).toBe(777n);
        expect(inner.address().toXDR()).toEqual(
          new Address(kp.publicKey()).toScAddress().toXDR(),
        );
      });

      it("builds the legacy non-address-bound preimage for ADDRESS", () => {
        const entry = new xdr.SorobanAuthorizationEntry({
          rootInvocation: authEntry.rootInvocation(),
          credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
            new xdr.SorobanAddressCredentials({
              address: new Address(kp.publicKey()).toScAddress(),
              nonce: new xdr.Int64(5n),
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
        expect(preimage.switch().name).toBe("envelopeTypeSorobanAuthorization");
        expect(
          preimage.sorobanAuthorization().signatureExpirationLedger(),
        ).toBe(10);
      });

      it("matches the payload authorizeEntry actually signs", async () => {
        const entry = addressV2Entry();
        const capture: { preimage?: xdr.HashIdPreimage } = {};
        await authorizeEntry(
          entry,
          (preimage) => {
            capture.preimage = preimage;
            return Promise.resolve(kp.sign(hash(preimage.toXDR())));
          },
          4242,
          Networks.TESTNET,
        );
        const built = buildAuthorizationEntryPreimage(
          entry,
          4242,
          Networks.TESTNET,
        );
        expect(built.toXDR("hex")).toBe(
          expectDefined(capture.preimage).toXDR("hex"),
        );
      });

      it("throws for source-account credentials", () => {
        const entry = new xdr.SorobanAuthorizationEntry({
          rootInvocation: authEntry.rootInvocation(),
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

        expect(wrapped.credentials().switch().name).toBe(
          "sorobanCredentialsAddressWithDelegates",
        );
        const wd = wrapped.credentials().addressWithDelegates();
        // top-level address + nonce preserved, expiration set, signature Void
        expect(wd.addressCredentials().address().toXDR()).toEqual(
          new Address(kp.publicKey()).toScAddress().toXDR(),
        );
        expect(wd.addressCredentials().nonce().toBigInt()).toBe(777n);
        expect(wd.addressCredentials().signatureExpirationLedger()).toBe(100);
        expect(wd.addressCredentials().signature().switch().name).toBe(
          "scvVoid",
        );
        // delegate placeholder present with a Void signature
        expect(wd.delegates()).toHaveLength(1);
        expect(
          Address.fromScAddress(wd.delegates()[0].address()).toString(),
        ).toBe(delegate.publicKey());
        expect(wd.delegates()[0].signature().switch().name).toBe("scvVoid");
      });

      it("sorts each delegates array ascending by address", () => {
        const kps = [Keypair.random(), Keypair.random(), Keypair.random()];
        const expectedOrder = kps
          .map((k) => k.publicKey())
          .sort((a, b) =>
            Buffer.compare(
              new Address(a).toScAddress().toXDR(),
              new Address(b).toScAddress().toXDR(),
            ),
          );

        const wrapped = buildWithDelegatesEntry({
          entry: addressV2Entry(),
          validUntilLedgerSeq: 100,
          delegates: kps.map((k) => ({ address: k.publicKey() })),
        });

        const order = wrapped
          .credentials()
          .addressWithDelegates()
          .delegates()
          .map((node: xdr.SorobanDelegateSignature) =>
            Address.fromScAddress(node.address()).toString(),
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

        const wd = signed.credentials().addressWithDelegates();
        // top-level stays Void; only the delegate signed
        expect(wd.addressCredentials().signature().switch().name).toBe(
          "scvVoid",
        );
        const sigArgs = expectDefined(wd.delegates()[0].signature().vec()).map(
          (v) => scValToNative(v),
        );
        const sig = sigArgs[0] as { public_key: Buffer; signature: Buffer };
        expect(StrKey.encodeEd25519PublicKey(sig.public_key)).toBe(
          delegate.publicKey(),
        );
      });
    });
  });
});

describe("inspecting authorization entries", () => {
  const kp = Keypair.random();
  const contractId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";

  const invocation = new xdr.SorobanAuthorizedInvocation({
    function:
      xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
        new xdr.InvokeContractArgs({
          contractAddress: new Address(contractId).toScAddress(),
          functionName: "hello",
          args: [xdr.ScVal.scvU64(new xdr.Uint64(1234n))],
        }),
      ),
    subInvocations: [],
  });

  const makeEntry = (
    credentials: xdr.SorobanCredentials,
  ): xdr.SorobanAuthorizationEntry =>
    new xdr.SorobanAuthorizationEntry({
      rootInvocation: invocation,
      credentials,
    });

  const makeAddressCredentials = (signature: xdr.ScVal) =>
    new xdr.SorobanAddressCredentials({
      address: new Address(kp.publicKey()).toScAddress(),
      nonce: new xdr.Int64(123456789101112n),
      signatureExpirationLedger: 100,
      signature,
    });

  describe("inspectAuthEntry", () => {
    it("decodes an unsigned ADDRESS entry", () => {
      const entry = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddress(
          makeAddressCredentials(xdr.ScVal.scvVec([])),
        ),
      );

      const info = inspectAuthEntry(entry);
      expect(info.credentialType).toBe("address");
      expect(info.address).toBe(kp.publicKey());
      expect(info.nonce).toBe(123456789101112n);
      expect(info.signatureExpirationLedger).toBe(100);
      expect(info.signed).toBe(false);
      expect(info.signers).toHaveLength(1);
      expect(info.signers[0]).toMatchObject({
        address: kp.publicKey(),
        signed: false,
        signatures: [],
      });
      expect(info.invocation.toXDR()).toEqual(invocation.toXDR());
    });

    it("decodes a signed entry, parsing the ed25519 signature format", async () => {
      const entry = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddress(
          makeAddressCredentials(xdr.ScVal.scvVec([])),
        ),
      );
      const signed = await authorizeEntry(entry, kp, 424242, Networks.TESTNET);

      const info = inspectAuthEntry(signed);
      expect(info.signed).toBe(true);
      expect(info.signatureExpirationLedger).toBe(424242);
      const sigs = expectDefined(info.signers[0].signatures);
      expect(sigs).toHaveLength(1);
      expect(sigs[0].publicKey).toBe(kp.publicKey());
      expect(sigs[0].signature).toHaveLength(64);
    });

    it("decodes ADDRESS_V2 entries", () => {
      const entry = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddressV2(
          makeAddressCredentials(xdr.ScVal.scvVec([])),
        ),
      );
      expect(inspectAuthEntry(entry).credentialType).toBe("addressV2");
    });

    it("decodes source-account entries", () => {
      const entry = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
      );

      const info = inspectAuthEntry(entry);
      expect(info.credentialType).toBe("sourceAccount");
      expect(info.address).toBeNull();
      expect(info.nonce).toBeNull();
      expect(info.signatureExpirationLedger).toBeNull();
      expect(info.signers).toHaveLength(0);
      expect(info.signed).toBe(false);
    });

    it("enumerates delegate signers depth-first", async () => {
      const delegate = Keypair.random();
      const nested = Keypair.random();

      const base = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddressV2(
          makeAddressCredentials(xdr.ScVal.scvVec([])),
        ),
      );
      const entry = buildWithDelegatesEntry({
        entry: base,
        validUntilLedgerSeq: 100,
        delegates: [
          {
            address: delegate.publicKey(),
            nestedDelegates: [{ address: nested.publicKey() }],
          },
        ],
      });
      const signed = await authorizeEntry(
        entry,
        delegate,
        100,
        Networks.TESTNET,
        delegate.publicKey(),
      );

      const info = inspectAuthEntry(signed);
      expect(info.credentialType).toBe("addressWithDelegates");
      expect(info.address).toBe(kp.publicKey());
      expect(info.signers.map((s) => s.address)).toEqual([
        kp.publicKey(),
        delegate.publicKey(),
        nested.publicKey(),
      ]);
      // top-level (scvVoid) and nested delegate are unsigned; delegate signed
      expect(info.signers.map((s) => s.signed)).toEqual([false, true, false]);
      expect(info.signed).toBe(false);
      expect(expectDefined(info.signers[1].signatures)[0].publicKey).toBe(
        delegate.publicKey(),
      );
    });

    it("returns null signatures (but signed=true) for non-standard payloads", () => {
      const entry = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddress(
          makeAddressCredentials(
            xdr.ScVal.scvBytes(Buffer.alloc(64)), // e.g. a custom-account payload
          ),
        ),
      );

      const info = inspectAuthEntry(entry);
      expect(info.signed).toBe(true);
      expect(info.signers[0].signatures).toBeNull();
      expect(info.signers[0].rawSignature.switch().name).toBe("scvBytes");
    });

    it("rejects non-64-byte signatures as non-standard payloads", () => {
      const malformed = xdr.ScVal.scvVec([
        xdr.ScVal.scvMap([
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("public_key"),
            val: xdr.ScVal.scvBytes(Buffer.alloc(32)),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol("signature"),
            val: xdr.ScVal.scvBytes(Buffer.alloc(1)),
          }),
        ]),
      ]);
      const entry = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddress(
          makeAddressCredentials(malformed),
        ),
      );

      const info = inspectAuthEntry(entry);
      expect(info.signed).toBe(true);
      expect(info.signers[0].signatures).toBeNull();
    });

    it("treats scvVoid as unsigned", () => {
      const entry = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddress(
          makeAddressCredentials(xdr.ScVal.scvVoid()),
        ),
      );
      const info = inspectAuthEntry(entry);
      expect(info.signed).toBe(false);
      expect(info.signers[0].signatures).toBeNull();
    });
  });

  describe("checkAuthEntryReadiness", () => {
    it("is ready when signed and unexpired", async () => {
      const entry = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddress(
          makeAddressCredentials(xdr.ScVal.scvVec([])),
        ),
      );
      const signed = await authorizeEntry(entry, kp, 1000, Networks.TESTNET);

      expect(checkAuthEntryReadiness(signed, 999)).toEqual({
        ready: true,
        expired: false,
        unsignedBy: [],
      });
    });

    it("expires exclusively at signatureExpirationLedger", async () => {
      const entry = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddress(
          makeAddressCredentials(xdr.ScVal.scvVec([])),
        ),
      );
      const signed = await authorizeEntry(entry, kp, 1000, Networks.TESTNET);

      const atExpiry = checkAuthEntryReadiness(signed, 1000);
      expect(atExpiry.expired).toBe(true);
      expect(atExpiry.ready).toBe(false);
    });

    it("reports unsigned addresses", () => {
      const entry = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddress(
          makeAddressCredentials(xdr.ScVal.scvVec([])),
        ),
      );

      const readiness = checkAuthEntryReadiness(entry, 1);
      expect(readiness.ready).toBe(false);
      expect(readiness.unsignedBy).toEqual([kp.publicKey()]);
    });

    it("rejects a currentLedgerSeq that is not a uint32", () => {
      const entry = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddress(
          makeAddressCredentials(xdr.ScVal.scvVec([])),
        ),
      );

      [NaN, -1, 1.5, 2 ** 32].forEach((bad) => {
        expect(() => checkAuthEntryReadiness(entry, bad)).toThrow(/uint32/);
      });
    });

    it("source-account entries are always ready", () => {
      const entry = makeEntry(
        xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
      );
      expect(checkAuthEntryReadiness(entry, 999999999)).toEqual({
        ready: true,
        expired: false,
        unsignedBy: [],
      });
    });
  });
});
