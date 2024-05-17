import { Keypair, TransactionBuilder, hash } from "@stellar/stellar-base";
import type { AssembledTransaction } from "./assembled_transaction";
import type { Client } from "./client";

/**
 * For use with {@link Client} and {@link AssembledTransaction}.
 * Implements `signTransaction` and `signAuthEntry` with signatures expected by
 * those classes. This is useful for testing and maybe some simple Node
 * applications. Feel free to use this as a starting point for your own
 * Wallet/TransactionSigner implementation.
 */
export const basicNodeSigner = (
  /** {@link Keypair} to use to sign the transaction or auth entry */
  keypair: Keypair,
  /** passphrase of network to sign for */
  networkPassphrase: string,
) => ({
  // eslint-disable-next-line require-await
  signTransaction: async (tx: string) => {
    const t = TransactionBuilder.fromXDR(tx, networkPassphrase);
    t.sign(keypair);
    return t.toXDR();
  },
  // eslint-disable-next-line require-await
  signAuthEntry: async (entryXdr: string): Promise<string> =>
    keypair.sign(hash(Buffer.from(entryXdr, "base64"))).toString("base64"),
});
