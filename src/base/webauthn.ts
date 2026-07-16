import {
  concatUint8Arrays,
  hexToUint8Array,
  uint8ArrayToHex,
} from "uint8array-extras";
import xdr from "./xdr.js";
import { nativeToScVal } from "./scval.js";

type BytesLike = ArrayBuffer | Uint8Array;

function toBytes(value: BytesLike): Uint8Array {
  return value instanceof ArrayBuffer ? new Uint8Array(value) : value;
}

// The order `n` of the secp256r1 (P-256) curve group and its half, used for
// low-S normalization: Soroban's secp256r1 verification (like most on-chain
// verifiers) only accepts signatures with `s <= n/2` to rule out signature
// malleability.
const SECP256R1_ORDER = BigInt(
  "0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551",
);
const SECP256R1_HALF_ORDER = SECP256R1_ORDER >> 1n;

/** The pieces of a WebAuthn assertion needed to authorize a Soroban entry. */
export interface WebAuthnSignatureParts {
  /**
   * the secp256r1 signature in 64-byte compact form (`r || s`, low-S). WebAuthn
   * authenticators return DER — run it through
   * {@link normalizeSecp256r1Signature} first.
   */
  signature: BytesLike;
  /** `AuthenticatorAssertionResponse.authenticatorData`. */
  authenticatorData: BytesLike;
  /** `AuthenticatorAssertionResponse.clientDataJSON`. */
  clientDataJSON: BytesLike;
}

/**
 * Builds the signature {@link xdr.ScVal} map that passkey/WebAuthn smart
 * wallet contracts expect in their `__check_auth`, in the layout the ecosystem
 * has converged on (e.g. `passkey-kit`):
 *
 * ```text
 * {
 *   authenticator_data: Bytes,
 *   client_data_json:   Bytes,
 *   signature:          BytesN<64>,
 * }
 * ```
 *
 * The 64-byte signature is defensively re-normalized (low-S enforced) before
 * being embedded, so a malleable high-S signature never reaches the
 * credentials even if the caller skipped {@link normalizeSecp256r1Signature}.
 *
 * Pass the result to {@link authorizeEntry} via the `signatureScVal` return
 * variant of {@link SigningCallback}:
 *
 * @example
 * ```ts
 * import { authorizeEntry, buildWebAuthnSignatureScVal, normalizeSecp256r1Signature } from "@stellar/stellar-sdk";
 *
 * const signed = await authorizeEntry(entry, async (_preimage, payload) => {
 *   const assertion = await navigator.credentials.get({
 *     publicKey: { challenge: payload, ... },
 *   });
 *   const response = assertion.response as AuthenticatorAssertionResponse;
 *   return {
 *     signatureScVal: buildWebAuthnSignatureScVal({
 *       signature: normalizeSecp256r1Signature(response.signature),
 *       authenticatorData: response.authenticatorData,
 *       clientDataJSON: response.clientDataJSON,
 *     }),
 *   };
 * }, validUntilLedgerSeq, networkPassphrase);
 * ```
 *
 * @param parts - the WebAuthn assertion pieces (see
 *    {@link WebAuthnSignatureParts})
 * @returns the `scvMap` signature value to place in the entry's credentials
 * @throws `Error` if `signature` is not exactly 64 bytes (i.e. still DER), or
 *    if its `r`/`s` scalars are out of range
 * @see normalizeSecp256r1Signature
 */
export function buildWebAuthnSignatureScVal(
  parts: WebAuthnSignatureParts,
): xdr.ScVal {
  const raw = toBytes(parts.signature);
  if (raw.length !== 64) {
    throw new Error(
      `signature must be 64 bytes in compact r||s form, got ${raw.length}` +
        ` (WebAuthn authenticators return DER: convert it with normalizeSecp256r1Signature)`,
    );
  }
  // Re-normalize rather than trusting the caller to have done it: this both
  // range-checks r/s and guarantees low-S, so a high-S (malleable) signature
  // can never be smuggled into the credentials even when the caller skipped
  // normalizeSecp256r1Signature. Normalization is idempotent, so already-good
  // signatures pass through byte-identical.
  const signature = normalizeSecp256r1Signature(raw);

  // Contract struct field names are symbols; the keys here are already in the
  // ascending order the ScMap encoding requires.
  return nativeToScVal(
    {
      authenticator_data: toBytes(parts.authenticatorData),
      client_data_json: toBytes(parts.clientDataJSON),
      signature,
    },
    {
      type: {
        authenticator_data: ["symbol", null],
        client_data_json: ["symbol", null],
        signature: ["symbol", null],
      },
    },
  );
}

/**
 * Converts a secp256r1 (P-256) ECDSA signature into the 64-byte compact
 * `r || s` form with a normalized (low) `s`, which is what Soroban contracts
 * verify against.
 *
 * WebAuthn authenticators return signatures ASN.1 DER-encoded
 * (`SEQUENCE { INTEGER r, INTEGER s }`) with a possibly-high `s`; on-chain
 * verification requires fixed 32-byte big-endian `r` and `s` with
 * `s <= n/2` (low-S), so this handles both the re-encoding and the
 * malleability normalization. A 64-byte compact input is also accepted and
 * just has its `s` half normalized.
 *
 * @param signature - the DER-encoded (or 64-byte compact) signature
 * @returns the 64-byte low-S compact signature
 * @throws `Error` if the input is neither valid DER nor 64 bytes long, or if
 *    `r`/`s` fall outside the valid scalar range
 */
export function normalizeSecp256r1Signature(signature: BytesLike): Uint8Array {
  const sig = toBytes(signature);

  // Length alone can't disambiguate: a compact signature may start with 0x30
  // (whenever r's top byte is 0x30), and a DER signature with unusually short
  // scalars may be exactly 64 bytes. So for 64-byte inputs, prefer a
  // well-formed DER parse and fall back to compact; other lengths must be DER.
  let r: bigint;
  let s: bigint;
  if (sig.length === 64) {
    let der: [bigint, bigint] | null = null;
    if (sig[0] === 0x30) {
      try {
        der = parseDerSignature(sig);
      } catch {
        // not valid DER: treat as compact r||s
      }
    }
    [r, s] = der ?? [
      bytesToScalar(sig.subarray(0, 32)),
      bytesToScalar(sig.subarray(32, 64)),
    ];
  } else if (sig[0] === 0x30) {
    [r, s] = parseDerSignature(sig);
  } else {
    throw new Error(
      `expected a DER-encoded or 64-byte compact secp256r1 signature, got ${sig.length} bytes`,
    );
  }

  if (s > SECP256R1_HALF_ORDER) {
    s = SECP256R1_ORDER - s;
  }

  return concatUint8Arrays([scalarToBytes(r), scalarToBytes(s)]);
}

/** Parses `SEQUENCE { INTEGER r, INTEGER s }`, returning the two scalars. */
function parseDerSignature(sig: Uint8Array): [bigint, bigint] {
  // P-256 signatures are at most ~72 bytes, so the DER lengths always use the
  // short (single-byte) form.
  if (sig.length < 8 || (sig[1] & 0x80) !== 0 || sig[1] !== sig.length - 2) {
    throw new Error("invalid DER signature: bad SEQUENCE header");
  }

  const [r, sOffset] = parseDerInteger(sig, 2);
  const [s, end] = parseDerInteger(sig, sOffset);
  if (end !== sig.length) {
    throw new Error("invalid DER signature: trailing bytes");
  }
  return [r, s];
}

/**
 * Parses one DER INTEGER at `offset`, returning its value and the next offset.
 *
 * Deliberately lenient about DER's minimal-encoding rules (redundant 0x00
 * padding is accepted, top-bit-set values are read as unsigned rather than
 * negative): the scalars are re-canonicalized into fixed 32-byte form anyway,
 * so strictness here would only reject inputs without improving the output.
 */
function parseDerInteger(sig: Uint8Array, offset: number): [bigint, number] {
  if (sig[offset] !== 0x02) {
    throw new Error("invalid DER signature: expected INTEGER");
  }
  if (offset + 2 > sig.length) {
    throw new Error("invalid DER signature: truncated INTEGER header");
  }
  const length = sig[offset + 1];
  const start = offset + 2;
  const end = start + length;
  if (length === 0 || (length & 0x80) !== 0 || end > sig.length) {
    throw new Error("invalid DER signature: bad INTEGER length");
  }
  return [bytesToScalar(sig.subarray(start, end)), end];
}

/** Big-endian bytes → bigint, rejecting values outside (0, n). */
function bytesToScalar(bytes: Uint8Array): bigint {
  const value = BigInt(`0x${uint8ArrayToHex(bytes) || "0"}`);
  if (value <= 0n || value >= SECP256R1_ORDER) {
    throw new Error("invalid secp256r1 signature: scalar out of range");
  }
  return value;
}

/** bigint → 32-byte big-endian buffer. */
function scalarToBytes(value: bigint): Uint8Array {
  return hexToUint8Array(value.toString(16).padStart(64, "0"));
}
