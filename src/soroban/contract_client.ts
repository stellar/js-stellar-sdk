import { AssembledTransaction } from '.'
import { Account, ContractSpec, Keypair, SorobanRpc, TransactionBuilder, hash, xdr } from '..'

export type XDR_BASE64 = string;

export interface Wallet {
  getPublicKey: () => Promise<string | undefined>;
  signTransaction: (
    tx: XDR_BASE64,
    opts?: {
      network?: string;
      networkPassphrase?: string;
      accountToSign?: string;
    }
  ) => Promise<XDR_BASE64>;
  signAuthEntry: (
    entryXdr: XDR_BASE64,
    opts?: {
      accountToSign?: string;
    }
  ) => Promise<XDR_BASE64>;
}

/**
 * An example Wallet implementation that can be used for testing and potentially some simple Node.js applications. Feel free to use this as a starting point for your own Wallet implementation.
 */
export class ExampleNodeWallet implements Wallet {
  constructor(
    private keypair: Keypair,
    private networkPassphrase: string,
  ) {}

  getPublicKey = () => Promise.resolve(this.keypair.publicKey());

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

export interface AcceptsWalletOrAccount {
  /**
   * A Wallet interface, such as Freighter, that has the methods
   * `getPublicKey`, `signTransaction`, and `signAuthEntry`. Example:
   *
   * @example
   * ```ts
   * import freighter from "@stellar/freighter-api";
   * import { Contract } from "test_custom_types";
   * const contract = new Contract({
   *   …,
   *   wallet: freighter,
   * })
   * ```
   */
  wallet?: Wallet;

  /**
   * You can pass in `wallet` OR `account`, but not both. If you only pass
   * `wallet`, `account` will be derived from it. If you can bypass this
   * behavior by passing in your own account object.
   */
  account?: Account | Promise<Account>;
};

export const NULL_ACCOUNT =
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

/**
 * Get account details from the Soroban network for the publicKey currently
 * selected in user's wallet. If user is not connected to their wallet, {@link
 * getPublicKey} returns undefined, and this will return {@link NULL_ACCOUNT}.
 * This works for simulations, which is all that's needed for most view calls.
 * If you want the transaction to be included in the ledger, you will need to
 * provide a connected wallet.
 */
export async function getAccount(server: SorobanRpc.Server, wallet?: Wallet): Promise<Account> {
  const publicKey = await wallet?.getPublicKey();
  return publicKey
    ? await server.getAccount(publicKey)
    : new Account(NULL_ACCOUNT, "0");
};

export type ContractClientOptions = AcceptsWalletOrAccount & {
  contractId: string;
  networkPassphrase: string;
  rpcUrl: string;
  errorTypes?: Record<number, { message: string }>;
};

export class ContractClient {
  private server: SorobanRpc.Server;

  constructor(
    public readonly spec: ContractSpec,
    public readonly options: ContractClientOptions,
  ) {
    this.server = new SorobanRpc.Server(this.options.rpcUrl, {
      allowHttp: this.options.rpcUrl.startsWith("http://"),
    });
    options.account = options.account ?? getAccount(this.server, options.wallet);
  }

  txFromJSON = <T>(json: string): AssembledTransaction<T> => {
    const { method, ...tx } = JSON.parse(json)
    return AssembledTransaction.fromJSON(
      {
        ...this.options,
        method,
        parseResultXdr: (result: xdr.ScVal) => this.spec.funcResToNative(method, result),
      },
      tx,
    );
  }
}
