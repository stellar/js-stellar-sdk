/* tslint:disable:variable-name no-namespace */

import {
  Account,
  Address,
  Contract,
  FeeBumpTransaction,
  StrKey,
  Transaction,
  xdr,
} from "stellar-base";
import URI from "urijs";

import AxiosClient from "../axios";
import { Friendbot } from "./friendbot";
import * as jsonrpc from "./jsonrpc";
import { SorobanRpc } from "./soroban_rpc";
import { assembleTransaction } from "./transaction";

export const SUBMIT_TRANSACTION_TIMEOUT = 60 * 1000;

export interface GetEventsRequest {
  startLedger?: number;
  filters: SorobanRpc.EventFilter[];
  cursor?: string;
  limit?: number;
}

/**
 * Specifies the durability namespace of contract-related ledger entries.
 */
export enum Durability {
  Temporary = 'temporary',
  Persistent = 'persistent',
}

/**
 * Server handles the network connection to a
 * [Soroban-RPC](https://soroban.stellar.org/docs) instance and exposes an
 * interface for requests to that instance.
 *
 * @constructor
 *
 * @param {string} serverURL Soroban-RPC Server URL (ex.
 *    `http://localhost:8000/soroban/rpc`).
 * @param {object} [opts] Options object
 * @param {boolean} [opts.allowHttp] - Allow connecting to http servers,
 *    default: `false`. This must be set to false in production deployments! You
 *    can also use {@link Config} class to set this globally.
 * @param {string} [opts.appName] - Allow set custom header `X-App-Name`
 * @param {string} [opts.appVersion] - Allow set custom header `X-App-Version`
 */
export class Server {
  /**
   * Soroban-RPC Server URL (ex. `http://localhost:8000/soroban/rpc`).
   */
  public readonly serverURL: URI;

  constructor(serverURL: string, opts: Server.Options = {}) {
    this.serverURL = URI(serverURL);

    const customHeaders: any = {};

    if (opts.appName) {
      customHeaders["X-App-Name"] = opts.appName;
    }
    if (opts.appVersion) {
      customHeaders["X-App-Version"] = opts.appVersion;
    }
    if ((Object.keys(customHeaders).length ?? 0) !== 0) {
      AxiosClient.interceptors.request.use((config: any) => {
        // merge the custom headers with any existing headers
        config.headers = Object.assign(config.headers, customHeaders);
        return config;
      });
    }

    if (this.serverURL.protocol() !== "https" && !opts.allowHttp) {
      throw new Error("Cannot connect to insecure soroban-rpc server");
    }
  }

  /**
   * Fetch a minimal set of current info about a Stellar account.
   *
   * Needed to get the current sequence number for the account so you can build
   * a successful transaction with {@link TransactionBuilder}.
   *
   * @example
   * server.getAccount("GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4").then(account => {
   *   console.log("sequence:", account.sequence);
   * });
   *
   * @param {string} address - The public address of the account to load.
   * @returns {Promise<Account>} Returns a promise to the {@link Account} object with populated sequence number.
   */
  public async getAccount(address: string): Promise<Account> {
    const ledgerKey = xdr.LedgerKey.account(
      new xdr.LedgerKeyAccount({
        accountId: xdr.PublicKey.publicKeyTypeEd25519(
          StrKey.decodeEd25519PublicKey(address),
        ),
      }),
    ).toXDR("base64");
    const data: SorobanRpc.GetLedgerEntriesResponse = await jsonrpc.post(
      this.serverURL.toString(),
      "getLedgerEntries",
      [ledgerKey],
    );
    const ledgerEntries = data.entries ?? [];
    if (ledgerEntries.length === 0) {
      return Promise.reject({
        code: 404,
        message: `Account not found: ${address}`,
      });
    }
    const ledgerEntryData = ledgerEntries[0].xdr;
    const accountEntry = xdr.LedgerEntryData.fromXDR(
      ledgerEntryData,
      "base64",
    ).account();
    const { high, low } = accountEntry.seqNum();
    const sequence = BigInt(high) * BigInt(4294967296) + BigInt(low);
    return new Account(address, sequence.toString());
  }

  /**
   * General node health check.
   *
   * @example
   * server.getHealth().then(health => {
   *   console.log("status:", health.status);
   * });
   *
   * @returns {Promise<SorobanRpc.GetHealthResponse>} Returns a promise to the {@link SorobanRpc.GetHealthResponse} object with the status of the server ("healthy").
   */
  public async getHealth(): Promise<SorobanRpc.GetHealthResponse> {
    return await jsonrpc.post<SorobanRpc.GetHealthResponse>(
      this.serverURL.toString(),
      "getHealth",
    );
  }

  /**
   * Reads the current value of contract data ledger entries directly.
   *
   * @example
   * const contractId = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
   * const key = xdr.ScVal.scvSymbol("counter");
   * server.getContractData(contractId, key, 'temporary').then(data => {
   *   console.log("value:", data.xdr);
   *   console.log("lastModified:", data.lastModifiedLedgerSeq);
   *   console.log("latestLedger:", data.latestLedger);
   * });
   *
   * Allows you to directly inspect the current state of a contract. This is a
   * backup way to access your contract data which may not be available via
   * events or simulateTransaction.
   *
   * @param {string|Address|Contract} contract - The contract ID containing the
   *    data to load. Encoded as Stellar Contract Address string (e.g.
   *    `CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5`), a
   *    {@link Contract}, or an {@link Address} instance.
   * @param {xdr.ScVal} key - The key of the contract data to load.
   * @param {Durability} [durability] - The "durability keyspace" that this
   *    ledger key belongs to, which is either 'temporary' or 'persistent' (the
   *    default), see {@link Durability}.
   *
   * @returns {Promise<SorobanRpc.LedgerEntryResult>} Returns a promise to the
   *    {@link SorobanRpc.LedgerEntryResult} object with the current value.
   *
   * @warning If the data entry in question is a 'temporary' entry, it's
   *    entirely possible that it has expired out of existence. Future versions
   *    of this client may provide abstractions to handle that.
   */
  public async getContractData(
    contract: string | Address | Contract,
    key: xdr.ScVal,
    durability: Durability = Durability.Persistent,
  ): Promise<SorobanRpc.LedgerEntryResult> {
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

    let contractKey: string = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: scAddress,
        key,
        durability: xdrDurability,
        bodyType: xdr.ContractEntryBodyType.dataEntry()   // expirationExtension is internal
      })
    ).toXDR("base64");

    return jsonrpc.post<SorobanRpc.GetLedgerEntriesResponse>(
      this.serverURL.toString(),
      "getLedgerEntries",
      [contractKey],
    ).then(response => {
        const ledgerEntries = response.entries ?? [];
      if (ledgerEntries.length !== 1) {
        return Promise.reject({
          code: 404,
          message: `Contract data not found. Contract: ${Address.fromScAddress(scAddress).toString()}, Key: ${key.toXDR("base64")}, Durability: ${durability}`,
        });
      }
      return ledgerEntries[0];
    });
  }

  /**
   * Reads the current value of ledger entries directly.
   *
   * Allows you to directly inspect the current state of contracts, contract's
   * code, or any other ledger entries. This is a backup way to access your
   * contract data which may not be available via events or simulateTransaction.
   *
   * To fetch contract wasm byte-code, use the ContractCode ledger entry key.
   *
   * @example
   * const contractId = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
   * const key = xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({
   *   contractId: StrKey.decodeContract(contractId),
   *   key: xdr.ScVal.scvSymbol("counter"),
   * }));
   * server.getLedgerEntries([key]).then(response => {
   *   const ledgerData = response.entries[0];
   *   console.log("key:", ledgerData.key);
   *   console.log("value:", ledgerData.xdr);
   *   console.log("lastModified:", ledgerData.lastModifiedLedgerSeq);
   *   console.log("latestLedger:", response.latestLedger);
   * });
   *
   * @param {xdr.ScVal[]} keys - The ledger entry keys to load.
   *
   * @returns {Promise<SorobanRpc.GetLedgerEntriesResponse>} Returns a promise
   *    to the {@link SorobanRpc.GetLedgerEntriesResponse} object with the
   *    current value.
   */
  public async getLedgerEntries(
    keys: xdr.LedgerKey[],
  ): Promise<SorobanRpc.GetLedgerEntriesResponse> {
    return await jsonrpc.post(
      this.serverURL.toString(),
      "getLedgerEntries",
      keys.map((k) => k.toXDR("base64")),
    );
  }

  /**
   * Fetch the details of a submitted transaction.
   *
   * When submitting a transaction, clients should poll this to tell when the
   * transaction has completed.
   *
   * @example
   * const transactionHash = "c4515e3bdc0897f21cc5dbec8c82cf0a936d4741cb74a8e158eb51b9fb00411a";
   * server.getTransaction(transactionHash).then(transaction => {
   *   console.log("status:", transaction.status);
   *   console.log("envelopeXdr:", transaction.envelopeXdr);
   *   console.log("resultMetaXdr:", transaction.resultMetaXdr);
   *   console.log("resultXdr:", transaction.resultXdr);
   * });
   *
   * @param {string} hash - The hex-encoded hash of the transaction to check.
   *
   * @returns {Promise<SorobanRpc.GetTransactionResponse>} Returns a
   *    promise to the {@link SorobanRpc.GetTransactionResponse} object
   *    with the status, result, and other details about the transaction.
   */
  public async getTransaction(
    hash: string,
  ): Promise<SorobanRpc.GetTransactionResponse> {
    return await jsonrpc.post(
      this.serverURL.toString(),
      "getTransaction",
      hash,
    );
  }

  /**
   * Fetches all events that match a given set of filters.
   *
   * The given filters (see {@link SorobanRpc.EventFilter} for detailed fields)
   * are combined only in a logical OR fashion, and all of the fields in each
   * filter are optional.
   *
   * To page through events, use the `pagingToken` field on the relevant
   * {@link SorobanRpc.EventResponse} object to set the `cursor` parameter.
   *
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
   *
   * @returns {Promise<SorobanRpc.GetEventsResponse>} a promise to the
   *    {@link SorobanRpc.GetEventsResponse} object containing a paginatable set
   *    of the events matching the given event filters.
   */
  public async getEvents(
    request: GetEventsRequest,
  ): Promise<SorobanRpc.GetEventsResponse> {
    // TODO: It'd be nice if we could do something to infer the types of filter
    // arguments a user wants, e.g. converting something like "transfer/*/42"
    // into the base64-encoded `ScVal` equivalents by inferring that the first
    // is an ScSymbol and the last is a U32.
    //
    // The difficulty comes in matching up the correct integer primitives.
    //
    // It also means this library will rely on the XDR definitions.
    return await jsonrpc.postObject(this.serverURL.toString(), "getEvents", {
      filters: request.filters ?? [],
      pagination: {
        ...(request.cursor && { cursor: request.cursor }), // add fields only if defined
        ...(request.limit && { limit: request.limit }),
      },
      ...(request.startLedger && { startLedger: String(request.startLedger) }),
    });
  }

  /**
   * Fetches metadata about the network which Soroban-RPC is connected to.
   *
   * @example
   * server.getNetwork().then(network => {
   *   console.log("friendbotUrl:", network.friendbotUrl);
   *   console.log("passphrase:", network.passphrase);
   *   console.log("protocolVersion:", network.protocolVersion);
   * });
   *
   * @returns {Promise<SorobanRpc.GetNetworkResponse>} a promise to the
   *    {@link SorobanRpc.GetNetworkResponse} object containing metadata
   *    about the current network this soroban-rpc server is connected to.
   */
  public async getNetwork(): Promise<SorobanRpc.GetNetworkResponse> {
    return await jsonrpc.post(this.serverURL.toString(), "getNetwork");
  }

  /**
   * Fetches the latest ledger meta info from network which Soroban-RPC is connected to.
   *
   * @example
   * server.getLatestLedger().then(response => {
   *   console.log("hash:", response.id);
   *   console.log("sequence:", response.sequence);
   *   console.log("protocolVersion:", response.protocolVersion);
   * });
   *
   * @returns {Promise<SorobanRpc.GetLatestLedgerResponse>} a promise to the
   *    {@link SorobanRpc.GetLatestLedgerResponse} object containing metadata
   *    about the latest ledger from network soroban-rpc server is connected to.
   */
  public async getLatestLedger(): Promise<SorobanRpc.GetLatestLedgerResponse> {
    return await jsonrpc.post(this.serverURL.toString(), "getLatestLedger");
  }

  /**
   * Submit a trial contract invocation to get back return values, expected
   * ledger footprint, expected authorizations, and expected costs.
   *
   * @example
   * const contractId = 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE';
   * const contract = new SorobanClient.Contract(contractId);
   *
   * // Right now, this is just the default fee for this example.
   * const fee = 100;
   *
   * const transaction = new SorobanClient.TransactionBuilder(account, {
   *     fee,
   *     // Uncomment the following line to build transactions for the live network. Be
   *     // sure to also change the horizon hostname.
   *     // networkPassphrase: SorobanClient.Networks.PUBLIC,
   *     networkPassphrase: SorobanClient.Networks.FUTURENET
   *   })
   *   // Add a contract.increment soroban contract invocation operation
   *   .addOperation(contract.call("increment"))
   *   // Make this transaction valid for the next 30 seconds only
   *   .setTimeout(30)
   *   // Uncomment to add a memo (https://developers.stellar.org/docs/glossary/transactions/)
   *   // .addMemo(SorobanClient.Memo.text('Hello world!'))
   *   .build();
   *
   * // Sign this transaction with the secret key
   * // NOTE: signing is transaction is network specific. Test network transactions
   * // won't work in the public network. To switch networks, use the Network object
   * // as explained above (look for SorobanClient.Network).
   * const sourceKeypair = SorobanClient.Keypair.fromSecret(sourceSecretKey);
   * transaction.sign(sourceKeypair);
   *
   * server.simulateTransaction(transaction).then(sim => {
   *   console.log("cost:", sim.cost);
   *   console.log("results:", sim.results);
   *   console.log("error:", sim.error);
   *   console.log("latestLedger:", sim.latestLedger);
   * });
   *
   * @param {Transaction | FeeBumpTransaction} transaction - The transaction to
   *    simulate. It should include exactly one operation, which must be one of
   *    {@link xdr.InvokeHostFunctionOp}, {@link xdr.BumpFootprintExpirationOp},
   *    or {@link xdr.RestoreFootprintOp}. Any provided footprint will be
   *    ignored.
   *
   * @returns {Promise<SorobanRpc.SimulateTransactionResponse>} Returns a
   *    promise to the {@link SorobanRpc.SimulateTransactionResponse} object
   *    with the cost, footprint, result/auth requirements (if applicable), and
   *    error of the transaction.
   */
  public async simulateTransaction(
    transaction: Transaction | FeeBumpTransaction,
  ): Promise<SorobanRpc.SimulateTransactionResponse> {
    return await jsonrpc.post(
      this.serverURL.toString(),
      "simulateTransaction",
      transaction.toXDR(),
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
   * first, if that is of importance.
   *
   * @example
   * const contractId = 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE';
   * const contract = new SorobanClient.Contract(contractId);
   *
   * // Right now, this is just the default fee for this example.
   * const fee = 100;
   *
   * const transaction = new SorobanClient.TransactionBuilder(account, {
   *     fee,
   *     // Uncomment the following line to build transactions for the live network. Be
   *     // sure to also change the horizon hostname.
   *     // networkPassphrase: SorobanClient.Networks.PUBLIC,
   *     networkPassphrase: SorobanClient.Networks.TESTNET
   *   })
   *   // Add a contract.increment soroban contract invocation operation
   *   .addOperation(contract.call("increment"))
   *   // Make this transaction valid for the next 30 seconds only
   *   .setTimeout(30)
   *   // Uncomment to add a memo (https://developers.stellar.org/docs/glossary/transactions/)
   *   // .addMemo(SorobanClient.Memo.text('Hello world!'))
   *   .build();
   *
   * preparedTransaction = await server.prepareTransaction(transaction);
   *
   * // Sign this transaction with the secret key
   * // NOTE: signing is transaction is network specific. Test network transactions
   * // won't work in the public network. To switch networks, use the Network object
   * // as explained above (look for SorobanClient.Network).
   * const sourceKeypair = SorobanClient.Keypair.fromSecret(sourceSecretKey);
   * preparedTransaction.sign(sourceKeypair);
   *
   * server.sendTransaction(transaction).then(result => {
   *   console.log("hash:", result.hash);
   *   console.log("status:", result.status);
   *   console.log("errorResultXdr:", result.errorResultXdr);
   * });
   *
   * @param {Transaction | FeeBumpTransaction} transaction - The transaction to
   *    prepare. It should include exactly one operation, which must be one of
   *    {@link xdr.InvokeHostFunctionOp}, {@link xdr.BumpFootprintExpirationOp},
   *    or {@link xdr.RestoreFootprintOp}.
   *
   *    Any provided footprint will be overwritten. However, if your operation
   *    has existing auth entries, they will be preferred over ALL auth entries
   *    from the simulation. In other words, if you include auth entries, you
   *    don't care about the auth returned from the simulation. Other fields
   *    (footprint, etc.) will be filled as normal.
   * @param {string} [networkPassphrase] - Explicitly provide a network
   *    passphrase. If not passed, the current network passphrase will be
   *    requested from the server via {@link Server.getNetwork}.
   *
   * @returns {Promise<Transaction | FeeBumpTransaction>} Returns a copy of the
   *    transaction, with the expected authorizations (in the case of
   *    invocation) and ledger footprint added. The transaction fee will also
   *    automatically be padded with the contract's minimum resource fees
   *    discovered from the simulation.
   *
   * @throws {jsonrpc.Error<any> | Error} if simulation fails
   */
  public async prepareTransaction(
    transaction: Transaction | FeeBumpTransaction,
    networkPassphrase?: string,
  ): Promise<Transaction | FeeBumpTransaction> {
    const [{ passphrase }, simResponse] = await Promise.all([
      networkPassphrase
        ? Promise.resolve({ passphrase: networkPassphrase })
        : this.getNetwork(),
      this.simulateTransaction(transaction),
    ]);
    if (simResponse.error) {
      throw simResponse.error;
    }
    if (!simResponse.results || simResponse.results.length !== 1) {
      throw new Error("transaction simulation failed");
    }
    return assembleTransaction(transaction, passphrase, simResponse);
  }

  /**
   * Submit a real transaction to the Stellar network. This is the only way to
   * make changes "on-chain". Unlike Horizon, Soroban-RPC does not wait for
   * transaction completion. It simply validates the transaction and enqueues
   * it. Clients should call {@link Server#getTransactionStatus} to learn about
   * transaction success/failure.
   *
   * @example
   * const contractId = 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE';
   * const contract = new SorobanClient.Contract(contractId);
   *
   * // Right now, this is just the default fee for this example.
   * const fee = 100;
   *
   * const transaction = new SorobanClient.TransactionBuilder(account, {
   *     fee,
   *     // Uncomment the following line to build transactions for the live network. Be
   *     // sure to also change the horizon hostname.
   *     // networkPassphrase: SorobanClient.Networks.PUBLIC,
   *     networkPassphrase: SorobanClient.Networks.STANDALONE
   *   })
   *   // Add a contract.increment soroban contract invocation operation
   *   // Note: For real transactions you will need to include the footprint
   *   // and auth in the operation, as returned from simulateTransaction.
   *   .addOperation(contract.call("increment"))
   *   // Make this transaction valid for the next 30 seconds only
   *   .setTimeout(30)
   *   // Uncomment to add a memo (https://developers.stellar.org/docs/glossary/transactions/)
   *   // .addMemo(SorobanClient.Memo.text('Hello world!'))
   *   .build();
   *
   * // Sign this transaction with the secret key
   * // NOTE: signing is transaction is network specific. Test network transactions
   * // won't work in the public network. To switch networks, use the Network object
   * // as explained above (look for SorobanClient.Network).
   * const sourceKeypair = SorobanClient.Keypair.fromSecret(sourceSecretKey);
   * transaction.sign(sourceKeypair);
   *
   * server.sendTransaction(transaction).then(result => {
   *   console.log("hash:", result.hash);
   *   console.log("status:", result.status);
   *   console.log("errorResultXdr:", result.errorResultXdr);
   * });
   *
   * @param {Transaction | FeeBumpTransaction} transaction - The transaction to
   *    submit.
   * @returns {Promise<SorobanRpc.SendTransactionResponse>} Returns a promise to
   *    the {@link SorobanRpc.SendTransactionResponse} object with the
   *    transaction id, status, and any error if available.
   */
  public async sendTransaction(
    transaction: Transaction | FeeBumpTransaction,
  ): Promise<SorobanRpc.SendTransactionResponse> {
    return await jsonrpc.post(
      this.serverURL.toString(),
      "sendTransaction",
      transaction.toXDR(),
    );
  }

  /**
   * Use the friendbot faucet to create and fund a new account. The method will
   * return an Account object for the created account, or if the account already
   * existed. If friendbot is not configured on this network, this method will
   * throw an error.  If the request fails, this method will throw an error.
   *
   * @example
   * server
   *    .requestAirdrop("GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4")
   *    .then(accountCreated => {
   *      console.log("accountCreated:", accountCreated);
   *    }).catch(error => {
   *      console.error("error:", error);
   *    });
   *
   * @param {string | Account} address - The address or account we want to
   * create and fund.
   * @param {string} [friendbotUrl] - The optional explicit address for
   *    friendbot. If not provided, the client will call the Soroban-RPC
   *    `getNetwork` method to attempt to find this network's friendbot url.
   *
   * @returns {Promise<Account>} Returns a promise to the {@link Account} object
   *    with populated sequence number.
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
      const response = await AxiosClient.post<Friendbot.Response>(
        `${friendbotUrl}?addr=${encodeURIComponent(account)}`,
      );
      const meta = xdr.TransactionMeta.fromXDR(
        response.data.result_meta_xdr,
        "base64",
      );
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
}

function findCreatedAccountSequenceInTransactionMeta(
  meta: xdr.TransactionMeta,
): string {
  let operations: xdr.OperationMeta[] = [];
  switch (meta.switch()) {
    case 0:
      operations = meta.operations();
      break;
    case 1:
      operations = meta.v1().operations();
      break;
    case 2:
      operations = meta.v2().operations();
      break;
    case 3:
      operations = meta.v3().operations();
      break;
    default:
      throw new Error("Unexpected transaction meta switch value");
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
  throw new Error("No account created in transaction");
}

export namespace Server {
  export interface Options {
    allowHttp?: boolean;
    timeout?: number;
    appName?: string;
    appVersion?: string;
  }
}
