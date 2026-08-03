---
title: Core / Keys
description: Public/private keypair handling — generate, sign, verify, and encode keys as Stellar strkeys.
---

# Core / Keys

## Keypair

`Keypair` represents public (and secret) keys of the account.

Currently `Keypair` only supports ed25519 but in a future this class can be abstraction layer for other
public-key signature systems.

Use more convenient methods to create `Keypair` object:
* [`Keypair.fromPublicKey`](#keypairfrompublickeypublickey)
* [`Keypair.fromSecret`](#keypairfromsecretsecret)
* [`Keypair.random`](#keypairrandom)

```ts
class Keypair {
  constructor(keys: { publicKey?: string | Uint8Array<ArrayBufferLike>; secretKey: string | Uint8Array<ArrayBufferLike>; type: "ed25519" } | { publicKey: string | Uint8Array<ArrayBufferLike>; type: "ed25519" });
  static fromPublicKey(publicKey: string): Keypair;
  static fromRawEd25519Seed(rawSeed: Uint8Array): Keypair;
  static fromSecret(secret: string): Keypair;
  static master(networkPassphrase: string): Keypair;
  static random(): Keypair;
  readonly type: "ed25519";
  canSign(): boolean;
  publicKey(): string;
  rawPublicKey(): Uint8Array;
  rawSecretKey(): Uint8Array;
  secret(): string;
  sign(data: Uint8Array): Uint8Array;
  signatureHint(): Uint8Array;
  signDecorated(data: Uint8Array): DecoratedSignature;
  signMessage(message: string | Uint8Array<ArrayBufferLike>): Uint8Array;
  signPayloadDecorated(data: Uint8Array): DecoratedSignature;
  verify(data: Uint8Array, signature: Uint8Array): boolean;
  verifyMessage(message: string | Uint8Array<ArrayBufferLike>, signature: Uint8Array): boolean;
  xdrAccountId(): PublicKeyEd25519;
  xdrMuxedAccount(id?: string): MuxedAccount;
  xdrPublicKey(): PublicKeyEd25519;
}
```

**Source:** [src/base/keypair.ts:48](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L48)

### `new Keypair(keys)`

```ts
constructor(keys: { publicKey?: string | Uint8Array<ArrayBufferLike>; secretKey: string | Uint8Array<ArrayBufferLike>; type: "ed25519" } | { publicKey: string | Uint8Array<ArrayBufferLike>; type: "ed25519" });
```

**Parameters**

- **`keys`** — `{ publicKey?: string | Uint8Array<ArrayBufferLike>; secretKey: string | Uint8Array<ArrayBufferLike>; type: "ed25519" } | { publicKey: string | Uint8Array<ArrayBufferLike>; type: "ed25519" }` (required) — at least one of keys must be provided.

**Source:** [src/base/keypair.ts:60](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L60)

### `Keypair.fromPublicKey(publicKey)`

Creates a new `Keypair` object from public key.

```ts
static fromPublicKey(publicKey: string): Keypair;
```

**Parameters**

- **`publicKey`** — `string` (required) — public key (ex. `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`)

**Source:** [src/base/keypair.ts:142](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L142)

### `Keypair.fromRawEd25519Seed(rawSeed)`

Creates a new `Keypair` object from ed25519 secret key seed raw bytes.

```ts
static fromRawEd25519Seed(rawSeed: Uint8Array): Keypair;
```

**Parameters**

- **`rawSeed`** — `Uint8Array` (required) — raw 32-byte ed25519 secret key seed

**Source:** [src/base/keypair.ts:120](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L120)

### `Keypair.fromSecret(secret)`

Creates a new `Keypair` instance from secret. This can either be secret key or secret seed depending
on underlying public-key signature system. Currently `Keypair` only supports ed25519.

```ts
static fromSecret(secret: string): Keypair;
```

**Parameters**

- **`secret`** — `string` (required) — secret key (ex. `SDAK....`)

**Source:** [src/base/keypair.ts:110](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L110)

### `Keypair.master(networkPassphrase)`

Returns `Keypair` object representing network master key.

```ts
static master(networkPassphrase: string): Keypair;
```

**Parameters**

- **`networkPassphrase`** — `string` (required) — passphrase of the target stellar network (e.g. "Public Global Stellar Network ; September 2015")

**Source:** [src/base/keypair.ts:128](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L128)

### `Keypair.random()`

Create a random `Keypair` object.

```ts
static random(): Keypair;
```

**Source:** [src/base/keypair.ts:154](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L154)

### `keypair.type`

```ts
readonly type: "ed25519";
```

**Source:** [src/base/keypair.ts:49](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L49)

### `keypair.canSign()`

Returns `true` if this `Keypair` object contains secret key and can sign.

```ts
canSign(): boolean;
```

**Source:** [src/base/keypair.ts:253](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L253)

### `keypair.publicKey()`

Returns public key associated with this `Keypair` object.

```ts
publicKey(): string;
```

**Source:** [src/base/keypair.ts:215](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L215)

### `keypair.rawPublicKey()`

Returns raw public key bytes

```ts
rawPublicKey(): Uint8Array;
```

**Source:** [src/base/keypair.ts:198](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L198)

### `keypair.rawSecretKey()`

Returns raw secret key bytes.

```ts
rawSecretKey(): Uint8Array;
```

**Throws**

- if no secret seed is available

**Source:** [src/base/keypair.ts:243](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L243)

### `keypair.secret()`

Returns secret key associated with this `Keypair` object.

The secret key is encoded in Stellar format (e.g., `SDAK....`).

```ts
secret(): string;
```

**Throws**

- if no secret key is available

**Source:** [src/base/keypair.ts:226](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L226)

### `keypair.sign(data)`

Signs data.

```ts
sign(data: Uint8Array): Uint8Array;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — data to sign

**Throws**

- if no secret key is available

**Source:** [src/base/keypair.ts:263](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L263)

### `keypair.signatureHint()`

Returns the signature hint for this keypair.
The hint is the last 4 bytes of the account ID XDR representation.

```ts
signatureHint(): Uint8Array;
```

**Source:** [src/base/keypair.ts:206](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L206)

### `keypair.signDecorated(data)`

Returns the decorated signature (hint+sig) for arbitrary data.

The returned structure can be added directly to a transaction envelope.

```ts
signDecorated(data: Uint8Array): DecoratedSignature;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — arbitrary data to sign

**See also**

- TransactionBase.addDecoratedSignature

**Source:** [src/base/keypair.ts:337](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L337)

### `keypair.signMessage(message)`

Signs an arbitrary message per SEP-53.

The message is UTF-8 encoded (if a string), prefixed with the fixed
`"Stellar Signed Message:\n"` marker, hashed with SHA-256, and that hash is
signed with this keypair's ed25519 secret key.

```ts
signMessage(message: string | Uint8Array<ArrayBufferLike>): Uint8Array;
```

**Parameters**

- **`message`** — `string | Uint8Array<ArrayBufferLike>` (required) — the message to sign (a UTF-8 string or raw bytes)

**Returns**

the 64-byte ed25519 signature

**Throws**

- if no secret key is available

**See also**

- https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md

**Source:** [src/base/keypair.ts:297](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L297)

### `keypair.signPayloadDecorated(data)`

Returns the raw decorated signature (hint+sig) for a signed payload signer.

 The hint is defined as the last 4 bytes of the signer key XORed with last
 4 bytes of the payload (zero-left-padded if necessary).

```ts
signPayloadDecorated(data: Uint8Array): DecoratedSignature;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — data to both sign and treat as the payload

**See also**

- - https://github.com/stellar/stellar-protocol/blob/master/core/cap-0040.md#signature-hint
 - TransactionBase.addDecoratedSignature

**Source:** [src/base/keypair.ts:355](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L355)

### `keypair.verify(data, signature)`

Verifies if `signature` for `data` is valid.

```ts
verify(data: Uint8Array, signature: Uint8Array): boolean;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — signed data
- **`signature`** — `Uint8Array` (required) — signature to verify

**Source:** [src/base/keypair.ts:277](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L277)

### `keypair.verifyMessage(message, signature)`

Verifies a SEP-53 signed message against this keypair's public key.

```ts
verifyMessage(message: string | Uint8Array<ArrayBufferLike>, signature: Uint8Array): boolean;
```

**Parameters**

- **`message`** — `string | Uint8Array<ArrayBufferLike>` (required) — the original message (a UTF-8 string or raw bytes)
- **`signature`** — `Uint8Array` (required) — the 64-byte signature to verify

**Returns**

`true` if `signature` is valid for `message` and this key

**See also**

- https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md

**Source:** [src/base/keypair.ts:309](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L309)

### `keypair.xdrAccountId()`

Returns this public key as an xdr.AccountId.

```ts
xdrAccountId(): PublicKeyEd25519;
```

**Source:** [src/base/keypair.ts:160](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L160)

### `keypair.xdrMuxedAccount(id)`

Creates a `xdr.MuxedAccount` object from the public key.

You will get a different type of muxed account depending on whether or not
you pass an ID.

```ts
xdrMuxedAccount(id?: string): MuxedAccount;
```

**Parameters**

- **`id`** — `string` (optional) — stringified integer indicating the underlying muxed
      ID of the new account object

**Source:** [src/base/keypair.ts:178](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L178)

### `keypair.xdrPublicKey()`

Returns this public key as an xdr.PublicKey.

```ts
xdrPublicKey(): PublicKeyEd25519;
```

**Source:** [src/base/keypair.ts:165](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/keypair.ts#L165)

## SignerKey

A container class with helpers to convert between signer keys
(`xdr.SignerKey`) and `StrKey`s.

It's primarily used for manipulating the `extraSigners` precondition on a
`Transaction`.

```ts
class SignerKey {
  constructor();
  static decodeAddress(address: string): SignerKey;
  static encodeSignerKey(signerKey: SignerKey): string;
}
```

**See also**

- `TransactionBuilder.setExtraSigners`

**Source:** [src/base/signerkey.ts:22](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/signerkey.ts#L22)

### `new SignerKey()`

```ts
constructor();
```

### `SignerKey.decodeAddress(address)`

Decodes a StrKey address into an xdr.SignerKey instance.

Only ED25519 public keys (G...), pre-auth transactions (T...), hashes
(H...), and signed payloads (P...) can be signer keys.

```ts
static decodeAddress(address: string): SignerKey;
```

**Parameters**

- **`address`** — `string` (required) — a StrKey-encoded signer address

**Source:** [src/base/signerkey.ts:31](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/signerkey.ts#L31)

### `SignerKey.encodeSignerKey(signerKey)`

Encodes a signer key into its StrKey equivalent.

```ts
static encodeSignerKey(signerKey: SignerKey): string;
```

**Parameters**

- **`signerKey`** — `SignerKey` (required) — the signer

**Source:** [src/base/signerkey.ts:72](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/signerkey.ts#L72)

## StrKey

StrKey is a helper class that allows encoding and decoding Stellar keys
to/from strings, i.e. between their binary (Uint8Array, xdr.PublicKey, etc.) and
string (i.e. "GABCD...", etc.) representations.

```ts
class StrKey {
  constructor();
  static types: Record<string, VersionByteName>;
  static decodeClaimableBalance(address: string): Uint8Array;
  static decodeContract(address: string): Uint8Array;
  static decodeEd25519PublicKey(data: string): Uint8Array;
  static decodeEd25519SecretSeed(address: string): Uint8Array;
  static decodeLiquidityPool(address: string): Uint8Array;
  static decodeMed25519PublicKey(address: string): Uint8Array;
  static decodePreAuthTx(address: string): Uint8Array;
  static decodeSha256Hash(address: string): Uint8Array;
  static decodeSignedPayload(address: string): Uint8Array;
  static encodeClaimableBalance(data: Uint8Array): string;
  static encodeContract(data: Uint8Array): string;
  static encodeEd25519PublicKey(data: Uint8Array): string;
  static encodeEd25519SecretSeed(data: Uint8Array): string;
  static encodeLiquidityPool(data: Uint8Array): string;
  static encodeMed25519PublicKey(data: Uint8Array): string;
  static encodePreAuthTx(data: Uint8Array): string;
  static encodeSha256Hash(data: Uint8Array): string;
  static encodeSignedPayload(data: Uint8Array): string;
  static getVersionByteForPrefix(address: string): VersionByteName | undefined;
  static isValidClaimableBalance(address: string): boolean;
  static isValidContract(address: string): boolean;
  static isValidEd25519PublicKey(publicKey: string): boolean;
  static isValidEd25519SecretSeed(seed: string): boolean;
  static isValidLiquidityPool(address: string): boolean;
  static isValidMed25519PublicKey(publicKey: string): boolean;
  static isValidSignedPayload(address: string): boolean;
}
```

**Source:** [src/base/strkey.ts:74](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L74)

### `new StrKey()`

```ts
constructor();
```

### `StrKey.types`

```ts
static types: Record<string, VersionByteName>;
```

**Source:** [src/base/strkey.ts:75](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L75)

### `StrKey.decodeClaimableBalance(address)`

Decodes strkey claimable balance (B...) to raw data.

```ts
static decodeClaimableBalance(address: string): Uint8Array;
```

**Parameters**

- **`address`** — `string` (required) — balance to decode

**Source:** [src/base/strkey.ts:265](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L265)

### `StrKey.decodeContract(address)`

Decodes strkey contract (C...) to raw data.

```ts
static decodeContract(address: string): Uint8Array;
```

**Parameters**

- **`address`** — `string` (required) — address to decode

**Source:** [src/base/strkey.ts:238](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L238)

### `StrKey.decodeEd25519PublicKey(data)`

Decodes strkey ed25519 public key to raw data.

If the parameter is a muxed account key ("M..."), this will only encode it
as a basic Ed25519 key (as if in "G..." format).

```ts
static decodeEd25519PublicKey(data: string): Uint8Array;
```

**Parameters**

- **`data`** — `string` (required) — "G..." (or "M...") key representation to decode

**Source:** [src/base/strkey.ts:94](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L94)

### `StrKey.decodeEd25519SecretSeed(address)`

Decodes strkey ed25519 seed to raw data.

```ts
static decodeEd25519SecretSeed(address: string): Uint8Array;
```

**Parameters**

- **`address`** — `string` (required) — data to decode

**Source:** [src/base/strkey.ts:121](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L121)

### `StrKey.decodeLiquidityPool(address)`

Decodes strkey liquidity pool (L...) to raw data.

```ts
static decodeLiquidityPool(address: string): Uint8Array;
```

**Parameters**

- **`address`** — `string` (required) — address to decode

**Source:** [src/base/strkey.ts:292](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L292)

### `StrKey.decodeMed25519PublicKey(address)`

Decodes strkey med25519 public key to raw data.

```ts
static decodeMed25519PublicKey(address: string): Uint8Array;
```

**Parameters**

- **`address`** — `string` (required) — data to decode

**Source:** [src/base/strkey.ts:148](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L148)

### `StrKey.decodePreAuthTx(address)`

Decodes strkey PreAuthTx to raw data.

```ts
static decodePreAuthTx(address: string): Uint8Array;
```

**Parameters**

- **`address`** — `string` (required) — data to decode

**Source:** [src/base/strkey.ts:175](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L175)

### `StrKey.decodeSha256Hash(address)`

Decodes strkey sha256 hash to raw data.

```ts
static decodeSha256Hash(address: string): Uint8Array;
```

**Parameters**

- **`address`** — `string` (required) — data to decode

**Source:** [src/base/strkey.ts:193](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L193)

### `StrKey.decodeSignedPayload(address)`

Decodes strkey signed payload (P...) to raw data.

```ts
static decodeSignedPayload(address: string): Uint8Array;
```

**Parameters**

- **`address`** — `string` (required) — address to decode

**Source:** [src/base/strkey.ts:211](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L211)

### `StrKey.encodeClaimableBalance(data)`

Encodes raw data to strkey claimable balance (B...).

```ts
static encodeClaimableBalance(data: Uint8Array): string;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — data to encode

**Source:** [src/base/strkey.ts:256](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L256)

### `StrKey.encodeContract(data)`

Encodes raw data to strkey contract (C...).

```ts
static encodeContract(data: Uint8Array): string;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — data to encode

**Source:** [src/base/strkey.ts:229](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L229)

### `StrKey.encodeEd25519PublicKey(data)`

Encodes `data` to strkey ed25519 public key.

```ts
static encodeEd25519PublicKey(data: Uint8Array): string;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — raw data to encode

**Source:** [src/base/strkey.ts:82](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L82)

### `StrKey.encodeEd25519SecretSeed(data)`

Encodes data to strkey ed25519 seed.

```ts
static encodeEd25519SecretSeed(data: Uint8Array): string;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — data to encode

**Source:** [src/base/strkey.ts:112](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L112)

### `StrKey.encodeLiquidityPool(data)`

Encodes raw data to strkey liquidity pool (L...).

```ts
static encodeLiquidityPool(data: Uint8Array): string;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — data to encode

**Source:** [src/base/strkey.ts:283](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L283)

### `StrKey.encodeMed25519PublicKey(data)`

Encodes data to strkey med25519 public key.

```ts
static encodeMed25519PublicKey(data: Uint8Array): string;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — data to encode

**Source:** [src/base/strkey.ts:139](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L139)

### `StrKey.encodePreAuthTx(data)`

Encodes data to strkey preAuthTx.

```ts
static encodePreAuthTx(data: Uint8Array): string;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — data to encode

**Source:** [src/base/strkey.ts:166](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L166)

### `StrKey.encodeSha256Hash(data)`

Encodes data to strkey sha256 hash.

```ts
static encodeSha256Hash(data: Uint8Array): string;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — data to encode

**Source:** [src/base/strkey.ts:184](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L184)

### `StrKey.encodeSignedPayload(data)`

Encodes raw data to strkey signed payload (P...).

```ts
static encodeSignedPayload(data: Uint8Array): string;
```

**Parameters**

- **`data`** — `Uint8Array` (required) — data to encode

**Source:** [src/base/strkey.ts:202](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L202)

### `StrKey.getVersionByteForPrefix(address)`

Returns the strkey type based on the prefix of the given strkey address,
or undefined if the prefix is invalid.

```ts
static getVersionByteForPrefix(address: string): VersionByteName | undefined;
```

**Parameters**

- **`address`** — `string` (required) — the strkey address to check

**Source:** [src/base/strkey.ts:311](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L311)

### `StrKey.isValidClaimableBalance(address)`

Checks validity of alleged claimable balance (B...) strkey address.

```ts
static isValidClaimableBalance(address: string): boolean;
```

**Parameters**

- **`address`** — `string` (required) — balance to check

**Source:** [src/base/strkey.ts:274](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L274)

### `StrKey.isValidContract(address)`

Checks validity of alleged contract (C...) strkey address.

```ts
static isValidContract(address: string): boolean;
```

**Parameters**

- **`address`** — `string` (required) — signer key to check

**Source:** [src/base/strkey.ts:247](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L247)

### `StrKey.isValidEd25519PublicKey(publicKey)`

Returns true if the given Stellar public key is a valid ed25519 public key.

```ts
static isValidEd25519PublicKey(publicKey: string): boolean;
```

**Parameters**

- **`publicKey`** — `string` (required) — public key to check

**Source:** [src/base/strkey.ts:103](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L103)

### `StrKey.isValidEd25519SecretSeed(seed)`

Returns true if the given Stellar secret key is a valid ed25519 secret seed.

```ts
static isValidEd25519SecretSeed(seed: string): boolean;
```

**Parameters**

- **`seed`** — `string` (required) — seed to check

**Source:** [src/base/strkey.ts:130](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L130)

### `StrKey.isValidLiquidityPool(address)`

Checks validity of alleged liquidity pool (L...) strkey address.

```ts
static isValidLiquidityPool(address: string): boolean;
```

**Parameters**

- **`address`** — `string` (required) — pool to check

**Source:** [src/base/strkey.ts:301](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L301)

### `StrKey.isValidMed25519PublicKey(publicKey)`

Returns true if the given Stellar public key is a valid med25519 public key.

```ts
static isValidMed25519PublicKey(publicKey: string): boolean;
```

**Parameters**

- **`publicKey`** — `string` (required) — public key to check

**Source:** [src/base/strkey.ts:157](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L157)

### `StrKey.isValidSignedPayload(address)`

Checks validity of alleged signed payload (P...) strkey address.

```ts
static isValidSignedPayload(address: string): boolean;
```

**Parameters**

- **`address`** — `string` (required) — signer key to check

**Source:** [src/base/strkey.ts:220](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/strkey.ts#L220)

## sign

Signs data using an Ed25519 secret key.

```ts
sign(data: Uint8Array, rawSecret: Uint8Array): Uint8Array
```

**Parameters**

- **`data`** — `Uint8Array` (required) — the data to sign
- **`rawSecret`** — `Uint8Array` (required) — the raw Ed25519 secret key

**Source:** [src/base/signing.ts:20](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/signing.ts#L20)

## verify

Verifies an Ed25519 signature against the given data and public key.

```ts
verify(data: Uint8Array, signature: Uint8Array, rawPublicKey: Uint8Array): boolean
```

**Parameters**

- **`data`** — `Uint8Array` (required) — the original signed data
- **`signature`** — `Uint8Array` (required) — the signature to verify
- **`rawPublicKey`** — `Uint8Array` (required) — the raw Ed25519 public key

**Source:** [src/base/signing.ts:31](https://github.com/stellar/js-stellar-sdk/blob/main/src/base/signing.ts#L31)
