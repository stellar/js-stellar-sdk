import { AssembledTransaction } from '.'
import { ContractSpec, xdr } from '..'

export type XDR_BASE64 = string;

export type ContractClientOptions = {
  /**
   * The account to use for signing transactions. If not provided, a null
   * account will be used for the transaction simulation. If the transaction
   * needs to be signed and sent, this is required.
   */
  publicKey?: string | Promise<string>;
  /**
   * A function to sign the transaction using the private key corresponding to
   * the given `publicKey`. You do not need to provide this, for read-only
   * calls, which only need to be simulated. If you do not need to sign and
   * send, there is no need to provide this. If you do not provide it during
   * initialization, you can provide it later when you call
   * {@link AssembledTransaction#signAndSend}.
   *
   * Matches signature of `signTransaction` from Freighter.
   */
  signTransaction?: (
    tx: XDR_BASE64,
    opts?: {
      network?: string;
      networkPassphrase?: string;
      accountToSign?: string;
    }
  ) => Promise<XDR_BASE64>;
  /**
   * A function to sign a specific auth entry for a transaction, using the
   * private key corresponding to the provided `publicKey`. This is only needed
   * for multi-auth transactions, in which one transaction is signed by
   * multiple parties. If you do not provide it during initialization, you can
   * provide it later when you call {@link AssembledTransaction#signAuthEntries}.
   *
   * Matches signature of `signAuthEntry` from Freighter.
   */
  signAuthEntry?: (
    entryXdr: XDR_BASE64,
    opts?: {
      accountToSign?: string;
    }
  ) => Promise<XDR_BASE64>;
  contractId: string;
  networkPassphrase: string;
  rpcUrl: string;
  /**
   * If true, will allow HTTP requests to the Soroban network. If false, will
   * only allow HTTPS requests. @default false
   */
  allowHttp: boolean;
  errorTypes?: Record<number, { message: string }>;
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
