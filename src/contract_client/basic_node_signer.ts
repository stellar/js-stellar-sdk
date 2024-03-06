import { Keypair, TransactionBuilder, hash } from '..'

/**
 * For use with {@link ContractClient} and {@link AssembledTransaction}.
 * Implements `signTransaction` and `signAuthEntry` with signatures expected by
 * those classes. This is useful for testing and maybe some simple Node
 * applications. Feel free to use this as a starting point for your own
 * Wallet/TransactionSigner implementation.
 */
export class BasicNodeSigner {
  constructor(
    private keypair: Keypair,
    private networkPassphrase: string,
  ) {}

  signTransaction = async (tx: string) => {
    const t = TransactionBuilder.fromXDR(tx, this.networkPassphrase);
    t.sign(this.keypair);
    return t.toXDR();
  }

  signAuthEntry = async (entryXdr: string): Promise<string> => {
    return this.keypair
      .sign(hash(Buffer.from(entryXdr, "base64")))
      .toString('base64')
  }
}
