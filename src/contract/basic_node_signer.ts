import { base64ToUint8Array, uint8ArrayToBase64 } from "uint8array-extras";
import { Keypair, TransactionBuilder, hash } from "../base/index.js";
import type { Client } from "./client.js";
import type { SignAuthEntry, SignTransaction } from "./types.js";

/**
 * For use with {@link Client} and {@link contract.AssembledTransaction}.
 * Implements `signTransaction` and `signAuthEntry` with signatures expected by
 * those classes. This is useful for testing and maybe some simple Node
 * applications. Feel free to use this as a starting point for your own
 * Wallet/TransactionSigner implementation.
 *
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
} => ({
  // eslint-disable-next-line @typescript-eslint/require-await
  signTransaction: async (xdr, opts) => {
    const t = TransactionBuilder.fromXdr(
      xdr,
      opts?.networkPassphrase || networkPassphrase,
    );
    t.sign(keypair);
    return {
      signedTxXdr: t.toXdr(),
      signerAddress: keypair.publicKey(),
    };
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  signAuthEntry: async (authEntry) => {
    const signedAuthEntry = uint8ArrayToBase64(
      keypair.sign(hash(base64ToUint8Array(authEntry))),
    );
    return {
      signedAuthEntry,
      signerAddress: keypair.publicKey(),
    };
  },
});
