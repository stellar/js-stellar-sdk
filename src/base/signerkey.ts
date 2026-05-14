import {
  SignerKey as XdrSignerKey,
  SignerKeyEd25519SignedPayload,
} from "./generated/index.js";
import { StrKey, encodeCheck, decodeCheck } from "./strkey.js";

type SignerStrKeyType =
  | "ed25519PublicKey"
  | "preAuthTx"
  | "sha256Hash"
  | "signedPayload";

/**
 * A container class with helpers to convert between signer keys
 * (`XdrSignerKey`) and {@link StrKey}s.
 *
 * It's primarily used for manipulating the `extraSigners` precondition on a
 * {@link Transaction}.
 *
 * @see {@link TransactionBuilder.setExtraSigners}
 */
export class SignerKey {
  /**
   * Decodes a StrKey address into an XdrSignerKey instance.
   *
   * Only ED25519 public keys (G...), pre-auth transactions (T...), hashes
   * (H...), and signed payloads (P...) can be signer keys.
   *
   * @param address - a StrKey-encoded signer address
   */
  static decodeAddress(address: string): XdrSignerKey {
    const vb = StrKey.getVersionByteForPrefix(address);
    if (vb === undefined) {
      throw new Error(`invalid signer key type (${vb})`);
    }

    const raw = decodeCheck(vb, address);
    switch (vb) {
      case "signedPayload": {
        const payloadLen = new DataView(
          raw.buffer,
          raw.byteOffset,
          raw.byteLength,
        ).getUint32(32, false);
        return XdrSignerKey.signerKeyTypeEd25519SignedPayload({
          ed25519: raw.subarray(0, 32),
          payload: raw.subarray(36, 36 + payloadLen),
        });
      }

      case "ed25519PublicKey":
        return XdrSignerKey.signerKeyTypeEd25519(raw);

      case "preAuthTx":
        return XdrSignerKey.signerKeyTypePreAuthTx(raw);

      case "sha256Hash":
        return XdrSignerKey.signerKeyTypeHashX(raw);

      default:
        throw new Error(`invalid signer key type (${vb})`);
    }
  }

  /**
   * Encodes a signer key into its StrKey equivalent.
   *
   * @param signerKey - the signer
   */
  static encodeSignerKey(signerKey: XdrSignerKey): string {
    let strkeyType: SignerStrKeyType;
    let raw: Buffer;

    switch (signerKey.type) {
      case "signerKeyTypeEd25519":
        strkeyType = "ed25519PublicKey";
        raw = Buffer.from(signerKey.ed25519);
        break;

      case "signerKeyTypePreAuthTx":
        strkeyType = "preAuthTx";
        raw = Buffer.from(signerKey.preAuthTx);
        break;

      case "signerKeyTypeHashX":
        strkeyType = "sha256Hash";
        raw = Buffer.from(signerKey.hashX);
        break;

      case "signerKeyTypeEd25519SignedPayload":
        strkeyType = "signedPayload";
        raw = Buffer.from(
          SignerKeyEd25519SignedPayload.toXDR(
            signerKey.ed25519SignedPayload,
            "raw",
          ),
        );
        break;

      default:
        throw new Error("invalid SignerKey");
    }

    return encodeCheck(strkeyType, raw);
  }
}
