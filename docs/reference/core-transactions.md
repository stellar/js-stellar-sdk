---
title: Core / Transactions
description: Build, sign, and inspect Stellar transactions with the TransactionBuilder API.
---

# Core / Transactions

## Account

Create a new Account object.

`Account` represents a single account in the Stellar network and its sequence
number. Account tracks the sequence number as it is used by `TransactionBuilder`. See
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
      provide a muxed account address, this will throw; use `MuxedAccount` instead.
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

**Source:** [src/base/transaction_builder.ts:69](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L69)

## FeeBumpTransaction

Use `TransactionBuilder.buildFeeBumpTransaction` to build a
FeeBumpTransaction object. If you have an object or base64-encoded string of
the transaction envelope XDR use `TransactionBuilder.fromXdr`.

Once a `FeeBumpTransaction` has been created, its attributes and operations
should not be changed. You should only add signatures (using `FeeBumpTransaction#sign`) before
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
  toXdr(): string;
}
```

**Source:** [src/base/fee_bump_transaction.ts:24](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L24)

### `new FeeBumpTransaction(envelope, networkPassphrase)`

```ts
constructor(envelope: string | TransactionEnvelope, networkPassphrase: string);
```

**Parameters**

- **`envelope`** — `string | TransactionEnvelope` (required) — transaction envelope object or base64 encoded string.
- **`networkPassphrase`** — `string` (required) — passphrase of the target Stellar network
      (e.g. "Public Global Stellar Network ; September 2015").

**Source:** [src/base/fee_bump_transaction.ts:33](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L33)

### `feeBumpTransaction.fee`

The total fee for this transaction, in stroops.

```ts
fee: string;
```

**Source:** [src/base/transaction_base.ts:82](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L82)

### `feeBumpTransaction.feeSource`

The account paying the fee for this transaction.

```ts
readonly feeSource: string;
```

**Source:** [src/base/fee_bump_transaction.ts:85](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L85)

### `feeBumpTransaction.innerTransaction`

The inner transaction that this fee bump wraps.

```ts
readonly innerTransaction: Transaction;
```

**Source:** [src/base/fee_bump_transaction.ts:71](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L71)

### `feeBumpTransaction.networkPassphrase`

The network passphrase for this transaction.

```ts
networkPassphrase: string;
```

**Source:** [src/base/transaction_base.ts:91](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L91)

### `feeBumpTransaction.operations`

The operations from the inner transaction.

```ts
readonly operations: OperationRecord[];
```

**Source:** [src/base/fee_bump_transaction.ts:78](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L78)

### `feeBumpTransaction.signatures`

The list of signatures for this transaction.

```ts
signatures: DecoratedSignature[];
```

**Source:** [src/base/transaction_base.ts:41](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L41)

### `feeBumpTransaction.tx`

The underlying XDR transaction object.

Returns a defensive copy so that external mutations cannot alter the
transaction that will be signed or serialized.

```ts
tx: TTx;
```

**Throws**

- if the internal transaction is not a recognized XDR type

**Source:** [src/base/transaction_base.ts:57](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L57)

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

**Source:** [src/base/transaction_base.ts:202](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L202)

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
for `getKeypairSignature` to sign the transaction.
- They should send you back their `publicKey` and the `signature` string
from `getKeypairSignature`, both of which you pass to
this function.

```ts
addSignature(publicKey: string = "", signature: string = ""): void;
```

**Parameters**

- **`publicKey`** — `string` (optional) (default: `""`) — the public key of the signer
- **`signature`** — `string` (optional) (default: `""`) — the base64 value of the signature XDR

**Source:** [src/base/transaction_base.ts:162](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L162)

### `feeBumpTransaction.getKeypairSignature(keypair)`

Signs a transaction with the given `Keypair`. Useful if someone sends
you a transaction XDR for you to sign and return (see
`addSignature` for more information).

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

**Source:** [src/base/transaction_base.ts:135](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L135)

### `feeBumpTransaction.hash()`

Returns a hash for this transaction, suitable for signing.

```ts
hash(): Buffer;
```

**Source:** [src/base/transaction_base.ts:228](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L228)

### `feeBumpTransaction.sign(keypairs)`

Signs the transaction with the given `Keypair`.

```ts
sign(...keypairs: Keypair[]): void;
```

**Parameters**

- **`...keypairs`** — `Keypair[]` (required) — Keypairs of signers

**Source:** [src/base/transaction_base.ts:103](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L103)

### `feeBumpTransaction.signatureBase()`

Returns the "signature base" of this transaction, which is the value
that, when hashed, should be signed to create a signature that
validators on the Stellar Network will accept.

It is composed of a 4 prefix bytes followed by the xdr-encoded form
of this transaction.

```ts
signatureBase(): Buffer;
```

**Source:** [src/base/fee_bump_transaction.ts:97](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L97)

### `feeBumpTransaction.signHashX(preimage)`

Add `hashX` signer preimage as signature.

```ts
signHashX(preimage: string | Buffer<ArrayBufferLike>): void;
```

**Parameters**

- **`preimage`** — `string | Buffer<ArrayBufferLike>` (required) — preimage of hash used as signer

**Source:** [src/base/transaction_base.ts:210](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L210)

### `feeBumpTransaction.toEnvelope()`

To envelope returns a xdr.TransactionEnvelope which can be submitted to the network.

```ts
toEnvelope(): TransactionEnvelope;
```

**Source:** [src/base/fee_bump_transaction.ts:114](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/fee_bump_transaction.ts#L114)

### `feeBumpTransaction.toXdr()`

Returns the transaction envelope as a base64-encoded XDR string.

```ts
toXdr(): string;
```

**Source:** [src/base/transaction_base.ts:245](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L245)

## Memo

`Memo` represents memos attached to transactions.

```ts
class Memo<T extends MemoType = MemoType> {
  constructor(type: "none", value?: null);
  static fromXdrObject(object: Memo): Memo;
  static hash(hash: string | Buffer<ArrayBufferLike>): Memo<"hash">;
  static id(id: string): Memo<"id">;
  static none(): Memo<"none">;
  static return(hash: string | Buffer<ArrayBufferLike>): Memo<"return">;
  static text(text: string | Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>): Memo<"text">;
  type: T;
  value: MemoTypeToValue<T>;
  toXdrObject(): Memo;
}
```

**See also**

- [Transactions concept](https://developers.stellar.org/docs/glossary/transactions/)

**Source:** [src/base/memo.ts:62](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L62)

### `new Memo(type, value)`

```ts
constructor(type: "none", value?: null);
```

**Parameters**

- **`type`** — `"none"` (required)
- **`value`** — `null` (optional)

**Source:** [src/base/memo.ts:66](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L66)

### `Memo.fromXdrObject(object)`

Returns `Memo` from XDR memo object.

```ts
static fromXdrObject(object: Memo): Memo;
```

**Parameters**

- **`object`** — `Memo` (required) — XDR memo object

**Source:** [src/base/memo.ts:300](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L300)

### `Memo.hash(hash)`

Creates and returns a `MemoHash` memo.

```ts
static hash(hash: string | Buffer<ArrayBufferLike>): Memo<"hash">;
```

**Parameters**

- **`hash`** — `string | Buffer<ArrayBufferLike>` (required) — 32 byte hash or hex encoded string

**Source:** [src/base/memo.ts:259](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L259)

### `Memo.id(id)`

Creates and returns a `MemoID` memo.

```ts
static id(id: string): Memo<"id">;
```

**Parameters**

- **`id`** — `string` (required) — 64-bit number represented as a string

**Source:** [src/base/memo.ts:250](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L250)

### `Memo.none()`

Returns an empty memo (`MemoNone`).

```ts
static none(): Memo<"none">;
```

**Source:** [src/base/memo.ts:231](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L231)

### `Memo.return(hash)`

Creates and returns a `MemoReturn` memo.

```ts
static return(hash: string | Buffer<ArrayBufferLike>): Memo<"return">;
```

**Parameters**

- **`hash`** — `string | Buffer<ArrayBufferLike>` (required) — 32 byte hash or hex encoded string

**Source:** [src/base/memo.ts:268](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L268)

### `Memo.text(text)`

Creates and returns a `MemoText` memo.

```ts
static text(text: string | Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>): Memo<"text">;
```

**Parameters**

- **`text`** — `string | Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>` (required) — memo text. A JS string is UTF-8 encoded on the wire;
    pass a `Buffer`/`Uint8Array` for byte-exact content.

**Source:** [src/base/memo.ts:241](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L241)

### `memo.type`

Contains memo type: `MemoNone`, `MemoID`, `MemoText`, `MemoHash` or `MemoReturn`

```ts
type: T;
```

**Source:** [src/base/memo.ts:106](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L106)

### `memo.value`

Contains memo value:
* `null` for `MemoNone`,
* `string` for `MemoID`,
* `Buffer` for `MemoText` after decoding using `fromXdrObject`, original value otherwise,
* `Buffer` for `MemoHash`, `MemoReturn`.

```ts
value: MemoTypeToValue<T>;
```

**Source:** [src/base/memo.ts:121](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L121)

### `memo.toXdrObject()`

Returns XDR memo object.

```ts
toXdrObject(): Memo;
```

**Source:** [src/base/memo.ts:275](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L275)

## MemoHash

Type of `Memo`.

```ts
const MemoHash: "hash"
```

**Source:** [src/base/memo.ts:20](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L20)

## MemoID

Type of `Memo`.

```ts
const MemoID: "id"
```

**Source:** [src/base/memo.ts:12](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L12)

## MemoNone

Type of `Memo`.

```ts
const MemoNone: "none"
```

**Source:** [src/base/memo.ts:8](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L8)

## MemoReturn

Type of `Memo`.

```ts
const MemoReturn: "return"
```

**Source:** [src/base/memo.ts:24](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L24)

## MemoText

Type of `Memo`.

```ts
const MemoText: "text"
```

**Source:** [src/base/memo.ts:16](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L16)

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

- **`baseAccount`** — `Account` (required) — the `Account` instance representing the
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
- **`sequenceNum`** — `string` (required) — the sequence number of the underlying `Account`, to use for the underlying base account `MuxedAccount.baseAccount`. If you're using the SDK, you can use
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

**Source:** [src/base/operation.ts:450](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L450)

### `Operation.allowTrust`

**Deprecated.** since v5.0

An "allow trust" operation authorizes another account to hold your
account's credit for a given asset.

```ts
static allowTrust: (opts: AllowTrustOpts) => Operation;
```

**Parameters**

- **`opts`** — `AllowTrustOpts` (required) — Options object

**Source:** [src/base/operation.ts:451](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L451)

### `Operation.beginSponsoringFutureReserves`

Create a "begin sponsoring future reserves" operation.

```ts
static beginSponsoringFutureReserves: (opts: BeginSponsoringFutureReservesOpts) => Operation;
```

**Parameters**

- **`opts`** — `BeginSponsoringFutureReservesOpts` (required) — Options object

**Example**

```ts
const op = Operation.beginSponsoringFutureReserves({
  sponsoredId: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
});
```

**Source:** [src/base/operation.ts:467](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L467)

### `Operation.bumpSequence`

This operation bumps sequence number.

```ts
static bumpSequence: (opts: BumpSequenceOpts) => Operation;
```

**Parameters**

- **`opts`** — `BumpSequenceOpts` (required) — Options object

**Source:** [src/base/operation.ts:452](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L452)

### `Operation.changeTrust`

A "change trust" operation adds, removes, or updates a trust line for a
given asset from the source account to another.

```ts
static changeTrust: (opts: ChangeTrustOpts) => Operation;
```

**Parameters**

- **`opts`** — `ChangeTrustOpts` (required) — Options object

**Source:** [src/base/operation.ts:453](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L453)

### `Operation.claimClaimableBalance`

Create a new claim claimable balance operation.

```ts
static claimClaimableBalance: (opts: ClaimClaimableBalanceOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `ClaimClaimableBalanceOpts` (optional) (default: `...`) — Options object

**Example**

```ts
const op = Operation.claimClaimableBalance({
  balanceId: '00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be',
});
```

**Source:** [src/base/operation.ts:456](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L456)

### `Operation.clawback`

Creates a clawback operation.

```ts
static clawback: (opts: ClawbackOpts) => Operation;
```

**Parameters**

- **`opts`** — `ClawbackOpts` (required) — Options object

**See also**

- https://github.com/stellar/stellar-protocol/blob/master/core/cap-0035.md#clawback-operation

**Source:** [src/base/operation.ts:477](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L477)

### `Operation.clawbackClaimableBalance`

Creates a clawback operation for a claimable balance.

```ts
static clawbackClaimableBalance: (opts: ClawbackClaimableBalanceOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `ClawbackClaimableBalanceOpts` (optional) (default: `...`) — Options object

**Example**

```ts
const op = Operation.clawbackClaimableBalance({
  balanceId: '00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be',
});
```

**See also**

- https://github.com/stellar/stellar-protocol/blob/master/core/cap-0035.md#clawback-claimable-balance-operation

**Source:** [src/base/operation.ts:457](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L457)

### `Operation.createAccount`

Create and fund a non-existent account.

```ts
static createAccount: (opts: CreateAccountOpts) => Operation;
```

**Parameters**

- **`opts`** — `CreateAccountOpts` (required) — Options object

**Source:** [src/base/operation.ts:454](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L454)

### `Operation.createClaimableBalance`

Create a new claimable balance operation.

```ts
static createClaimableBalance: (opts: CreateClaimableBalanceOpts) => Operation;
```

**Parameters**

- **`opts`** — `CreateClaimableBalanceOpts` (required) — Options object

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

**Source:** [src/base/operation.ts:455](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L455)

### `Operation.createCustomContract`

Returns an operation that creates a custom WASM contract and atomically
invokes its constructor.

```ts
static createCustomContract: (opts: CreateCustomContractOpts) => Operation;
```

**Parameters**

- **`opts`** — `CreateCustomContractOpts` (required) — the set of parameters

**See also**

- https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions#function

**Source:** [src/base/operation.ts:489](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L489)

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

**Throws**

- when the best rational approximation of `price` cannot be found.

**Source:** [src/base/operation.ts:458](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L458)

### `Operation.createStellarAssetContract`

Returns an operation that wraps a Stellar asset into a token contract.

```ts
static createStellarAssetContract: (opts: CreateStellarAssetContractOpts) => Operation;
```

**Parameters**

- **`opts`** — `CreateStellarAssetContractOpts` (required) — the set of parameters

**See also**

- - https://stellar.org/protocol/sep-11#alphanum4-alphanum12
 - https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions
 - https://soroban.stellar.org/docs/advanced-tutorials/stellar-asset-contract
 - Operation.invokeHostFunction

**Source:** [src/base/operation.ts:487](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L487)

### `Operation.endSponsoringFutureReserves`

Create an "end sponsoring future reserves" operation.

```ts
static endSponsoringFutureReserves: (opts: EndSponsoringFutureReservesOpts = {}) => Operation;
```

**Parameters**

- **`opts`** — `EndSponsoringFutureReservesOpts` (optional) (default: `{}`) — Options object

**Example**

```ts
const op = Operation.endSponsoringFutureReserves();
```

**Source:** [src/base/operation.ts:468](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L468)

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
`TransactionBuilder`'s `opts.sorobanData` parameter, which is a
`xdr.SorobanTransactionData` instance that contains fee data & resource
usage as part of `xdr.SorobanResources`.

```ts
static extendFootprintTtl: (opts: ExtendFootprintTtlOpts) => Operation;
```

**Parameters**

- **`opts`** — `ExtendFootprintTtlOpts` (required) — object holding operation parameters

**Source:** [src/base/operation.ts:482](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L482)

### `Operation.inflation`

This operation generates the inflation.

```ts
static inflation: (opts: InflationOpts = {}) => Operation;
```

**Parameters**

- **`opts`** — `InflationOpts` (optional) (default: `{}`) — Options object

**Source:** [src/base/operation.ts:459](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L459)

### `Operation.invokeContractFunction`

Returns an operation that invokes a contract function.

```ts
static invokeContractFunction: (opts: InvokeContractFunctionOpts) => Operation;
```

**Parameters**

- **`opts`** — `InvokeContractFunctionOpts` (required) — the set of parameters

**See also**

- - Operation.invokeHostFunction
 - Contract.call
 - Address

**Source:** [src/base/operation.ts:488](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L488)

### `Operation.invokeHostFunction`

Invokes a single smart contract host function.

```ts
static invokeHostFunction: (opts: InvokeHostFunctionOpts) => Operation;
```

**Parameters**

- **`opts`** — `InvokeHostFunctionOpts` (required) — options object

**See also**

- - https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions#function
 - Operation.invokeContractFunction
 - Operation.createCustomContract
 - Operation.createStellarAssetContract
 - Operation.uploadContractWasm
 - Contract.call

**Source:** [src/base/operation.ts:481](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L481)

### `Operation.liquidityPoolDeposit`

Creates a liquidity pool deposit operation.

```ts
static liquidityPoolDeposit: (opts: LiquidityPoolDepositOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `LiquidityPoolDepositOpts` (optional) (default: `...`) — Options object

**See also**

- https://developers.stellar.org/docs/start/list-of-operations/#liquidity-pool-deposit

**Source:** [src/base/operation.ts:479](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L479)

### `Operation.liquidityPoolWithdraw`

Creates a liquidity pool withdraw operation.

```ts
static liquidityPoolWithdraw: (opts: LiquidityPoolWithdrawOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `LiquidityPoolWithdrawOpts` (optional) (default: `...`) — Options object

**See also**

- https://developers.stellar.org/docs/start/list-of-operations/#liquidity-pool-withdraw

**Source:** [src/base/operation.ts:480](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L480)

### `Operation.manageBuyOffer`

Returns a XDR ManageBuyOfferOp. A "manage buy offer" operation creates, updates, or
deletes a buy offer.

```ts
static manageBuyOffer: (opts: ManageBuyOfferOpts) => Operation;
```

**Parameters**

- **`opts`** — `ManageBuyOfferOpts` (required) — Options object

**Throws**

- when the best rational approximation of `price` cannot be found.

**Source:** [src/base/operation.ts:462](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L462)

### `Operation.manageData`

This operation adds data entry to the ledger.

```ts
static manageData: (opts: ManageDataOpts) => Operation;
```

**Parameters**

- **`opts`** — `ManageDataOpts` (required) — Options object

**Source:** [src/base/operation.ts:460](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L460)

### `Operation.manageSellOffer`

Returns a XDR ManageSellOfferOp. A "manage sell offer" operation creates, updates, or
deletes an offer.

```ts
static manageSellOffer: (opts: ManageSellOfferOpts) => Operation;
```

**Parameters**

- **`opts`** — `ManageSellOfferOpts` (required) — Options object

**Throws**

- when the best rational approximation of `price` cannot be found.

**Source:** [src/base/operation.ts:461](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L461)

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

**See also**

- https://developers.stellar.org/docs/start/list-of-operations/#path-payment-strict-receive

**Source:** [src/base/operation.ts:463](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L463)

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

**See also**

- https://developers.stellar.org/docs/start/list-of-operations/#path-payment-strict-send

**Source:** [src/base/operation.ts:464](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L464)

### `Operation.payment`

Create a payment operation.

```ts
static payment: (opts: PaymentOpts) => Operation;
```

**Parameters**

- **`opts`** — `PaymentOpts` (required) — options object

**See also**

- https://developers.stellar.org/docs/start/list-of-operations/#payment

**Source:** [src/base/operation.ts:465](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L465)

### `Operation.restoreFootprint`

Builds an operation to restore the archived ledger entries specified
by the ledger keys.

The ledger keys to restore are specified separately from the operation
in read-write footprint of the transaction.

It takes no parameters because the relevant footprint is derived from the
transaction itself. See `TransactionBuilder`'s `opts.sorobanData`
parameter (or `TransactionBuilder.setSorobanData`), which is a
`xdr.SorobanTransactionData` instance that contains fee data & resource
usage as part of `xdr.SorobanTransactionData`.

```ts
static restoreFootprint: (opts: RestoreFootprintOpts = {}) => Operation;
```

**Parameters**

- **`opts`** — `RestoreFootprintOpts` (optional) (default: `{}`) — an optional set of parameters

**Source:** [src/base/operation.ts:483](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L483)

### `Operation.revokeAccountSponsorship`

Create a "revoke sponsorship" operation for an account.

```ts
static revokeAccountSponsorship: (opts: RevokeAccountSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeAccountSponsorshipOpts` (optional) (default: `...`) — Options object

**Example**

```ts
const op = Operation.revokeAccountSponsorship({
  account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
});
```

**Source:** [src/base/operation.ts:469](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L469)

### `Operation.revokeClaimableBalanceSponsorship`

Create a "revoke sponsorship" operation for a claimable balance.

```ts
static revokeClaimableBalanceSponsorship: (opts: RevokeClaimableBalanceSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeClaimableBalanceSponsorshipOpts` (optional) (default: `...`) — Options object

**Example**

```ts
const op = Operation.revokeClaimableBalanceSponsorship({
  balanceId: '00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be',
});
```

**Source:** [src/base/operation.ts:473](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L473)

### `Operation.revokeDataSponsorship`

Create a "revoke sponsorship" operation for a data entry.

```ts
static revokeDataSponsorship: (opts: RevokeDataSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeDataSponsorshipOpts` (optional) (default: `...`) — Options object

**Example**

```ts
const op = Operation.revokeDataSponsorship({
  account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
  name: 'foo'
});
```

**Source:** [src/base/operation.ts:472](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L472)

### `Operation.revokeLiquidityPoolSponsorship`

Creates a "revoke sponsorship" operation for a liquidity pool.

```ts
static revokeLiquidityPoolSponsorship: (opts: RevokeLiquidityPoolSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeLiquidityPoolSponsorshipOpts` (optional) (default: `...`) — Options object.

**Example**

```ts
const op = Operation.revokeLiquidityPoolSponsorship({
  liquidityPoolId: 'dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7',
});
```

**Source:** [src/base/operation.ts:475](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L475)

### `Operation.revokeOfferSponsorship`

Create a "revoke sponsorship" operation for an offer.

```ts
static revokeOfferSponsorship: (opts: RevokeOfferSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeOfferSponsorshipOpts` (optional) (default: `...`) — Options object

**Example**

```ts
const op = Operation.revokeOfferSponsorship({
  seller: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
  offerId: '1234'
});
```

**Source:** [src/base/operation.ts:471](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L471)

### `Operation.revokeSignerSponsorship`

Create a "revoke sponsorship" operation for a signer.

```ts
static revokeSignerSponsorship: (opts: RevokeSignerSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeSignerSponsorshipOpts` (optional) (default: `...`) — Options object

**Example**

```ts
const op = Operation.revokeSignerSponsorship({
  account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
  signer: {
    ed25519PublicKey: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
  }
})
```

**Source:** [src/base/operation.ts:476](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L476)

### `Operation.revokeTrustlineSponsorship`

Create a "revoke sponsorship" operation for a trustline.

```ts
static revokeTrustlineSponsorship: (opts: RevokeTrustlineSponsorshipOpts = ...) => Operation;
```

**Parameters**

- **`opts`** — `RevokeTrustlineSponsorshipOpts` (optional) (default: `...`) — Options object

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

**Source:** [src/base/operation.ts:470](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L470)

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

**See also**

- [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)

**Source:** [src/base/operation.ts:466](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L466)

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

**See also**

- - https://github.com/stellar/stellar-protocol/blob/master/core/cap-0035.md#set-trustline-flags-operation
 - https://developers.stellar.org/docs/start/list-of-operations/#set-options

**Source:** [src/base/operation.ts:478](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L478)

### `Operation.uploadContractWasm`

Returns an operation that uploads WASM for a contract.

```ts
static uploadContractWasm: (opts: UploadContractWasmOpts) => Operation;
```

**Parameters**

- **`opts`** — `UploadContractWasmOpts` (required) — the set of parameters

**See also**

- https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions#function

**Source:** [src/base/operation.ts:490](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L490)

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
value), you can use the lower level abstraction `XdrLargeInt`. For
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
import { xdr, ScInt, scValToBigInt } from "@stellar/stellar-base";

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

**Source:** [src/base/numbers/sc_int.ts:61](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/sc_int.ts#L61)

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

**Source:** [src/base/numbers/sc_int.ts:74](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/sc_int.ts#L74)

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

- if the value cannot fit in 128 bits

**Source:** [src/base/numbers/xdr_large_int.ts:182](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L182)

### `scInt.toI256()`

The integer encoded with `ScValType = I256`

```ts
toI256(): ScVal;
```

**Throws**

- if the value cannot fit in a signed 256-bit integer

**Source:** [src/base/numbers/xdr_large_int.ts:217](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L217)

### `scInt.toI64()`

The integer encoded with `ScValType = I64`.

```ts
toI64(): ScVal;
```

**Throws**

- if the value cannot fit in 64 bits

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

- if the value can't fit into a Number

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

- if the value cannot fit in 128 bits

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

- - `TransactionBuilder#setTimeout`
 - [Timeout](https://developers.stellar.org/api/resources/transactions/post/)

**Source:** [src/base/transaction_builder.ts:75](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L75)

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
  hash(): Buffer;
  sign(...keypairs: Keypair[]): void;
  signatureBase(): Buffer;
  signHashX(preimage: string | Buffer<ArrayBufferLike>): void;
  toEnvelope(): TransactionEnvelope;
  toXdr(): string;
}
```

**Source:** [src/base/transaction.ts:46](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L46)

### `new Transaction(envelope, networkPassphrase)`

```ts
constructor(envelope: string | TransactionEnvelope, networkPassphrase: string);
```

**Parameters**

- **`envelope`** — `string | TransactionEnvelope` (required) — transaction envelope object or base64 encoded string
- **`networkPassphrase`** — `string` (required) — passphrase of the target stellar network
      (e.g. "Public Global Stellar Network ; September 2015")

**Source:** [src/base/transaction.ts:66](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L66)

### `transaction.extraSigners`

Array of extra signers as XDR objects; use `SignerKey.encodeSignerKey`
to convert to StrKey strings.

```ts
extraSigners: SignerKey[] | undefined;
```

**Source:** [src/base/transaction.ts:222](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L222)

### `transaction.fee`

The total fee for this transaction, in stroops.

```ts
fee: string;
```

**Source:** [src/base/transaction_base.ts:82](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L82)

### `transaction.ledgerBounds`

The ledger bounds for this transaction, with `minLedger` (uint32) and
`maxLedger` (uint32, or 0 for no upper bound).

```ts
ledgerBounds: { maxLedger: number; minLedger: number } | undefined;
```

**Source:** [src/base/transaction.ts:187](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L187)

### `transaction.memo`

The memo attached to this transaction.

```ts
memo: Memo<MemoType>;
```

**Source:** [src/base/transaction.ts:254](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L254)

### `transaction.minAccountSequence`

The minimum account sequence (64-bit, as a string).

```ts
minAccountSequence: string | undefined;
```

**Source:** [src/base/transaction.ts:195](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L195)

### `transaction.minAccountSequenceAge`

The minimum account sequence age (64-bit number of seconds).

```ts
minAccountSequenceAge: bigint | undefined;
```

**Source:** [src/base/transaction.ts:203](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L203)

### `transaction.minAccountSequenceLedgerGap`

The minimum account sequence ledger gap (32-bit number of ledgers).

```ts
minAccountSequenceLedgerGap: number | undefined;
```

**Source:** [src/base/transaction.ts:211](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L211)

### `transaction.networkPassphrase`

The network passphrase for this transaction.

```ts
networkPassphrase: string;
```

**Source:** [src/base/transaction_base.ts:91](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L91)

### `transaction.operations`

The list of operations in this transaction.

```ts
operations: OperationRecord[];
```

**Source:** [src/base/transaction.ts:246](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L246)

### `transaction.sequence`

The sequence number for this transaction.

```ts
sequence: string;
```

**Source:** [src/base/transaction.ts:230](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L230)

### `transaction.signatures`

The list of signatures for this transaction.

```ts
signatures: DecoratedSignature[];
```

**Source:** [src/base/transaction_base.ts:41](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L41)

### `transaction.source`

The source account for this transaction.

```ts
source: string;
```

**Source:** [src/base/transaction.ts:238](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L238)

### `transaction.timeBounds`

The time bounds for this transaction, with `minTime` and `maxTime` as
64-bit unix timestamps (strings).

```ts
timeBounds: { maxTime: string; minTime: string } | undefined;
```

**Source:** [src/base/transaction.ts:176](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L176)

### `transaction.tx`

The underlying XDR transaction object.

Returns a defensive copy so that external mutations cannot alter the
transaction that will be signed or serialized.

```ts
tx: TTx;
```

**Throws**

- if the internal transaction is not a recognized XDR type

**Source:** [src/base/transaction_base.ts:57](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L57)

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

**Source:** [src/base/transaction_base.ts:202](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L202)

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
for `getKeypairSignature` to sign the transaction.
- They should send you back their `publicKey` and the `signature` string
from `getKeypairSignature`, both of which you pass to
this function.

```ts
addSignature(publicKey: string = "", signature: string = ""): void;
```

**Parameters**

- **`publicKey`** — `string` (optional) (default: `""`) — the public key of the signer
- **`signature`** — `string` (optional) (default: `""`) — the base64 value of the signature XDR

**Source:** [src/base/transaction_base.ts:162](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L162)

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

**Source:** [src/base/transaction.ts:344](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L344)

### `transaction.getKeypairSignature(keypair)`

Signs a transaction with the given `Keypair`. Useful if someone sends
you a transaction XDR for you to sign and return (see
`addSignature` for more information).

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

**Source:** [src/base/transaction_base.ts:135](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L135)

### `transaction.hash()`

Returns a hash for this transaction, suitable for signing.

```ts
hash(): Buffer;
```

**Source:** [src/base/transaction_base.ts:228](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L228)

### `transaction.sign(keypairs)`

Signs the transaction with the given `Keypair`.

```ts
sign(...keypairs: Keypair[]): void;
```

**Parameters**

- **`...keypairs`** — `Keypair[]` (required) — Keypairs of signers

**Source:** [src/base/transaction_base.ts:103](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L103)

### `transaction.signatureBase()`

Returns the "signature base" of this transaction, which is the value
that, when hashed, should be signed to create a signature that
validators on the Stellar Network will accept.

It is composed of a 4 prefix bytes followed by the xdr-encoded form
of this transaction.

```ts
signatureBase(): Buffer;
```

**Source:** [src/base/transaction.ts:269](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L269)

### `transaction.signHashX(preimage)`

Add `hashX` signer preimage as signature.

```ts
signHashX(preimage: string | Buffer<ArrayBufferLike>): void;
```

**Parameters**

- **`preimage`** — `string | Buffer<ArrayBufferLike>` (required) — preimage of hash used as signer

**Source:** [src/base/transaction_base.ts:210](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L210)

### `transaction.toEnvelope()`

To envelope returns a xdr.TransactionEnvelope which can be submitted to the network.

```ts
toEnvelope(): TransactionEnvelope;
```

**Source:** [src/base/transaction.ts:302](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction.ts#L302)

### `transaction.toXdr()`

Returns the transaction envelope as a base64-encoded XDR string.

```ts
toXdr(): string;
```

**Source:** [src/base/transaction_base.ts:245](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_base.ts#L245)

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
method on the `TransactionBuilder` to return a fully constructed [`Transaction`](#transaction) that can be signed. The returned transaction will contain the
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
  source: Account | MuxedAccount;
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

**Source:** [src/base/transaction_builder.ts:183](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L183)

### `new TransactionBuilder(sourceAccount, opts)`

```ts
constructor(sourceAccount: Account | MuxedAccount, opts: TransactionBuilderOptions = ...);
```

**Parameters**

- **`sourceAccount`** — `Account | MuxedAccount` (required) — source account for this transaction
- **`opts`** — `TransactionBuilderOptions` (optional) (default: `...`) — options object (see `TransactionBuilderOptions`)

**Source:** [src/base/transaction_builder.ts:204](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L204)

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

**See also**

- https://developers.stellar.org/docs/glossary/fee-bumps/#replace-by-fee

**Source:** [src/base/transaction_builder.ts:1143](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L1143)

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
     {fee: '1000'} will override the existing base fee derived from `tx` (see
     the `TransactionBuilder` constructor for detailed options)

**Source:** [src/base/transaction_builder.ts:312](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L312)

### `TransactionBuilder.fromXdr(envelope, networkPassphrase)`

Build a `Transaction` or `FeeBumpTransaction` from an
xdr.TransactionEnvelope.

```ts
static fromXdr(envelope: string | TransactionEnvelope, networkPassphrase: string): Transaction | FeeBumpTransaction;
```

**Parameters**

- **`envelope`** — `string | TransactionEnvelope` (required) — The transaction envelope
      object or base64 encoded string.
- **`networkPassphrase`** — `string` (required) — The network passphrase of the target
      Stellar network (e.g. "Public Global Stellar Network ; September
      2015"), see `Networks`.

**Source:** [src/base/transaction_builder.ts:1256](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L1256)

### `transactionBuilder.baseFee`

```ts
baseFee: string;
```

**Source:** [src/base/transaction_builder.ts:186](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L186)

### `transactionBuilder.extraSigners`

```ts
extraSigners: string[] | null;
```

**Source:** [src/base/transaction_builder.ts:195](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L195)

### `transactionBuilder.ledgerbounds`

```ts
ledgerbounds: { maxLedger?: number; minLedger?: number } | null;
```

**Source:** [src/base/transaction_builder.ts:191](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L191)

### `transactionBuilder.memo`

```ts
memo: Memo;
```

**Source:** [src/base/transaction_builder.ts:196](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L196)

### `transactionBuilder.minAccountSequence`

```ts
minAccountSequence: string | null;
```

**Source:** [src/base/transaction_builder.ts:192](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L192)

### `transactionBuilder.minAccountSequenceAge`

```ts
minAccountSequenceAge: bigint | null;
```

**Source:** [src/base/transaction_builder.ts:193](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L193)

### `transactionBuilder.minAccountSequenceLedgerGap`

```ts
minAccountSequenceLedgerGap: number | null;
```

**Source:** [src/base/transaction_builder.ts:194](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L194)

### `transactionBuilder.networkPassphrase`

```ts
networkPassphrase: string | null;
```

**Source:** [src/base/transaction_builder.ts:197](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L197)

### `transactionBuilder.operations`

```ts
operations: Operation[];
```

**Source:** [src/base/transaction_builder.ts:185](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L185)

### `transactionBuilder.sorobanData`

```ts
sorobanData: SorobanTransactionData | null;
```

**Source:** [src/base/transaction_builder.ts:198](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L198)

### `transactionBuilder.source`

```ts
source: Account | MuxedAccount;
```

**Source:** [src/base/transaction_builder.ts:184](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L184)

### `transactionBuilder.timebounds`

```ts
timebounds: { maxTime?: string | number | Date; minTime?: string | number | Date } | null;
```

**Source:** [src/base/transaction_builder.ts:187](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L187)

### `transactionBuilder.addMemo(memo)`

Adds a memo to the transaction.

```ts
addMemo(memo: Memo): TransactionBuilder;
```

**Parameters**

- **`memo`** — `Memo` (required) — `Memo` object

**Source:** [src/base/transaction_builder.ts:444](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L444)

### `transactionBuilder.addOperation(operation)`

Adds an operation to the transaction.

```ts
addOperation(operation: Operation): TransactionBuilder;
```

**Parameters**

- **`operation`** — `Operation` (required) — The xdr operation object, use `Operation` static methods.

**Source:** [src/base/transaction_builder.ts:406](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L406)

### `transactionBuilder.addOperationAt(operation, index)`

Adds an operation to the transaction at a specific index.

```ts
addOperationAt(operation: Operation, index: number): TransactionBuilder;
```

**Parameters**

- **`operation`** — `Operation` (required) — The xdr operation object to add, use `Operation` static methods.
- **`index`** — `number` (required) — The index at which to insert the operation.

**Source:** [src/base/transaction_builder.ts:417](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L417)

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

**Source:** [src/base/transaction_builder.ts:751](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L751)

### `transactionBuilder.build()`

Builds the transaction and increments the source account's sequence
number by 1.

```ts
build(): Transaction;
```

**Source:** [src/base/transaction_builder.ts:971](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L971)

### `transactionBuilder.clearOperationAt(index)`

Removes the operation at the specified index from the transaction.

```ts
clearOperationAt(index: number): TransactionBuilder;
```

**Parameters**

- **`index`** — `number` (required) — The index of the operation to remove.

**Source:** [src/base/transaction_builder.ts:435](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L435)

### `transactionBuilder.clearOperations()`

Removes the operations from the builder (useful when cloning).

```ts
clearOperations(): TransactionBuilder;
```

**Source:** [src/base/transaction_builder.ts:425](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L425)

### `transactionBuilder.hasV2Preconditions()`

Checks whether any v2 preconditions have been set on this builder.

```ts
hasV2Preconditions(): boolean;
```

**Source:** [src/base/transaction_builder.ts:1110](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L1110)

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

**Source:** [src/base/transaction_builder.ts:686](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L686)

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

**Source:** [src/base/transaction_builder.ts:574](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L574)

### `transactionBuilder.setMinAccountSequence(minAccountSequence)`

If you want to prepare a transaction which will be valid only while the
account sequence number is

    minAccountSequence <= sourceAccountSequence < tx.seqNum

Note that after execution the account's sequence number is always raised to
`tx.seqNum`. Internally this will set the `minAccountSequence`
precondition.

```ts
setMinAccountSequence(minAccountSequence: string): TransactionBuilder;
```

**Parameters**

- **`minAccountSequence`** — `string` (required) — The minimum source account sequence
      number this transaction is valid for. If the value is `0` (the
      default), the transaction is valid when `sourceAccount's sequence
      number == tx.seqNum- 1`.

**Source:** [src/base/transaction_builder.ts:611](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L611)

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

**Source:** [src/base/transaction_builder.ts:633](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L633)

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

**Source:** [src/base/transaction_builder.ts:662](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L662)

### `transactionBuilder.setNetworkPassphrase(networkPassphrase)`

Set network passphrase for the Transaction that will be built.

```ts
setNetworkPassphrase(networkPassphrase: string): TransactionBuilder;
```

**Parameters**

- **`networkPassphrase`** — `string` (required) — passphrase of the target Stellar
      network (e.g. "Public Global Stellar Network ; September 2015").

**Source:** [src/base/transaction_builder.ts:712](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L712)

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

**Source:** [src/base/transaction_builder.ts:734](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L734)

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

**Source:** [src/base/transaction_builder.ts:525](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L525)

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
 [`TimeoutInfinite`](#timeoutinfinite). In general you should set [`TimeoutInfinite`](#timeoutinfinite) only in smart contracts.

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

**Source:** [src/base/transaction_builder.ts:478](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L478)

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
     (see `XdrLargeInt.isType`)
- **`values`** — `XdrLargeIntValues` (required) — a single integer-like value, or a list of slices in
     **little-endian** order (parts[0] is the least-significant slice),
     matching the legacy `LargeInt` contract — e.g.
     `new XdrLargeInt("i128", [parts.lo, parts.hi])`. Slice width is
     `SIZE[type] / values.length`; each slice must fit its width or a
     `RangeError` is thrown.

**Source:** [src/base/numbers/xdr_large_int.ts:72](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L72)

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

- if the value cannot fit in 128 bits

**Source:** [src/base/numbers/xdr_large_int.ts:182](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L182)

### `xdrLargeInt.toI256()`

The integer encoded with `ScValType = I256`

```ts
toI256(): ScVal;
```

**Throws**

- if the value cannot fit in a signed 256-bit integer

**Source:** [src/base/numbers/xdr_large_int.ts:217](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/xdr_large_int.ts#L217)

### `xdrLargeInt.toI64()`

The integer encoded with `ScValType = I64`.

```ts
toI64(): ScVal;
```

**Throws**

- if the value cannot fit in 64 bits

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

- if the value can't fit into a Number

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

- if the value cannot fit in 128 bits

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

**Source:** [src/base/util/decode_encode_muxed_account.ts:13](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/util/decode_encode_muxed_account.ts#L13)

## encodeMuxedAccount

Transform a Stellar address (G...) and an ID into its XDR representation.

```ts
encodeMuxedAccount(address: string, id: string): MuxedAccount
```

**Parameters**

- **`address`** — `string` (required) — a Stellar G... address
- **`id`** — `string` (required) — a Uint64 ID represented as a string

**Source:** [src/base/util/decode_encode_muxed_account.ts:47](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/util/decode_encode_muxed_account.ts#L47)

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

**Source:** [src/base/util/decode_encode_muxed_account.ts:31](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/util/decode_encode_muxed_account.ts#L31)

## extractBaseAddress

Extracts the underlying base (G...) address from an M-address.

```ts
extractBaseAddress(address: string): string
```

**Parameters**

- **`address`** — `string` (required) — an account address (either M... or G...)

**Source:** [src/base/util/decode_encode_muxed_account.ts:66](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/util/decode_encode_muxed_account.ts#L66)

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

**Source:** [src/base/numbers/index.ts:28](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/numbers/index.ts#L28)

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

**Source:** [src/base/memo.ts:32](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L32)

### MemoType.Hash

```ts
type Hash = MemoTypeHash
```

**Source:** [src/base/memo.ts:36](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L36)

### MemoType.ID

```ts
type ID = MemoTypeID
```

**Source:** [src/base/memo.ts:34](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L34)

### MemoType.None

```ts
type None = MemoTypeNone
```

**Source:** [src/base/memo.ts:33](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L33)

### MemoType.Return

```ts
type Return = MemoTypeReturn
```

**Source:** [src/base/memo.ts:37](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L37)

### MemoType.Text

```ts
type Text = MemoTypeText
```

**Source:** [src/base/memo.ts:35](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L35)

### MemoTypeHash

```ts
type MemoTypeHash = typeof MemoHash
```

**Source:** [src/base/memo.ts:29](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L29)

### MemoTypeID

```ts
type MemoTypeID = typeof MemoID
```

**Source:** [src/base/memo.ts:27](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L27)

### MemoTypeNone

```ts
type MemoTypeNone = typeof MemoNone
```

**Source:** [src/base/memo.ts:26](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L26)

### MemoTypeReturn

```ts
type MemoTypeReturn = typeof MemoReturn
```

**Source:** [src/base/memo.ts:30](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L30)

### MemoTypeText

```ts
type MemoTypeText = typeof MemoText
```

**Source:** [src/base/memo.ts:28](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L28)

### MemoValue

```ts
type MemoValue = Buffer | string | null | Uint8Array
```

**Source:** [src/base/memo.ts:46](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/memo.ts#L46)

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

**Source:** [src/base/operation.ts:623](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L623)

### Operation.AllowTrust

```ts
type AllowTrust = AllowTrustResult
```

**Source:** [src/base/operation.ts:622](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L622)

### Operation.BaseOperation

```ts
type BaseOperation<T extends _OperationType = _OperationType> = _BaseOperation<T>
```

**Source:** [src/base/operation.ts:611](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L611)

### Operation.BeginSponsoringFutureReserves

```ts
type BeginSponsoringFutureReserves = BeginSponsoringFutureReservesResult
```

**Source:** [src/base/operation.ts:629](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L629)

### Operation.BumpSequence

```ts
type BumpSequence = BumpSequenceResult
```

**Source:** [src/base/operation.ts:626](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L626)

### Operation.ChangeTrust

```ts
type ChangeTrust = ChangeTrustResult
```

**Source:** [src/base/operation.ts:621](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L621)

### Operation.ClaimClaimableBalance

```ts
type ClaimClaimableBalance = ClaimClaimableBalanceResult
```

**Source:** [src/base/operation.ts:628](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L628)

### Operation.Clawback

```ts
type Clawback = ClawbackResult
```

**Source:** [src/base/operation.ts:641](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L641)

### Operation.ClawbackClaimableBalance

```ts
type ClawbackClaimableBalance = ClawbackClaimableBalanceResult
```

**Source:** [src/base/operation.ts:642](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L642)

### Operation.CreateAccount

```ts
type CreateAccount = CreateAccountResult
```

**Source:** [src/base/operation.ts:613](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L613)

### Operation.CreateClaimableBalance

```ts
type CreateClaimableBalance = CreateClaimableBalanceResult
```

**Source:** [src/base/operation.ts:627](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L627)

### Operation.CreatePassiveSellOffer

```ts
type CreatePassiveSellOffer = CreatePassiveSellOfferResult
```

**Source:** [src/base/operation.ts:617](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L617)

### Operation.EndSponsoringFutureReserves

```ts
type EndSponsoringFutureReserves = EndSponsoringFutureReservesResult
```

**Source:** [src/base/operation.ts:631](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L631)

### Operation.ExtendFootprintTTL

```ts
type ExtendFootprintTTL = ExtendFootprintTTLResult
```

**Source:** [src/base/operation.ts:647](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L647)

### Operation.Inflation

```ts
type Inflation = InflationResult
```

**Source:** [src/base/operation.ts:624](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L624)

### Operation.InvokeHostFunction

```ts
type InvokeHostFunction = InvokeHostFunctionResult
```

**Source:** [src/base/operation.ts:646](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L646)

### Operation.LiquidityPoolDeposit

```ts
type LiquidityPoolDeposit = LiquidityPoolDepositResult
```

**Source:** [src/base/operation.ts:644](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L644)

### Operation.LiquidityPoolWithdraw

```ts
type LiquidityPoolWithdraw = LiquidityPoolWithdrawResult
```

**Source:** [src/base/operation.ts:645](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L645)

### Operation.ManageBuyOffer

```ts
type ManageBuyOffer = ManageBuyOfferResult
```

**Source:** [src/base/operation.ts:619](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L619)

### Operation.ManageData

```ts
type ManageData = ManageDataResult
```

**Source:** [src/base/operation.ts:625](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L625)

### Operation.ManageSellOffer

```ts
type ManageSellOffer = ManageSellOfferResult
```

**Source:** [src/base/operation.ts:618](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L618)

### Operation.PathPaymentStrictReceive

```ts
type PathPaymentStrictReceive = PathPaymentStrictReceiveResult
```

**Source:** [src/base/operation.ts:615](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L615)

### Operation.PathPaymentStrictSend

```ts
type PathPaymentStrictSend = PathPaymentStrictSendResult
```

**Source:** [src/base/operation.ts:616](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L616)

### Operation.Payment

```ts
type Payment = PaymentResult
```

**Source:** [src/base/operation.ts:614](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L614)

### Operation.RestoreFootprint

```ts
type RestoreFootprint = RestoreFootprintResult
```

**Source:** [src/base/operation.ts:648](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L648)

### Operation.RevokeAccountSponsorship

```ts
type RevokeAccountSponsorship = RevokeAccountSponsorshipResult
```

**Source:** [src/base/operation.ts:632](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L632)

### Operation.RevokeClaimableBalanceSponsorship

```ts
type RevokeClaimableBalanceSponsorship = RevokeClaimableBalanceSponsorshipResult
```

**Source:** [src/base/operation.ts:636](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L636)

### Operation.RevokeDataSponsorship

```ts
type RevokeDataSponsorship = RevokeDataSponsorshipResult
```

**Source:** [src/base/operation.ts:635](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L635)

### Operation.RevokeLiquidityPoolSponsorship

```ts
type RevokeLiquidityPoolSponsorship = RevokeLiquidityPoolSponsorshipResult
```

**Source:** [src/base/operation.ts:638](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L638)

### Operation.RevokeOfferSponsorship

```ts
type RevokeOfferSponsorship = RevokeOfferSponsorshipResult
```

**Source:** [src/base/operation.ts:634](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L634)

### Operation.RevokeSignerSponsorship

```ts
type RevokeSignerSponsorship = RevokeSignerSponsorshipResult
```

**Source:** [src/base/operation.ts:640](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L640)

### Operation.RevokeTrustlineSponsorship

```ts
type RevokeTrustlineSponsorship = RevokeTrustlineSponsorshipResult
```

**Source:** [src/base/operation.ts:633](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L633)

### Operation.SetOptions

```ts
type SetOptions = SetOptionsResult<Signer>
```

**Source:** [src/base/operation.ts:620](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L620)

### Operation.SetTrustLineFlags

```ts
type SetTrustLineFlags = SetTrustLineFlagsResult
```

**Source:** [src/base/operation.ts:643](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operation.ts#L643)

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
  preAuthTx: Buffer;
  weight?: number;
}
```

**Source:** [src/base/operations/types.ts:485](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L485)

#### `preAuthTx.preAuthTx`

```ts
preAuthTx: Buffer;
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
  sha256Hash: Buffer;
  weight?: number;
}
```

**Source:** [src/base/operations/types.ts:481](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/operations/types.ts#L481)

#### `sha256Hash.sha256Hash`

```ts
sha256Hash: Buffer;
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

**Source:** [src/base/transaction_builder.ts:80](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L80)

#### `sorobanFees.instructions`

The number of instructions executed by the transaction.

```ts
instructions: number;
```

**Source:** [src/base/transaction_builder.ts:82](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L82)

#### `sorobanFees.readBytes`

The number of bytes read from the ledger by the transaction.

```ts
readBytes: number;
```

**Source:** [src/base/transaction_builder.ts:84](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L84)

#### `sorobanFees.resourceFee`

The fee to be paid for the transaction, in stroops.

```ts
resourceFee: bigint;
```

**Source:** [src/base/transaction_builder.ts:88](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L88)

#### `sorobanFees.writeBytes`

The number of bytes written to the ledger by the transaction.

```ts
writeBytes: number;
```

**Source:** [src/base/transaction_builder.ts:86](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/transaction_builder.ts#L86)

### TransactionSource

The contract that `TransactionBuilder` requires of a transaction's
source account: a way to read the account's address and sequence number, and
to advance the sequence number in place (the builder calls
`TransactionSource.incrementSequenceNumber` when it builds a
transaction).

Both the concrete `Account` and `MuxedAccount` classes implement
this, as does Horizon's `AccountResponse`. Implement it yourself if you manage
sequence numbers out-of-band (e.g. a server-side sequence pool) and want to
pass a custom source to `TransactionBuilder`.

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

Increments the sequence number in place by one. `TransactionBuilder`
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
