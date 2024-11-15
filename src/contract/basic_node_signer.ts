import { Keypair, TransactionBuilder, hash } from '@stellar/stellar-base';
import { ClientOptions } from './types';
import type { Client } from './client';

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
  networkPassphrase: string
) => ({
  // eslint-disable-next-line require-await
  signTransaction: async (
    tx: string,
    clientOptions: ClientOptions,
    opts?: {
      network?: string;
      networkPassphrase?: string;
      accountToSign?: string;
    }
  ): Promise<string> => {
    const { signTransaction } = clientOptions;
    const networkPassphraseUsed = opts?.networkPassphrase || networkPassphrase;

    if (signTransaction instanceof Keypair) {
      const signer = basicNodeSigner(signTransaction, networkPassphraseUsed);

        const updatedOptions: ClientOptions = {
          ...clientOptions,
          networkPassphrase: networkPassphraseUsed,
        };

      return signer.signTransaction(tx, updatedOptions, opts);
    }

    if (typeof signTransaction === 'function') {
      const t = TransactionBuilder.fromXDR(tx, networkPassphraseUsed);
      t.sign(keypair);
      return t.toXDR();
    }

    throw new Error('No valid signTransaction method provided');
  },
  // eslint-disable-next-line require-await
  signAuthEntry: async (entryXdr: string): Promise<string> =>
    keypair.sign(hash(Buffer.from(entryXdr, 'base64'))).toString('base64'),
});
