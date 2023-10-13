/* tslint:disable:variable-name no-namespace */
import URI from 'urijs';

import {
  Account,
  Address,
  Contract,
  FeeBumpTransaction,
  Keypair,
  Transaction,
  xdr,
  hash
} from 'stellar-base';

import AxiosClient from './axios';
import { Friendbot } from './friendbot';
import * as jsonrpc from './jsonrpc';
import { Api } from './soroban_rpc';
import { assembleTransaction } from './transaction';
import {
  parseRawSendTransaction,
  parseRawSimulation,
  parseRawLedgerEntries,
  parseRawEvents
} from './parsers';

export const SUBMIT_TRANSACTION_TIMEOUT = 60 * 1000;

/**
 * Specifies the durability namespace of contract-related ledger entries.
 */
export enum Durability {
  Temporary = 'temporary',
  Persistent = 'persistent'
}

export namespace Server {
  /** Describes the complex filter combinations available for event queries. */
  export interface GetEventsRequest {
    filters: Api.EventFilter[];
    startLedger?: number; // either this or cursor
    cursor?: string; // either this or startLedger
    limit?: number;
  }

  export interface Options {
    allowHttp?: boolean;
    timeout?: number;
    headers?: Record<string, string>;
  }
}

/**
 * Handles the network connection to a Soroban RPC instance, exposing an
 * interface for requests to that instance.
 *
 * @constructor
 *
 * @param {string} serverURL Soroban-RPC Server URL (ex.
 *    `http://localhost:8000/soroban/rpc`).
 * @param {object} [opts] Options object
 * @param {boolean} [opts.allowHttp]  allows connecting to insecure http servers
 *    (default: `false`). This must be set to false in production deployments!
 *    You can also use {@link Config} class to set this globally.
 * @param {Record<string, string>} [opts.headers] allows setting custom headers
 *
 * @see https://soroban.stellar.org/api/methods
 */
export class Server {
  /** Soroban RPC Server URL (ex. `http://localhost:8000/soroban/rpc`). */
  public readonly serverURL: URI;

  constructor(serverURL: string, opts: Server.Options = {}) {
    this.serverURL = URI(serverURL);

    if (opts.headers && Object.keys(opts.headers).length === 0) {
      AxiosClient.interceptors.request.use((config: any) => {
        // merge the custom headers into any existing headers
        config.headers = Object.assign(config.headers, opts.headers);
        return config;
      });
    }

    if (this.serverURL.protocol() !== 'https' && !opts.allowHttp) {
      throw new Error(
        "Cannot connect to insecure Soroban RPC server if `allowHttp` isn't set"
      );
    }
  }

  /**
   * Fetch a minimal set of current info about a Stellar account.
   *
   * Needed to get the current sequence number for the account so you can build
   * a successful transaction with {@link TransactionBuilder}.
   *
   * @param {string} address - The public address of the account to load.
   *
   * @returns {Promise<Account>}  a promise to the {@link Account} object with
   *    a populated sequence number
   *
   * @see https://soroban.stellar.org/api/methods/getLedgerEntries
   * @example
   * const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
   * server.getAccount(accountId).then((account) => {
   *   console.log("sequence:", account.sequence);
   * });
   */
  public async getAccount(address: string): Promise<Account> {
    const ledgerKey = xdr.LedgerKey.account(
      new xdr.LedgerKeyAccount({
        accountId: Keypair.fromPublicKey(address).xdrPublicKey()
      })
    );

    const resp = await this.getLedgerEntries(ledgerKey);
    if (resp.entries.length === 0) {
      return Promise.reject({
        code: 404,
        message: `Account not found: ${address}`
      });
    }

    const accountEntry = resp.entries[0].val.account();
    return new Account(address, accountEntry.seqNum().toString());
  }

  /**
   * General node health check.
   *
   * @returns {Promise<Api.GetHealthResponse>}   a promise to the
   *    {@link Api.GetHealthResponse} object with the status of the
   *    server (e.g. "healthy").
   *
   * @see https://soroban.stellar.org/api/methods/getHealth
   * @example
   * server.getHealth().then((health) => {
   *   console.log("status:", health.status);
   * });
   */
  public async getHealth(): Promise<Api.GetHealthResponse> {
    return jsonrpc.post<Api.GetHealthResponse>(
      this.serverURL.toString(),
      'getHealth'
    );
  }

  /**
   * Reads the current value of contract data ledger entries directly.
   *
   * Allows you to directly inspect the current state of a contract. This is a
   * backup way to access your contract data which may not be available via
   * events or {@link Server.simulateTransaction}.
   *
   * @param {string|Address|Contract} contract    the contract ID containing the
   *    data to load as a strkey (`C...` form), a {@link Contract}, or an
   *    {@link Address} instance
   * @param {xdr.ScVal} key   the key of the contract data to load
   * @param {Durability} [durability=Durability.Persistent]   the "durability
   *    keyspace" that this ledger key belongs to, which is either 'temporary'
   *    or 'persistent' (the default), see {@link Durability}.
   *
   * @returns {Promise<Api.LedgerEntryResult>}   the current data value
   *
   * @warning If the data entry in question is a 'temporary' entry, it's
   *    entirely possible that it has expired out of existence.
   *
   * @see https://soroban.stellar.org/api/methods/getLedgerEntries
   * @example
   * const contractId = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
   * const key = xdr.ScVal.scvSymbol("counter");
   * server.getContractData(contractId, key, Durability.Temporary).then(data => {
   *   console.log("value:", data.val);
   *   console.log("expirationLedgerSeq:", data.expirationLedgerSeq);
   *   console.log("lastModified:", data.lastModifiedLedgerSeq);
   *   console.log("latestLedger:", data.latestLedger);
   * });
   */
  public async getContractData(
    contract: string | Address | Contract,
    key: xdr.ScVal,
    durability: Durability = Durability.Persistent
  ): Promise<Api.LedgerEntryResult> {
    // coalesce `contract` param variants to an ScAddress
    let scAddress: xdr.ScAddress;
    if (typeof contract === 'string') {
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

    let contractKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        key,
        contract: scAddress,
        durability: xdrDurability
      })
    );

    return this.getLedgerEntries(contractKey).then(
      (r: Api.GetLedgerEntriesResponse) => {
        if (r.entries.length === 0) {
          return Promise.reject({
            code: 404,
            message: `Contract data not found. Contract: ${Address.fromScAddress(
              scAddress
            ).toString()}, Key: ${key.toXDR(
              'base64'
            )}, Durability: ${durability}`
          });
        }

        return r.entries[0];
      }
    );
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
   * @param {xdr.ScVal[]} keys  one or more ledger entry keys to load
   *
   * @returns {Promise<Api.GetLedgerEntriesResponse>}  the current
   *    on-chain values for the given ledger keys
   *
   * @see Server._getLedgerEntries
   * @see https://soroban.stellar.org/api/methods/getLedgerEntries
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
   *   console.log("expirationLedgerSeq:", ledgerData.expirationLedgerSeq);
   *   console.log("lastModified:", ledgerData.lastModifiedLedgerSeq);
   *   console.log("latestLedger:", response.latestLedger);
   * });
   */
  public async getLedgerEntries(
    ...keys: xdr.LedgerKey[]
  ): Promise<Api.GetLedgerEntriesResponse> {
    return this._getLedgerEntries(...keys).then(parseRawLedgerEntries);
  }

  public async _getLedgerEntries(...keys: xdr.LedgerKey[]) {
    return jsonrpc
      .post<Api.RawGetLedgerEntriesResponse>(
        this.serverURL.toString(),
        'getLedgerEntries',
        expandRequestIncludeExpirationLedgers(keys).map((k) =>
          k.toXDR('base64')
        )
      )
      .then((response) => mergeResponseExpirationLedgers(response, keys));
  }

  /**
   * Fetch the details of a submitted transaction.
   *
   * After submitting a transaction, clients should poll this to tell when the
   * transaction has completed.
   *
   * @param {string} hash   hex-encoded hash of the transaction to check
   *
   * @returns {Promise<Api.GetTransactionResponse>}  the status,
   *    result, and other details about the transaction
   *
   * @see https://soroban.stellar.org/api/methods/getTransaction
   * @example
   * const transactionHash = "c4515e3bdc0897f21cc5dbec8c82cf0a936d4741cb74a8e158eb51b9fb00411a";
   * server.getTransaction(transactionHash).then((tx) => {
   *   console.log("status:", tx.status);
   *   console.log("envelopeXdr:", tx.envelopeXdr);
   *   console.log("resultMetaXdr:", tx.resultMetaXdr);
   *   console.log("resultXdr:", tx.resultXdr);
   * });
   */
  public async getTransaction(
    hash: string
  ): Promise<Api.GetTransactionResponse> {
    return this._getTransaction(hash).then((raw) => {
      let successInfo: Omit<
        Api.GetSuccessfulTransactionResponse,
        keyof Api.GetFailedTransactionResponse
      > = {} as any;

      if (raw.status === Api.GetTransactionStatus.SUCCESS) {
        const meta = xdr.TransactionMeta.fromXDR(raw.resultMetaXdr!, 'base64');
        successInfo = {
          ledger: raw.ledger!,
          createdAt: raw.createdAt!,
          applicationOrder: raw.applicationOrder!,
          feeBump: raw.feeBump!,
          envelopeXdr: xdr.TransactionEnvelope.fromXDR(
            raw.envelopeXdr!,
            'base64'
          ),
          resultXdr: xdr.TransactionResult.fromXDR(raw.resultXdr!, 'base64'),
          resultMetaXdr: meta,
          ...(meta.switch() === 3 &&
            meta.v3().sorobanMeta() !== null && {
              returnValue: meta.v3().sorobanMeta()?.returnValue()
            })
        };
      }

      const result: Api.GetTransactionResponse = {
        status: raw.status,
        latestLedger: raw.latestLedger,
        latestLedgerCloseTime: raw.latestLedgerCloseTime,
        oldestLedger: raw.oldestLedger,
        oldestLedgerCloseTime: raw.oldestLedgerCloseTime,
        ...successInfo
      };

      return result;
    });
  }

  public async _getTransaction(
    hash: string
  ): Promise<Api.RawGetTransactionResponse> {
    return jsonrpc.post(this.serverURL.toString(), 'getTransaction', hash);
  }

  /**
   * Fetch all events that match a given set of filters.
   *
   * The given filters (see {@link Api.EventFilter} for detailed fields)
   * are combined only in a logical OR fashion, and all of the fields in each
   * filter are optional.
   *
   * To page through events, use the `pagingToken` field on the relevant
   * {@link Api.EventResponse} object to set the `cursor` parameter.
   *
   * @param {Server.GetEventsRequest} request   event filters
   * @returns {Promise<Api.GetEventsResponse>}   a paginatable set of the
   *    events matching the given event filters
   *
   * @see https://soroban.stellar.org/api/methods/getEvents
   * @example
   * server.getEvents({
   *    startLedger: "1000",
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
  public async getEvents(
    request: Server.GetEventsRequest
  ): Promise<Api.GetEventsResponse> {
    return this._getEvents(request).then(parseRawEvents);
  }

  public async _getEvents(
    request: Server.GetEventsRequest
  ): Promise<Api.RawGetEventsResponse> {
    return jsonrpc.postObject(this.serverURL.toString(), 'getEvents', {
      filters: request.filters ?? [],
      pagination: {
        ...(request.cursor && { cursor: request.cursor }), // add if defined
        ...(request.limit && { limit: request.limit })
      },
      ...(request.startLedger && {
        startLedger: request.startLedger.toString()
      })
    });
  }

  /**
   * Fetch metadata about the network this Soroban RPC server is connected to.
   *
   * @returns {Promise<Api.GetNetworkResponse>}  metadata about the
   *    current network this RPC server is connected to
   *
   * @see https://soroban.stellar.org/api/methods/getNetwork
   * @example
   * server.getNetwork().then((network) => {
   *   console.log("friendbotUrl:", network.friendbotUrl);
   *   console.log("passphrase:", network.passphrase);
   *   console.log("protocolVersion:", network.protocolVersion);
   * });
   */
  public async getNetwork(): Promise<Api.GetNetworkResponse> {
    return await jsonrpc.post(this.serverURL.toString(), 'getNetwork');
  }

  /**
   * Fetch the latest ledger meta info from network which this Soroban RPC
   * server is connected to.
   *
   * @returns {Promise<Api.GetLatestLedgerResponse>}   metadata about the
   *    latest ledger on the network that this RPC server is connected to
   *
   * @see https://soroban.stellar.org/api/methods/getLatestLedger
   * @example
   * server.getLatestLedger().then((response) => {
   *   console.log("hash:", response.id);
   *   console.log("sequence:", response.sequence);
   *   console.log("protocolVersion:", response.protocolVersion);
   * });
   */
  public async getLatestLedger(): Promise<Api.GetLatestLedgerResponse> {
    return jsonrpc.post(this.serverURL.toString(), 'getLatestLedger');
  }

  /**
   * Submit a trial contract invocation to get back return values, expected
   * ledger footprint, expected authorizations, and expected costs.
   *
   * @param {Transaction | FeeBumpTransaction} transaction  the transaction to
   *    simulate, which should include exactly one operation (one of
   *    {@link xdr.InvokeHostFunctionOp}, {@link xdr.BumpFootprintExpirationOp},
   *    or {@link xdr.RestoreFootprintOp}). Any provided footprint or auth
   *    information will be ignored.
   *
   * @returns {Promise<Api.SimulateTransactionResponse>}   an object with
   *    the cost, footprint, result/auth requirements (if applicable), and error
   *    of the transaction
   *
   * @see https://developers.stellar.org/docs/glossary/transactions/
   * @see https://soroban.stellar.org/api/methods/simulateTransaction
   * @see Server.prepareTransaction
   * @see assembleTransaction
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
  public async simulateTransaction(
    transaction: Transaction | FeeBumpTransaction
  ): Promise<Api.SimulateTransactionResponse> {
    return this._simulateTransaction(transaction).then(parseRawSimulation);
  }

  public async _simulateTransaction(
    transaction: Transaction | FeeBumpTransaction
  ): Promise<Api.RawSimulateTransactionResponse> {
    return jsonrpc.post(
      this.serverURL.toString(),
      'simulateTransaction',
      transaction.toXDR()
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
   * from simulation. It is adviseable to check the fee on returned transaction
   * and validate or take appropriate measures for interaction with user to
   * confirm it is acceptable.
   *
   * You can call the {@link Server.simulateTransaction} method directly first
   * if you want to inspect estimated fees for a given transaction in detail
   * first, then re-assemble it manually or via {@link assembleTransaction}.
   *
   * @param {Transaction | FeeBumpTransaction} transaction  the transaction to
   *    prepare. It should include exactly one operation, which must be one of
   *    {@link xdr.InvokeHostFunctionOp}, {@link xdr.BumpFootprintExpirationOp},
   *    or {@link xdr.RestoreFootprintOp}.
   *
   *    Any provided footprint will be overwritten. However, if your operation
   *    has existing auth entries, they will be preferred over ALL auth entries
   *    from the simulation. In other words, if you include auth entries, you
   *    don't care about the auth returned from the simulation. Other fields
   *    (footprint, etc.) will be filled as normal.
   * @param {string} [networkPassphrase]  explicitly provide a network
   *    passphrase (default: requested from the server via
   *    {@link Server.getNetwork}).
   *
   * @returns {Promise<Transaction | FeeBumpTransaction>}   a copy of the
   *    transaction with the expected authorizations (in the case of
   *    invocation), resources, and ledger footprints added. The transaction fee
   *    will also automatically be padded with the contract's minimum resource
   *    fees discovered from the simulation.
   *
   * @see assembleTransaction
   * @see https://soroban.stellar.org/api/methods/simulateTransaction
   * @throws {jsonrpc.Error<any> | Error}   if simulation fails
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
  public async prepareTransaction(
    transaction: Transaction | FeeBumpTransaction,
    networkPassphrase?: string
  ): Promise<Transaction | FeeBumpTransaction> {
    const [{ passphrase }, simResponse] = await Promise.all([
      networkPassphrase
        ? Promise.resolve({ passphrase: networkPassphrase })
        : this.getNetwork(),
      this.simulateTransaction(transaction)
    ]);
    if (Api.isSimulationError(simResponse)) {
      throw simResponse.error;
    }
    if (!simResponse.result) {
      throw new Error('transaction simulation failed');
    }

    return assembleTransaction(transaction, passphrase, simResponse).build();
  }

  /**
   * Submit a real transaction to the Stellar network.
   *
   * Unlike Horizon, Soroban RPC does not wait for transaction completion. It
   * simply validates the transaction and enqueues it. Clients should call
   * {@link Server.getTransactionStatus} to learn about transaction
   * success/failure.
   *
   * @param {Transaction | FeeBumpTransaction} transaction  to submit
   * @returns {Promise<Api.SendTransactionResponse>}   the
   *    transaction id, status, and any error if available
   *
   * @see https://developers.stellar.org/docs/glossary/transactions/
   * @see https://soroban.stellar.org/api/methods/sendTransaction
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
  public async sendTransaction(
    transaction: Transaction | FeeBumpTransaction
  ): Promise<Api.SendTransactionResponse> {
    return this._sendTransaction(transaction).then(parseRawSendTransaction);
  }

  public async _sendTransaction(
    transaction: Transaction | FeeBumpTransaction
  ): Promise<Api.RawSendTransactionResponse> {
    return jsonrpc.post(
      this.serverURL.toString(),
      'sendTransaction',
      transaction.toXDR()
    );
  }

  /**
   * Fund a new account using the network's friendbot faucet, if any.
   *
   * @param {string | Account} address  the address or account instance that we
   *    want to create and fund with friendbot
   * @param {string} [friendbotUrl]     optionally, an explicit address for
   *    friendbot (by default: this calls the Soroban RPC
   *    {@link Server.getNetwork} method to try to discover this network's
   *    Friendbot url).
   *
   * @returns {Promise<Account>}  an {@link Account} object for the created
   *    account, or the existing account if it's already funded with the
   *    populated sequence number (note that the account will not be "topped
   *    off" if it already exists)
   *
   * @throws if Friendbot is not configured on this network or request failure
   *
   * @see
   * https://developers.stellar.org/docs/fundamentals-and-concepts/testnet-and-pubnet#friendbot
   * @see Friendbot.Response
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
    address: string | Pick<Account, 'accountId'>,
    friendbotUrl?: string
  ): Promise<Account> {
    const account = typeof address === 'string' ? address : address.accountId();
    friendbotUrl = friendbotUrl || (await this.getNetwork()).friendbotUrl;
    if (!friendbotUrl) {
      throw new Error('No friendbot URL configured for current network');
    }

    try {
      const response = await AxiosClient.post<Friendbot.Response>(
        `${friendbotUrl}?addr=${encodeURIComponent(account)}`
      );

      const meta = xdr.TransactionMeta.fromXDR(
        response.data.result_meta_xdr,
        'base64'
      );
      const sequence = findCreatedAccountSequenceInTransactionMeta(meta);
      return new Account(account, sequence);
    } catch (error: any) {
      if (error.response?.status === 400) {
        if (error.response.detail?.includes('createAccountAlreadyExist')) {
          // Account already exists, load the sequence number
          return this.getAccount(account);
        }
      }
      throw error;
    }
  }
}

function findCreatedAccountSequenceInTransactionMeta(
  meta: xdr.TransactionMeta
): string {
  let operations: xdr.OperationMeta[] = [];
  switch (meta.switch()) {
    case 0:
      operations = meta.operations();
      break;
    case 1:
    case 2:
    case 3: // all three have the same interface
      operations = (meta.value() as xdr.TransactionMetaV3).operations();
      break;
    default:
      throw new Error('Unexpected transaction meta switch value');
  }

  for (const op of operations) {
    for (const c of op.changes()) {
      if (c.switch() !== xdr.LedgerEntryChangeType.ledgerEntryCreated()) {
        continue;
      }
      const data = c.created().data();
      if (data.switch() !== xdr.LedgerEntryType.account()) {
        continue;
      }

      return data.account().seqNum().toString();
    }
  }

  throw new Error('No account created in transaction');
}

// TODO - remove once rpc updated to
// append expiration entry per data LK requested onto server-side response
// https://github.com/stellar/soroban-tools/issues/1010
function mergeResponseExpirationLedgers(
  ledgerEntriesResponse: Api.RawGetLedgerEntriesResponse,
  requestedKeys: xdr.LedgerKey[]
): Api.RawGetLedgerEntriesResponse {
  const requestedKeyXdrs = new Set<String>(
    requestedKeys.map((requestedKey) => requestedKey.toXDR('base64'))
  );
  const expirationKeyToRawEntryResult = new Map<
    String,
    Api.RawLedgerEntryResult
  >();
  (ledgerEntriesResponse.entries ?? []).forEach((rawEntryResult) => {
    if (!rawEntryResult.key || !rawEntryResult.xdr) {
      throw new TypeError(
        `invalid ledger entry: ${JSON.stringify(rawEntryResult)}`
      );
    }
    const parsedKey = xdr.LedgerKey.fromXDR(rawEntryResult.key, 'base64');
    const isExpirationMeta =
      parsedKey.switch().value === xdr.LedgerEntryType.expiration().value &&
      !requestedKeyXdrs.has(rawEntryResult.key);
    const keyHash = isExpirationMeta
      ? parsedKey.expiration().keyHash().toString()
      : hash(parsedKey.toXDR()).toString();

    const rawEntry =
      expirationKeyToRawEntryResult.get(keyHash) ?? rawEntryResult;

    if (isExpirationMeta) {
      const expirationLedgerSeq = xdr.LedgerEntryData.fromXDR(
        rawEntryResult.xdr,
        'base64'
      )
        .expiration()
        .expirationLedgerSeq();
      expirationKeyToRawEntryResult.set(keyHash, {
        ...rawEntry,
        expirationLedgerSeq
      });
    } else {
      expirationKeyToRawEntryResult.set(keyHash, {
        ...rawEntry,
        ...rawEntryResult
      });
    }
  });

  ledgerEntriesResponse.entries = [...expirationKeyToRawEntryResult.values()];
  return ledgerEntriesResponse;
}

// TODO - remove once rpc updated to
// include expiration entry on responses for any data LK's requested
// https://github.com/stellar/soroban-tools/issues/1010
function expandRequestIncludeExpirationLedgers(
  keys: xdr.LedgerKey[]
): xdr.LedgerKey[] {
  return keys.concat(
    keys
      .filter(
        (key) => key.switch().value !== xdr.LedgerEntryType.expiration().value
      )
      .map((key) =>
        xdr.LedgerKey.expiration(
          new xdr.LedgerKeyExpiration({ keyHash: hash(key.toXDR()) })
        )
      )
  );
}
