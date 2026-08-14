import {
  AccountId,
  Operation,
  OperationBody,
  SetOptionsOp,
  Signer,
  SignerKey,
  SignerKeyEd25519SignedPayload,
} from "../../xdr/index.js";
import { hexToUint8Array } from "uint8array-extras";
import { Keypair } from "../keypair.js";
import { StrKey } from "../strkey.js";
import { SetOptionsOpts, OperationAttributes, SignerOpts } from "./types.js";
import { checkUnsignedIntValue, setSourceAccount } from "../util/operations.js";

function weightCheckFunction(value: number, name: string): boolean {
  if (value >= 0 && value <= 255) {
    return true;
  }
  throw new Error(`${name} value must be between 0 and 255`);
}

/**
 * Returns an XDR SetOptionsOp. A "set options" operations set or clear account flags,
 * set the account's inflation destination, and/or add new signers to the account.
 * The flags used in `opts.clearFlags` and `opts.setFlags` can be the following:
 *   - `{@link AuthRequiredFlag}`
 *   - `{@link AuthRevocableFlag}`
 *   - `{@link AuthImmutableFlag}`
 *   - `{@link AuthClawbackEnabledFlag}`
 *
 * It's possible to set/clear multiple flags at once using logical or.
 *
 *
 * @param opts - Options object
 *   - `inflationDest`: Set this account ID as the account's inflation destination.
 *   - `clearFlags`: Bitmap integer for which account flags to clear.
 *   - `setFlags`: Bitmap integer for which account flags to set.
 *   - `masterWeight`: The master key weight.
 *   - `lowThreshold`: The sum weight for the low threshold.
 *   - `medThreshold`: The sum weight for the medium threshold.
 *   - `highThreshold`: The sum weight for the high threshold.
 *   - `signer`: Add or remove a signer from the account. The signer is
 *     deleted if the weight is 0. Only one of `ed25519PublicKey`, `sha256Hash`, `preAuthTx` should be defined.
 *     - `ed25519PublicKey`: The ed25519 public key of the signer.
 *     - `sha256Hash`: sha256 hash (Uint8Array or hex string) of preimage that will unlock funds. Preimage should be used as signature of future transaction.
 *     - `preAuthTx`: Hash (Uint8Array or hex string) of transaction that will unlock funds.
 *     - `ed25519SignedPayload`: Signed payload signer (ed25519 public key + raw payload) for atomic transaction signature disclosure.
 *     - `weight`: The weight of the new signer (0 to delete or 1-255)
 *   - `homeDomain`: sets the home domain used for reverse federation lookup.
 *   - `source`: The source account (defaults to transaction source).
 * @see [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)
 */
export function setOptions<T extends SignerOpts = never>(
  opts: SetOptionsOpts<T>,
): Operation {
  let inflationDest: AccountId | null = null;

  if (opts.inflationDest) {
    if (!StrKey.isValidEd25519PublicKey(opts.inflationDest)) {
      throw new Error("inflationDest is invalid");
    }
    inflationDest = Keypair.fromPublicKey(opts.inflationDest).xdrAccountId();
  }

  const clearFlags =
    checkUnsignedIntValue("clearFlags", opts.clearFlags) ?? null;
  const setFlags = checkUnsignedIntValue("setFlags", opts.setFlags) ?? null;
  const masterWeight =
    checkUnsignedIntValue(
      "masterWeight",
      opts.masterWeight,
      weightCheckFunction,
    ) ?? null;
  const lowThreshold =
    checkUnsignedIntValue(
      "lowThreshold",
      opts.lowThreshold,
      weightCheckFunction,
    ) ?? null;
  const medThreshold =
    checkUnsignedIntValue(
      "medThreshold",
      opts.medThreshold,
      weightCheckFunction,
    ) ?? null;
  const highThreshold =
    checkUnsignedIntValue(
      "highThreshold",
      opts.highThreshold,
      weightCheckFunction,
    ) ?? null;

  if (opts.homeDomain !== undefined && typeof opts.homeDomain !== "string") {
    throw new TypeError("homeDomain argument must be of type String");
  }
  const homeDomain = opts.homeDomain;

  let signer: Signer | null = null;

  if (opts.signer) {
    const weight = checkUnsignedIntValue(
      "signer.weight",
      opts.signer.weight,
      weightCheckFunction,
    );
    let key: SignerKey | undefined;

    let setValues = 0;

    if (opts.signer.ed25519PublicKey) {
      if (!StrKey.isValidEd25519PublicKey(opts.signer.ed25519PublicKey)) {
        throw new Error("signer.ed25519PublicKey is invalid.");
      }
      const rawKey = StrKey.decodeEd25519PublicKey(
        opts.signer.ed25519PublicKey,
      );

      key = SignerKey.signerKeyTypeEd25519(rawKey);
      setValues += 1;
    }

    if (opts.signer.preAuthTx) {
      let preAuthTx: Uint8Array;
      if (typeof opts.signer.preAuthTx === "string") {
        preAuthTx = hexToUint8Array(opts.signer.preAuthTx);
      } else {
        preAuthTx = opts.signer.preAuthTx;
      }

      if (!(preAuthTx instanceof Uint8Array && preAuthTx.length === 32)) {
        throw new Error("signer.preAuthTx must be 32 bytes Uint8Array.");
      }

      key = SignerKey.signerKeyTypePreAuthTx(preAuthTx);
      setValues += 1;
    }

    if (opts.signer.sha256Hash) {
      let sha256Hash: Uint8Array;
      if (typeof opts.signer.sha256Hash === "string") {
        sha256Hash = hexToUint8Array(opts.signer.sha256Hash);
      } else {
        sha256Hash = opts.signer.sha256Hash;
      }

      if (!(sha256Hash instanceof Uint8Array && sha256Hash.length === 32)) {
        throw new Error("signer.sha256Hash must be 32 bytes Uint8Array.");
      }

      key = SignerKey.signerKeyTypeHashX(sha256Hash);
      setValues += 1;
    }

    if (opts.signer.ed25519SignedPayload) {
      if (!StrKey.isValidSignedPayload(opts.signer.ed25519SignedPayload)) {
        throw new Error("signer.ed25519SignedPayload is invalid.");
      }
      const rawKey = StrKey.decodeSignedPayload(
        opts.signer.ed25519SignedPayload,
      );
      const signedPayloadXdr = SignerKeyEd25519SignedPayload.fromXdr(rawKey);

      key = SignerKey.signerKeyTypeEd25519SignedPayload(signedPayloadXdr);
      setValues += 1;
    }

    if (setValues !== 1) {
      throw new Error(
        "Signer object must contain exactly one of signer.ed25519PublicKey, signer.sha256Hash, signer.preAuthTx, or signer.ed25519SignedPayload.",
      );
    }
    if (weight === undefined) {
      throw new Error("signer weight is required.");
    }
    if (key === undefined) {
      throw new Error("signer key is required.");
    }
    signer = new Signer({ key: key, weight: weight });
  }

  const setOptionsOp = new SetOptionsOp({
    inflationDest,
    clearFlags,
    setFlags,
    masterWeight,
    lowThreshold,
    medThreshold,
    highThreshold,
    homeDomain: homeDomain ?? null,
    signer,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.setOptions(setOptionsOp),
  };
  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}
