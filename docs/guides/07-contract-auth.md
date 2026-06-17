---
title: Authorize a Contract Call
description:
  Sign the authorization an account other than the transaction source must
  provide for a contract call, using the SDK's Soroban authorization path so the
  same code is correct on the legacy ADDRESS credential and the new AddressV2.
---

# Authorize a Contract Call

Some contract calls must be authorized by an account other than the one sending
the transaction: a token `transfer` the sender does not own, a withdrawal from a
smart wallet, a payment routed through x402 or MPP. This guide signs that
authorization, using the path that stays correct as Stellar moves to its new
credential, **AddressV2**, which writes the signer's address into the signed
bytes (it is "address-bound"). Everything runs on testnet, so it is free and safe
to repeat.

## What this guide is for

This guide is for code that **signs Soroban contract authorization entries
itself** by building the signature payload by hand: smart wallets, custom
signers, and integrations like x402 or MPP. That is the one kind of code AddressV2
affects.

It is **not** for:

- **Classic Stellar apps** (payments, trustlines, no contract calls). AddressV2
  does not touch classic transaction signing, so nothing here applies to you.
- **Apps that let the SDK sign their contract calls** (the
  [`contract.Client`](/reference/contracts-client/#contractclient) flow from
  [Invoke a Contract](/guides/06-invoke-a-contract/),
  [`basicNodeSigner`](/reference/contracts-client/#contractbasicnodesigner), or
  [`authorizeEntry`](/reference/core-soroban-primitives/#authorizeentry)).
  **Bump to the Protocol 27 SDK and change nothing.** Those paths build the
  correct payload for whichever credential they are handed, so they sign `ADDRESS`
  today and `AddressV2` after the flip with no code change.
- **Apps that build entries from scratch with
  [`authorizeInvocation`](/reference/core-soroban-primitives/#authorizeinvocation).**
  This is the exception: it *constructs* the credential rather than being handed
  one, so it does not auto-flip. It builds legacy `ADDRESS` by default and emits
  `AddressV2` only when you pass `authV2: true` (valid on Protocol 27+ networks).
  See the [Protocol 27 auth guide](/guides/00-protocol-27-soroban-auth/) for the
  opt-in flag.

> **What Protocol 27 changes.** Protocol 27 introduces `AddressV2`, an
> address-bound Soroban authorization credential
> ([CAP-0071-02](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0071-02.md)).
> Once Protocol 27 is live on a network (testnet first), Stellar Core accepts
> `AddressV2`. But RPC simulation still hands you the legacy `ADDRESS` credential
> by default; that default flips to `AddressV2` at Protocol 28 (see the
> [Protocol 27 upgrade guide](https://stellar.org/blog/foundation-news/stellar-zipper-protocol-27-upgrade-guide)).
> The signing path here builds the correct payload from whichever credential an
> entry carries, so the same code is right on today's `ADDRESS` and on `AddressV2`
> after the flip, with no change from you.

## Two signatures, not one

An invoke transaction can carry two kinds of signature, and AddressV2 touches only
one of them.

The **envelope signature** is the transaction source signing the whole
transaction hash with `tx.sign(keypair)`, the same call as in
[Send a Payment](/guides/02-send-a-payment/). It authorizes the source to submit
the transaction and pay its fee, and it covers the `InvokeHostFunction` operation
itself. AddressV2 does not change it.

The **authorization signature** is separate. Contracts mark the parts of a call
that need consent by calling `require_auth()` on an address. Each such address
gets its own authorization entry (a `SorobanAuthorizationEntry`): a small signed
object that approves this one invocation. If that address is the transaction
source, the envelope signature already covers it and there is nothing extra to do.
If it is a different account, that account signs its own authorization entry, and
that entry's payload is the only thing AddressV2 changes. This guide is about that
second signature.

| | Envelope signature | Authorization-entry signature |
|---|---|---|
| Who signs | the transaction source (plus classic multisig signers) | each address a contract calls `require_auth` on, when it is not the source |
| What it signs | the transaction hash (the whole tx, including the invoke op) | one invocation, per authorizing address |
| API | `tx.sign` / `signTransaction` | `signAuthEntries`, `authorizeEntry` |
| AddressV2 | unchanged | payload becomes address-bound |

AddressV2 lives only in the authorization-entry payload, and only for an address
that is not the transaction source. A source-account authorization carries no
separate signature, so it is unaffected.

## Prerequisites

- A funded testnet account and its keypair. If you need one, see
  [Connect and Fund an Account](/guides/01-connect-and-fund/).
- A second funded account whose authorization a call requires (the examples call
  it `signer`).
- A deployed contract with a method that calls `require_auth` on an address
  argument. The examples use the Stellar
  [Auth example contract](https://developers.stellar.org/docs/build/smart-contracts/example-contracts/auth)
  (`increment(user, value)` calls `user.require_auth()`). Deploying is a one-time
  setup with the Stellar CLI, the same path as
  [Invoke a Contract](/guides/06-invoke-a-contract/).
- You have read [Invoke a Contract](/guides/06-invoke-a-contract/); this guide
  builds on its `contract.Client` flow and does not repeat it.

## Sign a non-source authorization entry

When a call requires another account's authorization, simulation returns an
authorization entry that account must sign. Build the transaction as in
[Invoke a Contract](/guides/06-invoke-a-contract/), then ask which accounts still
need to sign:

```ts
const tx = await (client as any).increment({ user: signer.publicKey(), value: 1 });

tx.needsNonInvokerSigningBy(); // [signer.publicKey()]
```

Awaiting the method call simulates it, which is what populates the authorization
entries; `needsNonInvokerSigningBy` then reads them back, skipping source-account
credentials because the envelope covers those. Delegate the signing to the SDK
with
[`signAuthEntries`](/reference/contracts-client/#contractassembledtransaction) and
a `signAuthEntry` callback.
[`basicNodeSigner`](/reference/contracts-client/#contractbasicnodesigner) is the
simple Node signer (a browser app swaps in a wallet such as Freighter):

```ts
const { signAuthEntry } = contract.basicNodeSigner(signer, networkPassphrase);

await tx.signAuthEntries({ address: signer.publicKey(), signAuthEntry });

const sent = await tx.signAndSend();
```

`basicNodeSigner` signs the exact payload the SDK builds, so the same call is
correct on either credential.

## If you sign the payload yourself

If you build and sign the authorization payload yourself, here is the one change
to make. In the snippets below, `entry` is one of the authorization entries off
the built transaction (the ones `needsNonInvokerSigningBy` flagged), `validUntil`
is a future ledger sequence (for example
`(await server.getLatestLedger()).sequence + 100`), and `hash`, `authorizeEntry`,
and `buildAuthorizationEntryPreimage` import from `@stellar/stellar-sdk`.

**Before.** Code that reconstructs the payload by hand hardcodes the legacy,
non-address-bound credential. It is silently fine on today's `ADDRESS` entry, but
the moment an entry is `AddressV2` (the Protocol 28 flip) it signs the wrong bytes
and the network rejects it. A latent bug:

```ts
// ❌ Before: hardcodes the legacy ENVELOPE_TYPE_SOROBAN_AUTHORIZATION payload.
const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
  new xdr.HashIdPreimageSorobanAuthorization({
    networkId: hash(Buffer.from(networkPassphrase)),
    nonce: credentials.nonce(),
    invocation: entry.rootInvocation(),
    signatureExpirationLedger: validUntil,
  }),
);
const signature = keypair.sign(hash(preimage.toXDR()));
```

**After.** Swap the hand-built preimage for
[`buildAuthorizationEntryPreimage`](/reference/core-soroban-primitives/#buildauthorizationentrypreimage),
which reads the entry's credential type and builds the matching payload. The
signing line is unchanged, and the same code is now correct on both `ADDRESS` and
`AddressV2`:

```ts
// ✅ After: picks the right payload from the entry's own credential type.
const preimage = buildAuthorizationEntryPreimage(entry, validUntil, networkPassphrase);
const signature = keypair.sign(hash(preimage.toXDR()));
```

Better still, drop the preimage step entirely and hand the whole entry to
[`authorizeEntry`](/reference/core-soroban-primitives/#authorizeentry), which
builds the payload, signs it, verifies it, and writes the signature back:

```ts
// ✅ Even simpler: authorizeEntry does the whole thing.
const signed = await authorizeEntry(entry, keypair, validUntil, networkPassphrase);
```

For a custom signer that is not a `Keypair`, pass a `SigningCallback` to
`authorizeEntry`. It receives the full `xdr.HashIdPreimage`, so it can inspect
what it signs, and it should return `{ signature, publicKey }` (the bare `Buffer`
return is deprecated).

## Why one call covers both

`buildAuthorizationEntryPreimage` reads the entry's credential type and builds the
matching payload: the legacy `ENVELOPE_TYPE_SOROBAN_AUTHORIZATION` for `ADDRESS`,
and the address-bound `ENVELOPE_TYPE_SOROBAN_AUTHORIZATION_WITH_ADDRESS` for
`AddressV2`. (AddressV2 is CAP-0071-02; it reuses the address-bound envelope
introduced for custom accounts in
[CAP-0071-01](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0071-01.md),
which is why both CAPs appear here.) You call one function either way, so the flip
from `ADDRESS` to `AddressV2` needs no code change from you.

AddressV2 exists to close a narrow gap. The legacy payload commits to the network,
nonce, invocation, and expiration, but not to the signer's address. If two
accounts share a private key, a signature made for one could be replayed against
the other. AddressV2 binds the address into the signed bytes, which closes that
gap. The gap is narrow (it needs accounts that share keys), which is why `ADDRESS`
stays valid and Core accepts both.

## Put it together

The whole flow as one runnable script. It funds a throwaway source account and a
separate `signer` account, builds a call that requires the signer's
authorization, signs that entry with `basicNodeSigner`, and submits. Set
`contractId` to your deployed Auth contract (see Prerequisites).

```ts
import { contract, rpc, Keypair, Networks } from "@stellar/stellar-sdk";

const rpcUrl = "https://soroban-testnet.stellar.org";
const networkPassphrase = Networks.TESTNET;
const contractId = "C..."; // your deployed Auth contract (see Prerequisites)

async function main() {
  const server = new rpc.Server(rpcUrl);

  // The transaction source (signs the envelope) and a separate account whose
  // authorization the call requires.
  const source = Keypair.random();
  const signer = Keypair.random();

  try {
    await server.fundAddress(source.publicKey());
    await server.fundAddress(signer.publicKey());

    const { signTransaction } = contract.basicNodeSigner(
      source,
      networkPassphrase,
    );
    const client = await contract.Client.from({
      contractId,
      rpcUrl,
      networkPassphrase,
      publicKey: source.publicKey(),
      signTransaction,
    });

    // A call that requires `signer` (not the source) to authorize it.
    const tx = await (client as any).increment({
      user: signer.publicKey(),
      value: 1,
    });
    console.log("needs signing by:", tx.needsNonInvokerSigningBy());

    // Sign that entry as `signer`. basicNodeSigner signs the payload the SDK
    // builds, so this is correct on whichever credential the network returns.
    const { signAuthEntry } = contract.basicNodeSigner(
      signer,
      networkPassphrase,
    );
    await tx.signAuthEntries({ address: signer.publicKey(), signAuthEntry });

    const sent = await tx.signAndSend();
    console.log("applied:", sent.result);
  } catch (e) {
    console.error("Authorized call failed:", e);
  }
}

main().catch(console.error);
```

You can now authorize a contract call that more than one account must sign, and
your signer is correct on both credentials, on today's `ADDRESS` and after the
Protocol 28 flip to `AddressV2`. Custom accounts can also delegate authorization
to a tree of signers (`ADDRESS_WITH_DELEGATES`, also from CAP-0071-01); that
advanced flow is covered separately. Next, learn to convert between JavaScript
values and Soroban types.
