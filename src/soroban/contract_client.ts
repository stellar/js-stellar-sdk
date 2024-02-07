import { AssembledTransaction } from '.'
import { Account, ContractSpec, SorobanRpc, xdr } from '..'

export type XDR_BASE64 = string;

export interface Wallet {
  isConnected: () => Promise<boolean>;
  isAllowed: () => Promise<boolean>;
  getUserInfo: () => Promise<{ publicKey?: string }>;
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

export interface AcceptsWalletOrAccount {
  /**
   * A Wallet interface, such as Freighter, that has the methods `isConnected`, `isAllowed`, `getUserInfo`, and `signTransaction`. If not provided, will attempt to import and use Freighter. Example:
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

async function getPublicKey(wallet?: Wallet): Promise<string | undefined> {
  if (!wallet) return undefined;
  if (!(await wallet.isConnected()) || !(await wallet.isAllowed())) {
    return undefined;
  }
  return (await wallet.getUserInfo()).publicKey;
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
  const publicKey = await getPublicKey(wallet);
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
