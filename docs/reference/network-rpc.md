---
title: Network / RPC
category: Network / RPC
---

# Network / RPC

## rpc.Api.BalanceResponse

```ts
interface BalanceResponse
```

**Source:** [src/rpc/api.ts:586](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L586)

## rpc.Api.BaseSendTransactionResponse

```ts
interface BaseSendTransactionResponse
```

**Source:** [src/rpc/api.ts:376](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L376)

## rpc.Api.BaseSimulateTransactionResponse

```ts
interface BaseSimulateTransactionResponse
```

**Source:** [src/rpc/api.ts:410](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L410)

## rpc.Api.EventFilter

```ts
interface EventFilter
```

**Source:** [src/rpc/api.ts:228](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L228)

## rpc.Api.EventResponse

```ts
interface EventResponse extends BaseEventResponse
```

**Source:** [src/rpc/api.ts:304](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L304)

## rpc.Api.EventType

```ts
type EventType = "contract" | "system"
```

**Source:** [src/rpc/api.ts:226](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L226)

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

- {@link getEvents API reference}

**Source:** [src/rpc/api.ts:283](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L283)

## rpc.Api.GetEventsResponse

```ts
interface GetEventsResponse extends RetentionState
```

**Source:** [src/rpc/api.ts:299](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L299)

## rpc.Api.GetFailedTransactionResponse

```ts
interface GetFailedTransactionResponse extends GetAnyTransactionResponse
```

**Source:** [src/rpc/api.ts:97](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L97)

## rpc.Api.GetFeeStatsResponse

```ts
interface GetFeeStatsResponse
```

**Source:** [src/rpc/api.ts:560](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L560)

## rpc.Api.GetHealthResponse

```ts
interface GetHealthResponse
```

**Source:** [src/rpc/api.ts:5](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L5)

## rpc.Api.GetLatestLedgerResponse

```ts
interface GetLatestLedgerResponse
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLatestLedger

**Source:** [src/rpc/api.ts:52](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L52)

## rpc.Api.GetLedgerEntriesResponse

An XDR-parsed version of {@link RawLedgerEntryResult}

```ts
interface GetLedgerEntriesResponse
```

**Source:** [src/rpc/api.ts:33](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L33)

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

- {@link getLedgers API reference}

**Source:** [src/rpc/api.ts:633](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L633)

## rpc.Api.GetLedgersResponse

```ts
interface GetLedgersResponse
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgers

**Source:** [src/rpc/api.ts:669](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L669)

## rpc.Api.GetMissingTransactionResponse

```ts
interface GetMissingTransactionResponse extends GetAnyTransactionResponse
```

**Source:** [src/rpc/api.ts:93](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L93)

## rpc.Api.GetNetworkResponse

```ts
interface GetNetworkResponse
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getNetwork

**Source:** [src/rpc/api.ts:45](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L45)

## rpc.Api.GetSuccessfulTransactionResponse

```ts
interface GetSuccessfulTransactionResponse extends GetAnyTransactionResponse
```

**Source:** [src/rpc/api.ts:111](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L111)

## rpc.Api.GetTransactionResponse

```ts
type GetTransactionResponse = GetSuccessfulTransactionResponse | GetFailedTransactionResponse | GetMissingTransactionResponse
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getTransaction

**Source:** [src/rpc/api.ts:79](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L79)

## rpc.Api.GetTransactionStatus

```ts
enum GetTransactionStatus
```

**Source:** [src/rpc/api.ts:72](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L72)

## rpc.Api.GetTransactionsRequest

```ts
type GetTransactionsRequest = { pagination?: { cursor?: never; limit?: number }; startLedger: number } | { pagination: { cursor: string; limit?: number }; startLedger?: never }
```

**Source:** [src/rpc/api.ts:149](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L149)

## rpc.Api.GetTransactionsResponse

```ts
interface GetTransactionsResponse
```

**Source:** [src/rpc/api.ts:208](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L208)

## rpc.Api.GetVersionInfoResponse

```ts
interface GetVersionInfoResponse
```

**Source:** [src/rpc/api.ts:543](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L543)

## rpc.Api.LedgerEntryChange

```ts
interface LedgerEntryChange
```

**Source:** [src/rpc/api.ts:342](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L342)

## rpc.Api.LedgerEntryResult

```ts
interface LedgerEntryResult
```

**Source:** [src/rpc/api.ts:12](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L12)

## rpc.Api.LedgerResponse

```ts
interface LedgerResponse
```

**Source:** [src/rpc/api.ts:687](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L687)

## rpc.Api.RawEventResponse

```ts
interface RawEventResponse extends BaseEventResponse
```

**Source:** [src/rpc/api.ts:326](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L326)

## rpc.Api.RawGetEventsResponse

```ts
interface RawGetEventsResponse extends RetentionState
```

**Source:** [src/rpc/api.ts:310](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L310)

## rpc.Api.RawGetLatestLedgerResponse

```ts
interface RawGetLatestLedgerResponse
```

**Source:** [src/rpc/api.ts:61](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L61)

## rpc.Api.RawGetLedgerEntriesResponse

```ts
interface RawGetLedgerEntriesResponse
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/getLedgerEntries

**Source:** [src/rpc/api.ts:39](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L39)

## rpc.Api.RawGetLedgersResponse

```ts
interface RawGetLedgersResponse
```

**Source:** [src/rpc/api.ts:678](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L678)

## rpc.Api.RawGetTransactionResponse

```ts
interface RawGetTransactionResponse
```

**Source:** [src/rpc/api.ts:127](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L127)

## rpc.Api.RawGetTransactionsResponse

```ts
interface RawGetTransactionsResponse
```

**Source:** [src/rpc/api.ts:217](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L217)

## rpc.Api.RawLedgerEntryResult

```ts
interface RawLedgerEntryResult
```

**Source:** [src/rpc/api.ts:19](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L19)

## rpc.Api.RawLedgerResponse

```ts
interface RawLedgerResponse
```

**Source:** [src/rpc/api.ts:695](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L695)

## rpc.Api.RawSendTransactionResponse

```ts
interface RawSendTransactionResponse extends BaseSendTransactionResponse
```

**Source:** [src/rpc/api.ts:360](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L360)

## rpc.Api.RawSimulateTransactionResponse

```ts
interface RawSimulateTransactionResponse
```

**See also**

- https://developers.stellar.org/docs/data/rpc/api-reference/methods/simulateTransaction

**Source:** [src/rpc/api.ts:519](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L519)

## rpc.Api.RawTransactionEvents

```ts
interface RawTransactionEvents
```

**Source:** [src/rpc/api.ts:165](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L165)

## rpc.Api.RawTransactionInfo

```ts
interface RawTransactionInfo
```

**Source:** [src/rpc/api.ts:170](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L170)

## rpc.Api.SendTransactionResponse

```ts
interface SendTransactionResponse extends BaseSendTransactionResponse
```

**Source:** [src/rpc/api.ts:355](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L355)

## rpc.Api.SendTransactionStatus

```ts
type SendTransactionStatus = "PENDING" | "DUPLICATE" | "TRY_AGAIN_LATER" | "ERROR"
```

**Source:** [src/rpc/api.ts:349](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L349)

## rpc.Api.SimulateHostFunctionResult

```ts
interface SimulateHostFunctionResult
```

**Source:** [src/rpc/api.ts:383](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L383)

## rpc.Api.SimulateTransactionErrorResponse

Includes details about why the simulation failed

```ts
interface SimulateTransactionErrorResponse extends BaseSimulateTransactionResponse
```

**Source:** [src/rpc/api.ts:441](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L441)

## rpc.Api.SimulateTransactionResponse

Simplifies {@link RawSimulateTransactionResponse} into separate interfaces
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

**Source:** [src/rpc/api.ts:405](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L405)

## rpc.Api.SimulateTransactionRestoreResponse

Includes simplified fields only present on success.

```ts
interface SimulateTransactionRestoreResponse extends SimulateTransactionSuccessResponse
```

**Source:** [src/rpc/api.ts:446](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L446)

## rpc.Api.SimulateTransactionSuccessResponse

Includes simplified fields only present on success.

```ts
interface SimulateTransactionSuccessResponse extends BaseSimulateTransactionResponse
```

**Source:** [src/rpc/api.ts:429](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L429)

## rpc.Api.SimulationAuthMode

```ts
type SimulationAuthMode = "enforce" | "record" | "record_allow_nonroot"
```

**Source:** [src/rpc/api.ts:388](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L388)

## rpc.Api.TransactionEvents

```ts
interface TransactionEvents
```

**Source:** [src/rpc/api.ts:186](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L186)

## rpc.Api.TransactionInfo

```ts
interface TransactionInfo
```

**Source:** [src/rpc/api.ts:191](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L191)

## rpc.Api.isSimulationError

Checks if a simulation response indicates an error.

```ts
isSimulationError(sim: SimulateTransactionResponse): sim is SimulateTransactionErrorResponse
```

**Parameters**

- `sim` — The simulation response to check.

**Returns**

True if the response indicates an error, false otherwise.

**Source:** [src/rpc/api.ts:468](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L468)

## rpc.Api.isSimulationRaw

Checks if a simulation response is in raw (unparsed) form.

```ts
isSimulationRaw(sim: SimulateTransactionResponse | RawSimulateTransactionResponse): sim is RawSimulateTransactionResponse
```

**Parameters**

- `sim` — The simulation response to check.

**Returns**

True if the response is raw, false otherwise.

**Source:** [src/rpc/api.ts:505](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L505)

## rpc.Api.isSimulationRestore

Checks if a simulation response indicates that a restoration is needed.

```ts
isSimulationRestore(sim: SimulateTransactionResponse): sim is SimulateTransactionRestoreResponse
```

**Parameters**

- `sim` — The simulation response to check.

**Returns**

True if the response indicates a restoration is needed, false otherwise.

**Source:** [src/rpc/api.ts:490](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L490)

## rpc.Api.isSimulationSuccess

Checks if a simulation response indicates success.

```ts
isSimulationSuccess(sim: SimulateTransactionResponse): sim is SimulateTransactionSuccessResponse
```

**Parameters**

- `sim` — The simulation response to check.

**Returns**

True if the response indicates success, false otherwise.

**Source:** [src/rpc/api.ts:479](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/api.ts#L479)

## rpc.BasicSleepStrategy

```ts
const BasicSleepStrategy: SleepStrategy
```

**Source:** [src/rpc/server.ts:90](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/server.ts#L90)

## rpc.Durability

Specifies the durability namespace of contract-related ledger entries.

```ts
enum Durability
```

**See also**

- - {@link State Archival docs}
 - {@link Rust SDK Storage docs}

**Source:** [src/rpc/server.ts:48](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/server.ts#L48)

## rpc.LinearSleepStrategy

```ts
const LinearSleepStrategy: SleepStrategy
```

**Source:** [src/rpc/server.ts:93](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/server.ts#L93)

## rpc.Server

Handles the network connection to a Soroban RPC instance, exposing an
interface for requests to that instance.

```ts
class Server
```

**See also**

- {@link API reference docs}

**Source:** [src/rpc/server.ts:53](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/server.ts#L53)

## rpc.Server.GetEventsRequest

**Deprecated.** Use `Api.GetEventsRequest` instead.

```ts
type GetEventsRequest = Api.GetEventsRequest
```

**See also**

- {@link Api.GetEventsRequest}

**Source:** [src/rpc/server.ts:58](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/server.ts#L58)

## rpc.Server.Options

Options for configuring connections to RPC servers.

```ts
interface Options
```

**Source:** [src/rpc/server.ts:76](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/server.ts#L76)

## rpc.Server.PollingOptions

```ts
interface PollingOptions
```

**Source:** [src/rpc/server.ts:60](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/server.ts#L60)

## rpc.Server.ResourceLeeway

Describes additional resource leeways for transaction simulation.

```ts
interface ResourceLeeway
```

**Source:** [src/rpc/server.ts:68](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/server.ts#L68)

## rpc.assembleTransaction

Combines the given raw transaction alongside the simulation results.
If the given transaction already has authorization entries in a host
function invocation (see {@link Operation.invokeHostFunction}), **the
simulation entries are ignored**.

If the given transaction already has authorization entries in a host function
invocation (see {@link Operation.invokeHostFunction}), **the simulation
entries are ignored**.

```ts
assembleTransaction(raw: Transaction | FeeBumpTransaction, simulation: SimulateTransactionResponse | RawSimulateTransactionResponse): TransactionBuilder
```

**Parameters**

- `raw` — the initial transaction, w/o simulation applied
- `simulation` — the Soroban RPC simulation result (see {@link rpc.Server.simulateTransaction})

**Returns**

a new, cloned transaction with the proper auth and resource (fee, footprint) simulation data applied

**See also**

- - {@link rpc.Server.simulateTransaction}
 - {@link rpc.Server.prepareTransaction}

**Source:** [src/rpc/transaction.ts:44](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/transaction.ts#L44)

## rpc.parseRawEvents

Parse and return the retrieved events, if any, from a raw response from a
RPC server.

```ts
parseRawEvents(raw: RawGetEventsResponse): GetEventsResponse
```

**Parameters**

- `raw` — the raw `getEvents` response from the
   RPC server to parse

**Returns**

events parsed from the RPC server's
   response

**Source:** [src/rpc/parsers.ts:96](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/parsers.ts#L96)

## rpc.parseRawSimulation

Converts a raw response schema into one with parsed XDR fields and a simplified interface.

**Warning:** This API is only exported for testing purposes and should not be relied on or considered "stable".

```ts
parseRawSimulation(sim: SimulateTransactionResponse | RawSimulateTransactionResponse): SimulateTransactionResponse
```

**Parameters**

- `sim` — the raw response schema (parsed ones are allowed, best-effort
   detected, and returned untouched)

**Returns**

the original parameter (if already parsed), parsed otherwise

**Source:** [src/rpc/parsers.ts:236](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/rpc/parsers.ts#L236)
