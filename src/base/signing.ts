import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";

ed.hashes.sha512 = sha512;
/**
 * Derives an Ed25519 public key from a secret key.
 *
 * @param secretKey - the raw Ed25519 secret key
 */
export function generate(secretKey: Uint8Array): Uint8Array {
  return ed.getPublicKey(secretKey);
}

/**
 * Signs data using an Ed25519 secret key.
 *
 * @param data - the data to sign
 * @param rawSecret - the raw Ed25519 secret key
 */
export function sign(data: Uint8Array, rawSecret: Uint8Array): Uint8Array {
  return ed.sign(data, rawSecret);
}

/**
 * Verifies an Ed25519 signature against the given data and public key.
 *
 * @param data - the original signed data
 * @param signature - the signature to verify
 * @param rawPublicKey - the raw Ed25519 public key
 */
export function verify(
  data: Uint8Array,
  signature: Uint8Array,
  rawPublicKey: Uint8Array,
): boolean {
  return ed.verify(signature, data, rawPublicKey, {
    zip215: false,
  });
}
