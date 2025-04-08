import { Contract, SorobanDataBuilder, xdr } from '@stellar/stellar-base';

/* tslint:disable-next-line:no-namespace */
export namespace Api {
  export interface GetHealthResponse {
    status: 'healthy';
  }

  export interface LedgerEntryResult {
    lastModifiedLedgerSeq?: number;
    key: xdr.LedgerKey;
    val: xdr.LedgerEntryData;
    liveUntilLedgerSeq?: number;
  }

  export interface RawLedgerEntryResult {
    lastModifiedLedgerSeq?: number;
    /** a base-64 encoded {@link xdr.LedgerKey} instance */
    key: string;
    /** a base-64 encoded {@link xdr.LedgerEntryData} instance */
    xdr: string;
    /**
     * optional, a future ledger number upon which this entry will expire
     *  based on https://github.com/stellar/soroban-tools/issues/1010
     */
    liveUntilLedgerSeq?: number;
  }

  /** An XDR-parsed version of {@link this.RawLedgerEntryResult} */
  export interface GetLedgerEntriesResponse {
    entries: LedgerEntryResult[];
    latestLedger: number;
  }

  /** @see https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries */
  export interface RawGetLedgerEntriesResponse {
    entries?: RawLedgerEntryResult[];
    latestLedger: number;
  }

  /** @see https://developers.stellar.org/docs/data/rpc/api-reference/methods/getNetwork */
  export interface GetNetworkResponse {
    friendbotUrl?: string;
    passphrase: string;
    protocolVersion: string;
  }

  /** @see https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLatestLedger */
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

  /** @see https://developers.stellar.org/docs/data/rpc/api-reference/methods/getTransaction */
  export type GetTransactionResponse =
    | GetSuccessfulTransactionResponse
    | GetFailedTransactionResponse
    | GetMissingTransactionResponse;

  interface GetAnyTransactionResponse {
    status: GetTransactionStatus;
    txHash: string;
    latestLedger: number;
    latestLedgerCloseTime: number;
    oldestLedger: number;
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
    diagnosticEventsXdr?: xdr.DiagnosticEvent[];
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
    diagnosticEventsXdr?: xdr.DiagnosticEvent[];

    returnValue?: xdr.ScVal; // present iff resultMeta is a v3
  }

  export interface RawGetTransactionResponse {
    status: GetTransactionStatus;
    latestLedger: number;
    latestLedgerCloseTime: number;
    oldestLedger: number;
    oldestLedgerCloseTime: number;
    txHash: string;

    // the fields below are set if status is SUCCESS
    applicationOrder?: number;
    feeBump?: boolean;
    ledger?: number;
    createdAt?: number;

    envelopeXdr?: string;
    resultXdr?: string;
    resultMetaXdr?: string;
    diagnosticEventsXdr?: string[];
  }

  export interface GetTransactionsRequest {
    startLedger: number;
    cursor?: string;
    limit?: number;
  }

  export interface RawTransactionInfo {
    status: GetTransactionStatus;
    ledger: number;
    createdAt: number;
    applicationOrder: number;
    feeBump: boolean;
    txHash: string;

    envelopeXdr?: string;
    resultXdr?: string;
    resultMetaXdr?: string;
    diagnosticEventsXdr?: string[];
  }

  export interface TransactionInfo {
    status: GetTransactionStatus;
    ledger: number;
    createdAt: number;
    applicationOrder: number;
    feeBump: boolean;
    txHash: string;

    envelopeXdr: xdr.TransactionEnvelope;
    resultXdr: xdr.TransactionResult;
    resultMetaXdr: xdr.TransactionMeta;
    returnValue?: xdr.ScVal;
    diagnosticEventsXdr?: xdr.DiagnosticEvent[];
  }

  export interface GetTransactionsResponse {
    transactions: TransactionInfo[];
    latestLedger: number;
    latestLedgerCloseTimestamp: number;
    oldestLedger: number;
    oldestLedgerCloseTimestamp: number;
    cursor: string;
  }

  export interface RawGetTransactionsResponse {
    transactions: RawTransactionInfo[] | null;
    latestLedger: number;
    latestLedgerCloseTimestamp: number;
    oldestLedger: number;
    oldestLedgerCloseTimestamp: number;
    cursor: string;
  }

  export type EventType = 'contract' | 'system' | 'diagnostic';

  export interface EventFilter {
    type?: EventType;
    contractIds?: string[];
    topics?: string[][];
  }

  export interface GetEventsResponse {
    latestLedger: number;
    events: EventResponse[];
    cursor: string;
  }

  export interface EventResponse extends BaseEventResponse {
    contractId?: Contract;
    topic: xdr.ScVal[];
    value: xdr.ScVal;
  }

  export interface RawGetEventsResponse {
    latestLedger: number;
    events: RawEventResponse[];
    cursor: string;
  }

  interface BaseEventResponse {
    id: string;
    type: EventType;
    ledger: number;
    ledgerClosedAt: string;
    pagingToken: string;
    inSuccessfulContractCall: boolean;
    txHash: string;
  }

  export interface RawEventResponse extends BaseEventResponse {
    contractId: string;
    topic: string[];
    value: string;
  }

  interface RawLedgerEntryChange {
    type: number;
    /** This is LedgerKey in base64 */
    key: string;
    /** This is xdr.LedgerEntry in base64 */
    before: string | null;
    /** This is xdr.LedgerEntry in base64 */
    after: string | null;
  }

  export interface LedgerEntryChange {
    type: number;
    key: xdr.LedgerKey;
    before: xdr.LedgerEntry | null;
    after: xdr.LedgerEntry | null;
  }

  export type SendTransactionStatus =
    | 'PENDING'
    | 'DUPLICATE'
    | 'TRY_AGAIN_LATER'
    | 'ERROR';

  export interface SendTransactionResponse extends BaseSendTransactionResponse {
    errorResult?: xdr.TransactionResult;
    diagnosticEvents?: xdr.DiagnosticEvent[];
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
    /**
     * This is a base64-encoded instance of an array of
     * {@link xdr.DiagnosticEvent}s, set only when `status` is `"ERROR"` and
     * diagnostic events are enabled on the server.
     */
    diagnosticEventsXdr?: string[];
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
   * Simplifies {@link Api.RawSimulateTransactionResponse} into separate interfaces
   * based on status:
   *   - on success, this includes all fields, though `result` is only present
   *     if an invocation was simulated (since otherwise there's nothing to
   *     "resultify")
   *   - if there was an expiration error, this includes error and restoration
   *     fields
   *   - for all other errors, this only includes error fields
   *
   * @see https://developers.stellar.org/docs/data/rpc/api-reference/methods/simulateTransaction
   */
  export type SimulateTransactionResponse =
    | SimulateTransactionSuccessResponse
    | SimulateTransactionRestoreResponse
    | SimulateTransactionErrorResponse;

  export interface BaseSimulateTransactionResponse {
    /** always present: the JSON-RPC request ID */
    id: string;

    /** always present: the LCL known to the server when responding */
    latestLedger: number;

    /**
     * The field is always present, but may be empty in cases where:
     *   - you didn't simulate an invocation or
     *   - there were no events
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

    /** present only for invocation simulation */
    result?: SimulateHostFunctionResult;

    /** State Difference information */
    stateChanges?: LedgerEntryChange[];
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

  /** @see https://developers.stellar.org/docs/data/rpc/api-reference/methods/simulateTransaction */
  export interface RawSimulateTransactionResponse {
    id: string;
    latestLedger: number;
    error?: string;
    /** This is an xdr.SorobanTransactionData in base64 */
    transactionData?: string;
    /** These are xdr.DiagnosticEvents in base64 */
    events?: string[];
    minResourceFee?: string;
    /**
     * This will only contain a single element if present, because only a single
     * invokeHostFunctionOperation is supported per transaction.
     * */
    results?: RawSimulateHostFunctionResult[];
    /** Present if succeeded but has expired ledger entries */
    restorePreamble?: {
      minResourceFee: string;
      transactionData: string;
    };

    /** State difference information */
    stateChanges?: RawLedgerEntryChange[];
  }

  export interface GetVersionInfoResponse {
    version: string;
    commitHash: string;
    buildTimestamp: string;
    captiveCoreVersion: string;
    protocolVersion: number; // uint32

    /// @deprecated
    commit_hash: string;
    /// @deprecated
    build_timestamp: string;
    /// @deprecated
    captive_core_version: string;
    /// @deprecated
    protocol_version: number; // uint32
  }

  export interface GetFeeStatsResponse {
    sorobanInclusionFee: FeeDistribution;
    inclusionFee: FeeDistribution;
    latestLedger: number; // uint32
  }

  interface FeeDistribution {
    max: string;    // uint64
    min: string;    // uint64
    mode: string;   // uint64
    p10: string;    // uint64
    p20: string;    // uint64
    p30: string;    // uint64
    p40: string;    // uint64
    p50: string;    // uint64
    p60: string;    // uint64
    p70: string;    // uint64
    p80: string;    // uint64
    p90: string;    // uint64
    p95: string;    // uint64
    p99: string;    // uint64

    transactionCount: string; // uint32
    ledgerCount: number; // uint32
  }

  export interface BalanceResponse {
    latestLedger: number;
    /** present only on success, otherwise request malformed or no balance */
    balanceEntry?: {
      /** a 64-bit integer */
      amount: string;
      authorized: boolean;
      clawback: boolean;

      lastModifiedLedgerSeq?: number;
      liveUntilLedgerSeq?: number;
    };
  }
}
