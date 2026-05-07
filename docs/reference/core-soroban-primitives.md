---
title: Core / Soroban Primitives
category: Core / Soroban Primitives
---

# Core / Soroban Primitives

## Address

```ts
class Address
```

**Source:** [src/base/address.ts:20](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/address.ts#L20)

## AuthorizeInvocationParams

This builds an entry from scratch, allowing you to express authorization as a
function of:
  - a particular identity (i.e. signing {@link Keypair} or other signer)
  - approving the execution of an invocation tree (i.e. a simulation-acquired
    {@link xdr.SorobanAuthorizedInvocation} or otherwise built)
  - on a particular network (uniquely identified by its passphrase, see
    {@link Networks})
  - until a particular ledger sequence is reached.

This is in contrast to {@link authorizeEntry}, which signs an existing entry.

```ts
interface AuthorizeInvocationParams
```

**See also**

- authorizeEntry

**Source:** [src/base/auth.ts:231](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/auth.ts#L231)

## Contract

Create a new Contract object.

`Contract` represents a single contract in the Stellar network, embodying the
interface of the contract. See
[Contracts](https://soroban.stellar.org/docs/learn/interacting-with-contracts)
for more information about how contracts work in Stellar.

```ts
class Contract
```

**Source:** [src/base/contract.ts:14](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/contract.ts#L14)

## CreateInvocation

Details about a contract creation invocation.

- `type` indicates if this creation was a custom contract (`'wasm'`) or a
  wrapping of an existing Stellar asset (`'sac'`)
- `asset` is set when `type=='sac'`, containing the canonical {@link Asset}
  being wrapped by this Stellar Asset Contract
- `wasm` is set when `type=='wasm'`, containing additional creation parameters

```ts
interface CreateInvocation
```

**Source:** [src/base/invocation.ts:23](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/invocation.ts#L23)

## ExecuteInvocation

Details about a contract function execution invocation.

- `source` is the strkey of the contract (`C...`) being invoked
- `function` is the name of the function being invoked
- `args` are the natively-represented parameters to the function invocation
  (see {@link scValToNative} for rules on how they're represented as JS types)

```ts
interface ExecuteInvocation
```

**Source:** [src/base/invocation.ts:37](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/invocation.ts#L37)

## IntLike

```ts
type IntLike = bigint | number | string
```

**Source:** [src/base/sorobandata_builder.ts:3](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/sorobandata_builder.ts#L3)

## InvocationTree

A node in the invocation tree.

- `type` is the type of invocation occurring, either contract creation or
  host function execution
- `args` are the parameters to the invocation, depending on the type
- `invocations` are any sub-invocations that may occur as a result of this
  invocation (i.e. a tree of call stacks)

```ts
interface InvocationTree
```

**Source:** [src/base/invocation.ts:53](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/invocation.ts#L53)

## InvocationWalker

A callback used when walking an invocation tree.

Returning exactly `false` is a hint to stop exploring deeper from this node;
other return values are ignored.

```ts
type InvocationWalker = (node: xdr.SorobanAuthorizedInvocation, depth: number, parent?: xdr.SorobanAuthorizedInvocation) => boolean | null | void
```

**Source:** [src/base/invocation.ts:71](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/invocation.ts#L71)

## NativeToScValOpts

```ts
interface NativeToScValOpts
```

**Source:** [src/base/scval.ts:18](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/scval.ts#L18)

## SigningCallback

A callback for signing an XDR structure representing all of the details
necessary to authorize an invocation tree.

```ts
type SigningCallback = (preimage: xdr.HashIdPreimage) => Promise<BufferLike | { publicKey: string; signature: BufferLike }>
```

**Source:** [src/base/auth.ts:35](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/auth.ts#L35)

## Soroban

Helper class to assist with formatting and parsing token amounts.

```ts
class Soroban
```

**Source:** [src/base/soroban.ts:2](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/soroban.ts#L2)

## SorobanDataBuilder

Supports building {@link xdr.SorobanTransactionData} structures with various
items set to specific values.

This is recommended for when you are building
{@link Operation.extendFootprintTtl} / {@link Operation.restoreFootprint}
operations and need to {@link TransactionBuilder.setSorobanData} to avoid
(re)building the entire data structure from scratch.

```ts
class SorobanDataBuilder
```

**Example**

```ts
// You want to use an existing data blob but override specific parts.
const newData = new SorobanDataBuilder(existing)
  .setReadOnly(someLedgerKeys)
  .setResourceFee("1000")
  .build();

// You want an instance from scratch
const newData = new SorobanDataBuilder()
  .setFootprint([someLedgerKey], [])
  .setResourceFee("1000")
  .build();
```

**Source:** [src/base/sorobandata_builder.ts:29](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/sorobandata_builder.ts#L29)

## WasmCreateDetails

```ts
interface WasmCreateDetails
```

**Source:** [src/base/invocation.ts:6](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/invocation.ts#L6)

## authorizeEntry

Actually authorizes an existing authorization entry using the given
credentials and expiration details, returning a signed copy.

This "fills out" the authorization entry with a signature, indicating to the
{@link Operation.invokeHostFunction} its attached to that:
  - a particular identity (i.e. signing {@link Keypair} or other signer)
  - approving the execution of an invocation tree (i.e. a simulation-acquired
    {@link xdr.SorobanAuthorizedInvocation} or otherwise built)
  - on a particular network (uniquely identified by its passphrase, see
    {@link Networks})
  - until a particular ledger sequence is reached.

This one lets you pass either a {@link Keypair} (or, more accurately,
anything with a `sign(Buffer): Buffer` method) or a callback function (see
{@link SigningCallback}) to handle signing the envelope hash.

```ts
authorizeEntry(entry: SorobanAuthorizationEntry, signer: Keypair | SigningCallback, validUntilLedgerSeq: number, networkPassphrase: string): Promise<SorobanAuthorizationEntry>
```

**Parameters**

- `entry` — an unsigned authorization entry
- `signer` — either a {@link Keypair} instance or a function which takes a
   {@link xdr.HashIdPreimageSorobanAuthorization} input payload and returns
   EITHER

     (a) an object containing a `signature` of the hash of the raw payload
         bytes as a Buffer-like and a `publicKey` string representing who just
         created this signature, or
     (b) just the naked signature of the hash of the raw payload bytes (where
         the signing key is implied to be the address in the `entry`).

   The latter option (b) is JUST for backwards compatibility and will be
   removed in the future.
- `validUntilLedgerSeq` — the (exclusive) future ledger sequence number
   until which this authorization entry should be valid (if
   `currentLedgerSeq==validUntil`, this is expired)
- `networkPassphrase` — the network passphrase is incorporated into the
   signature (see {@link Networks} for options)

If using the `SigningCallback` variation, the signer is assumed to be
the entry's credential address unless you use the variant that returns
the object.

**Example**

```ts
import {
  SorobanRpc,
  Transaction,
  Networks,
  authorizeEntry
} from '@stellar/stellar-sdk';

// Assume signPayloadCallback is a well-formed signing callback.
//
// It might, for example, pop up a modal from a browser extension, send the
// transaction to a third-party service for signing, or just do simple
// signing via Keypair like it does here:
function signPayloadCallback(payload) {
   return signer.sign(hash(payload.toXDR()));
}

function multiPartyAuth(
   server: SorobanRpc.Server,
   // assume this involves multi-party auth
   tx: Transaction,
) {
   return server
     .simulateTransaction(tx)
     .then((simResult) => {
         tx.operations[0].auth.map(entry =>
           authorizeEntry(
             entry,
             signPayloadCallback,
             currentLedger + 1000,
             Networks.TESTNET)
         );

         return server.prepareTransaction(tx, simResult);
     })
     .then((preppedTx) => {
       preppedTx.sign(source);
       return server.sendTransaction(preppedTx);
     });
}
```

**See also**

- authorizeInvocation

**Source:** [src/base/auth.ts:123](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/auth.ts#L123)

## authorizeInvocation

```ts
authorizeInvocation(params: AuthorizeInvocationParams): Promise<SorobanAuthorizationEntry>
```

**Source:** [src/base/auth.ts:239](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/auth.ts#L239)

## buildInvocationTree

Turns a raw invocation tree into a human-readable format.

This is designed to make the invocation tree easier to understand in order to
inform users about the side-effects of their contract calls. This will help
make informed decisions about whether or not a particular invocation will
result in what you expect it to.

```ts
buildInvocationTree(root: SorobanAuthorizedInvocation): InvocationTree
```

**Parameters**

- `root` — the raw XDR of the invocation,
   likely acquired from transaction simulation. this is either from the
   {@link Operation.invokeHostFunction} itself (the `func` field), or from
   the authorization entries ({@link xdr.SorobanAuthorizationEntry}, the
   `rootInvocation` field)

**Example**

Here, we show a browser modal after simulating an arbitrary transaction,
`tx`, which we assume has an `Operation.invokeHostFunction` inside of it:

```ts
import { Server, buildInvocationTree } from '@stellar/stellar-sdk';

const s = new Server("fill in accordingly");

s.simulateTransaction(tx).then(
 (resp: SorobanRpc.SimulateTransactionResponse) => {
   if (SorobanRpc.isSuccessfulSim(resp) && resp.result) {
     // bold assumption: there's a valid result with an auth entry
     const auth = resp.result.auth;
     if (auth && auth.length > 0) {
       alert(
         "You are authorizing the following invocation:\n" +
         JSON.stringify(
           buildInvocationTree(auth[0].rootInvocation()),
           null,
           2
         )
       );
     }
   }
 }
);
```

**Source:** [src/base/invocation.ts:120](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/invocation.ts#L120)

## humanizeEvents

Converts raw diagnostic or contract events into something with a flatter,
human-readable, and understandable structure.

Each element in the returned list has the following properties:
 - `type`: one of `'system'`, `'contract'`, `'diagnostic'`
 - `contractId`: optionally, a `C...` encoded strkey
 - `topics`: a list of {@link scValToNative} invocations on the topics
 - `data`: a {@link scValToNative} invocation on the raw event data

```ts
humanizeEvents(events: ContractEvent[] | DiagnosticEvent[]): SorobanEvent[]
```

**Parameters**

- `events` — either contract events or diagnostic events to parse into a
   friendly format

**Source:** [src/base/events.ts:48](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/events.ts#L48)

## nativeToScVal

Attempts to convert native types into smart contract values
({@link xdr.ScVal}).

Provides conversions from smart contract XDR values ({@link xdr.ScVal}) to
native JavaScript types.

The conversions are as follows:

 - `xdr.ScVal` → passthrough
 - `null` / `undefined` → `scvVoid`
 - `string` → `scvString` (a copy is made)
 - `UintArray8` → `scvBytes` (a copy is made)
 - `boolean` → `scvBool`

 - `number` / `bigint` → the smallest possible XDR integer type that will fit
   the input value (if you want a specific type, use {@link ScInt})

 - {@link Address} or {@link Contract} → `scvAddress` (for contracts and
   public keys)

 - `Array<T>` → `scvVec` after attempting to convert each item of type `T` to
   an `xdr.ScVal` (recursively). note that all values must be the same type!

 - `object` → `scvMap` after attempting to convert each key and value to an
   `xdr.ScVal` (recursively). note that there is no restriction on types
   matching anywhere (unlike arrays)

When passing an integer-like native value, you can also optionally specify a
type which will force a particular interpretation of that value.

Note that not all type specifications are compatible with all `ScVal`s, e.g.
`toScVal("a string", {type: "i256"})` will throw.

```ts
nativeToScVal(val: unknown, opts: NativeToScValOpts = {}): ScVal
```

**Parameters**

- `val` — a native (or convertible) input value to wrap
- `opts` — an optional set of hints around the type of
   conversion you'd like to see
  - `type`: there is different behavior for different input
   types for `val`:

    - when `val` is an integer-like type (i.e. number|bigint), this will be
      forwarded to {@link ScInt} or forced to be u32/i32.

    - when `val` is an array type, this is forwarded to the recursion

    - when `val` is an object type (key-value entries), this should be an
      object in which each key has a pair of types (to represent forced types
      for the key and the value), where `null` (or a missing entry) indicates
      the default interpretation(s) (refer to the examples, below)

    - when `val` is a string type, this can be 'string' or 'symbol' to force
      a particular interpretation of `val`.

    - when `val` is a bytes-like type, this can be 'string', 'symbol', or
      'bytes' to force a particular interpretation

   As a simple example, `nativeToScVal("hello", {type: 'symbol'})` will
   return an `scvSymbol`, whereas without the type it would have been an
   `scvString`.

**Throws**

- if...
 - there are arrays with more than one type in them
 - there are values that do not have a sensible conversion (e.g. random XDR
   types, custom classes)
 - the type of the input object (or some inner value of said object) cannot
   be determined (via `typeof`)
 - the type you specified (via `opts.type`) is incompatible with the value
   you passed in (`val`), e.g. `nativeToScVal("a string", { type: 'i128' })`,
   though this does not apply for types that ignore `opts` (e.g. addresses).

**Example**

```ts
nativeToScVal(1000);                   // gives ScValType === scvU64
nativeToScVal(1000n);                  // gives ScValType === scvU64
nativeToScVal(1n << 100n);             // gives ScValType === scvU128
nativeToScVal(1000, { type: 'u32' });  // gives ScValType === scvU32
nativeToScVal(1000, { type: 'i125' }); // gives ScValType === scvI256
nativeToScVal("a string");                     // gives ScValType === scvString
nativeToScVal("a string", { type: 'symbol' }); // gives scvSymbol
nativeToScVal(new Uint8Array(5));                      // scvBytes
nativeToScVal(new Uint8Array(5), { type: 'symbol' });  // scvSymbol
nativeToScVal(null); // scvVoid
nativeToScVal(true); // scvBool
nativeToScVal([1, 2, 3]);                    // gives scvVec with each element as scvU64
nativeToScVal([1, 2, 3], { type: 'i128' });  // scvVec<scvI128>
nativeToScVal([1, '2'], { type: ['i128', 'symbol'] });  // scvVec with diff types
nativeToScVal([1, '2', 3], { type: ['i128', 'symbol'] });
   // scvVec with diff types, using the default when omitted
nativeToScVal({ 'hello': 1, 'world': [ true, false ] }, {
  type: {
    'hello': [ 'symbol', 'i128' ],
  }
})
// gives scvMap with entries: [
//     [ scvSymbol, scvI128 ],
//     [ scvString, scvArray<scvBool> ]
// ]
```

**Example**

```ts
import {
  nativeToScVal,
  scValToNative,
  ScInt,
  xdr
} from '@stellar/stellar-base';

let gigaMap = {
  bool: true,
  void: null,
  u32: xdr.ScVal.scvU32(1),
  i32: xdr.ScVal.scvI32(1),
  u64: 1n,
  i64: -1n,
  u128: new ScInt(1).toU128(),
  i128: new ScInt(1).toI128(),
  u256: new ScInt(1).toU256(),
  i256: new ScInt(1).toI256(),
  map: {
    arbitrary: 1n,
    nested: 'values',
    etc: false
  },
  vec: ['same', 'type', 'list'],
  vec: ['diff', 1, 'type', 2, 'list'],
};

// then, simply:
let scv = nativeToScVal(gigaMap);    // scv.switch() == xdr.ScValType.scvMap()

// then...
someContract.call("method", scv);

// Similarly, the inverse should work:
scValToNative(scv) == gigaMap;       // true
```

**See also**

- scValToNative

**Source:** [src/base/scval.ts:161](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/scval.ts#L161)

## scValToNative

Given a smart contract value, attempt to convert it to a native type.
Possible conversions include:

 - `void` → `null`
 - `u32`, `i32` → `number`
 - `u64`, `i64`, `u128`, `i128`, `u256`, `i256`, `timepoint`, `duration` →
   `bigint`
 - `vec` → `Array` of any of the above (via recursion)
 - `map` → key-value object of any of the above (via recursion)
 - `bool` → `boolean`
 - `bytes` → `Uint8Array`
 - `symbol` → `string`
 - `string` → `string` IF the underlying buffer can be decoded as ascii/utf8,
             `Uint8Array` of the raw contents in any error case

If no viable conversion can be determined, this just "unwraps" the smart
value to return its underlying XDR value.

```ts
scValToNative(scv: ScVal): any
```

**Parameters**

- `scv` — the input smart contract value

**See also**

- nativeToScVal

**Source:** [src/base/scval.ts:375](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/scval.ts#L375)

## scvSortedMap

Build a sorted ScVal map from unsorted entries, sorted by key.

```ts
scvSortedMap(items: ScMapEntry[]): ScVal
```

**Parameters**

- `items` — the unsorted map entries

**Source:** [src/base/scval.ts:487](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/scval.ts#L487)

## walkInvocationTree

Executes a callback function on each node in the tree until stopped.

Nodes are walked in a depth-first order. Returning `false` from the callback
stops further depth exploration at that node, but it does not stop the walk
in a "global" view.

```ts
walkInvocationTree(root: SorobanAuthorizedInvocation, callback: InvocationWalker): void
```

**Parameters**

- `root` — the tree to explore
- `callback` — the callback to execute for each node

**Source:** [src/base/invocation.ts:229](https://github.com/stellar/js-stellar-sdk/blob/df5c8d9eee3e63fcad94df7cf332a0bbac1775e8/src/base/invocation.ts#L229)
