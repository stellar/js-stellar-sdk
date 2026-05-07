---
title: Core / Keys
category: Core / Keys
---

# Core / Keys

## Keypair

`Keypair` represents public (and secret) keys of the account.

Currently `Keypair` only supports ed25519 but in a future this class can be abstraction layer for other
public-key signature systems.

Use more convenient methods to create `Keypair` object:
* `{@link Keypair.fromPublicKey}`
* `{@link Keypair.fromSecret}`
* `{@link Keypair.random}`

```ts
class Keypair
```

**Source:** [src/base/keypair.ts:21](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/keypair.ts#L21)

## SignerKey

A container class with helpers to convert between signer keys
(`xdr.SignerKey`) and {@link StrKey}s.

It's primarily used for manipulating the `extraSigners` precondition on a
{@link Transaction}.

```ts
class SignerKey
```

**Source:** [src/base/signerkey.ts:19](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/signerkey.ts#L19)

## StrKey

StrKey is a helper class that allows encoding and decoding Stellar keys
to/from strings, i.e. between their binary (Buffer, xdr.PublicKey, etc.) and
string (i.e. "GABCD...", etc.) representations.

```ts
class StrKey
```

**Source:** [src/base/strkey.ts:54](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/strkey.ts#L54)

## sign

Signs data using an Ed25519 secret key.

```ts
sign(data: Buffer, rawSecret: Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>): Buffer
```

**Source:** [src/base/signing.ts:20](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/signing.ts#L20)

## verify

Verifies an Ed25519 signature against the given data and public key.

```ts
verify(data: Buffer, signature: Buffer, rawPublicKey: Uint8Array<ArrayBufferLike> | Buffer<ArrayBufferLike>): boolean
```

**Source:** [src/base/signing.ts:31](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/base/signing.ts#L31)
