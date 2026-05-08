---
title: Core / Transactions
---

# Core / Transactions

## Account

Create a new Account object.

`Account` represents a single account in the Stellar network and its sequence
number. Account tracks the sequence number as it is used by `TransactionBuilder`. See
[Accounts](https://developers.stellar.org/docs/glossary/accounts/) for
more information about how accounts work in Stellar.

```ts
class Account {
  constructor(accountId: string, sequence: string);
  accountId(): string;
  incrementSequenceNumber(): void;
  sequenceNumber(): string;
}
```

**Source:** [src/base/account.ts:15](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/account.ts#L15)

### `new Account(accountId, sequence)`

```ts
constructor(accountId: string, sequence: string);
```

**Parameters**

- **`accountId`** — `string` (required) — ID of the account (ex.
      `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`). If you
      provide a muxed account address, this will throw; use `MuxedAccount` instead.
- **`sequence`** — `string` (required) — current sequence number of the account

**Source:** [src/base/account.ts:26](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/account.ts#L26)

### `account.accountId()`

Returns Stellar account ID, ex.
`GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`.

```ts
accountId(): string;
```

**Source:** [src/base/account.ts:57](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/account.ts#L57)

### `account.incrementSequenceNumber()`

Increments sequence number in this object by one.

```ts
incrementSequenceNumber(): void;
```

**Source:** [src/base/account.ts:71](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/account.ts#L71)

### `account.sequenceNumber()`

Returns sequence number for the account as a string

```ts
sequenceNumber(): string;
```

**Source:** [src/base/account.ts:64](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/account.ts#L64)

## AuthClawbackEnabledFlag

When set using [`Operation.setOptions`](#operationsetoptions) option, then any trustlines
created by this account can have a ClawbackOp operation submitted for the
corresponding asset.

```ts
const AuthClawbackEnabledFlag: number
```

**See also**

- [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)

**Source:** [src/base/operation.ts:83](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L83)

## AuthFlag

```ts
type AuthFlag = unknown
```

**Source:** [src/base/operations/types.ts:431](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L431)

## AuthFlag

```ts
type AuthFlag = typeof AuthFlag[keyof typeof AuthFlag]
```

**Source:** [src/base/operations/types.ts:431](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L431)

## AuthImmutableFlag

When set using [`Operation.setOptions`](#operationsetoptions) option, then none of the
authorization flags can be set and the account can never be deleted.

```ts
const AuthImmutableFlag: number
```

**See also**

- [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)

**Source:** [src/base/operation.ts:74](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L74)

## AuthRequiredFlag

When set using [`Operation.setOptions`](#operationsetoptions) option, requires the issuing
account to give other accounts permission before they can hold the issuing
account’s credit.

```ts
const AuthRequiredFlag: number
```

**See also**

- [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)

**Source:** [src/base/operation.ts:60](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L60)

## AuthRevocableFlag

When set using [`Operation.setOptions`](#operationsetoptions) option, allows the issuing
account to revoke its credit held by other accounts.

```ts
const AuthRevocableFlag: number
```

**See also**

- [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)

**Source:** [src/base/operation.ts:67](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L67)

## BASE_FEE

Minimum base fee for transactions. If this fee is below the network
minimum, the transaction will fail. The more operations in the
transaction, the greater the required fee. Use
`Horizon.Server.fetchBaseFee` to get an accurate value of minimum
transaction fee on the network.

```ts
const BASE_FEE: "100"
```

**See also**

- [Fees](https://developers.stellar.org/docs/glossary/fees/)

**Source:** [src/base/transaction_builder.ts:38](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L38)

## FeeBumpTransaction

Use `TransactionBuilder.buildFeeBumpTransaction` to build a
FeeBumpTransaction object. If you have an object or base64-encoded string of
the transaction envelope XDR use `TransactionBuilder.fromXDR`.

Once a `FeeBumpTransaction` has been created, its attributes and operations
should not be changed. You should only add signatures (using `FeeBumpTransaction.sign`) before
submitting to the network or forwarding on to additional signers.

```ts
class FeeBumpTransaction {
  constructor(envelope: string | TransactionEnvelope, networkPassphrase: string);
  fee: string;
  readonly feeSource: string;
  readonly innerTransaction: Transaction;
  networkPassphrase: string;
  readonly operations: OperationRecord[];
  signatures: DecoratedSignature[];
  tx: TTx;
  addDecoratedSignature(signature: DecoratedSignature): void;
  addSignature(publicKey: string = "", signature: string = ""): void;
  getKeypairSignature(keypair: Keypair): string;
  hash(): Buffer;
  sign(...keypairs: Keypair[]): void;
  signatureBase(): Buffer;
  signHashX(preimage: string | Buffer<ArrayBufferLike>): void;
  toEnvelope(): TransactionEnvelope;
  toXDR(): string;
}
```

**Source:** [src/base/fee_bump_transaction.ts:17](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/fee_bump_transaction.ts#L17)

### `new FeeBumpTransaction(envelope, networkPassphrase)`

```ts
constructor(envelope: string | TransactionEnvelope, networkPassphrase: string);
```

**Parameters**

- **`envelope`** — `string | TransactionEnvelope` (required) — transaction envelope object or base64 encoded string.
- **`networkPassphrase`** — `string` (required) — passphrase of the target Stellar network
      (e.g. "Public Global Stellar Network ; September 2015").

**Source:** [src/base/fee_bump_transaction.ts:26](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/fee_bump_transaction.ts#L26)

### `feeBumpTransaction.fee`

The total fee for this transaction, in stroops.

```ts
fee: string;
```

**Source:** [src/base/transaction_base.ts:76](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L76)

### `feeBumpTransaction.feeSource`

The account paying the fee for this transaction.

```ts
readonly feeSource: string;
```

**Source:** [src/base/fee_bump_transaction.ts:78](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/fee_bump_transaction.ts#L78)

### `feeBumpTransaction.innerTransaction`

The inner transaction that this fee bump wraps.

```ts
readonly innerTransaction: Transaction;
```

**Source:** [src/base/fee_bump_transaction.ts:64](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/fee_bump_transaction.ts#L64)

### `feeBumpTransaction.networkPassphrase`

The network passphrase for this transaction.

```ts
networkPassphrase: string;
```

**Source:** [src/base/transaction_base.ts:85](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L85)

### `feeBumpTransaction.operations`

The operations from the inner transaction.

```ts
readonly operations: OperationRecord[];
```

**Source:** [src/base/fee_bump_transaction.ts:71](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/fee_bump_transaction.ts#L71)

### `feeBumpTransaction.signatures`

The list of signatures for this transaction.

```ts
signatures: DecoratedSignature[];
```

**Source:** [src/base/transaction_base.ts:35](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L35)

### `feeBumpTransaction.tx`

The underlying XDR transaction object.

Returns a defensive copy so that external mutations cannot alter the
transaction that will be signed or serialized.

```ts
tx: TTx;
```

**Throws**

- if the internal transaction is not a recognized XDR type

**Source:** [src/base/transaction_base.ts:51](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L51)

### `feeBumpTransaction.addDecoratedSignature(signature)`

Add a decorated signature directly to the transaction envelope.

```ts
addDecoratedSignature(signature: DecoratedSignature): void;
```

**Parameters**

- **`signature`** — `DecoratedSignature` (required) — raw signature to add

**See also**

- - Keypair.signDecorated
 - Keypair.signPayloadDecorated

**Source:** [src/base/transaction_base.ts:196](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L196)

### `feeBumpTransaction.addSignature(publicKey, signature)`

Add a signature to the transaction. Useful when a party wants to pre-sign
a transaction but doesn't want to give access to their secret keys.
This will also verify whether the signature is valid.

Here's how you would use this feature to solicit multiple signatures.
- Use `TransactionBuilder` to build a new transaction.
- Make sure to set a long enough timeout on that transaction to give your
signers enough time to sign!
- Once you build the transaction, use `transaction.toXDR()` to get the
base64-encoded XDR string.
- _Warning!_ Once you've built this transaction, don't submit any other
transactions onto your account! Doing so will invalidate this pre-compiled
transaction!
- Send this XDR string to your other parties. They can use the instructions
for [getKeypairSignature](#getKeypairSignature) to sign the transaction.
- They should send you back their `publicKey` and the `signature` string
from [getKeypairSignature](#getKeypairSignature), both of which you pass to
this function.

```ts
addSignature(publicKey: string = "", signature: string = ""): void;
```

**Parameters**

- **`publicKey`** — `string` (optional) (default: `""`) — the public key of the signer
- **`signature`** — `string` (optional) (default: `""`) — the base64 value of the signature XDR

**Source:** [src/base/transaction_base.ts:156](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L156)

### `feeBumpTransaction.getKeypairSignature(keypair)`

Signs a transaction with the given `Keypair`. Useful if someone sends
you a transaction XDR for you to sign and return (see
[addSignature](#addSignature) for more information).

When you get a transaction XDR to sign....
- Instantiate a `Transaction` object with the XDR
- Use `Keypair` to generate a keypair object for your Stellar seed.
- Run `getKeypairSignature` with that keypair
- Send back the signature along with your publicKey (not your secret seed!)

Example:
```javascript
// `transactionXDR` is a string from the person generating the transaction
const transaction = new Transaction(transactionXDR, networkPassphrase);
const keypair = Keypair.fromSecret(myStellarSeed);
return transaction.getKeypairSignature(keypair);
```

Returns the base64-encoded signature string for the given keypair.

```ts
getKeypairSignature(keypair: Keypair): string;
```

**Parameters**

- **`keypair`** — `Keypair` (required) — Keypair of signer

**Source:** [src/base/transaction_base.ts:129](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L129)

### `feeBumpTransaction.hash()`

Returns a hash for this transaction, suitable for signing.

```ts
hash(): Buffer;
```

**Source:** [src/base/transaction_base.ts:222](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L222)

### `feeBumpTransaction.sign(keypairs)`

Signs the transaction with the given `Keypair`.

```ts
sign(...keypairs: Keypair[]): void;
```

**Parameters**

- **`...keypairs`** — `Keypair[]` (required) — Keypairs of signers

**Source:** [src/base/transaction_base.ts:97](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L97)

### `feeBumpTransaction.signatureBase()`

Returns the "signature base" of this transaction, which is the value
that, when hashed, should be signed to create a signature that
validators on the Stellar Network will accept.

It is composed of a 4 prefix bytes followed by the xdr-encoded form
of this transaction.

```ts
signatureBase(): Buffer;
```

**Source:** [src/base/fee_bump_transaction.ts:90](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/fee_bump_transaction.ts#L90)

### `feeBumpTransaction.signHashX(preimage)`

Add `hashX` signer preimage as signature.

```ts
signHashX(preimage: string | Buffer<ArrayBufferLike>): void;
```

**Parameters**

- **`preimage`** — `string | Buffer<ArrayBufferLike>` (required) — preimage of hash used as signer

**Source:** [src/base/transaction_base.ts:204](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L204)

### `feeBumpTransaction.toEnvelope()`

To envelope returns a xdr.TransactionEnvelope which can be submitted to the network.

```ts
toEnvelope(): TransactionEnvelope;
```

**Source:** [src/base/fee_bump_transaction.ts:107](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/fee_bump_transaction.ts#L107)

### `feeBumpTransaction.toXDR()`

Returns the transaction envelope as a base64-encoded XDR string.

```ts
toXDR(): string;
```

**Source:** [src/base/transaction_base.ts:239](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L239)

## Int128

```ts
class Int128 extends LargeInt {
  constructor(...args: (string | number | bigint)[]);
  static MAX_VALUE: LargeInt;
  static MIN_VALUE: LargeInt;
  static defineIntBoundaries(): void;
  static fromString(value: string): LargeInt;
  static isValid(value: unknown): boolean;
  readonly size: number;
  readonly unsigned: boolean;
  slice(chunkSize: number): bigint[];
  toBigInt(): bigint;
  toString(): string;
}
```

**Source:** [src/base/numbers/int128.ts:3](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/int128.ts#L3)

### `new Int128(args)`

Construct a signed 128-bit integer that can be XDR-encoded.

```ts
constructor(...args: (string | number | bigint)[]);
```

**Parameters**

- **`...args`** — `(string | number | bigint)[]` (required) — one or more slices to encode
      in big-endian format (i.e. earlier elements are higher bits)

**Source:** [src/base/numbers/int128.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/int128.ts#L10)

### `Int128.MAX_VALUE`

```ts
static MAX_VALUE: LargeInt;
```

**Source:** [types/stellar__js-xdr/index.d.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L14)

### `Int128.MIN_VALUE`

```ts
static MIN_VALUE: LargeInt;
```

**Source:** [types/stellar__js-xdr/index.d.ts:13](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L13)

### `Int128.defineIntBoundaries()`

```ts
static defineIntBoundaries(): void;
```

**Source:** [types/stellar__js-xdr/index.d.ts:12](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L12)

### `Int128.fromString(value)`

```ts
static fromString(value: string): LargeInt;
```

**Parameters**

- **`value`** — `string` (required)

**Source:** [types/stellar__js-xdr/index.d.ts:16](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L16)

### `Int128.isValid(value)`

```ts
static isValid(value: unknown): boolean;
```

**Parameters**

- **`value`** — `unknown` (required)

**Source:** [types/stellar__js-xdr/index.d.ts:15](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L15)

### `int128.size`

```ts
readonly size: number;
```

**Source:** [src/base/numbers/int128.ts:18](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/int128.ts#L18)

### `int128.unsigned`

```ts
readonly unsigned: boolean;
```

**Source:** [src/base/numbers/int128.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/int128.ts#L14)

### `int128.slice(chunkSize)`

```ts
slice(chunkSize: number): bigint[];
```

**Parameters**

- **`chunkSize`** — `number` (required)

**Source:** [types/stellar__js-xdr/index.d.ts:21](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L21)

### `int128.toBigInt()`

```ts
toBigInt(): bigint;
```

**Source:** [types/stellar__js-xdr/index.d.ts:19](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L19)

### `int128.toString()`

```ts
toString(): string;
```

**Source:** [types/stellar__js-xdr/index.d.ts:20](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L20)

## Int256

```ts
class Int256 extends LargeInt {
  constructor(...args: (string | number | bigint)[]);
  static MAX_VALUE: LargeInt;
  static MIN_VALUE: LargeInt;
  static defineIntBoundaries(): void;
  static fromString(value: string): LargeInt;
  static isValid(value: unknown): boolean;
  readonly size: number;
  readonly unsigned: boolean;
  slice(chunkSize: number): bigint[];
  toBigInt(): bigint;
  toString(): string;
}
```

**Source:** [src/base/numbers/int256.ts:3](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/int256.ts#L3)

### `new Int256(args)`

Construct a signed 256-bit integer that can be XDR-encoded.

```ts
constructor(...args: (string | number | bigint)[]);
```

**Parameters**

- **`...args`** — `(string | number | bigint)[]` (required) — one or more slices to encode
      in big-endian format (i.e. earlier elements are higher bits)

**Source:** [src/base/numbers/int256.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/int256.ts#L10)

### `Int256.MAX_VALUE`

```ts
static MAX_VALUE: LargeInt;
```

**Source:** [types/stellar__js-xdr/index.d.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L14)

### `Int256.MIN_VALUE`

```ts
static MIN_VALUE: LargeInt;
```

**Source:** [types/stellar__js-xdr/index.d.ts:13](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L13)

### `Int256.defineIntBoundaries()`

```ts
static defineIntBoundaries(): void;
```

**Source:** [types/stellar__js-xdr/index.d.ts:12](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L12)

### `Int256.fromString(value)`

```ts
static fromString(value: string): LargeInt;
```

**Parameters**

- **`value`** — `string` (required)

**Source:** [types/stellar__js-xdr/index.d.ts:16](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L16)

### `Int256.isValid(value)`

```ts
static isValid(value: unknown): boolean;
```

**Parameters**

- **`value`** — `unknown` (required)

**Source:** [types/stellar__js-xdr/index.d.ts:15](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L15)

### `int256.size`

```ts
readonly size: number;
```

**Source:** [src/base/numbers/int256.ts:18](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/int256.ts#L18)

### `int256.unsigned`

```ts
readonly unsigned: boolean;
```

**Source:** [src/base/numbers/int256.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/int256.ts#L14)

### `int256.slice(chunkSize)`

```ts
slice(chunkSize: number): bigint[];
```

**Parameters**

- **`chunkSize`** — `number` (required)

**Source:** [types/stellar__js-xdr/index.d.ts:21](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L21)

### `int256.toBigInt()`

```ts
toBigInt(): bigint;
```

**Source:** [types/stellar__js-xdr/index.d.ts:19](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L19)

### `int256.toString()`

```ts
toString(): string;
```

**Source:** [types/stellar__js-xdr/index.d.ts:20](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L20)

## Memo

`Memo` represents memos attached to transactions.

```ts
class Memo<T extends MemoType = MemoType> {
  constructor(type: "none", value?: null);
  static fromXDRObject(object: Memo): Memo;
  static hash(hash: string | Buffer<ArrayBufferLike>): Memo<"hash">;
  static id(id: string): Memo<"id">;
  static none(): Memo<"none">;
  static return(hash: string | Buffer<ArrayBufferLike>): Memo<"return">;
  static text(text: string): Memo<"text">;
  type: T;
  value: MemoTypeToValue<T>;
  toXDRObject(): Memo;
}
```

**See also**

- [Transactions concept](https://developers.stellar.org/docs/glossary/transactions/)

**Source:** [src/base/memo.ts:63](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L63)

### `new Memo(type, value)`

```ts
constructor(type: "none", value?: null);
```

**Parameters**

- **`type`** — `"none"` (required)
- **`value`** — `null` (optional)

**Source:** [src/base/memo.ts:67](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L67)

### `Memo.fromXDRObject(object)`

Returns `Memo` from XDR memo object.

```ts
static fromXDRObject(object: Memo): Memo;
```

**Parameters**

- **`object`** — `Memo` (required) — XDR memo object

**Source:** [src/base/memo.ts:302](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L302)

### `Memo.hash(hash)`

Creates and returns a `MemoHash` memo.

```ts
static hash(hash: string | Buffer<ArrayBufferLike>): Memo<"hash">;
```

**Parameters**

- **`hash`** — `string | Buffer<ArrayBufferLike>` (required) — 32 byte hash or hex encoded string

**Source:** [src/base/memo.ts:260](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L260)

### `Memo.id(id)`

Creates and returns a `MemoID` memo.

```ts
static id(id: string): Memo<"id">;
```

**Parameters**

- **`id`** — `string` (required) — 64-bit number represented as a string

**Source:** [src/base/memo.ts:251](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L251)

### `Memo.none()`

Returns an empty memo (`MemoNone`).

```ts
static none(): Memo<"none">;
```

**Source:** [src/base/memo.ts:233](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L233)

### `Memo.return(hash)`

Creates and returns a `MemoReturn` memo.

```ts
static return(hash: string | Buffer<ArrayBufferLike>): Memo<"return">;
```

**Parameters**

- **`hash`** — `string | Buffer<ArrayBufferLike>` (required) — 32 byte hash or hex encoded string

**Source:** [src/base/memo.ts:269](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L269)

### `Memo.text(text)`

Creates and returns a `MemoText` memo.

```ts
static text(text: string): Memo<"text">;
```

**Parameters**

- **`text`** — `string` (required) — memo text

**Source:** [src/base/memo.ts:242](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L242)

### `memo.type`

Contains memo type: `MemoNone`, `MemoID`, `MemoText`, `MemoHash` or `MemoReturn`

```ts
type: T;
```

**Source:** [src/base/memo.ts:107](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L107)

### `memo.value`

Contains memo value:
* `null` for `MemoNone`,
* `string` for `MemoID`,
* `Buffer` for `MemoText` after decoding using `fromXDRObject`, original value otherwise,
* `Buffer` for `MemoHash`, `MemoReturn`.

```ts
value: MemoTypeToValue<T>;
```

**Source:** [src/base/memo.ts:122](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L122)

### `memo.toXDRObject()`

Returns XDR memo object.

```ts
toXDRObject(): Memo;
```

**Source:** [src/base/memo.ts:276](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L276)

## MemoHash

Type of `Memo`.

```ts
const MemoHash: "hash"
```

**Source:** [src/base/memo.ts:21](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L21)

## MemoID

Type of `Memo`.

```ts
const MemoID: "id"
```

**Source:** [src/base/memo.ts:13](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L13)

## MemoNone

Type of `Memo`.

```ts
const MemoNone: "none"
```

**Source:** [src/base/memo.ts:9](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L9)

## MemoReturn

Type of `Memo`.

```ts
const MemoReturn: "return"
```

**Source:** [src/base/memo.ts:25](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L25)

## MemoText

Type of `Memo`.

```ts
const MemoText: "text"
```

**Source:** [src/base/memo.ts:17](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L17)

## MemoType

```ts
type MemoType = MemoTypeHash | MemoTypeID | MemoTypeNone | MemoTypeReturn | MemoTypeText
```

**Source:** [src/base/memo.ts:33](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L33)

## MemoType.Hash

```ts
type Hash = MemoTypeHash
```

**Source:** [src/base/memo.ts:37](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L37)

## MemoType.ID

```ts
type ID = MemoTypeID
```

**Source:** [src/base/memo.ts:35](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L35)

## MemoType.None

```ts
type None = MemoTypeNone
```

**Source:** [src/base/memo.ts:34](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L34)

## MemoType.Return

```ts
type Return = MemoTypeReturn
```

**Source:** [src/base/memo.ts:38](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L38)

## MemoType.Text

```ts
type Text = MemoTypeText
```

**Source:** [src/base/memo.ts:36](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L36)

## MemoTypeHash

```ts
type MemoTypeHash = typeof MemoHash
```

**Source:** [src/base/memo.ts:30](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L30)

## MemoTypeID

```ts
type MemoTypeID = typeof MemoID
```

**Source:** [src/base/memo.ts:28](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L28)

## MemoTypeNone

```ts
type MemoTypeNone = typeof MemoNone
```

**Source:** [src/base/memo.ts:27](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L27)

## MemoTypeReturn

```ts
type MemoTypeReturn = typeof MemoReturn
```

**Source:** [src/base/memo.ts:31](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L31)

## MemoTypeText

```ts
type MemoTypeText = typeof MemoText
```

**Source:** [src/base/memo.ts:29](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L29)

## MemoValue

```ts
type MemoValue = Buffer | string | null
```

**Source:** [src/base/memo.ts:47](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/memo.ts#L47)

## MuxedAccount

Represents a muxed account for transactions and operations.

A muxed (or *multiplexed*) account (defined rigorously in
[CAP-27](https://stellar.org/protocol/cap-27) and briefly in
[SEP-23](https://stellar.org/protocol/sep-23)) is one that resolves a single
Stellar `G...` account to many different underlying IDs.

For example, you may have a single Stellar address for accounting purposes:
  GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ

Yet would like to use it for 4 different family members:
  1: MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAAGZFQ
  2: MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAALIWQ
  3: MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAAPYHQ
  4: MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAAAAQLQQ

This object makes it easy to create muxed accounts from regular accounts,
duplicate them, get/set the underlying IDs, etc. without mucking around with
the raw XDR.

Because muxed accounts are purely an off-chain convention, they all share the
sequence number tied to their underlying G... account. Thus, this object
*requires* an `Account` instance to be passed in, so that muxed
instances of an account can collectively modify the sequence number whenever
a muxed account is used as the source of a `Transaction` with `TransactionBuilder`.

```ts
class MuxedAccount {
  constructor(baseAccount: Account, id: string);
  static fromAddress(mAddress: string, sequenceNum: string): MuxedAccount;
  accountId(): string;
  baseAccount(): Account;
  equals(otherMuxedAccount: MuxedAccount): boolean;
  id(): string;
  incrementSequenceNumber(): void;
  sequenceNumber(): string;
  setId(id: string): MuxedAccount;
  toXDRObject(): MuxedAccount;
}
```

**See also**

- https://developers.stellar.org/docs/glossary/muxed-accounts/

**Source:** [src/base/muxed_account.ts:59](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/muxed_account.ts#L59)

### `new MuxedAccount(baseAccount, id)`

```ts
constructor(baseAccount: Account, id: string);
```

**Parameters**

- **`baseAccount`** — `Account` (required) — the `Account` instance representing the
      underlying G... address
- **`id`** — `string` (required) — a stringified uint64 value that represents the ID of the
      muxed account

**Source:** [src/base/muxed_account.ts:71](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/muxed_account.ts#L71)

### `MuxedAccount.fromAddress(mAddress, sequenceNum)`

Parses an M-address into a MuxedAccount object.

```ts
static fromAddress(mAddress: string, sequenceNum: string): MuxedAccount;
```

**Parameters**

- **`mAddress`** — `string` (required) — an M-address to transform
- **`sequenceNum`** — `string` (required) — the sequence number of the underlying `Account`, to use for the underlying base account `MuxedAccount.baseAccount`. If you're using the SDK, you can use
      `server.loadAccount` to fetch this if you don't know it.

**Source:** [src/base/muxed_account.ts:95](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/muxed_account.ts#L95)

### `muxedAccount.accountId()`

Returns the M-address representing this account's (G-address, ID).

```ts
accountId(): string;
```

**Source:** [src/base/muxed_account.ts:114](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/muxed_account.ts#L114)

### `muxedAccount.baseAccount()`

Returns the underlying account object shared among all muxed
accounts with this Stellar address.

```ts
baseAccount(): Account;
```

**Source:** [src/base/muxed_account.ts:107](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/muxed_account.ts#L107)

### `muxedAccount.equals(otherMuxedAccount)`

Checks whether two muxed accounts are equal by comparing their M-addresses.

```ts
equals(otherMuxedAccount: MuxedAccount): boolean;
```

**Parameters**

- **`otherMuxedAccount`** — `MuxedAccount` (required) — the MuxedAccount to compare against

**Source:** [src/base/muxed_account.ts:170](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/muxed_account.ts#L170)

### `muxedAccount.id()`

Returns the uint64 ID of this muxed account as a string.

```ts
id(): string;
```

**Source:** [src/base/muxed_account.ts:121](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/muxed_account.ts#L121)

### `muxedAccount.incrementSequenceNumber()`

Increments the underlying account's sequence number by one.

```ts
incrementSequenceNumber(): void;
```

**Source:** [src/base/muxed_account.ts:153](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/muxed_account.ts#L153)

### `muxedAccount.sequenceNumber()`

Returns the stringified sequence number for the underlying account.

```ts
sequenceNumber(): string;
```

**Source:** [src/base/muxed_account.ts:146](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/muxed_account.ts#L146)

### `muxedAccount.setId(id)`

Updates the muxed account's ID, regenerating the M-address accordingly.

```ts
setId(id: string): MuxedAccount;
```

**Parameters**

- **`id`** — `string` (required) — a stringified uint64 value to set as the new muxed account ID

**Source:** [src/base/muxed_account.ts:130](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/muxed_account.ts#L130)

### `muxedAccount.toXDRObject()`

Returns the XDR object representing this muxed account's
G-address and uint64 ID.

```ts
toXDRObject(): MuxedAccount;
```

**Source:** [src/base/muxed_account.ts:161](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/muxed_account.ts#L161)

## Networks

Contains passphrases for common networks:
* `Networks.PUBLIC`: `Public Global Stellar Network ; September 2015`
* `Networks.TESTNET`: `Test SDF Network ; September 2015`
* `Networks.FUTURENET`: `Test SDF Future Network ; October 2022`
* `Networks.SANDBOX`: `Local Sandbox Stellar Network ; September 2022`
* `Networks.STANDALONE`: `Standalone Network ; February 2017`

```ts
enum Networks
```

**Source:** [src/base/network.ts:9](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/network.ts#L9)

## Operation

`Operation` class represents
[operations](https://developers.stellar.org/docs/glossary/operations/) in
Stellar network.

Use one of static methods to create operations:
* [`Operation.createAccount`](#operationcreateaccount)
* [`Operation.payment`](#operationpayment)
* [`Operation.pathPaymentStrictReceive`](#operationpathpaymentstrictreceive)
* [`Operation.pathPaymentStrictSend`](#operationpathpaymentstrictsend)
* [`Operation.manageSellOffer`](#operationmanageselloffer)
* [`Operation.manageBuyOffer`](#operationmanagebuyoffer)
* [`Operation.createPassiveSellOffer`](#operationcreatepassiveselloffer)
* [`Operation.setOptions`](#operationsetoptions)
* [`Operation.changeTrust`](#operationchangetrust)
* [`Operation.allowTrust`](#operationallowtrust)
* [`Operation.accountMerge`](#operationaccountmerge)
* [`Operation.inflation`](#operationinflation)
* [`Operation.manageData`](#operationmanagedata)
* [`Operation.bumpSequence`](#operationbumpsequence)
* [`Operation.createClaimableBalance`](#operationcreateclaimablebalance)
* [`Operation.claimClaimableBalance`](#operationclaimclaimablebalance)
* [`Operation.beginSponsoringFutureReserves`](#operationbeginsponsoringfuturereserves)
* [`Operation.endSponsoringFutureReserves`](#operationendsponsoringfuturereserves)
* [`Operation.revokeAccountSponsorship`](#operationrevokeaccountsponsorship)
* [`Operation.revokeTrustlineSponsorship`](#operationrevoketrustlinesponsorship)
* [`Operation.revokeOfferSponsorship`](#operationrevokeoffersponsorship)
* [`Operation.revokeDataSponsorship`](#operationrevokedatasponsorship)
* [`Operation.revokeClaimableBalanceSponsorship`](#operationrevokeclaimablebalancesponsorship)
* [`Operation.revokeLiquidityPoolSponsorship`](#operationrevokeliquiditypoolsponsorship)
* [`Operation.revokeSignerSponsorship`](#operationrevokesignersponsorship)
* [`Operation.clawback`](#operationclawback)
* [`Operation.clawbackClaimableBalance`](#operationclawbackclaimablebalance)
* [`Operation.setTrustLineFlags`](#operationsettrustlineflags)
* [`Operation.liquidityPoolDeposit`](#operationliquiditypooldeposit)
* [`Operation.liquidityPoolWithdraw`](#operationliquiditypoolwithdraw)
* [`Operation.invokeHostFunction`](#operationinvokehostfunction), which has the following additional
  "pseudo-operations" that make building host functions easier:
  - [`Operation.createStellarAssetContract`](#operationcreatestellarassetcontract)
  - [`Operation.invokeContractFunction`](#operationinvokecontractfunction)
  - [`Operation.createCustomContract`](#operationcreatecustomcontract)
  - [`Operation.uploadContractWasm`](#operationuploadcontractwasm)
* `Operation.extendFootprintTtlOp`
* [`Operation.restoreFootprint`](#operationrestorefootprint)

```ts
class Operation {
  constructor();
  static accountMerge: (opts: AccountMergeOpts) => Operation2<AccountMergeResult>;
  static allowTrust: (opts: AllowTrustOpts) => Operation2<AllowTrustResult>;
  static beginSponsoringFutureReserves: (opts: BeginSponsoringFutureReservesOpts) => Operation2<BeginSponsoringFutureReservesResult>;
  static bumpSequence: (opts: BumpSequenceOpts) => Operation2<BumpSequenceResult>;
  static changeTrust: (opts: ChangeTrustOpts) => Operation2<ChangeTrustResult>;
  static claimClaimableBalance: (opts: ClaimClaimableBalanceOpts = ...) => Operation2<ClaimClaimableBalanceResult>;
  static clawback: (opts: ClawbackOpts) => Operation2<ClawbackResult>;
  static clawbackClaimableBalance: (opts: ClawbackClaimableBalanceOpts = ...) => Operation2<ClawbackClaimableBalanceResult>;
  static createAccount: (opts: CreateAccountOpts) => Operation2<CreateAccountResult>;
  static createClaimableBalance: (opts: CreateClaimableBalanceOpts) => Operation2<CreateClaimableBalanceResult>;
  static createCustomContract: (opts: CreateCustomContractOpts) => Operation2<InvokeHostFunctionResult>;
  static createPassiveSellOffer: (opts: CreatePassiveSellOfferOpts) => Operation2<CreatePassiveSellOfferResult>;
  static createStellarAssetContract: (opts: CreateStellarAssetContractOpts) => Operation2<InvokeHostFunctionResult>;
  static endSponsoringFutureReserves: (opts: EndSponsoringFutureReservesOpts = {}) => Operation2<EndSponsoringFutureReservesResult>;
  static extendFootprintTtl: (opts: ExtendFootprintTtlOpts) => Operation2<ExtendFootprintTTLResult>;
  static inflation: (opts: InflationOpts = {}) => Operation2<InflationResult>;
  static invokeContractFunction: (opts: InvokeContractFunctionOpts) => Operation2<InvokeHostFunctionResult>;
  static invokeHostFunction: (opts: InvokeHostFunctionOpts) => Operation2<InvokeHostFunctionResult>;
  static liquidityPoolDeposit: (opts: LiquidityPoolDepositOpts = ...) => Operation2<LiquidityPoolDepositResult>;
  static liquidityPoolWithdraw: (opts: LiquidityPoolWithdrawOpts = ...) => Operation2<LiquidityPoolWithdrawResult>;
  static manageBuyOffer: (opts: ManageBuyOfferOpts) => Operation2<ManageBuyOfferResult>;
  static manageData: (opts: ManageDataOpts) => Operation2<ManageDataResult>;
  static manageSellOffer: (opts: ManageSellOfferOpts) => Operation2<ManageSellOfferResult>;
  static pathPaymentStrictReceive: (opts: PathPaymentStrictReceiveOpts) => Operation2<PathPaymentStrictReceiveResult>;
  static pathPaymentStrictSend: (opts: PathPaymentStrictSendOpts) => Operation2<PathPaymentStrictSendResult>;
  static payment: (opts: PaymentOpts) => Operation2<PaymentResult>;
  static restoreFootprint: (opts: RestoreFootprintOpts = {}) => Operation2<RestoreFootprintResult>;
  static revokeAccountSponsorship: (opts: RevokeAccountSponsorshipOpts = ...) => Operation2<RevokeAccountSponsorshipResult>;
  static revokeClaimableBalanceSponsorship: (opts: RevokeClaimableBalanceSponsorshipOpts = ...) => Operation2<RevokeClaimableBalanceSponsorshipResult>;
  static revokeDataSponsorship: (opts: RevokeDataSponsorshipOpts = ...) => Operation2<RevokeDataSponsorshipResult>;
  static revokeLiquidityPoolSponsorship: (opts: RevokeLiquidityPoolSponsorshipOpts = ...) => Operation2<RevokeLiquidityPoolSponsorshipResult>;
  static revokeOfferSponsorship: (opts: RevokeOfferSponsorshipOpts = ...) => Operation2<RevokeOfferSponsorshipResult>;
  static revokeSignerSponsorship: (opts: RevokeSignerSponsorshipOpts = ...) => Operation2<RevokeSignerSponsorshipResult>;
  static revokeTrustlineSponsorship: (opts: RevokeTrustlineSponsorshipOpts = ...) => Operation2<RevokeTrustlineSponsorshipResult>;
  static setOptions: <T extends SignerOpts = never>(opts: SetOptionsOpts<T>) => Operation2<SetOptionsResult<T>>;
  static setTrustLineFlags: (opts: SetTrustLineFlagsOpts) => Operation2<SetTrustLineFlagsResult>;
  static uploadContractWasm: (opts: UploadContractWasmOpts) => Operation2<InvokeHostFunctionResult>;
  static fromXDRObject<T extends OperationRecord = OperationRecord>(operation: Operation2<T>): T;
}
```

**Source:** [src/base/operation.ts:131](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L131)

### `new Operation()`

```ts
constructor();
```

### `Operation.accountMerge`

```ts
static accountMerge: (opts: AccountMergeOpts) => Operation2<AccountMergeResult>;
```

**Source:** [src/base/operation.ts:436](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L436)

### `Operation.allowTrust`

```ts
static allowTrust: (opts: AllowTrustOpts) => Operation2<AllowTrustResult>;
```

**Source:** [src/base/operation.ts:437](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L437)

### `Operation.beginSponsoringFutureReserves`

```ts
static beginSponsoringFutureReserves: (opts: BeginSponsoringFutureReservesOpts) => Operation2<BeginSponsoringFutureReservesResult>;
```

**Source:** [src/base/operation.ts:453](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L453)

### `Operation.bumpSequence`

```ts
static bumpSequence: (opts: BumpSequenceOpts) => Operation2<BumpSequenceResult>;
```

**Source:** [src/base/operation.ts:438](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L438)

### `Operation.changeTrust`

```ts
static changeTrust: (opts: ChangeTrustOpts) => Operation2<ChangeTrustResult>;
```

**Source:** [src/base/operation.ts:439](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L439)

### `Operation.claimClaimableBalance`

```ts
static claimClaimableBalance: (opts: ClaimClaimableBalanceOpts = ...) => Operation2<ClaimClaimableBalanceResult>;
```

**Source:** [src/base/operation.ts:442](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L442)

### `Operation.clawback`

```ts
static clawback: (opts: ClawbackOpts) => Operation2<ClawbackResult>;
```

**Source:** [src/base/operation.ts:463](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L463)

### `Operation.clawbackClaimableBalance`

```ts
static clawbackClaimableBalance: (opts: ClawbackClaimableBalanceOpts = ...) => Operation2<ClawbackClaimableBalanceResult>;
```

**Source:** [src/base/operation.ts:443](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L443)

### `Operation.createAccount`

```ts
static createAccount: (opts: CreateAccountOpts) => Operation2<CreateAccountResult>;
```

**Source:** [src/base/operation.ts:440](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L440)

### `Operation.createClaimableBalance`

```ts
static createClaimableBalance: (opts: CreateClaimableBalanceOpts) => Operation2<CreateClaimableBalanceResult>;
```

**Source:** [src/base/operation.ts:441](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L441)

### `Operation.createCustomContract`

```ts
static createCustomContract: (opts: CreateCustomContractOpts) => Operation2<InvokeHostFunctionResult>;
```

**Source:** [src/base/operation.ts:475](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L475)

### `Operation.createPassiveSellOffer`

```ts
static createPassiveSellOffer: (opts: CreatePassiveSellOfferOpts) => Operation2<CreatePassiveSellOfferResult>;
```

**Source:** [src/base/operation.ts:444](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L444)

### `Operation.createStellarAssetContract`

```ts
static createStellarAssetContract: (opts: CreateStellarAssetContractOpts) => Operation2<InvokeHostFunctionResult>;
```

**Source:** [src/base/operation.ts:473](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L473)

### `Operation.endSponsoringFutureReserves`

```ts
static endSponsoringFutureReserves: (opts: EndSponsoringFutureReservesOpts = {}) => Operation2<EndSponsoringFutureReservesResult>;
```

**Source:** [src/base/operation.ts:454](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L454)

### `Operation.extendFootprintTtl`

```ts
static extendFootprintTtl: (opts: ExtendFootprintTtlOpts) => Operation2<ExtendFootprintTTLResult>;
```

**Source:** [src/base/operation.ts:468](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L468)

### `Operation.inflation`

```ts
static inflation: (opts: InflationOpts = {}) => Operation2<InflationResult>;
```

**Source:** [src/base/operation.ts:445](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L445)

### `Operation.invokeContractFunction`

```ts
static invokeContractFunction: (opts: InvokeContractFunctionOpts) => Operation2<InvokeHostFunctionResult>;
```

**Source:** [src/base/operation.ts:474](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L474)

### `Operation.invokeHostFunction`

```ts
static invokeHostFunction: (opts: InvokeHostFunctionOpts) => Operation2<InvokeHostFunctionResult>;
```

**Source:** [src/base/operation.ts:467](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L467)

### `Operation.liquidityPoolDeposit`

```ts
static liquidityPoolDeposit: (opts: LiquidityPoolDepositOpts = ...) => Operation2<LiquidityPoolDepositResult>;
```

**Source:** [src/base/operation.ts:465](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L465)

### `Operation.liquidityPoolWithdraw`

```ts
static liquidityPoolWithdraw: (opts: LiquidityPoolWithdrawOpts = ...) => Operation2<LiquidityPoolWithdrawResult>;
```

**Source:** [src/base/operation.ts:466](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L466)

### `Operation.manageBuyOffer`

```ts
static manageBuyOffer: (opts: ManageBuyOfferOpts) => Operation2<ManageBuyOfferResult>;
```

**Source:** [src/base/operation.ts:448](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L448)

### `Operation.manageData`

```ts
static manageData: (opts: ManageDataOpts) => Operation2<ManageDataResult>;
```

**Source:** [src/base/operation.ts:446](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L446)

### `Operation.manageSellOffer`

```ts
static manageSellOffer: (opts: ManageSellOfferOpts) => Operation2<ManageSellOfferResult>;
```

**Source:** [src/base/operation.ts:447](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L447)

### `Operation.pathPaymentStrictReceive`

```ts
static pathPaymentStrictReceive: (opts: PathPaymentStrictReceiveOpts) => Operation2<PathPaymentStrictReceiveResult>;
```

**Source:** [src/base/operation.ts:449](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L449)

### `Operation.pathPaymentStrictSend`

```ts
static pathPaymentStrictSend: (opts: PathPaymentStrictSendOpts) => Operation2<PathPaymentStrictSendResult>;
```

**Source:** [src/base/operation.ts:450](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L450)

### `Operation.payment`

```ts
static payment: (opts: PaymentOpts) => Operation2<PaymentResult>;
```

**Source:** [src/base/operation.ts:451](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L451)

### `Operation.restoreFootprint`

```ts
static restoreFootprint: (opts: RestoreFootprintOpts = {}) => Operation2<RestoreFootprintResult>;
```

**Source:** [src/base/operation.ts:469](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L469)

### `Operation.revokeAccountSponsorship`

```ts
static revokeAccountSponsorship: (opts: RevokeAccountSponsorshipOpts = ...) => Operation2<RevokeAccountSponsorshipResult>;
```

**Source:** [src/base/operation.ts:455](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L455)

### `Operation.revokeClaimableBalanceSponsorship`

```ts
static revokeClaimableBalanceSponsorship: (opts: RevokeClaimableBalanceSponsorshipOpts = ...) => Operation2<RevokeClaimableBalanceSponsorshipResult>;
```

**Source:** [src/base/operation.ts:459](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L459)

### `Operation.revokeDataSponsorship`

```ts
static revokeDataSponsorship: (opts: RevokeDataSponsorshipOpts = ...) => Operation2<RevokeDataSponsorshipResult>;
```

**Source:** [src/base/operation.ts:458](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L458)

### `Operation.revokeLiquidityPoolSponsorship`

```ts
static revokeLiquidityPoolSponsorship: (opts: RevokeLiquidityPoolSponsorshipOpts = ...) => Operation2<RevokeLiquidityPoolSponsorshipResult>;
```

**Source:** [src/base/operation.ts:461](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L461)

### `Operation.revokeOfferSponsorship`

```ts
static revokeOfferSponsorship: (opts: RevokeOfferSponsorshipOpts = ...) => Operation2<RevokeOfferSponsorshipResult>;
```

**Source:** [src/base/operation.ts:457](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L457)

### `Operation.revokeSignerSponsorship`

```ts
static revokeSignerSponsorship: (opts: RevokeSignerSponsorshipOpts = ...) => Operation2<RevokeSignerSponsorshipResult>;
```

**Source:** [src/base/operation.ts:462](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L462)

### `Operation.revokeTrustlineSponsorship`

```ts
static revokeTrustlineSponsorship: (opts: RevokeTrustlineSponsorshipOpts = ...) => Operation2<RevokeTrustlineSponsorshipResult>;
```

**Source:** [src/base/operation.ts:456](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L456)

### `Operation.setOptions`

```ts
static setOptions: <T extends SignerOpts = never>(opts: SetOptionsOpts<T>) => Operation2<SetOptionsResult<T>>;
```

**Source:** [src/base/operation.ts:452](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L452)

### `Operation.setTrustLineFlags`

```ts
static setTrustLineFlags: (opts: SetTrustLineFlagsOpts) => Operation2<SetTrustLineFlagsResult>;
```

**Source:** [src/base/operation.ts:464](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L464)

### `Operation.uploadContractWasm`

```ts
static uploadContractWasm: (opts: UploadContractWasmOpts) => Operation2<InvokeHostFunctionResult>;
```

**Source:** [src/base/operation.ts:476](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L476)

### `Operation.fromXDRObject(operation)`

Deconstructs the raw XDR operation object into the structured object that
was used to create the operation (i.e. the `opts` parameter to most ops).

```ts
static fromXDRObject<T extends OperationRecord = OperationRecord>(operation: Operation2<T>): T;
```

**Parameters**

- **`operation`** — `Operation2<T>` (required) — An XDR Operation.

**Source:** [src/base/operation.ts:139](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L139)

## Operation.AccountMerge

```ts
type AccountMerge = AccountMergeResult
```

**Source:** [src/base/operation.ts:613](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L613)

## Operation.AllowTrust

```ts
type AllowTrust = AllowTrustResult
```

**Source:** [src/base/operation.ts:612](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L612)

## Operation.BaseOperation

```ts
type BaseOperation<T extends _OperationType = _OperationType> = _BaseOperation<T>
```

**Source:** [src/base/operation.ts:601](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L601)

## Operation.BeginSponsoringFutureReserves

```ts
type BeginSponsoringFutureReserves = BeginSponsoringFutureReservesResult
```

**Source:** [src/base/operation.ts:619](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L619)

## Operation.BumpSequence

```ts
type BumpSequence = BumpSequenceResult
```

**Source:** [src/base/operation.ts:616](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L616)

## Operation.ChangeTrust

```ts
type ChangeTrust = ChangeTrustResult
```

**Source:** [src/base/operation.ts:611](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L611)

## Operation.ClaimClaimableBalance

```ts
type ClaimClaimableBalance = ClaimClaimableBalanceResult
```

**Source:** [src/base/operation.ts:618](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L618)

## Operation.Clawback

```ts
type Clawback = ClawbackResult
```

**Source:** [src/base/operation.ts:631](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L631)

## Operation.ClawbackClaimableBalance

```ts
type ClawbackClaimableBalance = ClawbackClaimableBalanceResult
```

**Source:** [src/base/operation.ts:632](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L632)

## Operation.CreateAccount

```ts
type CreateAccount = CreateAccountResult
```

**Source:** [src/base/operation.ts:603](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L603)

## Operation.CreateClaimableBalance

```ts
type CreateClaimableBalance = CreateClaimableBalanceResult
```

**Source:** [src/base/operation.ts:617](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L617)

## Operation.CreatePassiveSellOffer

```ts
type CreatePassiveSellOffer = CreatePassiveSellOfferResult
```

**Source:** [src/base/operation.ts:607](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L607)

## Operation.EndSponsoringFutureReserves

```ts
type EndSponsoringFutureReserves = EndSponsoringFutureReservesResult
```

**Source:** [src/base/operation.ts:621](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L621)

## Operation.ExtendFootprintTTL

```ts
type ExtendFootprintTTL = ExtendFootprintTTLResult
```

**Source:** [src/base/operation.ts:637](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L637)

## Operation.Inflation

```ts
type Inflation = InflationResult
```

**Source:** [src/base/operation.ts:614](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L614)

## Operation.InvokeHostFunction

```ts
type InvokeHostFunction = InvokeHostFunctionResult
```

**Source:** [src/base/operation.ts:636](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L636)

## Operation.LiquidityPoolDeposit

```ts
type LiquidityPoolDeposit = LiquidityPoolDepositResult
```

**Source:** [src/base/operation.ts:634](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L634)

## Operation.LiquidityPoolWithdraw

```ts
type LiquidityPoolWithdraw = LiquidityPoolWithdrawResult
```

**Source:** [src/base/operation.ts:635](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L635)

## Operation.ManageBuyOffer

```ts
type ManageBuyOffer = ManageBuyOfferResult
```

**Source:** [src/base/operation.ts:609](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L609)

## Operation.ManageData

```ts
type ManageData = ManageDataResult
```

**Source:** [src/base/operation.ts:615](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L615)

## Operation.ManageSellOffer

```ts
type ManageSellOffer = ManageSellOfferResult
```

**Source:** [src/base/operation.ts:608](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L608)

## Operation.PathPaymentStrictReceive

```ts
type PathPaymentStrictReceive = PathPaymentStrictReceiveResult
```

**Source:** [src/base/operation.ts:605](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L605)

## Operation.PathPaymentStrictSend

```ts
type PathPaymentStrictSend = PathPaymentStrictSendResult
```

**Source:** [src/base/operation.ts:606](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L606)

## Operation.Payment

```ts
type Payment = PaymentResult
```

**Source:** [src/base/operation.ts:604](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L604)

## Operation.RestoreFootprint

```ts
type RestoreFootprint = RestoreFootprintResult
```

**Source:** [src/base/operation.ts:638](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L638)

## Operation.RevokeAccountSponsorship

```ts
type RevokeAccountSponsorship = RevokeAccountSponsorshipResult
```

**Source:** [src/base/operation.ts:622](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L622)

## Operation.RevokeClaimableBalanceSponsorship

```ts
type RevokeClaimableBalanceSponsorship = RevokeClaimableBalanceSponsorshipResult
```

**Source:** [src/base/operation.ts:626](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L626)

## Operation.RevokeDataSponsorship

```ts
type RevokeDataSponsorship = RevokeDataSponsorshipResult
```

**Source:** [src/base/operation.ts:625](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L625)

## Operation.RevokeLiquidityPoolSponsorship

```ts
type RevokeLiquidityPoolSponsorship = RevokeLiquidityPoolSponsorshipResult
```

**Source:** [src/base/operation.ts:628](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L628)

## Operation.RevokeOfferSponsorship

```ts
type RevokeOfferSponsorship = RevokeOfferSponsorshipResult
```

**Source:** [src/base/operation.ts:624](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L624)

## Operation.RevokeSignerSponsorship

```ts
type RevokeSignerSponsorship = RevokeSignerSponsorshipResult
```

**Source:** [src/base/operation.ts:630](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L630)

## Operation.RevokeTrustlineSponsorship

```ts
type RevokeTrustlineSponsorship = RevokeTrustlineSponsorshipResult
```

**Source:** [src/base/operation.ts:623](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L623)

## Operation.SetOptions

```ts
type SetOptions = SetOptionsResult<Signer>
```

**Source:** [src/base/operation.ts:610](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L610)

## Operation.SetTrustLineFlags

```ts
type SetTrustLineFlags = SetTrustLineFlagsResult
```

**Source:** [src/base/operation.ts:633](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operation.ts#L633)

## OperationOptions

```ts
type OperationOptions = AccountMergeOpts | AllowTrustOpts | BeginSponsoringFutureReservesOpts | BumpSequenceOpts | ChangeTrustOpts | ClaimClaimableBalanceOpts | ClawbackClaimableBalanceOpts | ClawbackOpts | CreateAccountOpts | CreateClaimableBalanceOpts | CreateCustomContractOpts | CreatePassiveSellOfferOpts | CreateStellarAssetContractOpts | EndSponsoringFutureReservesOpts | ExtendFootprintTtlOpts | InflationOpts | InvokeContractFunctionOpts | InvokeHostFunctionOpts | LiquidityPoolDepositOpts | LiquidityPoolWithdrawOpts | ManageBuyOfferOpts | ManageDataOpts | ManageSellOfferOpts | PathPaymentStrictReceiveOpts | PathPaymentStrictSendOpts | PaymentOpts | RestoreFootprintOpts | RevokeAccountSponsorshipOpts | RevokeClaimableBalanceSponsorshipOpts | RevokeDataSponsorshipOpts | RevokeLiquidityPoolSponsorshipOpts | RevokeOfferSponsorshipOpts | RevokeSignerSponsorshipOpts | RevokeTrustlineSponsorshipOpts | SetOptionsOpts | SetTrustLineFlagsOpts | UploadContractWasmOpts
```

**Source:** [src/base/operations/types.ts:311](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L311)

## OperationRecord

Union of all possible operation objects returned by Operation.fromXDRObject.

```ts
type OperationRecord = AccountMergeResult | AllowTrustResult | BeginSponsoringFutureReservesResult | BumpSequenceResult | ChangeTrustResult | ClaimClaimableBalanceResult | ClawbackClaimableBalanceResult | ClawbackResult | CreateAccountResult | CreateClaimableBalanceResult | CreatePassiveSellOfferResult | EndSponsoringFutureReservesResult | ExtendFootprintTTLResult | InflationResult | InvokeHostFunctionResult | LiquidityPoolDepositResult | LiquidityPoolWithdrawResult | ManageBuyOfferResult | ManageDataResult | ManageSellOfferResult | PathPaymentStrictReceiveResult | PathPaymentStrictSendResult | PaymentResult | RestoreFootprintResult | RevokeAccountSponsorshipResult | RevokeClaimableBalanceSponsorshipResult | RevokeDataSponsorshipResult | RevokeLiquidityPoolSponsorshipResult | RevokeOfferSponsorshipResult | RevokeSignerSponsorshipResult | RevokeTrustlineSponsorshipResult | SetOptionsResult<SignerOpts> | SetTrustLineFlagsResult
```

**Source:** [src/base/operations/types.ts:677](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L677)

## OperationType

```ts
type OperationType = OperationType.AccountMerge | OperationType.AllowTrust | OperationType.BeginSponsoringFutureReserves | OperationType.BumpSequence | OperationType.ChangeTrust | OperationType.ClaimClaimableBalance | OperationType.Clawback | OperationType.ClawbackClaimableBalance | OperationType.CreateAccount | OperationType.CreateClaimableBalance | OperationType.CreatePassiveSellOffer | OperationType.EndSponsoringFutureReserves | OperationType.ExtendFootprintTTL | OperationType.Inflation | OperationType.InvokeHostFunction | OperationType.LiquidityPoolDeposit | OperationType.LiquidityPoolWithdraw | OperationType.ManageBuyOffer | OperationType.ManageData | OperationType.ManageSellOffer | OperationType.PathPaymentStrictReceive | OperationType.PathPaymentStrictSend | OperationType.Payment | OperationType.RestoreFootprint | OperationType.RevokeAccountSponsorship | OperationType.RevokeClaimableBalanceSponsorship | OperationType.RevokeDataSponsorship | OperationType.RevokeLiquidityPoolSponsorship | OperationType.RevokeOfferSponsorship | OperationType.RevokeSignerSponsorship | OperationType.RevokeTrustlineSponsorship | OperationType.SetOptions | OperationType.SetTrustLineFlags
```

**Source:** [src/base/operations/types.ts:354](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L354)

## OperationType.AccountMerge

```ts
type AccountMerge = "accountMerge"
```

**Source:** [src/base/operations/types.ts:365](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L365)

## OperationType.AllowTrust

```ts
type AllowTrust = "allowTrust"
```

**Source:** [src/base/operations/types.ts:364](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L364)

## OperationType.BeginSponsoringFutureReserves

```ts
type BeginSponsoringFutureReserves = "beginSponsoringFutureReserves"
```

**Source:** [src/base/operations/types.ts:371](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L371)

## OperationType.BumpSequence

```ts
type BumpSequence = "bumpSequence"
```

**Source:** [src/base/operations/types.ts:368](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L368)

## OperationType.ChangeTrust

```ts
type ChangeTrust = "changeTrust"
```

**Source:** [src/base/operations/types.ts:363](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L363)

## OperationType.ClaimClaimableBalance

```ts
type ClaimClaimableBalance = "claimClaimableBalance"
```

**Source:** [src/base/operations/types.ts:370](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L370)

## OperationType.Clawback

```ts
type Clawback = "clawback"
```

**Source:** [src/base/operations/types.ts:383](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L383)

## OperationType.ClawbackClaimableBalance

```ts
type ClawbackClaimableBalance = "clawbackClaimableBalance"
```

**Source:** [src/base/operations/types.ts:384](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L384)

## OperationType.CreateAccount

```ts
type CreateAccount = "createAccount"
```

**Source:** [src/base/operations/types.ts:355](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L355)

## OperationType.CreateClaimableBalance

```ts
type CreateClaimableBalance = "createClaimableBalance"
```

**Source:** [src/base/operations/types.ts:369](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L369)

## OperationType.CreatePassiveSellOffer

```ts
type CreatePassiveSellOffer = "createPassiveSellOffer"
```

**Source:** [src/base/operations/types.ts:359](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L359)

## OperationType.EndSponsoringFutureReserves

```ts
type EndSponsoringFutureReserves = "endSponsoringFutureReserves"
```

**Source:** [src/base/operations/types.ts:372](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L372)

## OperationType.ExtendFootprintTTL

```ts
type ExtendFootprintTTL = "extendFootprintTtl"
```

**Source:** [src/base/operations/types.ts:389](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L389)

## OperationType.Inflation

```ts
type Inflation = "inflation"
```

**Source:** [src/base/operations/types.ts:366](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L366)

## OperationType.InvokeHostFunction

```ts
type InvokeHostFunction = "invokeHostFunction"
```

**Source:** [src/base/operations/types.ts:388](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L388)

## OperationType.LiquidityPoolDeposit

```ts
type LiquidityPoolDeposit = "liquidityPoolDeposit"
```

**Source:** [src/base/operations/types.ts:386](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L386)

## OperationType.LiquidityPoolWithdraw

```ts
type LiquidityPoolWithdraw = "liquidityPoolWithdraw"
```

**Source:** [src/base/operations/types.ts:387](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L387)

## OperationType.ManageBuyOffer

```ts
type ManageBuyOffer = "manageBuyOffer"
```

**Source:** [src/base/operations/types.ts:361](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L361)

## OperationType.ManageData

```ts
type ManageData = "manageData"
```

**Source:** [src/base/operations/types.ts:367](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L367)

## OperationType.ManageSellOffer

```ts
type ManageSellOffer = "manageSellOffer"
```

**Source:** [src/base/operations/types.ts:360](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L360)

## OperationType.PathPaymentStrictReceive

```ts
type PathPaymentStrictReceive = "pathPaymentStrictReceive"
```

**Source:** [src/base/operations/types.ts:357](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L357)

## OperationType.PathPaymentStrictSend

```ts
type PathPaymentStrictSend = "pathPaymentStrictSend"
```

**Source:** [src/base/operations/types.ts:358](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L358)

## OperationType.Payment

```ts
type Payment = "payment"
```

**Source:** [src/base/operations/types.ts:356](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L356)

## OperationType.RestoreFootprint

```ts
type RestoreFootprint = "restoreFootprint"
```

**Source:** [src/base/operations/types.ts:390](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L390)

## OperationType.RevokeAccountSponsorship

```ts
type RevokeAccountSponsorship = "revokeAccountSponsorship"
```

**Source:** [src/base/operations/types.ts:375](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L375)

## OperationType.RevokeClaimableBalanceSponsorship

```ts
type RevokeClaimableBalanceSponsorship = "revokeClaimableBalanceSponsorship"
```

**Source:** [src/base/operations/types.ts:379](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L379)

## OperationType.RevokeDataSponsorship

```ts
type RevokeDataSponsorship = "revokeDataSponsorship"
```

**Source:** [src/base/operations/types.ts:378](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L378)

## OperationType.RevokeLiquidityPoolSponsorship

```ts
type RevokeLiquidityPoolSponsorship = "revokeLiquidityPoolSponsorship"
```

**Source:** [src/base/operations/types.ts:381](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L381)

## OperationType.RevokeOfferSponsorship

```ts
type RevokeOfferSponsorship = "revokeOfferSponsorship"
```

**Source:** [src/base/operations/types.ts:377](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L377)

## OperationType.RevokeSignerSponsorship

```ts
type RevokeSignerSponsorship = "revokeSignerSponsorship"
```

**Source:** [src/base/operations/types.ts:382](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L382)

## OperationType.RevokeSponsorship

**Deprecated.** Never emitted by fromXDRObject — use the specific Revoke* types instead.

```ts
type RevokeSponsorship = "revokeSponsorship"
```

**Source:** [src/base/operations/types.ts:374](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L374)

## OperationType.RevokeTrustlineSponsorship

```ts
type RevokeTrustlineSponsorship = "revokeTrustlineSponsorship"
```

**Source:** [src/base/operations/types.ts:376](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L376)

## OperationType.SetOptions

```ts
type SetOptions = "setOptions"
```

**Source:** [src/base/operations/types.ts:362](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L362)

## OperationType.SetTrustLineFlags

```ts
type SetTrustLineFlags = "setTrustLineFlags"
```

**Source:** [src/base/operations/types.ts:385](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L385)

## ScInt

Provides an easier way to manipulate large numbers for Stellar operations.

You can instantiate this "**s**mart **c**ontract integer" value either from
bigints, strings, or numbers (whole numbers, or this will throw).

If you need to create a native BigInt from a list of integer "parts" (for
example, you have a series of encoded 32-bit integers that represent a larger
value), you can use the lower level abstraction `XdrLargeInt`. For
example, you could do `new XdrLargeInt('u128', bytes...).toBigInt()`.

```ts
class ScInt extends XdrLargeInt {
  constructor(value: string | number | bigint, opts?: { type?: ScIntType; [key: string]: unknown });
  static getType(scvType: string): ScIntType | undefined;
  static isType(type: string): type is ScIntType;
  int: LargeInt;
  type: ScIntType;
  toBigInt(): bigint;
  toDuration(): ScVal;
  toI128(): ScVal;
  toI256(): ScVal;
  toI64(): ScVal;
  toJSON(): { type: string; value: string };
  toNumber(): number;
  toScVal(): ScVal;
  toString(): string;
  toTimepoint(): ScVal;
  toU128(): ScVal;
  toU256(): ScVal;
  toU64(): ScVal;
  valueOf(): unknown;
}
```

**Example**

```ts
import { xdr, ScInt, scValToBigInt } from "@stellar/stellar-base";

// You have an ScVal from a contract and want to parse it into JS native.
const value = xdr.ScVal.fromXDR(someXdr, "base64");
const bigi = scValToBigInt(value); // grab it as a BigInt
let sci = new ScInt(bigi);

sci.toNumber(); // gives native JS type (w/ size check)
sci.toBigInt(); // gives the native BigInt value
sci.toU64();    // gives ScValType-specific XDR constructs (with size checks)

// You have a number and want to shove it into a contract.
sci = new ScInt(0xdeadcafebabe);
sci.toBigInt() // returns 244838016400062n
sci.toNumber() // throws: too large

// Pass any to e.g. a Contract.call(), conversion happens automatically
// regardless of the initial type.
const scValU128 = sci.toU128();
const scValI256 = sci.toI256();
const scValU64  = sci.toU64();

// Lots of ways to initialize:
new ScInt("123456789123456789")
new ScInt(123456789123456789n);
new ScInt(1n << 140n);
new ScInt(-42);
new ScInt(scValToBigInt(scValU128)); // from above

// If you know the type ahead of time (accessing `.raw` is faster than
// conversions), you can specify the type directly (otherwise, it's
// interpreted from the numbers you pass in):
const i = new ScInt(123456789n, { type: "u256" });

// For example, you can use the underlying `sdk.U256` and convert it to an
// `xdr.ScVal` directly like so:
const scv = new xdr.ScVal.scvU256(i.raw);

// Or reinterpret it as a different type (size permitting):
const scv = i.toI64();
```

**Source:** [src/base/numbers/sc_int.ts:63](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/sc_int.ts#L63)

### `new ScInt(value, opts)`

```ts
constructor(value: string | number | bigint, opts?: { type?: ScIntType; [key: string]: unknown });
```

**Parameters**

- **`value`** — `string | number | bigint` (required) — a single, integer-like value which will
     be interpreted in the smallest appropriate XDR type supported by Stellar
     (64, 128, or 256 bit integer values). signed values are supported, though
     they are sanity-checked against `opts.type`. if you need 32-bit values,
     you can construct them directly without needing this wrapper, e.g.
     `xdr.ScVal.scvU32(1234)`.
- **`opts`** — `{ type?: ScIntType; [key: string]: unknown }` (optional) — an optional object controlling optional parameters
    - `type`: specify a type ('i64', 'u64', 'i128', 'u128', 'i256',
     or 'u256') to override the default type selection. If not specified, the
     smallest type that fits the value is used.

**Source:** [src/base/numbers/sc_int.ts:76](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/sc_int.ts#L76)

### `ScInt.getType(scvType)`

Convert the raw `ScValType` string (e.g. 'scvI128', generated by the XDR)
to a type description for `XdrLargeInt` construction (e.g. 'i128')

```ts
static getType(scvType: string): ScIntType | undefined;
```

**Parameters**

- **`scvType`** — `string` (required) — the `xdr.ScValType` as a string

**Returns**

the corresponding `ScIntType` if it's an integer type, or
   `undefined` if it's not an integer type

**Source:** [src/base/numbers/xdr_large_int.ts:322](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L322)

### `ScInt.isType(type)`

Returns true if the given string is a valid XDR large integer type name.

```ts
static isType(type: string): type is ScIntType;
```

**Parameters**

- **`type`** — `string` (required)

**Source:** [src/base/numbers/xdr_large_int.ts:298](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L298)

### `scInt.int`

```ts
int: LargeInt;
```

**Source:** [src/base/numbers/xdr_large_int.ts:36](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L36)

### `scInt.type`

```ts
type: ScIntType;
```

**Source:** [src/base/numbers/xdr_large_int.ts:37](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L37)

### `scInt.toBigInt()`

Converts to a native BigInt.

```ts
toBigInt(): bigint;
```

**Source:** [src/base/numbers/xdr_large_int.ts:116](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L116)

### `scInt.toDuration()`

The integer encoded with `ScValType = Duration`

```ts
toDuration(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:152](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L152)

### `scInt.toI128()`

The integer encoded with `ScValType = I128`.

```ts
toI128(): ScVal;
```

**Throws**

- if the value cannot fit in 128 bits

**Source:** [src/base/numbers/xdr_large_int.ts:164](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L164)

### `scInt.toI256()`

The integer encoded with `ScValType = I256`

```ts
toI256(): ScVal;
```

**Throws**

- if the value cannot fit in a signed 256-bit integer

**Source:** [src/base/numbers/xdr_large_int.ts:204](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L204)

### `scInt.toI64()`

The integer encoded with `ScValType = I64`.

```ts
toI64(): ScVal;
```

**Throws**

- if the value cannot fit in 64 bits

**Source:** [src/base/numbers/xdr_large_int.ts:125](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L125)

### `scInt.toJSON()`

Returns a JSON-friendly representation with `value` and `type` fields.

```ts
toJSON(): { type: string; value: string };
```

**Source:** [src/base/numbers/xdr_large_int.ts:284](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L284)

### `scInt.toNumber()`

Converts to a native JS number.

```ts
toNumber(): number;
```

**Throws**

- if the value can't fit into a Number

**Source:** [src/base/numbers/xdr_large_int.ts:103](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L103)

### `scInt.toScVal()`

The smallest interpretation of the stored value

```ts
toScVal(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:247](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L247)

### `scInt.toString()`

Returns the string representation of this integer.

```ts
toString(): string;
```

**Source:** [src/base/numbers/xdr_large_int.ts:279](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L279)

### `scInt.toTimepoint()`

The integer encoded with `ScValType = Timepoint`

```ts
toTimepoint(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:144](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L144)

### `scInt.toU128()`

The integer encoded with `ScValType = U128`.

```ts
toU128(): ScVal;
```

**Throws**

- if the value cannot fit in 128 bits

**Source:** [src/base/numbers/xdr_large_int.ts:187](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L187)

### `scInt.toU256()`

The integer encoded with `ScValType = U256`

Note: No size check needed - U256 is the largest unsigned type.

```ts
toU256(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:229](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L229)

### `scInt.toU64()`

The integer encoded with `ScValType = U64`

```ts
toU64(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:136](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L136)

### `scInt.valueOf()`

Returns the primitive value of this integer.

```ts
valueOf(): unknown;
```

**Source:** [src/base/numbers/xdr_large_int.ts:274](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L274)

## ScIntType

```ts
type ScIntType = "duration" | "i64" | "i128" | "i256" | "timepoint" | "u64" | "u128" | "u256"
```

**Source:** [src/base/numbers/xdr_large_int.ts:18](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L18)

## Signer

```ts
type Signer = Signer.Ed25519PublicKey | Signer.Ed25519SignedPayload | Signer.PreAuthTx | Signer.Sha256Hash
```

**Source:** [src/base/operations/types.ts:453](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L453)

## Signer.Ed25519PublicKey

```ts
interface Ed25519PublicKey {
  ed25519PublicKey: string;
  weight?: number;
}
```

**Source:** [src/base/operations/types.ts:454](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L454)

### `ed25519PublicKey.ed25519PublicKey`

```ts
ed25519PublicKey: string;
```

**Source:** [src/base/operations/types.ts:455](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L455)

### `ed25519PublicKey.weight`

```ts
weight?: number;
```

**Source:** [src/base/operations/types.ts:456](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L456)

## Signer.Ed25519SignedPayload

```ts
interface Ed25519SignedPayload {
  ed25519SignedPayload: string;
  weight?: number;
}
```

**Source:** [src/base/operations/types.ts:466](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L466)

### `ed25519SignedPayload.ed25519SignedPayload`

```ts
ed25519SignedPayload: string;
```

**Source:** [src/base/operations/types.ts:467](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L467)

### `ed25519SignedPayload.weight`

```ts
weight?: number;
```

**Source:** [src/base/operations/types.ts:468](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L468)

## Signer.PreAuthTx

```ts
interface PreAuthTx {
  preAuthTx: Buffer;
  weight?: number;
}
```

**Source:** [src/base/operations/types.ts:462](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L462)

### `preAuthTx.preAuthTx`

```ts
preAuthTx: Buffer;
```

**Source:** [src/base/operations/types.ts:463](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L463)

### `preAuthTx.weight`

```ts
weight?: number;
```

**Source:** [src/base/operations/types.ts:464](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L464)

## Signer.Sha256Hash

```ts
interface Sha256Hash {
  sha256Hash: Buffer;
  weight?: number;
}
```

**Source:** [src/base/operations/types.ts:458](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L458)

### `sha256Hash.sha256Hash`

```ts
sha256Hash: Buffer;
```

**Source:** [src/base/operations/types.ts:459](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L459)

### `sha256Hash.weight`

```ts
weight?: number;
```

**Source:** [src/base/operations/types.ts:460](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L460)

## SorobanFees

Soroban fee parameters for resource-limited transactions.

```ts
interface SorobanFees {
  instructions: number;
  readBytes: number;
  resourceFee: bigint;
  writeBytes: number;
}
```

**Source:** [src/base/transaction_builder.ts:49](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L49)

### `sorobanFees.instructions`

The number of instructions executed by the transaction.

```ts
instructions: number;
```

**Source:** [src/base/transaction_builder.ts:51](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L51)

### `sorobanFees.readBytes`

The number of bytes read from the ledger by the transaction.

```ts
readBytes: number;
```

**Source:** [src/base/transaction_builder.ts:53](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L53)

### `sorobanFees.resourceFee`

The fee to be paid for the transaction, in stroops.

```ts
resourceFee: bigint;
```

**Source:** [src/base/transaction_builder.ts:57](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L57)

### `sorobanFees.writeBytes`

The number of bytes written to the ledger by the transaction.

```ts
writeBytes: number;
```

**Source:** [src/base/transaction_builder.ts:55](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L55)

## TimeoutInfinite

```ts
const TimeoutInfinite: 0
```

**See also**

- - `TransactionBuilder.setTimeout`
 - [Timeout](https://developers.stellar.org/api/resources/transactions/post/)

**Source:** [src/base/transaction_builder.ts:44](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L44)

## Transaction

Use `TransactionBuilder` to build a transaction object. If you have an
object or base64-encoded string of the transaction envelope XDR, use `TransactionBuilder.fromXDR`.

Once a Transaction has been created, its attributes and operations should not
be changed. You should only add signatures (using `Transaction.sign`)
to a Transaction object before submitting to the network or forwarding on to
additional signers.

```ts
class Transaction {
  constructor(envelope: string | TransactionEnvelope, networkPassphrase: string);
  extraSigners: SignerKey[] | undefined;
  fee: string;
  ledgerBounds: { maxLedger: number; minLedger: number } | undefined;
  memo: Memo<MemoType>;
  minAccountSequence: string | undefined;
  minAccountSequenceAge: bigint | undefined;
  minAccountSequenceLedgerGap: number | undefined;
  networkPassphrase: string;
  operations: OperationRecord[];
  sequence: string;
  signatures: DecoratedSignature[];
  source: string;
  timeBounds: { maxTime: string; minTime: string } | undefined;
  tx: TTx;
  addDecoratedSignature(signature: DecoratedSignature): void;
  addSignature(publicKey: string = "", signature: string = ""): void;
  getClaimableBalanceId(opIndex: number): string;
  getKeypairSignature(keypair: Keypair): string;
  hash(): Buffer;
  sign(...keypairs: Keypair[]): void;
  signatureBase(): Buffer;
  signHashX(preimage: string | Buffer<ArrayBufferLike>): void;
  toEnvelope(): TransactionEnvelope;
  toXDR(): string;
}
```

**Source:** [src/base/transaction.ts:25](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L25)

### `new Transaction(envelope, networkPassphrase)`

```ts
constructor(envelope: string | TransactionEnvelope, networkPassphrase: string);
```

**Parameters**

- **`envelope`** — `string | TransactionEnvelope` (required) — transaction envelope object or base64 encoded string
- **`networkPassphrase`** — `string` (required) — passphrase of the target stellar network
      (e.g. "Public Global Stellar Network ; September 2015")

**Source:** [src/base/transaction.ts:45](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L45)

### `transaction.extraSigners`

Array of extra signers as XDR objects; use `SignerKey.encodeSignerKey`
to convert to StrKey strings.

```ts
extraSigners: SignerKey[] | undefined;
```

**Source:** [src/base/transaction.ts:199](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L199)

### `transaction.fee`

The total fee for this transaction, in stroops.

```ts
fee: string;
```

**Source:** [src/base/transaction_base.ts:76](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L76)

### `transaction.ledgerBounds`

The ledger bounds for this transaction, with `minLedger` (uint32) and
`maxLedger` (uint32, or 0 for no upper bound).

```ts
ledgerBounds: { maxLedger: number; minLedger: number } | undefined;
```

**Source:** [src/base/transaction.ts:164](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L164)

### `transaction.memo`

The memo attached to this transaction.

```ts
memo: Memo<MemoType>;
```

**Source:** [src/base/transaction.ts:231](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L231)

### `transaction.minAccountSequence`

The minimum account sequence (64-bit, as a string).

```ts
minAccountSequence: string | undefined;
```

**Source:** [src/base/transaction.ts:172](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L172)

### `transaction.minAccountSequenceAge`

The minimum account sequence age (64-bit number of seconds).

```ts
minAccountSequenceAge: bigint | undefined;
```

**Source:** [src/base/transaction.ts:180](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L180)

### `transaction.minAccountSequenceLedgerGap`

The minimum account sequence ledger gap (32-bit number of ledgers).

```ts
minAccountSequenceLedgerGap: number | undefined;
```

**Source:** [src/base/transaction.ts:188](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L188)

### `transaction.networkPassphrase`

The network passphrase for this transaction.

```ts
networkPassphrase: string;
```

**Source:** [src/base/transaction_base.ts:85](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L85)

### `transaction.operations`

The list of operations in this transaction.

```ts
operations: OperationRecord[];
```

**Source:** [src/base/transaction.ts:223](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L223)

### `transaction.sequence`

The sequence number for this transaction.

```ts
sequence: string;
```

**Source:** [src/base/transaction.ts:207](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L207)

### `transaction.signatures`

The list of signatures for this transaction.

```ts
signatures: DecoratedSignature[];
```

**Source:** [src/base/transaction_base.ts:35](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L35)

### `transaction.source`

The source account for this transaction.

```ts
source: string;
```

**Source:** [src/base/transaction.ts:215](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L215)

### `transaction.timeBounds`

The time bounds for this transaction, with `minTime` and `maxTime` as
64-bit unix timestamps (strings).

```ts
timeBounds: { maxTime: string; minTime: string } | undefined;
```

**Source:** [src/base/transaction.ts:153](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L153)

### `transaction.tx`

The underlying XDR transaction object.

Returns a defensive copy so that external mutations cannot alter the
transaction that will be signed or serialized.

```ts
tx: TTx;
```

**Throws**

- if the internal transaction is not a recognized XDR type

**Source:** [src/base/transaction_base.ts:51](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L51)

### `transaction.addDecoratedSignature(signature)`

Add a decorated signature directly to the transaction envelope.

```ts
addDecoratedSignature(signature: DecoratedSignature): void;
```

**Parameters**

- **`signature`** — `DecoratedSignature` (required) — raw signature to add

**See also**

- - Keypair.signDecorated
 - Keypair.signPayloadDecorated

**Source:** [src/base/transaction_base.ts:196](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L196)

### `transaction.addSignature(publicKey, signature)`

Add a signature to the transaction. Useful when a party wants to pre-sign
a transaction but doesn't want to give access to their secret keys.
This will also verify whether the signature is valid.

Here's how you would use this feature to solicit multiple signatures.
- Use `TransactionBuilder` to build a new transaction.
- Make sure to set a long enough timeout on that transaction to give your
signers enough time to sign!
- Once you build the transaction, use `transaction.toXDR()` to get the
base64-encoded XDR string.
- _Warning!_ Once you've built this transaction, don't submit any other
transactions onto your account! Doing so will invalidate this pre-compiled
transaction!
- Send this XDR string to your other parties. They can use the instructions
for [getKeypairSignature](#getKeypairSignature) to sign the transaction.
- They should send you back their `publicKey` and the `signature` string
from [getKeypairSignature](#getKeypairSignature), both of which you pass to
this function.

```ts
addSignature(publicKey: string = "", signature: string = ""): void;
```

**Parameters**

- **`publicKey`** — `string` (optional) (default: `""`) — the public key of the signer
- **`signature`** — `string` (optional) (default: `""`) — the base64 value of the signature XDR

**Source:** [src/base/transaction_base.ts:156](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L156)

### `transaction.getClaimableBalanceId(opIndex)`

Calculate the claimable balance ID for an operation within the transaction.

```ts
getClaimableBalanceId(opIndex: number): string;
```

**Parameters**

- **`opIndex`** — `number` (required) — the index of the CreateClaimableBalance op

**Throws**

- for invalid `opIndex` value, if op at `opIndex` is not
   `CreateClaimableBalance`, or for general XDR un/marshalling failures

**See also**

- https://github.com/stellar/go/blob/d712346e61e288d450b0c08038c158f8848cc3e4/txnbuild/transaction.go#L392-L435

**Source:** [src/base/transaction.ts:321](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L321)

### `transaction.getKeypairSignature(keypair)`

Signs a transaction with the given `Keypair`. Useful if someone sends
you a transaction XDR for you to sign and return (see
[addSignature](#addSignature) for more information).

When you get a transaction XDR to sign....
- Instantiate a `Transaction` object with the XDR
- Use `Keypair` to generate a keypair object for your Stellar seed.
- Run `getKeypairSignature` with that keypair
- Send back the signature along with your publicKey (not your secret seed!)

Example:
```javascript
// `transactionXDR` is a string from the person generating the transaction
const transaction = new Transaction(transactionXDR, networkPassphrase);
const keypair = Keypair.fromSecret(myStellarSeed);
return transaction.getKeypairSignature(keypair);
```

Returns the base64-encoded signature string for the given keypair.

```ts
getKeypairSignature(keypair: Keypair): string;
```

**Parameters**

- **`keypair`** — `Keypair` (required) — Keypair of signer

**Source:** [src/base/transaction_base.ts:129](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L129)

### `transaction.hash()`

Returns a hash for this transaction, suitable for signing.

```ts
hash(): Buffer;
```

**Source:** [src/base/transaction_base.ts:222](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L222)

### `transaction.sign(keypairs)`

Signs the transaction with the given `Keypair`.

```ts
sign(...keypairs: Keypair[]): void;
```

**Parameters**

- **`...keypairs`** — `Keypair[]` (required) — Keypairs of signers

**Source:** [src/base/transaction_base.ts:97](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L97)

### `transaction.signatureBase()`

Returns the "signature base" of this transaction, which is the value
that, when hashed, should be signed to create a signature that
validators on the Stellar Network will accept.

It is composed of a 4 prefix bytes followed by the xdr-encoded form
of this transaction.

```ts
signatureBase(): Buffer;
```

**Source:** [src/base/transaction.ts:246](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L246)

### `transaction.signHashX(preimage)`

Add `hashX` signer preimage as signature.

```ts
signHashX(preimage: string | Buffer<ArrayBufferLike>): void;
```

**Parameters**

- **`preimage`** — `string | Buffer<ArrayBufferLike>` (required) — preimage of hash used as signer

**Source:** [src/base/transaction_base.ts:204](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L204)

### `transaction.toEnvelope()`

To envelope returns a xdr.TransactionEnvelope which can be submitted to the network.

```ts
toEnvelope(): TransactionEnvelope;
```

**Source:** [src/base/transaction.ts:279](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction.ts#L279)

### `transaction.toXDR()`

Returns the transaction envelope as a base64-encoded XDR string.

```ts
toXDR(): string;
```

**Source:** [src/base/transaction_base.ts:239](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_base.ts#L239)

## TransactionBuilder

<p>Transaction builder helps constructs a new [`Transaction`](#transaction) using the
given `Account` as the transaction's "source account". The transaction
will use the current sequence number of the given account as its sequence
number and increment the given account's sequence number by one. The given
source account must include a private key for signing the transaction or an
error will be thrown.</p>

<p>Operations can be added to the transaction via their corresponding builder
methods, and each returns the TransactionBuilder object so they can be
chained together. After adding the desired operations, call the `build()`
method on the `TransactionBuilder` to return a fully constructed
`Transaction` that can be signed. The returned transaction will contain the
sequence number of the source account and include the signature from the
source account.</p>

<p><strong>Be careful about unsubmitted transactions!</strong> When you build
a transaction, `stellar-sdk` automatically increments the source account's
sequence number. If you end up not submitting this transaction and submitting
another one instead, it'll fail due to the sequence number being wrong. So if
you decide not to use a built transaction, make sure to update the source
account's sequence number with
[Server.loadAccount](https://stellar.github.io/js-stellar-sdk/Server.html#loadAccount)
before creating another transaction.</p>

<p>The following code example creates a new transaction with `Operation.createAccount` and `Operation.payment` operations. The
Transaction's source account first funds `destinationA`, then sends a payment
to `destinationB`. The built transaction is then signed by
`sourceKeypair`.</p>

```
var transaction = new TransactionBuilder(source, { fee, networkPassphrase: Networks.TESTNET })
.addOperation(Operation.createAccount({
    destination: destinationA,
    startingBalance: "20"
})) // <- funds and creates destinationA
.addOperation(Operation.payment({
    destination: destinationB,
    amount: "100",
    asset: Asset.native()
})) // <- sends 100 XLM to destinationB
.setTimeout(30)
.build();

transaction.sign(sourceKeypair);
```

```ts
class TransactionBuilder {
  constructor(sourceAccount: Account | MuxedAccount, opts: TransactionBuilderOptions = ...);
  static buildFeeBumpTransaction(feeSource: string | Keypair, baseFee: string, innerTx: Transaction, networkPassphrase: string): FeeBumpTransaction;
  static cloneFrom(tx: Transaction, opts: Partial<TransactionBuilderOptions> = {}): TransactionBuilder;
  static fromXDR(envelope: string | TransactionEnvelope, networkPassphrase: string): Transaction | FeeBumpTransaction;
  baseFee: string;
  extraSigners: string[] | null;
  ledgerbounds: { maxLedger?: number; minLedger?: number } | null;
  memo: Memo;
  minAccountSequence: string | null;
  minAccountSequenceAge: bigint | null;
  minAccountSequenceLedgerGap: number | null;
  networkPassphrase: string | null;
  operations: Operation2<OperationRecord>[];
  sorobanData: SorobanTransactionData | null;
  source: Account | MuxedAccount;
  timebounds: { maxTime?: string | number | Date; minTime?: string | number | Date } | null;
  addMemo(memo: Memo): TransactionBuilder;
  addOperation(operation: Operation2): TransactionBuilder;
  addOperationAt(operation: Operation2, index: number): TransactionBuilder;
  addSacTransferOperation(destination: string, asset: Asset, amount: string | bigint, sorobanFees?: SorobanFees): TransactionBuilder;
  build(): Transaction;
  clearOperationAt(index: number): TransactionBuilder;
  clearOperations(): TransactionBuilder;
  hasV2Preconditions(): boolean;
  setExtraSigners(extraSigners: string[]): TransactionBuilder;
  setLedgerbounds(minLedger: number, maxLedger: number): TransactionBuilder;
  setMinAccountSequence(minAccountSequence: string): TransactionBuilder;
  setMinAccountSequenceAge(durationInSeconds: bigint): TransactionBuilder;
  setMinAccountSequenceLedgerGap(gap: number): TransactionBuilder;
  setNetworkPassphrase(networkPassphrase: string): TransactionBuilder;
  setSorobanData(sorobanData: string | SorobanTransactionData): TransactionBuilder;
  setTimebounds(minEpochOrDate: number | Date, maxEpochOrDate: number | Date): TransactionBuilder;
  setTimeout(timeoutSeconds: number): TransactionBuilder;
}
```

**Source:** [src/base/transaction_builder.ts:152](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L152)

### `new TransactionBuilder(sourceAccount, opts)`

```ts
constructor(sourceAccount: Account | MuxedAccount, opts: TransactionBuilderOptions = ...);
```

**Parameters**

- **`sourceAccount`** — `Account | MuxedAccount` (required) — source account for this transaction
- **`opts`** — `TransactionBuilderOptions` (optional) (default: `...`) — options object (see `TransactionBuilderOptions`)

**Source:** [src/base/transaction_builder.ts:173](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L173)

### `TransactionBuilder.buildFeeBumpTransaction(feeSource, baseFee, innerTx, networkPassphrase)`

Builds a `FeeBumpTransaction`, enabling you to resubmit an existing
transaction with a higher fee.

```ts
static buildFeeBumpTransaction(feeSource: string | Keypair, baseFee: string, innerTx: Transaction, networkPassphrase: string): FeeBumpTransaction;
```

**Parameters**

- **`feeSource`** — `string | Keypair` (required) — account paying for the transaction,
      in the form of either a Keypair (only the public key is used) or
      an account ID (in G... or M... form, but refer to `withMuxing`)
- **`baseFee`** — `string` (required) — max fee willing to pay per operation
      in inner transaction (**in stroops**)
- **`innerTx`** — `Transaction` (required) — `Transaction` to be bumped by
      the fee bump transaction
- **`networkPassphrase`** — `string` (required) — passphrase of the target
      Stellar network (e.g. "Public Global Stellar Network ; September 2015",
      see `Networks`)
  
  TODO: Alongside the next major version bump, this type signature can be
        changed to be less awkward: accept a MuxedAccount as the `feeSource`
        rather than a keypair or string.
  
  Your fee-bump amount should be `>= 10x` the original fee.

**See also**

- https://developers.stellar.org/docs/glossary/fee-bumps/#replace-by-fee

**Source:** [src/base/transaction_builder.ts:1091](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L1091)

### `TransactionBuilder.cloneFrom(tx, opts)`

Creates a builder instance using an existing `Transaction` as a
template, ignoring any existing envelope signatures.

Note that the sequence number WILL be cloned, so EITHER this transaction or
the one it was cloned from will be valid. This is useful in situations
where you are constructing a transaction in pieces and need to make
adjustments as you go (for example, when filling out Soroban resource
information).

```ts
static cloneFrom(tx: Transaction, opts: Partial<TransactionBuilderOptions> = {}): TransactionBuilder;
```

**Parameters**

- **`tx`** — `Transaction` (required) — a "template" transaction to clone exactly
- **`opts`** — `Partial<TransactionBuilderOptions>` (optional) (default: `{}`) — additional options to override the clone, e.g.
     `{fee: '1000'}` will override the existing base fee derived from `tx`
     (see the `TransactionBuilder` constructor for detailed options)
  
  **Warning:** This does not clone the transaction's
  `xdr.SorobanTransactionData` (if applicable), use
  `SorobanDataBuilder` and `TransactionBuilder.setSorobanData`
  as needed, instead.
  
  TODO: This cannot clone `FeeBumpTransaction`s, yet.

**Source:** [src/base/transaction_builder.ts:280](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L280)

### `TransactionBuilder.fromXDR(envelope, networkPassphrase)`

Build a `Transaction` or `FeeBumpTransaction` from an
xdr.TransactionEnvelope.

```ts
static fromXDR(envelope: string | TransactionEnvelope, networkPassphrase: string): Transaction | FeeBumpTransaction;
```

**Parameters**

- **`envelope`** — `string | TransactionEnvelope` (required) — The transaction envelope
      object or base64 encoded string.
- **`networkPassphrase`** — `string` (required) — The network passphrase of the target
      Stellar network (e.g. "Public Global Stellar Network ; September
      2015"), see `Networks`.

**Source:** [src/base/transaction_builder.ts:1202](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L1202)

### `transactionBuilder.baseFee`

```ts
baseFee: string;
```

**Source:** [src/base/transaction_builder.ts:155](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L155)

### `transactionBuilder.extraSigners`

```ts
extraSigners: string[] | null;
```

**Source:** [src/base/transaction_builder.ts:164](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L164)

### `transactionBuilder.ledgerbounds`

```ts
ledgerbounds: { maxLedger?: number; minLedger?: number } | null;
```

**Source:** [src/base/transaction_builder.ts:160](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L160)

### `transactionBuilder.memo`

```ts
memo: Memo;
```

**Source:** [src/base/transaction_builder.ts:165](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L165)

### `transactionBuilder.minAccountSequence`

```ts
minAccountSequence: string | null;
```

**Source:** [src/base/transaction_builder.ts:161](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L161)

### `transactionBuilder.minAccountSequenceAge`

```ts
minAccountSequenceAge: bigint | null;
```

**Source:** [src/base/transaction_builder.ts:162](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L162)

### `transactionBuilder.minAccountSequenceLedgerGap`

```ts
minAccountSequenceLedgerGap: number | null;
```

**Source:** [src/base/transaction_builder.ts:163](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L163)

### `transactionBuilder.networkPassphrase`

```ts
networkPassphrase: string | null;
```

**Source:** [src/base/transaction_builder.ts:166](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L166)

### `transactionBuilder.operations`

```ts
operations: Operation2<OperationRecord>[];
```

**Source:** [src/base/transaction_builder.ts:154](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L154)

### `transactionBuilder.sorobanData`

```ts
sorobanData: SorobanTransactionData | null;
```

**Source:** [src/base/transaction_builder.ts:167](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L167)

### `transactionBuilder.source`

```ts
source: Account | MuxedAccount;
```

**Source:** [src/base/transaction_builder.ts:153](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L153)

### `transactionBuilder.timebounds`

```ts
timebounds: { maxTime?: string | number | Date; minTime?: string | number | Date } | null;
```

**Source:** [src/base/transaction_builder.ts:156](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L156)

### `transactionBuilder.addMemo(memo)`

Adds a memo to the transaction.

```ts
addMemo(memo: Memo): TransactionBuilder;
```

**Parameters**

- **`memo`** — `Memo` (required) — `Memo` object

**Source:** [src/base/transaction_builder.ts:393](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L393)

### `transactionBuilder.addOperation(operation)`

Adds an operation to the transaction.

```ts
addOperation(operation: Operation2): TransactionBuilder;
```

**Parameters**

- **`operation`** — `Operation2` (required) — The xdr operation object, use `Operation` static methods.

**Source:** [src/base/transaction_builder.ts:355](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L355)

### `transactionBuilder.addOperationAt(operation, index)`

Adds an operation to the transaction at a specific index.

```ts
addOperationAt(operation: Operation2, index: number): TransactionBuilder;
```

**Parameters**

- **`operation`** — `Operation2` (required) — The xdr operation object to add, use `Operation` static methods.
- **`index`** — `number` (required) — The index at which to insert the operation.

**Source:** [src/base/transaction_builder.ts:366](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L366)

### `transactionBuilder.addSacTransferOperation(destination, asset, amount, sorobanFees)`

Creates and adds an invoke host function operation for transferring SAC tokens.
This method removes the need for simulation by handling the creation of the
appropriate authorization entries and ledger footprint for the transfer operation.

```ts
addSacTransferOperation(destination: string, asset: Asset, amount: string | bigint, sorobanFees?: SorobanFees): TransactionBuilder;
```

**Parameters**

- **`destination`** — `string` (required) — the address of the recipient of the SAC transfer (should be a valid Stellar address or contract ID)
- **`asset`** — `Asset` (required) — the SAC asset to be transferred
- **`amount`** — `string | bigint` (required) — the amount of tokens to be transferred in 7 decimals. IE 1 token with 7 decimals of precision would be represented as "1_0000000"
- **`sorobanFees`** — `SorobanFees` (optional) — optional Soroban fees for the transaction to override the default fees used

**Source:** [src/base/transaction_builder.ts:700](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L700)

### `transactionBuilder.build()`

Builds the transaction and increments the source account's sequence
number by 1.

```ts
build(): Transaction;
```

**Source:** [src/base/transaction_builder.ts:920](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L920)

### `transactionBuilder.clearOperationAt(index)`

Removes the operation at the specified index from the transaction.

```ts
clearOperationAt(index: number): TransactionBuilder;
```

**Parameters**

- **`index`** — `number` (required) — The index of the operation to remove.

**Source:** [src/base/transaction_builder.ts:384](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L384)

### `transactionBuilder.clearOperations()`

Removes the operations from the builder (useful when cloning).

```ts
clearOperations(): TransactionBuilder;
```

**Source:** [src/base/transaction_builder.ts:374](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L374)

### `transactionBuilder.hasV2Preconditions()`

Checks whether any v2 preconditions have been set on this builder.

```ts
hasV2Preconditions(): boolean;
```

**Source:** [src/base/transaction_builder.ts:1059](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L1059)

### `transactionBuilder.setExtraSigners(extraSigners)`

For the transaction to be valid, there must be a signature corresponding to
every Signer in this array, even if the signature is not otherwise required
by the sourceAccount or operations. Internally this will set the
`extraSigners` precondition.

```ts
setExtraSigners(extraSigners: string[]): TransactionBuilder;
```

**Parameters**

- **`extraSigners`** — `string[]` (required) — required extra signers (as `StrKey`s)

**Source:** [src/base/transaction_builder.ts:635](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L635)

### `transactionBuilder.setLedgerbounds(minLedger, maxLedger)`

If you want to prepare a transaction which will only be valid within some
range of ledgers, you can set a ledgerbounds precondition.
Internally this will set the `minLedger` and `maxLedger` preconditions.

```ts
setLedgerbounds(minLedger: number, maxLedger: number): TransactionBuilder;
```

**Parameters**

- **`minLedger`** — `number` (required) — The minimum ledger this transaction is valid at
      or after. Cannot be negative. If the value is `0` (the default), the
      transaction is valid immediately.
- **`maxLedger`** — `number` (required) — The maximum ledger this transaction is valid
      before. Cannot be negative. If the value is `0`, the transaction is
      valid indefinitely.

**Source:** [src/base/transaction_builder.ts:523](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L523)

### `transactionBuilder.setMinAccountSequence(minAccountSequence)`

If you want to prepare a transaction which will be valid only while the
account sequence number is

    `minAccountSequence <= sourceAccountSequence < tx.seqNum`

Note that after execution the account's sequence number is always raised to
`tx.seqNum`. Internally this will set the `minAccountSequence`
precondition.

```ts
setMinAccountSequence(minAccountSequence: string): TransactionBuilder;
```

**Parameters**

- **`minAccountSequence`** — `string` (required) — The minimum source account sequence
      number this transaction is valid for. If the value is `0` (the
      default), the transaction is valid when `sourceAccount`'s sequence
      number `== tx.seqNum - 1`.

**Source:** [src/base/transaction_builder.ts:560](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L560)

### `transactionBuilder.setMinAccountSequenceAge(durationInSeconds)`

For the transaction to be valid, the current ledger time must be at least
`minAccountSequenceAge` greater than sourceAccount's `sequenceTime`.
Internally this will set the `minAccountSequenceAge` precondition.

```ts
setMinAccountSequenceAge(durationInSeconds: bigint): TransactionBuilder;
```

**Parameters**

- **`durationInSeconds`** — `bigint` (required) — The minimum amount of time between
      source account sequence time and the ledger time when this transaction
      will become valid. If the value is `0`, the transaction is unrestricted
      by the account sequence age. Cannot be negative.

**Source:** [src/base/transaction_builder.ts:582](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L582)

### `transactionBuilder.setMinAccountSequenceLedgerGap(gap)`

For the transaction to be valid, the current ledger number must be at least
`minAccountSequenceLedgerGap` greater than sourceAccount's ledger sequence.
Internally this will set the `minAccountSequenceLedgerGap` precondition.

```ts
setMinAccountSequenceLedgerGap(gap: number): TransactionBuilder;
```

**Parameters**

- **`gap`** — `number` (required) — The minimum number of ledgers between source account
      sequence and the ledger number when this transaction will become valid.
      If the value is `0`, the transaction is unrestricted by the account
      sequence ledger. Cannot be negative.

**Source:** [src/base/transaction_builder.ts:611](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L611)

### `transactionBuilder.setNetworkPassphrase(networkPassphrase)`

Set network passphrase for the Transaction that will be built.

```ts
setNetworkPassphrase(networkPassphrase: string): TransactionBuilder;
```

**Parameters**

- **`networkPassphrase`** — `string` (required) — passphrase of the target Stellar
      network (e.g. "Public Global Stellar Network ; September 2015").

**Source:** [src/base/transaction_builder.ts:661](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L661)

### `transactionBuilder.setSorobanData(sorobanData)`

Sets the transaction's internal Soroban transaction data (resources,
footprint, etc.).

For non-contract(non-Soroban) transactions, this setting has no effect. In
the case of Soroban transactions, this is either an instance of
`xdr.SorobanTransactionData` or a base64-encoded string of said
structure. This is usually obtained from the simulation response based on a
transaction with a Soroban operation (e.g.
`Operation.invokeHostFunction`, providing necessary resource
and storage footprint estimations for contract invocation.

```ts
setSorobanData(sorobanData: string | SorobanTransactionData): TransactionBuilder;
```

**Parameters**

- **`sorobanData`** — `string | SorobanTransactionData` (required) — the `xdr.SorobanTransactionData` as a raw xdr
     object or a base64 string to be decoded

**See also**

- `SorobanDataBuilder`

**Source:** [src/base/transaction_builder.ts:683](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L683)

### `transactionBuilder.setTimebounds(minEpochOrDate, maxEpochOrDate)`

If you want to prepare a transaction which will become valid at some point
in the future, or be invalid after some time, you can set a timebounds
precondition. Internally this will set the `minTime`, and `maxTime`
preconditions. Conflicts with `setTimeout`, so use one or the other.

```ts
setTimebounds(minEpochOrDate: number | Date, maxEpochOrDate: number | Date): TransactionBuilder;
```

**Parameters**

- **`minEpochOrDate`** — `number | Date` (required) — Either a JS Date object, or a number
      of UNIX epoch seconds. The transaction is valid after this timestamp.
      Can't be negative. If the value is `0`, the transaction is valid
      immediately.
- **`maxEpochOrDate`** — `number | Date` (required) — Either a JS Date object, or a number
      of UNIX epoch seconds. The transaction is valid until this timestamp.
      Can't be negative. If the value is `0`, the transaction is valid
      indefinitely.

**Source:** [src/base/transaction_builder.ts:474](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L474)

### `transactionBuilder.setTimeout(timeoutSeconds)`

Sets a timeout precondition on the transaction.

 Because of the distributed nature of the Stellar network it is possible
 that the status of your transaction will be determined after a long time
 if the network is highly congested. If you want to be sure to receive the
 status of the transaction within a given period you should set the
 time bounds with `maxTime` on the transaction (this is what `setTimeout`
 does internally; if there's `minTime` set but no `maxTime` it will be
 added).

 A call to `TransactionBuilder.setTimeout` is **required** if Transaction
 does not have `max_time` set. If you don't want to set timeout, use
 `TimeoutInfinite`. In general you should set
 `TimeoutInfinite` only in smart contracts.

 Please note that Horizon may still return <code>504 Gateway Timeout</code>
 error, even for short timeouts. In such case you need to resubmit the same
 transaction again without making any changes to receive a status. This
 method is using the machine system time (UTC), make sure it is set
 correctly.

```ts
setTimeout(timeoutSeconds: number): TransactionBuilder;
```

**Parameters**

- **`timeoutSeconds`** — `number` (required) — Number of seconds the transaction is good.
      Can't be negative. If the value is `TimeoutInfinite`, the
      transaction is good indefinitely.

**See also**

- - `TimeoutInfinite`
 - https://developers.stellar.org/docs/tutorials/handling-errors/

**Source:** [src/base/transaction_builder.ts:427](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/transaction_builder.ts#L427)

## TrustLineFlag

```ts
type TrustLineFlag = TrustLineFlag.authorize | TrustLineFlag.authorizeToMaintainLiabilities | TrustLineFlag.deauthorize
```

**Source:** [src/base/operations/types.ts:442](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L442)

## TrustLineFlag.authorize

```ts
type authorize = 1
```

**Source:** [src/base/operations/types.ts:444](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L444)

## TrustLineFlag.authorizeToMaintainLiabilities

```ts
type authorizeToMaintainLiabilities = 2
```

**Source:** [src/base/operations/types.ts:445](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L445)

## TrustLineFlag.deauthorize

```ts
type deauthorize = 0
```

**Source:** [src/base/operations/types.ts:443](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/operations/types.ts#L443)

## Uint128

```ts
class Uint128 extends LargeInt {
  constructor(...args: (string | number | bigint)[]);
  static MAX_VALUE: LargeInt;
  static MIN_VALUE: LargeInt;
  static defineIntBoundaries(): void;
  static fromString(value: string): LargeInt;
  static isValid(value: unknown): boolean;
  readonly size: number;
  readonly unsigned: boolean;
  slice(chunkSize: number): bigint[];
  toBigInt(): bigint;
  toString(): string;
}
```

**Source:** [src/base/numbers/uint128.ts:3](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/uint128.ts#L3)

### `new Uint128(args)`

Construct an unsigned 128-bit integer that can be XDR-encoded.

```ts
constructor(...args: (string | number | bigint)[]);
```

**Parameters**

- **`...args`** — `(string | number | bigint)[]` (required) — one or more slices to encode
      in big-endian format (i.e. earlier elements are higher bits)

**Source:** [src/base/numbers/uint128.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/uint128.ts#L10)

### `Uint128.MAX_VALUE`

```ts
static MAX_VALUE: LargeInt;
```

**Source:** [types/stellar__js-xdr/index.d.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L14)

### `Uint128.MIN_VALUE`

```ts
static MIN_VALUE: LargeInt;
```

**Source:** [types/stellar__js-xdr/index.d.ts:13](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L13)

### `Uint128.defineIntBoundaries()`

```ts
static defineIntBoundaries(): void;
```

**Source:** [types/stellar__js-xdr/index.d.ts:12](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L12)

### `Uint128.fromString(value)`

```ts
static fromString(value: string): LargeInt;
```

**Parameters**

- **`value`** — `string` (required)

**Source:** [types/stellar__js-xdr/index.d.ts:16](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L16)

### `Uint128.isValid(value)`

```ts
static isValid(value: unknown): boolean;
```

**Parameters**

- **`value`** — `unknown` (required)

**Source:** [types/stellar__js-xdr/index.d.ts:15](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L15)

### `uint128.size`

```ts
readonly size: number;
```

**Source:** [src/base/numbers/uint128.ts:18](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/uint128.ts#L18)

### `uint128.unsigned`

```ts
readonly unsigned: boolean;
```

**Source:** [src/base/numbers/uint128.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/uint128.ts#L14)

### `uint128.slice(chunkSize)`

```ts
slice(chunkSize: number): bigint[];
```

**Parameters**

- **`chunkSize`** — `number` (required)

**Source:** [types/stellar__js-xdr/index.d.ts:21](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L21)

### `uint128.toBigInt()`

```ts
toBigInt(): bigint;
```

**Source:** [types/stellar__js-xdr/index.d.ts:19](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L19)

### `uint128.toString()`

```ts
toString(): string;
```

**Source:** [types/stellar__js-xdr/index.d.ts:20](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L20)

## Uint256

```ts
class Uint256 extends LargeInt {
  constructor(...args: (string | number | bigint)[]);
  static MAX_VALUE: LargeInt;
  static MIN_VALUE: LargeInt;
  static defineIntBoundaries(): void;
  static fromString(value: string): LargeInt;
  static isValid(value: unknown): boolean;
  readonly size: number;
  readonly unsigned: boolean;
  slice(chunkSize: number): bigint[];
  toBigInt(): bigint;
  toString(): string;
}
```

**Source:** [src/base/numbers/uint256.ts:3](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/uint256.ts#L3)

### `new Uint256(args)`

Construct an unsigned 256-bit integer that can be XDR-encoded.

```ts
constructor(...args: (string | number | bigint)[]);
```

**Parameters**

- **`...args`** — `(string | number | bigint)[]` (required) — one or more slices to encode
      in big-endian format (i.e. earlier elements are higher bits)

**Source:** [src/base/numbers/uint256.ts:10](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/uint256.ts#L10)

### `Uint256.MAX_VALUE`

```ts
static MAX_VALUE: LargeInt;
```

**Source:** [types/stellar__js-xdr/index.d.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L14)

### `Uint256.MIN_VALUE`

```ts
static MIN_VALUE: LargeInt;
```

**Source:** [types/stellar__js-xdr/index.d.ts:13](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L13)

### `Uint256.defineIntBoundaries()`

```ts
static defineIntBoundaries(): void;
```

**Source:** [types/stellar__js-xdr/index.d.ts:12](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L12)

### `Uint256.fromString(value)`

```ts
static fromString(value: string): LargeInt;
```

**Parameters**

- **`value`** — `string` (required)

**Source:** [types/stellar__js-xdr/index.d.ts:16](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L16)

### `Uint256.isValid(value)`

```ts
static isValid(value: unknown): boolean;
```

**Parameters**

- **`value`** — `unknown` (required)

**Source:** [types/stellar__js-xdr/index.d.ts:15](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L15)

### `uint256.size`

```ts
readonly size: number;
```

**Source:** [src/base/numbers/uint256.ts:18](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/uint256.ts#L18)

### `uint256.unsigned`

```ts
readonly unsigned: boolean;
```

**Source:** [src/base/numbers/uint256.ts:14](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/uint256.ts#L14)

### `uint256.slice(chunkSize)`

```ts
slice(chunkSize: number): bigint[];
```

**Parameters**

- **`chunkSize`** — `number` (required)

**Source:** [types/stellar__js-xdr/index.d.ts:21](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L21)

### `uint256.toBigInt()`

```ts
toBigInt(): bigint;
```

**Source:** [types/stellar__js-xdr/index.d.ts:19](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L19)

### `uint256.toString()`

```ts
toString(): string;
```

**Source:** [types/stellar__js-xdr/index.d.ts:20](https://github.com/stellar/js-stellar-sdk/blob/master/types/stellar__js-xdr/index.d.ts#L20)

## XdrLargeInt

A wrapper class to represent large XDR-encodable integers.

This operates at a lower level than `ScInt` by forcing you to specify
the type / width / size in bits of the integer you're targeting, regardless
of the input value(s) you provide.

```ts
class XdrLargeInt {
  constructor(type: ScIntType, values: XdrLargeIntValues);
  static getType(scvType: string): ScIntType | undefined;
  static isType(type: string): type is ScIntType;
  int: LargeInt;
  type: ScIntType;
  toBigInt(): bigint;
  toDuration(): ScVal;
  toI128(): ScVal;
  toI256(): ScVal;
  toI64(): ScVal;
  toJSON(): { type: string; value: string };
  toNumber(): number;
  toScVal(): ScVal;
  toString(): string;
  toTimepoint(): ScVal;
  toU128(): ScVal;
  toU256(): ScVal;
  toU64(): ScVal;
  valueOf(): unknown;
}
```

**Source:** [src/base/numbers/xdr_large_int.ts:35](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L35)

### `new XdrLargeInt(type, values)`

```ts
constructor(type: ScIntType, values: XdrLargeIntValues);
```

**Parameters**

- **`type`** — `ScIntType` (required) — specifies a data type to use to represent the integer, one
     of: 'i64', 'u64', 'i128', 'u128', 'i256', 'u256', 'timepoint', and 'duration'
     (see `XdrLargeInt.isType`)
- **`values`** — `XdrLargeIntValues` (required) — a list of integer-like values interpreted in big-endian order

**Source:** [src/base/numbers/xdr_large_int.ts:45](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L45)

### `XdrLargeInt.getType(scvType)`

Convert the raw `ScValType` string (e.g. 'scvI128', generated by the XDR)
to a type description for `XdrLargeInt` construction (e.g. 'i128')

```ts
static getType(scvType: string): ScIntType | undefined;
```

**Parameters**

- **`scvType`** — `string` (required) — the `xdr.ScValType` as a string

**Returns**

the corresponding `ScIntType` if it's an integer type, or
   `undefined` if it's not an integer type

**Source:** [src/base/numbers/xdr_large_int.ts:322](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L322)

### `XdrLargeInt.isType(type)`

Returns true if the given string is a valid XDR large integer type name.

```ts
static isType(type: string): type is ScIntType;
```

**Parameters**

- **`type`** — `string` (required)

**Source:** [src/base/numbers/xdr_large_int.ts:298](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L298)

### `xdrLargeInt.int`

```ts
int: LargeInt;
```

**Source:** [src/base/numbers/xdr_large_int.ts:36](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L36)

### `xdrLargeInt.type`

```ts
type: ScIntType;
```

**Source:** [src/base/numbers/xdr_large_int.ts:37](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L37)

### `xdrLargeInt.toBigInt()`

Converts to a native BigInt.

```ts
toBigInt(): bigint;
```

**Source:** [src/base/numbers/xdr_large_int.ts:116](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L116)

### `xdrLargeInt.toDuration()`

The integer encoded with `ScValType = Duration`

```ts
toDuration(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:152](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L152)

### `xdrLargeInt.toI128()`

The integer encoded with `ScValType = I128`.

```ts
toI128(): ScVal;
```

**Throws**

- if the value cannot fit in 128 bits

**Source:** [src/base/numbers/xdr_large_int.ts:164](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L164)

### `xdrLargeInt.toI256()`

The integer encoded with `ScValType = I256`

```ts
toI256(): ScVal;
```

**Throws**

- if the value cannot fit in a signed 256-bit integer

**Source:** [src/base/numbers/xdr_large_int.ts:204](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L204)

### `xdrLargeInt.toI64()`

The integer encoded with `ScValType = I64`.

```ts
toI64(): ScVal;
```

**Throws**

- if the value cannot fit in 64 bits

**Source:** [src/base/numbers/xdr_large_int.ts:125](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L125)

### `xdrLargeInt.toJSON()`

Returns a JSON-friendly representation with `value` and `type` fields.

```ts
toJSON(): { type: string; value: string };
```

**Source:** [src/base/numbers/xdr_large_int.ts:284](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L284)

### `xdrLargeInt.toNumber()`

Converts to a native JS number.

```ts
toNumber(): number;
```

**Throws**

- if the value can't fit into a Number

**Source:** [src/base/numbers/xdr_large_int.ts:103](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L103)

### `xdrLargeInt.toScVal()`

The smallest interpretation of the stored value

```ts
toScVal(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:247](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L247)

### `xdrLargeInt.toString()`

Returns the string representation of this integer.

```ts
toString(): string;
```

**Source:** [src/base/numbers/xdr_large_int.ts:279](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L279)

### `xdrLargeInt.toTimepoint()`

The integer encoded with `ScValType = Timepoint`

```ts
toTimepoint(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:144](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L144)

### `xdrLargeInt.toU128()`

The integer encoded with `ScValType = U128`.

```ts
toU128(): ScVal;
```

**Throws**

- if the value cannot fit in 128 bits

**Source:** [src/base/numbers/xdr_large_int.ts:187](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L187)

### `xdrLargeInt.toU256()`

The integer encoded with `ScValType = U256`

Note: No size check needed - U256 is the largest unsigned type.

```ts
toU256(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:229](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L229)

### `xdrLargeInt.toU64()`

The integer encoded with `ScValType = U64`

```ts
toU64(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:136](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L136)

### `xdrLargeInt.valueOf()`

Returns the primitive value of this integer.

```ts
valueOf(): unknown;
```

**Source:** [src/base/numbers/xdr_large_int.ts:274](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/xdr_large_int.ts#L274)

## cereal

```ts
const cereal: { XdrReader: typeof XdrReader; XdrWriter: typeof XdrWriter }
```

**Source:** [src/base/jsxdr.ts:7](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/jsxdr.ts#L7)

## decodeAddressToMuxedAccount

Converts a Stellar address (in G... or M... form) to an `xdr.MuxedAccount`
structure, using the ed25519 representation when possible.

This supports full muxed accounts, where an `M...` address will resolve to
both its underlying `G...` address and an integer ID.

```ts
decodeAddressToMuxedAccount(address: string): MuxedAccount
```

**Parameters**

- **`address`** — `string` (required) — G... or M... address to encode into XDR

**Source:** [src/base/util/decode_encode_muxed_account.ts:13](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/util/decode_encode_muxed_account.ts#L13)

## encodeMuxedAccount

Transform a Stellar address (G...) and an ID into its XDR representation.

```ts
encodeMuxedAccount(address: string, id: string): MuxedAccount
```

**Parameters**

- **`address`** — `string` (required) — a Stellar G... address
- **`id`** — `string` (required) — a Uint64 ID represented as a string

**Source:** [src/base/util/decode_encode_muxed_account.ts:52](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/util/decode_encode_muxed_account.ts#L52)

## encodeMuxedAccountToAddress

Converts an xdr.MuxedAccount to its StrKey representation.

Returns the "M..." string representation if there is a muxing ID within
the object, or the "G..." representation otherwise.

```ts
encodeMuxedAccountToAddress(muxedAccount: MuxedAccount): string
```

**Parameters**

- **`muxedAccount`** — `MuxedAccount` (required) — raw account to stringify

**See also**

- https://stellar.org/protocol/sep-23

**Source:** [src/base/util/decode_encode_muxed_account.ts:33](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/util/decode_encode_muxed_account.ts#L33)

## extractBaseAddress

Extracts the underlying base (G...) address from an M-address.

```ts
extractBaseAddress(address: string): string
```

**Parameters**

- **`address`** — `string` (required) — an account address (either M... or G...)

**Source:** [src/base/util/decode_encode_muxed_account.ts:74](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/util/decode_encode_muxed_account.ts#L74)

## scValToBigInt

Transforms an opaque `xdr.ScVal` into a native bigint, if possible.

If you then want to use this in the abstractions provided by this module,
you can pass it to the constructor of `XdrLargeInt`.

```ts
scValToBigInt(scv: ScVal): bigint
```

**Parameters**

- **`scv`** — `ScVal` (required) — the XDR smart contract value to convert

**Throws**

- if the `scv` input value doesn't represent an integer

**Example**

```ts
let scv = contract.call("add", x, y); // assume it returns an xdr.ScVal
let bigi = scValToBigInt(scv);

new ScInt(bigi);               // if you don't care about types, and
new XdrLargeInt('i128', bigi); // if you do
```

**Source:** [src/base/numbers/index.ts:31](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/numbers/index.ts#L31)
