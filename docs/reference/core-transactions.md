---
title: Core / Transactions
description: Build, sign, and inspect Stellar transactions with the TransactionBuilder API.
---

# Core / Transactions

## Account

Create a new Account object.

`Account` represents a single account in the Stellar network and its sequence
number. Account tracks the sequence number as it is used by [`TransactionBuilder`](#transactionbuilder). See
[Accounts](https://developers.stellar.org/docs/glossary/accounts/) for
more information about how accounts work in Stellar.

```ts
class Account implements TransactionSource {
  constructor(accountId: string, sequence: string);
  accountId(): string;
  incrementSequenceNumber(): void;
  sequenceNumber(): string;
}
```

**Source:** [src/base/account.ts:16](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/account.ts#L16)

### `new Account(accountId, sequence)`

```ts
constructor(accountId: string, sequence: string);
```

**Parameters**

- **`accountId`** — `string` (required) — ID of the account (ex.
      `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`). If you
      provide a muxed account address, this will throw; use [`MuxedAccount`](#muxedaccount) instead.
- **`sequence`** — `string` (required) — current sequence number of the account

**Source:** [src/base/account.ts:27](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/account.ts#L27)

### `account.accountId()`

Returns Stellar account ID, ex.
`GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`.

```ts
accountId(): string;
```

**Source:** [src/base/account.ts:58](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/account.ts#L58)

### `account.incrementSequenceNumber()`

Increments sequence number in this object by one.

```ts
incrementSequenceNumber(): void;
```

**Source:** [src/base/account.ts:72](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/account.ts#L72)

### `account.sequenceNumber()`

Returns sequence number for the account as a string

```ts
sequenceNumber(): string;
```

**Source:** [src/base/account.ts:65](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/account.ts#L65)

## AuthClawbackEnabledFlag

When set using [`Operation.setOptions`](#operationsetoptions) option, then any trustlines
created by this account can have a ClawbackOp operation submitted for the
corresponding asset.

```ts
const AuthClawbackEnabledFlag: number
```

**See also**

- [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)

**Source:** [src/base/operation.ts:91](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L91)

## AuthImmutableFlag

When set using [`Operation.setOptions`](#operationsetoptions) option, then none of the
authorization flags can be set and the account can never be deleted.

```ts
const AuthImmutableFlag: number
```

**See also**

- [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)

**Source:** [src/base/operation.ts:82](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L82)

## AuthRequiredFlag

When set using [`Operation.setOptions`](#operationsetoptions) option, requires the issuing
account to give other accounts permission before they can hold the issuing
account’s credit.

```ts
const AuthRequiredFlag: number
```

**See also**

- [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)

**Source:** [src/base/operation.ts:68](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L68)

## AuthRevocableFlag

When set using [`Operation.setOptions`](#operationsetoptions) option, allows the issuing
account to revoke its credit held by other accounts.

```ts
const AuthRevocableFlag: number
```

**See also**

- [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)

**Source:** [src/base/operation.ts:75](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L75)

## BASE_FEE

Minimum base fee for transactions. If this fee is below the network
minimum, the transaction will fail. The more operations in the
transaction, the greater the required fee. Use
`Horizon.Server.fetchBaseFee()` to get an accurate value of minimum
transaction fee on the network.

```ts
const BASE_FEE: "100"
```

**See also**

- [Fees](https://developers.stellar.org/docs/glossary/fees/)

**Source:** [src/base/transaction_builder.ts:70](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L70)

## FeeBumpTransaction

Use [`TransactionBuilder.buildFeeBumpTransaction`](#transactionbuilderbuildfeebumptransactionfeesource-basefee-innertx-networkpassphrase) to build a
FeeBumpTransaction object. If you have an object or base64-encoded string of
the transaction envelope XDR use [`TransactionBuilder.fromXdr`](#transactionbuilderfromxdrenvelope-networkpassphrase).

Once a [`FeeBumpTransaction`](#feebumptransaction) has been created, its attributes and operations
should not be changed. You should only add signatures (using [`FeeBumpTransaction#sign`](#feebumptransactionsignkeypairs)) before
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
  hash(): Uint8Array;
  sign(...keypairs: Keypair[]): void;
  signatureBase(): Uint8Array;
  signHashX(preimage: string | Uint8Array<ArrayBufferLike>): void;
  toEnvelope(): TransactionEnvelope;
  toXdr(): string;
}
```

**Source:** [src/base/fee_bump_transaction.ts:25](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L25)

### `new FeeBumpTransaction(envelope, networkPassphrase)`

```ts
constructor(envelope: string | TransactionEnvelope, networkPassphrase: string);
```

**Parameters**

- **`envelope`** — `string | TransactionEnvelope` (required) — transaction envelope object or base64 encoded string.
- **`networkPassphrase`** — `string` (required) — passphrase of the target Stellar network
      (e.g. "Public Global Stellar Network ; September 2015").

**Source:** [src/base/fee_bump_transaction.ts:34](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L34)

### `feeBumpTransaction.fee`

The total fee for this transaction, in stroops.

```ts
fee: string;
```

**Source:** [src/base/transaction_base.ts:87](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L87)

### `feeBumpTransaction.feeSource`

The account paying the fee for this transaction.

```ts
readonly feeSource: string;
```

**Source:** [src/base/fee_bump_transaction.ts:86](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L86)

### `feeBumpTransaction.innerTransaction`

The inner transaction that this fee bump wraps.

```ts
readonly innerTransaction: Transaction;
```

**Source:** [src/base/fee_bump_transaction.ts:72](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L72)

### `feeBumpTransaction.networkPassphrase`

The network passphrase for this transaction.

```ts
networkPassphrase: string;
```

**Source:** [src/base/transaction_base.ts:96](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L96)

### `feeBumpTransaction.operations`

The operations from the inner transaction.

```ts
readonly operations: OperationRecord[];
```

**Source:** [src/base/fee_bump_transaction.ts:79](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L79)

### `feeBumpTransaction.signatures`

The list of signatures for this transaction.

```ts
signatures: DecoratedSignature[];
```

**Source:** [src/base/transaction_base.ts:46](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L46)

### `feeBumpTransaction.tx`

The underlying XDR transaction object.

Returns a defensive copy so that external mutations cannot alter the
transaction that will be signed or serialized.

```ts
tx: TTx;
```

**Throws**

- if the internal transaction is not a recognized XDR type

**Source:** [src/base/transaction_base.ts:62](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L62)

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

**Source:** [src/base/transaction_base.ts:207](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L207)

### `feeBumpTransaction.addSignature(publicKey, signature)`

Add a signature to the transaction. Useful when a party wants to pre-sign
a transaction but doesn't want to give access to their secret keys.
This will also verify whether the signature is valid.

Here's how you would use this feature to solicit multiple signatures.
- Use `TransactionBuilder` to build a new transaction.
- Make sure to set a long enough timeout on that transaction to give your
signers enough time to sign!
- Once you build the transaction, use `transaction.toXdr()` to get the
base64-encoded XDR string.
- _Warning!_ Once you've built this transaction, don't submit any other
transactions onto your account! Doing so will invalidate this pre-compiled
transaction!
- Send this XDR string to your other parties. They can use the instructions
for [`getKeypairSignature`](#feebumptransactiongetkeypairsignaturekeypair) to sign the transaction.
- They should send you back their `publicKey` and the `signature` string
from [`getKeypairSignature`](#feebumptransactiongetkeypairsignaturekeypair), both of which you pass to
this function.

```ts
addSignature(publicKey: string = "", signature: string = ""): void;
```

**Parameters**

- **`publicKey`** — `string` (optional) (default: `""`) — the public key of the signer
- **`signature`** — `string` (optional) (default: `""`) — the base64 value of the signature XDR

**Source:** [src/base/transaction_base.ts:167](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L167)

### `feeBumpTransaction.getKeypairSignature(keypair)`

Signs a transaction with the given [`Keypair`](/reference/core-keys/#keypair). Useful if someone sends
you a transaction XDR for you to sign and return (see
[`addSignature`](#feebumptransactionaddsignaturepublickey-signature) for more information).

When you get a transaction XDR to sign....
- Instantiate a `Transaction` object with the XDR
- Use [`Keypair`](/reference/core-keys/#keypair) to generate a keypair object for your Stellar seed.
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

**Source:** [src/base/transaction_base.ts:140](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L140)

### `feeBumpTransaction.hash()`

Returns a hash for this transaction, suitable for signing.

```ts
hash(): Uint8Array;
```

**Source:** [src/base/transaction_base.ts:233](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L233)

### `feeBumpTransaction.sign(keypairs)`

Signs the transaction with the given [`Keypair`](/reference/core-keys/#keypair).

```ts
sign(...keypairs: Keypair[]): void;
```

**Parameters**

- **`...keypairs`** — `Keypair[]` (required) — Keypairs of signers

**Source:** [src/base/transaction_base.ts:108](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L108)

### `feeBumpTransaction.signatureBase()`

Returns the "signature base" of this transaction, which is the value
that, when hashed, should be signed to create a signature that
validators on the Stellar Network will accept.

It is composed of a 4 prefix bytes followed by the xdr-encoded form
of this transaction.

```ts
signatureBase(): Uint8Array;
```

**Source:** [src/base/fee_bump_transaction.ts:98](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L98)

### `feeBumpTransaction.signHashX(preimage)`

Add `hashX` signer preimage as signature.

```ts
signHashX(preimage: string | Uint8Array<ArrayBufferLike>): void;
```

**Parameters**

- **`preimage`** — `string | Uint8Array<ArrayBufferLike>` (required) — preimage of hash used as signer

**Source:** [src/base/transaction_base.ts:215](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L215)

### `feeBumpTransaction.toEnvelope()`

To envelope returns a xdr.TransactionEnvelope which can be submitted to the network.

```ts
toEnvelope(): TransactionEnvelope;
```

**Source:** [src/base/fee_bump_transaction.ts:115](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L115)

### `feeBumpTransaction.toXdr()`

Returns the transaction envelope as a base64-encoded XDR string.

```ts
toXdr(): string;
```

**Source:** [src/base/transaction_base.ts:250](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L250)

## Memo

`Memo` represents memos attached to transactions.

```ts
class Memo<T extends MemoType = MemoType> {
  constructor(type: "none", value?: null);
  static fromXdrObject(object: Memo): Memo;
  static hash(hash: string | Uint8Array<ArrayBufferLike>): Memo<"hash">;
  static id(id: string | bigint): Memo<"id">;
  static none(): Memo<"none">;
  static return(hash: string | Uint8Array<ArrayBufferLike>): Memo<"return">;
  static text(text: string | Uint8Array<ArrayBufferLike>): Memo<"text">;
  type: T;
  value: MemoTypeToValue<T>;
  toXdrObject(): Memo;
}
```

**See also**

- [Transactions concept](https://developers.stellar.org/docs/glossary/transactions/)

**Source:** [src/base/memo.ts:59](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L59)

### `new Memo(type, value)`

```ts
constructor(type: "none", value?: null);
```

**Parameters**

- **`type`** — `"none"` (required)
- **`value`** — `null` (optional)

**Source:** [src/base/memo.ts:63](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L63)

### `Memo.fromXdrObject(object)`

Returns [`Memo`](#memo) from XDR memo object.

```ts
static fromXdrObject(object: Memo): Memo;
```

**Parameters**

- **`object`** — `Memo` (required) — XDR memo object

**Source:** [src/base/memo.ts:312](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L312)

### `Memo.hash(hash)`

Creates and returns a `MemoHash` memo.

```ts
static hash(hash: string | Uint8Array<ArrayBufferLike>): Memo<"hash">;
```

**Parameters**

- **`hash`** — `string | Uint8Array<ArrayBufferLike>` (required) — 32 byte hash or hex encoded string

**Source:** [src/base/memo.ts:271](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L271)

### `Memo.id(id)`

Creates and returns a `MemoID` memo.

```ts
static id(id: string | bigint): Memo<"id">;
```

**Parameters**

- **`id`** — `string | bigint` (required) — 64-bit number represented as a string

**Source:** [src/base/memo.ts:262](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L262)

### `Memo.none()`

Returns an empty memo (`MemoNone`).

```ts
static none(): Memo<"none">;
```

**Source:** [src/base/memo.ts:242](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L242)

### `Memo.return(hash)`

Creates and returns a `MemoReturn` memo.

```ts
static return(hash: string | Uint8Array<ArrayBufferLike>): Memo<"return">;
```

**Parameters**

- **`hash`** — `string | Uint8Array<ArrayBufferLike>` (required) — 32 byte hash or hex encoded string

**Source:** [src/base/memo.ts:280](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L280)

### `Memo.text(text)`

Creates and returns a `MemoText` memo.

```ts
static text(text: string | Uint8Array<ArrayBufferLike>): Memo<"text">;
```

**Parameters**

- **`text`** — `string | Uint8Array<ArrayBufferLike>` (required) — memo text. A JS string is UTF-8 encoded on the wire;
    pass a `Uint8Array` for byte-exact content. A plain `number[]` is not
    accepted (16.2.0 and earlier took one); wrap it: `new Uint8Array(arr)`.

**Source:** [src/base/memo.ts:253](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L253)

### `memo.type`

Contains memo type: `MemoNone`, `MemoID`, `MemoText`, `MemoHash` or `MemoReturn`

```ts
type: T;
```

**Source:** [src/base/memo.ts:104](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L104)

### `memo.value`

Contains memo value:
* `null` for `MemoNone`,
* `string` for `MemoID`,
* `Uint8Array` for `MemoText` after decoding using `fromXdrObject`, original value otherwise,
* `Uint8Array` for `MemoHash`, `MemoReturn`.

```ts
value: MemoTypeToValue<T>;
```

**Source:** [src/base/memo.ts:119](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L119)

### `memo.toXdrObject()`

Returns XDR memo object.

```ts
toXdrObject(): Memo;
```

**Source:** [src/base/memo.ts:287](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L287)

## MemoHash

Type of [`Memo`](#memo).

```ts
const MemoHash: "hash"
```

**Source:** [src/base/memo.ts:21](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L21)

## MemoID

Type of [`Memo`](#memo).

```ts
const MemoID: "id"
```

**Source:** [src/base/memo.ts:13](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L13)

## MemoNone

Type of [`Memo`](#memo).

```ts
const MemoNone: "none"
```

**Source:** [src/base/memo.ts:9](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L9)

## MemoReturn

Type of [`Memo`](#memo).

```ts
const MemoReturn: "return"
```

**Source:** [src/base/memo.ts:25](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L25)

## MemoText

Type of [`Memo`](#memo).

```ts
const MemoText: "text"
```

**Source:** [src/base/memo.ts:17](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L17)

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
*requires* an [`Account`](#account) instance to be passed in, so that muxed
instances of an account can collectively modify the sequence number whenever
a muxed account is used as the source of a [`Transaction`](#transaction) with [`TransactionBuilder`](#transactionbuilder).

```ts
class MuxedAccount implements TransactionSource {
  constructor(baseAccount: Account, id: string);
  static fromAddress(mAddress: string, sequenceNum: string): MuxedAccount;
  accountId(): string;
  baseAccount(): Account;
  equals(otherMuxedAccount: MuxedAccount): boolean;
  id(): string;
  incrementSequenceNumber(): void;
  sequenceNumber(): string;
  setId(id: string): MuxedAccount;
  toXdrObject(): MuxedAccount;
}
```

**See also**

- https://developers.stellar.org/docs/glossary/muxed-accounts/

**Source:** [src/base/muxed_account.ts:60](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/muxed_account.ts#L60)

### `new MuxedAccount(baseAccount, id)`

```ts
constructor(baseAccount: Account, id: string);
```

**Parameters**

- **`baseAccount`** — `Account` (required) — the [`Account`](#account) instance representing the
      underlying G... address
- **`id`** — `string` (required) — a stringified uint64 value that represents the ID of the
      muxed account

**Source:** [src/base/muxed_account.ts:72](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/muxed_account.ts#L72)

### `MuxedAccount.fromAddress(mAddress, sequenceNum)`

Parses an M-address into a MuxedAccount object.

```ts
static fromAddress(mAddress: string, sequenceNum: string): MuxedAccount;
```

**Parameters**

- **`mAddress`** — `string` (required) — an M-address to transform
- **`sequenceNum`** — `string` (required) — the sequence number of the underlying [`Account`](#account), to use for the underlying base account [`MuxedAccount.baseAccount`](#muxedaccountbaseaccount). If you're using the SDK, you can use
      `server.loadAccount` to fetch this if you don't know it.

**Source:** [src/base/muxed_account.ts:96](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/muxed_account.ts#L96)

### `muxedAccount.accountId()`

Returns the M-address representing this account's (G-address, ID).

```ts
accountId(): string;
```

**Source:** [src/base/muxed_account.ts:118](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/muxed_account.ts#L118)

### `muxedAccount.baseAccount()`

Returns the underlying account object shared among all muxed
accounts with this Stellar address.

```ts
baseAccount(): Account;
```

**Source:** [src/base/muxed_account.ts:111](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/muxed_account.ts#L111)

### `muxedAccount.equals(otherMuxedAccount)`

Checks whether two muxed accounts are equal by comparing their M-addresses.

```ts
equals(otherMuxedAccount: MuxedAccount): boolean;
```

**Parameters**

- **`otherMuxedAccount`** — `MuxedAccount` (required) — the MuxedAccount to compare against

**Source:** [src/base/muxed_account.ts:174](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/muxed_account.ts#L174)

### `muxedAccount.id()`

Returns the uint64 ID of this muxed account as a string.

```ts
id(): string;
```

**Source:** [src/base/muxed_account.ts:125](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/muxed_account.ts#L125)

### `muxedAccount.incrementSequenceNumber()`

Increments the underlying account's sequence number by one.

```ts
incrementSequenceNumber(): void;
```

**Source:** [src/base/muxed_account.ts:157](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/muxed_account.ts#L157)

### `muxedAccount.sequenceNumber()`

Returns the stringified sequence number for the underlying account.

```ts
sequenceNumber(): string;
```

**Source:** [src/base/muxed_account.ts:150](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/muxed_account.ts#L150)

### `muxedAccount.setId(id)`

Updates the muxed account's ID, regenerating the M-address accordingly.

```ts
setId(id: string): MuxedAccount;
```

**Parameters**

- **`id`** — `string` (required) — a stringified uint64 value to set as the new muxed account ID

**Source:** [src/base/muxed_account.ts:134](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/muxed_account.ts#L134)

### `muxedAccount.toXdrObject()`

Returns the XDR object representing this muxed account's
G-address and uint64 ID.

```ts
toXdrObject(): MuxedAccount;
```

**Source:** [src/base/muxed_account.ts:165](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/muxed_account.ts#L165)

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
  static accountMerge: (opts: AccountMergeOpts) => Operation;
  static allowTrust: (opts: AllowTrustOpts) => Operation;
  static beginSponsoringFutureReserves: (opts: BeginSponsoringFutureReservesOpts) => Operation;
  static bumpSequence: (opts: BumpSequenceOpts) => Operation;
  static changeTrust: (opts: ChangeTrustOpts) => Operation;
  static claimClaimableBalance: (opts: ClaimClaimableBalanceOpts = ...) => Operation;
  static clawback: (opts: ClawbackOpts) => Operation;
  static clawbackClaimableBalance: (opts: ClawbackClaimableBalanceOpts = ...) => Operation;
  static createAccount: (opts: CreateAccountOpts) => Operation;
  static createClaimableBalance: (opts: CreateClaimableBalanceOpts) => Operation;
  static createCustomContract: (opts: CreateCustomContractOpts) => Operation;
  static createPassiveSellOffer: (opts: CreatePassiveSellOfferOpts) => Operation;
  static createStellarAssetContract: (opts: CreateStellarAssetContractOpts) => Operation;
  static endSponsoringFutureReserves: (opts: EndSponsoringFutureReservesOpts = {}) => Operation;
  static extendFootprintTtl: (opts: ExtendFootprintTtlOpts) => Operation;
  static inflation: (opts: InflationOpts = {}) => Operation;
  static invokeContractFunction: (opts: InvokeContractFunctionOpts) => Operation;
  static invokeHostFunction: (opts: InvokeHostFunctionOpts) => Operation;
  static liquidityPoolDeposit: (opts: LiquidityPoolDepositOpts = ...) => Operation;
  static liquidityPoolWithdraw: (opts: LiquidityPoolWithdrawOpts = ...) => Operation;
  static manageBuyOffer: (opts: ManageBuyOfferOpts) => Operation;
  static manageData: (opts: ManageDataOpts) => Operation;
  static manageSellOffer: (opts: ManageSellOfferOpts) => Operation;
  static pathPaymentStrictReceive: (opts: PathPaymentStrictReceiveOpts) => Operation;
  static pathPaymentStrictSend: (opts: PathPaymentStrictSendOpts) => Operation;
  static payment: (opts: PaymentOpts) => Operation;
  static restoreFootprint: (opts: RestoreFootprintOpts = {}) => Operation;
  static revokeAccountSponsorship: (opts: RevokeAccountSponsorshipOpts = ...) => Operation;
  static revokeClaimableBalanceSponsorship: (opts: RevokeClaimableBalanceSponsorshipOpts = ...) => Operation;
  static revokeDataSponsorship: (opts: RevokeDataSponsorshipOpts = ...) => Operation;
  static revokeLiquidityPoolSponsorship: (opts: RevokeLiquidityPoolSponsorshipOpts = ...) => Operation;
  static revokeOfferSponsorship: (opts: RevokeOfferSponsorshipOpts = ...) => Operation;
  static revokeSignerSponsorship: (opts: RevokeSignerSponsorshipOpts = ...) => Operation;
  static revokeTrustlineSponsorship: (opts: RevokeTrustlineSponsorshipOpts = ...) => Operation;
  static setOptions: <T extends SignerOpts = never>(opts: SetOptionsOpts<T>) => Operation;
  static setTrustLineFlags: (opts: SetTrustLineFlagsOpts) => Operation;
  static uploadContractWasm: (opts: UploadContractWasmOpts) => Operation;
  static fromXdrObject<T extends OperationRecord = OperationRecord>(operation: Operation): T;
}
```

**Source:** [src/base/operation.ts:139](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L139)

### `new Operation()`

```ts
constructor();
```

### `Operation.accountMerge`

Transfers native balance to destination account.

```ts
static accountMerge: (opts: AccountMergeOpts) => Operation;
```

**Parameters**

- **`opts`** — `AccountMergeOpts` (required) — options object
    - `destination`: destination to merge the source account into
    - `source`: operation source account (defaults to
      transaction source)

**Source:** [src/base/operation.ts:444](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L444)

### `Operation.allowTrust`

**Deprecated.** since v5.0

An "allow trust" operation authorizes another account to hold your
account's credit for a given asset.

```ts
static allowTrust: (opts: AllowTrustOpts) => Operation;
```

**Parameters**

- **`opts`** — `AllowTrustOpts` (required) — Options object
    - `trustor`: The trusting account (the one being authorized)
    - `assetCode`: The asset code being authorized.
    - `authorize`: `1` to authorize, `2` to authorize to maintain liabilities, and `0` to deauthorize.
    - `source`: The source account (defaults to transaction source).

**Source:** [src/base/operation.ts:445](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L445)

### `Operation.beginSponsoringFutureReserves`

Create a "begin sponsoring future reserves" operation.

```ts
static beginSponsoringFutureReserves: (opts: BeginSponsoringFutureReservesOpts) => Operation;
```

**Parameters**

- **`opts`** — `BeginSponsoringFutureReservesOpts` (required) — Options object
    - `sponsoredId`: The sponsored account id.
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**Example**

```ts
const op = Operation.beginSponsoringFutureReserves({
  sponsoredId: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
});
```

**Source:** [src/base/operation.ts:461](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L461)

### `Operation.bumpSequence`

This operation bumps sequence number.

```ts
static bumpSequence: (opts: BumpSequenceOpts) => Operation;
```

**Parameters**

- **`opts`** — `BumpSequenceOpts` (required) — Options object
    - `bumpTo`: Sequence number to bump to.
    - `source`: The optional source account.

**Source:** [src/base/operation.ts:446](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L446)

### `Operation.changeTrust`

A "change trust" operation adds, removes, or updates a trust line for a
given asset from the source account to another.

```ts
static changeTrust: (opts: ChangeTrustOpts) => Operation;
```

**Parameters**

- **`opts`** — `ChangeTrustOpts` (required) — Options object
    - `asset`: The asset for the trust line.
    - `limit`: The limit for the asset, defaults to max int64.
      If the limit is set to "0" it deletes the trustline.
    - `source`: The source account (defaults to transaction source).

**Source:** [src/base/operation.ts:447](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L447)

### `Operation.claimClaimableBalance`

Create a new claim claimable balance operation.

```ts
static claimClaimableBalance: (opts: ClaimClaimableBalanceOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `ClaimClaimableBalanceOpts` (optional) (default: `...`) — Options object
    - `balanceId`: The claimable balance id to be claimed.
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**Example**

```ts
const op = Operation.claimClaimableBalance({
  balanceId: '00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be',
});
```

**Source:** [src/base/operation.ts:450](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L450)

### `Operation.clawback`

Creates a clawback operation.

```ts
static clawback: (opts: ClawbackOpts) => Operation;
```

**Parameters**

- **`opts`** — `ClawbackOpts` (required) — Options object
    - `asset`: The asset being clawed back.
    - `amount`: The amount of the asset to claw back.
    - `from`: The public key of the (optionally-muxed)
      account to claw back from.
    - `source`: The source account for the operation.
      Defaults to the transaction's source account.

**See also**

- https://github.com/stellar/stellar-protocol/blob/master/core/cap-0035.md#clawback-operation

**Source:** [src/base/operation.ts:471](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L471)

### `Operation.clawbackClaimableBalance`

Creates a clawback operation for a claimable balance.

```ts
static clawbackClaimableBalance: (opts: ClawbackClaimableBalanceOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `ClawbackClaimableBalanceOpts` (optional) (default: `...`) — Options object
    - `balanceId`: The claimable balance ID to be clawed back.
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**Example**

```ts
const op = Operation.clawbackClaimableBalance({
  balanceId: '00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be',
});
```

**See also**

- https://github.com/stellar/stellar-protocol/blob/master/core/cap-0035.md#clawback-claimable-balance-operation

**Source:** [src/base/operation.ts:451](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L451)

### `Operation.createAccount`

Create and fund a non-existent account.

```ts
static createAccount: (opts: CreateAccountOpts) => Operation;
```

**Parameters**

- **`opts`** — `CreateAccountOpts` (required) — Options object
    - `destination`: Destination account ID to create an account for.
    - `startingBalance`: Amount in XLM the account should be funded for. Must be greater
      than the `reserve balance amount`.
    - `source`: The source account for the payment. Defaults to the transaction's source account.

**Source:** [src/base/operation.ts:448](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L448)

### `Operation.createClaimableBalance`

Create a new claimable balance operation.

```ts
static createClaimableBalance: (opts: CreateClaimableBalanceOpts) => Operation;
```

**Parameters**

- **`opts`** — `CreateClaimableBalanceOpts` (required) — Options object
    - `asset`: The asset for the claimable balance.
    - `amount`: Amount.
    - `claimants`: An array of Claimants
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**Example**

```ts
const asset = new Asset(
  'USD',
  'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
);
const amount = '100.0000000';
const claimants = [
  new Claimant(
    'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
     Claimant.predicateBeforeAbsoluteTime("4102444800000")
  )
];

const op = Operation.createClaimableBalance({
  asset,
  amount,
  claimants
});
```

**Source:** [src/base/operation.ts:449](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L449)

### `Operation.createCustomContract`

Returns an operation that creates a custom WASM contract and atomically
invokes its constructor.

```ts
static createCustomContract: (opts: CreateCustomContractOpts) => Operation;
```

**Parameters**

- **`opts`** — `CreateCustomContractOpts` (required) — the set of parameters
    - `address`: the contract uploader address
    - `wasmHash`: the SHA-256 hash of the contract WASM you're uploading
    - `constructorArgs`: the optional parameters to pass to the constructor
    - `salt`: an optional, 32-byte salt to distinguish deployment instances
    - `auth`: an optional list outlining the tree of authorizations required for the call
    - `source`: an optional source account

**See also**

- https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions#function

**Source:** [src/base/operation.ts:483](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L483)

### `Operation.createPassiveSellOffer`

A "create passive offer" operation creates an offer that won't consume a
counter offer that exactly matches this offer. This is useful for offers
just used as 1:1 exchanges for path payments. Use manage offer to manage
this offer after using this operation to create it.

```ts
static createPassiveSellOffer: (opts: CreatePassiveSellOfferOpts) => Operation;
```

**Parameters**

- **`opts`** — `CreatePassiveSellOfferOpts` (required) — Options object
    - `selling`: What you're selling.
    - `buying`: What you're buying.
    - `amount`: The total amount you're selling. If 0, deletes the offer.
    - `price`: Price of 1 unit of `selling` in terms of `buying`.
      - `n`: If `opts.price` is an object: the price numerator
      - `d`: If `opts.price` is an object: the price denominator
    - `source`: The source account (defaults to transaction source).

**Throws**

- when the best rational approximation of `price` cannot be found.

**Source:** [src/base/operation.ts:452](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L452)

### `Operation.createStellarAssetContract`

Returns an operation that wraps a Stellar asset into a token contract.

```ts
static createStellarAssetContract: (opts: CreateStellarAssetContractOpts) => Operation;
```

**Parameters**

- **`opts`** — `CreateStellarAssetContractOpts` (required) — the set of parameters
    - `asset`: the Stellar asset to wrap, either as an [`Asset`](/reference/core-assets/#asset) object or in canonical form (SEP-11, `code:issuer`)
    - `auth`: an optional list outlining the tree of authorizations required for the upload
    - `source`: an optional source account

**See also**

- - https://stellar.org/protocol/sep-11#alphanum4-alphanum12
 - https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions
 - https://soroban.stellar.org/docs/advanced-tutorials/stellar-asset-contract
 - Operation.invokeHostFunction

**Source:** [src/base/operation.ts:481](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L481)

### `Operation.endSponsoringFutureReserves`

Create an "end sponsoring future reserves" operation.

```ts
static endSponsoringFutureReserves: (opts: EndSponsoringFutureReservesOpts = {}) => Operation;
```

**Parameters**

- **`opts`** — `EndSponsoringFutureReservesOpts` (optional) (default: `{}`) — Options object
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**Example**

```ts
const op = Operation.endSponsoringFutureReserves();
```

**Source:** [src/base/operation.ts:462](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L462)

### `Operation.extendFootprintTtl`

Builds an operation to bump the time-to-live (TTL) of the ledger keys. The
keys for extension have to be provided in the read-only footprint of
the transaction.

The only parameter of the operation itself is the new minimum TTL for
all the provided entries. If an entry already has a higher TTL, then it
will just be skipped.

TTL is the number of ledgers from the current ledger (exclusive) until
the last ledger the entry is still considered alive (inclusive). Thus
the exact ledger until the entries will live will only be determined
when transaction has been applied.

The footprint has to be specified in the transaction. See
[`TransactionBuilder`](#transactionbuilder)'s `opts.sorobanData` parameter, which is a
`xdr.SorobanTransactionData` instance that contains fee data & resource
usage as part of `xdr.SorobanResources`.

```ts
static extendFootprintTtl: (opts: ExtendFootprintTtlOpts) => Operation;
```

**Parameters**

- **`opts`** — `ExtendFootprintTtlOpts` (required) — object holding operation parameters
    - `extendTo`: the minimum TTL that all the entries in
      the read-only footprint will have
    - `source`: an optional source account

**Source:** [src/base/operation.ts:476](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L476)

### `Operation.inflation`

This operation generates the inflation.

```ts
static inflation: (opts: InflationOpts = {}) => Operation;
```

**Parameters**

- **`opts`** — `InflationOpts` (optional) (default: `{}`) — Options object
    - `source`: The optional source account.

**Source:** [src/base/operation.ts:453](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L453)

### `Operation.invokeContractFunction`

Returns an operation that invokes a contract function.

```ts
static invokeContractFunction: (opts: InvokeContractFunctionOpts) => Operation;
```

**Parameters**

- **`opts`** — `InvokeContractFunctionOpts` (required) — the set of parameters
    - `contract`: a strkey-fied contract address (`C...`)
    - `function`: the name of the contract fn to invoke
    - `args`: parameters to pass to the function invocation
    - `auth`: an optional list outlining the tree of authorizations required for the call
    - `source`: an optional source account

**See also**

- - Operation.invokeHostFunction
 - Contract.call
 - Address

**Source:** [src/base/operation.ts:482](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L482)

### `Operation.invokeHostFunction`

Invokes a single smart contract host function.

```ts
static invokeHostFunction: (opts: InvokeHostFunctionOpts) => Operation;
```

**Parameters**

- **`opts`** — `InvokeHostFunctionOpts` (required) — options object
    - `func`: host function to execute (with its wrapped parameters)
    - `auth`: list outlining the tree of authorizations required for the call
    - `source`: an optional source account

**See also**

- - https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions#function
 - Operation.invokeContractFunction
 - Operation.createCustomContract
 - Operation.createStellarAssetContract
 - Operation.uploadContractWasm
 - Contract.call

**Source:** [src/base/operation.ts:475](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L475)

### `Operation.liquidityPoolDeposit`

Creates a liquidity pool deposit operation.

```ts
static liquidityPoolDeposit: (opts: LiquidityPoolDepositOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `LiquidityPoolDepositOpts` (optional) (default: `...`) — Options object
    - `liquidityPoolId`: The liquidity pool ID.
    - `maxAmountA`: Maximum amount of first asset to deposit.
    - `maxAmountB`: Maximum amount of second asset to deposit.
    - `minPrice`: Minimum depositA/depositB price.
      - `n`: If `opts.minPrice` is an object: the price numerator
      - `d`: If `opts.minPrice` is an object: the price denominator
    - `maxPrice`: Maximum depositA/depositB price.
      - `n`: If `opts.maxPrice` is an object: the price numerator
      - `d`: If `opts.maxPrice` is an object: the price denominator
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**See also**

- https://developers.stellar.org/docs/start/list-of-operations/#liquidity-pool-deposit

**Source:** [src/base/operation.ts:473](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L473)

### `Operation.liquidityPoolWithdraw`

Creates a liquidity pool withdraw operation.

```ts
static liquidityPoolWithdraw: (opts: LiquidityPoolWithdrawOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `LiquidityPoolWithdrawOpts` (optional) (default: `...`) — Options object
    - `liquidityPoolId`: The liquidity pool ID.
    - `amount`: Amount of pool shares to withdraw.
    - `minAmountA`: Minimum amount of first asset to withdraw.
    - `minAmountB`: Minimum amount of second asset to withdraw.
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**See also**

- https://developers.stellar.org/docs/start/list-of-operations/#liquidity-pool-withdraw

**Source:** [src/base/operation.ts:474](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L474)

### `Operation.manageBuyOffer`

Returns a XDR ManageBuyOfferOp. A "manage buy offer" operation creates, updates, or
deletes a buy offer.

```ts
static manageBuyOffer: (opts: ManageBuyOfferOpts) => Operation;
```

**Parameters**

- **`opts`** — `ManageBuyOfferOpts` (required) — Options object
    - `selling`: What you're selling.
    - `buying`: What you're buying.
    - `buyAmount`: The total amount you're buying. If 0, deletes the offer.
    - `price`: Price of 1 unit of `buying` in terms of `selling`.
      - `n`: If `opts.price` is an object: the price numerator
      - `d`: If `opts.price` is an object: the price denominator
    - `offerId`: If `0`, will create a new offer (default). Otherwise, edits an existing offer.
    - `source`: The source account (defaults to transaction source).

**Throws**

- when the best rational approximation of `price` cannot be found.

**Source:** [src/base/operation.ts:456](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L456)

### `Operation.manageData`

This operation adds data entry to the ledger.

```ts
static manageData: (opts: ManageDataOpts) => Operation;
```

**Parameters**

- **`opts`** — `ManageDataOpts` (required) — Options object
    - `name`: The name of the data entry.
    - `value`: The value of the data entry.
    - `source`: The optional source account.

**Source:** [src/base/operation.ts:454](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L454)

### `Operation.manageSellOffer`

Returns a XDR ManageSellOfferOp. A "manage sell offer" operation creates, updates, or
deletes an offer.

```ts
static manageSellOffer: (opts: ManageSellOfferOpts) => Operation;
```

**Parameters**

- **`opts`** — `ManageSellOfferOpts` (required) — Options object
    - `selling`: What you're selling.
    - `buying`: What you're buying.
    - `amount`: The total amount you're selling. If 0, deletes the offer.
    - `price`: Price of 1 unit of `selling` in terms of `buying`.
      - `n`: If `opts.price` is an object: the price numerator
      - `d`: If `opts.price` is an object: the price denominator
    - `offerId`: If `0`, will create a new offer (default). Otherwise, edits an existing offer.
    - `source`: The source account (defaults to transaction source).

**Throws**

- when the best rational approximation of `price` cannot be found.

**Source:** [src/base/operation.ts:455](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L455)

### `Operation.pathPaymentStrictReceive`

Creates a PathPaymentStrictReceive operation.

A `PathPaymentStrictReceive` operation sends the specified amount to the
destination account. It credits the destination with `destAmount` of
`destAsset`, while debiting at most `sendMax` of `sendAsset` from the source.
The transfer optionally occurs through a path. XLM payments create the
destination account if it does not exist.

```ts
static pathPaymentStrictReceive: (opts: PathPaymentStrictReceiveOpts) => Operation;
```

**Parameters**

- **`opts`** — `PathPaymentStrictReceiveOpts` (required) — Options object
    - `sendAsset`: asset to pay with
    - `sendMax`: maximum amount of sendAsset to send
    - `destination`: destination account to send to
    - `destAsset`: asset the destination will receive
    - `destAmount`: amount the destination receives
    - `path`: array of Asset objects to use as the path
    - `source`: The source account for the payment.
      Defaults to the transaction's source account.

**See also**

- https://developers.stellar.org/docs/start/list-of-operations/#path-payment-strict-receive

**Source:** [src/base/operation.ts:457](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L457)

### `Operation.pathPaymentStrictSend`

Creates a PathPaymentStrictSend operation.

A `PathPaymentStrictSend` operation sends the specified amount to the
destination account crediting at least `destMin` of `destAsset`, optionally
through a path. XLM payments create the destination account if it does not
exist.

```ts
static pathPaymentStrictSend: (opts: PathPaymentStrictSendOpts) => Operation;
```

**Parameters**

- **`opts`** — `PathPaymentStrictSendOpts` (required) — Options object
    - `sendAsset`: asset to pay with
    - `sendAmount`: amount of sendAsset to send (excluding fees)
    - `destination`: destination account to send to
    - `destAsset`: asset the destination will receive
    - `destMin`: minimum amount of destAsset to be received
    - `path`: array of Asset objects to use as the path
    - `source`: The source account for the payment. Defaults to the transaction's source account.

**See also**

- https://developers.stellar.org/docs/start/list-of-operations/#path-payment-strict-send

**Source:** [src/base/operation.ts:458](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L458)

### `Operation.payment`

Create a payment operation.

```ts
static payment: (opts: PaymentOpts) => Operation;
```

**Parameters**

- **`opts`** — `PaymentOpts` (required) — options object
    - `destination`: destination account ID
    - `asset`: asset to send
    - `amount`: amount to send
    - `source`: The source account for the payment.
      Defaults to the transaction's source account.

**See also**

- https://developers.stellar.org/docs/start/list-of-operations/#payment

**Source:** [src/base/operation.ts:459](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L459)

### `Operation.restoreFootprint`

Builds an operation to restore the archived ledger entries specified
by the ledger keys.

The ledger keys to restore are specified separately from the operation
in read-write footprint of the transaction.

It takes no parameters because the relevant footprint is derived from the
transaction itself. See [`TransactionBuilder`](#transactionbuilder)'s `opts.sorobanData`
parameter (or [`TransactionBuilder.setSorobanData`](#transactionbuildersetsorobandatasorobandata)), which is a
`xdr.SorobanTransactionData` instance that contains fee data & resource
usage as part of `xdr.SorobanTransactionData`.

```ts
static restoreFootprint: (opts: RestoreFootprintOpts = {}) => Operation;
```

**Parameters**

- **`opts`** — `RestoreFootprintOpts` (optional) (default: `{}`) — an optional set of parameters
    - `source`: an optional source account

**Source:** [src/base/operation.ts:477](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L477)

### `Operation.revokeAccountSponsorship`

Create a "revoke sponsorship" operation for an account.

```ts
static revokeAccountSponsorship: (opts: RevokeAccountSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeAccountSponsorshipOpts` (optional) (default: `...`) — Options object
    - `account`: The sponsored account ID.
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**Example**

```ts
const op = Operation.revokeAccountSponsorship({
  account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
});
```

**Source:** [src/base/operation.ts:463](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L463)

### `Operation.revokeClaimableBalanceSponsorship`

Create a "revoke sponsorship" operation for a claimable balance.

```ts
static revokeClaimableBalanceSponsorship: (opts: RevokeClaimableBalanceSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeClaimableBalanceSponsorshipOpts` (optional) (default: `...`) — Options object
    - `balanceId`: The sponsored claimable balance ID.
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**Example**

```ts
const op = Operation.revokeClaimableBalanceSponsorship({
  balanceId: '00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be',
});
```

**Source:** [src/base/operation.ts:467](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L467)

### `Operation.revokeDataSponsorship`

Create a "revoke sponsorship" operation for a data entry.

```ts
static revokeDataSponsorship: (opts: RevokeDataSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeDataSponsorshipOpts` (optional) (default: `...`) — Options object
    - `account`: The account ID which owns the data entry.
    - `name`: The name of the data entry.
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**Example**

```ts
const op = Operation.revokeDataSponsorship({
  account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
  name: 'foo'
});
```

**Source:** [src/base/operation.ts:466](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L466)

### `Operation.revokeLiquidityPoolSponsorship`

Creates a "revoke sponsorship" operation for a liquidity pool.

```ts
static revokeLiquidityPoolSponsorship: (opts: RevokeLiquidityPoolSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeLiquidityPoolSponsorshipOpts` (optional) (default: `...`) — Options object.
    - `liquidityPoolId`: The sponsored liquidity pool ID in 'hex' string.
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**Example**

```ts
const op = Operation.revokeLiquidityPoolSponsorship({
  liquidityPoolId: 'dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7',
});
```

**Source:** [src/base/operation.ts:469](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L469)

### `Operation.revokeOfferSponsorship`

Create a "revoke sponsorship" operation for an offer.

```ts
static revokeOfferSponsorship: (opts: RevokeOfferSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeOfferSponsorshipOpts` (optional) (default: `...`) — Options object
    - `seller`: The account ID which created the offer.
    - `offerId`: The offer ID.
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**Example**

```ts
const op = Operation.revokeOfferSponsorship({
  seller: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
  offerId: '1234'
});
```

**Source:** [src/base/operation.ts:465](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L465)

### `Operation.revokeSignerSponsorship`

Create a "revoke sponsorship" operation for a signer.

```ts
static revokeSignerSponsorship: (opts: RevokeSignerSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeSignerSponsorshipOpts` (optional) (default: `...`) — Options object
    - `account`: The account ID where the signer sponsorship is being removed from.
    - `signer`: The signer whose sponsorship is being removed. Exactly one of the following must be set:
      - `ed25519PublicKey`: (optional) The ed25519 public key of the signer.
      - `sha256Hash`: (optional) sha256 hash (Uint8Array or hex string).
      - `preAuthTx`: (optional) Hash (Uint8Array or hex string) of transaction.
      - `ed25519SignedPayload`: (optional) Signed payload signer (StrKey P... address).
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**Example**

```ts
const op = Operation.revokeSignerSponsorship({
  account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
  signer: {
    ed25519PublicKey: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
  }
})
```

**Source:** [src/base/operation.ts:470](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L470)

### `Operation.revokeTrustlineSponsorship`

Create a "revoke sponsorship" operation for a trustline.

```ts
static revokeTrustlineSponsorship: (opts: RevokeTrustlineSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeTrustlineSponsorshipOpts` (optional) (default: `...`) — Options object
    - `account`: The account ID which owns the trustline.
    - `asset`: The trustline asset.
    - `source`: The source account for the operation. Defaults to the transaction's source account.

**Example**

```ts
const op = Operation.revokeTrustlineSponsorship({
  account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
  asset: new StellarBase.LiquidityPoolId(
    'USDUSD',
    'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
  )
});
```

**Source:** [src/base/operation.ts:464](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L464)

### `Operation.setOptions`

Returns an XDR SetOptionsOp. A "set options" operations set or clear account flags,
set the account's inflation destination, and/or add new signers to the account.
The flags used in `opts.clearFlags` and `opts.setFlags` can be the following:
  - [`AuthRequiredFlag`](#authrequiredflag)
  - [`AuthRevocableFlag`](#authrevocableflag)
  - [`AuthImmutableFlag`](#authimmutableflag)
  - [`AuthClawbackEnabledFlag`](#authclawbackenabledflag)

It's possible to set/clear multiple flags at once using logical or.

```ts
static setOptions: <T extends SignerOpts = never>(opts: SetOptionsOpts<T>) => Operation;
```

**Parameters**

- **`opts`** — `SetOptionsOpts<T>` (required) — Options object
    - `inflationDest`: Set this account ID as the account's inflation destination.
    - `clearFlags`: Bitmap integer for which account flags to clear.
    - `setFlags`: Bitmap integer for which account flags to set.
    - `masterWeight`: The master key weight.
    - `lowThreshold`: The sum weight for the low threshold.
    - `medThreshold`: The sum weight for the medium threshold.
    - `highThreshold`: The sum weight for the high threshold.
    - `signer`: Add or remove a signer from the account. The signer is
      deleted if the weight is 0. Only one of `ed25519PublicKey`, `sha256Hash`, `preAuthTx` should be defined.
      - `ed25519PublicKey`: The ed25519 public key of the signer.
      - `sha256Hash`: sha256 hash (Uint8Array or hex string) of preimage that will unlock funds. Preimage should be used as signature of future transaction.
      - `preAuthTx`: Hash (Uint8Array or hex string) of transaction that will unlock funds.
      - `ed25519SignedPayload`: Signed payload signer (ed25519 public key + raw payload) for atomic transaction signature disclosure.
      - `weight`: The weight of the new signer (0 to delete or 1-255)
    - `homeDomain`: sets the home domain used for reverse federation lookup.
    - `source`: The source account (defaults to transaction source).

**See also**

- [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)

**Source:** [src/base/operation.ts:460](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L460)

### `Operation.setTrustLineFlags`

Creates a trustline flag configuring operation.

For the flags, set them to true to enable them and false to disable them. Any
unmodified operations will be marked `undefined` in the result.

Note that you can only **clear** the clawbackEnabled flag set; it must be set
account-wide via operations.SetOptions (setting
xdr.AccountFlags.clawbackEnabled).

```ts
static setTrustLineFlags: (opts: SetTrustLineFlagsOpts) => Operation;
```

**Parameters**

- **`opts`** — `SetTrustLineFlagsOpts` (required) — Options object
    - `trustor`: the account whose trustline this is
    - `asset`: the asset on the trustline
    - `flags`: the set of flags to modify
      - `authorized`: authorize account to perform
        transactions with its credit
      - `authorizedToMaintainLiabilities`: authorize
        account to maintain and reduce liabilities for its credit
      - `clawbackEnabled`: stop claimable balances on
        this trustline from having clawbacks enabled (this flag can only be set
        to false!)
    - `source`: The source account for the operation.
      Defaults to the transaction's source account.

**See also**

- - https://github.com/stellar/stellar-protocol/blob/master/core/cap-0035.md#set-trustline-flags-operation
 - https://developers.stellar.org/docs/start/list-of-operations/#set-options

**Source:** [src/base/operation.ts:472](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L472)

### `Operation.uploadContractWasm`

Returns an operation that uploads WASM for a contract.

```ts
static uploadContractWasm: (opts: UploadContractWasmOpts) => Operation;
```

**Parameters**

- **`opts`** — `UploadContractWasmOpts` (required) — the set of parameters
    - `wasm`: a WASM blob to upload to the ledger
    - `auth`: an optional list outlining the tree of authorizations required for the upload
    - `source`: an optional source account

**See also**

- https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions#function

**Source:** [src/base/operation.ts:484](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L484)

### `Operation.fromXdrObject(operation)`

Deconstructs the raw XDR operation object into the structured object that
was used to create the operation (i.e. the `opts` parameter to most ops).

```ts
static fromXdrObject<T extends OperationRecord = OperationRecord>(operation: Operation): T;
```

**Parameters**

- **`operation`** — `Operation` (required) — An XDR Operation.

**Source:** [src/base/operation.ts:147](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L147)

## ScInt

Provides an easier way to manipulate large numbers for Stellar operations.

You can instantiate this "**s**mart **c**ontract integer" value either from
bigints, strings, or numbers (whole numbers, or this will throw).

If you need to create a native BigInt from a list of integer "parts" (for
example, you have a series of encoded 32-bit integers that represent a larger
value), you can use the lower level abstraction [`XdrLargeInt`](#xdrlargeint). For
example, you could do `new XdrLargeInt('u128', bytes...).toBigInt()`.

```ts
class ScInt extends XdrLargeInt {
  constructor(value: string | number | bigint, opts?: { type?: ScIntType; [key: string]: unknown });
  static getType(scvType: string): ScIntType | undefined;
  static isType(type: string): type is ScIntType;
  readonly type: ScIntType;
  readonly value: bigint;
  toBigInt(): bigint;
  toDuration(): ScVal;
  toI128(): ScVal;
  toI256(): ScVal;
  toI64(): ScVal;
  toJson(): { type: string; value: string };
  toJSON(): { type: string; value: string };
  toNumber(): number;
  toScVal(): ScVal;
  toString(): string;
  toTimepoint(): ScVal;
  toU128(): ScVal;
  toU256(): ScVal;
  toU64(): ScVal;
  valueOf(): bigint;
}
```

**Example**

```ts
import { xdr, ScInt, scValToBigInt } from "@stellar/stellar-sdk";

// You have an ScVal from a contract and want to parse it into JS native.
const value = xdr.ScVal.fromXdr(someXdr, "base64");
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

**Source:** [src/base/numbers/sc_int.ts:63](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/sc_int.ts#L63)

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

**Source:** [src/base/numbers/sc_int.ts:76](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/sc_int.ts#L76)

### `ScInt.getType(scvType)`

Convert the raw `ScValType` string (e.g. 'scvI128', generated by the XDR)
to a type description for [`XdrLargeInt`](#xdrlargeint) construction (e.g. 'i128')

```ts
static getType(scvType: string): ScIntType | undefined;
```

**Parameters**

- **`scvType`** — `string` (required) — the `xdr.ScValType` as a string

**Returns**

the corresponding [`ScIntType`](#scinttype-1) if it's an integer type, or
   `undefined` if it's not an integer type

**Source:** [src/base/numbers/xdr_large_int.ts:330](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L330)

### `ScInt.isType(type)`

Returns true if the given string is a valid XDR large integer type name.

```ts
static isType(type: string): type is ScIntType;
```

**Parameters**

- **`type`** — `string` (required)

**Source:** [src/base/numbers/xdr_large_int.ts:306](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L306)

### `scInt.type`

```ts
readonly type: ScIntType;
```

**Source:** [src/base/numbers/xdr_large_int.ts:59](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L59)

### `scInt.value`

The underlying bigint value (always exact, untruncated).

```ts
readonly value: bigint;
```

**Source:** [src/base/numbers/xdr_large_int.ts:58](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L58)

### `scInt.toBigInt()`

Converts to a native BigInt.

```ts
toBigInt(): bigint;
```

**Source:** [src/base/numbers/xdr_large_int.ts:141](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L141)

### `scInt.toDuration()`

The integer encoded with `ScValType = Duration`

```ts
toDuration(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:172](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L172)

### `scInt.toI128()`

The integer encoded with `ScValType = I128`.

```ts
toI128(): ScVal;
```

**Throws**

- a `RangeError` if the value cannot fit in 128 bits

**Source:** [src/base/numbers/xdr_large_int.ts:182](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L182)

### `scInt.toI256()`

The integer encoded with `ScValType = I256`

```ts
toI256(): ScVal;
```

**Throws**

- a `RangeError` if the value cannot fit in a signed 256-bit integer

**Source:** [src/base/numbers/xdr_large_int.ts:217](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L217)

### `scInt.toI64()`

The integer encoded with `ScValType = I64`.

```ts
toI64(): ScVal;
```

**Throws**

- a `RangeError` if the value cannot fit in 64 bits

**Source:** [src/base/numbers/xdr_large_int.ts:150](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L150)

### `scInt.toJson()`

Returns a JSON-friendly representation with `value` and `type` fields.

```ts
toJson(): { type: string; value: string };
```

**Source:** [src/base/numbers/xdr_large_int.ts:284](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L284)

### `scInt.toJSON()`

JavaScript-standard `JSON.stringify` hook. Without it, stringify would
enumerate the bigint `value` field and throw a TypeError.

```ts
toJSON(): { type: string; value: string };
```

**Source:** [src/base/numbers/xdr_large_int.ts:295](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L295)

### `scInt.toNumber()`

Converts to a native JS number.

```ts
toNumber(): number;
```

**Throws**

- a `RangeError` if the value can't fit into a Number

**Source:** [src/base/numbers/xdr_large_int.ts:129](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L129)

### `scInt.toScVal()`

The smallest interpretation of the stored value

```ts
toScVal(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:250](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L250)

### `scInt.toString()`

Returns the string representation of this integer.

```ts
toString(): string;
```

**Source:** [src/base/numbers/xdr_large_int.ts:279](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L279)

### `scInt.toTimepoint()`

The integer encoded with `ScValType = Timepoint`

```ts
toTimepoint(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:166](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L166)

### `scInt.toU128()`

The integer encoded with `ScValType = U128`.

```ts
toU128(): ScVal;
```

**Throws**

- a `RangeError` if the value cannot fit in 128 bits

**Source:** [src/base/numbers/xdr_large_int.ts:201](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L201)

### `scInt.toU256()`

The integer encoded with `ScValType = U256`

Note: No size check needed - U256 is the largest unsigned type.

```ts
toU256(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:237](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L237)

### `scInt.toU64()`

The integer encoded with `ScValType = U64`

```ts
toU64(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:160](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L160)

### `scInt.valueOf()`

Returns the primitive value of this integer.

```ts
valueOf(): bigint;
```

**Source:** [src/base/numbers/xdr_large_int.ts:274](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L274)

## TimeoutInfinite

```ts
const TimeoutInfinite: 0
```

**See also**

- - [`TransactionBuilder#setTimeout`](#transactionbuildersettimeouttimeoutseconds)
 - [Timeout](https://developers.stellar.org/api/resources/transactions/post/)

**Source:** [src/base/transaction_builder.ts:76](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L76)

## Transaction

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
  hash(): Uint8Array;
  sign(...keypairs: Keypair[]): void;
  signatureBase(): Uint8Array;
  signHashX(preimage: string | Uint8Array<ArrayBufferLike>): void;
  toEnvelope(): TransactionEnvelope;
  toXdr(): string;
}
```

**Source:** [src/base/transaction.ts:47](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L47)

### `new Transaction(envelope, networkPassphrase)`

```ts
constructor(envelope: string | TransactionEnvelope, networkPassphrase: string);
```

**Parameters**

- **`envelope`** — `string | TransactionEnvelope` (required) — transaction envelope object or base64 encoded string
- **`networkPassphrase`** — `string` (required) — passphrase of the target stellar network
      (e.g. "Public Global Stellar Network ; September 2015")

**Source:** [src/base/transaction.ts:67](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L67)

### `transaction.extraSigners`

Array of extra signers as XDR objects; use [`SignerKey.encodeSignerKey`](/reference/core-keys/#signerkeyencodesignerkeysignerkey)
to convert to StrKey strings.

```ts
extraSigners: SignerKey[] | undefined;
```

**Source:** [src/base/transaction.ts:223](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L223)

### `transaction.fee`

The total fee for this transaction, in stroops.

```ts
fee: string;
```

**Source:** [src/base/transaction_base.ts:87](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L87)

### `transaction.ledgerBounds`

The ledger bounds for this transaction, with `minLedger` (uint32) and
`maxLedger` (uint32, or 0 for no upper bound).

```ts
ledgerBounds: { maxLedger: number; minLedger: number } | undefined;
```

**Source:** [src/base/transaction.ts:188](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L188)

### `transaction.memo`

The memo attached to this transaction.

```ts
memo: Memo<MemoType>;
```

**Source:** [src/base/transaction.ts:255](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L255)

### `transaction.minAccountSequence`

The minimum account sequence (64-bit, as a string).

```ts
minAccountSequence: string | undefined;
```

**Source:** [src/base/transaction.ts:196](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L196)

### `transaction.minAccountSequenceAge`

The minimum account sequence age (64-bit number of seconds).

```ts
minAccountSequenceAge: bigint | undefined;
```

**Source:** [src/base/transaction.ts:204](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L204)

### `transaction.minAccountSequenceLedgerGap`

The minimum account sequence ledger gap (32-bit number of ledgers).

```ts
minAccountSequenceLedgerGap: number | undefined;
```

**Source:** [src/base/transaction.ts:212](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L212)

### `transaction.networkPassphrase`

The network passphrase for this transaction.

```ts
networkPassphrase: string;
```

**Source:** [src/base/transaction_base.ts:96](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L96)

### `transaction.operations`

The list of operations in this transaction.

```ts
operations: OperationRecord[];
```

**Source:** [src/base/transaction.ts:247](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L247)

### `transaction.sequence`

The sequence number for this transaction.

```ts
sequence: string;
```

**Source:** [src/base/transaction.ts:231](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L231)

### `transaction.signatures`

The list of signatures for this transaction.

```ts
signatures: DecoratedSignature[];
```

**Source:** [src/base/transaction_base.ts:46](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L46)

### `transaction.source`

The source account for this transaction.

```ts
source: string;
```

**Source:** [src/base/transaction.ts:239](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L239)

### `transaction.timeBounds`

The time bounds for this transaction, with `minTime` and `maxTime` as
64-bit unix timestamps (strings).

```ts
timeBounds: { maxTime: string; minTime: string } | undefined;
```

**Source:** [src/base/transaction.ts:177](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L177)

### `transaction.tx`

The underlying XDR transaction object.

Returns a defensive copy so that external mutations cannot alter the
transaction that will be signed or serialized.

```ts
tx: TTx;
```

**Throws**

- if the internal transaction is not a recognized XDR type

**Source:** [src/base/transaction_base.ts:62](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L62)

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

**Source:** [src/base/transaction_base.ts:207](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L207)

### `transaction.addSignature(publicKey, signature)`

Add a signature to the transaction. Useful when a party wants to pre-sign
a transaction but doesn't want to give access to their secret keys.
This will also verify whether the signature is valid.

Here's how you would use this feature to solicit multiple signatures.
- Use `TransactionBuilder` to build a new transaction.
- Make sure to set a long enough timeout on that transaction to give your
signers enough time to sign!
- Once you build the transaction, use `transaction.toXdr()` to get the
base64-encoded XDR string.
- _Warning!_ Once you've built this transaction, don't submit any other
transactions onto your account! Doing so will invalidate this pre-compiled
transaction!
- Send this XDR string to your other parties. They can use the instructions
for [`getKeypairSignature`](#transactiongetkeypairsignaturekeypair) to sign the transaction.
- They should send you back their `publicKey` and the `signature` string
from [`getKeypairSignature`](#transactiongetkeypairsignaturekeypair), both of which you pass to
this function.

```ts
addSignature(publicKey: string = "", signature: string = ""): void;
```

**Parameters**

- **`publicKey`** — `string` (optional) (default: `""`) — the public key of the signer
- **`signature`** — `string` (optional) (default: `""`) — the base64 value of the signature XDR

**Source:** [src/base/transaction_base.ts:167](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L167)

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

**Source:** [src/base/transaction.ts:345](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L345)

### `transaction.getKeypairSignature(keypair)`

Signs a transaction with the given [`Keypair`](/reference/core-keys/#keypair). Useful if someone sends
you a transaction XDR for you to sign and return (see
[`addSignature`](#transactionaddsignaturepublickey-signature) for more information).

When you get a transaction XDR to sign....
- Instantiate a `Transaction` object with the XDR
- Use [`Keypair`](/reference/core-keys/#keypair) to generate a keypair object for your Stellar seed.
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

**Source:** [src/base/transaction_base.ts:140](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L140)

### `transaction.hash()`

Returns a hash for this transaction, suitable for signing.

```ts
hash(): Uint8Array;
```

**Source:** [src/base/transaction_base.ts:233](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L233)

### `transaction.sign(keypairs)`

Signs the transaction with the given [`Keypair`](/reference/core-keys/#keypair).

```ts
sign(...keypairs: Keypair[]): void;
```

**Parameters**

- **`...keypairs`** — `Keypair[]` (required) — Keypairs of signers

**Source:** [src/base/transaction_base.ts:108](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L108)

### `transaction.signatureBase()`

Returns the "signature base" of this transaction, which is the value
that, when hashed, should be signed to create a signature that
validators on the Stellar Network will accept.

It is composed of a 4 prefix bytes followed by the xdr-encoded form
of this transaction.

```ts
signatureBase(): Uint8Array;
```

**Source:** [src/base/transaction.ts:270](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L270)

### `transaction.signHashX(preimage)`

Add `hashX` signer preimage as signature.

```ts
signHashX(preimage: string | Uint8Array<ArrayBufferLike>): void;
```

**Parameters**

- **`preimage`** — `string | Uint8Array<ArrayBufferLike>` (required) — preimage of hash used as signer

**Source:** [src/base/transaction_base.ts:215](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L215)

### `transaction.toEnvelope()`

To envelope returns a xdr.TransactionEnvelope which can be submitted to the network.

```ts
toEnvelope(): TransactionEnvelope;
```

**Source:** [src/base/transaction.ts:303](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L303)

### `transaction.toXdr()`

Returns the transaction envelope as a base64-encoded XDR string.

```ts
toXdr(): string;
```

**Source:** [src/base/transaction_base.ts:250](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L250)

## TransactionBuilder

<p>Transaction builder helps constructs a new [`Transaction`](#transaction) using the
given [`Account`](#account) as the transaction's "source account". The transaction
will use the current sequence number of the given account as its sequence
number and increment the given account's sequence number by one. The given
source account must include a private key for signing the transaction or an
error will be thrown.</p>

<p>Operations can be added to the transaction via their corresponding builder
methods, and each returns the TransactionBuilder object so they can be
chained together. After adding the desired operations, call the `build()`
method on the `TransactionBuilder` to return a fully constructed
[`Transaction`](#transaction) that can be signed. The returned transaction will contain the
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

<p>The following code example creates a new transaction with [`Operation.createAccount`](#operationcreateaccount) and [`Operation.payment`](#operationpayment) operations. The
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
  constructor(sourceAccount: TransactionSource, opts: TransactionBuilderOptions = ...);
  static buildFeeBumpTransaction(feeSource: string | Keypair, baseFee: string, innerTx: Transaction, networkPassphrase: string): FeeBumpTransaction;
  static cloneFrom(tx: Transaction, opts: Partial<TransactionBuilderOptions> = {}): TransactionBuilder;
  static fromXdr(envelope: string | TransactionEnvelope, networkPassphrase: string): Transaction | FeeBumpTransaction;
  baseFee: string;
  extraSigners: string[] | null;
  ledgerbounds: { maxLedger?: number; minLedger?: number } | null;
  memo: Memo;
  minAccountSequence: string | null;
  minAccountSequenceAge: bigint | null;
  minAccountSequenceLedgerGap: number | null;
  networkPassphrase: string | null;
  operations: Operation[];
  sorobanData: SorobanTransactionData | null;
  source: TransactionSource;
  timebounds: { maxTime?: string | number | Date; minTime?: string | number | Date } | null;
  addMemo(memo: Memo): TransactionBuilder;
  addOperation(operation: Operation): TransactionBuilder;
  addOperationAt(operation: Operation, index: number): TransactionBuilder;
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

**Source:** [src/base/transaction_builder.ts:184](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L184)

### `new TransactionBuilder(sourceAccount, opts)`

```ts
constructor(sourceAccount: TransactionSource, opts: TransactionBuilderOptions = ...);
```

**Parameters**

- **`sourceAccount`** — `TransactionSource` (required) — source account for this transaction
- **`opts`** — `TransactionBuilderOptions` (optional) (default: `...`) — options object (see `TransactionBuilderOptions`)

**Source:** [src/base/transaction_builder.ts:205](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L205)

### `TransactionBuilder.buildFeeBumpTransaction(feeSource, baseFee, innerTx, networkPassphrase)`

Builds a [`FeeBumpTransaction`](#feebumptransaction), enabling you to resubmit an existing
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
- **`innerTx`** — `Transaction` (required) — [`Transaction`](#transaction) to be bumped by
      the fee bump transaction
- **`networkPassphrase`** — `string` (required) — passphrase of the target
      Stellar network (e.g. "Public Global Stellar Network ; September 2015",
      see [`Networks`](#networks))

**See also**

- https://developers.stellar.org/docs/glossary/fee-bumps/#replace-by-fee

**Source:** [src/base/transaction_builder.ts:1146](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L1146)

### `TransactionBuilder.cloneFrom(tx, opts)`

Creates a builder instance using an existing [`Transaction`](#transaction) as a
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
     `{fee: '1000'}` will override the existing base fee derived from `tx` (see
     the [`TransactionBuilder`](#transactionbuilder) constructor for detailed options)

**Source:** [src/base/transaction_builder.ts:313](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L313)

### `TransactionBuilder.fromXdr(envelope, networkPassphrase)`

Build a [`Transaction`](#transaction) or [`FeeBumpTransaction`](#feebumptransaction) from an
xdr.TransactionEnvelope.

```ts
static fromXdr(envelope: string | TransactionEnvelope, networkPassphrase: string): Transaction | FeeBumpTransaction;
```

**Parameters**

- **`envelope`** — `string | TransactionEnvelope` (required) — The transaction envelope
      object or base64 encoded string.
- **`networkPassphrase`** — `string` (required) — The network passphrase of the target
      Stellar network (e.g. "Public Global Stellar Network ; September
      2015"), see [`Networks`](#networks).

**Source:** [src/base/transaction_builder.ts:1259](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L1259)

### `transactionBuilder.baseFee`

```ts
baseFee: string;
```

**Source:** [src/base/transaction_builder.ts:187](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L187)

### `transactionBuilder.extraSigners`

```ts
extraSigners: string[] | null;
```

**Source:** [src/base/transaction_builder.ts:196](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L196)

### `transactionBuilder.ledgerbounds`

```ts
ledgerbounds: { maxLedger?: number; minLedger?: number } | null;
```

**Source:** [src/base/transaction_builder.ts:192](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L192)

### `transactionBuilder.memo`

```ts
memo: Memo;
```

**Source:** [src/base/transaction_builder.ts:197](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L197)

### `transactionBuilder.minAccountSequence`

```ts
minAccountSequence: string | null;
```

**Source:** [src/base/transaction_builder.ts:193](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L193)

### `transactionBuilder.minAccountSequenceAge`

```ts
minAccountSequenceAge: bigint | null;
```

**Source:** [src/base/transaction_builder.ts:194](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L194)

### `transactionBuilder.minAccountSequenceLedgerGap`

```ts
minAccountSequenceLedgerGap: number | null;
```

**Source:** [src/base/transaction_builder.ts:195](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L195)

### `transactionBuilder.networkPassphrase`

```ts
networkPassphrase: string | null;
```

**Source:** [src/base/transaction_builder.ts:198](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L198)

### `transactionBuilder.operations`

```ts
operations: Operation[];
```

**Source:** [src/base/transaction_builder.ts:186](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L186)

### `transactionBuilder.sorobanData`

```ts
sorobanData: SorobanTransactionData | null;
```

**Source:** [src/base/transaction_builder.ts:199](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L199)

### `transactionBuilder.source`

```ts
source: TransactionSource;
```

**Source:** [src/base/transaction_builder.ts:185](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L185)

### `transactionBuilder.timebounds`

```ts
timebounds: { maxTime?: string | number | Date; minTime?: string | number | Date } | null;
```

**Source:** [src/base/transaction_builder.ts:188](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L188)

### `transactionBuilder.addMemo(memo)`

Adds a memo to the transaction.

```ts
addMemo(memo: Memo): TransactionBuilder;
```

**Parameters**

- **`memo`** — `Memo` (required) — [`Memo`](#memo) object

**Source:** [src/base/transaction_builder.ts:445](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L445)

### `transactionBuilder.addOperation(operation)`

Adds an operation to the transaction.

```ts
addOperation(operation: Operation): TransactionBuilder;
```

**Parameters**

- **`operation`** — `Operation` (required) — The xdr operation object, use `Operation` static methods.

**Source:** [src/base/transaction_builder.ts:407](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L407)

### `transactionBuilder.addOperationAt(operation, index)`

Adds an operation to the transaction at a specific index.

```ts
addOperationAt(operation: Operation, index: number): TransactionBuilder;
```

**Parameters**

- **`operation`** — `Operation` (required) — The xdr operation object to add, use [`Operation`](#operation) static methods.
- **`index`** — `number` (required) — The index at which to insert the operation.

**Source:** [src/base/transaction_builder.ts:418](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L418)

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

**Source:** [src/base/transaction_builder.ts:754](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L754)

### `transactionBuilder.build()`

Builds the transaction and increments the source account's sequence
number by 1.

```ts
build(): Transaction;
```

**Source:** [src/base/transaction_builder.ts:974](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L974)

### `transactionBuilder.clearOperationAt(index)`

Removes the operation at the specified index from the transaction.

```ts
clearOperationAt(index: number): TransactionBuilder;
```

**Parameters**

- **`index`** — `number` (required) — The index of the operation to remove.

**Source:** [src/base/transaction_builder.ts:436](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L436)

### `transactionBuilder.clearOperations()`

Removes the operations from the builder (useful when cloning).

```ts
clearOperations(): TransactionBuilder;
```

**Source:** [src/base/transaction_builder.ts:426](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L426)

### `transactionBuilder.hasV2Preconditions()`

Checks whether any v2 preconditions have been set on this builder.

```ts
hasV2Preconditions(): boolean;
```

**Source:** [src/base/transaction_builder.ts:1113](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L1113)

### `transactionBuilder.setExtraSigners(extraSigners)`

For the transaction to be valid, there must be a signature corresponding to
every Signer in this array, even if the signature is not otherwise required
by the sourceAccount or operations. Internally this will set the
`extraSigners` precondition.

```ts
setExtraSigners(extraSigners: string[]): TransactionBuilder;
```

**Parameters**

- **`extraSigners`** — `string[]` (required) — required extra signers (as [`StrKey`](/reference/core-keys/#strkey)s)

**Source:** [src/base/transaction_builder.ts:689](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L689)

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

**Source:** [src/base/transaction_builder.ts:575](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L575)

### `transactionBuilder.setMinAccountSequence(minAccountSequence)`

If you want to prepare a transaction which will be valid only while the
account sequence number is

```
minAccountSequence <= sourceAccountSequence < tx.seqNum
```

Note that after execution the account's sequence number is always raised to
`tx.seqNum`. Internally this will set the `minAccountSequence`
precondition.

```ts
setMinAccountSequence(minAccountSequence: string): TransactionBuilder;
```

**Parameters**

- **`minAccountSequence`** — `string` (required) — The minimum source account sequence
      number this transaction is valid for. If the value is `0` (the
      default), the transaction is valid when
      `sourceAccount's sequence number == tx.seqNum - 1`.

**Source:** [src/base/transaction_builder.ts:614](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L614)

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

**Source:** [src/base/transaction_builder.ts:636](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L636)

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

**Source:** [src/base/transaction_builder.ts:665](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L665)

### `transactionBuilder.setNetworkPassphrase(networkPassphrase)`

Set network passphrase for the Transaction that will be built.

```ts
setNetworkPassphrase(networkPassphrase: string): TransactionBuilder;
```

**Parameters**

- **`networkPassphrase`** — `string` (required) — passphrase of the target Stellar
      network (e.g. "Public Global Stellar Network ; September 2015").

**Source:** [src/base/transaction_builder.ts:715](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L715)

### `transactionBuilder.setSorobanData(sorobanData)`

Sets the transaction's internal Soroban transaction data (resources,
footprint, etc.).

For non-contract(non-Soroban) transactions, this setting has no effect. In
the case of Soroban transactions, this is either an instance of
`xdr.SorobanTransactionData` or a base64-encoded string of said
structure. This is usually obtained from the simulation response based on a
transaction with a Soroban operation (e.g.
[`Operation.invokeHostFunction`](#operationinvokehostfunction), providing necessary resource
and storage footprint estimations for contract invocation.

```ts
setSorobanData(sorobanData: string | SorobanTransactionData): TransactionBuilder;
```

**Parameters**

- **`sorobanData`** — `string | SorobanTransactionData` (required) — the `xdr.SorobanTransactionData` as a raw xdr
     object or a base64 string to be decoded

**See also**

- [`SorobanDataBuilder`](/reference/core-soroban-primitives/#sorobandatabuilder)

**Source:** [src/base/transaction_builder.ts:737](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L737)

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

**Source:** [src/base/transaction_builder.ts:526](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L526)

### `transactionBuilder.setTimeout(timeoutSeconds)`

Sets a timeout precondition on the transaction.

 Because of the distributed nature of the Stellar network it is possible
 that the status of your transaction will be determined after a long time
 if the network is highly congested. If you want to be sure to receive the
 status of the transaction within a given period you should set the
 `xdr.TimeBounds` with `maxTime` on the transaction (this is what `setTimeout`
 does internally; if there's `minTime` set but no `maxTime` it will be
 added).

 A call to `TransactionBuilder.setTimeout` is **required** if Transaction
 does not have `max_time` set. If you don't want to set timeout, use
 [`TimeoutInfinite`](#timeoutinfinite). In general you should set
 [`TimeoutInfinite`](#timeoutinfinite) only in smart contracts.

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
      Can't be negative. If the value is [`TimeoutInfinite`](#timeoutinfinite), the
      transaction is good indefinitely.

**See also**

- - [`TimeoutInfinite`](#timeoutinfinite)
 - https://developers.stellar.org/docs/tutorials/handling-errors/

**Source:** [src/base/transaction_builder.ts:479](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L479)

## XdrLargeInt

A wrapper class to represent large XDR-encodable integers.

This operates at a lower level than [`ScInt`](#scint) by forcing you to specify
the type / width / size in bits of the integer you're targeting, regardless
of the input value(s) you provide.

```ts
class XdrLargeInt {
  constructor(type: ScIntType, values: XdrLargeIntValues);
  static getType(scvType: string): ScIntType | undefined;
  static isType(type: string): type is ScIntType;
  readonly type: ScIntType;
  readonly value: bigint;
  toBigInt(): bigint;
  toDuration(): ScVal;
  toI128(): ScVal;
  toI256(): ScVal;
  toI64(): ScVal;
  toJson(): { type: string; value: string };
  toJSON(): { type: string; value: string };
  toNumber(): number;
  toScVal(): ScVal;
  toString(): string;
  toTimepoint(): ScVal;
  toU128(): ScVal;
  toU256(): ScVal;
  toU64(): ScVal;
  valueOf(): bigint;
}
```

**Source:** [src/base/numbers/xdr_large_int.ts:56](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L56)

### `new XdrLargeInt(type, values)`

```ts
constructor(type: ScIntType, values: XdrLargeIntValues);
```

**Parameters**

- **`type`** — `ScIntType` (required) — specifies a data type to use to represent the integer, one
     of: 'i64', 'u64', 'i128', 'u128', 'i256', 'u256', 'timepoint', and 'duration'
     (see [`XdrLargeInt.isType`](#xdrlargeintistypetype))
- **`values`** — `XdrLargeIntValues` (required) — a single integer-like value, or a list of slices in
     **little-endian** order (parts[0] is the least-significant slice),
     matching the legacy `LargeInt` contract — e.g.
     `new XdrLargeInt("i128", [parts.lo, parts.hi])`. Slice width is
     `SIZE[type] / values.length`; each slice must fit its width or a
     `RangeError` is thrown.

**Source:** [src/base/numbers/xdr_large_int.ts:72](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L72)

### `XdrLargeInt.getType(scvType)`

Convert the raw `ScValType` string (e.g. 'scvI128', generated by the XDR)
to a type description for [`XdrLargeInt`](#xdrlargeint) construction (e.g. 'i128')

```ts
static getType(scvType: string): ScIntType | undefined;
```

**Parameters**

- **`scvType`** — `string` (required) — the `xdr.ScValType` as a string

**Returns**

the corresponding [`ScIntType`](#scinttype-1) if it's an integer type, or
   `undefined` if it's not an integer type

**Source:** [src/base/numbers/xdr_large_int.ts:330](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L330)

### `XdrLargeInt.isType(type)`

Returns true if the given string is a valid XDR large integer type name.

```ts
static isType(type: string): type is ScIntType;
```

**Parameters**

- **`type`** — `string` (required)

**Source:** [src/base/numbers/xdr_large_int.ts:306](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L306)

### `xdrLargeInt.type`

```ts
readonly type: ScIntType;
```

**Source:** [src/base/numbers/xdr_large_int.ts:59](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L59)

### `xdrLargeInt.value`

The underlying bigint value (always exact, untruncated).

```ts
readonly value: bigint;
```

**Source:** [src/base/numbers/xdr_large_int.ts:58](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L58)

### `xdrLargeInt.toBigInt()`

Converts to a native BigInt.

```ts
toBigInt(): bigint;
```

**Source:** [src/base/numbers/xdr_large_int.ts:141](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L141)

### `xdrLargeInt.toDuration()`

The integer encoded with `ScValType = Duration`

```ts
toDuration(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:172](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L172)

### `xdrLargeInt.toI128()`

The integer encoded with `ScValType = I128`.

```ts
toI128(): ScVal;
```

**Throws**

- a `RangeError` if the value cannot fit in 128 bits

**Source:** [src/base/numbers/xdr_large_int.ts:182](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L182)

### `xdrLargeInt.toI256()`

The integer encoded with `ScValType = I256`

```ts
toI256(): ScVal;
```

**Throws**

- a `RangeError` if the value cannot fit in a signed 256-bit integer

**Source:** [src/base/numbers/xdr_large_int.ts:217](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L217)

### `xdrLargeInt.toI64()`

The integer encoded with `ScValType = I64`.

```ts
toI64(): ScVal;
```

**Throws**

- a `RangeError` if the value cannot fit in 64 bits

**Source:** [src/base/numbers/xdr_large_int.ts:150](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L150)

### `xdrLargeInt.toJson()`

Returns a JSON-friendly representation with `value` and `type` fields.

```ts
toJson(): { type: string; value: string };
```

**Source:** [src/base/numbers/xdr_large_int.ts:284](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L284)

### `xdrLargeInt.toJSON()`

JavaScript-standard `JSON.stringify` hook. Without it, stringify would
enumerate the bigint `value` field and throw a TypeError.

```ts
toJSON(): { type: string; value: string };
```

**Source:** [src/base/numbers/xdr_large_int.ts:295](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L295)

### `xdrLargeInt.toNumber()`

Converts to a native JS number.

```ts
toNumber(): number;
```

**Throws**

- a `RangeError` if the value can't fit into a Number

**Source:** [src/base/numbers/xdr_large_int.ts:129](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L129)

### `xdrLargeInt.toScVal()`

The smallest interpretation of the stored value

```ts
toScVal(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:250](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L250)

### `xdrLargeInt.toString()`

Returns the string representation of this integer.

```ts
toString(): string;
```

**Source:** [src/base/numbers/xdr_large_int.ts:279](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L279)

### `xdrLargeInt.toTimepoint()`

The integer encoded with `ScValType = Timepoint`

```ts
toTimepoint(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:166](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L166)

### `xdrLargeInt.toU128()`

The integer encoded with `ScValType = U128`.

```ts
toU128(): ScVal;
```

**Throws**

- a `RangeError` if the value cannot fit in 128 bits

**Source:** [src/base/numbers/xdr_large_int.ts:201](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L201)

### `xdrLargeInt.toU256()`

The integer encoded with `ScValType = U256`

Note: No size check needed - U256 is the largest unsigned type.

```ts
toU256(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:237](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L237)

### `xdrLargeInt.toU64()`

The integer encoded with `ScValType = U64`

```ts
toU64(): ScVal;
```

**Source:** [src/base/numbers/xdr_large_int.ts:160](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L160)

### `xdrLargeInt.valueOf()`

Returns the primitive value of this integer.

```ts
valueOf(): bigint;
```

**Source:** [src/base/numbers/xdr_large_int.ts:274](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L274)

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

**Source:** [src/base/util/decode_encode_muxed_account.ts:14](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/util/decode_encode_muxed_account.ts#L14)

## encodeMuxedAccount

Transform a Stellar address (G...) and an ID into its XDR representation.

```ts
encodeMuxedAccount(address: string, id: string): MuxedAccount
```

**Parameters**

- **`address`** — `string` (required) — a Stellar G... address
- **`id`** — `string` (required) — a Uint64 ID represented as a string

**Source:** [src/base/util/decode_encode_muxed_account.ts:48](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/util/decode_encode_muxed_account.ts#L48)

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

**Source:** [src/base/util/decode_encode_muxed_account.ts:32](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/util/decode_encode_muxed_account.ts#L32)

## extractBaseAddress

Extracts the underlying base (G...) address from an M-address.

```ts
extractBaseAddress(address: string): string
```

**Parameters**

- **`address`** — `string` (required) — an account address (either M... or G...)

**Source:** [src/base/util/decode_encode_muxed_account.ts:67](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/util/decode_encode_muxed_account.ts#L67)

## scValToBigInt

Transforms an opaque `xdr.ScVal` into a native bigint, if possible.

If you then want to use this in the abstractions provided by this module,
you can pass it to the constructor of [`XdrLargeInt`](#xdrlargeint).

```ts
scValToBigInt(scv: ScVal): bigint
```

**Parameters**

- **`scv`** — `ScVal` (required) — the XDR smart contract value to convert

**Throws**

- a `TypeError` if the `scv` input value doesn't represent an integer

**Example**

```ts
let scv = contract.call("add", x, y); // assume it returns an xdr.ScVal
let bigi = scValToBigInt(scv);

new ScInt(bigi);               // if you don't care about types, and
new XdrLargeInt('i128', bigi); // if you do
```

**Source:** [src/base/numbers/index.ts:30](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/index.ts#L30)

## Types

### AuthFlag

```ts
type AuthFlag = { readonly clawbackEnabled: 8; readonly immutable: 4; readonly required: 1; readonly revocable: 2 }
```

**Source:** [src/base/operations/types.ts:445](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L445)

### AuthFlag

```ts
type AuthFlag = typeof AuthFlag[keyof typeof AuthFlag]
```

**Source:** [src/base/operations/types.ts:445](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L445)

### AuthFlag.clawbackEnabled

```ts
type clawbackEnabled = 8
```

**Source:** [src/base/operations/types.ts:458](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L458)

### AuthFlag.immutable

```ts
type immutable = 4
```

**Source:** [src/base/operations/types.ts:457](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L457)

### AuthFlag.required

```ts
type required = 1
```

**Source:** [src/base/operations/types.ts:455](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L455)

### AuthFlag.revocable

```ts
type revocable = 2
```

**Source:** [src/base/operations/types.ts:456](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L456)

### MemoType

```ts
type MemoType = MemoTypeHash | MemoTypeID | MemoTypeNone | MemoTypeReturn | MemoTypeText
```

**Source:** [src/base/memo.ts:33](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L33)

### MemoType.Hash

```ts
type Hash = MemoTypeHash
```

**Source:** [src/base/memo.ts:37](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L37)

### MemoType.ID

```ts
type ID = MemoTypeID
```

**Source:** [src/base/memo.ts:35](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L35)

### MemoType.None

```ts
type None = MemoTypeNone
```

**Source:** [src/base/memo.ts:34](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L34)

### MemoType.Return

```ts
type Return = MemoTypeReturn
```

**Source:** [src/base/memo.ts:38](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L38)

### MemoType.Text

```ts
type Text = MemoTypeText
```

**Source:** [src/base/memo.ts:36](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L36)

### MemoTypeHash

```ts
type MemoTypeHash = typeof MemoHash
```

**Source:** [src/base/memo.ts:30](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L30)

### MemoTypeID

```ts
type MemoTypeID = typeof MemoID
```

**Source:** [src/base/memo.ts:28](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L28)

### MemoTypeNone

```ts
type MemoTypeNone = typeof MemoNone
```

**Source:** [src/base/memo.ts:27](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L27)

### MemoTypeReturn

```ts
type MemoTypeReturn = typeof MemoReturn
```

**Source:** [src/base/memo.ts:31](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L31)

### MemoTypeText

```ts
type MemoTypeText = typeof MemoText
```

**Source:** [src/base/memo.ts:29](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L29)

### MemoValue

```ts
type MemoValue = string | null | Uint8Array
```

**Source:** [src/base/memo.ts:43](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L43)

### Networks

Contains passphrases for common networks:
* `Networks.PUBLIC`: `Public Global Stellar Network ; September 2015`
* `Networks.TESTNET`: `Test SDF Network ; September 2015`
* `Networks.FUTURENET`: `Test SDF Future Network ; October 2022`
* `Networks.SANDBOX`: `Local Sandbox Stellar Network ; September 2022`
* `Networks.STANDALONE`: `Standalone Network ; February 2017`

```ts
enum Networks
```

**Source:** [src/base/network.ts:9](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/network.ts#L9)

### Operation.AccountMerge

```ts
type AccountMerge = AccountMergeResult
```

**Source:** [src/base/operation.ts:615](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L615)

### Operation.AllowTrust

```ts
type AllowTrust = AllowTrustResult
```

**Source:** [src/base/operation.ts:614](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L614)

### Operation.BaseOperation

```ts
type BaseOperation<T extends _OperationType = _OperationType> = _BaseOperation<T>
```

**Source:** [src/base/operation.ts:603](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L603)

### Operation.BeginSponsoringFutureReserves

```ts
type BeginSponsoringFutureReserves = BeginSponsoringFutureReservesResult
```

**Source:** [src/base/operation.ts:621](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L621)

### Operation.BumpSequence

```ts
type BumpSequence = BumpSequenceResult
```

**Source:** [src/base/operation.ts:618](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L618)

### Operation.ChangeTrust

```ts
type ChangeTrust = ChangeTrustResult
```

**Source:** [src/base/operation.ts:613](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L613)

### Operation.ClaimClaimableBalance

```ts
type ClaimClaimableBalance = ClaimClaimableBalanceResult
```

**Source:** [src/base/operation.ts:620](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L620)

### Operation.Clawback

```ts
type Clawback = ClawbackResult
```

**Source:** [src/base/operation.ts:633](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L633)

### Operation.ClawbackClaimableBalance

```ts
type ClawbackClaimableBalance = ClawbackClaimableBalanceResult
```

**Source:** [src/base/operation.ts:634](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L634)

### Operation.CreateAccount

```ts
type CreateAccount = CreateAccountResult
```

**Source:** [src/base/operation.ts:605](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L605)

### Operation.CreateClaimableBalance

```ts
type CreateClaimableBalance = CreateClaimableBalanceResult
```

**Source:** [src/base/operation.ts:619](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L619)

### Operation.CreatePassiveSellOffer

```ts
type CreatePassiveSellOffer = CreatePassiveSellOfferResult
```

**Source:** [src/base/operation.ts:609](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L609)

### Operation.EndSponsoringFutureReserves

```ts
type EndSponsoringFutureReserves = EndSponsoringFutureReservesResult
```

**Source:** [src/base/operation.ts:623](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L623)

### Operation.ExtendFootprintTTL

```ts
type ExtendFootprintTTL = ExtendFootprintTTLResult
```

**Source:** [src/base/operation.ts:639](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L639)

### Operation.Inflation

```ts
type Inflation = InflationResult
```

**Source:** [src/base/operation.ts:616](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L616)

### Operation.InvokeHostFunction

```ts
type InvokeHostFunction = InvokeHostFunctionResult
```

**Source:** [src/base/operation.ts:638](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L638)

### Operation.LiquidityPoolDeposit

```ts
type LiquidityPoolDeposit = LiquidityPoolDepositResult
```

**Source:** [src/base/operation.ts:636](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L636)

### Operation.LiquidityPoolWithdraw

```ts
type LiquidityPoolWithdraw = LiquidityPoolWithdrawResult
```

**Source:** [src/base/operation.ts:637](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L637)

### Operation.ManageBuyOffer

```ts
type ManageBuyOffer = ManageBuyOfferResult
```

**Source:** [src/base/operation.ts:611](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L611)

### Operation.ManageData

```ts
type ManageData = ManageDataResult
```

**Source:** [src/base/operation.ts:617](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L617)

### Operation.ManageSellOffer

```ts
type ManageSellOffer = ManageSellOfferResult
```

**Source:** [src/base/operation.ts:610](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L610)

### Operation.PathPaymentStrictReceive

```ts
type PathPaymentStrictReceive = PathPaymentStrictReceiveResult
```

**Source:** [src/base/operation.ts:607](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L607)

### Operation.PathPaymentStrictSend

```ts
type PathPaymentStrictSend = PathPaymentStrictSendResult
```

**Source:** [src/base/operation.ts:608](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L608)

### Operation.Payment

```ts
type Payment = PaymentResult
```

**Source:** [src/base/operation.ts:606](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L606)

### Operation.RestoreFootprint

```ts
type RestoreFootprint = RestoreFootprintResult
```

**Source:** [src/base/operation.ts:640](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L640)

### Operation.RevokeAccountSponsorship

```ts
type RevokeAccountSponsorship = RevokeAccountSponsorshipResult
```

**Source:** [src/base/operation.ts:624](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L624)

### Operation.RevokeClaimableBalanceSponsorship

```ts
type RevokeClaimableBalanceSponsorship = RevokeClaimableBalanceSponsorshipResult
```

**Source:** [src/base/operation.ts:628](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L628)

### Operation.RevokeDataSponsorship

```ts
type RevokeDataSponsorship = RevokeDataSponsorshipResult
```

**Source:** [src/base/operation.ts:627](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L627)

### Operation.RevokeLiquidityPoolSponsorship

```ts
type RevokeLiquidityPoolSponsorship = RevokeLiquidityPoolSponsorshipResult
```

**Source:** [src/base/operation.ts:630](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L630)

### Operation.RevokeOfferSponsorship

```ts
type RevokeOfferSponsorship = RevokeOfferSponsorshipResult
```

**Source:** [src/base/operation.ts:626](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L626)

### Operation.RevokeSignerSponsorship

```ts
type RevokeSignerSponsorship = RevokeSignerSponsorshipResult
```

**Source:** [src/base/operation.ts:632](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L632)

### Operation.RevokeTrustlineSponsorship

```ts
type RevokeTrustlineSponsorship = RevokeTrustlineSponsorshipResult
```

**Source:** [src/base/operation.ts:625](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L625)

### Operation.SetOptions

```ts
type SetOptions = SetOptionsResult<Signer>
```

**Source:** [src/base/operation.ts:612](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L612)

### Operation.SetTrustLineFlags

```ts
type SetTrustLineFlags = SetTrustLineFlagsResult
```

**Source:** [src/base/operation.ts:635](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L635)

### OperationOptions

```ts
type OperationOptions = AccountMergeOpts | AllowTrustOpts | BeginSponsoringFutureReservesOpts | BumpSequenceOpts | ChangeTrustOpts | ClaimClaimableBalanceOpts | ClawbackClaimableBalanceOpts | ClawbackOpts | CreateAccountOpts | CreateClaimableBalanceOpts | CreateCustomContractOpts | CreatePassiveSellOfferOpts | CreateStellarAssetContractOpts | EndSponsoringFutureReservesOpts | ExtendFootprintTtlOpts | InflationOpts | InvokeContractFunctionOpts | InvokeHostFunctionOpts | LiquidityPoolDepositOpts | LiquidityPoolWithdrawOpts | ManageBuyOfferOpts | ManageDataOpts | ManageSellOfferOpts | PathPaymentStrictReceiveOpts | PathPaymentStrictSendOpts | PaymentOpts | RestoreFootprintOpts | RevokeAccountSponsorshipOpts | RevokeClaimableBalanceSponsorshipOpts | RevokeDataSponsorshipOpts | RevokeLiquidityPoolSponsorshipOpts | RevokeOfferSponsorshipOpts | RevokeSignerSponsorshipOpts | RevokeTrustlineSponsorshipOpts | SetOptionsOpts | SetTrustLineFlagsOpts | UploadContractWasmOpts
```

**Source:** [src/base/operations/types.ts:325](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L325)

### OperationRecord

Union of all possible operation objects returned by Operation.fromXdrObject.

```ts
type OperationRecord = AccountMergeResult | AllowTrustResult | BeginSponsoringFutureReservesResult | BumpSequenceResult | ChangeTrustResult | ClaimClaimableBalanceResult | ClawbackClaimableBalanceResult | ClawbackResult | CreateAccountResult | CreateClaimableBalanceResult | CreatePassiveSellOfferResult | EndSponsoringFutureReservesResult | ExtendFootprintTTLResult | InflationResult | InvokeHostFunctionResult | LiquidityPoolDepositResult | LiquidityPoolWithdrawResult | ManageBuyOfferResult | ManageDataResult | ManageSellOfferResult | PathPaymentStrictReceiveResult | PathPaymentStrictSendResult | PaymentResult | RestoreFootprintResult | RevokeAccountSponsorshipResult | RevokeClaimableBalanceSponsorshipResult | RevokeDataSponsorshipResult | RevokeLiquidityPoolSponsorshipResult | RevokeOfferSponsorshipResult | RevokeSignerSponsorshipResult | RevokeTrustlineSponsorshipResult | SetOptionsResult<SignerOpts> | SetTrustLineFlagsResult
```

**Source:** [src/base/operations/types.ts:700](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L700)

### OperationType

```ts
type OperationType = OperationType.AccountMerge | OperationType.AllowTrust | OperationType.BeginSponsoringFutureReserves | OperationType.BumpSequence | OperationType.ChangeTrust | OperationType.ClaimClaimableBalance | OperationType.Clawback | OperationType.ClawbackClaimableBalance | OperationType.CreateAccount | OperationType.CreateClaimableBalance | OperationType.CreatePassiveSellOffer | OperationType.EndSponsoringFutureReserves | OperationType.ExtendFootprintTTL | OperationType.Inflation | OperationType.InvokeHostFunction | OperationType.LiquidityPoolDeposit | OperationType.LiquidityPoolWithdraw | OperationType.ManageBuyOffer | OperationType.ManageData | OperationType.ManageSellOffer | OperationType.PathPaymentStrictReceive | OperationType.PathPaymentStrictSend | OperationType.Payment | OperationType.RestoreFootprint | OperationType.RevokeAccountSponsorship | OperationType.RevokeClaimableBalanceSponsorship | OperationType.RevokeDataSponsorship | OperationType.RevokeLiquidityPoolSponsorship | OperationType.RevokeOfferSponsorship | OperationType.RevokeSignerSponsorship | OperationType.RevokeTrustlineSponsorship | OperationType.SetOptions | OperationType.SetTrustLineFlags
```

**Source:** [src/base/operations/types.ts:368](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L368)

### OperationType.AccountMerge

```ts
type AccountMerge = "accountMerge"
```

**Source:** [src/base/operations/types.ts:379](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L379)

### OperationType.AllowTrust

```ts
type AllowTrust = "allowTrust"
```

**Source:** [src/base/operations/types.ts:378](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L378)

### OperationType.BeginSponsoringFutureReserves

```ts
type BeginSponsoringFutureReserves = "beginSponsoringFutureReserves"
```

**Source:** [src/base/operations/types.ts:385](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L385)

### OperationType.BumpSequence

```ts
type BumpSequence = "bumpSequence"
```

**Source:** [src/base/operations/types.ts:382](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L382)

### OperationType.ChangeTrust

```ts
type ChangeTrust = "changeTrust"
```

**Source:** [src/base/operations/types.ts:377](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L377)

### OperationType.ClaimClaimableBalance

```ts
type ClaimClaimableBalance = "claimClaimableBalance"
```

**Source:** [src/base/operations/types.ts:384](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L384)

### OperationType.Clawback

```ts
type Clawback = "clawback"
```

**Source:** [src/base/operations/types.ts:397](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L397)

### OperationType.ClawbackClaimableBalance

```ts
type ClawbackClaimableBalance = "clawbackClaimableBalance"
```

**Source:** [src/base/operations/types.ts:398](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L398)

### OperationType.CreateAccount

```ts
type CreateAccount = "createAccount"
```

**Source:** [src/base/operations/types.ts:369](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L369)

### OperationType.CreateClaimableBalance

```ts
type CreateClaimableBalance = "createClaimableBalance"
```

**Source:** [src/base/operations/types.ts:383](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L383)

### OperationType.CreatePassiveSellOffer

```ts
type CreatePassiveSellOffer = "createPassiveSellOffer"
```

**Source:** [src/base/operations/types.ts:373](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L373)

### OperationType.EndSponsoringFutureReserves

```ts
type EndSponsoringFutureReserves = "endSponsoringFutureReserves"
```

**Source:** [src/base/operations/types.ts:386](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L386)

### OperationType.ExtendFootprintTTL

```ts
type ExtendFootprintTTL = "extendFootprintTtl"
```

**Source:** [src/base/operations/types.ts:403](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L403)

### OperationType.Inflation

```ts
type Inflation = "inflation"
```

**Source:** [src/base/operations/types.ts:380](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L380)

### OperationType.InvokeHostFunction

```ts
type InvokeHostFunction = "invokeHostFunction"
```

**Source:** [src/base/operations/types.ts:402](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L402)

### OperationType.LiquidityPoolDeposit

```ts
type LiquidityPoolDeposit = "liquidityPoolDeposit"
```

**Source:** [src/base/operations/types.ts:400](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L400)

### OperationType.LiquidityPoolWithdraw

```ts
type LiquidityPoolWithdraw = "liquidityPoolWithdraw"
```

**Source:** [src/base/operations/types.ts:401](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L401)

### OperationType.ManageBuyOffer

```ts
type ManageBuyOffer = "manageBuyOffer"
```

**Source:** [src/base/operations/types.ts:375](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L375)

### OperationType.ManageData

```ts
type ManageData = "manageData"
```

**Source:** [src/base/operations/types.ts:381](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L381)

### OperationType.ManageSellOffer

```ts
type ManageSellOffer = "manageSellOffer"
```

**Source:** [src/base/operations/types.ts:374](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L374)

### OperationType.PathPaymentStrictReceive

```ts
type PathPaymentStrictReceive = "pathPaymentStrictReceive"
```

**Source:** [src/base/operations/types.ts:371](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L371)

### OperationType.PathPaymentStrictSend

```ts
type PathPaymentStrictSend = "pathPaymentStrictSend"
```

**Source:** [src/base/operations/types.ts:372](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L372)

### OperationType.Payment

```ts
type Payment = "payment"
```

**Source:** [src/base/operations/types.ts:370](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L370)

### OperationType.RestoreFootprint

```ts
type RestoreFootprint = "restoreFootprint"
```

**Source:** [src/base/operations/types.ts:404](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L404)

### OperationType.RevokeAccountSponsorship

```ts
type RevokeAccountSponsorship = "revokeAccountSponsorship"
```

**Source:** [src/base/operations/types.ts:389](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L389)

### OperationType.RevokeClaimableBalanceSponsorship

```ts
type RevokeClaimableBalanceSponsorship = "revokeClaimableBalanceSponsorship"
```

**Source:** [src/base/operations/types.ts:393](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L393)

### OperationType.RevokeDataSponsorship

```ts
type RevokeDataSponsorship = "revokeDataSponsorship"
```

**Source:** [src/base/operations/types.ts:392](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L392)

### OperationType.RevokeLiquidityPoolSponsorship

```ts
type RevokeLiquidityPoolSponsorship = "revokeLiquidityPoolSponsorship"
```

**Source:** [src/base/operations/types.ts:395](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L395)

### OperationType.RevokeOfferSponsorship

```ts
type RevokeOfferSponsorship = "revokeOfferSponsorship"
```

**Source:** [src/base/operations/types.ts:391](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L391)

### OperationType.RevokeSignerSponsorship

```ts
type RevokeSignerSponsorship = "revokeSignerSponsorship"
```

**Source:** [src/base/operations/types.ts:396](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L396)

### OperationType.RevokeSponsorship

**Deprecated.** Never emitted by fromXdrObject — use the specific Revoke* types instead.

```ts
type RevokeSponsorship = "revokeSponsorship"
```

**Source:** [src/base/operations/types.ts:388](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L388)

### OperationType.RevokeTrustlineSponsorship

```ts
type RevokeTrustlineSponsorship = "revokeTrustlineSponsorship"
```

**Source:** [src/base/operations/types.ts:390](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L390)

### OperationType.SetOptions

```ts
type SetOptions = "setOptions"
```

**Source:** [src/base/operations/types.ts:376](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L376)

### OperationType.SetTrustLineFlags

```ts
type SetTrustLineFlags = "setTrustLineFlags"
```

**Source:** [src/base/operations/types.ts:399](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L399)

### ScIntType

```ts
type ScIntType = "duration" | "i64" | "i128" | "i256" | "timepoint" | "u64" | "u128" | "u256"
```

**Source:** [src/base/numbers/xdr_large_int.ts:17](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L17)

### Signer

```ts
type Signer = Signer.Ed25519PublicKey | Signer.Ed25519SignedPayload | Signer.PreAuthTx | Signer.Sha256Hash
```

**Source:** [src/base/operations/types.ts:476](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L476)

### Signer.Ed25519PublicKey

```ts
interface Ed25519PublicKey {
  ed25519PublicKey: string;
  weight?: number;
}
```

**Source:** [src/base/operations/types.ts:477](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L477)

#### `ed25519PublicKey.ed25519PublicKey`

```ts
ed25519PublicKey: string;
```

**Source:** [src/base/operations/types.ts:478](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L478)

#### `ed25519PublicKey.weight`

```ts
weight?: number;
```

**Source:** [src/base/operations/types.ts:479](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L479)

### Signer.Ed25519SignedPayload

```ts
interface Ed25519SignedPayload {
  ed25519SignedPayload: string;
  weight?: number;
}
```

**Source:** [src/base/operations/types.ts:489](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L489)

#### `ed25519SignedPayload.ed25519SignedPayload`

```ts
ed25519SignedPayload: string;
```

**Source:** [src/base/operations/types.ts:490](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L490)

#### `ed25519SignedPayload.weight`

```ts
weight?: number;
```

**Source:** [src/base/operations/types.ts:491](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L491)

### Signer.PreAuthTx

```ts
interface PreAuthTx {
  preAuthTx: Uint8Array;
  weight?: number;
}
```

**Source:** [src/base/operations/types.ts:485](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L485)

#### `preAuthTx.preAuthTx`

```ts
preAuthTx: Uint8Array;
```

**Source:** [src/base/operations/types.ts:486](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L486)

#### `preAuthTx.weight`

```ts
weight?: number;
```

**Source:** [src/base/operations/types.ts:487](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L487)

### Signer.Sha256Hash

```ts
interface Sha256Hash {
  sha256Hash: Uint8Array;
  weight?: number;
}
```

**Source:** [src/base/operations/types.ts:481](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L481)

#### `sha256Hash.sha256Hash`

```ts
sha256Hash: Uint8Array;
```

**Source:** [src/base/operations/types.ts:482](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L482)

#### `sha256Hash.weight`

```ts
weight?: number;
```

**Source:** [src/base/operations/types.ts:483](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L483)

### SorobanFees

Soroban fee parameters for resource-limited transactions.

```ts
interface SorobanFees {
  instructions: number;
  readBytes: number;
  resourceFee: bigint;
  writeBytes: number;
}
```

**Source:** [src/base/transaction_builder.ts:81](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L81)

#### `sorobanFees.instructions`

The number of instructions executed by the transaction.

```ts
instructions: number;
```

**Source:** [src/base/transaction_builder.ts:83](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L83)

#### `sorobanFees.readBytes`

The number of bytes read from the ledger by the transaction.

```ts
readBytes: number;
```

**Source:** [src/base/transaction_builder.ts:85](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L85)

#### `sorobanFees.resourceFee`

The fee to be paid for the transaction, in stroops.

```ts
resourceFee: bigint;
```

**Source:** [src/base/transaction_builder.ts:89](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L89)

#### `sorobanFees.writeBytes`

The number of bytes written to the ledger by the transaction.

```ts
writeBytes: number;
```

**Source:** [src/base/transaction_builder.ts:87](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L87)

### TransactionSource

The contract that [`TransactionBuilder`](#transactionbuilder) requires of a transaction's
source account: a way to read the account's address and sequence number, and
to advance the sequence number in place (the builder calls
[`TransactionSource.incrementSequenceNumber`](#transactionsourceincrementsequencenumber) when it builds a
transaction).

Both the concrete [`Account`](#account) and [`MuxedAccount`](#muxedaccount) classes implement
this, as does Horizon's `AccountResponse`. Implement it yourself if you manage
sequence numbers out-of-band (e.g. a server-side sequence pool) and want to
pass a custom source to [`TransactionBuilder`](#transactionbuilder).

This is intentionally a brand-free structural interface: assignability is by
shape, not by class identity, so any account-like object that honors the
contract is accepted.

```ts
interface TransactionSource {
  accountId(): string;
  incrementSequenceNumber(): void;
  sequenceNumber(): string;
}
```

**Source:** [src/base/transaction_source.ts:17](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_source.ts#L17)

#### `transactionSource.accountId()`

The source account's address — a `G…` account address or, for a muxed
source, its `M…` address.

```ts
accountId(): string;
```

**Source:** [src/base/transaction_source.ts:22](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_source.ts#L22)

#### `transactionSource.incrementSequenceNumber()`

Increments the sequence number in place by one. [`TransactionBuilder`](#transactionbuilder)
calls this when building a transaction so that the next transaction built
from the same source uses the next sequence number.

```ts
incrementSequenceNumber(): void;
```

**Source:** [src/base/transaction_source.ts:32](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_source.ts#L32)

#### `transactionSource.sequenceNumber()`

The current sequence number, as a string.

```ts
sequenceNumber(): string;
```

**Source:** [src/base/transaction_source.ts:25](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_source.ts#L25)

### TrustLineFlag

```ts
type TrustLineFlag = TrustLineFlag.authorize | TrustLineFlag.authorizeToMaintainLiabilities | TrustLineFlag.deauthorize
```

**Source:** [src/base/operations/types.ts:465](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L465)

### TrustLineFlag.authorize

```ts
type authorize = 1
```

**Source:** [src/base/operations/types.ts:467](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L467)

### TrustLineFlag.authorizeToMaintainLiabilities

```ts
type authorizeToMaintainLiabilities = 2
```

**Source:** [src/base/operations/types.ts:468](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L468)

### TrustLineFlag.deauthorize

```ts
type deauthorize = 0
```

**Source:** [src/base/operations/types.ts:466](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L466)
