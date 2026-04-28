import { ed25519 } from "@noble/curves/ed25519";

/**
 * Derives an Ed25519 public key from a secret key.
 *
 * @param secretKey - the raw Ed25519 secret key
 */
export function generate(secretKey: Buffer | Uint8Array): Buffer {
  return Buffer.from(ed25519.getPublicKey(secretKey));
}

/**
 * Signs data using an Ed25519 secret key.
 *
 * @param data - the data to sign
 * @param rawSecret - the raw Ed25519 secret key
 */
export function sign(data: Buffer, rawSecret: Buffer | Uint8Array): Buffer {
  return Buffer.from(ed25519.sign(Buffer.from(data), rawSecret));
}

/**
 * Verifies an Ed25519 signature against the given data and public key.
 *
 * @param data - the original signed data
 * @param signature - the signature to verify
 * @param rawPublicKey - the raw Ed25519 public key
 */
export function verify(
  data: Buffer,
  signature: Buffer,
  rawPublicKey: Buffer | Uint8Array,
): boolean {
  return ed25519.verify(
    Buffer.from(signature),
    Buffer.from(data),
    Buffer.from(rawPublicKey),
    {
      zip215: false,
    },
  );
}
