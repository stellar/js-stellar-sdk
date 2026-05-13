---
title: Network / RPC
description: Client for Soroban RPC — simulate, send, and poll Soroban smart-contract transactions.
---

# Network / RPC

## rpc.Api.BalanceResponse

```ts
interface BalanceResponse {
  balanceEntry?: { amount: string; authorized: boolean; authorizedToMaintainLiabilities?: boolean; clawback: boolean; lastModifiedLedgerSeq?: number; liveUntilLedgerSeq?: number; revocable?: boolean };
  latestLedger: number;
}
```

**Source:** [src/rpc/api.ts:586](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L586)

### `balanceResponse.balanceEntry`

present only on success, otherwise request malformed or no balance

```ts
balanceEntry?: { amount: string; authorized: boolean; authorizedToMaintainLiabilities?: boolean; clawback: boolean; lastModifiedLedgerSeq?: number; liveUntilLedgerSeq?: number; revocable?: boolean };
```

**Source:** [src/rpc/api.ts:589](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L589)

### `balanceResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:587](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L587)

## rpc.Api.BaseSendTransactionResponse

```ts
interface BaseSendTransactionResponse {
  hash: string;
  latestLedger: number;
  latestLedgerCloseTime: number;
  status: SendTransactionStatus;
}
```

**Source:** [src/rpc/api.ts:376](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L376)

### `baseSendTransactionResponse.hash`

```ts
hash: string;
```

**Source:** [src/rpc/api.ts:378](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L378)

### `baseSendTransactionResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:379](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L379)

### `baseSendTransactionResponse.latestLedgerCloseTime`

```ts
latestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:380](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L380)

### `baseSendTransactionResponse.status`

```ts
status: SendTransactionStatus;
```

**Source:** [src/rpc/api.ts:377](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L377)

## rpc.Api.BaseSimulateTransactionResponse

```ts
interface BaseSimulateTransactionResponse {
  _parsed: boolean;
  events: DiagnosticEvent[];
  id: string;
  latestLedger: number;
}
```

**Source:** [src/rpc/api.ts:410](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L410)

### `baseSimulateTransactionResponse._parsed`

a private field to mark the schema as parsed

```ts
_parsed: boolean;
```

**Source:** [src/rpc/api.ts:425](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L425)

### `baseSimulateTransactionResponse.events`

The field is always present, but may be empty in cases where:
  - you didn't simulate an invocation or
  - there were no events

```ts
events: DiagnosticEvent[];
```

**Source:** [src/rpc/api.ts:422](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L422)

### `baseSimulateTransactionResponse.id`

always present: the JSON-RPC request ID

```ts
id: string;
```

**Source:** [src/rpc/api.ts:412](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L412)

### `baseSimulateTransactionResponse.latestLedger`

always present: the LCL known to the server when responding

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:415](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L415)

## rpc.Api.EventFilter

```ts
interface EventFilter {
  contractIds?: string[];
  topics?: string[][];
  type?: EventType;
}
```

**Source:** [src/rpc/api.ts:228](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L228)

### `eventFilter.contractIds`

```ts
contractIds?: string[];
```

**Source:** [src/rpc/api.ts:230](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L230)

### `eventFilter.topics`

```ts
topics?: string[][];
```

**Source:** [src/rpc/api.ts:231](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L231)

### `eventFilter.type`

```ts
type?: EventType;
```

**Source:** [src/rpc/api.ts:229](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L229)

## rpc.Api.EventResponse

```ts
interface EventResponse extends BaseEventResponse {
  contractId?: Contract;
  id: string;
  inSuccessfulContractCall: boolean;
  ledger: number;
  ledgerClosedAt: string;
  operationIndex: number;
  topic: ScVal[];
  transactionIndex: number;
  txHash: string;
  type: EventType;
  value: ScVal;
}
```

**Source:** [src/rpc/api.ts:304](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L304)

### `eventResponse.contractId`

```ts
contractId?: Contract;
```

**Source:** [src/rpc/api.ts:305](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L305)

### `eventResponse.id`

```ts
id: string;
```

**Source:** [src/rpc/api.ts:316](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L316)

### `eventResponse.inSuccessfulContractCall`

```ts
inSuccessfulContractCall: boolean;
```

**Source:** [src/rpc/api.ts:322](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L322)

### `eventResponse.ledger`

```ts
ledger: number;
```

**Source:** [src/rpc/api.ts:318](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L318)

### `eventResponse.ledgerClosedAt`

```ts
ledgerClosedAt: string;
```

**Source:** [src/rpc/api.ts:319](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L319)

### `eventResponse.operationIndex`

```ts
operationIndex: number;
```

**Source:** [src/rpc/api.ts:321](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L321)

### `eventResponse.topic`

```ts
topic: ScVal[];
```

**Source:** [src/rpc/api.ts:306](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L306)

### `eventResponse.transactionIndex`

```ts
transactionIndex: number;
```

**Source:** [src/rpc/api.ts:320](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L320)

### `eventResponse.txHash`

```ts
txHash: string;
```

**Source:** [src/rpc/api.ts:323](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L323)

### `eventResponse.type`

```ts
type: EventType;
```

**Source:** [src/rpc/api.ts:317](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L317)

### `eventResponse.value`

```ts
value: ScVal;
```

**Source:** [src/rpc/api.ts:307](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L307)

## rpc.Api.EventType

```ts
type EventType = "contract" | "system"
```

**Source:** [src/rpc/api.ts:226](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L226)

## rpc.Api.GetEventsRequest

Request parameters for fetching events from the Stellar network.

**Important**: This type enforces mutually exclusive pagination modes:
- **Ledger range mode**: Use `startLedger` and `endLedger` (cursor must be omitted)
- **Cursor pagination mode**: Use `cursor` (startLedger and endLedger must be omitted)

```ts
type GetEventsRequest = { cursor?: never; endLedger?: number; filters: Api.EventFilter[]; limit?: number; startLedger: number } | { cursor: string; endLedger?: never; filters: Api.EventFilter[]; limit?: number; startLedger?: never }
```

**Example**

```ts
// ✅ Correct: Ledger range mode
const rangeRequest: GetEventsRequest = {
  filters: [],
  startLedger: 1000,
  endLedger: 2000,
  limit: 100
};
```

**Example**

```ts
// ✅ Correct: Cursor pagination mode
const cursorRequest: GetEventsRequest = {
  filters: [],
  cursor: "some-cursor-value",
  limit: 100
};
```

**Example**

```ts
// ❌ Invalid: Cannot mix cursor with ledger range
const invalidRequest = {
  filters: [],
  startLedger: 1000,  // ❌ Cannot use with cursor
  endLedger: 2000,    // ❌ Cannot use with cursor
  cursor: "cursor",   // ❌ Cannot use with ledger range
  limit: 100
};
```

**See also**

- `getEvents API reference`

**Source:** [src/rpc/api.ts:283](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L283)

## rpc.Api.GetEventsResponse

```ts
interface GetEventsResponse extends RetentionState {
  cursor: string;
  events: EventResponse[];
  latestLedger: number;
  latestLedgerCloseTime: string;
  oldestLedger: number;
  oldestLedgerCloseTime: string;
}
```

**Source:** [src/rpc/api.ts:299](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L299)

### `getEventsResponse.cursor`

```ts
cursor: string;
```

**Source:** [src/rpc/api.ts:301](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L301)

### `getEventsResponse.events`

```ts
events: EventResponse[];
```

**Source:** [src/rpc/api.ts:300](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L300)

### `getEventsResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:235](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L235)

### `getEventsResponse.latestLedgerCloseTime`

```ts
latestLedgerCloseTime: string;
```

**Source:** [src/rpc/api.ts:237](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L237)

### `getEventsResponse.oldestLedger`

```ts
oldestLedger: number;
```

**Source:** [src/rpc/api.ts:236](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L236)

### `getEventsResponse.oldestLedgerCloseTime`

```ts
oldestLedgerCloseTime: string;
```

**Source:** [src/rpc/api.ts:238](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L238)

## rpc.Api.GetFailedTransactionResponse

```ts
interface GetFailedTransactionResponse extends GetAnyTransactionResponse {
  applicationOrder: number;
  createdAt: number;
  diagnosticEventsXdr?: DiagnosticEvent[];
  envelopeXdr: TransactionEnvelope;
  events: TransactionEvents;
  feeBump: boolean;
  latestLedger: number;
  latestLedgerCloseTime: number;
  ledger: number;
  oldestLedger: number;
  oldestLedgerCloseTime: number;
  resultMetaXdr: TransactionMeta;
  resultXdr: TransactionResult;
  status: FAILED;
  txHash: string;
}
```

**Source:** [src/rpc/api.ts:97](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L97)

### `getFailedTransactionResponse.applicationOrder`

```ts
applicationOrder: number;
```

**Source:** [src/rpc/api.ts:102](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L102)

### `getFailedTransactionResponse.createdAt`

```ts
createdAt: number;
```

**Source:** [src/rpc/api.ts:101](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L101)

### `getFailedTransactionResponse.diagnosticEventsXdr`

```ts
diagnosticEventsXdr?: DiagnosticEvent[];
```

**Source:** [src/rpc/api.ts:107](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L107)

### `getFailedTransactionResponse.envelopeXdr`

```ts
envelopeXdr: TransactionEnvelope;
```

**Source:** [src/rpc/api.ts:104](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L104)

### `getFailedTransactionResponse.events`

```ts
events: TransactionEvents;
```

**Source:** [src/rpc/api.ts:108](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L108)

### `getFailedTransactionResponse.feeBump`

```ts
feeBump: boolean;
```

**Source:** [src/rpc/api.ts:103](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L103)

### `getFailedTransactionResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:87](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L87)

### `getFailedTransactionResponse.latestLedgerCloseTime`

```ts
latestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:88](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L88)

### `getFailedTransactionResponse.ledger`

```ts
ledger: number;
```

**Source:** [src/rpc/api.ts:100](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L100)

### `getFailedTransactionResponse.oldestLedger`

```ts
oldestLedger: number;
```

**Source:** [src/rpc/api.ts:89](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L89)

### `getFailedTransactionResponse.oldestLedgerCloseTime`

```ts
oldestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:90](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L90)

### `getFailedTransactionResponse.resultMetaXdr`

```ts
resultMetaXdr: TransactionMeta;
```

**Source:** [src/rpc/api.ts:106](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L106)

### `getFailedTransactionResponse.resultXdr`

```ts
resultXdr: TransactionResult;
```

**Source:** [src/rpc/api.ts:105](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L105)

### `getFailedTransactionResponse.status`

```ts
status: FAILED;
```

**Source:** [src/rpc/api.ts:98](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L98)

### `getFailedTransactionResponse.txHash`

```ts
txHash: string;
```

**Source:** [src/rpc/api.ts:86](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L86)

## rpc.Api.GetFeeStatsResponse

```ts
interface GetFeeStatsResponse {
  inclusionFee: FeeDistribution;
  latestLedger: number;
  sorobanInclusionFee: FeeDistribution;
}
```

**Source:** [src/rpc/api.ts:560](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L560)

### `getFeeStatsResponse.inclusionFee`

```ts
inclusionFee: FeeDistribution;
```

**Source:** [src/rpc/api.ts:562](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L562)

### `getFeeStatsResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:563](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L563)

### `getFeeStatsResponse.sorobanInclusionFee`

```ts
sorobanInclusionFee: FeeDistribution;
```

**Source:** [src/rpc/api.ts:561](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L561)

## rpc.Api.GetHealthResponse

```ts
interface GetHealthResponse {
  latestLedger: number;
  ledgerRetentionWindow: number;
  oldestLedger: number;
  status: "healthy";
}
```

**Source:** [src/rpc/api.ts:5](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L5)

### `getHealthResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:6](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L6)

### `getHealthResponse.ledgerRetentionWindow`

```ts
ledgerRetentionWindow: number;
```

**Source:** [src/rpc/api.ts:7](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L7)

### `getHealthResponse.oldestLedger`

```ts
oldestLedger: number;
```

**Source:** [src/rpc/api.ts:8](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L8)

### `getHealthResponse.status`

```ts
status: "healthy";
```

**Source:** [src/rpc/api.ts:9](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L9)

## rpc.Api.GetLatestLedgerResponse

```ts
interface GetLatestLedgerResponse {
  closeTime: string;
  headerXdr: LedgerHeader;
  id: string;
  metadataXdr: LedgerCloseMeta;
  protocolVersion: string;
  sequence: number;
}
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLatestLedger

**Source:** [src/rpc/api.ts:52](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L52)

### `getLatestLedgerResponse.closeTime`

```ts
closeTime: string;
```

**Source:** [src/rpc/api.ts:56](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L56)

### `getLatestLedgerResponse.headerXdr`

```ts
headerXdr: LedgerHeader;
```

**Source:** [src/rpc/api.ts:57](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L57)

### `getLatestLedgerResponse.id`

```ts
id: string;
```

**Source:** [src/rpc/api.ts:53](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L53)

### `getLatestLedgerResponse.metadataXdr`

```ts
metadataXdr: LedgerCloseMeta;
```

**Source:** [src/rpc/api.ts:58](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L58)

### `getLatestLedgerResponse.protocolVersion`

```ts
protocolVersion: string;
```

**Source:** [src/rpc/api.ts:55](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L55)

### `getLatestLedgerResponse.sequence`

```ts
sequence: number;
```

**Source:** [src/rpc/api.ts:54](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L54)

## rpc.Api.GetLedgerEntriesResponse

An XDR-parsed version of `RawLedgerEntryResult`

```ts
interface GetLedgerEntriesResponse {
  entries: LedgerEntryResult[];
  latestLedger: number;
}
```

**Source:** [src/rpc/api.ts:33](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L33)

### `getLedgerEntriesResponse.entries`

```ts
entries: LedgerEntryResult[];
```

**Source:** [src/rpc/api.ts:34](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L34)

### `getLedgerEntriesResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:35](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L35)

## rpc.Api.GetLedgersRequest

Request parameters for fetching a sequential list of ledgers.

This type supports two distinct pagination modes that are mutually exclusive:
- **Ledger-based pagination**: Use `startLedger` to begin fetching from a specific ledger sequence
- **Cursor-based pagination**: Use `cursor` to continue from a previous response's pagination token

```ts
type GetLedgersRequest = { pagination?: { cursor?: never; limit?: number }; startLedger: number } | { pagination: { cursor: string; limit?: number }; startLedger?: never }
```

**Example**

```ts
// Ledger-based pagination - start from specific ledger
const ledgerRequest: GetLedgersRequest = {
  startLedger: 36233,
  pagination: {
    limit: 10
  }
};
```

**Example**

```ts
// Cursor-based pagination - continue from previous response
const cursorRequest: GetLedgersRequest = {
  pagination: {
    cursor: "36234",
    limit: 5
  }
};
```

**See also**

- `getLedgers API reference`

**Source:** [src/rpc/api.ts:633](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L633)

## rpc.Api.GetLedgersResponse

```ts
interface GetLedgersResponse {
  cursor: string;
  latestLedger: number;
  latestLedgerCloseTime: number;
  ledgers: LedgerResponse[];
  oldestLedger: number;
  oldestLedgerCloseTime: number;
}
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgers

**Source:** [src/rpc/api.ts:669](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L669)

### `getLedgersResponse.cursor`

```ts
cursor: string;
```

**Source:** [src/rpc/api.ts:675](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L675)

### `getLedgersResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:671](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L671)

### `getLedgersResponse.latestLedgerCloseTime`

```ts
latestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:672](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L672)

### `getLedgersResponse.ledgers`

```ts
ledgers: LedgerResponse[];
```

**Source:** [src/rpc/api.ts:670](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L670)

### `getLedgersResponse.oldestLedger`

```ts
oldestLedger: number;
```

**Source:** [src/rpc/api.ts:673](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L673)

### `getLedgersResponse.oldestLedgerCloseTime`

```ts
oldestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:674](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L674)

## rpc.Api.GetMissingTransactionResponse

```ts
interface GetMissingTransactionResponse extends GetAnyTransactionResponse {
  latestLedger: number;
  latestLedgerCloseTime: number;
  oldestLedger: number;
  oldestLedgerCloseTime: number;
  status: NOT_FOUND;
  txHash: string;
}
```

**Source:** [src/rpc/api.ts:93](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L93)

### `getMissingTransactionResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:87](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L87)

### `getMissingTransactionResponse.latestLedgerCloseTime`

```ts
latestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:88](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L88)

### `getMissingTransactionResponse.oldestLedger`

```ts
oldestLedger: number;
```

**Source:** [src/rpc/api.ts:89](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L89)

### `getMissingTransactionResponse.oldestLedgerCloseTime`

```ts
oldestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:90](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L90)

### `getMissingTransactionResponse.status`

```ts
status: NOT_FOUND;
```

**Source:** [src/rpc/api.ts:94](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L94)

### `getMissingTransactionResponse.txHash`

```ts
txHash: string;
```

**Source:** [src/rpc/api.ts:86](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L86)

## rpc.Api.GetNetworkResponse

```ts
interface GetNetworkResponse {
  friendbotUrl?: string;
  passphrase: string;
  protocolVersion: string;
}
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getNetwork

**Source:** [src/rpc/api.ts:45](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L45)

### `getNetworkResponse.friendbotUrl`

```ts
friendbotUrl?: string;
```

**Source:** [src/rpc/api.ts:46](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L46)

### `getNetworkResponse.passphrase`

```ts
passphrase: string;
```

**Source:** [src/rpc/api.ts:47](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L47)

### `getNetworkResponse.protocolVersion`

```ts
protocolVersion: string;
```

**Source:** [src/rpc/api.ts:48](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L48)

## rpc.Api.GetSuccessfulTransactionResponse

```ts
interface GetSuccessfulTransactionResponse extends GetAnyTransactionResponse {
  applicationOrder: number;
  createdAt: number;
  diagnosticEventsXdr?: DiagnosticEvent[];
  envelopeXdr: TransactionEnvelope;
  events: TransactionEvents;
  feeBump: boolean;
  latestLedger: number;
  latestLedgerCloseTime: number;
  ledger: number;
  oldestLedger: number;
  oldestLedgerCloseTime: number;
  resultMetaXdr: TransactionMeta;
  resultXdr: TransactionResult;
  returnValue?: ScVal;
  status: SUCCESS;
  txHash: string;
}
```

**Source:** [src/rpc/api.ts:111](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L111)

### `getSuccessfulTransactionResponse.applicationOrder`

```ts
applicationOrder: number;
```

**Source:** [src/rpc/api.ts:116](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L116)

### `getSuccessfulTransactionResponse.createdAt`

```ts
createdAt: number;
```

**Source:** [src/rpc/api.ts:115](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L115)

### `getSuccessfulTransactionResponse.diagnosticEventsXdr`

```ts
diagnosticEventsXdr?: DiagnosticEvent[];
```

**Source:** [src/rpc/api.ts:121](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L121)

### `getSuccessfulTransactionResponse.envelopeXdr`

```ts
envelopeXdr: TransactionEnvelope;
```

**Source:** [src/rpc/api.ts:118](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L118)

### `getSuccessfulTransactionResponse.events`

```ts
events: TransactionEvents;
```

**Source:** [src/rpc/api.ts:124](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L124)

### `getSuccessfulTransactionResponse.feeBump`

```ts
feeBump: boolean;
```

**Source:** [src/rpc/api.ts:117](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L117)

### `getSuccessfulTransactionResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:87](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L87)

### `getSuccessfulTransactionResponse.latestLedgerCloseTime`

```ts
latestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:88](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L88)

### `getSuccessfulTransactionResponse.ledger`

```ts
ledger: number;
```

**Source:** [src/rpc/api.ts:114](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L114)

### `getSuccessfulTransactionResponse.oldestLedger`

```ts
oldestLedger: number;
```

**Source:** [src/rpc/api.ts:89](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L89)

### `getSuccessfulTransactionResponse.oldestLedgerCloseTime`

```ts
oldestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:90](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L90)

### `getSuccessfulTransactionResponse.resultMetaXdr`

```ts
resultMetaXdr: TransactionMeta;
```

**Source:** [src/rpc/api.ts:120](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L120)

### `getSuccessfulTransactionResponse.resultXdr`

```ts
resultXdr: TransactionResult;
```

**Source:** [src/rpc/api.ts:119](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L119)

### `getSuccessfulTransactionResponse.returnValue`

```ts
returnValue?: ScVal;
```

**Source:** [src/rpc/api.ts:123](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L123)

### `getSuccessfulTransactionResponse.status`

```ts
status: SUCCESS;
```

**Source:** [src/rpc/api.ts:112](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L112)

### `getSuccessfulTransactionResponse.txHash`

```ts
txHash: string;
```

**Source:** [src/rpc/api.ts:86](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L86)

## rpc.Api.GetTransactionResponse

```ts
type GetTransactionResponse = GetSuccessfulTransactionResponse | GetFailedTransactionResponse | GetMissingTransactionResponse
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getTransaction

**Source:** [src/rpc/api.ts:79](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L79)

## rpc.Api.GetTransactionStatus

```ts
enum GetTransactionStatus
```

**Source:** [src/rpc/api.ts:72](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L72)

## rpc.Api.GetTransactionsRequest

```ts
type GetTransactionsRequest = { pagination?: { cursor?: never; limit?: number }; startLedger: number } | { pagination: { cursor: string; limit?: number }; startLedger?: never }
```

**Source:** [src/rpc/api.ts:149](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L149)

## rpc.Api.GetTransactionsResponse

```ts
interface GetTransactionsResponse {
  cursor: string;
  latestLedger: number;
  latestLedgerCloseTimestamp: number;
  oldestLedger: number;
  oldestLedgerCloseTimestamp: number;
  transactions: TransactionInfo[];
}
```

**Source:** [src/rpc/api.ts:208](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L208)

### `getTransactionsResponse.cursor`

```ts
cursor: string;
```

**Source:** [src/rpc/api.ts:214](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L214)

### `getTransactionsResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:210](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L210)

### `getTransactionsResponse.latestLedgerCloseTimestamp`

```ts
latestLedgerCloseTimestamp: number;
```

**Source:** [src/rpc/api.ts:211](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L211)

### `getTransactionsResponse.oldestLedger`

```ts
oldestLedger: number;
```

**Source:** [src/rpc/api.ts:212](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L212)

### `getTransactionsResponse.oldestLedgerCloseTimestamp`

```ts
oldestLedgerCloseTimestamp: number;
```

**Source:** [src/rpc/api.ts:213](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L213)

### `getTransactionsResponse.transactions`

```ts
transactions: TransactionInfo[];
```

**Source:** [src/rpc/api.ts:209](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L209)

## rpc.Api.GetVersionInfoResponse

```ts
interface GetVersionInfoResponse {
  build_timestamp: string;
  buildTimestamp: string;
  captive_core_version: string;
  captiveCoreVersion: string;
  commit_hash: string;
  commitHash: string;
  protocol_version: number;
  protocolVersion: number;
  version: string;
}
```

**Source:** [src/rpc/api.ts:543](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L543)

### `getVersionInfoResponse.build_timestamp`

```ts
build_timestamp: string;
```

**Source:** [src/rpc/api.ts:553](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L553)

### `getVersionInfoResponse.buildTimestamp`

```ts
buildTimestamp: string;
```

**Source:** [src/rpc/api.ts:546](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L546)

### `getVersionInfoResponse.captive_core_version`

```ts
captive_core_version: string;
```

**Source:** [src/rpc/api.ts:555](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L555)

### `getVersionInfoResponse.captiveCoreVersion`

```ts
captiveCoreVersion: string;
```

**Source:** [src/rpc/api.ts:547](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L547)

### `getVersionInfoResponse.commit_hash`

```ts
commit_hash: string;
```

**Source:** [src/rpc/api.ts:551](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L551)

### `getVersionInfoResponse.commitHash`

```ts
commitHash: string;
```

**Source:** [src/rpc/api.ts:545](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L545)

### `getVersionInfoResponse.protocol_version`

```ts
protocol_version: number;
```

**Source:** [src/rpc/api.ts:557](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L557)

### `getVersionInfoResponse.protocolVersion`

```ts
protocolVersion: number;
```

**Source:** [src/rpc/api.ts:548](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L548)

### `getVersionInfoResponse.version`

```ts
version: string;
```

**Source:** [src/rpc/api.ts:544](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L544)

## rpc.Api.LedgerEntryChange

```ts
interface LedgerEntryChange {
  after: LedgerEntry | null;
  before: LedgerEntry | null;
  key: LedgerKey;
  type: number;
}
```

**Source:** [src/rpc/api.ts:342](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L342)

### `ledgerEntryChange.after`

```ts
after: LedgerEntry | null;
```

**Source:** [src/rpc/api.ts:346](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L346)

### `ledgerEntryChange.before`

```ts
before: LedgerEntry | null;
```

**Source:** [src/rpc/api.ts:345](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L345)

### `ledgerEntryChange.key`

```ts
key: LedgerKey;
```

**Source:** [src/rpc/api.ts:344](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L344)

### `ledgerEntryChange.type`

```ts
type: number;
```

**Source:** [src/rpc/api.ts:343](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L343)

## rpc.Api.LedgerEntryResult

```ts
interface LedgerEntryResult {
  key: LedgerKey;
  lastModifiedLedgerSeq?: number;
  liveUntilLedgerSeq?: number;
  val: LedgerEntryData;
}
```

**Source:** [src/rpc/api.ts:12](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L12)

### `ledgerEntryResult.key`

```ts
key: LedgerKey;
```

**Source:** [src/rpc/api.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L14)

### `ledgerEntryResult.lastModifiedLedgerSeq`

```ts
lastModifiedLedgerSeq?: number;
```

**Source:** [src/rpc/api.ts:13](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L13)

### `ledgerEntryResult.liveUntilLedgerSeq`

```ts
liveUntilLedgerSeq?: number;
```

**Source:** [src/rpc/api.ts:16](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L16)

### `ledgerEntryResult.val`

```ts
val: LedgerEntryData;
```

**Source:** [src/rpc/api.ts:15](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L15)

## rpc.Api.LedgerResponse

```ts
interface LedgerResponse {
  hash: string;
  headerXdr: LedgerHeaderHistoryEntry;
  ledgerCloseTime: string;
  metadataXdr: LedgerCloseMeta;
  sequence: number;
}
```

**Source:** [src/rpc/api.ts:687](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L687)

### `ledgerResponse.hash`

```ts
hash: string;
```

**Source:** [src/rpc/api.ts:688](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L688)

### `ledgerResponse.headerXdr`

```ts
headerXdr: LedgerHeaderHistoryEntry;
```

**Source:** [src/rpc/api.ts:691](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L691)

### `ledgerResponse.ledgerCloseTime`

```ts
ledgerCloseTime: string;
```

**Source:** [src/rpc/api.ts:690](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L690)

### `ledgerResponse.metadataXdr`

```ts
metadataXdr: LedgerCloseMeta;
```

**Source:** [src/rpc/api.ts:692](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L692)

### `ledgerResponse.sequence`

```ts
sequence: number;
```

**Source:** [src/rpc/api.ts:689](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L689)

## rpc.Api.RawEventResponse

```ts
interface RawEventResponse extends BaseEventResponse {
  contractId: string;
  id: string;
  inSuccessfulContractCall: boolean;
  ledger: number;
  ledgerClosedAt: string;
  operationIndex: number;
  topic?: string[];
  transactionIndex: number;
  txHash: string;
  type: EventType;
  value: string;
}
```

**Source:** [src/rpc/api.ts:326](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L326)

### `rawEventResponse.contractId`

```ts
contractId: string;
```

**Source:** [src/rpc/api.ts:327](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L327)

### `rawEventResponse.id`

```ts
id: string;
```

**Source:** [src/rpc/api.ts:316](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L316)

### `rawEventResponse.inSuccessfulContractCall`

```ts
inSuccessfulContractCall: boolean;
```

**Source:** [src/rpc/api.ts:322](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L322)

### `rawEventResponse.ledger`

```ts
ledger: number;
```

**Source:** [src/rpc/api.ts:318](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L318)

### `rawEventResponse.ledgerClosedAt`

```ts
ledgerClosedAt: string;
```

**Source:** [src/rpc/api.ts:319](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L319)

### `rawEventResponse.operationIndex`

```ts
operationIndex: number;
```

**Source:** [src/rpc/api.ts:321](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L321)

### `rawEventResponse.topic`

```ts
topic?: string[];
```

**Source:** [src/rpc/api.ts:328](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L328)

### `rawEventResponse.transactionIndex`

```ts
transactionIndex: number;
```

**Source:** [src/rpc/api.ts:320](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L320)

### `rawEventResponse.txHash`

```ts
txHash: string;
```

**Source:** [src/rpc/api.ts:323](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L323)

### `rawEventResponse.type`

```ts
type: EventType;
```

**Source:** [src/rpc/api.ts:317](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L317)

### `rawEventResponse.value`

```ts
value: string;
```

**Source:** [src/rpc/api.ts:329](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L329)

## rpc.Api.RawGetEventsResponse

```ts
interface RawGetEventsResponse extends RetentionState {
  cursor: string;
  events: RawEventResponse[];
  latestLedger: number;
  latestLedgerCloseTime: string;
  oldestLedger: number;
  oldestLedgerCloseTime: string;
}
```

**Source:** [src/rpc/api.ts:310](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L310)

### `rawGetEventsResponse.cursor`

```ts
cursor: string;
```

**Source:** [src/rpc/api.ts:312](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L312)

### `rawGetEventsResponse.events`

```ts
events: RawEventResponse[];
```

**Source:** [src/rpc/api.ts:311](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L311)

### `rawGetEventsResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:235](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L235)

### `rawGetEventsResponse.latestLedgerCloseTime`

```ts
latestLedgerCloseTime: string;
```

**Source:** [src/rpc/api.ts:237](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L237)

### `rawGetEventsResponse.oldestLedger`

```ts
oldestLedger: number;
```

**Source:** [src/rpc/api.ts:236](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L236)

### `rawGetEventsResponse.oldestLedgerCloseTime`

```ts
oldestLedgerCloseTime: string;
```

**Source:** [src/rpc/api.ts:238](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L238)

## rpc.Api.RawGetLatestLedgerResponse

```ts
interface RawGetLatestLedgerResponse {
  closeTime: string;
  headerXdr: string;
  id: string;
  metadataXdr: string;
  protocolVersion: string;
  sequence: number;
}
```

**Source:** [src/rpc/api.ts:61](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L61)

### `rawGetLatestLedgerResponse.closeTime`

```ts
closeTime: string;
```

**Source:** [src/rpc/api.ts:65](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L65)

### `rawGetLatestLedgerResponse.headerXdr`

a base-64 encoded `xdr.LedgerHeader` instance

```ts
headerXdr: string;
```

**Source:** [src/rpc/api.ts:67](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L67)

### `rawGetLatestLedgerResponse.id`

```ts
id: string;
```

**Source:** [src/rpc/api.ts:62](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L62)

### `rawGetLatestLedgerResponse.metadataXdr`

a base-64 encoded `xdr.LedgerCloseMeta` instance

```ts
metadataXdr: string;
```

**Source:** [src/rpc/api.ts:69](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L69)

### `rawGetLatestLedgerResponse.protocolVersion`

```ts
protocolVersion: string;
```

**Source:** [src/rpc/api.ts:64](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L64)

### `rawGetLatestLedgerResponse.sequence`

```ts
sequence: number;
```

**Source:** [src/rpc/api.ts:63](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L63)

## rpc.Api.RawGetLedgerEntriesResponse

```ts
interface RawGetLedgerEntriesResponse {
  entries?: RawLedgerEntryResult[];
  latestLedger: number;
}
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries

**Source:** [src/rpc/api.ts:39](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L39)

### `rawGetLedgerEntriesResponse.entries`

```ts
entries?: RawLedgerEntryResult[];
```

**Source:** [src/rpc/api.ts:40](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L40)

### `rawGetLedgerEntriesResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:41](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L41)

## rpc.Api.RawGetLedgersResponse

```ts
interface RawGetLedgersResponse {
  cursor: string;
  latestLedger: number;
  latestLedgerCloseTime: number;
  ledgers: RawLedgerResponse[];
  oldestLedger: number;
  oldestLedgerCloseTime: number;
}
```

**Source:** [src/rpc/api.ts:678](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L678)

### `rawGetLedgersResponse.cursor`

```ts
cursor: string;
```

**Source:** [src/rpc/api.ts:684](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L684)

### `rawGetLedgersResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:680](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L680)

### `rawGetLedgersResponse.latestLedgerCloseTime`

```ts
latestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:681](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L681)

### `rawGetLedgersResponse.ledgers`

```ts
ledgers: RawLedgerResponse[];
```

**Source:** [src/rpc/api.ts:679](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L679)

### `rawGetLedgersResponse.oldestLedger`

```ts
oldestLedger: number;
```

**Source:** [src/rpc/api.ts:682](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L682)

### `rawGetLedgersResponse.oldestLedgerCloseTime`

```ts
oldestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:683](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L683)

## rpc.Api.RawGetTransactionResponse

```ts
interface RawGetTransactionResponse {
  applicationOrder?: number;
  createdAt?: number;
  diagnosticEventsXdr?: string[];
  envelopeXdr?: string;
  events?: RawTransactionEvents;
  feeBump?: boolean;
  latestLedger: number;
  latestLedgerCloseTime: number;
  ledger?: number;
  oldestLedger: number;
  oldestLedgerCloseTime: number;
  resultMetaXdr?: string;
  resultXdr?: string;
  status: GetTransactionStatus;
  txHash: string;
}
```

**Source:** [src/rpc/api.ts:127](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L127)

### `rawGetTransactionResponse.applicationOrder`

```ts
applicationOrder?: number;
```

**Source:** [src/rpc/api.ts:136](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L136)

### `rawGetTransactionResponse.createdAt`

```ts
createdAt?: number;
```

**Source:** [src/rpc/api.ts:139](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L139)

### `rawGetTransactionResponse.diagnosticEventsXdr`

```ts
diagnosticEventsXdr?: string[];
```

**Source:** [src/rpc/api.ts:144](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L144)

### `rawGetTransactionResponse.envelopeXdr`

```ts
envelopeXdr?: string;
```

**Source:** [src/rpc/api.ts:141](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L141)

### `rawGetTransactionResponse.events`

```ts
events?: RawTransactionEvents;
```

**Source:** [src/rpc/api.ts:146](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L146)

### `rawGetTransactionResponse.feeBump`

```ts
feeBump?: boolean;
```

**Source:** [src/rpc/api.ts:137](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L137)

### `rawGetTransactionResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:129](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L129)

### `rawGetTransactionResponse.latestLedgerCloseTime`

```ts
latestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:130](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L130)

### `rawGetTransactionResponse.ledger`

```ts
ledger?: number;
```

**Source:** [src/rpc/api.ts:138](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L138)

### `rawGetTransactionResponse.oldestLedger`

```ts
oldestLedger: number;
```

**Source:** [src/rpc/api.ts:131](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L131)

### `rawGetTransactionResponse.oldestLedgerCloseTime`

```ts
oldestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:132](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L132)

### `rawGetTransactionResponse.resultMetaXdr`

```ts
resultMetaXdr?: string;
```

**Source:** [src/rpc/api.ts:143](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L143)

### `rawGetTransactionResponse.resultXdr`

```ts
resultXdr?: string;
```

**Source:** [src/rpc/api.ts:142](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L142)

### `rawGetTransactionResponse.status`

```ts
status: GetTransactionStatus;
```

**Source:** [src/rpc/api.ts:128](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L128)

### `rawGetTransactionResponse.txHash`

```ts
txHash: string;
```

**Source:** [src/rpc/api.ts:133](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L133)

## rpc.Api.RawGetTransactionsResponse

```ts
interface RawGetTransactionsResponse {
  cursor: string;
  latestLedger: number;
  latestLedgerCloseTimestamp: number;
  oldestLedger: number;
  oldestLedgerCloseTimestamp: number;
  transactions: RawTransactionInfo[] | null;
}
```

**Source:** [src/rpc/api.ts:217](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L217)

### `rawGetTransactionsResponse.cursor`

```ts
cursor: string;
```

**Source:** [src/rpc/api.ts:223](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L223)

### `rawGetTransactionsResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:219](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L219)

### `rawGetTransactionsResponse.latestLedgerCloseTimestamp`

```ts
latestLedgerCloseTimestamp: number;
```

**Source:** [src/rpc/api.ts:220](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L220)

### `rawGetTransactionsResponse.oldestLedger`

```ts
oldestLedger: number;
```

**Source:** [src/rpc/api.ts:221](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L221)

### `rawGetTransactionsResponse.oldestLedgerCloseTimestamp`

```ts
oldestLedgerCloseTimestamp: number;
```

**Source:** [src/rpc/api.ts:222](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L222)

### `rawGetTransactionsResponse.transactions`

```ts
transactions: RawTransactionInfo[] | null;
```

**Source:** [src/rpc/api.ts:218](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L218)

## rpc.Api.RawLedgerEntryResult

```ts
interface RawLedgerEntryResult {
  key: string;
  lastModifiedLedgerSeq?: number;
  liveUntilLedgerSeq?: number;
  xdr: string;
}
```

**Source:** [src/rpc/api.ts:19](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L19)

### `rawLedgerEntryResult.key`

a base-64 encoded `xdr.LedgerKey` instance

```ts
key: string;
```

**Source:** [src/rpc/api.ts:22](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L22)

### `rawLedgerEntryResult.lastModifiedLedgerSeq`

```ts
lastModifiedLedgerSeq?: number;
```

**Source:** [src/rpc/api.ts:20](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L20)

### `rawLedgerEntryResult.liveUntilLedgerSeq`

optional, a future ledger number upon which this entry will expire
 based on https://github.com/stellar/soroban-tools/issues/1010

```ts
liveUntilLedgerSeq?: number;
```

**Source:** [src/rpc/api.ts:29](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L29)

### `rawLedgerEntryResult.xdr`

a base-64 encoded `xdr.LedgerEntryData` instance

```ts
xdr: string;
```

**Source:** [src/rpc/api.ts:24](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L24)

## rpc.Api.RawLedgerResponse

```ts
interface RawLedgerResponse {
  hash: string;
  headerXdr: string;
  ledgerCloseTime: string;
  metadataXdr: string;
  sequence: number;
}
```

**Source:** [src/rpc/api.ts:695](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L695)

### `rawLedgerResponse.hash`

```ts
hash: string;
```

**Source:** [src/rpc/api.ts:696](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L696)

### `rawLedgerResponse.headerXdr`

a base-64 encoded `xdr.LedgerHeaderHistoryEntry` instance

```ts
headerXdr: string;
```

**Source:** [src/rpc/api.ts:700](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L700)

### `rawLedgerResponse.ledgerCloseTime`

```ts
ledgerCloseTime: string;
```

**Source:** [src/rpc/api.ts:698](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L698)

### `rawLedgerResponse.metadataXdr`

a base-64 encoded `xdr.LedgerCloseMeta` instance

```ts
metadataXdr: string;
```

**Source:** [src/rpc/api.ts:702](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L702)

### `rawLedgerResponse.sequence`

```ts
sequence: number;
```

**Source:** [src/rpc/api.ts:697](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L697)

## rpc.Api.RawSendTransactionResponse

```ts
interface RawSendTransactionResponse extends BaseSendTransactionResponse {
  diagnosticEventsXdr?: string[];
  errorResultXdr?: string;
  hash: string;
  latestLedger: number;
  latestLedgerCloseTime: number;
  status: SendTransactionStatus;
}
```

**Source:** [src/rpc/api.ts:360](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L360)

### `rawSendTransactionResponse.diagnosticEventsXdr`

This is a base64-encoded instance of an array of
`xdr.DiagnosticEvent`s, set only when `status` is `"ERROR"` and
diagnostic events are enabled on the server.

```ts
diagnosticEventsXdr?: string[];
```

**Source:** [src/rpc/api.ts:373](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L373)

### `rawSendTransactionResponse.errorResultXdr`

This is a base64-encoded instance of `xdr.TransactionResult`, set
only when `status` is `"ERROR"`.

It contains details on why the network rejected the transaction.

```ts
errorResultXdr?: string;
```

**Source:** [src/rpc/api.ts:367](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L367)

### `rawSendTransactionResponse.hash`

```ts
hash: string;
```

**Source:** [src/rpc/api.ts:378](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L378)

### `rawSendTransactionResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:379](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L379)

### `rawSendTransactionResponse.latestLedgerCloseTime`

```ts
latestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:380](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L380)

### `rawSendTransactionResponse.status`

```ts
status: SendTransactionStatus;
```

**Source:** [src/rpc/api.ts:377](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L377)

## rpc.Api.RawSimulateTransactionResponse

```ts
interface RawSimulateTransactionResponse {
  error?: string;
  events?: string[];
  id: string;
  latestLedger: number;
  minResourceFee?: string;
  restorePreamble?: { minResourceFee: string; transactionData: string };
  results?: RawSimulateHostFunctionResult[];
  stateChanges?: RawLedgerEntryChange[];
  transactionData?: string;
}
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/simulateTransaction

**Source:** [src/rpc/api.ts:519](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L519)

### `rawSimulateTransactionResponse.error`

```ts
error?: string;
```

**Source:** [src/rpc/api.ts:522](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L522)

### `rawSimulateTransactionResponse.events`

These are xdr.DiagnosticEvents in base64

```ts
events?: string[];
```

**Source:** [src/rpc/api.ts:526](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L526)

### `rawSimulateTransactionResponse.id`

```ts
id: string;
```

**Source:** [src/rpc/api.ts:520](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L520)

### `rawSimulateTransactionResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:521](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L521)

### `rawSimulateTransactionResponse.minResourceFee`

```ts
minResourceFee?: string;
```

**Source:** [src/rpc/api.ts:527](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L527)

### `rawSimulateTransactionResponse.restorePreamble`

Present if succeeded but has expired ledger entries

```ts
restorePreamble?: { minResourceFee: string; transactionData: string };
```

**Source:** [src/rpc/api.ts:534](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L534)

### `rawSimulateTransactionResponse.results`

This will only contain a single element if present, because only a single
invokeHostFunctionOperation is supported per transaction.

```ts
results?: RawSimulateHostFunctionResult[];
```

**Source:** [src/rpc/api.ts:532](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L532)

### `rawSimulateTransactionResponse.stateChanges`

State difference information

```ts
stateChanges?: RawLedgerEntryChange[];
```

**Source:** [src/rpc/api.ts:540](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L540)

### `rawSimulateTransactionResponse.transactionData`

This is an xdr.SorobanTransactionData in base64

```ts
transactionData?: string;
```

**Source:** [src/rpc/api.ts:524](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L524)

## rpc.Api.RawTransactionEvents

```ts
interface RawTransactionEvents {
  contractEventsXdr?: string[][];
  transactionEventsXdr?: string[];
}
```

**Source:** [src/rpc/api.ts:165](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L165)

### `rawTransactionEvents.contractEventsXdr`

```ts
contractEventsXdr?: string[][];
```

**Source:** [src/rpc/api.ts:167](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L167)

### `rawTransactionEvents.transactionEventsXdr`

```ts
transactionEventsXdr?: string[];
```

**Source:** [src/rpc/api.ts:166](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L166)

## rpc.Api.RawTransactionInfo

```ts
interface RawTransactionInfo {
  applicationOrder: number;
  createdAt: number;
  diagnosticEventsXdr?: string[];
  envelopeXdr?: string;
  events?: RawTransactionEvents;
  feeBump: boolean;
  ledger: number;
  resultMetaXdr?: string;
  resultXdr?: string;
  status: GetTransactionStatus;
  txHash: string;
}
```

**Source:** [src/rpc/api.ts:170](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L170)

### `rawTransactionInfo.applicationOrder`

```ts
applicationOrder: number;
```

**Source:** [src/rpc/api.ts:174](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L174)

### `rawTransactionInfo.createdAt`

```ts
createdAt: number;
```

**Source:** [src/rpc/api.ts:173](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L173)

### `rawTransactionInfo.diagnosticEventsXdr`

```ts
diagnosticEventsXdr?: string[];
```

**Source:** [src/rpc/api.ts:181](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L181)

### `rawTransactionInfo.envelopeXdr`

```ts
envelopeXdr?: string;
```

**Source:** [src/rpc/api.ts:178](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L178)

### `rawTransactionInfo.events`

```ts
events?: RawTransactionEvents;
```

**Source:** [src/rpc/api.ts:183](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L183)

### `rawTransactionInfo.feeBump`

```ts
feeBump: boolean;
```

**Source:** [src/rpc/api.ts:175](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L175)

### `rawTransactionInfo.ledger`

```ts
ledger: number;
```

**Source:** [src/rpc/api.ts:172](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L172)

### `rawTransactionInfo.resultMetaXdr`

```ts
resultMetaXdr?: string;
```

**Source:** [src/rpc/api.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L180)

### `rawTransactionInfo.resultXdr`

```ts
resultXdr?: string;
```

**Source:** [src/rpc/api.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L179)

### `rawTransactionInfo.status`

```ts
status: GetTransactionStatus;
```

**Source:** [src/rpc/api.ts:171](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L171)

### `rawTransactionInfo.txHash`

```ts
txHash: string;
```

**Source:** [src/rpc/api.ts:176](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L176)

## rpc.Api.SendTransactionResponse

```ts
interface SendTransactionResponse extends BaseSendTransactionResponse {
  diagnosticEvents?: DiagnosticEvent[];
  errorResult?: TransactionResult;
  hash: string;
  latestLedger: number;
  latestLedgerCloseTime: number;
  status: SendTransactionStatus;
}
```

**Source:** [src/rpc/api.ts:355](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L355)

### `sendTransactionResponse.diagnosticEvents`

```ts
diagnosticEvents?: DiagnosticEvent[];
```

**Source:** [src/rpc/api.ts:357](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L357)

### `sendTransactionResponse.errorResult`

```ts
errorResult?: TransactionResult;
```

**Source:** [src/rpc/api.ts:356](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L356)

### `sendTransactionResponse.hash`

```ts
hash: string;
```

**Source:** [src/rpc/api.ts:378](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L378)

### `sendTransactionResponse.latestLedger`

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:379](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L379)

### `sendTransactionResponse.latestLedgerCloseTime`

```ts
latestLedgerCloseTime: number;
```

**Source:** [src/rpc/api.ts:380](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L380)

### `sendTransactionResponse.status`

```ts
status: SendTransactionStatus;
```

**Source:** [src/rpc/api.ts:377](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L377)

## rpc.Api.SendTransactionStatus

```ts
type SendTransactionStatus = "PENDING" | "DUPLICATE" | "TRY_AGAIN_LATER" | "ERROR"
```

**Source:** [src/rpc/api.ts:349](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L349)

## rpc.Api.SimulateHostFunctionResult

```ts
interface SimulateHostFunctionResult {
  auth: SorobanAuthorizationEntry[];
  retval: ScVal;
}
```

**Source:** [src/rpc/api.ts:383](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L383)

### `simulateHostFunctionResult.auth`

```ts
auth: SorobanAuthorizationEntry[];
```

**Source:** [src/rpc/api.ts:384](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L384)

### `simulateHostFunctionResult.retval`

```ts
retval: ScVal;
```

**Source:** [src/rpc/api.ts:385](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L385)

## rpc.Api.SimulateTransactionErrorResponse

Includes details about why the simulation failed

```ts
interface SimulateTransactionErrorResponse extends BaseSimulateTransactionResponse {
  _parsed: boolean;
  error: string;
  events: DiagnosticEvent[];
  id: string;
  latestLedger: number;
}
```

**Source:** [src/rpc/api.ts:441](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L441)

### `simulateTransactionErrorResponse._parsed`

a private field to mark the schema as parsed

```ts
_parsed: boolean;
```

**Source:** [src/rpc/api.ts:425](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L425)

### `simulateTransactionErrorResponse.error`

```ts
error: string;
```

**Source:** [src/rpc/api.ts:442](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L442)

### `simulateTransactionErrorResponse.events`

The field is always present, but may be empty in cases where:
  - you didn't simulate an invocation or
  - there were no events

```ts
events: DiagnosticEvent[];
```

**Source:** [src/rpc/api.ts:443](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L443)

### `simulateTransactionErrorResponse.id`

always present: the JSON-RPC request ID

```ts
id: string;
```

**Source:** [src/rpc/api.ts:412](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L412)

### `simulateTransactionErrorResponse.latestLedger`

always present: the LCL known to the server when responding

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:415](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L415)

## rpc.Api.SimulateTransactionResponse

Simplifies `RawSimulateTransactionResponse` into separate interfaces
based on status:
  - on success, this includes all fields, though `result` is only present
    if an invocation was simulated (since otherwise there's nothing to
    "resultify")
  - if there was an expiration error, this includes error and restoration
    fields
  - for all other errors, this only includes error fields

```ts
type SimulateTransactionResponse = SimulateTransactionSuccessResponse | SimulateTransactionRestoreResponse | SimulateTransactionErrorResponse
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/simulateTransaction

**Source:** [src/rpc/api.ts:405](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L405)

## rpc.Api.SimulateTransactionRestoreResponse

Includes simplified fields only present on success.

```ts
interface SimulateTransactionRestoreResponse extends SimulateTransactionSuccessResponse {
  _parsed: boolean;
  events: DiagnosticEvent[];
  id: string;
  latestLedger: number;
  minResourceFee: string;
  restorePreamble: { minResourceFee: string; transactionData: SorobanDataBuilder };
  result: SimulateHostFunctionResult;
  stateChanges?: LedgerEntryChange[];
  transactionData: SorobanDataBuilder;
}
```

**Source:** [src/rpc/api.ts:446](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L446)

### `simulateTransactionRestoreResponse._parsed`

a private field to mark the schema as parsed

```ts
_parsed: boolean;
```

**Source:** [src/rpc/api.ts:425](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L425)

### `simulateTransactionRestoreResponse.events`

The field is always present, but may be empty in cases where:
  - you didn't simulate an invocation or
  - there were no events

```ts
events: DiagnosticEvent[];
```

**Source:** [src/rpc/api.ts:422](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L422)

### `simulateTransactionRestoreResponse.id`

always present: the JSON-RPC request ID

```ts
id: string;
```

**Source:** [src/rpc/api.ts:412](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L412)

### `simulateTransactionRestoreResponse.latestLedger`

always present: the LCL known to the server when responding

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:415](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L415)

### `simulateTransactionRestoreResponse.minResourceFee`

```ts
minResourceFee: string;
```

**Source:** [src/rpc/api.ts:431](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L431)

### `simulateTransactionRestoreResponse.restorePreamble`

Indicates that a restoration is necessary prior to submission.

In other words, seeing a restoration preamble means that your invocation
was executed AS IF the required ledger entries were present, and this
field includes information about what you need to restore for the
simulation to succeed.

```ts
restorePreamble: { minResourceFee: string; transactionData: SorobanDataBuilder };
```

**Source:** [src/rpc/api.ts:457](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L457)

### `simulateTransactionRestoreResponse.result`

present only for invocation simulation

```ts
result: SimulateHostFunctionResult;
```

**Source:** [src/rpc/api.ts:447](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L447)

### `simulateTransactionRestoreResponse.stateChanges`

State Difference information

```ts
stateChanges?: LedgerEntryChange[];
```

**Source:** [src/rpc/api.ts:437](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L437)

### `simulateTransactionRestoreResponse.transactionData`

```ts
transactionData: SorobanDataBuilder;
```

**Source:** [src/rpc/api.ts:430](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L430)

## rpc.Api.SimulateTransactionSuccessResponse

Includes simplified fields only present on success.

```ts
interface SimulateTransactionSuccessResponse extends BaseSimulateTransactionResponse {
  _parsed: boolean;
  events: DiagnosticEvent[];
  id: string;
  latestLedger: number;
  minResourceFee: string;
  result?: SimulateHostFunctionResult;
  stateChanges?: LedgerEntryChange[];
  transactionData: SorobanDataBuilder;
}
```

**Source:** [src/rpc/api.ts:429](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L429)

### `simulateTransactionSuccessResponse._parsed`

a private field to mark the schema as parsed

```ts
_parsed: boolean;
```

**Source:** [src/rpc/api.ts:425](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L425)

### `simulateTransactionSuccessResponse.events`

The field is always present, but may be empty in cases where:
  - you didn't simulate an invocation or
  - there were no events

```ts
events: DiagnosticEvent[];
```

**Source:** [src/rpc/api.ts:422](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L422)

### `simulateTransactionSuccessResponse.id`

always present: the JSON-RPC request ID

```ts
id: string;
```

**Source:** [src/rpc/api.ts:412](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L412)

### `simulateTransactionSuccessResponse.latestLedger`

always present: the LCL known to the server when responding

```ts
latestLedger: number;
```

**Source:** [src/rpc/api.ts:415](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L415)

### `simulateTransactionSuccessResponse.minResourceFee`

```ts
minResourceFee: string;
```

**Source:** [src/rpc/api.ts:431](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L431)

### `simulateTransactionSuccessResponse.result`

present only for invocation simulation

```ts
result?: SimulateHostFunctionResult;
```

**Source:** [src/rpc/api.ts:434](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L434)

### `simulateTransactionSuccessResponse.stateChanges`

State Difference information

```ts
stateChanges?: LedgerEntryChange[];
```

**Source:** [src/rpc/api.ts:437](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L437)

### `simulateTransactionSuccessResponse.transactionData`

```ts
transactionData: SorobanDataBuilder;
```

**Source:** [src/rpc/api.ts:430](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L430)

## rpc.Api.SimulationAuthMode

```ts
type SimulationAuthMode = "enforce" | "record" | "record_allow_nonroot"
```

**Source:** [src/rpc/api.ts:388](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L388)

## rpc.Api.TransactionEvents

```ts
interface TransactionEvents {
  contractEventsXdr: ContractEvent[][];
  transactionEventsXdr: TransactionEvent[];
}
```

**Source:** [src/rpc/api.ts:186](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L186)

### `transactionEvents.contractEventsXdr`

```ts
contractEventsXdr: ContractEvent[][];
```

**Source:** [src/rpc/api.ts:188](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L188)

### `transactionEvents.transactionEventsXdr`

```ts
transactionEventsXdr: TransactionEvent[];
```

**Source:** [src/rpc/api.ts:187](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L187)

## rpc.Api.TransactionInfo

```ts
interface TransactionInfo {
  applicationOrder: number;
  createdAt: number;
  diagnosticEventsXdr?: DiagnosticEvent[];
  envelopeXdr: TransactionEnvelope;
  events: TransactionEvents;
  feeBump: boolean;
  ledger: number;
  resultMetaXdr: TransactionMeta;
  resultXdr: TransactionResult;
  returnValue?: ScVal;
  status: GetTransactionStatus;
  txHash: string;
}
```

**Source:** [src/rpc/api.ts:191](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L191)

### `transactionInfo.applicationOrder`

```ts
applicationOrder: number;
```

**Source:** [src/rpc/api.ts:195](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L195)

### `transactionInfo.createdAt`

```ts
createdAt: number;
```

**Source:** [src/rpc/api.ts:194](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L194)

### `transactionInfo.diagnosticEventsXdr`

```ts
diagnosticEventsXdr?: DiagnosticEvent[];
```

**Source:** [src/rpc/api.ts:203](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L203)

### `transactionInfo.envelopeXdr`

```ts
envelopeXdr: TransactionEnvelope;
```

**Source:** [src/rpc/api.ts:199](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L199)

### `transactionInfo.events`

```ts
events: TransactionEvents;
```

**Source:** [src/rpc/api.ts:205](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L205)

### `transactionInfo.feeBump`

```ts
feeBump: boolean;
```

**Source:** [src/rpc/api.ts:196](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L196)

### `transactionInfo.ledger`

```ts
ledger: number;
```

**Source:** [src/rpc/api.ts:193](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L193)

### `transactionInfo.resultMetaXdr`

```ts
resultMetaXdr: TransactionMeta;
```

**Source:** [src/rpc/api.ts:201](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L201)

### `transactionInfo.resultXdr`

```ts
resultXdr: TransactionResult;
```

**Source:** [src/rpc/api.ts:200](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L200)

### `transactionInfo.returnValue`

```ts
returnValue?: ScVal;
```

**Source:** [src/rpc/api.ts:202](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L202)

### `transactionInfo.status`

```ts
status: GetTransactionStatus;
```

**Source:** [src/rpc/api.ts:192](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L192)

### `transactionInfo.txHash`

```ts
txHash: string;
```

**Source:** [src/rpc/api.ts:197](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L197)

## rpc.Api.isSimulationError

Checks if a simulation response indicates an error.

```ts
isSimulationError(sim: SimulateTransactionResponse): sim is SimulateTransactionErrorResponse
```

**Parameters**

- **`sim`** — `SimulateTransactionResponse` (required) — The simulation response to check.

**Returns**

True if the response indicates an error, false otherwise.

**Source:** [src/rpc/api.ts:468](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L468)

## rpc.Api.isSimulationRaw

Checks if a simulation response is in raw (unparsed) form.

```ts
isSimulationRaw(sim: SimulateTransactionResponse | RawSimulateTransactionResponse): sim is RawSimulateTransactionResponse
```

**Parameters**

- **`sim`** — `SimulateTransactionResponse | RawSimulateTransactionResponse` (required) — The simulation response to check.

**Returns**

True if the response is raw, false otherwise.

**Source:** [src/rpc/api.ts:505](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L505)

## rpc.Api.isSimulationRestore

Checks if a simulation response indicates that a restoration is needed.

```ts
isSimulationRestore(sim: SimulateTransactionResponse): sim is SimulateTransactionRestoreResponse
```

**Parameters**

- **`sim`** — `SimulateTransactionResponse` (required) — The simulation response to check.

**Returns**

True if the response indicates a restoration is needed, false otherwise.

**Source:** [src/rpc/api.ts:490](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L490)

## rpc.Api.isSimulationSuccess

Checks if a simulation response indicates success.

```ts
isSimulationSuccess(sim: SimulateTransactionResponse): sim is SimulateTransactionSuccessResponse
```

**Parameters**

- **`sim`** — `SimulateTransactionResponse` (required) — The simulation response to check.

**Returns**

True if the response indicates success, false otherwise.

**Source:** [src/rpc/api.ts:479](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/api.ts#L479)

## rpc.BasicSleepStrategy

```ts
const BasicSleepStrategy: SleepStrategy
```

**Source:** [src/rpc/server.ts:90](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L90)

## rpc.Durability

Specifies the durability namespace of contract-related ledger entries.

```ts
enum Durability
```

**See also**

- - `State Archival docs`
 - `Rust SDK Storage docs`

**Source:** [src/rpc/server.ts:48](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L48)

## rpc.LinearSleepStrategy

```ts
const LinearSleepStrategy: SleepStrategy
```

**Source:** [src/rpc/server.ts:93](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L93)

## rpc.Server

Handles the network connection to a Soroban RPC instance, exposing an
interface for requests to that instance.

```ts
class Server {
  constructor(serverURL: string, opts: Options = {});
  readonly httpClient: HttpClient;
  readonly serverURL: URL;
  _getEvents(request: GetEventsRequest): Promise<RawGetEventsResponse>;
  _getLatestLedger(): Promise<RawGetLatestLedgerResponse>;
  _getLedgerEntries(...keys: LedgerKey[]): Promise<RawGetLedgerEntriesResponse>;
  _getLedgers(request: GetLedgersRequest): Promise<RawGetLedgersResponse>;
  _getTransaction(hash: string): Promise<RawGetTransactionResponse>;
  _getTransactions(request: GetTransactionsRequest): Promise<RawGetTransactionsResponse>;
  _sendTransaction(transaction: Transaction | FeeBumpTransaction): Promise<RawSendTransactionResponse>;
  _simulateTransaction(transaction: Transaction | FeeBumpTransaction, addlResources?: ResourceLeeway, authMode?: SimulationAuthMode): Promise<RawSimulateTransactionResponse>;
  fundAddress(address: string, friendbotUrl?: string): Promise<GetSuccessfulTransactionResponse>;
  getAccount(address: string): Promise<Account>;
  getAccountEntry(address: string): Promise<AccountEntry>;
  getAssetBalance(address: string | Address | Contract, asset: Asset, networkPassphrase?: string): Promise<BalanceResponse>;
  getClaimableBalance(id: string): Promise<ClaimableBalanceEntry>;
  getContractData(contract: string | Address | Contract, key: ScVal, durability: Durability = Durability.Persistent): Promise<LedgerEntryResult>;
  getContractWasmByContractId(contractId: string): Promise<Buffer<ArrayBufferLike>>;
  getContractWasmByHash(wasmHash: string | Buffer<ArrayBufferLike>, format: "base64" | "hex" | undefined = undefined): Promise<Buffer<ArrayBufferLike>>;
  getEvents(request: GetEventsRequest): Promise<GetEventsResponse>;
  getFeeStats(): Promise<GetFeeStatsResponse>;
  getHealth(): Promise<GetHealthResponse>;
  getLatestLedger(): Promise<GetLatestLedgerResponse>;
  getLedgerEntries(...keys: LedgerKey[]): Promise<GetLedgerEntriesResponse>;
  getLedgerEntry(key: LedgerKey): Promise<LedgerEntryResult>;
  getLedgers(request: GetLedgersRequest): Promise<GetLedgersResponse>;
  getNetwork(): Promise<GetNetworkResponse>;
  getSACBalance(address: string | Address, sac: Asset, networkPassphrase?: string): Promise<BalanceResponse>;
  getTransaction(hash: string): Promise<GetTransactionResponse>;
  getTransactions(request: GetTransactionsRequest): Promise<GetTransactionsResponse>;
  getTrustline(account: string, asset: Asset): Promise<TrustLineEntry>;
  getVersionInfo(): Promise<GetVersionInfoResponse>;
  pollTransaction(hash: string, opts?: PollingOptions): Promise<GetTransactionResponse>;
  prepareTransaction(tx: Transaction | FeeBumpTransaction): Promise<Transaction>;
  requestAirdrop(address: string | Pick<Account, "accountId">, friendbotUrl?: string): Promise<Account>;
  sendTransaction(transaction: Transaction | FeeBumpTransaction): Promise<SendTransactionResponse>;
  simulateTransaction(tx: Transaction | FeeBumpTransaction, addlResources?: ResourceLeeway, authMode?: SimulationAuthMode): Promise<SimulateTransactionResponse>;
}
```

**See also**

- `API reference docs`

**Source:** [src/rpc/server.ts:53](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L53)

### `new Server(serverURL, opts)`

```ts
constructor(serverURL: string, opts: Options = {});
```

**Parameters**

- **`serverURL`** — `string` (required)
- **`opts`** — `Options` (optional) (default: `{}`)

**Source:** [src/rpc/server.ts:170](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L170)

### `server.httpClient`

HTTP client instance for making requests to Horizon.
Exposes interceptors, defaults, and other configuration options.

```ts
readonly httpClient: HttpClient;
```

**Example**

```ts
// Add authentication header
server.httpClient.defaults.headers['Authorization'] = 'Bearer token';

// Add request interceptor
server.httpClient.interceptors.request.use((config) => {
  console.log('Request:', config.url);
  return config;
});
```

**Source:** [src/rpc/server.ts:169](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L169)

### `server.serverURL`

```ts
readonly serverURL: URL;
```

**Source:** [src/rpc/server.ts:152](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L152)

### `server._getEvents(request)`

```ts
_getEvents(request: GetEventsRequest): Promise<RawGetEventsResponse>;
```

**Parameters**

- **`request`** — `GetEventsRequest` (required)

**Source:** [src/rpc/server.ts:896](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L896)

### `server._getLatestLedger()`

```ts
_getLatestLedger(): Promise<RawGetLatestLedgerResponse>;
```

**Source:** [src/rpc/server.ts:967](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L967)

### `server._getLedgerEntries(keys)`

```ts
_getLedgerEntries(...keys: LedgerKey[]): Promise<RawGetLedgerEntriesResponse>;
```

**Parameters**

- **`...keys`** — `LedgerKey[]` (required)

**Source:** [src/rpc/server.ts:661](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L661)

### `server._getLedgers(request)`

```ts
_getLedgers(request: GetLedgersRequest): Promise<RawGetLedgersResponse>;
```

**Parameters**

- **`request`** — `GetLedgersRequest` (required)

**Source:** [src/rpc/server.ts:1558](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L1558)

### `server._getTransaction(hash)`

```ts
_getTransaction(hash: string): Promise<RawGetTransactionResponse>;
```

**Parameters**

- **`hash`** — `string` (required)

**Source:** [src/rpc/server.ts:784](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L784)

### `server._getTransactions(request)`

```ts
_getTransactions(request: GetTransactionsRequest): Promise<RawGetTransactionsResponse>;
```

**Parameters**

- **`request`** — `GetTransactionsRequest` (required)

**Source:** [src/rpc/server.ts:835](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L835)

### `server._sendTransaction(transaction)`

```ts
_sendTransaction(transaction: Transaction | FeeBumpTransaction): Promise<RawSendTransactionResponse>;
```

**Parameters**

- **`transaction`** — `Transaction | FeeBumpTransaction` (required)

**Source:** [src/rpc/server.ts:1194](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L1194)

### `server._simulateTransaction(transaction, addlResources, authMode)`

```ts
_simulateTransaction(transaction: Transaction | FeeBumpTransaction, addlResources?: ResourceLeeway, authMode?: SimulationAuthMode): Promise<RawSimulateTransactionResponse>;
```

**Parameters**

- **`transaction`** — `Transaction | FeeBumpTransaction` (required)
- **`addlResources`** — `ResourceLeeway` (optional)
- **`authMode`** — `SimulationAuthMode` (optional)

**Source:** [src/rpc/server.ts:1041](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L1041)

### `server.fundAddress(address, friendbotUrl)`

Fund an address using the network's Friendbot faucet, if any.

This method supports both account (G...) and contract (C...) addresses.

```ts
fundAddress(address: string, friendbotUrl?: string): Promise<GetSuccessfulTransactionResponse>;
```

**Parameters**

- **`address`** — `string` (required) — The address to fund. Can be either a Stellar
     account (G...) or contract (C...) address.
- **`friendbotUrl`** — `string` (optional) — (optional) Optionally, an explicit Friendbot URL
     (by default: this calls the Stellar RPC
     `getNetwork` method to try to
     discover this network's Friendbot url).

**Returns**

The transaction
   response from the Friendbot funding transaction.

**Throws**

- If Friendbot is not configured on this network or the
   funding transaction fails.

**Example**

```ts
// Funding an account (G... address)
const tx = await server.fundAddress("GBZC6Y2Y7...");
console.log("Funded! Hash:", tx.txHash);
// If you need the Account object:
const account = await server.getAccount("GBZC6Y2Y7...");
```

**Example**

```ts
// Funding a contract (C... address)
const tx = await server.fundAddress("CBZC6Y2Y7...");
console.log("Contract funded! Hash:", tx.txHash);
```

**See also**

- `Friendbot docs`

**Source:** [src/rpc/server.ts:1317](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L1317)

### `server.getAccount(address)`

Fetch a minimal set of current info about a Stellar account.

Needed to get the current sequence number for the account so you can build
a successful transaction with `TransactionBuilder`.

```ts
getAccount(address: string): Promise<Account>;
```

**Parameters**

- **`address`** — `string` (required) — The public address of the account to load.

**Returns**

A promise which resolves to the `Account`
object with a populated sequence number

**Example**

```ts
const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
server.getAccount(accountId).then((account) => {
  console.log("sequence:", account.sequence);
});
```

**See also**

- `getLedgerEntries docs`

**Source:** [src/rpc/server.ts:203](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L203)

### `server.getAccountEntry(address)`

Fetch the full account entry for a Stellar account.

```ts
getAccountEntry(address: string): Promise<AccountEntry>;
```

**Parameters**

- **`address`** — `string` (required) — The public address of the account to load.

**Returns**

Resolves to the full on-chain account
   entry

**Example**

```ts
const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
server.getAccountEntry(accountId).then((account) => {
  console.log("sequence:", account.balance().toString());
});
```

**See also**

- `getLedgerEntries docs`

**Source:** [src/rpc/server.ts:226](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L226)

### `server.getAssetBalance(address, asset, networkPassphrase)`

Fetch the balance of an asset held by an account or contract.

The `address` argument may be provided as a string (as a `StrKey`),
`Address`, or `Contract`.

```ts
getAssetBalance(address: string | Address | Contract, asset: Asset, networkPassphrase?: string): Promise<BalanceResponse>;
```

**Parameters**

- **`address`** — `string | Address | Contract` (required) — The account or contract whose
     balance should be fetched.
- **`asset`** — `Asset` (required) — The asset whose balance you want to inspect.
- **`networkPassphrase`** — `string` (optional) — (optional) optionally, when requesting the
     balance of a contract, the network passphrase to which this token
     applies. If omitted and necessary, a request about network information
     will be made (see `getNetwork`), since contract IDs for assets are
     specific to a network. You can refer to `Networks` for a list of
     built-in passphrases, e.g., `Networks.TESTNET`.

**Returns**

Resolves with balance entry details
   when available.

**Throws**

- If the supplied `address` is not a valid account or
   contract strkey.

**Example**

```ts
const usdc = new Asset(
  "USDC",
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
);
const balance = await server.getAssetBalance("GD...", usdc);
console.log(balance.balanceEntry?.amount);
```

**Source:** [src/rpc/server.ts:376](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L376)

### `server.getClaimableBalance(id)`

Fetch the full claimable balance entry for a Stellar account.

```ts
getClaimableBalance(id: string): Promise<ClaimableBalanceEntry>;
```

**Parameters**

- **`id`** — `string` (required) — The strkey (`B...`) or hex (`00000000abcde...`) (both
     IDs with and without the 000... version prefix are accepted) of the
     claimable balance to load

**Returns**

Resolves to the full on-chain
   claimable balance entry

**Example**

```ts
const id = "00000000178826fbfe339e1f5c53417c6fedfe2c05e8bec14303143ec46b38981b09c3f9";
server.getClaimableBalance(id).then((entry) => {
  console.log(`Claimable balance {id.substr(0, 12)} has:`);
  console.log(`  asset:  ${Asset.fromXDRObject(entry.asset()).toString()}`;
  console.log(`  amount: ${entry.amount().toString()}`;
});
```

**See also**

- `getLedgerEntries docs`

**Source:** [src/rpc/server.ts:308](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L308)

### `server.getContractData(contract, key, durability)`

Reads the current value of contract data ledger entries directly.

Allows you to directly inspect the current state of a contract. This is a
backup way to access your contract data which may not be available via
events or `rpc.Server.simulateTransaction`.

```ts
getContractData(contract: string | Address | Contract, key: ScVal, durability: Durability = Durability.Persistent): Promise<LedgerEntryResult>;
```

**Parameters**

- **`contract`** — `string | Address | Contract` (required) — The contract ID containing the
     data to load as a strkey (`C...` form), a `Contract`, or an
     `Address` instance
- **`key`** — `ScVal` (required) — The key of the contract data to load
- **`durability`** — `Durability` (optional) (default: `Durability.Persistent`) — (optional) The "durability
     keyspace" that this ledger key belongs to, which is either 'temporary'
     or 'persistent' (the default), see `rpc.Durability`.

**Returns**

The current data value

**Warning:** If the data entry in question is a 'temporary' entry, it's
entirely possible that it has expired out of existence.

**Example**

```ts
const contractId = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
const key = xdr.ScVal.scvSymbol("counter");
server.getContractData(contractId, key, Durability.Temporary).then(data => {
  console.log("value:", data.val);
  console.log("liveUntilLedgerSeq:", data.liveUntilLedgerSeq);
  console.log("lastModified:", data.lastModifiedLedgerSeq);
  console.log("latestLedger:", data.latestLedger);
});
```

**See also**

- `getLedgerEntries docs`

**Source:** [src/rpc/server.ts:477](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L477)

### `server.getContractWasmByContractId(contractId)`

Retrieves the WASM bytecode for a given contract.

This method allows you to fetch the WASM bytecode associated with a contract
deployed on the Soroban network. The WASM bytecode represents the executable
code of the contract.

```ts
getContractWasmByContractId(contractId: string): Promise<Buffer<ArrayBufferLike>>;
```

**Parameters**

- **`contractId`** — `string` (required) — The contract ID containing the WASM bytecode to retrieve

**Returns**

A Buffer containing the WASM bytecode

**Throws**

- If the contract or its associated WASM bytecode cannot be
found on the network.

**Example**

```ts
const contractId = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
server.getContractWasmByContractId(contractId).then(wasmBuffer => {
  console.log("WASM bytecode length:", wasmBuffer.length);
  // ... do something with the WASM bytecode ...
}).catch(err => {
  console.error("Error fetching WASM bytecode:", err);
});
```

**Source:** [src/rpc/server.ts:551](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L551)

### `server.getContractWasmByHash(wasmHash, format)`

Retrieves the WASM bytecode for a given contract hash.

This method allows you to fetch the WASM bytecode associated with a contract
deployed on the Soroban network using the contract's WASM hash. The WASM bytecode
represents the executable code of the contract.

```ts
getContractWasmByHash(wasmHash: string | Buffer<ArrayBufferLike>, format: "base64" | "hex" | undefined = undefined): Promise<Buffer<ArrayBufferLike>>;
```

**Parameters**

- **`wasmHash`** — `string | Buffer<ArrayBufferLike>` (required) — The WASM hash of the contract
- **`format`** — `"base64" | "hex" | undefined` (optional) (default: `undefined`)

**Returns**

A Buffer containing the WASM bytecode

**Throws**

- If the contract or its associated WASM bytecode cannot be
found on the network.

**Example**

```ts
const wasmHash = Buffer.from("...");
server.getContractWasmByHash(wasmHash).then(wasmBuffer => {
  console.log("WASM bytecode length:", wasmBuffer.length);
  // ... do something with the WASM bytecode ...
}).catch(err => {
  console.error("Error fetching WASM bytecode:", err);
});
```

**Source:** [src/rpc/server.ts:596](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L596)

### `server.getEvents(request)`

Fetch all events that match a given set of filters.

The given filters (see `Api.EventFilter`
for detailed fields) are combined only in a logical OR fashion, and all of
the fields in each filter are optional.

To page through events, use the `pagingToken` field on the relevant
`Api.EventResponse` object to set the `cursor` parameter.

```ts
getEvents(request: GetEventsRequest): Promise<GetEventsResponse>;
```

**Parameters**

- **`request`** — `GetEventsRequest` (required) — Event filters `Api.GetEventsRequest`,

**Returns**

A paginatable set of the events
matching the given event filters

**Example**

```ts

server.getEvents({
   startLedger: 1000,
   endLedger: 2000,
   filters: [
    {
     type: "contract",
     contractIds: [ "deadb33f..." ],
     topics: [[ "AAAABQAAAAh0cmFuc2Zlcg==", "AAAAAQB6Mcc=", "*" ]]
    }, {
     type: "system",
     contractIds: [ "...c4f3b4b3..." ],
     topics: [[ "*" ], [ "*", "AAAAAQB6Mcc=" ]]
    }, {
     contractIds: [ "...c4f3b4b3..." ],
     topics: [[ "AAAABQAAAAh0cmFuc2Zlcg==" ]]
    }, {
     type: "diagnostic",
     topics: [[ "AAAAAQB6Mcc=" ]]
    }
   ],
   limit: 10,
});
```

**See also**

- `getEvents docs`

**Source:** [src/rpc/server.ts:890](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L890)

### `server.getFeeStats()`

Provides an analysis of the recent fee stats for regular and smart
contract operations.

```ts
getFeeStats(): Promise<GetFeeStatsResponse>;
```

**Returns**

the fee stats

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getFeeStats

**Source:** [src/rpc/server.ts:1363](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L1363)

### `server.getHealth()`

General node health check.

```ts
getHealth(): Promise<GetHealthResponse>;
```

**Returns**

A promise which resolves to the
`Api.GetHealthResponse` object with the status of the
server (e.g. "healthy").

**Example**

```ts
server.getHealth().then((health) => {
  console.log("status:", health.status);
});
```

**See also**

- `getLedgerEntries docs`

**Source:** [src/rpc/server.ts:435](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L435)

### `server.getLatestLedger()`

Fetch the latest ledger meta info from network which this Soroban RPC
server is connected to.

```ts
getLatestLedger(): Promise<GetLatestLedgerResponse>;
```

**Returns**

metadata about the
   latest ledger on the network that this RPC server is connected to

**Example**

```ts
server.getLatestLedger().then((response) => {
  console.log("hash:", response.id);
  console.log("sequence:", response.sequence);
  console.log("protocolVersion:", response.protocolVersion);
});
```

**See also**

- `getLatestLedger docs`

**Source:** [src/rpc/server.ts:963](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L963)

### `server.getLedgerEntries(keys)`

Reads the current value of arbitrary ledger entries directly.

Allows you to directly inspect the current state of contracts, contract's
code, accounts, or any other ledger entries.

To fetch a contract's WASM byte-code, built the appropriate
`xdr.LedgerKeyContractCode` ledger entry key (or see
`Contract.getFootprint`).

```ts
getLedgerEntries(...keys: LedgerKey[]): Promise<GetLedgerEntriesResponse>;
```

**Parameters**

- **`...keys`** — `LedgerKey[]` (required) — One or more ledger entry keys to load

**Returns**

The current on-chain
values for the given ledger keys

**Example**

```ts
const contractId = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
const key = xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({
  contractId: StrKey.decodeContract(contractId),
  key: xdr.ScVal.scvSymbol("counter"),
}));

server.getLedgerEntries([key]).then(response => {
  const ledgerData = response.entries[0];
  console.log("key:", ledgerData.key);
  console.log("value:", ledgerData.val);
  console.log("liveUntilLedgerSeq:", ledgerData.liveUntilLedgerSeq);
  console.log("lastModified:", ledgerData.lastModifiedLedgerSeq);
  console.log("latestLedger:", response.latestLedger);
});
```

**See also**

- - `getLedgerEntries docs`
 - RpcServer._getLedgerEntries

**Source:** [src/rpc/server.ts:657](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L657)

### `server.getLedgerEntry(key)`

```ts
getLedgerEntry(key: LedgerKey): Promise<LedgerEntryResult>;
```

**Parameters**

- **`key`** — `LedgerKey` (required)

**Source:** [src/rpc/server.ts:672](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L672)

### `server.getLedgers(request)`

Fetch a detailed list of ledgers starting from a specified point.

Returns ledger data with support for pagination as long as the requested
pages fall within the history retention of the RPC provider.

```ts
getLedgers(request: GetLedgersRequest): Promise<GetLedgersResponse>;
```

**Parameters**

- **`request`** — `GetLedgersRequest` (required) — The request parameters for fetching ledgers. `Api.GetLedgersRequest`

**Returns**

A promise that resolves to the
   ledgers response containing an array of ledger data and pagination info. `Api.GetLedgersResponse`

**Throws**

- If startLedger is less than the oldest ledger stored in this
   node, or greater than the latest ledger seen by this node.

**Example**

```ts
// Fetch ledgers starting from a specific sequence number
server.getLedgers({
  startLedger: 36233,
  pagination: {
    limit: 10
  }
}).then((response) => {
  console.log("Ledgers:", response.ledgers);
  console.log("Latest Ledger:", response.latestLedger);
  console.log("Cursor:", response.cursor);
});
```

**Example**

```ts
// Paginate through ledgers using cursor
const firstPage = await server.getLedgers({
  startLedger: 36233,
  pagination: {
    limit: 5
  }
});

const nextPage = await server.getLedgers({
  pagination: {
    cursor: firstPage.cursor,
    limit: 5
  }
});
```

**See also**

- `getLedgers docs`

**Source:** [src/rpc/server.ts:1542](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L1542)

### `server.getNetwork()`

Fetch metadata about the network this Soroban RPC server is connected to.

```ts
getNetwork(): Promise<GetNetworkResponse>;
```

**Returns**

Metadata about the current
network this RPC server is connected to

**Example**

```ts
server.getNetwork().then((network) => {
  console.log("friendbotUrl:", network.friendbotUrl);
  console.log("passphrase:", network.passphrase);
  console.log("protocolVersion:", network.protocolVersion);
});
```

**See also**

- `getNetwork docs`

**Source:** [src/rpc/server.ts:937](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L937)

### `server.getSACBalance(address, sac, networkPassphrase)`

**Deprecated.** Use `getAssetBalance`, instead

Returns a contract's balance of a particular SAC asset, if any.

This is a convenience wrapper around `Server.getLedgerEntries`.

```ts
getSACBalance(address: string | Address, sac: Asset, networkPassphrase?: string): Promise<BalanceResponse>;
```

**Parameters**

- **`address`** — `string | Address` (required) — the contract (string `C...`) whose balance of
     `sac` you want to know
- **`sac`** — `Asset` (required) — the built-in SAC token (e.g. `USDC:GABC...`) that
     you are querying from the given `contract`.
- **`networkPassphrase`** — `string` (optional) — (optional) optionally, the network passphrase to
     which this token applies. If omitted, a request about network
     information will be made (see `getNetwork`), since contract IDs
     for assets are specific to a network. You can refer to `Networks`
     for a list of built-in passphrases, e.g., `Networks.TESTNET`.

**Returns**

, which will contain the balance
   entry details if and only if the request returned a valid balance ledger
   entry. If it doesn't, the `balanceEntry` field will not exist.

**Throws**

- If `address` is not a valid contract ID (C...).

**Example**

```ts
// assume `address` is some contract or account with an XLM balance
// assume server is an instantiated `Server` instance.
const entry = (await server.getSACBalance(
  new Address(address),
  Asset.native(),
  Networks.PUBLIC
));

// assumes BigInt support:
console.log(
  entry.balanceEntry ?
  BigInt(entry.balanceEntry.amount) :
  "Address has no XLM");
```

**See also**

- - getLedgerEntries
 - https://developers.stellar.org/docs/tokens/stellar-asset-contract

**Source:** [src/rpc/server.ts:1427](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L1427)

### `server.getTransaction(hash)`

Fetch the details of a submitted transaction.

After submitting a transaction, clients should poll this to tell when the
transaction has completed.

```ts
getTransaction(hash: string): Promise<GetTransactionResponse>;
```

**Parameters**

- **`hash`** — `string` (required) — Hex-encoded hash of the transaction to check

**Returns**

The status, result, and
   other details about the transaction

**Example**

```ts
const transactionHash = "c4515e3bdc0897f21cc5dbec8c82cf0a936d4741cb74a8e158eb51b9fb00411a";
server.getTransaction(transactionHash).then((tx) => {
  console.log("status:", tx.status);
  console.log("envelopeXdr:", tx.envelopeXdr);
  console.log("resultMetaXdr:", tx.resultMetaXdr);
  console.log("resultXdr:", tx.resultXdr);
});
```

**See also**

- `getTransaction docs`

**Source:** [src/rpc/server.ts:757](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L757)

### `server.getTransactions(request)`

Fetch transactions starting from a given start ledger or a cursor. The end ledger is the latest ledger
in that RPC instance.

```ts
getTransactions(request: GetTransactionsRequest): Promise<GetTransactionsResponse>;
```

**Parameters**

- **`request`** — `GetTransactionsRequest` (required) — The request parameters.

**Returns**

- A promise that resolves to the transactions response.

**Example**

```ts
server.getTransactions({
  startLedger: 10000,
  limit: 10,
}).then((response) => {
  console.log("Transactions:", response.transactions);
  console.log("Latest Ledger:", response.latestLedger);
  console.log("Cursor:", response.cursor);
});
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getTransactions

**Source:** [src/rpc/server.ts:817](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L817)

### `server.getTrustline(account, asset)`

**Deprecated.** Use `getAssetBalance`, instead

Fetch the full trustline entry for a Stellar account.

```ts
getTrustline(account: string, asset: Asset): Promise<TrustLineEntry>;
```

**Parameters**

- **`account`** — `string` (required) — The public address of the account whose trustline it is
- **`asset`** — `Asset` (required) — The trustline's asset

**Returns**

Resolves to the full on-chain trustline
   entry

**Example**

```ts
const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
const asset = new Asset(
 "USDC",
 "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
);
server.getTrustline(accountId, asset).then((entry) => {
  console.log(`{asset.toString()} balance for ${accountId}:", entry.balance().toString());
});
```

**See also**

- `getLedgerEntries docs`

**Source:** [src/rpc/server.ts:265](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L265)

### `server.getVersionInfo()`

Provides information about the current version details of the Soroban RPC and captive-core

```ts
getVersionInfo(): Promise<GetVersionInfoResponse>;
```

**Returns**

the version info

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getVersionInfo

**Source:** [src/rpc/server.ts:1377](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L1377)

### `server.pollTransaction(hash, opts)`

Poll for a particular transaction with certain parameters.

After submitting a transaction, clients can use this to poll for
transaction completion and return a definitive state of success or failure.

```ts
pollTransaction(hash: string, opts?: PollingOptions): Promise<GetTransactionResponse>;
```

**Parameters**

- **`hash`** — `string` (required) — the transaction you're polling for
- **`opts`** — `PollingOptions` (optional) — (optional) polling options
    - `attempts` (optional): (optional) the number of attempts to make
     before returning the last-seen status. By default or on invalid inputs,
     try 5 times.
    - `sleepStrategy` (optional): (optional) the amount of time
     to wait for between each attempt. By default, sleep for 1 second between
     each attempt.

**Returns**

the response after a "found"
   response (which may be success or failure) or the last response obtained
   after polling the maximum number of specified attempts.

**Example**

```ts
const h = "c4515e3bdc0897f21cc5dbec8c82cf0a936d4741cb74a8e158eb51b9fb00411a";
const txStatus = await server.pollTransaction(h, {
   attempts: 100, // I'm a maniac
   sleepStrategy: rpc.LinearSleepStrategy
}); // this will take 5,050 seconds to complete
```

**Source:** [src/rpc/server.ts:710](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L710)

### `server.prepareTransaction(tx)`

Submit a trial contract invocation, first run a simulation of the contract
invocation as defined on the incoming transaction, and apply the results to
a new copy of the transaction which is then returned. Setting the ledger
footprint and authorization, so the resulting transaction is ready for
signing & sending.

The returned transaction will also have an updated fee that is the sum of
fee set on incoming transaction with the contract resource fees estimated
from simulation. It is advisable to check the fee on returned transaction
and validate or take appropriate measures for interaction with user to
confirm it is acceptable.

You can call the `rpc.Server.simulateTransaction` method
directly first if you want to inspect estimated fees for a given
transaction in detail first, then re-assemble it manually or via
`rpc.assembleTransaction`.

```ts
prepareTransaction(tx: Transaction | FeeBumpTransaction): Promise<Transaction>;
```

**Parameters**

- **`tx`** — `Transaction | FeeBumpTransaction` (required) — the transaction to
     prepare. It should include exactly one operation, which must be one of
     `xdr.InvokeHostFunctionOp`, `xdr.ExtendFootprintTtlOp`,
     or `xdr.RestoreFootprintOp`.
  
     Any provided footprint will be overwritten. However, if your operation
     has existing auth entries, they will be preferred over ALL auth entries
     from the simulation. In other words, if you include auth entries, you
     don't care about the auth returned from the simulation. Other fields
     (footprint, etc.) will be filled as normal.

**Returns**

A copy of the
   transaction with the expected authorizations (in the case of
   invocation), resources, and ledger footprints added. The transaction fee
   will also automatically be padded with the contract's minimum resource
   fees discovered from the simulation.

**Throws**

- *    If simulation fails

**Example**

```ts
const contractId = 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE';
const contract = new StellarSdk.Contract(contractId);

// Right now, this is just the default fee for this example.
const fee = StellarSdk.BASE_FEE;
const transaction = new StellarSdk.TransactionBuilder(account, { fee })
  // Uncomment the following line to build transactions for the live network. Be
  // sure to also change the horizon hostname.
  //.setNetworkPassphrase(StellarSdk.Networks.PUBLIC)
  .setNetworkPassphrase(StellarSdk.Networks.FUTURENET)
  .setTimeout(30) // valid for the next 30s
  // Add an operation to call increment() on the contract
  .addOperation(contract.call("increment"))
  .build();

const preparedTransaction = await server.prepareTransaction(transaction);

// Sign this transaction with the secret key
// NOTE: signing is transaction is network specific. Test network transactions
// won't work in the public network. To switch networks, use the Network object
// as explained above (look for StellarSdk.Network).
const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
preparedTransaction.sign(sourceKeypair);

server.sendTransaction(transaction).then(result => {
  console.log("hash:", result.hash);
  console.log("status:", result.status);
  console.log("errorResultXdr:", result.errorResultXdr);
});
```

**See also**

- - module:rpc.assembleTransaction
 - `simulateTransaction docs`

**Source:** [src/rpc/server.ts:1133](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L1133)

### `server.requestAirdrop(address, friendbotUrl)`

**Deprecated.** Use `Server.fundAddress` instead, which supports both
   account (G...) and contract (C...) addresses.

Fund a new account using the network's Friendbot faucet, if any.

```ts
requestAirdrop(address: string | Pick<Account, "accountId">, friendbotUrl?: string): Promise<Account>;
```

**Parameters**

- **`address`** — `string | Pick<Account, "accountId">` (required) — The address or account instance that we
     want to create and fund with Friendbot
- **`friendbotUrl`** — `string` (optional) — (optional) Optionally, an explicit address for
     friendbot (by default: this calls the Soroban RPC
     `getNetwork` method to try to
     discover this network's Friendbot url).

**Returns**

An `Account` object for the created
   account, or the existing account if it's already funded with the
   populated sequence number (note that the account will not be "topped
   off" if it already exists)

**Throws**

- If Friendbot is not configured on this network or request failure

**Example**

```ts
server
   .requestAirdrop("GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4")
   .then((accountCreated) => {
     console.log("accountCreated:", accountCreated);
   }).catch((error) => {
     console.error("error:", error);
   });
```

**See also**

- - `Friendbot docs`
 - `Friendbot.Api.Response`

**Source:** [src/rpc/server.ts:1239](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L1239)

### `server.sendTransaction(transaction)`

Submit a real transaction to the Stellar network.

Unlike Horizon, RPC does not wait for transaction completion. It
simply validates the transaction and enqueues it. Clients should call
`rpc.Server.getTransaction` to learn about transaction
success/failure.

```ts
sendTransaction(transaction: Transaction | FeeBumpTransaction): Promise<SendTransactionResponse>;
```

**Parameters**

- **`transaction`** — `Transaction | FeeBumpTransaction` (required) — to submit

**Returns**

the
   transaction id, status, and any error if available

**Example**

```ts
const contractId = 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE';
const contract = new StellarSdk.Contract(contractId);

// Right now, this is just the default fee for this example.
const fee = StellarSdk.BASE_FEE;
const transaction = new StellarSdk.TransactionBuilder(account, { fee })
  // Uncomment the following line to build transactions for the live network. Be
  // sure to also change the horizon hostname.
  //.setNetworkPassphrase(StellarSdk.Networks.PUBLIC)
  .setNetworkPassphrase(StellarSdk.Networks.FUTURENET)
  .setTimeout(30) // valid for the next 30s
  // Add an operation to call increment() on the contract
  .addOperation(contract.call("increment"))
  .build();

// Sign this transaction with the secret key
// NOTE: signing is transaction is network specific. Test network transactions
// won't work in the public network. To switch networks, use the Network object
// as explained above (look for StellarSdk.Network).
const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
transaction.sign(sourceKeypair);

server.sendTransaction(transaction).then((result) => {
  console.log("hash:", result.hash);
  console.log("status:", result.status);
  console.log("errorResultXdr:", result.errorResultXdr);
});
```

**See also**

- - `transaction docs`
 - `sendTransaction docs`

**Source:** [src/rpc/server.ts:1188](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L1188)

### `server.simulateTransaction(tx, addlResources, authMode)`

Submit a trial contract invocation to get back return values, expected
ledger footprint, expected authorizations, and expected costs.

```ts
simulateTransaction(tx: Transaction | FeeBumpTransaction, addlResources?: ResourceLeeway, authMode?: SimulationAuthMode): Promise<SimulateTransactionResponse>;
```

**Parameters**

- **`tx`** — `Transaction | FeeBumpTransaction` (required) — the transaction to simulate,
     which should include exactly one operation (one of
     `xdr.InvokeHostFunctionOp`, `xdr.ExtendFootprintTtlOp`, or
     `xdr.RestoreFootprintOp`). Any provided footprint or auth
     information will be ignored.
- **`addlResources`** — `ResourceLeeway` (optional) — (optional) any additional resources
     to add to the simulation-provided ones, for example if you know you will
     need extra CPU instructions
- **`authMode`** — `SimulationAuthMode` (optional) — (optional) optionally, specify the type of
     auth mode to use for simulation: `enforce` for enforcement mode,
     `record` for recording mode, or `record_allow_nonroot` for recording
     mode that allows non-root authorization

**Returns**

An object with the
   cost, footprint, result/auth requirements (if applicable), and error of
   the transaction

**Example**

```ts
const contractId = 'CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE';
const contract = new StellarSdk.Contract(contractId);

// Right now, this is just the default fee for this example.
const fee = StellarSdk.BASE_FEE;
const transaction = new StellarSdk.TransactionBuilder(account, { fee })
  // Uncomment the following line to build transactions for the live network. Be
  // sure to also change the horizon hostname.
  //.setNetworkPassphrase(StellarSdk.Networks.PUBLIC)
  .setNetworkPassphrase(StellarSdk.Networks.FUTURENET)
  .setTimeout(30) // valid for the next 30s
  // Add an operation to call increment() on the contract
  .addOperation(contract.call("increment"))
  .build();

server.simulateTransaction(transaction).then((sim) => {
  console.log("cost:", sim.cost);
  console.log("result:", sim.result);
  console.log("error:", sim.error);
  console.log("latestLedger:", sim.latestLedger);
});
```

**See also**

- - `transaction docs`
 - `simulateTransaction docs`
 - `authorization modes`
 - module:rpc.Server#prepareTransaction
 - module:rpc.assembleTransaction

**Source:** [src/rpc/server.ts:1031](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L1031)

## rpc.Server.GetEventsRequest

**Deprecated.** Use `Api.GetEventsRequest` instead.

```ts
type GetEventsRequest = Api.GetEventsRequest
```

**See also**

- `Api.GetEventsRequest`

**Source:** [src/rpc/server.ts:58](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L58)

## rpc.Server.Options

Options for configuring connections to RPC servers.

```ts
interface Options {
  allowHttp?: boolean;
  headers?: Record<string, string>;
  timeout?: number;
}
```

**Source:** [src/rpc/server.ts:76](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L76)

### `options.allowHttp`

Allow connecting to http servers, default: `false`. This must be set to false in production deployments!

```ts
allowHttp?: boolean;
```

**Source:** [src/rpc/server.ts:78](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L78)

### `options.headers`

Additional headers that should be added to any requests to the RPC server.

```ts
headers?: Record<string, string>;
```

**Source:** [src/rpc/server.ts:82](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L82)

### `options.timeout`

Allow a timeout, default: 0. Allows user to avoid nasty lag.

```ts
timeout?: number;
```

**Source:** [src/rpc/server.ts:80](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L80)

## rpc.Server.PollingOptions

```ts
interface PollingOptions {
  attempts?: number;
  sleepStrategy?: SleepStrategy;
}
```

**Source:** [src/rpc/server.ts:60](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L60)

### `pollingOptions.attempts`

```ts
attempts?: number;
```

**Source:** [src/rpc/server.ts:61](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L61)

### `pollingOptions.sleepStrategy`

```ts
sleepStrategy?: SleepStrategy;
```

**Source:** [src/rpc/server.ts:62](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L62)

## rpc.Server.ResourceLeeway

Describes additional resource leeways for transaction simulation.

```ts
interface ResourceLeeway {
  cpuInstructions: number;
}
```

**Source:** [src/rpc/server.ts:68](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L68)

### `resourceLeeway.cpuInstructions`

Simulate the transaction with more CPU instructions available.

```ts
cpuInstructions: number;
```

**Source:** [src/rpc/server.ts:70](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/server.ts#L70)

## rpc.assembleTransaction

Combines the given raw transaction alongside the simulation results.
If the given transaction already has authorization entries in a host
function invocation (see `Operation.invokeHostFunction`), **the
simulation entries are ignored**.

If the given transaction already has authorization entries in a host function
invocation (see `Operation.invokeHostFunction`), **the simulation
entries are ignored**.

```ts
assembleTransaction(raw: Transaction | FeeBumpTransaction, simulation: SimulateTransactionResponse | RawSimulateTransactionResponse): TransactionBuilder
```

**Parameters**

- **`raw`** — `Transaction | FeeBumpTransaction` (required) — the initial transaction, w/o simulation applied
- **`simulation`** — `SimulateTransactionResponse | RawSimulateTransactionResponse` (required) — the Soroban RPC simulation result (see `rpc.Server.simulateTransaction`)

**Returns**

a new, cloned transaction with the proper auth and resource (fee, footprint) simulation data applied

**See also**

- - `rpc.Server.simulateTransaction`
 - `rpc.Server.prepareTransaction`

**Source:** [src/rpc/transaction.ts:44](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/transaction.ts#L44)

## rpc.parseRawEvents

Parse and return the retrieved events, if any, from a raw response from a
RPC server.

```ts
parseRawEvents(raw: RawGetEventsResponse): GetEventsResponse
```

**Parameters**

- **`raw`** — `RawGetEventsResponse` (required) — the raw `getEvents` response from the
     RPC server to parse

**Returns**

events parsed from the RPC server's
   response

**Source:** [src/rpc/parsers.ts:96](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/parsers.ts#L96)

## rpc.parseRawSimulation

Converts a raw response schema into one with parsed XDR fields and a simplified interface.

**Warning:** This API is only exported for testing purposes and should not be relied on or considered "stable".

```ts
parseRawSimulation(sim: SimulateTransactionResponse | RawSimulateTransactionResponse): SimulateTransactionResponse
```

**Parameters**

- **`sim`** — `SimulateTransactionResponse | RawSimulateTransactionResponse` (required) — the raw response schema (parsed ones are allowed, best-effort
     detected, and returned untouched)

**Returns**

the original parameter (if already parsed), parsed otherwise

**Source:** [src/rpc/parsers.ts:236](https://github.com/stellar/js-stellar-sdk/blob/master/src/rpc/parsers.ts#L236)
