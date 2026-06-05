import xdr from "./xdr.js";
import { StrKey, encodeCheck, decodeCheck } from "./strkey.js";

type SignerStrKeyType =
  | "ed25519PublicKey"
  | "preAuthTx"
  | "sha256Hash"
  | "signedPayload";

/**
 * A container class with helpers to convert between signer keys
 * (`xdr.SignerKey`) and {@link StrKey}s.
 *
 * It's primarily used for manipulating the `extraSigners` precondition on a
 * {@link Transaction}.
 *
 * @see {@link TransactionBuilder.setExtraSigners}
 */
export class SignerKey {
  /**
   * Decodes a StrKey address into an xdr.SignerKey instance.
   *
   * Only ED25519 public keys (G...), pre-auth transactions (T...), hashes
   * (H...), and signed payloads (P...) can be signer keys.
   *
   * @param address - a StrKey-encoded signer address
   */
  static decodeAddress(address: string): xdr.SignerKey {
    const vb = StrKey.getVersionByteForPrefix(address);
    if (vb === undefined) {
      throw new Error(`invalid signer key type (${vb})`);
    }

    const raw = decodeCheck(vb, address);
    switch (vb) {
      case "signedPayload":
        return xdr.SignerKey.signerKeyTypeEd25519SignedPayload(
          new xdr.SignerKeyEd25519SignedPayload({
            ed25519: raw.subarray(0, 32),
            payload: raw.subarray(36, 36 + raw.readUInt32BE(32)),
          }),
        );

      case "ed25519PublicKey":
        return xdr.SignerKey.signerKeyTypeEd25519(raw);

      case "preAuthTx":
        return xdr.SignerKey.signerKeyTypePreAuthTx(raw);

      case "sha256Hash":
        return xdr.SignerKey.signerKeyTypeHashX(raw);

      default:
        throw new Error(`invalid signer key type (${vb})`);
    }
  }

  /**
   * Encodes a signer key into its StrKey equivalent.
   *
   * @param signerKey - the signer
   */
  static encodeSignerKey(signerKey: xdr.SignerKey): string {
    let strkeyType: SignerStrKeyType;
    let raw: Buffer;

    switch (signerKey.switch()) {
      case xdr.SignerKeyType.signerKeyTypeEd25519():
        strkeyType = "ed25519PublicKey";
        raw = signerKey.value() as Buffer;
        break;

      case xdr.SignerKeyType.signerKeyTypePreAuthTx():
        strkeyType = "preAuthTx";
        raw = signerKey.value() as Buffer;
        break;

      case xdr.SignerKeyType.signerKeyTypeHashX():
        strkeyType = "sha256Hash";
        raw = signerKey.value() as Buffer;
        break;

      case xdr.SignerKeyType.signerKeyTypeEd25519SignedPayload():
        strkeyType = "signedPayload";
        raw = signerKey.ed25519SignedPayload().toXDR("raw");
        break;

      default:
        throw new Error(`invalid SignerKey (type: ${signerKey.switch().name})`);
    }

    return encodeCheck(strkeyType, raw);
  }
}
