import { Networks } from '@stellar/stellar-base'
import { AssembledTransaction, MethodOptions } from './assembled_transaction'
import { ContractSpec, xdr } from '.'

export type XDR_BASE64 = string;

export type ContractClientOptions = {
  /**
   * The public key of the account that will send this transaction. You can
   * override this for specific methods later, like
   * {@link AssembledTransaction#signAndSend} and
   * {@link AssembledTransaction#signAuthEntries}.
   */
  publicKey: string;
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
  networkPassphrase: Networks;
  rpcUrl: string;
  /**
   * If true, will allow HTTP requests to the Soroban network. If false, will
   * only allow HTTPS requests. @default false
   */
  allowHttp: boolean;
  /**
   * This gets filled in automatically from the ContractSpec if you use
   * {@link ContractClient.generate} to create your ContractClient.
   *
   * Background: If the contract you're calling uses the `#[contracterror]`
   * macro to create an `Error` enum, then those errors get included in the
   * on-chain XDR that also describes your contract's methods. Each error will
   * have a specific number.
   *
   * A ContractClient makes method calls with an {@link AssembledTransaction}.
   * When one of these method calls encounters an error, `AssembledTransaction`
   * will first attempt to parse the error as an "official" `contracterror`
   * error, by using this passed-in `errorTypes` object. See
   * {@link AssembledTransaction#parseError}. If `errorTypes` is blank or no
   * matching error is found,, then it will throw the raw error.
   * @default {}
   */
  errorTypes?: Record<number, { message: string }>;
};

/**
 * converts a snake_case string to camelCase
 */
function toLowerCamelCase(str: string): string {
  return str.replace(/_\w/g, (m) => m[1].toUpperCase());
}

export class ContractClient {
  /**
   * Generate a class from the contract spec that where each contract method gets included with a possibly-JSified name.
   *
   * Each method returns an AssembledTransaction object that can be used to sign and submit the transaction.
   */
  static generate(spec: ContractSpec, options: ContractClientOptions): ContractClient {
    let methods = spec.funcs();
    const contractClient = new ContractClient(spec, options);
    for (let method of methods) {
      let name = method.name().toString();
      let jsName = toLowerCamelCase(name);
      // @ts-ignore
      contractClient[jsName] = async (
        args: Record<string, any>,
        options: MethodOptions
      ) => {
        return await AssembledTransaction.build({
          method: name,
          args: spec.funcArgsToScVals(name, args),
          ...options,
          ...contractClient.options,
          errorTypes: spec
            .errorCases()
            .reduce(
              (acc, curr) => ({
                ...acc,
                [curr.value()]: { message: curr.doc().toString() },
              }),
              {} as Pick<ContractClientOptions, "errorTypes">
            ),
          parseResultXdr: (result: xdr.ScVal) => spec.funcResToNative(name, result),
        });
      };
    }
    return contractClient;
  }

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
