import { describe, it, expect } from "vitest";
import { p256 } from "@noble/curves/nist.js";
import {
  buildWebAuthnSignatureScVal,
  normalizeSecp256r1Signature,
} from "../../../src/base/webauthn.js";
import { scValToNative } from "../../../src/base/scval.js";
import { expectDefined } from "./support/expect_defined.js";

const SECP256R1_ORDER = BigInt(
  "0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551",
);
const HALF_ORDER = SECP256R1_ORDER >> 1n;

function scalarBytes(value: bigint, length = 32): Uint8Array {
  return Uint8Array.from(
    Buffer.from(value.toString(16).padStart(length * 2, "0"), "hex"),
  );
}

// Encodes r,s as DER `SEQUENCE { INTEGER r, INTEGER s }` the way an
// authenticator would: minimal big-endian bytes, 0x00-prefixed when the high
// bit is set.
function derEncode(r: bigint, s: bigint): Buffer {
  const int = (v: bigint): Buffer => {
    let bytes = scalarBytes(v);
    while (bytes.length > 1 && bytes[0] === 0) bytes = bytes.subarray(1);
    if (bytes[0] & 0x80) bytes = Buffer.concat([Buffer.from([0]), bytes]);
    return Buffer.concat([Buffer.from([0x02, bytes.length]), bytes]);
  };
  const body = Buffer.concat([int(r), int(s)]);
  return Buffer.concat([Buffer.from([0x30, body.length]), body]);
}

describe("normalizeSecp256r1Signature", () => {
  it("converts a low-S DER signature to 64-byte compact form", () => {
    const r = 0x1234n;
    const s = 0x5678n;
    const compact = normalizeSecp256r1Signature(derEncode(r, s), "der");

    expect(compact).toHaveLength(64);
    expect(compact.subarray(0, 32)).toEqual(scalarBytes(r));
    expect(compact.subarray(32)).toEqual(scalarBytes(s));
  });

  it("normalizes a high-S DER signature to low-S", () => {
    const r = 42n;
    const s = SECP256R1_ORDER - 1n; // maximally high S
    const compact = normalizeSecp256r1Signature(derEncode(r, s), "der");

    expect(compact.subarray(0, 32)).toEqual(scalarBytes(r));
    // n - (n - 1) = 1
    expect(compact.subarray(32)).toEqual(scalarBytes(1n));
  });

  it("leaves an exactly-half-order S untouched (boundary)", () => {
    const compact = normalizeSecp256r1Signature(
      derEncode(7n, HALF_ORDER),
      "der",
    );
    expect(compact.subarray(32)).toEqual(scalarBytes(HALF_ORDER));
  });

  it("handles 0x00-prefixed DER integers (high bit set)", () => {
    // scalars with the top bit set get a 0x00 prefix byte in DER; make sure
    // that prefix is stripped and the value still occupies all 32 bytes
    const r = BigInt(`0x80${"11".repeat(31)}`);
    const s = 3n;
    const compact = normalizeSecp256r1Signature(derEncode(r, s), "der");

    expect(compact.subarray(0, 32)).toEqual(scalarBytes(r));
    expect(compact.subarray(32)).toEqual(scalarBytes(s));
  });

  it("accepts a 64-byte compact input and normalizes its S half", () => {
    const r = 9n;
    const highS = SECP256R1_ORDER - 5n;
    const compactIn = Buffer.concat([scalarBytes(r), scalarBytes(highS)]);

    const compact = normalizeSecp256r1Signature(compactIn, "compact");
    expect(compact.subarray(0, 32)).toEqual(scalarBytes(r));
    expect(compact.subarray(32)).toEqual(scalarBytes(5n));
  });

  it("accepts ArrayBuffer input (as returned by WebAuthn APIs)", () => {
    const der = derEncode(0x1234n, 0x5678n);
    const ab = der.buffer.slice(
      der.byteOffset,
      der.byteOffset + der.byteLength,
    );
    expect(normalizeSecp256r1Signature(ab, "der")).toEqual(
      normalizeSecp256r1Signature(der, "der"),
    );
  });

  // the two format-overlap cases that motivated making `format` required: the
  // same 64 bytes are both a legitimate DER encoding and a plausible compact
  // signature, and only the declared format decides how they're read
  it("reads a 64-byte DER signature per the declared format", () => {
    // short scalars make the DER encoding exactly 64 bytes: 2 (SEQUENCE hdr)
    // + 2 + 29 (INTEGER r) + 2 + 29 (INTEGER s)
    const r = BigInt(`0x11${"22".repeat(28)}`); // 29 minimal bytes
    const s = BigInt(`0x33${"44".repeat(28)}`);
    const der = derEncode(r, s);
    expect(der).toHaveLength(64);

    const asDer = normalizeSecp256r1Signature(der, "der");
    expect(asDer.subarray(0, 32)).toEqual(scalarBytes(r));
    expect(asDer.subarray(32)).toEqual(scalarBytes(s));

    // declared compact, the same bytes are read literally as r || s
    const asCompact = normalizeSecp256r1Signature(der, "compact");
    expect(asCompact.subarray(0, 32)).toEqual(
      Uint8Array.from(der.subarray(0, 32)),
    );
    expect(asCompact.subarray(32)).toEqual(Uint8Array.from(der.subarray(32)));
  });

  it("accepts a compact signature whose r starts with DER's 0x30 tag", () => {
    const r = BigInt(`0x30${"11".repeat(31)}`);
    const s = 5n;
    const compactIn = Buffer.concat([scalarBytes(r), scalarBytes(s)]);

    const compact = normalizeSecp256r1Signature(compactIn, "compact");
    expect(compact.subarray(0, 32)).toEqual(scalarBytes(r));
    expect(compact.subarray(32)).toEqual(scalarBytes(s));
  });

  it("rejects a 64-byte compact input declared der", () => {
    const compactIn = Buffer.concat([scalarBytes(9n), scalarBytes(5n)]);
    expect(() => normalizeSecp256r1Signature(compactIn, "der")).toThrow(
      /invalid DER signature/,
    );
  });

  it("rejects non-64-byte input declared compact", () => {
    expect(() =>
      normalizeSecp256r1Signature(Buffer.alloc(63, 1), "compact"),
    ).toThrow(/must be 64 bytes/);
  });

  it("rejects a declared-DER input whose tag is not SEQUENCE", () => {
    const bogus = Buffer.alloc(70, 1); // first byte 0x01, not 0x30
    expect(() => normalizeSecp256r1Signature(bogus, "der")).toThrow(
      /bad SEQUENCE header/,
    );
  });

  it("rejects a truncated INTEGER header with a clear error", () => {
    // valid SEQUENCE and first INTEGER, but the second INTEGER's tag is the
    // final byte: there is no room for its length byte
    const truncated = Buffer.from([
      0x30, 0x06, 0x02, 0x03, 0x01, 0x02, 0x03, 0x02,
    ]);
    expect(() => normalizeSecp256r1Signature(truncated, "der")).toThrow(
      /truncated INTEGER header/,
    );
  });

  it("rejects malformed DER", () => {
    const der = derEncode(1n, 2n);
    der[1] += 1; // corrupt the SEQUENCE length
    expect(() => normalizeSecp256r1Signature(der, "der")).toThrow(
      /bad SEQUENCE header/,
    );
  });

  it("rejects out-of-range scalars", () => {
    const zeroR = Buffer.concat([scalarBytes(0n), scalarBytes(1n)]);
    expect(() => normalizeSecp256r1Signature(zeroR, "compact")).toThrow(
      /scalar out of range/,
    );

    const overOrder = Buffer.concat([
      scalarBytes(1n),
      scalarBytes(SECP256R1_ORDER),
    ]);
    expect(() => normalizeSecp256r1Signature(overOrder, "compact")).toThrow(
      /scalar out of range/,
    );
  });
});

// Differential check against @noble/curves (a well-reviewed reference
// implementation): for many real P-256 signatures, our DER parsing +
// low-S normalization must agree byte-for-byte with noble's.
describe("normalizeSecp256r1Signature vs @noble/curves (differential)", () => {
  const ROUNDS = 250;

  it(`agrees with noble on ${ROUNDS} random signatures (DER and compact input)`, () => {
    for (let i = 0; i < ROUNDS; i += 1) {
      const priv = p256.utils.randomSecretKey();
      const msg = p256.utils.randomSecretKey(); // any 32 random bytes
      // lowS:false so roughly half the signatures exercise normalization
      const compact = p256.sign(msg, priv, { prehash: false, lowS: false });
      const sig = p256.Signature.fromBytes(compact, "compact");

      const expected = Uint8Array.from(
        Buffer.concat([
          scalarBytes(sig.r),
          scalarBytes(sig.hasHighS() ? SECP256R1_ORDER - sig.s : sig.s),
        ]),
      );

      expect(
        normalizeSecp256r1Signature(Buffer.from(sig.toBytes("der")), "der"),
        `DER mismatch on round ${i}`,
      ).toEqual(expected);
      expect(
        normalizeSecp256r1Signature(Buffer.from(compact), "compact"),
        `compact mismatch on round ${i}`,
      ).toEqual(expected);
    }
  });

  it("output always verifies and is always low-S", () => {
    for (let i = 0; i < 25; i += 1) {
      const priv = p256.utils.randomSecretKey();
      const pub = p256.getPublicKey(priv);
      const msg = p256.utils.randomSecretKey();
      const compact = p256.sign(msg, priv, { prehash: false, lowS: false });
      const der = p256.Signature.fromBytes(compact, "compact").toBytes("der");

      const normalized = normalizeSecp256r1Signature(Buffer.from(der), "der");
      const out = p256.Signature.fromBytes(normalized, "compact");
      expect(out.hasHighS()).toBe(false);
      // (r, s) and (r, n-s) verify the same message, so normalization must
      // preserve validity
      expect(
        p256.verify(normalized, msg, pub, { prehash: false, lowS: true }),
      ).toBe(true);
    }
  });
});

// Round-trip through real WebCrypto (the same API a browser passkey flow
// sits on top of): sign with crypto.subtle, normalize, verify.
describe("normalizeSecp256r1Signature vs WebCrypto (round-trip)", () => {
  it("normalized WebCrypto signatures still verify", async () => {
    const { subtle } = globalThis.crypto;
    const key = await subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign", "verify"],
    );

    for (let i = 0; i < 25; i += 1) {
      const payload = globalThis.crypto.getRandomValues(new Uint8Array(32));
      // WebCrypto returns IEEE P1363 (compact r||s), possibly high-S
      const raw = await subtle.sign(
        { name: "ECDSA", hash: "SHA-256" },
        key.privateKey,
        payload,
      );

      const normalized = normalizeSecp256r1Signature(raw, "compact");
      expect(normalized).toHaveLength(64);
      expect(p256.Signature.fromBytes(normalized, "compact").hasHighS()).toBe(
        false,
      );
      expect(
        await subtle.verify(
          { name: "ECDSA", hash: "SHA-256" },
          key.publicKey,
          normalized,
          payload,
        ),
      ).toBe(true);
    }
  });
});

describe("buildWebAuthnSignatureScVal", () => {
  const signature = Buffer.alloc(64, 0x42);
  const authenticatorData = Buffer.from("authenticator-data");
  const clientDataJSON = Buffer.from('{"type":"webauthn.get"}');

  it("builds the passkey-kit-shaped map with symbol keys", () => {
    const scVal = buildWebAuthnSignatureScVal({
      signature,
      authenticatorData,
      clientDataJSON,
    });

    expect(scVal.switch().name).toBe("scvMap");
    const entries = expectDefined(scVal.map());
    // ScMap keys must be sorted ascending; this is also the struct layout
    expect(entries.map((e) => e.key().sym().toString())).toEqual([
      "authenticator_data",
      "client_data_json",
      "signature",
    ]);
    entries.forEach((e) => expect(e.val().switch().name).toBe("scvBytes"));

    const native = scValToNative(scVal) as Record<string, Buffer>;
    expect(native.authenticator_data).toEqual(authenticatorData);
    expect(native.client_data_json).toEqual(clientDataJSON);
    expect(native.signature).toEqual(signature);
  });

  it("accepts ArrayBuffer inputs (as returned by WebAuthn APIs)", () => {
    const toAb = (b: Buffer) =>
      b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    const scVal = buildWebAuthnSignatureScVal({
      signature: toAb(signature),
      authenticatorData: toAb(authenticatorData),
      clientDataJSON: toAb(clientDataJSON),
    });
    const native = scValToNative(scVal) as Record<string, Buffer>;
    expect(native.signature).toEqual(signature);
  });

  it("re-normalizes a high-S signature instead of embedding it", () => {
    const r = 9n;
    const highS = SECP256R1_ORDER - 5n;
    const scVal = buildWebAuthnSignatureScVal({
      signature: Buffer.concat([scalarBytes(r), scalarBytes(highS)]),
      authenticatorData,
      clientDataJSON,
    });

    const native = scValToNative(scVal) as Record<string, Buffer>;
    expect(Uint8Array.from(native.signature)).toEqual(
      Uint8Array.from(Buffer.concat([scalarBytes(r), scalarBytes(5n)])),
    );
  });

  it("rejects out-of-range scalars", () => {
    expect(() =>
      buildWebAuthnSignatureScVal({
        signature: Buffer.concat([scalarBytes(0n), scalarBytes(1n)]),
        authenticatorData,
        clientDataJSON,
      }),
    ).toThrow(/scalar out of range/);
  });

  it("rejects non-64-byte (e.g. still-DER) signatures", () => {
    expect(() =>
      buildWebAuthnSignatureScVal({
        signature: Buffer.alloc(70, 1),
        authenticatorData,
        clientDataJSON,
      }),
    ).toThrow(/must be 64 bytes.*normalizeSecp256r1Signature/);
  });
});
