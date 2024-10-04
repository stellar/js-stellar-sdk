/* disable PascalCase naming convention, to avoid breaking change */
/* eslint-disable @typescript-eslint/naming-convention */
import { Memo, MemoType, Operation, Transaction, xdr } from "@stellar/stellar-base";
import type { Client } from "./client";

export type XDR_BASE64 = string;
/**
 * An unsigned 32-bit integer.
 * @memberof module:contract
 */
export type u32 = number;
/**
 * A signed 32-bit integer.
 * @memberof module:contract
 */
export type i32 = number;
/**
 * An unsigned 64-bit integer.
 * @memberof module:contract
 */
export type u64 = bigint;
/**
 * A signed 64-bit integer.
 * @memberof module:contract
 */
export type i64 = bigint;
/**
 * An unsigned 128-bit integer.
 * @memberof module:contract
 */
export type u128 = bigint;
/**
 * A signed 128-bit integer.
 * @memberof module:contract
 */
export type i128 = bigint;
/**
 * An unsigned 256-bit integer.
 * @memberof module:contract
 */
export type u256 = bigint;
/**
 * A signed 256-bit integer.
 * @memberof module:contract
 */
export type i256 = bigint;
export type Option<T> = T | undefined;
export type Typepoint = bigint;
export type Duration = bigint;

/**
 * A "regular" transaction, as opposed to a FeeBumpTransaction.
 * @memberof module:contract
 * @type {Transaction<Memo<MemoType>, Operation[]>}
 */
export type Tx = Transaction<Memo<MemoType>, Operation[]>;

/**
 * Options for a smart contract client.
 * @memberof module:contract
 */
export type ClientOptions = {
  /**
   * The public key of the account that will send this transaction. You can
   * override this for specific methods later, like
   * [signAndSend]{@link module:contract.AssembledTransaction#signAndSend} and
   * [signAuthEntries]{@link module:contract.AssembledTransaction#signAuthEntries}.
   */
  publicKey?: string;
  /**
   * A function to sign the transaction using the private key corresponding to
   * the given `publicKey`. You do not need to provide this, for read-only
   * calls, which only need to be simulated. If you do not need to sign and
   * send, there is no need to provide this. If you do not provide it during
   * initialization, you can provide it later when you call
   * {@link module:contract.AssembledTransaction#signAndSend signAndSend}.
   *
   * Matches signature of `signTransaction` from Freighter.
   */
  signTransaction?: (
    tx: XDR_BASE64,
    signer: ((tx: XDR_BASE64, opts?: {
      network?: string;
      networkPassphrase?: string;
      accountToSign?: string;
    }) => Promise<XDR_BASE64>) | KeyPair,
    opts?: {
      network?: string;
      networkPassphrase?: string;
      accountToSign?: string;
    },
  ) => Promise<XDR_BASE64>;
  /**
   * A function to sign a specific auth entry for a transaction, using the
   * private key corresponding to the provided `publicKey`. This is only needed
   * for multi-auth transactions, in which one transaction is signed by
   * multiple parties. If you do not provide it during initialization, you can
   * provide it later when you call {@link module:contract.AssembledTransaction#signAuthEntries signAuthEntries}.
   *
   * Matches signature of `signAuthEntry` from Freighter.
   */
  signAuthEntry?: (
    entryXdr: XDR_BASE64,
    opts?: {
      accountToSign?: string;
    },
  ) => Promise<XDR_BASE64>;
  /** The address of the contract the client will interact with. */
  contractId: string;
  /**
   * The network passphrase for the Stellar network this contract is deployed
   * to.
   */
  networkPassphrase: string;
  /**
   * The URL of the RPC instance that will be used to interact with this
   * contract.
   */
  rpcUrl: string;
  /**
   * If true, will allow HTTP requests to the Soroban network. If false, will
   * only allow HTTPS requests.
   * @default false
   */
  allowHttp?: boolean;
  /**
   * This gets filled in automatically from the ContractSpec when you
   * instantiate a {@link Client}.
   *
   * Background: If the contract you're calling uses the `#[contracterror]`
   * macro to create an `Error` enum, then those errors get included in the
   * on-chain XDR that also describes your contract's methods. Each error will
   * have a specific number.
   *
   * A Client makes method calls with an {@link module:contract.AssembledTransaction AssembledTransaction}.
   * When one of these method calls encounters an error, `AssembledTransaction`
   * will first attempt to parse the error as an "official" `contracterror`
   * error, by using this passed-in `errorTypes` object. See
   * {@link module:contract.AssembledTransaction#parseError parseError}. If `errorTypes` is blank or no
   * matching error is found, then it will throw the raw error.
   * @default {}
   */
  errorTypes?: Record<number, { message: string }>;
};

/**
 * Options for a smart contract method invocation.
 * @memberof module:contract
 */
export type MethodOptions = {
  /**
   * The fee to pay for the transaction.
   * @default 100
   */
  fee?: string;

  /**
   * The timebounds which should be set for transactions generated by this
   * contract client. {@link module:contract#.DEFAULT_TIMEOUT}
   * @default 300
   */
  timeoutInSeconds?: number;

  /**
   * Whether to automatically simulate the transaction when constructing the
   * AssembledTransaction.
   * @default true
   */
  simulate?: boolean;

  /**
   * If true, will automatically attempt to restore the transaction if there
   * are archived entries that need renewal.
   * @default false
   */
  restore?: boolean;
};

export type AssembledTransactionOptions<T = string> = MethodOptions &
  ClientOptions & {
    method: string;
    args?: any[];
    parseResultXdr: (xdr: xdr.ScVal) => T;
  };

/**
 * The default timebounds, in seconds, during which a transaction will be valid.
 * This is attached to the transaction _before_ transaction simulation (it is
 * needed for simulation to succeed). It is also re-calculated and re-added
 * _before_ transaction signing.
 * @constant {number}
 * @default 300
 * @memberof module:contract
 */
export const DEFAULT_TIMEOUT = 5 * 60;

/**
 * An impossible account on the Stellar network
 * @constant {string}
 * @default GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF
 * @memberof module:contract
 */
export const NULL_ACCOUNT = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
