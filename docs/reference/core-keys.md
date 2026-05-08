---
title: Core / Keys
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
  constructor(keys: { publicKey?: string | Buffer<ArrayBufferLike>; secretKey: string | Buffer<ArrayBufferLike>; type: "ed25519" } | { publicKey: string | Buffer<ArrayBufferLike>; type: "ed25519" });
  static fromPublicKey(publicKey: string): Keypair;
  static fromRawEd25519Seed(rawSeed: Buffer): Keypair;
  static fromSecret(secret: string): Keypair;
  static master(networkPassphrase: string): Keypair;
  static random(): Keypair;
  readonly type: "ed25519";
  canSign(): boolean;
  publicKey(): string;
  rawPublicKey(): Buffer;
  rawSecretKey(): Buffer;
  secret(): string;
  sign(data: Buffer): Buffer;
  signatureHint(): Buffer;
  signDecorated(data: Buffer): DecoratedSignature;
  signPayloadDecorated(data: Buffer): DecoratedSignature;
  verify(data: Buffer, signature: Buffer): boolean;
  xdrAccountId(): PublicKey;
  xdrMuxedAccount(id?: string): MuxedAccount;
  xdrPublicKey(): PublicKey;
}
```

**Source:** [src/base/keypair.ts:21](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L21)

### `new Keypair(keys)`

```ts
constructor(keys: { publicKey?: string | Buffer<ArrayBufferLike>; secretKey: string | Buffer<ArrayBufferLike>; type: "ed25519" } | { publicKey: string | Buffer<ArrayBufferLike>; type: "ed25519" });
```

**Parameters**

- **`keys`** — `{ publicKey?: string | Buffer<ArrayBufferLike>; secretKey: string | Buffer<ArrayBufferLike>; type: "ed25519" } | { publicKey: string | Buffer<ArrayBufferLike>; type: "ed25519" }` (required) — at least one of keys must be provided.
    - `type`: public-key signature system name (currently only `ed25519` keys are supported)
    - `publicKey`: raw public key
    - `secretKey`: raw secret key (32-byte secret seed in ed25519)

**Source:** [src/base/keypair.ts:33](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L33)

### `Keypair.fromPublicKey(publicKey)`

Creates a new `Keypair` object from public key.

```ts
static fromPublicKey(publicKey: string): Keypair;
```

**Parameters**

- **`publicKey`** — `string` (required) — public key (ex. `GB3KJPLFUYN5VL6R3GU3EGCGVCKFDSD7BEDX42HWG5BWFKB3KQGJJRMA`)

**Source:** [src/base/keypair.ts:115](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L115)

### `Keypair.fromRawEd25519Seed(rawSeed)`

Creates a new `Keypair` object from ed25519 secret key seed raw bytes.

```ts
static fromRawEd25519Seed(rawSeed: Buffer): Keypair;
```

**Parameters**

- **`rawSeed`** — `Buffer` (required) — raw 32-byte ed25519 secret key seed

**Source:** [src/base/keypair.ts:93](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L93)

### `Keypair.fromSecret(secret)`

Creates a new `Keypair` instance from secret. This can either be secret key or secret seed depending
on underlying public-key signature system. Currently `Keypair` only supports ed25519.

```ts
static fromSecret(secret: string): Keypair;
```

**Parameters**

- **`secret`** — `string` (required) — secret key (ex. `SDAK....`)

**Source:** [src/base/keypair.ts:83](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L83)

### `Keypair.master(networkPassphrase)`

Returns `Keypair` object representing network master key.

```ts
static master(networkPassphrase: string): Keypair;
```

**Parameters**

- **`networkPassphrase`** — `string` (required) — passphrase of the target stellar network (e.g. "Public Global Stellar Network ; September 2015")

**Source:** [src/base/keypair.ts:101](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L101)

### `Keypair.random()`

Create a random `Keypair` object.

```ts
static random(): Keypair;
```

**Source:** [src/base/keypair.ts:127](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L127)

### `keypair.type`

```ts
readonly type: "ed25519";
```

**Source:** [src/base/keypair.ts:22](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L22)

### `keypair.canSign()`

Returns `true` if this `Keypair` object contains secret key and can sign.

```ts
canSign(): boolean;
```

**Source:** [src/base/keypair.ts:226](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L226)

### `keypair.publicKey()`

Returns public key associated with this `Keypair` object.

```ts
publicKey(): string;
```

**Source:** [src/base/keypair.ts:188](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L188)

### `keypair.rawPublicKey()`

Returns raw public key bytes

```ts
rawPublicKey(): Buffer;
```

**Source:** [src/base/keypair.ts:171](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L171)

### `keypair.rawSecretKey()`

Returns raw secret key bytes.

```ts
rawSecretKey(): Buffer;
```

**Throws**

- if no secret seed is available

**Source:** [src/base/keypair.ts:216](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L216)

### `keypair.secret()`

Returns secret key associated with this `Keypair` object.

The secret key is encoded in Stellar format (e.g., `SDAK....`).

```ts
secret(): string;
```

**Throws**

- if no secret key is available

**Source:** [src/base/keypair.ts:199](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L199)

### `keypair.sign(data)`

Signs data.

```ts
sign(data: Buffer): Buffer;
```

**Parameters**

- **`data`** — `Buffer` (required) — data to sign

**Throws**

- if no secret key is available

**Source:** [src/base/keypair.ts:236](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L236)

### `keypair.signatureHint()`

Returns the signature hint for this keypair.
The hint is the last 4 bytes of the account ID XDR representation.

```ts
signatureHint(): Buffer;
```

**Source:** [src/base/keypair.ts:179](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L179)

### `keypair.signDecorated(data)`

Returns the decorated signature (hint+sig) for arbitrary data.

The returned structure can be added directly to a transaction envelope.

```ts
signDecorated(data: Buffer): DecoratedSignature;
```

**Parameters**

- **`data`** — `Buffer` (required) — arbitrary data to sign

**See also**

- TransactionBase.addDecoratedSignature

**Source:** [src/base/keypair.ts:267](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L267)

### `keypair.signPayloadDecorated(data)`

Returns the raw decorated signature (hint+sig) for a signed payload signer.

 The hint is defined as the last 4 bytes of the signer key XORed with last
 4 bytes of the payload (zero-left-padded if necessary).

```ts
signPayloadDecorated(data: Buffer): DecoratedSignature;
```

**Parameters**

- **`data`** — `Buffer` (required) — data to both sign and treat as the payload

**See also**

- - https://github.com/stellar/stellar-protocol/blob/master/core/cap-0040.md#signature-hint
 - TransactionBase.addDecoratedSignature

**Source:** [src/base/keypair.ts:285](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L285)

### `keypair.verify(data, signature)`

Verifies if `signature` for `data` is valid.

```ts
verify(data: Buffer, signature: Buffer): boolean;
```

**Parameters**

- **`data`** — `Buffer` (required) — signed data
- **`signature`** — `Buffer` (required) — signature to verify

**Source:** [src/base/keypair.ts:250](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L250)

### `keypair.xdrAccountId()`

Returns this public key as an xdr.AccountId.

```ts
xdrAccountId(): PublicKey;
```

**Source:** [src/base/keypair.ts:133](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L133)

### `keypair.xdrMuxedAccount(id)`

Creates a `xdr.MuxedAccount` object from the public key.

You will get a different type of muxed account depending on whether or not
you pass an ID.

```ts
xdrMuxedAccount(id?: string): MuxedAccount;
```

**Parameters**

- **`id`** — `string` (optional) — (optional) stringified integer indicating the underlying muxed
      ID of the new account object

**Source:** [src/base/keypair.ts:151](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L151)

### `keypair.xdrPublicKey()`

Returns this public key as an xdr.PublicKey.

```ts
xdrPublicKey(): PublicKey;
```

**Source:** [src/base/keypair.ts:138](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/keypair.ts#L138)

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

**Source:** [src/base/signerkey.ts:19](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/signerkey.ts#L19)

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

**Source:** [src/base/signerkey.ts:28](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/signerkey.ts#L28)

### `SignerKey.encodeSignerKey(signerKey)`

Encodes a signer key into its StrKey equivalent.

```ts
static encodeSignerKey(signerKey: SignerKey): string;
```

**Parameters**

- **`signerKey`** — `SignerKey` (required) — the signer

**Source:** [src/base/signerkey.ts:63](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/signerkey.ts#L63)

## StrKey

StrKey is a helper class that allows encoding and decoding Stellar keys
to/from strings, i.e. between their binary (Buffer, xdr.PublicKey, etc.) and
string (i.e. "GABCD...", etc.) representations.

```ts
class StrKey {
  constructor();
  static types: Record<string, VersionByteName>;
  static decodeClaimableBalance(address: string): Buffer;
  static decodeContract(address: string): Buffer;
  static decodeEd25519PublicKey(data: string): Buffer;
  static decodeEd25519SecretSeed(address: string): Buffer;
  static decodeLiquidityPool(address: string): Buffer;
  static decodeMed25519PublicKey(address: string): Buffer;
  static decodePreAuthTx(address: string): Buffer;
  static decodeSha256Hash(address: string): Buffer;
  static decodeSignedPayload(address: string): Buffer;
  static encodeClaimableBalance(data: Buffer): string;
  static encodeContract(data: Buffer): string;
  static encodeEd25519PublicKey(data: Buffer): string;
  static encodeEd25519SecretSeed(data: Buffer): string;
  static encodeLiquidityPool(data: Buffer): string;
  static encodeMed25519PublicKey(data: Buffer): string;
  static encodePreAuthTx(data: Buffer): string;
  static encodeSha256Hash(data: Buffer): string;
  static encodeSignedPayload(data: Buffer): string;
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

**Source:** [src/base/strkey.ts:54](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L54)

### `new StrKey()`

```ts
constructor();
```

### `StrKey.types`

```ts
static types: Record<string, VersionByteName>;
```

**Source:** [src/base/strkey.ts:55](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L55)

### `StrKey.decodeClaimableBalance(address)`

Decodes strkey claimable balance (B...) to raw data.

```ts
static decodeClaimableBalance(address: string): Buffer;
```

**Parameters**

- **`address`** — `string` (required) — balance to decode

**Source:** [src/base/strkey.ts:245](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L245)

### `StrKey.decodeContract(address)`

Decodes strkey contract (C...) to raw data.

```ts
static decodeContract(address: string): Buffer;
```

**Parameters**

- **`address`** — `string` (required) — address to decode

**Source:** [src/base/strkey.ts:218](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L218)

### `StrKey.decodeEd25519PublicKey(data)`

Decodes strkey ed25519 public key to raw data.

If the parameter is a muxed account key ("M..."), this will only encode it
as a basic Ed25519 key (as if in "G..." format).

```ts
static decodeEd25519PublicKey(data: string): Buffer;
```

**Parameters**

- **`data`** — `string` (required) — "G..." (or "M...") key representation to decode

**Source:** [src/base/strkey.ts:74](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L74)

### `StrKey.decodeEd25519SecretSeed(address)`

Decodes strkey ed25519 seed to raw data.

```ts
static decodeEd25519SecretSeed(address: string): Buffer;
```

**Parameters**

- **`address`** — `string` (required) — data to decode

**Source:** [src/base/strkey.ts:101](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L101)

### `StrKey.decodeLiquidityPool(address)`

Decodes strkey liquidity pool (L...) to raw data.

```ts
static decodeLiquidityPool(address: string): Buffer;
```

**Parameters**

- **`address`** — `string` (required) — address to decode

**Source:** [src/base/strkey.ts:272](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L272)

### `StrKey.decodeMed25519PublicKey(address)`

Decodes strkey med25519 public key to raw data.

```ts
static decodeMed25519PublicKey(address: string): Buffer;
```

**Parameters**

- **`address`** — `string` (required) — data to decode

**Source:** [src/base/strkey.ts:128](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L128)

### `StrKey.decodePreAuthTx(address)`

Decodes strkey PreAuthTx to raw data.

```ts
static decodePreAuthTx(address: string): Buffer;
```

**Parameters**

- **`address`** — `string` (required) — data to decode

**Source:** [src/base/strkey.ts:155](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L155)

### `StrKey.decodeSha256Hash(address)`

Decodes strkey sha256 hash to raw data.

```ts
static decodeSha256Hash(address: string): Buffer;
```

**Parameters**

- **`address`** — `string` (required) — data to decode

**Source:** [src/base/strkey.ts:173](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L173)

### `StrKey.decodeSignedPayload(address)`

Decodes strkey signed payload (P...) to raw data.

```ts
static decodeSignedPayload(address: string): Buffer;
```

**Parameters**

- **`address`** — `string` (required) — address to decode

**Source:** [src/base/strkey.ts:191](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L191)

### `StrKey.encodeClaimableBalance(data)`

Encodes raw data to strkey claimable balance (B...).

```ts
static encodeClaimableBalance(data: Buffer): string;
```

**Parameters**

- **`data`** — `Buffer` (required) — data to encode

**Source:** [src/base/strkey.ts:236](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L236)

### `StrKey.encodeContract(data)`

Encodes raw data to strkey contract (C...).

```ts
static encodeContract(data: Buffer): string;
```

**Parameters**

- **`data`** — `Buffer` (required) — data to encode

**Source:** [src/base/strkey.ts:209](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L209)

### `StrKey.encodeEd25519PublicKey(data)`

Encodes `data` to strkey ed25519 public key.

```ts
static encodeEd25519PublicKey(data: Buffer): string;
```

**Parameters**

- **`data`** — `Buffer` (required) — raw data to encode

**Source:** [src/base/strkey.ts:62](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L62)

### `StrKey.encodeEd25519SecretSeed(data)`

Encodes data to strkey ed25519 seed.

```ts
static encodeEd25519SecretSeed(data: Buffer): string;
```

**Parameters**

- **`data`** — `Buffer` (required) — data to encode

**Source:** [src/base/strkey.ts:92](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L92)

### `StrKey.encodeLiquidityPool(data)`

Encodes raw data to strkey liquidity pool (L...).

```ts
static encodeLiquidityPool(data: Buffer): string;
```

**Parameters**

- **`data`** — `Buffer` (required) — data to encode

**Source:** [src/base/strkey.ts:263](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L263)

### `StrKey.encodeMed25519PublicKey(data)`

Encodes data to strkey med25519 public key.

```ts
static encodeMed25519PublicKey(data: Buffer): string;
```

**Parameters**

- **`data`** — `Buffer` (required) — data to encode

**Source:** [src/base/strkey.ts:119](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L119)

### `StrKey.encodePreAuthTx(data)`

Encodes data to strkey preAuthTx.

```ts
static encodePreAuthTx(data: Buffer): string;
```

**Parameters**

- **`data`** — `Buffer` (required) — data to encode

**Source:** [src/base/strkey.ts:146](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L146)

### `StrKey.encodeSha256Hash(data)`

Encodes data to strkey sha256 hash.

```ts
static encodeSha256Hash(data: Buffer): string;
```

**Parameters**

- **`data`** — `Buffer` (required) — data to encode

**Source:** [src/base/strkey.ts:164](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L164)

### `StrKey.encodeSignedPayload(data)`

Encodes raw data to strkey signed payload (P...).

```ts
static encodeSignedPayload(data: Buffer): string;
```

**Parameters**

- **`data`** — `Buffer` (required) — data to encode

**Source:** [src/base/strkey.ts:182](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L182)

### `StrKey.getVersionByteForPrefix(address)`

Returns the strkey type based on the prefix of the given strkey address,
or undefined if the prefix is invalid.

```ts
static getVersionByteForPrefix(address: string): VersionByteName | undefined;
```

**Parameters**

- **`address`** — `string` (required) — the strkey address to check

**Source:** [src/base/strkey.ts:291](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L291)

### `StrKey.isValidClaimableBalance(address)`

Checks validity of alleged claimable balance (B...) strkey address.

```ts
static isValidClaimableBalance(address: string): boolean;
```

**Parameters**

- **`address`** — `string` (required) — balance to check

**Source:** [src/base/strkey.ts:254](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L254)

### `StrKey.isValidContract(address)`

Checks validity of alleged contract (C...) strkey address.

```ts
static isValidContract(address: string): boolean;
```

**Parameters**

- **`address`** — `string` (required) — signer key to check

**Source:** [src/base/strkey.ts:227](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L227)

### `StrKey.isValidEd25519PublicKey(publicKey)`

Returns true if the given Stellar public key is a valid ed25519 public key.

```ts
static isValidEd25519PublicKey(publicKey: string): boolean;
```

**Parameters**

- **`publicKey`** — `string` (required) — public key to check

**Source:** [src/base/strkey.ts:83](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L83)

### `StrKey.isValidEd25519SecretSeed(seed)`

Returns true if the given Stellar secret key is a valid ed25519 secret seed.

```ts
static isValidEd25519SecretSeed(seed: string): boolean;
```

**Parameters**

- **`seed`** — `string` (required) — seed to check

**Source:** [src/base/strkey.ts:110](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L110)

### `StrKey.isValidLiquidityPool(address)`

Checks validity of alleged liquidity pool (L...) strkey address.

```ts
static isValidLiquidityPool(address: string): boolean;
```

**Parameters**

- **`address`** — `string` (required) — pool to check

**Source:** [src/base/strkey.ts:281](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L281)

### `StrKey.isValidMed25519PublicKey(publicKey)`

Returns true if the given Stellar public key is a valid med25519 public key.

```ts
static isValidMed25519PublicKey(publicKey: string): boolean;
```

**Parameters**

- **`publicKey`** — `string` (required) — public key to check

**Source:** [src/base/strkey.ts:137](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L137)

### `StrKey.isValidSignedPayload(address)`

Checks validity of alleged signed payload (P...) strkey address.

```ts
static isValidSignedPayload(address: string): boolean;
```

**Parameters**

- **`address`** — `string` (required) — signer key to check

**Source:** [src/base/strkey.ts:200](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/strkey.ts#L200)

## sign

Signs data using an Ed25519 secret key.

```ts
sign(data: Buffer, rawSecret: Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>): Buffer
```

**Parameters**

- **`data`** — `Buffer` (required) — the data to sign
- **`rawSecret`** — `Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>` (required) — the raw Ed25519 secret key

**Source:** [src/base/signing.ts:20](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/signing.ts#L20)

## verify

Verifies an Ed25519 signature against the given data and public key.

```ts
verify(data: Buffer, signature: Buffer, rawPublicKey: Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>): boolean
```

**Parameters**

- **`data`** — `Buffer` (required) — the original signed data
- **`signature`** — `Buffer` (required) — the signature to verify
- **`rawPublicKey`** — `Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>` (required) — the raw Ed25519 public key

**Source:** [src/base/signing.ts:31](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/signing.ts#L31)
