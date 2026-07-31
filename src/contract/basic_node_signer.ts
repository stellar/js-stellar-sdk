import { Keypair } from "../base/index.js";
import type { Client } from "./client.js";
import { KeypairSigner } from "./signer.js";
import type { SignAuthEntry, SignTransaction } from "./types.js";

/**
 * For use with {@link Client} and {@link contract.AssembledTransaction}.
 * Implements `signTransaction` and `signAuthEntry` with signatures expected by
 * those classes. This is useful for testing and maybe some simple Node
 * applications. Feel free to use this as a starting point for your own
 * Wallet/TransactionSigner implementation.
 *
 * Prefer {@link KeypairSigner}, which does the same thing and also carries the
 * signer's address, so you can pass one object instead of spreading two
 * functions. You can also pass a {@link Keypair} directly as `signTransaction`.
 *
 * @param keypair - {@link Keypair} to use to sign the transaction or auth entry
 * @param networkPassphrase - passphrase of network to sign for
 */
export const basicNodeSigner = (
  keypair: Keypair,
  networkPassphrase: string,
): {
  signTransaction: SignTransaction;
  signAuthEntry: SignAuthEntry;
} => {
  const { signTransaction, signAuthEntry } = new KeypairSigner(
    keypair,
    networkPassphrase,
  );
  return { signTransaction, signAuthEntry };
};
