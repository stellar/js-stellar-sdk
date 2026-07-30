import { Keypair, TransactionBuilder, hash } from "../base/index.js";
import type { SignAuthEntry, SignTransaction } from "./types.js";

/**
 * A signing identity: something that can sign, and that knows who it is.
 *
 * A bare {@link SignTransaction} callback carries no identity, so callers have
 * to pass the signer's address alongside it and keep the two in sync. A
 * `Signer` bundles them.
 *
 * `address` is deliberately a plain string rather than an Ed25519 public key:
 * it is a `G…` account address for keypair-backed signers, but may be a `C…`
 * contract address for smart accounts, whose signatures are not Ed25519 at all.
 *
 * `signTransaction` and `signAuthEntry` keep the exact shapes the SDK already
 * accepts (those of SEP-43 wallets such as Freighter), so an existing wallet
 * object becomes a `Signer` by gaining an `address`.
 *
 * `signAuthEntry` is optional because not every wallet implements it; it is
 * only needed for multi-party (non-invoker) auth entry signing.
 *
 * Accepted wherever the SDK takes a signing callback: the `signTransaction` and
 * `signAuthEntry` options on `ClientOptions` and `MethodOptions`, and the
 * per-call overrides on `AssembledTransaction`'s `sign`, `signAndSend`, and
 * `signAuthEntries`.
 */
export interface Signer {
  /** The address this signer signs as: `G…` for accounts, `C…` for contracts. */
  readonly address: string;
  /** Signs a transaction envelope. Matches `signTransaction` from Freighter. */
  signTransaction: SignTransaction;
  /** Signs an auth entry preimage. Matches `signAuthEntry` from Freighter. */
  signAuthEntry?: SignAuthEntry;
}

/**
 * A {@link Signer} backed by a local {@link Keypair}.
 *
 * Suitable for Node applications, scripts, and tests — anywhere the secret key
 * lives in the same process. For browser applications, use the SEP-43 wallet's
 * own `signTransaction`, or wrap it in an object satisfying {@link Signer}.
 *
 * @example
 * ```ts
 * import { Keypair } from "@stellar/stellar-sdk";
 * import { Client, KeypairSigner } from "@stellar/stellar-sdk/contract";
 *
 * const keypair = Keypair.fromSecret(secret);
 * const client = await Client.from({
 *   contractId,
 *   networkPassphrase,
 *   rpcUrl,
 *   publicKey: keypair.publicKey(),
 *   signTransaction: new KeypairSigner(keypair, networkPassphrase),
 * });
 * ```
 */
export class KeypairSigner implements Signer {
  /**
   * The keypair's Ed25519 account address (`G…`), always `keypair.publicKey()`.
   */
  readonly address: string;

  /**
   * @param keypair - the {@link Keypair} to sign with. Signing throws
   *    `cannot sign: no secret key available` if it holds only a public key.
   * @param networkPassphrase - passphrase of the network to sign for, used
   *    whenever the caller does not pass one at signing time
   */
  constructor(
    private readonly keypair: Keypair,
    private readonly networkPassphrase: string,
  ) {
    this.address = keypair.publicKey();
  }

  /* Arrow instance properties rather than prototype methods because
     `basicNodeSigner` destructures them into a plain object, which would lose
     `this` on a prototype method. (The normalizers below tolerate either, since
     they bind what they extract.)

     They stay `async` despite having nothing to await (hence the rule
     suppressions): that way a synchronous failure — malformed XDR, or a keypair
     holding no secret key — rejects the returned promise instead of throwing,
     preserving the behavior `basicNodeSigner` had before it delegated here. */

  // eslint-disable-next-line @typescript-eslint/require-await
  signTransaction: SignTransaction = async (xdr, opts) => {
    const t = TransactionBuilder.fromXDR(
      xdr,
      opts?.networkPassphrase || this.networkPassphrase,
    );

    t.sign(this.keypair);

    return {
      signedTxXdr: t.toXDR(),
      signerAddress: this.address,
    };
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  signAuthEntry: SignAuthEntry = async (authEntry) => {
    const signedAuthEntry = this.keypair
      .sign(hash(Buffer.from(authEntry, "base64")))
      .toString("base64");

    return {
      signedAuthEntry,
      signerAddress: this.address,
    };
  };
}

/**
 * Anything accepted where a `signTransaction` callback is expected: the raw
 * SEP-43 callback, a {@link Signer}, or a {@link Keypair}.
 */
export type SignTransactionLike = SignTransaction | Signer | Keypair;

/**
 * Anything accepted where a `signAuthEntry` callback is expected: the raw
 * SEP-43 callback, a {@link Signer}, or a {@link Keypair}.
 */
export type SignAuthEntryLike = SignAuthEntry | Signer | Keypair;

/**
 * Recognizes a {@link Keypair} by the three members {@link KeypairSigner} calls:
 * `publicKey` for the address, `sign` for auth entries, and `signDecorated`,
 * which `Transaction.sign` reaches for when signing an envelope. All three are
 * required, so a partial object is refused here rather than yielding a callback
 * that throws once it is actually used.
 *
 * Structural rather than `instanceof` on purpose: this package ships a CJS and
 * an ESM build whose `Keypair` classes are distinct objects, so a keypair made
 * through one entry point fails `instanceof` against the other despite working
 * perfectly. Duplicate copies of the SDK in one dependency tree do the same.
 *
 * Only ever reached after a `Signer` has been ruled out, so an object carrying
 * `signTransaction` can never be misrouted here.
 */
function isKeypairLike(value: object): value is Keypair {
  return (
    "publicKey" in value &&
    typeof value.publicKey === "function" &&
    "sign" in value &&
    typeof value.sign === "function" &&
    "signDecorated" in value &&
    typeof value.signDecorated === "function"
  );
}

/** @internal */
export function signerAddress(
  value: SignAuthEntryLike | undefined,
): string | undefined {
  if (value == null || typeof value !== "object") return undefined;
  if ("signTransaction" in value && typeof value.address === "string") {
    return value.address;
  }
  return isKeypairLike(value) ? value.publicKey() : undefined;
}

/**
 * Reduces the accepted signing shapes down to a plain callback.
 *
 * Anything that carries no usable callback yields `undefined` — including an
 * absent value, or an object that does not match any accepted shape — so the
 * caller decides how to report a missing signer. This is deliberately lenient:
 * callers reaching the SDK from plain JavaScript are not held to the types, and
 * a clear `NoSigner` beats a `TypeError` from deep inside a normalizer.
 *
 * Internal: called at the entry points that read a caller-supplied signer, so
 * the rest of the code only ever deals with a `SignTransaction`.
 */
export function toSignTransaction(
  value: SignTransactionLike | undefined,
  networkPassphrase: string,
): SignTransaction | undefined {
  // `== null` so an explicit `null` from a JS caller behaves like `undefined`.
  if (value == null) return undefined;

  if (typeof value === "function") return value;

  // Guards the `in` checks below, which throw on primitives.
  if (typeof value !== "object") return undefined;

  // `signTransaction` is a `Signer`'s required member, so it identifies one.
  // Bound because a `Signer` may implement it as a prototype method that relies
  // on `this`; a bare reference would lose its receiver. The `typeof` check is
  // for untyped callers: a present-but-non-function member has no `bind`.
  if ("signTransaction" in value) {
    const fn = value.signTransaction;
    return typeof fn === "function" ? fn.bind(value) : undefined;
  }

  if (isKeypairLike(value)) {
    return new KeypairSigner(value, networkPassphrase).signTransaction;
  }

  return undefined;
}

/**
 * Reduces the accepted signing shapes down to a plain callback.
 *
 * A {@link Signer} whose optional `signAuthEntry` is absent yields `undefined`,
 * so the caller reports it the same way it reports a missing option.
 *
 * Internal: see {@link toSignTransaction}.
 */
export function toSignAuthEntry(
  value: SignAuthEntryLike | undefined,
  networkPassphrase: string,
): SignAuthEntry | undefined {
  if (value == null) return undefined;

  if (typeof value === "function") return value;

  if (typeof value !== "object") return undefined;

  // Identified and bound as in `toSignTransaction`. The `typeof` check also
  // covers the ordinary case of a `Signer` that omits the optional
  // `signAuthEntry`, which is reported as `undefined`.
  if ("signTransaction" in value) {
    const fn = value.signAuthEntry;
    return typeof fn === "function" ? fn.bind(value) : undefined;
  }

  if (isKeypairLike(value)) {
    return new KeypairSigner(value, networkPassphrase).signAuthEntry;
  }

  return undefined;
}
