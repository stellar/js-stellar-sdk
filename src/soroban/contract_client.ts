import { AssembledTransaction } from '.'
import { ContractSpec, xdr } from '..'

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


export type ContractClientOptions = {
  contractId: string;
  networkPassphrase: string;
  rpcUrl: string;
  errorTypes?: Record<number, { message: string }>;
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
  wallet: Wallet;
};

export class ContractClient {
  constructor(
    public readonly spec: ContractSpec,
    public readonly options: ContractClientOptions,
  ) {}

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
