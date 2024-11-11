import { Keypair, TransactionBuilder, hash } from "@stellar/stellar-base";
import type { Client } from "./client";

/**
 * For use with {@link Client} and {@link module:contract.AssembledTransaction}.
 * Implements `signTransaction` and `signAuthEntry` with signatures expected by
 * those classes. This is useful for testing and maybe some simple Node
 * applications. Feel free to use this as a starting point for your own
 * Wallet/TransactionSigner implementation.
 *
 * @memberof module:contract
 *
 * @param {Keypair} keypair {@link Keypair} to use to sign the transaction or auth entry
 * @param {string} networkPassphrase passphrase of network to sign for
 */
export const basicNodeSigner = (
  keypair: Keypair,
  networkPassphrase: string,
) => ({
  // eslint-disable-next-line require-await
  signTransaction: async (
    xdr: string,
    opts?: {
      networkPassphrase?: string;
      address?: string;
      submit?: boolean;
      submitUrl?: string;
    }
  ): Promise<{ signedTxXdr: string; signerAddress: string; error?: Error }> => {
    try {
      const t = TransactionBuilder.fromXDR(xdr, opts?.networkPassphrase || networkPassphrase);
      t.sign(keypair);
      return {
        signedTxXdr: t.toXDR(),
        signerAddress: keypair.publicKey(),
      };
    } catch (error) {
      return {
        signedTxXdr: '',
        signerAddress: keypair.publicKey(),
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },
  // eslint-disable-next-line require-await
  signAuthEntry: async (
    authEntry: string,
  ): Promise<{ signedAuthEntry: string; signerAddress: string; error?: Error }> => {
    try {
      const signedAuthEntry = keypair.sign(hash(Buffer.from(authEntry, "base64"))).toString("base64");
      return {
        signedAuthEntry,
        signerAddress: keypair.publicKey(),
      };
    } catch (error) {
      return {
        signedAuthEntry: '',
        signerAddress: keypair.publicKey(),
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },
});