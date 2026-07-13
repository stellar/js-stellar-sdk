---
title: Core / Soroban Primitives
description: Soroban smart-contract primitives — Address, contract IDs, and ScVal conversion helpers.
---

# Core / Soroban Primitives

## Address

```ts
class Address {
  constructor(address: string);
  static account(buffer: Buffer): Address;
  static claimableBalance(buffer: Buffer): Address;
  static contract(buffer: Buffer): Address;
  static fromScAddress(scAddress: ScAddress): Address;
  static fromScVal(scVal: ScVal): Address;
  static fromString(address: string): Address;
  static liquidityPool(buffer: Buffer): Address;
  static muxedAccount(buffer: Buffer): Address;
  readonly type: AddressType;
  toBuffer(): Buffer;
  toScAddress(): ScAddress;
  toScVal(): ScVal;
  toString(): string;
}
```

**Source:** [src/base/address.ts:31](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L31)

### `new Address(address)`

```ts
constructor(address: string);
```

**Parameters**

- **`address`** — `string` (required) — a `StrKey` of the address value

**Source:** [src/base/address.ts:38](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L38)

### `Address.account(buffer)`

Creates a new account Address object from a buffer of raw bytes.

```ts
static account(buffer: Buffer): Address;
```

**Parameters**

- **`buffer`** — `Buffer` (required) — The bytes of an address to parse.

**Source:** [src/base/address.ts:73](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L73)

### `Address.claimableBalance(buffer)`

Creates a new claimable balance Address object from a buffer of raw bytes.

```ts
static claimableBalance(buffer: Buffer): Address;
```

**Parameters**

- **`buffer`** — `Buffer` (required) — The bytes of a claimable balance ID to parse.

**Source:** [src/base/address.ts:91](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L91)

### `Address.contract(buffer)`

Creates a new contract Address object from a buffer of raw bytes.

```ts
static contract(buffer: Buffer): Address;
```

**Parameters**

- **`buffer`** — `Buffer` (required) — The bytes of an address to parse.

**Source:** [src/base/address.ts:82](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L82)

### `Address.fromScAddress(scAddress)`

Convert this from an xdr.ScAddress type

```ts
static fromScAddress(scAddress: ScAddress): Address;
```

**Parameters**

- **`scAddress`** — `ScAddress` (required) — The xdr.ScAddress type to parse

**Source:** [src/base/address.ts:130](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L130)

### `Address.fromScVal(scVal)`

Convert this from an xdr.ScVal type.

```ts
static fromScVal(scVal: ScVal): Address;
```

**Parameters**

- **`scVal`** — `ScVal` (required) — The xdr.ScVal type to parse

**Source:** [src/base/address.ts:118](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L118)

### `Address.fromString(address)`

Parses a string and returns an Address object.

```ts
static fromString(address: string): Address;
```

**Parameters**

- **`address`** — `string` (required) — The address to parse. ex. `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`

**Source:** [src/base/address.ts:64](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L64)

### `Address.liquidityPool(buffer)`

Creates a new liquidity pool Address object from a buffer of raw bytes.

```ts
static liquidityPool(buffer: Buffer): Address;
```

**Parameters**

- **`buffer`** — `Buffer` (required) — The bytes of an LP ID to parse.

**Source:** [src/base/address.ts:100](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L100)

### `Address.muxedAccount(buffer)`

Creates a new muxed account Address object from a buffer of raw bytes.

```ts
static muxedAccount(buffer: Buffer): Address;
```

**Parameters**

- **`buffer`** — `Buffer` (required) — The bytes of an address to parse.

**Source:** [src/base/address.ts:109](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L109)

### `address.type`

Return the type of this address.

```ts
readonly type: AddressType;
```

**Source:** [src/base/address.ts:233](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L233)

### `address.toBuffer()`

Return the raw public key bytes for this address.

```ts
toBuffer(): Buffer;
```

**Source:** [src/base/address.ts:226](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L226)

### `address.toScAddress()`

Convert this Address to an xdr.ScAddress type.

```ts
toScAddress(): ScAddress;
```

**Source:** [src/base/address.ts:194](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L194)

### `address.toScVal()`

Convert this Address to an xdr.ScVal type.

```ts
toScVal(): ScVal;
```

**Source:** [src/base/address.ts:187](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L187)

### `address.toString()`

Serialize an address to string.

```ts
toString(): string;
```

**Source:** [src/base/address.ts:167](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/address.ts#L167)

## Contract

Create a new Contract object.

`Contract` represents a single contract in the Stellar network, embodying the
interface of the contract. See
[Contracts](https://soroban.stellar.org/docs/learn/interacting-with-contracts)
for more information about how contracts work in Stellar.

```ts
class Contract {
  constructor(contractId: string);
  address(): Address;
  call(method: string, ...params: ScVal[]): Operation;
  contractId(): string;
  getFootprint(): LedgerKey;
  toString(): string;
}
```

**Source:** [src/base/contract.ts:20](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/contract.ts#L20)

### `new Contract(contractId)`

```ts
constructor(contractId: string);
```

**Parameters**

- **`contractId`** — `string` (required) — ID of the contract (ex.
      `CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE`).

**Source:** [src/base/contract.ts:27](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/contract.ts#L27)

### `contract.address()`

Returns the wrapped address of this contract.

```ts
address(): Address;
```

**Source:** [src/base/contract.ts:50](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/contract.ts#L50)

### `contract.call(method, params)`

Returns an operation that will invoke this contract call.

```ts
call(method: string, ...params: ScVal[]): Operation;
```

**Parameters**

- **`method`** — `string` (required) — name of the method to call
- **`...params`** — `ScVal[]` (required) — arguments to pass to the method, as an array of xdr.ScVal

**See also**

- - Operation.invokeHostFunction
 - Operation.invokeContractFunction
 - Operation.createCustomContract
 - Operation.createStellarAssetContract
 - Operation.uploadContractWasm

**Source:** [src/base/contract.ts:66](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/contract.ts#L66)

### `contract.contractId()`

Returns Stellar contract ID as a strkey, ex.
`CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE`.

```ts
contractId(): string;
```

**Source:** [src/base/contract.ts:40](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/contract.ts#L40)

### `contract.getFootprint()`

Returns the read-only footprint entries necessary for any invocations to
this contract, for convenience when manually adding it to your
transaction's overall footprint or doing bump/restore operations.

```ts
getFootprint(): LedgerKey;
```

**Source:** [src/base/contract.ts:79](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/contract.ts#L79)

### `contract.toString()`

Returns the ID as a strkey (C...).

```ts
toString(): string;
```

**Source:** [src/base/contract.ts:45](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/contract.ts#L45)

## Soroban

Helper class to assist with formatting and parsing token amounts.

```ts
class Soroban {
  constructor();
  static formatTokenAmount(amount: string, decimals: number): string;
  static parseTokenAmount(value: string, decimals: number): string;
}
```

**Source:** [src/base/soroban.ts:2](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/soroban.ts#L2)

### `new Soroban()`

```ts
constructor();
```

### `Soroban.formatTokenAmount(amount, decimals)`

Given a whole number smart contract amount of a token and an amount of
decimal places (if the token has any), it returns a "display" value.

All arithmetic inside the contract is performed on integers to avoid
potential precision and consistency issues of floating-point.

```ts
static formatTokenAmount(amount: string, decimals: number): string;
```

**Parameters**

- **`amount`** — `string` (required) — the token amount you want to display
- **`decimals`** — `number` (required) — specify how many decimal places a token has

**Throws**

- if the given amount has a decimal point already

**Example**

```ts
formatTokenAmount("123000", 4) === "12.3";
formatTokenAmount("123000", 3) === "123.0";
formatTokenAmount("123", 3) === "0.123";
```

**Source:** [src/base/soroban.ts:19](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/soroban.ts#L19)

### `Soroban.parseTokenAmount(value, decimals)`

Parse a token amount to use it on smart contract

This function takes the display value and its decimals (if the token has
any) and returns a string that'll be used within the smart contract.

Returns the whole number token amount represented by the display value
with the decimal places shifted over.

```ts
static parseTokenAmount(value: string, decimals: number): string;
```

**Parameters**

- **`value`** — `string` (required) — the token amount you want to use on a smart contract
     which you've been displaying in a UI
- **`decimals`** — `number` (required) — the number of decimal places expected in the
     display value (different than the "actual" number, because suffix zeroes
     might not be present)

**Example**

```ts
const displayValueAmount = "123.4560"
const parsedAmtForSmartContract = parseTokenAmount(displayValueAmount, 5);
parsedAmtForSmartContract === "12345600"
```

**Source:** [src/base/soroban.ts:73](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/soroban.ts#L73)

## SorobanDataBuilder

Supports building `xdr.SorobanTransactionData` structures with various
items set to specific values.

This is recommended for when you are building
`Operation.extendFootprintTtl` / `Operation.restoreFootprint`
operations and need to `TransactionBuilder.setSorobanData` to avoid
(re)building the entire data structure from scratch.

```ts
class SorobanDataBuilder {
  constructor(sorobanData?: string | Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike> | SorobanTransactionData);
  static fromXdr(data: string | Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>): SorobanTransactionData;
  appendFootprint(readOnly: LedgerKey[], readWrite: LedgerKey[]): SorobanDataBuilder;
  build(): SorobanTransactionData;
  getFootprint(): LedgerFootprint;
  getReadOnly(): LedgerKey[];
  getReadWrite(): LedgerKey[];
  setFootprint(readOnly?: LedgerKey[] | null, readWrite?: LedgerKey[] | null): SorobanDataBuilder;
  setReadOnly(readOnly?: LedgerKey[]): SorobanDataBuilder;
  setReadWrite(readWrite?: LedgerKey[]): SorobanDataBuilder;
  setResourceFee(fee: IntLike): SorobanDataBuilder;
  setResources(cpuInstrs: number, diskReadBytes: number, writeBytes: number): SorobanDataBuilder;
}
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

**Source:** [src/base/sorobandata_builder.ts:34](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L34)

### `new SorobanDataBuilder(sorobanData)`

```ts
constructor(sorobanData?: string | Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike> | SorobanTransactionData);
```

**Parameters**

- **`sorobanData`** — `string | Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike> | SorobanTransactionData` (optional) — either a base64-encoded string that represents an
       `xdr.SorobanTransactionData` instance or an XDR instance itself
       (it will be copied); if omitted or "falsy" (e.g. an empty string), it
       starts with an empty instance

**Source:** [src/base/sorobandata_builder.ts:43](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L43)

### `SorobanDataBuilder.fromXdr(data)`

Decodes and builds a `xdr.SorobanTransactionData` instance.

```ts
static fromXdr(data: string | Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>): SorobanTransactionData;
```

**Parameters**

- **`data`** — `string | Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>` (required) — raw input to decode

**Source:** [src/base/sorobandata_builder.ts:76](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L76)

### `sorobanDataBuilder.appendFootprint(readOnly, readWrite)`

Appends the given ledger keys to the existing storage access footprint.

```ts
appendFootprint(readOnly: LedgerKey[], readWrite: LedgerKey[]): SorobanDataBuilder;
```

**Parameters**

- **`readOnly`** — `LedgerKey[]` (required) — read-only keys to add
- **`readWrite`** — `LedgerKey[]` (required) — read-write keys to add

**Source:** [src/base/sorobandata_builder.ts:139](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L139)

### `sorobanDataBuilder.build()`

Returns a copy of the final data structure.

```ts
build(): SorobanTransactionData;
```

**Source:** [src/base/sorobandata_builder.ts:220](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L220)

### `sorobanDataBuilder.getFootprint()`

Returns the storage access pattern.

```ts
getFootprint(): LedgerFootprint;
```

**Source:** [src/base/sorobandata_builder.ts:239](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L239)

### `sorobanDataBuilder.getReadOnly()`

Returns the read-only storage access pattern.

```ts
getReadOnly(): LedgerKey[];
```

**Source:** [src/base/sorobandata_builder.ts:229](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L229)

### `sorobanDataBuilder.getReadWrite()`

Returns the read-write storage access pattern.

```ts
getReadWrite(): LedgerKey[];
```

**Source:** [src/base/sorobandata_builder.ts:234](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L234)

### `sorobanDataBuilder.setFootprint(readOnly, readWrite)`

Sets the storage access footprint to be a certain set of ledger keys.

You can also set each field explicitly via
`SorobanDataBuilder.setReadOnly` and
`SorobanDataBuilder.setReadWrite` or add to the existing footprint
via `SorobanDataBuilder.appendFootprint`.

Passing `null|undefined` to either parameter will IGNORE the existing
values. If you want to clear them, pass `[]`, instead.

```ts
setFootprint(readOnly?: LedgerKey[] | null, readWrite?: LedgerKey[] | null): SorobanDataBuilder;
```

**Parameters**

- **`readOnly`** — `LedgerKey[] | null` (optional) — the set of ledger keys to set in the read-only portion of the transaction's `sorobanData`, or `null | undefined` to keep the existing keys
- **`readWrite`** — `LedgerKey[] | null` (optional) — the set of ledger keys to set in the read-write portion of the transaction's `sorobanData`, or `null | undefined` to keep the existing keys

**Source:** [src/base/sorobandata_builder.ts:163](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L163)

### `sorobanDataBuilder.setReadOnly(readOnly)`

Sets the read-only keys in the access footprint.

```ts
setReadOnly(readOnly?: LedgerKey[]): SorobanDataBuilder;
```

**Parameters**

- **`readOnly`** — `LedgerKey[]` (optional) — read-only keys in the access footprint

**Source:** [src/base/sorobandata_builder.ts:182](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L182)

### `sorobanDataBuilder.setReadWrite(readWrite)`

Sets the read-write keys in the access footprint.

```ts
setReadWrite(readWrite?: LedgerKey[]): SorobanDataBuilder;
```

**Parameters**

- **`readWrite`** — `LedgerKey[]` (optional) — read-write keys in the access footprint

**Source:** [src/base/sorobandata_builder.ts:202](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L202)

### `sorobanDataBuilder.setResourceFee(fee)`

Sets the resource fee portion of the Soroban data.

```ts
setResourceFee(fee: IntLike): SorobanDataBuilder;
```

**Parameters**

- **`fee`** — `IntLike` (required) — the resource fee to set (int64)

**Source:** [src/base/sorobandata_builder.ts:97](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L97)

### `sorobanDataBuilder.setResources(cpuInstrs, diskReadBytes, writeBytes)`

Sets up the resource metrics.

You should almost NEVER need this, as its often generated / provided to you
by transaction simulation/preflight from a Soroban RPC server.

```ts
setResources(cpuInstrs: number, diskReadBytes: number, writeBytes: number): SorobanDataBuilder;
```

**Parameters**

- **`cpuInstrs`** — `number` (required) — number of CPU instructions
- **`diskReadBytes`** — `number` (required) — number of bytes being read from disk
- **`writeBytes`** — `number` (required) — number of bytes being written to disk/memory

**Source:** [src/base/sorobandata_builder.ts:116](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L116)

## authorizeEntry

Actually authorizes an existing authorization entry using the given
credentials and expiration details, returning a signed copy.

This "fills out" the authorization entry with a signature, indicating to the
`Operation.invokeHostFunction` its attached to that:
  - a particular identity (i.e. signing `Keypair` or other signer)
  - approving the execution of an invocation tree (i.e. a simulation-acquired
    `xdr.SorobanAuthorizedInvocation` or otherwise built)
  - on a particular network (uniquely identified by its passphrase, see
    `Networks`)
  - until a particular ledger sequence is reached.

This one lets you pass either a `Keypair` (or, more accurately,
anything with a `sign(Buffer): Buffer` method) or a callback function (see
`SigningCallback`) to handle signing the envelope hash.

```ts
authorizeEntry(entry: SorobanAuthorizationEntry, signer: Keypair | SigningCallback, validUntilLedgerSeq: number, networkPassphrase: string, forAddress?: string): Promise<SorobanAuthorizationEntry>
```

**Parameters**

- **`entry`** — `SorobanAuthorizationEntry` (required) — an unsigned authorization entry
- **`signer`** — `Keypair | SigningCallback` (required) — either a `Keypair` instance or a function which takes a
     `xdr.HashIdPreimageSorobanAuthorization` input payload and returns
     EITHER
  
       (a) an object containing a `signature` of the hash of the raw payload
           bytes as a Buffer-like and a `publicKey` string representing who just
           created this signature, or
       (b) just the naked signature of the hash of the raw payload bytes (where
           the signing key is implied to be the address in the `entry`).
  
     The latter option (b) is JUST for backwards compatibility and will be
     removed in the future.
- **`validUntilLedgerSeq`** — `number` (required) — the (exclusive) future ledger sequence number
     until which this authorization entry should be valid (if
     `currentLedgerSeq==validUntil`, this is expired)
- **`networkPassphrase`** — `string` (required) — the network passphrase is incorporated into the
     signature (see `Networks` for options)
  
  If using the `SigningCallback` variation, the signer is assumed to be
  the entry's credential address unless you use the variant that returns
  the object.
- **`forAddress`** — `string` (optional) — which credential node the signature should be written
     to. Only relevant for `SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES`, where
     a single entry can be signed by the top-level account and/or any of its
     (possibly nested) delegates. Per CAP-71-01 every one of these signers
     signs the *same* payload (bound to the top-level address), so the
     signature produced here is written to whichever node(s) carry
     `forAddress`. When omitted, the signature is written to the top-level
     credentials, which preserves the behavior for `SOROBAN_CREDENTIALS_ADDRESS`
     / `SOROBAN_CREDENTIALS_ADDRESS_V2` and for accounts whose signing key
     differs from the credential address (e.g. multisig).

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
   return signer.sign(hash(payload.toXdr()));
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

**Source:** [src/base/auth.ts:146](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L146)

## authorizeInvocation

```ts
authorizeInvocation(params: AuthorizeInvocationParams): Promise<SorobanAuthorizationEntry>
```

**Parameters**

- **`params`** — `AuthorizeInvocationParams` (required)

**Source:** [src/base/auth.ts:305](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L305)

## buildAuthorizationEntryPreimage

Builds the `xdr.HashIdPreimage` whose hash a signer must sign to
authorize `entry`. This is the low-level signature payload used by
`authorizeEntry`, exposed for callers that drive signing themselves —
most notably for `SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES`, where the
client (not simulation) decides which delegates sign and how.

For `SOROBAN_CREDENTIALS_ADDRESS` this is the legacy, non-address-bound
`ENVELOPE_TYPE_SOROBAN_AUTHORIZATION` preimage. For `SOROBAN_CREDENTIALS_ADDRESS_V2`
and `SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES` it is the address-bound
`ENVELOPE_TYPE_SOROBAN_AUTHORIZATION_WITH_ADDRESS` preimage (CAP-71). For the
delegates variant this single payload — bound to the *top-level* address — is
what the top-level account and every (nested) delegate each sign.

To get the raw bytes to sign, hash the XDR: `hash(preimage.toXdr())`.

```ts
buildAuthorizationEntryPreimage(entry: SorobanAuthorizationEntry, validUntilLedgerSeq: number, networkPassphrase: string): HashIdPreimage
```

**Parameters**

- **`entry`** — `SorobanAuthorizationEntry` (required) — the authorization entry to build the payload for
- **`validUntilLedgerSeq`** — `number` (required) — the expiration ledger committed into the payload
     (must match the `signatureExpirationLedger` on the credentials you submit)
- **`networkPassphrase`** — `string` (required) — the network passphrase mixed into the payload

**Throws**

- `Error` if `entry` carries source-account or otherwise non-address
   credentials

**Source:** [src/base/auth.ts:371](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L371)

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

- **`root`** — `SorobanAuthorizedInvocation` (required) — the raw XDR of the invocation,
     likely acquired from transaction simulation. this is either from the
     `Operation.invokeHostFunction` itself (the `func` field), or from
     the authorization entries (`xdr.SorobanAuthorizationEntry`, the
     `rootInvocation` field)

**Example**

Here, we show a browser modal after simulating an arbitrary transaction,
`tx`, which we assume has an `Operation.invokeHostFunction` inside of it:

```typescript
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

**Source:** [src/base/invocation.ts:124](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L124)

## buildWithDelegatesEntry

Builds a `SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES` authorization entry by
wrapping the address credentials of an existing `ADDRESS`/`ADDRESS_V2` entry
(e.g. one returned by simulation) together with a caller-provided set of
delegate signers.

Simulation never emits the delegates variant on its own — which accounts use
delegated authentication is account-specific policy known only to the client
(much like a multisig policy). This helper just assembles the wrapper XDR;
you supply the delegate tree (addresses and, optionally, signatures). To
produce the signatures, build the shared payload with
`buildAuthorizationEntryPreimage` on the returned entry and sign it,
or fill each node afterwards with `authorizeEntry` (passing the
signer's address as `forAddress`).

Each delegates array (the top-level set and every `nestedDelegates`) is
sorted by address in ascending order, and duplicate addresses within an array
are rejected, as the protocol requires (CAP-71-01) — otherwise the host
rejects the entry.

```ts
buildWithDelegatesEntry(params: BuildWithDelegatesParams): SorobanAuthorizationEntry
```

**Parameters**

- **`params`** — `BuildWithDelegatesParams` (required) — see `BuildWithDelegatesParams`

**Throws**

- `Error` if `entry` is not an `ADDRESS`/`ADDRESS_V2` entry, or if any
   delegates array contains a duplicate address.

**Source:** [src/base/auth.ts:478](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L478)

## humanizeEvents

Converts raw diagnostic or contract events into something with a flatter,
human-readable, and understandable structure.

Each element in the returned list has the following properties:
 - `type`: one of `'system'`, `'contract'`, `'diagnostic'`
 - `contractId`: optionally, a `C...` encoded strkey
 - `topics`: a list of `scValToNative` invocations on the topics
 - `data`: a `scValToNative` invocation on the raw event data

```ts
humanizeEvents(events: ContractEvent[] | DiagnosticEvent[]): SorobanEvent[]
```

**Parameters**

- **`events`** — `ContractEvent[] | DiagnosticEvent[]` (required) — either contract events or diagnostic events to parse into a
     friendly format

**Source:** [src/base/events.ts:44](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/events.ts#L44)

## nativeToScVal

Attempts to convert native types into smart contract values
(`xdr.ScVal`).

Provides conversions from smart contract XDR values (`xdr.ScVal`) to
native JavaScript types.

The conversions are as follows:

 - xdr.ScVal -> passthrough
 - null/undefined -> scvVoid
 - string -> scvString (a copy is made)
 - UintArray8 -> scvBytes (a copy is made)
 - boolean -> scvBool

 - number/bigint -> the smallest possible XDR integer type that will fit the
   input value (if you want a specific type, use `ScInt`)

 - `Address` or `Contract` -> scvAddress (for contracts and
   public keys)

 - Array<T> -> scvVec after attempting to convert each item of type `T` to an
   xdr.ScVal (recursively). note that all values must be the same type!

 - object -> scvMap after attempting to convert each key and value to an
   xdr.ScVal (recursively). note that there is no restriction on types
   matching anywhere (unlike arrays)

When passing an integer-like native value, you can also optionally specify a
type which will force a particular interpretation of that value.

Note that not all type specifications are compatible with all `ScVal`s, e.g.
`toScVal("a string", {type: "i256"})` will throw.

```ts
nativeToScVal(val: unknown, opts: NativeToScValOpts = {}): ScVal
```

**Parameters**

- **`val`** — `unknown` (required) — a native (or convertible) input value to wrap
- **`opts`** — `NativeToScValOpts` (optional) (default: `{}`) — an optional set of hints around the type of
     conversion you'd like to see

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
let scv = nativeToScVal(gigaMap);    // scv.type === "scvMap"

// then...
someContract.call("method", scv);

// Similarly, the inverse should work:
scValToNative(scv) == gigaMap;       // true
```

**See also**

- scValToNative

**Source:** [src/base/scval.ts:164](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/scval.ts#L164)

## scValToNative

Given a smart contract value, attempt to convert it to a native type.
Possible conversions include:

 - void -> `null`
 - u32, i32 -> `number`
 - u64, i64, u128, i128, u256, i256, timepoint, duration -> `bigint`
 - vec -> `Array` of any of the above (via recursion)
 - map -> key-value object of any of the above (via recursion)
 - bool -> `boolean`
 - bytes -> `Uint8Array`
 - symbol -> `string`
 - string -> `string` IF the underlying buffer can be decoded as ascii/utf8,
             `Uint8Array` of the raw contents in any error case

If no viable conversion can be determined, this just "unwraps" the smart
value to return its underlying XDR value.

```ts
scValToNative(scv: ScVal): any
```

**Parameters**

- **`scv`** — `ScVal` (required) — the input smart contract value

**See also**

- nativeToScVal

**Source:** [src/base/scval.ts:378](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/scval.ts#L378)

## scvSortedMap

Build a sorted ScVal map from unsorted entries, sorted by key.

```ts
scvSortedMap(items: ScMapEntry[]): ScVal
```

**Parameters**

- **`items`** — `ScMapEntry[]` (required) — the unsorted map entries

**Source:** [src/base/scval.ts:475](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/scval.ts#L475)

## walkInvocationTree

Executes a callback function on each node in the tree until stopped.

Nodes are walked in a depth-first order. Returning `false` from the callback
stops further depth exploration at that node, but it does not stop the walk
in a "global" view.

```ts
walkInvocationTree(root: SorobanAuthorizedInvocation, callback: InvocationWalker): void
```

**Parameters**

- **`root`** — `SorobanAuthorizedInvocation` (required) — the tree to explore
- **`callback`** — `InvocationWalker` (required) — the callback to execute for each node

**Source:** [src/base/invocation.ts:221](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L221)

## Types

### AuthorizeInvocationParams

This builds an entry from scratch, allowing you to express authorization as a
function of:
  - a particular identity (i.e. signing `Keypair` or other signer)
  - approving the execution of an invocation tree (i.e. a simulation-acquired
    `xdr.SorobanAuthorizedInvocation` or otherwise built)
  - on a particular network (uniquely identified by its passphrase, see
    `Networks`)
  - until a particular ledger sequence is reached.

This is in contrast to `authorizeEntry`, which signs an existing entry.

```ts
interface AuthorizeInvocationParams {
  authV2?: boolean;
  invocation: SorobanAuthorizedInvocation;
  networkPassphrase: string;
  publicKey?: string;
  signer: Keypair | SigningCallback;
  validUntilLedgerSeq: number;
}
```

**See also**

- authorizeEntry

**Source:** [src/base/auth.ts:288](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L288)

#### `authorizeInvocationParams.authV2`

Build `SOROBAN_CREDENTIALS_ADDRESS_V2` (CAP-71) credentials instead of the
legacy `SOROBAN_CREDENTIALS_ADDRESS`. V2 credentials bind the address into
the signed payload but are only valid on networks that have activated
CAP-71, so leave this off until the activation vote passes for your target
network. The default flips to `true` once V2 becomes mandatory.

```ts
authV2?: boolean;
```

**Source:** [src/base/auth.ts:302](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L302)

#### `authorizeInvocationParams.invocation`

```ts
invocation: SorobanAuthorizedInvocation;
```

**Source:** [src/base/auth.ts:291](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L291)

#### `authorizeInvocationParams.networkPassphrase`

```ts
networkPassphrase: string;
```

**Source:** [src/base/auth.ts:292](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L292)

#### `authorizeInvocationParams.publicKey`

```ts
publicKey?: string;
```

**Source:** [src/base/auth.ts:293](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L293)

#### `authorizeInvocationParams.signer`

```ts
signer: Keypair | SigningCallback;
```

**Source:** [src/base/auth.ts:289](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L289)

#### `authorizeInvocationParams.validUntilLedgerSeq`

```ts
validUntilLedgerSeq: number;
```

**Source:** [src/base/auth.ts:290](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L290)

### BuildWithDelegatesParams

Parameters for `buildWithDelegatesEntry`.

```ts
interface BuildWithDelegatesParams {
  delegates: DelegateSignature[];
  entry: SorobanAuthorizationEntry;
  signature?: ScVal;
  validUntilLedgerSeq: number;
}
```

**Source:** [src/base/auth.ts:436](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L436)

#### `buildWithDelegatesParams.delegates`

the delegate signers to attach.

```ts
delegates: DelegateSignature[];
```

**Source:** [src/base/auth.ts:446](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L446)

#### `buildWithDelegatesParams.entry`

an existing `SOROBAN_CREDENTIALS_ADDRESS` or
`SOROBAN_CREDENTIALS_ADDRESS_V2` entry — typically one returned by
simulation — whose address credentials should be wrapped.

```ts
entry: SorobanAuthorizationEntry;
```

**Source:** [src/base/auth.ts:442](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L442)

#### `buildWithDelegatesParams.signature`

the top-level account's signature. Defaults to `scvVoid`, which is valid
for accounts that authorize purely via delegated signers (CAP-71-01).

```ts
signature?: ScVal;
```

**Source:** [src/base/auth.ts:451](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L451)

#### `buildWithDelegatesParams.validUntilLedgerSeq`

the expiration ledger sequence stored on the top-level credentials.

```ts
validUntilLedgerSeq: number;
```

**Source:** [src/base/auth.ts:444](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L444)

### CreateInvocation

Details about a contract creation invocation.

- `type` indicates if this creation was a custom contract (`'wasm'`) or a
  wrapping of an existing Stellar asset (`'sac'`)
- `asset` is set when `type=='sac'`, containing the canonical `Asset`
  being wrapped by this Stellar Asset Contract
- `wasm` is set when `type=='wasm'`, containing additional creation parameters

```ts
interface CreateInvocation {
  asset?: string;
  type: "wasm" | "sac";
  wasm?: WasmCreateDetails;
}
```

**Source:** [src/base/invocation.ts:27](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L27)

#### `createInvocation.asset`

```ts
asset?: string;
```

**Source:** [src/base/invocation.ts:29](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L29)

#### `createInvocation.type`

```ts
type: "wasm" | "sac";
```

**Source:** [src/base/invocation.ts:28](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L28)

#### `createInvocation.wasm`

```ts
wasm?: WasmCreateDetails;
```

**Source:** [src/base/invocation.ts:30](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L30)

### DelegateSignature

A delegate signer to attach to a
`SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES` entry via
`buildWithDelegatesEntry`.

```ts
interface DelegateSignature {
  address: string;
  nestedDelegates?: DelegateSignature[];
  signature?: ScVal;
}
```

**Source:** [src/base/auth.ts:422](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L422)

#### `delegateSignature.address`

the delegate's address (`G…` account or `C…` contract).

```ts
address: string;
```

**Source:** [src/base/auth.ts:424](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L424)

#### `delegateSignature.nestedDelegates`

signers this delegate in turn delegates to (recursive).

```ts
nestedDelegates?: DelegateSignature[];
```

**Source:** [src/base/auth.ts:432](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L432)

#### `delegateSignature.signature`

the delegate's signature value. Defaults to a `scvVoid` placeholder, which
you can fill afterwards with `authorizeEntry` (passing this address
as `forAddress`) or by editing the entry directly.

```ts
signature?: ScVal;
```

**Source:** [src/base/auth.ts:430](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L430)

### ExecuteInvocation

Details about a contract function execution invocation.

- `source` is the strkey of the contract (`C...`) being invoked
- `function` is the name of the function being invoked
- `args` are the natively-represented parameters to the function invocation
  (see `scValToNative` for rules on how they're represented as JS types)

```ts
interface ExecuteInvocation {
  args: any[];
  function: string;
  source: string;
}
```

**Source:** [src/base/invocation.ts:41](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L41)

#### `executeInvocation.args`

```ts
args: any[];
```

**Source:** [src/base/invocation.ts:45](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L45)

#### `executeInvocation.function`

```ts
function: string;
```

**Source:** [src/base/invocation.ts:43](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L43)

#### `executeInvocation.source`

```ts
source: string;
```

**Source:** [src/base/invocation.ts:42](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L42)

### IntLike

```ts
type IntLike = bigint | number | string
```

**Source:** [src/base/sorobandata_builder.ts:10](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/sorobandata_builder.ts#L10)

### InvocationTree

A node in the invocation tree.

- `type` is the type of invocation occurring, either contract creation or
  host function execution
- `args` are the parameters to the invocation, depending on the type
- `invocations` are any sub-invocations that may occur as a result of this
  invocation (i.e. a tree of call stacks)

```ts
interface InvocationTree {
  args: CreateInvocation | ExecuteInvocation;
  invocations: InvocationTree[];
  type: "create" | "execute";
}
```

**Source:** [src/base/invocation.ts:57](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L57)

#### `invocationTree.args`

```ts
args: CreateInvocation | ExecuteInvocation;
```

**Source:** [src/base/invocation.ts:59](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L59)

#### `invocationTree.invocations`

```ts
invocations: InvocationTree[];
```

**Source:** [src/base/invocation.ts:60](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L60)

#### `invocationTree.type`

```ts
type: "create" | "execute";
```

**Source:** [src/base/invocation.ts:58](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L58)

### InvocationWalker

A callback used when walking an invocation tree.

Returning exactly `false` is a hint to stop exploring deeper from this node;
other return values are ignored.

```ts
type InvocationWalker = (node: SorobanAuthorizedInvocation, depth: number, parent?: SorobanAuthorizedInvocation) => boolean | null | void
```

**Source:** [src/base/invocation.ts:75](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L75)

### NativeToScValOpts

```ts
interface NativeToScValOpts {
  type?: ScValType | ScValMapTypeSpec | ScValType | null[];
}
```

**Source:** [src/base/scval.ts:25](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/scval.ts#L25)

#### `nativeToScValOpts.type`

```ts
type?: ScValType | ScValMapTypeSpec | ScValType | null[];
```

**Source:** [src/base/scval.ts:26](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/scval.ts#L26)

### SigningCallback

A callback for signing an XDR structure representing all of the details
necessary to authorize an invocation tree.

```ts
type SigningCallback = (preimage: HashIdPreimage) => Promise<BufferLike | { publicKey: string; signature: BufferLike }>
```

**Source:** [src/base/auth.ts:47](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/auth.ts#L47)

### WasmCreateDetails

```ts
interface WasmCreateDetails {
  address: string;
  constructorArgs?: any[];
  hash: string;
  salt: string;
}
```

**Source:** [src/base/invocation.ts:10](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L10)

#### `wasmCreateDetails.address`

```ts
address: string;
```

**Source:** [src/base/invocation.ts:12](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L12)

#### `wasmCreateDetails.constructorArgs`

```ts
constructorArgs?: any[];
```

**Source:** [src/base/invocation.ts:15](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L15)

#### `wasmCreateDetails.hash`

```ts
hash: string;
```

**Source:** [src/base/invocation.ts:11](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L11)

#### `wasmCreateDetails.salt`

```ts
salt: string;
```

**Source:** [src/base/invocation.ts:13](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/invocation.ts#L13)
