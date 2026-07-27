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
 * `signAuthEntry` is optional because not every wallet implements it; it is only
 * needed for multi-party (non-invoker) auth entry signing.
 *
 * Accepted anywhere a `signTransaction` callback is, i.e. in
 * {@link ClientOptions}, {@link MethodOptions},
 * {@link contract.AssembledTransaction.sign | sign}, and
 * {@link contract.AssembledTransaction.signAndSend | signAndSend}.
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
 * @param keypair - the {@link Keypair} to sign with; needs a secret key
 * @param networkPassphrase - passphrase of the network to sign for, used when
 *    the caller does not pass one at signing time
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
  readonly address: string;

  constructor(
    private readonly keypair: Keypair,
    private readonly networkPassphrase: string,
  ) {
    this.address = keypair.publicKey();
  }

  /* These are arrow instance properties rather than prototype methods because
     callers pull them off the instance as bare functions — `basicNodeSigner`
     spreads them, and the normalizers below extract them — which would lose
     `this` on a prototype method. */

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
 * Anything accepted where a `signAuthEntry` callback is expected.
 */
export type SignAuthEntryLike = SignAuthEntry | Signer | Keypair;

/**
 * Reduces the accepted signing shapes down to a plain callback.
 *
 * Internal: called at the entry points that read a caller-supplied signer, so
 * the rest of the code only ever deals with a `SignTransaction`.
 */
export function toSignTransaction(
  value: SignTransactionLike,
  networkPassphrase: string,
): SignTransaction;
export function toSignTransaction(
  value: SignTransactionLike | undefined,
  networkPassphrase: string,
): SignTransaction | undefined;
export function toSignTransaction(
  value: SignTransactionLike | undefined,
  networkPassphrase: string,
): SignTransaction | undefined {
  if (value === undefined) return undefined;
  if (value instanceof Keypair) {
    return new KeypairSigner(value, networkPassphrase).signTransaction;
  }
  if (typeof value === "function") return value;
  return value.signTransaction;
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
  if (value === undefined) return undefined;
  if (value instanceof Keypair) {
    return new KeypairSigner(value, networkPassphrase).signAuthEntry;
  }
  if (typeof value === "function") return value;
  return value.signAuthEntry;
}
