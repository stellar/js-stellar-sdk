/* tslint:disable:variable-name no-namespace */
import URI from "urijs";

import {
  Account,
  Address,
  Asset,
  Contract,
  FeeBumpTransaction,
  Keypair,
  StrKey,
  Transaction,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-base";

import type { TransactionBuilder } from "@stellar/stellar-base";
// eslint-disable-next-line import/no-named-as-default
import AxiosClient from "./axios";
import { Api as FriendbotApi } from "../friendbot";
import * as jsonrpc from "./jsonrpc";
import { Api } from "./api";
import { assembleTransaction } from "./transaction";
import {
  parseRawSendTransaction,
  parseRawSimulation,
  parseRawLedgerEntries,
  parseRawEvents,
  parseRawTransactions,
  parseTransactionInfo,
  parseRawLedger,
} from "./parsers";
import { Utils } from "../utils";

/**
 * Default transaction submission timeout for RPC requests, in milliseconds
 * @constant {number}
 * @default 60000
 * @memberof module:rpc.Server
 */
export const SUBMIT_TRANSACTION_TIMEOUT = 60 * 1000;

/**
 * Specifies the durability namespace of contract-related ledger entries.
 * @enum {('temporary' | 'persistent')}
 * @memberof module:rpc
 *
 * @see {@link https://developers.stellar.org/docs/learn/smart-contract-internals/state-archival | State Archival docs}
 * @see {@link https://docs.rs/soroban-sdk/latest/soroban_sdk/storage/struct.Storage.html | Rust SDK Storage docs}
 */
export enum Durability {
  Temporary = "temporary",
  Persistent = "persistent",
}

/**
 * @typedef {object} GetEventsRequest Describes the complex filter combinations available for event queries.
 * @property {Array.<module:rpc.Api.EventFilter>} filters Filters to use when querying events from the RPC server.
 * @property {number} [startLedger] Ledger number (inclusive) to begin querying events.
 * @property {string} [cursor] Page cursor (exclusive) to begin querying events.
 * @property {number} [limit=100] The maximum number of events that should be returned in the RPC response.
 * @memberof module:rpc.Server
 */

/**
 * @typedef {object} ResourceLeeway Describes additional resource leeways for transaction simulation.
 * @property {number} cpuInstructions Simulate the transaction with more CPU instructions available.
 * @memberof module:rpc.Server
 */

/**
 * @typedef {object} Options Options for configuring connections to RPC servers.
 * @property {boolean} [allowHttp=false] Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
 * @property {number} [timeout=0] Allow a timeout, default: 0. Allows user to avoid nasty lag. You can also use {@link Config} class to set this globally.
 * @property {Record<string, string>} [headers] Additional headers that should be added to any requests to the RPC server.
 * @memberof module:rpc.Server
 */

export namespace RpcServer {
  export interface GetEventsRequest {
    filters: Api.EventFilter[];
    startLedger?: number; // either this or cursor
    endLedger?: number; // either this or cursor
    cursor?: string; // either this or startLedger
    limit?: number;
  }

  export interface PollingOptions {
    attempts?: number;
    sleepStrategy?: SleepStrategy;
  }

  export interface ResourceLeeway {
    cpuInstructions: number;
  }

  export interface Options {
    allowHttp?: boolean;
    timeout?: number;
    headers?: Record<string, string>;
  }
}

const DEFAULT_GET_TRANSACTION_TIMEOUT: number = 30;

/// A strategy that will sleep 1 second each time
export const BasicSleepStrategy: SleepStrategy = (_iter: number) => 1000;

/// A strategy that will sleep 1 second longer on each attempt
export const LinearSleepStrategy: SleepStrategy = (iter: number) => 1000 * iter;

/**
 * A function that returns the number of *milliseconds* to sleep
 * on a given `iter`ation.
 */
export type SleepStrategy = (iter: number) => number;

function findCreatedAccountSequenceInTransactionMeta(
  meta: xdr.TransactionMeta,
): string {
  let operations: xdr.OperationMeta[] = [];
  switch (meta.switch()) {
    case 0:
      operations = meta.operations();
      break;
    case 1:
    case 2:
    case 3:
    case 4: // all four have the same interface
      operations = (meta.value() as xdr.TransactionMetaV4).operations();
      break;
    default:
      throw new Error("Unexpected transaction meta switch value");
  }
  const sequenceNumber = operations
    .flatMap((op) => op.changes())
    .find(
      (c) =>
        c.switch() === xdr.LedgerEntryChangeType.ledgerEntryCreated() &&
        c.created().data().switch() === xdr.LedgerEntryType.account(),
    )
    ?.created()
    ?.data()
    ?.account()
    ?.seqNum()
    ?.toString();

  if (sequenceNumber) {
    return sequenceNumber;
  }
  throw new Error("No account created in transaction");
}

/* eslint-disable jsdoc/no-undefined-types */
/**
 * Handles the network connection to a Soroban RPC instance, exposing an
 * interface for requests to that instance.
 *
 * @alias module:rpc.Server
 * @memberof module:rpc
 *
 * @param {string} serverURL Soroban-RPC Server URL (ex. `http://localhost:8000/soroban/rpc`).
 * @param {module:rpc.Server.Options} [opts] Options object
 * @param {boolean} [opts.allowHttp] Allows connecting to insecure http servers
 *    (default: `false`). This must be set to false in production deployments!
 *    You can also use {@link Config} class to set this globally.
 * @param {Record<string, string>} [opts.headers] Allows setting custom headers
 *
 * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods | API reference docs}
 */
export class RpcServer {
  public readonly serverURL: URI;

  constructor(serverURL: string, opts: RpcServer.Options = {}) {
    /**
     * RPC Server URL (ex. `http://localhost:8000/soroban/rpc`).
     * @member {URI}
     */
    this.serverURL = URI(serverURL);

    if (opts.headers && Object.keys(opts.headers).length !== 0) {
      AxiosClient.interceptors.request.use((config: any) => {
        // merge the custom headers into any existing headers
        config.headers = Object.assign(config.headers, opts.headers);
        return config;
      });
    }

    if (this.serverURL.protocol() !== "https" && !opts.allowHttp) {
      throw new Error(
        "Cannot connect to insecure Soroban RPC server if `allowHttp` isn't set",
      );
    }
  }

  /**
   * Fetch a minimal set of current info about a Stellar account.
   *
   * Needed to get the current sequence number for the account so you can build
   * a successful transaction with {@link TransactionBuilder}.
   *
   * @param {string} address The public address of the account to load.
   * @returns {Promise<Account>} A promise which resolves to the {@link Account}
   * object with a populated sequence number
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries | getLedgerEntries docs}
   *
   * @example
   * const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
   * server.getAccount(accountId).then((account) => {
   *   console.log("sequence:", account.sequence);
   * });
   */
  public async getAccount(address: string): Promise<Account> {
    const entry = await this.getAccountEntry(address);
    return new Account(address, entry.seqNum().toString());
  }

  /**
   * Fetch the full account entry for a Stellar account.
   *
   * @param {string} address The public address of the account to load.
   * @returns {Promise<xdr.AccountEntry>} Resolves to the full on-chain account
   *    entry
   *
   * @see
   * {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries | getLedgerEntries docs}
   *
   * @example
   * const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
   * server.getAccountEntry(accountId).then((account) => {
   *   console.log("sequence:", account.balance().toString());
   * });
   */
  public async getAccountEntry(address: string): Promise<xdr.AccountEntry> {
    const ledgerKey = xdr.LedgerKey.account(
      new xdr.LedgerKeyAccount({
        accountId: Keypair.fromPublicKey(address).xdrPublicKey(),
      }),
    );

    try {
      const resp = await this.getLedgerEntry(ledgerKey);
      return resp.val.account();
    } catch (e) {
      throw new Error(`Account not found: ${address}`);
    }
  }

  /**
   * Fetch the full trustline entry for a Stellar account.
   *
   * @param {string} account  The public address of the account whose trustline it is
   * @param {string} asset    The trustline's asset
   * @returns {Promise<xdr.TrustLineEntry>} Resolves to the full on-chain trustline
   *    entry
   *
   * @see
   * {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries | getLedgerEntries docs}
   *
   * @example
   * const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
   * const asset = new Asset(
   *  "USDC",
   *  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
   * );
   * server.getTrustline(accountId, asset).then((entry) => {
   *   console.log(`{asset.toString()} balance for ${accountId}:", entry.balance().toString());
   * });
   */
  public async getTrustline(
    account: string,
    asset: Asset,
  ): Promise<xdr.TrustLineEntry> {
    const trustlineLedgerKey = xdr.LedgerKey.trustline(
      new xdr.LedgerKeyTrustLine({
        accountId: Keypair.fromPublicKey(account).xdrAccountId(),
        asset: asset.toTrustLineXDRObject(),
      }),
    );

    try {
      const entry = await this.getLedgerEntry(trustlineLedgerKey);
      return entry.val.trustLine();
    } catch (e) {
      throw new Error(
        `Trustline for ${asset.getCode()}:${asset.getIssuer()} not found for ${account}`,
      );
    }
  }

  /**
   * Fetch the full claimable balance entry for a Stellar account.
   *
   * @param {string} id   The strkey (`B...`) or hex (`00000000abcde...`) (both
   *    IDs with and without the 000... version prefix are accepted) of the
   *    claimable balance to load
   * @returns {Promise<xdr.ClaimableBalanceEntry>} Resolves to the full on-chain
   *    claimable balance entry
   *
   * @see
   * {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries | getLedgerEntries docs}
   *
   * @example
   * const id = "00000000178826fbfe339e1f5c53417c6fedfe2c05e8bec14303143ec46b38981b09c3f9";
   * server.getClaimableBalance(id).then((entry) => {
   *   console.log(`Claimable balance {id.substr(0, 12)} has:`);
   *   console.log(`  asset:  ${Asset.fromXDRObject(entry.asset()).toString()}`;
   *   console.log(`  amount: ${entry.amount().toString()}`;
   * });
   */
  public async getClaimableBalance(
    id: string,
  ): Promise<xdr.ClaimableBalanceEntry> {
    let balanceId;
    if (StrKey.isValidClaimableBalance(id)) {
      let buffer = StrKey.decodeClaimableBalance(id);

      // Pad the version byte to be a full int32 like in the XDR spec
      let v = Buffer.concat([
        Buffer.from("\x00\x00\x00"),
        buffer.subarray(0, 1),
      ]);

      // Slap on the rest of it and decode it
      balanceId = xdr.ClaimableBalanceId.fromXDR(
        Buffer.concat([v, buffer.subarray(1)]),
      );
    } else if (id.match(/[a-f0-9]{72}/i)) {
      balanceId = xdr.ClaimableBalanceId.fromXDR(id, "hex");
    } else if (id.match(/[a-f0-9]{64}/i)) {
      balanceId = xdr.ClaimableBalanceId.fromXDR(id.padStart(72, "0"), "hex");
    } else {
      throw new TypeError(`expected 72-char hex ID or strkey, not ${id}`);
    }

    const trustlineLedgerKey = xdr.LedgerKey.claimableBalance(
      new xdr.LedgerKeyClaimableBalance({ balanceId }),
    );

    try {
      const entry = await this.getLedgerEntry(trustlineLedgerKey);
      return entry.val.claimableBalance();
    } catch (e) {
      throw new Error(`Claimable balance ${id} not found`);
    }
  }

  /**
   * General node health check.
   *
   * @returns {Promise<Api.GetHealthResponse>} A promise which resolves to the
   * {@link Api.GetHealthResponse} object with the status of the
   * server (e.g. "healthy").
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getHealth | getLedgerEntries docs}
   *
   * @example
   * server.getHealth().then((health) => {
   *   console.log("status:", health.status);
   * });
   */
  // eslint-disable-next-line require-await
  public async getHealth(): Promise<Api.GetHealthResponse> {
    return jsonrpc.postObject<Api.GetHealthResponse>(
      this.serverURL.toString(),
      "getHealth",
    );
  }

  /**
   * Reads the current value of contract data ledger entries directly.
   *
   * Allows you to directly inspect the current state of a contract. This is a
   * backup way to access your contract data which may not be available via
   * events or {@link module:rpc.Server#simulateTransaction}.
   *
   * @param {string|Address|Contract} contract The contract ID containing the
   *    data to load as a strkey (`C...` form), a {@link Contract}, or an
   *    {@link Address} instance
   * @param {xdr.ScVal} key The key of the contract data to load
   * @param {module:rpc.Durability} [durability=Durability.Persistent] The "durability
   *    keyspace" that this ledger key belongs to, which is either 'temporary'
   *    or 'persistent' (the default), see {@link module:rpc.Durability}.
   * @returns {Promise<Api.LedgerEntryResult>} The current data value
   *
   * @warning If the data entry in question is a 'temporary' entry, it's
   *    entirely possible that it has expired out of existence.
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries | getLedgerEntries docs}
   *
   * @example
   * const contractId = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
   * const key = xdr.ScVal.scvSymbol("counter");
   * server.getContractData(contractId, key, Durability.Temporary).then(data => {
   *   console.log("value:", data.val);
   *   console.log("liveUntilLedgerSeq:", data.liveUntilLedgerSeq);
   *   console.log("lastModified:", data.lastModifiedLedgerSeq);
   *   console.log("latestLedger:", data.latestLedger);
   * });
   */
  // eslint-disable-next-line require-await
  public async getContractData(
    contract: string | Address | Contract,
    key: xdr.ScVal,
    durability: Durability = Durability.Persistent,
  ): Promise<Api.LedgerEntryResult> {
    // coalesce `contract` param variants to an ScAddress
    let scAddress: xdr.ScAddress;
    if (typeof contract === "string") {
      scAddress = new Contract(contract).address().toScAddress();
    } else if (contract instanceof Address) {
      scAddress = contract.toScAddress();
    } else if (contract instanceof Contract) {
      scAddress = contract.address().toScAddress();
    } else {
      throw new TypeError(`unknown contract type: ${contract}`);
    }

    let xdrDurability: xdr.ContractDataDurability;
    switch (durability) {
      case Durability.Temporary:
        xdrDurability = xdr.ContractDataDurability.temporary();
        break;

      case Durability.Persistent:
        xdrDurability = xdr.ContractDataDurability.persistent();
        break;

      default:
        throw new TypeError(`invalid durability: ${durability}`);
    }

    const contractKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        key,
        contract: scAddress,
        durability: xdrDurability,
      }),
    );

    try {
      return await this.getLedgerEntry(contractKey);
    } catch (e) {
      throw {
        code: 404,
        message: `Contract data not found for ${Address.fromScAddress(
          scAddress,
        ).toString()} with key ${key.toXDR("base64")} and durability: ${durability}`,
      };
    }
  }

  /**
   * Retrieves the WASM bytecode for a given contract.
   *
   * This method allows you to fetch the WASM bytecode associated with a contract
   * deployed on the Soroban network. The WASM bytecode represents the executable
   * code of the contract.
   *
   * @param {string} contractId The contract ID containing the WASM bytecode to retrieve
   * @returns {Promise<Buffer>} A Buffer containing the WASM bytecode
   * @throws {Error} If the contract or its associated WASM bytecode cannot be
   * found on the network.
   *
   * @example
   * const contractId = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
   * server.getContractWasmByContractId(contractId).then(wasmBuffer => {
   *   console.log("WASM bytecode length:", wasmBuffer.length);
   *   // ... do something with the WASM bytecode ...
   * }).catch(err => {
   *   console.error("Error fetching WASM bytecode:", err);
   * });
   */
  public async getContractWasmByContractId(
    contractId: string,
  ): Promise<Buffer> {
    const contractLedgerKey = new Contract(contractId).getFootprint();
    const response = await this.getLedgerEntries(contractLedgerKey);
    if (!response.entries.length || !response.entries[0]?.val) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        code: 404,
        message: `Could not obtain contract hash from server`,
      });
    }

    const wasmHash = response.entries[0].val
      .contractData()
      .val()
      .instance()
      .executable()
      .wasmHash();

    return this.getContractWasmByHash(wasmHash);
  }

  /**
   * Retrieves the WASM bytecode for a given contract hash.
   *
   * This method allows you to fetch the WASM bytecode associated with a contract
   * deployed on the Soroban network using the contract's WASM hash. The WASM bytecode
   * represents the executable code of the contract.
   *
   * @param {Buffer} wasmHash The WASM hash of the contract
   * @returns {Promise<Buffer>} A Buffer containing the WASM bytecode
   * @throws {Error} If the contract or its associated WASM bytecode cannot be
   * found on the network.
   *
   * @example
   * const wasmHash = Buffer.from("...");
   * server.getContractWasmByHash(wasmHash).then(wasmBuffer => {
   *   console.log("WASM bytecode length:", wasmBuffer.length);
   *   // ... do something with the WASM bytecode ...
   * }).catch(err => {
   *   console.error("Error fetching WASM bytecode:", err);
   * });
   */
  public async getContractWasmByHash(
    wasmHash: Buffer | string,
    format: undefined | "hex" | "base64" = undefined,
  ): Promise<Buffer> {
    const wasmHashBuffer =
      typeof wasmHash === "string"
        ? Buffer.from(wasmHash, format)
        : (wasmHash as Buffer);

    const ledgerKeyWasmHash = xdr.LedgerKey.contractCode(
      new xdr.LedgerKeyContractCode({
        hash: wasmHashBuffer,
      }),
    );

    const responseWasm = await this.getLedgerEntries(ledgerKeyWasmHash);
    if (!responseWasm.entries.length || !responseWasm.entries[0]?.val) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({
        code: 404,
        message: "Could not obtain contract wasm from server",
      });
    }
    const wasmBuffer = responseWasm.entries[0].val.contractCode().code();

    return wasmBuffer;
  }

  /**
   * Reads the current value of arbitrary ledger entries directly.
   *
   * Allows you to directly inspect the current state of contracts, contract's
   * code, accounts, or any other ledger entries.
   *
   * To fetch a contract's WASM byte-code, built the appropriate
   * {@link xdr.LedgerKeyContractCode} ledger entry key (or see
   * {@link Contract.getFootprint}).
   *
   * @param {xdr.ScVal[]} keys One or more ledger entry keys to load
   * @returns {Promise<Api.GetLedgerEntriesResponse>} The current on-chain
   * values for the given ledger keys
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries | getLedgerEntries docs}
   * @see RpcServer._getLedgerEntries
   * @example
   * const contractId = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
   * const key = xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({
   *   contractId: StrKey.decodeContract(contractId),
   *   key: xdr.ScVal.scvSymbol("counter"),
   * }));
   *
   * server.getLedgerEntries([key]).then(response => {
   *   const ledgerData = response.entries[0];
   *   console.log("key:", ledgerData.key);
   *   console.log("value:", ledgerData.val);
   *   console.log("liveUntilLedgerSeq:", ledgerData.liveUntilLedgerSeq);
   *   console.log("lastModified:", ledgerData.lastModifiedLedgerSeq);
   *   console.log("latestLedger:", response.latestLedger);
   * });
   */
  public getLedgerEntries(...keys: xdr.LedgerKey[]) {
    return this._getLedgerEntries(...keys).then(parseRawLedgerEntries);
  }

  public _getLedgerEntries(...keys: xdr.LedgerKey[]) {
    return jsonrpc.postObject<Api.RawGetLedgerEntriesResponse>(
      this.serverURL.toString(),
      "getLedgerEntries",
      {
        keys: keys.map((k) => k.toXDR("base64")),
      },
    );
  }

  public async getLedgerEntry(key: xdr.LedgerKey) {
    const results = await this._getLedgerEntries(key).then(
      parseRawLedgerEntries,
    );
    if (results.entries.length !== 1) {
      throw new Error(`failed to find an entry for key ${key.toXDR("base64")}`);
    }
    return results.entries[0];
  }

  /**
   * Poll for a particular transaction with certain parameters.
   *
   * After submitting a transaction, clients can use this to poll for
   * transaction completion and return a definitive state of success or failure.
   *
   * @param {string} hash   the transaction you're polling for
   * @param {number} [opts.attempts] (optional) the number of attempts to make
   *    before returning the last-seen status. By default or on invalid inputs,
   *    try 5 times.
   * @param {SleepStrategy} [opts.sleepStrategy] (optional) the amount of time
   *    to wait for between each attempt. By default, sleep for 1 second between
   *    each attempt.
   *
   * @returns {Promise<Api.GetTransactionsResponse>} the response after a "found"
   *    response (which may be success or failure) or the last response obtained
   *    after polling the maximum number of specified attempts.
   *
   * @example
   * const h = "c4515e3bdc0897f21cc5dbec8c82cf0a936d4741cb74a8e158eb51b9fb00411a";
   * const txStatus = await server.pollTransaction(h, {
   *    attempts: 100, // I'm a maniac
   *    sleepStrategy: rpc.LinearSleepStrategy
   * }); // this will take 5,050 seconds to complete
   */
  public async pollTransaction(
    hash: string,
    opts?: RpcServer.PollingOptions,
  ): Promise<Api.GetTransactionResponse> {
    const maxAttempts: number =
      (opts?.attempts ?? 0) < 1
        ? DEFAULT_GET_TRANSACTION_TIMEOUT
        : (opts?.attempts ?? DEFAULT_GET_TRANSACTION_TIMEOUT); // "positive and defined user value or default"

    let foundInfo: Api.GetTransactionResponse;
    for (let attempt = 1; attempt < maxAttempts; attempt++) {
      foundInfo = await this.getTransaction(hash);
      if (foundInfo.status !== Api.GetTransactionStatus.NOT_FOUND) {
        return foundInfo;
      }

      await Utils.sleep((opts?.sleepStrategy ?? BasicSleepStrategy)(attempt));
    }

    return foundInfo!;
  }

  /**
   * Fetch the details of a submitted transaction.
   *
   * After submitting a transaction, clients should poll this to tell when the
   * transaction has completed.
   *
   * @param {string} hash Hex-encoded hash of the transaction to check
   * @returns {Promise<Api.GetTransactionResponse>} The status, result, and
   *    other details about the transaction
   *
   * @see
   * {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getTransaction | getTransaction docs}
   *
   * @example
   * const transactionHash = "c4515e3bdc0897f21cc5dbec8c82cf0a936d4741cb74a8e158eb51b9fb00411a";
   * server.getTransaction(transactionHash).then((tx) => {
   *   console.log("status:", tx.status);
   *   console.log("envelopeXdr:", tx.envelopeXdr);
   *   console.log("resultMetaXdr:", tx.resultMetaXdr);
   *   console.log("resultXdr:", tx.resultXdr);
   * });
   */
  // eslint-disable-next-line require-await
  public async getTransaction(
    hash: string,
  ): Promise<Api.GetTransactionResponse> {
    return this._getTransaction(hash).then((raw) => {
      const foundInfo: Omit<
        Api.GetSuccessfulTransactionResponse,
        keyof Api.GetMissingTransactionResponse
      > = {} as any;

      if (raw.status !== Api.GetTransactionStatus.NOT_FOUND) {
        Object.assign(foundInfo, parseTransactionInfo(raw));
      }

      const result: Api.GetTransactionResponse = {
        status: raw.status,
        txHash: hash,
        latestLedger: raw.latestLedger,
        latestLedgerCloseTime: raw.latestLedgerCloseTime,
        oldestLedger: raw.oldestLedger,
        oldestLedgerCloseTime: raw.oldestLedgerCloseTime,
        ...foundInfo,
      };

      return result;
    });
  }

  // eslint-disable-next-line require-await
  public async _getTransaction(
    hash: string,
  ): Promise<Api.RawGetTransactionResponse> {
    return jsonrpc.postObject(this.serverURL.toString(), "getTransaction", {
      hash,
    });
  }

  /**
   * Fetch transactions starting from a given start ledger or a cursor. The end ledger is the latest ledger
   * in that RPC instance.
   *
   * @param {Api.GetTransactionsRequest} request - The request parameters.
   * @returns {Promise<Api.GetTransactionsResponse>} - A promise that resolves to the transactions response.
   *
   * @see https://developers.stellar.org/docs/data/rpc/api-reference/methods/getTransactions
   * @example
   * server.getTransactions({
   *   startLedger: 10000,
   *   limit: 10,
   * }).then((response) => {
   *   console.log("Transactions:", response.transactions);
   *   console.log("Latest Ledger:", response.latestLedger);
   *   console.log("Cursor:", response.cursor);
   * });
   */
  public async getTransactions(
    request: Api.GetTransactionsRequest,
  ): Promise<Api.GetTransactionsResponse> {
    return this._getTransactions(request).then(
      (raw: Api.RawGetTransactionsResponse) => {
        const result: Api.GetTransactionsResponse = {
          transactions: (raw.transactions || []).map(parseRawTransactions),
          latestLedger: raw.latestLedger,
          latestLedgerCloseTimestamp: raw.latestLedgerCloseTimestamp,
          oldestLedger: raw.oldestLedger,
          oldestLedgerCloseTimestamp: raw.oldestLedgerCloseTimestamp,
          cursor: raw.cursor,
        };
        return result;
      },
    );
  }

  async _getTransactions(
    request: Api.GetTransactionsRequest,
  ): Promise<Api.RawGetTransactionsResponse> {
    return jsonrpc.postObject(
      this.serverURL.toString(),
      "getTransactions",
      request,
    );
  }

  /**
   * Fetch all events that match a given set of filters.
   *
   * The given filters (see {@link module:rpc.Api.EventFilter | Api.EventFilter}
   * for detailed fields) are combined only in a logical OR fashion, and all of
   * the fields in each filter are optional.
   *
   * To page through events, use the `pagingToken` field on the relevant
   * {@link Api.EventResponse} object to set the `cursor` parameter.
   *
   * @param {module:rpc.Server.GetEventsRequest} request Event filters
   * @returns {Promise<Api.GetEventsResponse>} A paginatable set of the events
   * matching the given event filters
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getEvents | getEvents docs}
   *
   * @example
   * server.getEvents({
   *    startLedger: 1000,
   *    endLedger: 2000,
   *    filters: [
   *     {
   *      type: "contract",
   *      contractIds: [ "deadb33f..." ],
   *      topics: [[ "AAAABQAAAAh0cmFuc2Zlcg==", "AAAAAQB6Mcc=", "*" ]]
   *     }, {
   *      type: "system",
   *      contractIds: [ "...c4f3b4b3..." ],
   *      topics: [[ "*" ], [ "*", "AAAAAQB6Mcc=" ]]
   *     }, {
   *      contractIds: [ "...c4f3b4b3..." ],
   *      topics: [[ "AAAABQAAAAh0cmFuc2Zlcg==" ]]
   *     }, {
   *      type: "diagnostic",
   *      topics: [[ "AAAAAQB6Mcc=" ]]
   *     }
   *    ],
   *    limit: 10,
   * });
   */
  // eslint-disable-next-line require-await
  public async getEvents(
    request: RpcServer.GetEventsRequest,
  ): Promise<Api.GetEventsResponse> {
    return this._getEvents(request).then(parseRawEvents);
  }

  // eslint-disable-next-line require-await
  public async _getEvents(
    request: RpcServer.GetEventsRequest,
  ): Promise<Api.RawGetEventsResponse> {
    return jsonrpc.postObject(this.serverURL.toString(), "getEvents", {
      filters: request.filters ?? [],
      pagination: {
        ...(request.cursor && { cursor: request.cursor }), // add if defined
        ...(request.limit && { limit: request.limit }),
      },
      ...(request.startLedger && {
        startLedger: request.startLedger,
      }),
      ...(request.endLedger && {
        endLedger: request.endLedger,
      }),
    });
  }

  /**
   * Fetch metadata about the network this Soroban RPC server is connected to.
   *
   * @returns {Promise<Api.GetNetworkResponse>} Metadata about the current
   * network this RPC server is connected to
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getNetwork | getNetwork docs}
   *
   * @example
   * server.getNetwork().then((network) => {
   *   console.log("friendbotUrl:", network.friendbotUrl);
   *   console.log("passphrase:", network.passphrase);
   *   console.log("protocolVersion:", network.protocolVersion);
   * });
   */
  // eslint-disable-next-line require-await
  public async getNetwork(): Promise<Api.GetNetworkResponse> {
    return jsonrpc.postObject(this.serverURL.toString(), "getNetwork");
  }

  /**
   * Fetch the latest ledger meta info from network which this Soroban RPC
   * server is connected to.
   *
   * @returns {Promise<Api.GetLatestLedgerResponse>}   metadata about the
   *    latest ledger on the network that this RPC server is connected to
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLatestLedger | getLatestLedger docs}
   *
   * @example
   * server.getLatestLedger().then((response) => {
   *   console.log("hash:", response.id);
   *   console.log("sequence:", response.sequence);
   *   console.log("protocolVersion:", response.protocolVersion);
   * });
   */
  // eslint-disable-next-line require-await
  public async getLatestLedger(): Promise<Api.GetLatestLedgerResponse> {
    return jsonrpc.postObject(this.serverURL.toString(), "getLatestLedger");
  }

  /**
   * Submit a trial contract invocation to get back return values, expected
   * ledger footprint, expected authorizations, and expected costs.
   *
   * @param {Transaction | FeeBumpTransaction} tx the transaction to simulate,
   *    which should include exactly one operation (one of
   *    {@link xdr.InvokeHostFunctionOp}, {@link xdr.ExtendFootprintTTLOp}, or
   *    {@link xdr.RestoreFootprintOp}). Any provided footprint or auth
   *    information will be ignored.
   * @param {RpcServer.ResourceLeeway} [addlResources] any additional resources
   *    to add to the simulation-provided ones, for example if you know you will
   *    need extra CPU instructions
   * @param {Api.SimulationAuthMode} [authMode] optionally, specify the type of
   *    auth mode to use for simulation: `enforce` for enforcement mode,
   *    `record` for recording mode, or `record_allow_nonroot` for recording
   *    mode that allows non-root authorization
   *
   * @returns {Promise<Api.SimulateTransactionResponse>} An object with the
   *    cost, footprint, result/auth requirements (if applicable), and error of
   *    the transaction
   *
   * @see
   * {@link https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/operations-and-transactions | transaction docs}
   * @see
   * {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/simulateTransaction | simulateTransaction docs}
   * @see
   * {@link https://developers.stellar.org/docs/learn/fundamentals/contract-development/contract-interactions/transaction-simulation#authorization | authorization modes}
   * @see module:rpc.Server#prepareTransaction
   * @see module:rpc.assembleTransaction
   *
   * @example
   * const contractId = 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE';
   * const contract = new StellarSdk.Contract(contractId);
   *
   * // Right now, this is just the default fee for this example.
   * const fee = StellarSdk.BASE_FEE;
   * const transaction = new StellarSdk.TransactionBuilder(account, { fee })
   *   // Uncomment the following line to build transactions for the live network. Be
   *   // sure to also change the horizon hostname.
   *   //.setNetworkPassphrase(StellarSdk.Networks.PUBLIC)
   *   .setNetworkPassphrase(StellarSdk.Networks.FUTURENET)
   *   .setTimeout(30) // valid for the next 30s
   *   // Add an operation to call increment() on the contract
   *   .addOperation(contract.call("increment"))
   *   .build();
   *
   * server.simulateTransaction(transaction).then((sim) => {
   *   console.log("cost:", sim.cost);
   *   console.log("result:", sim.result);
   *   console.log("error:", sim.error);
   *   console.log("latestLedger:", sim.latestLedger);
   * });
   */
  // eslint-disable-next-line require-await
  public async simulateTransaction(
    tx: Transaction | FeeBumpTransaction,
    addlResources?: RpcServer.ResourceLeeway,
    authMode?: Api.SimulationAuthMode,
  ): Promise<Api.SimulateTransactionResponse> {
    return this._simulateTransaction(tx, addlResources, authMode).then(
      parseRawSimulation,
    );
  }

  // eslint-disable-next-line require-await
  public async _simulateTransaction(
    transaction: Transaction | FeeBumpTransaction,
    addlResources?: RpcServer.ResourceLeeway,
    authMode?: Api.SimulationAuthMode,
  ): Promise<Api.RawSimulateTransactionResponse> {
    return jsonrpc.postObject(
      this.serverURL.toString(),
      "simulateTransaction",
      {
        transaction: transaction.toXDR(),
        authMode,
        ...(addlResources !== undefined && {
          resourceConfig: {
            instructionLeeway: addlResources.cpuInstructions,
          },
        }),
      },
    );
  }

  /**
   * Submit a trial contract invocation, first run a simulation of the contract
   * invocation as defined on the incoming transaction, and apply the results to
   * a new copy of the transaction which is then returned. Setting the ledger
   * footprint and authorization, so the resulting transaction is ready for
   * signing & sending.
   *
   * The returned transaction will also have an updated fee that is the sum of
   * fee set on incoming transaction with the contract resource fees estimated
   * from simulation. It is advisable to check the fee on returned transaction
   * and validate or take appropriate measures for interaction with user to
   * confirm it is acceptable.
   *
   * You can call the {@link module:rpc.Server#simulateTransaction} method
   * directly first if you want to inspect estimated fees for a given
   * transaction in detail first, then re-assemble it manually or via
   * {@link module:rpc.assembleTransaction}.
   *
   * @param {Transaction | FeeBumpTransaction} tx  the transaction to
   *    prepare. It should include exactly one operation, which must be one of
   *    {@link xdr.InvokeHostFunctionOp}, {@link xdr.ExtendFootprintTTLOp},
   *    or {@link xdr.RestoreFootprintOp}.
   *
   *    Any provided footprint will be overwritten. However, if your operation
   *    has existing auth entries, they will be preferred over ALL auth entries
   *    from the simulation. In other words, if you include auth entries, you
   *    don't care about the auth returned from the simulation. Other fields
   *    (footprint, etc.) will be filled as normal.
   * @returns {Promise<Transaction | FeeBumpTransaction>} A copy of the
   *    transaction with the expected authorizations (in the case of
   *    invocation), resources, and ledger footprints added. The transaction fee
   *    will also automatically be padded with the contract's minimum resource
   *    fees discovered from the simulation.
   * @throws {jsonrpc.Error<any>|Error|Api.SimulateTransactionErrorResponse}
   *    If simulation fails
   *
   * @see module:rpc.assembleTransaction
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/simulateTransaction | simulateTransaction docs}
   *
   * @example
   * const contractId = 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE';
   * const contract = new StellarSdk.Contract(contractId);
   *
   * // Right now, this is just the default fee for this example.
   * const fee = StellarSdk.BASE_FEE;
   * const transaction = new StellarSdk.TransactionBuilder(account, { fee })
   *   // Uncomment the following line to build transactions for the live network. Be
   *   // sure to also change the horizon hostname.
   *   //.setNetworkPassphrase(StellarSdk.Networks.PUBLIC)
   *   .setNetworkPassphrase(StellarSdk.Networks.FUTURENET)
   *   .setTimeout(30) // valid for the next 30s
   *   // Add an operation to call increment() on the contract
   *   .addOperation(contract.call("increment"))
   *   .build();
   *
   * const preparedTransaction = await server.prepareTransaction(transaction);
   *
   * // Sign this transaction with the secret key
   * // NOTE: signing is transaction is network specific. Test network transactions
   * // won't work in the public network. To switch networks, use the Network object
   * // as explained above (look for StellarSdk.Network).
   * const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
   * preparedTransaction.sign(sourceKeypair);
   *
   * server.sendTransaction(transaction).then(result => {
   *   console.log("hash:", result.hash);
   *   console.log("status:", result.status);
   *   console.log("errorResultXdr:", result.errorResultXdr);
   * });
   */
  public async prepareTransaction(tx: Transaction | FeeBumpTransaction) {
    const simResponse = await this.simulateTransaction(tx);
    if (Api.isSimulationError(simResponse)) {
      throw new Error(simResponse.error);
    }

    return assembleTransaction(tx, simResponse).build();
  }

  /**
   * Submit a real transaction to the Stellar network.
   *
   * Unlike Horizon, RPC does not wait for transaction completion. It
   * simply validates the transaction and enqueues it. Clients should call
   * {@link module:rpc.Server#getTransaction} to learn about transaction
   * success/failure.
   *
   * @param {Transaction | FeeBumpTransaction} transaction  to submit
   * @returns {Promise<Api.SendTransactionResponse>}   the
   *    transaction id, status, and any error if available
   *
   * @see {@link https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/operations-and-transactions | transaction docs}
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/sendTransaction | sendTransaction docs}
   *
   * @example
   * const contractId = 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE';
   * const contract = new StellarSdk.Contract(contractId);
   *
   * // Right now, this is just the default fee for this example.
   * const fee = StellarSdk.BASE_FEE;
   * const transaction = new StellarSdk.TransactionBuilder(account, { fee })
   *   // Uncomment the following line to build transactions for the live network. Be
   *   // sure to also change the horizon hostname.
   *   //.setNetworkPassphrase(StellarSdk.Networks.PUBLIC)
   *   .setNetworkPassphrase(StellarSdk.Networks.FUTURENET)
   *   .setTimeout(30) // valid for the next 30s
   *   // Add an operation to call increment() on the contract
   *   .addOperation(contract.call("increment"))
   *   .build();
   *
   * // Sign this transaction with the secret key
   * // NOTE: signing is transaction is network specific. Test network transactions
   * // won't work in the public network. To switch networks, use the Network object
   * // as explained above (look for StellarSdk.Network).
   * const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
   * transaction.sign(sourceKeypair);
   *
   * server.sendTransaction(transaction).then((result) => {
   *   console.log("hash:", result.hash);
   *   console.log("status:", result.status);
   *   console.log("errorResultXdr:", result.errorResultXdr);
   * });
   */
  // eslint-disable-next-line require-await
  public async sendTransaction(
    transaction: Transaction | FeeBumpTransaction,
  ): Promise<Api.SendTransactionResponse> {
    return this._sendTransaction(transaction).then(parseRawSendTransaction);
  }

  // eslint-disable-next-line require-await
  public async _sendTransaction(
    transaction: Transaction | FeeBumpTransaction,
  ): Promise<Api.RawSendTransactionResponse> {
    return jsonrpc.postObject(this.serverURL.toString(), "sendTransaction", {
      transaction: transaction.toXDR(),
    });
  }

  /**
   * Fund a new account using the network's Friendbot faucet, if any.
   *
   * @param {string | Account} address The address or account instance that we
   *    want to create and fund with Friendbot
   * @param {string} [friendbotUrl] Optionally, an explicit address for
   *    friendbot (by default: this calls the Soroban RPC
   *    {@link module:rpc.Server#getNetwork | getNetwork} method to try to
   *    discover this network's Friendbot url).
   * @returns {Promise<Account>} An {@link Account} object for the created
   *    account, or the existing account if it's already funded with the
   *    populated sequence number (note that the account will not be "topped
   *    off" if it already exists)
   * @throws If Friendbot is not configured on this network or request failure
   *
   * @see {@link https://developers.stellar.org/docs/learn/fundamentals/networks#friendbot | Friendbot docs}
   * @see {@link module:Friendbot.Api.Response}
   *
   * @example
   * server
   *    .requestAirdrop("GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4")
   *    .then((accountCreated) => {
   *      console.log("accountCreated:", accountCreated);
   *    }).catch((error) => {
   *      console.error("error:", error);
   *    });
   */
  public async requestAirdrop(
    address: string | Pick<Account, "accountId">,
    friendbotUrl?: string,
  ): Promise<Account> {
    const account = typeof address === "string" ? address : address.accountId();
    friendbotUrl = friendbotUrl || (await this.getNetwork()).friendbotUrl;
    if (!friendbotUrl) {
      throw new Error("No friendbot URL configured for current network");
    }

    try {
      const response = await AxiosClient.post<FriendbotApi.Response>(
        `${friendbotUrl}?addr=${encodeURIComponent(account)}`,
      );

      let meta: xdr.TransactionMeta;
      if (!response.data.result_meta_xdr) {
        const txMeta = await this.getTransaction(response.data.hash);
        if (txMeta.status !== Api.GetTransactionStatus.SUCCESS) {
          throw new Error(`Funding account ${address} failed`);
        }
        meta = txMeta.resultMetaXdr;
      } else {
        meta = xdr.TransactionMeta.fromXDR(
          response.data.result_meta_xdr,
          "base64",
        );
      }

      const sequence = findCreatedAccountSequenceInTransactionMeta(meta);
      return new Account(account, sequence);
    } catch (error: any) {
      if (error.response?.status === 400) {
        if (error.response.detail?.includes("createAccountAlreadyExist")) {
          // Account already exists, load the sequence number
          return this.getAccount(account);
        }
      }
      throw error;
    }
  }

  /**
   * Provides an analysis of the recent fee stats for regular and smart
   * contract operations.
   *
   * @returns {Promise<Api.GetFeeStatsResponse>}  the fee stats
   * @see https://developers.stellar.org/docs/data/rpc/api-reference/methods/getFeeStats
   */
  // eslint-disable-next-line require-await
  public async getFeeStats(): Promise<Api.GetFeeStatsResponse> {
    return jsonrpc.postObject(this.serverURL.toString(), "getFeeStats");
  }

  /**
   * Provides information about the current version details of the Soroban RPC and captive-core
   *
   * @returns {Promise<Api.GetVersionInfoResponse>} the version info
   * @see https://developers.stellar.org/docs/data/rpc/api-reference/methods/getVersionInfo
   */
  // eslint-disable-next-line require-await
  public async getVersionInfo(): Promise<Api.GetVersionInfoResponse> {
    return jsonrpc.postObject(this.serverURL.toString(), "getVersionInfo");
  }

  /**
   * Returns a contract's balance of a particular SAC asset, if any.
   *
   * This is a convenience wrapper around {@link Server.getLedgerEntries}.
   *
   * @param {string}  address the contract (string `C...`) or account ID
   *    (`G...`) whose balance of `sac` you want to know
   * @param {Asset}   sac     the built-in SAC token (e.g. `USDC:GABC...`) that
   *    you are querying from the given `contract`.
   * @param {string}  [networkPassphrase] optionally, the network passphrase to
   *    which this token applies. If omitted, a request about network
   *    information will be made (see {@link getNetwork}), since contract IDs
   *    for assets are specific to a network. You can refer to {@link Networks}
   *    for a list of built-in passphrases, e.g., `Networks.TESTNET`.
   *
   * @returns {Promise<Api.BalanceResponse>}, which will contain the balance
   *    entry details if and only if the request returned a valid balance ledger
   *    entry. If it doesn't, the `balanceEntry` field will not exist.
   *
   * @throws {TypeError} If `address` is not a valid contract ID (C...).
   *
   * @see getLedgerEntries
   * @see https://developers.stellar.org/docs/tokens/stellar-asset-contract
   *
   * @example
   * // assume `address` is some contract or account with an XLM balance
   * // assume server is an instantiated `Server` instance.
   * const entry = (await server.getSACBalance(
   *   new Address(address),
   *   Asset.native(),
   *   Networks.PUBLIC
   * ));
   *
   * // assumes BigInt support:
   * console.log(
   *   entry.balanceEntry ?
   *   BigInt(entry.balanceEntry.amount) :
   *   "Address has no XLM");
   */
  public async getSACBalance(
    address: string | Address,
    sac: Asset,
    networkPassphrase?: string,
  ): Promise<Api.BalanceResponse> {
    const addressString =
      address instanceof Address ? address.toString() : address;

    if (!StrKey.isValidContract(addressString)) {
      throw new TypeError(`expected contract ID, got ${addressString}`);
    }

    // Call out to RPC if passphrase isn't provided.
    const passphrase: string =
      networkPassphrase ?? (await this.getNetwork().then((n) => n.passphrase));

    // Turn SAC into predictable contract ID
    const sacId = sac.contractId(passphrase);

    // Rust union enum type with "Balance(ScAddress)" structure
    const key = nativeToScVal(["Balance", addressString], {
      type: ["symbol", "address"],
    });

    // Note a quirk here: the contract address in the key is the *token*
    // rather than the *holding contract*. This is because each token stores a
    // balance entry for each contract, not the other way around (i.e. XLM
    // holds a reserve for contract X, rather that contract X having a balance
    // of N XLM).
    const ledgerKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: new Address(sacId).toScAddress(),
        durability: xdr.ContractDataDurability.persistent(),
        key,
      }),
    );

    const response = await this.getLedgerEntries(ledgerKey);
    if (response.entries.length === 0) {
      return { latestLedger: response.latestLedger };
    }

    const { lastModifiedLedgerSeq, liveUntilLedgerSeq, val } =
      response.entries[0];

    if (val.switch().value !== xdr.LedgerEntryType.contractData().value) {
      return { latestLedger: response.latestLedger };
    }

    const entry = scValToNative(val.contractData().val());

    // Since we are requesting a SAC's contract data, we know for a fact that
    // it should follow the expected structure format. Thus, we can presume
    // these fields exist:
    return {
      latestLedger: response.latestLedger,
      balanceEntry: {
        liveUntilLedgerSeq,
        lastModifiedLedgerSeq,
        amount: entry.amount.toString(),
        authorized: entry.authorized,
        clawback: entry.clawback,
      },
    };
  }

  /**
   * Fetch a detailed list of ledgers starting from a specified point.
   *
   * Returns ledger data with support for pagination as long as the requested
   * pages fall within the history retention of the RPC provider.
   *
   * @param {Api.GetLedgersRequest} request - The request parameters for fetching ledgers. {@link Api.GetLedgersRequest}
   * @returns {Promise<Api.GetLedgersResponse>} A promise that resolves to the
   *    ledgers response containing an array of ledger data and pagination info. {@link Api.GetLedgersResponse}
   *
   * @throws {Error} If startLedger is less than the oldest ledger stored in this
   *    node, or greater than the latest ledger seen by this node.
   *
   * @see {@link https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgers | getLedgers docs}
   *
   * @example
   * // Fetch ledgers starting from a specific sequence number
   * server.getLedgers({
   *   startLedger: 36233,
   *   limit: 10
   * }).then((response) => {
   *   console.log("Ledgers:", response.ledgers);
   *   console.log("Latest Ledger:", response.latestLedger);
   *   console.log("Cursor:", response.cursor);
   * });
   *
   * @example
   * // Paginate through ledgers using cursor
   * const firstPage = await server.getLedgers({
   *   startLedger: 36233,
   *   limit: 5
   * });
   *
   * const nextPage = await server.getLedgers({
   *   cursor: firstPage.cursor,
   *   limit: 5
   * });
   */
  // eslint-disable-next-line require-await
  public async getLedgers(
    request: Api.GetLedgersRequest,
  ): Promise<Api.GetLedgersResponse> {
    return this._getLedgers(request).then((raw) => {
      const result: Api.GetLedgersResponse = {
        ledgers: (raw.ledgers || []).map(parseRawLedger),
        latestLedger: raw.latestLedger,
        latestLedgerCloseTime: raw.latestLedgerCloseTime,
        oldestLedger: raw.oldestLedger,
        oldestLedgerCloseTime: raw.oldestLedgerCloseTime,
        cursor: raw.cursor,
      };
      return result;
    });
  }

  // eslint-disable-next-line require-await
  public async _getLedgers(
    request: Api.GetLedgersRequest,
  ): Promise<Api.RawGetLedgersResponse> {
    return jsonrpc.postObject(this.serverURL.toString(), "getLedgers", request);
  }
}
