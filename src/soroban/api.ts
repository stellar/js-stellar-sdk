import { AssetType, Contract, SorobanDataBuilder, xdr } from 'stellar-base';

// TODO: Better parsing for hashes

/* tslint:disable-next-line:no-namespace */
/** @namespace Api */
export namespace Api {
  export interface Balance {
    asset_type: AssetType.credit4 | AssetType.credit12;
    asset_code: string;
    asset_issuer: string;
    classic: string;
    smart: string;
  }

  export interface Cost {
    cpuInsns: string;
    memBytes: string;
  }

  export interface GetHealthResponse {
    status: 'healthy';
  }

  export interface LedgerEntryResult {
    lastModifiedLedgerSeq?: number;
    key: xdr.LedgerKey;
    val: xdr.LedgerEntryData;
    expirationLedgerSeq?: number;
  }

  export interface RawLedgerEntryResult {
    lastModifiedLedgerSeq?: number;
    /** a base-64 encoded {@link xdr.LedgerKey} instance */
    key: string;
    /** a base-64 encoded {@link xdr.LedgerEntryData} instance */
    xdr: string;
    /** optional, a future ledger number upon which this entry will expire
     *  based on https://github.com/stellar/soroban-tools/issues/1010
     */
    expirationLedgerSeq?: number;
  }

  /** An XDR-parsed version of {@link RawLedgerEntryResult} */
  export interface GetLedgerEntriesResponse {
    entries: LedgerEntryResult[];
    latestLedger: number;
  }

  /** @see https://soroban.stellar.org/api/methods/getLedgerEntries */
  export interface RawGetLedgerEntriesResponse {
    entries?: RawLedgerEntryResult[];
    latestLedger: number;
  }

  /* Response for jsonrpc method `getNetwork`
   */
  export interface GetNetworkResponse {
    friendbotUrl?: string;
    passphrase: string;
    protocolVersion: string;
  }

  /* Response for jsonrpc method `getLatestLedger`
   */
  export interface GetLatestLedgerResponse {
    id: string;
    sequence: number;
    protocolVersion: string;
  }

  export enum GetTransactionStatus {
    SUCCESS = 'SUCCESS',
    NOT_FOUND = 'NOT_FOUND',
    FAILED = 'FAILED'
  }

  export type GetTransactionResponse =
    | GetSuccessfulTransactionResponse
    | GetFailedTransactionResponse
    | GetMissingTransactionResponse;

  interface GetAnyTransactionResponse {
    status: GetTransactionStatus;
    latestLedger: string;
    latestLedgerCloseTime: number;
    oldestLedger: string;
    oldestLedgerCloseTime: number;
  }

  export interface GetMissingTransactionResponse
    extends GetAnyTransactionResponse {
    status: GetTransactionStatus.NOT_FOUND;
  }

  export interface GetFailedTransactionResponse
    extends GetAnyTransactionResponse {
    status: GetTransactionStatus.FAILED;

    ledger: number;
    createdAt: number;
    applicationOrder: number;
    feeBump: boolean;
    envelopeXdr: xdr.TransactionEnvelope;
    resultXdr: xdr.TransactionResult;
    resultMetaXdr: xdr.TransactionMeta;
  }

  export interface GetSuccessfulTransactionResponse
    extends GetAnyTransactionResponse {
    status: GetTransactionStatus.SUCCESS;

    ledger: number;
    createdAt: number;
    applicationOrder: number;
    feeBump: boolean;
    envelopeXdr: xdr.TransactionEnvelope;
    resultXdr: xdr.TransactionResult;
    resultMetaXdr: xdr.TransactionMeta;

    returnValue?: xdr.ScVal; // present iff resultMeta is a v3
  }

  export interface RawGetTransactionResponse {
    status: GetTransactionStatus;
    latestLedger: string;
    latestLedgerCloseTime: number;
    oldestLedger: string;
    oldestLedgerCloseTime: number;

    // the fields below are set if status is SUCCESS
    applicationOrder?: number;
    feeBump?: boolean;
    envelopeXdr?: string;
    resultXdr?: string;
    resultMetaXdr?: string;
    ledger?: number;
    createdAt?: number;
  }

  export type EventType = 'contract' | 'system' | 'diagnostic';

  export interface EventFilter {
    type?: EventType;
    contractIds?: string[];
    topics?: string[][];
  }

  export interface GetEventsResponse {
    latestLedger: string;
    events: EventResponse[];
  }

  interface EventResponse extends BaseEventResponse {
    contractId?: Contract;
    topic: xdr.ScVal[];
    value: xdr.ScVal;
  }

  export interface RawGetEventsResponse {
    latestLedger: string;
    events: RawEventResponse[];
  }

  interface BaseEventResponse {
    id: string;
    type: EventType;
    ledger: string;
    ledgerClosedAt: string;
    pagingToken: string;
    inSuccessfulContractCall: boolean;
  }

  export interface RawEventResponse extends BaseEventResponse {
    contractId: string;
    topic: string[];
    value: {
      xdr: string;
    };
  }

  export interface RequestAirdropResponse {
    transaction_id: string;
  }

  export type SendTransactionStatus =
    | 'PENDING'
    | 'DUPLICATE'
    | 'TRY_AGAIN_LATER'
    | 'ERROR';

  export interface SendTransactionResponse extends BaseSendTransactionResponse {
    errorResult?: xdr.TransactionResult;
  }

  export interface RawSendTransactionResponse
    extends BaseSendTransactionResponse {
    /**
     * This is a base64-encoded instance of {@link xdr.TransactionResult}, set
     * only when `status` is `"ERROR"`.
     *
     * It contains details on why the network rejected the transaction.
     */
    errorResultXdr?: string;
  }

  export interface BaseSendTransactionResponse {
    status: SendTransactionStatus;
    hash: string;
    latestLedger: number;
    latestLedgerCloseTime: number;
  }

  export interface SimulateHostFunctionResult {
    auth: xdr.SorobanAuthorizationEntry[];
    retval: xdr.ScVal;
  }

  /**
   * Simplifies {@link RawSimulateTransactionResponse} into separate interfaces
   * based on status:
   *   - on success, this includes all fields, though `result` is only present
   *     if an invocation was simulated (since otherwise there's nothing to
   *     "resultify")
   *   - if there was an expiration error, this includes error and restoration
   *     fields
   *   - for all other errors, this only includes error fields
   *
   * @see https://soroban.stellar.org/api/methods/simulateTransaction#returns
   */
  export type SimulateTransactionResponse =
    | SimulateTransactionSuccessResponse
    | SimulateTransactionRestoreResponse
    | SimulateTransactionErrorResponse;

  export interface BaseSimulateTransactionResponse {
    /** always present: the JSON-RPC request ID */
    id: string;

    /** always present: the LCL known to the server when responding */
    latestLedger: string;

    /**
     * The field is always present, but may be empty in cases where:
     *   - you didn't simulate an invocation or
     *   - there were no events
     * @see {@link humanizeEvents}
     */
    events: xdr.DiagnosticEvent[];

    /** a private field to mark the schema as parsed */
    _parsed: boolean;
  }

  /** Includes simplified fields only present on success. */
  export interface SimulateTransactionSuccessResponse
    extends BaseSimulateTransactionResponse {
    transactionData: SorobanDataBuilder;
    minResourceFee: string;
    cost: Cost;

    /** present only for invocation simulation */
    result?: SimulateHostFunctionResult;
  }

  /** Includes details about why the simulation failed */
  export interface SimulateTransactionErrorResponse
    extends BaseSimulateTransactionResponse {
    error: string;
    events: xdr.DiagnosticEvent[];
  }

  export interface SimulateTransactionRestoreResponse
    extends SimulateTransactionSuccessResponse {
    result: SimulateHostFunctionResult; // not optional now

    /**
     * Indicates that a restoration is necessary prior to submission.
     *
     * In other words, seeing a restoration preamble means that your invocation
     * was executed AS IF the required ledger entries were present, and this
     * field includes information about what you need to restore for the
     * simulation to succeed.
     */
    restorePreamble: {
      minResourceFee: string;
      transactionData: SorobanDataBuilder;
    };
  }

  export function isSimulationError(
    sim: SimulateTransactionResponse
  ): sim is SimulateTransactionErrorResponse {
    return 'error' in sim;
  }

  export function isSimulationSuccess(
    sim: SimulateTransactionResponse
  ): sim is SimulateTransactionSuccessResponse {
    return 'transactionData' in sim;
  }

  export function isSimulationRestore(
    sim: SimulateTransactionResponse
  ): sim is SimulateTransactionRestoreResponse {
    return (
      isSimulationSuccess(sim) &&
      'restorePreamble' in sim &&
      !!sim.restorePreamble.transactionData
    );
  }

  export function isSimulationRaw(
    sim:
      | Api.SimulateTransactionResponse
      | Api.RawSimulateTransactionResponse
  ): sim is Api.RawSimulateTransactionResponse {
    return !(sim as Api.SimulateTransactionResponse)._parsed;
  }

  interface RawSimulateHostFunctionResult {
    // each string is SorobanAuthorizationEntry XDR in base64
    auth?: string[];
    // invocation return value: the ScVal in base64
    xdr: string;
  }

  /** @see https://soroban.stellar.org/api/methods/simulateTransaction#returns */
  export interface RawSimulateTransactionResponse {
    id: string;
    latestLedger: string;
    error?: string;
    // this is an xdr.SorobanTransactionData in base64
    transactionData?: string;
    // these are xdr.DiagnosticEvents in base64
    events?: string[];
    minResourceFee?: string;
    // This will only contain a single element if present, because only a single
    // invokeHostFunctionOperation is supported per transaction.
    results?: RawSimulateHostFunctionResult[];
    cost?: Cost;
    // present if succeeded but has expired ledger entries
    restorePreamble?: {
      minResourceFee: string;
      transactionData: string;
    };
  }
}
