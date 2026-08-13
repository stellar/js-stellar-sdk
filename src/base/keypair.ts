import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
import {
  areUint8ArraysEqual,
  concatUint8Arrays,
  isUint8Array,
  stringToUint8Array,
} from "uint8array-extras";
import { sign, verify, generate } from "./signing.js";
import { StrKey } from "./strkey.js";
import { hash } from "./hashing.js";

import {
  AccountId,
  DecoratedSignature,
  MuxedAccount,
  MuxedAccountMed25519,
  PublicKey,
  Signature,
  Uint64,
} from "../xdr/index.js";

ed.hashes.sha512 = sha512;

// SEP-53: fixed prefix prepended to a message before hashing and signing.
const MESSAGE_PREFIX = stringToUint8Array("Stellar Signed Message:\n");

/**
 * True for an `xdr.Signature`, including one built by a *different* copy of the
 * SDK loaded in the same process (a dual ESM/CJS load, or two installed
 * versions), where `instanceof` fails on an otherwise perfectly good wrapper.
 * The generated schema carries its XDR type name as a string literal, so unlike
 * `constructor.name` it survives both the module boundary and minification.
 */
function isSignature(value: unknown): value is Signature {
  if (value instanceof Signature) return true;
  if (typeof value !== "object" || value === null) return false;
  const ctor = value.constructor as { schema?: { name?: string } } | undefined;
  if (ctor?.schema?.name !== Signature.schema.name) return false;
  // The brand alone isn't enough: an object can carry a matching `constructor`
  // as an own property without being usable. Optional chaining wouldn't help —
  // `?.` guards null/undefined, not a `toBytes` that is a string.
  return typeof (value as { toBytes?: unknown }).toBytes === "function";
}

/**
 * Normalizes the constructor's key input: strings are UTF-8 encoded and raw
 * bytes are copied (matching the `Buffer.from` behavior this replaced), so the
 * keypair never aliases caller-owned memory.
 */
function toBytes(input: Uint8Array | string): Uint8Array {
  return typeof input === "string"
    ? stringToUint8Array(input)
    : Uint8Array.from(input);
}

/**
 * `Keypair` represents public (and secret) keys of the account.
 *
 * Currently `Keypair` only supports ed25519 but in a future this class can be abstraction layer for other
 * public-key signature systems.
 *
 * Use more convenient methods to create `Keypair` object:
 * * `{@link Keypair.fromPublicKey}`
 * * `{@link Keypair.fromSecret}`
 * * `{@link Keypair.random}`
 */
export class Keypair {
  readonly type: "ed25519";
  private _publicKey: Uint8Array;
  private _secretSeed?: Uint8Array;
  private _secretKey?: Uint8Array;

  /**
   * @param keys - at least one of keys must be provided.
   * @param keys.type - public-key signature system name (currently only `ed25519` keys are supported)
   * @param keys.publicKey - raw public key
   * @param keys.secretKey - raw secret key (32-byte secret seed in ed25519)
   */
  constructor(
    keys:
      | {
          type: "ed25519";
          secretKey: Uint8Array | string;
          publicKey?: Uint8Array | string;
        }
      | { type: "ed25519"; publicKey: Uint8Array | string },
  ) {
    if (keys.type !== "ed25519") {
      throw new Error("Invalid keys type");
    }

    this.type = keys.type;

    if ("secretKey" in keys) {
      const secretKey = toBytes(keys.secretKey);

      if (secretKey.length !== 32) {
        throw new Error("secretKey length is invalid");
      }

      this._secretSeed = secretKey;
      this._publicKey = generate(secretKey);
      this._secretKey = secretKey;

      if (
        keys.publicKey &&
        !areUint8ArraysEqual(this._publicKey, toBytes(keys.publicKey))
      ) {
        throw new Error("secretKey does not match publicKey");
      }
    } else if ("publicKey" in keys) {
      this._publicKey = toBytes(keys.publicKey);

      if (this._publicKey.length !== 32) {
        throw new Error("publicKey length is invalid");
      }
    } else {
      throw new Error(
        "At least one of publicKey or secretKey must be provided",
      );
    }
  }

  /**
   * Creates a new `Keypair` instance from secret. This can either be secret key or secret seed depending
   * on underlying public-key signature system. Currently `Keypair` only supports ed25519.
   * @param secret - secret key (ex. `SDAK....`)
   */
  static fromSecret(secret: string): Keypair {
    const rawSecret = StrKey.decodeEd25519SecretSeed(secret);
    return this.fromRawEd25519Seed(rawSecret);
  }

  /**
   * Creates a new `Keypair` object from ed25519 secret key seed raw bytes.
   *
   * @param rawSeed - raw 32-byte ed25519 secret key seed
   */
  static fromRawEd25519Seed(rawSeed: Uint8Array): Keypair {
    return new this({ type: "ed25519", secretKey: rawSeed });
  }

  /**
   * Returns `Keypair` object representing network master key.
   * @param networkPassphrase - passphrase of the target stellar network (e.g. "Public Global Stellar Network ; September 2015")
   */
  static master(networkPassphrase: string): Keypair {
    if (!networkPassphrase) {
      throw new Error(
        "No network selected. Please pass a network argument, e.g. `Keypair.master(Networks.PUBLIC)`.",
      );
    }

    return this.fromRawEd25519Seed(hash(networkPassphrase));
  }

  /**
   * Creates a new `Keypair` object from public key.
   * @param publicKey - public key (ex. `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`)
   */
  static fromPublicKey(publicKey: string): Keypair {
    const rawPublicKey = StrKey.decodeEd25519PublicKey(publicKey);
    if (rawPublicKey.length !== 32) {
      throw new Error("Invalid Stellar public key");
    }

    return new this({ type: "ed25519", publicKey: rawPublicKey });
  }

  /**
   * Create a random `Keypair` object.
   */
  static random(): Keypair {
    const secretKey = ed.utils.randomSecretKey();
    return this.fromRawEd25519Seed(secretKey);
  }

  /** Returns this public key as an xdr.AccountId. */
  xdrAccountId(): AccountId {
    return PublicKey.publicKeyTypeEd25519(this._publicKey);
  }

  /** Returns this public key as an xdr.PublicKey. */
  xdrPublicKey(): PublicKey {
    return PublicKey.publicKeyTypeEd25519(this._publicKey);
  }

  /**
   * Creates a {@link xdr.MuxedAccount} object from the public key.
   *
   * You will get a different type of muxed account depending on whether or not
   * you pass an ID.
   *
   * @param [id] - stringified integer indicating the underlying muxed
   *     ID of the new account object
   */
  xdrMuxedAccount(id?: string): MuxedAccount {
    if (typeof id !== "undefined") {
      if (typeof id !== "string") {
        throw new TypeError(`expected string for ID, got ${typeof id}`);
      }

      return MuxedAccount.keyTypeMuxedEd25519(
        new MuxedAccountMed25519({
          id: Uint64.fromString(id),
          ed25519: this._publicKey,
        }),
      );
    }

    return MuxedAccount.keyTypeEd25519(this._publicKey);
  }

  /**
   * Returns raw public key bytes
   */
  rawPublicKey(): Uint8Array {
    return this._publicKey;
  }

  /**
   * Returns the signature hint for this keypair.
   * The hint is the last 4 bytes of the account ID XDR representation.
   */
  signatureHint(): Uint8Array {
    const a = this.xdrAccountId().toXdr();

    return a.slice(a.length - 4);
  }

  /**
   * Returns public key associated with this `Keypair` object.
   */
  publicKey(): string {
    return StrKey.encodeEd25519PublicKey(this._publicKey);
  }

  /**
   * Returns secret key associated with this `Keypair` object.
   *
   * The secret key is encoded in Stellar format (e.g., `SDAK....`).
   *
   * @throws {Error} if no secret key is available
   */
  secret(): string {
    if (!this._secretSeed) {
      throw new Error("no secret key available");
    }

    if (this.type === "ed25519") {
      return StrKey.encodeEd25519SecretSeed(this._secretSeed);
    }

    throw new Error("Invalid Keypair type");
  }

  /**
   * Returns raw secret key bytes.
   *
   * @throws {Error} if no secret seed is available
   */
  rawSecretKey(): Uint8Array {
    if (!this._secretSeed) {
      throw new Error("no secret seed available");
    }
    return this._secretSeed;
  }

  /**
   * Returns `true` if this `Keypair` object contains secret key and can sign.
   */
  canSign(): boolean {
    return !!this._secretKey;
  }

  /**
   * Signs data.
   *
   * @param data - data to sign
   * @throws {Error} if no secret key is available
   */
  sign(data: Uint8Array): Uint8Array {
    if (!this._secretKey) {
      throw new Error("cannot sign: no secret key available");
    }

    return sign(data, this._secretKey);
  }

  /**
   * Verifies if `signature` for `data` is valid.
   *
   * A well-formed signature that doesn't match returns `false`; an argument
   * that isn't byte-shaped throws, because reporting it as an invalid
   * signature would be indistinguishable from a forgery.
   *
   * @param data - signed data
   * @param signature - signature to verify, either raw bytes or the
   *    `xdr.Signature` wrapper that `DecoratedSignature.signature` holds
   * @throws a `TypeError` if `data` or `signature` is not byte-shaped
   */
  verify(data: Uint8Array, signature: Uint8Array | Signature): boolean {
    // `isUint8Array`, not `instanceof`: bytes from another realm (an iframe, a
    // worker, `node:vm`) are perfectly good and would fail an `instanceof`
    // check, which verified fine before this guard existed.
    if (!isUint8Array(data)) {
      throw new TypeError(`expected Uint8Array for data, got ${typeof data}`);
    }
    // `toBytes()`, not `toXdr()` — Signature is `opaque<64>`, so its XDR form
    // carries a 4-byte length prefix that would fail verification.
    const signatureBytes = isSignature(signature)
      ? signature.toBytes()
      : signature;
    if (!isUint8Array(signatureBytes)) {
      throw new TypeError(
        `expected Uint8Array or xdr.Signature for signature, got ${typeof signature}`,
      );
    }

    try {
      return verify(data, signatureBytes, this._publicKey);
    } catch {
      // A well-formed but invalid signature is a verdict, not an error.
      return false;
    }
  }

  /**
   * Signs an arbitrary message per SEP-53.
   *
   * The message is UTF-8 encoded (if a string), prefixed with the fixed
   * `"Stellar Signed Message:\n"` marker, hashed with SHA-256, and that hash is
   * signed with this keypair's ed25519 secret key.
   *
   * @param message - the message to sign (a UTF-8 string or raw bytes)
   * @returns the 64-byte ed25519 signature
   * @throws if no secret key is available
   * @see https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md
   */
  signMessage(message: string | Uint8Array): Uint8Array {
    return this.sign(this._hashMessage(message));
  }

  /**
   * Verifies a SEP-53 signed message against this keypair's public key.
   *
   * @param message - the original message (a UTF-8 string or raw bytes)
   * @param signature - the 64-byte signature to verify, either raw bytes or an
   *    `xdr.Signature` wrapper
   * @returns `true` if `signature` is valid for `message` and this key
   * @throws a `TypeError` if `message` or `signature` is not byte-shaped
   * @see https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md
   */
  verifyMessage(
    message: string | Uint8Array,
    signature: Uint8Array | Signature,
  ): boolean {
    return this.verify(this._hashMessage(message), signature);
  }

  /**
   * Computes the SEP-53 message hash:
   * `SHA-256("Stellar Signed Message:\n" + message)`.
   */
  private _hashMessage(message: string | Uint8Array): Uint8Array {
    if (typeof message !== "string" && !isUint8Array(message)) {
      throw new TypeError(
        `expected string or Uint8Array for message, got ${typeof message}`,
      );
    }
    const messageBytes =
      typeof message === "string" ? stringToUint8Array(message) : message;
    return hash(concatUint8Arrays([MESSAGE_PREFIX, messageBytes]));
  }

  /**
   * Returns the decorated signature (hint+sig) for arbitrary data.
   *
   * The returned structure can be added directly to a transaction envelope.
   *
   * @param data - arbitrary data to sign
   *
   * @see TransactionBase.addDecoratedSignature
   */
  signDecorated(data: Uint8Array): DecoratedSignature {
    const signature = this.sign(data);
    const hint = this.signatureHint();

    return new DecoratedSignature({ hint, signature });
  }

  /**
   * Returns the raw decorated signature (hint+sig) for a signed payload signer.
   *
   *  The hint is defined as the last 4 bytes of the signer key XORed with last
   *  4 bytes of the payload (zero-left-padded if necessary).
   *
   * @param data - data to both sign and treat as the payload
   *
   * @see https://github.com/stellar/stellar-protocol/blob/master/core/cap-0040.md#signature-hint
   * @see TransactionBase.addDecoratedSignature
   */
  signPayloadDecorated(data: Uint8Array): DecoratedSignature {
    const signature = this.sign(data);
    const keyHint = this.signatureHint();

    const hint = new Uint8Array(4);
    hint.set(data.slice(-4), 0);

    // XOR each byte of hint with corresponding byte of keyHint
    for (let i = 0; i < hint.length; i++) {
      hint[i] = (hint[i] as number) ^ (keyHint[i] as number);
    }

    return new DecoratedSignature({
      hint,
      signature,
    });
  }
}
