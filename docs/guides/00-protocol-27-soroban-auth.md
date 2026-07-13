---
title: Protocol 27 - Soroban authorization migration
description:
  What CAP-71 changes about Soroban authorization entries, and how to migrate
  code that hand-builds and signs auth entries to the address-bound payload and
  the new ADDRESS_V2 / ADDRESS_WITH_DELEGATES credential types.
---

# Protocol 27: Soroban authorization migration

Protocol 27 ([CAP-71](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0071.md))
reworks how Soroban authorization entries are signed. If you let the SDK build
and sign your entries end to end — `authorizeInvocation()`, or
`AssembledTransaction.signAuthEntries()` / `contract.Client` — the upgrade is
mostly transparent and you can skim this guide.

This guide is for the other case: **you hand-craft `SorobanAuthorizationEntry`
values and/or compute the signature payload yourself.** Those code paths need
changes, because the bytes you sign are different now.

## What changed, in one paragraph

Before P27, an address credential's signature committed to the network, nonce,
invocation, and expiration — but **not** to the address being authorized. P27
adds a new signature payload that **binds the address into the signed bytes**,
and two new credential types that use it: `SOROBAN_CREDENTIALS_ADDRESS_V2`
(same shape as the old `ADDRESS`, address-bound payload) and
`SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES` (an account plus a tree of delegate
signers, all signing that same shared, address-bound payload). The old
`SOROBAN_CREDENTIALS_ADDRESS` type and its non-address-bound payload still exist
for backwards compatibility, and remain what `authorizeInvocation()` builds by
default; opt new entries into `ADDRESS_V2` once CAP-71 is active on your target
network.

## The four credential types

| Type | Value | Signature payload | Notes |
|------|-------|-------------------|-------|
| `SOROBAN_CREDENTIALS_SOURCE_ACCOUNT` | 0 | — (covered by tx envelope) | unchanged |
| `SOROBAN_CREDENTIALS_ADDRESS` | 1 | `ENVELOPE_TYPE_SOROBAN_AUTHORIZATION` (legacy, **not** address-bound) | still valid; pre-P27 behavior |
| `SOROBAN_CREDENTIALS_ADDRESS_V2` | 2 | `ENVELOPE_TYPE_SOROBAN_AUTHORIZATION_WITH_ADDRESS` (**address-bound**) | opt-in via `authorizeInvocation({ authV2: true })` |
| `SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES` | 3 | `ENVELOPE_TYPE_SOROBAN_AUTHORIZATION_WITH_ADDRESS` (bound to the **top-level** address) | account + delegate tree |

`ADDRESS_V2` carries exactly the same fields as `ADDRESS`
(`SorobanAddressCredentials`: address, nonce, `signatureExpirationLedger`,
signature). The only thing that changes is which preimage you hash and sign.

## The core change: the signature payload is address-bound

This is the part that breaks hand-rolled signers. The payload for `ADDRESS_V2`
(and `ADDRESS_WITH_DELEGATES`) is a different `HashIdPreimage` variant with an
extra `address` field, so it hashes to different bytes than the legacy payload.

**Before (legacy `ADDRESS`):**

```js
import { hash, xdr } from '@stellar/stellar-sdk';

// entry          - the unsigned SorobanAuthorizationEntry to authorize, e.g.
//                  one returned by `simulateTransaction` or built by hand
// keypair        - the Keypair that authorizes the invocation
// validUntil     - ledger sequence the signature is valid until (exclusive)
// networkPassphrase - e.g. Networks.PUBLIC / Networks.TESTNET
function signAuthEntry(entry, keypair, validUntil, networkPassphrase) {
  // pre-P27 entries carry their address credentials on the ADDRESS arm
  const addressCreds = entry.credentials().address();

  // commit the expiration onto the credentials *before* building the payload,
  // so the signed hash and the submitted credentials agree on it
  addressCreds.signatureExpirationLedger(validUntil);

  // legacy payload: commits to network, nonce, invocation, expiration —
  // but NOT the address being authorized
  const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
    new xdr.HashIdPreimageSorobanAuthorization({
      networkId: hash(Buffer.from(networkPassphrase)),
      nonce: addressCreds.nonce(),
      invocation: entry.rootInvocation(),
      signatureExpirationLedger: validUntil,
    }),
  );

  const signature = keypair.sign(hash(preimage.toXDR()));

  // write the signature back onto the credentials (see `encodeSignature` below)
  addressCreds.signature(encodeSignature(keypair.publicKey(), signature));
  return entry;
}
```

**After (address-bound, for `ADDRESS_V2` / `ADDRESS_WITH_DELEGATES`):**

```js
import { hash, xdr } from '@stellar/stellar-sdk';

function signAuthEntry(entry, keypair, validUntil, networkPassphrase) {
  // P27 entries carry the same SorobanAddressCredentials struct, but on the
  // ADDRESS_V2 arm — read it with `.addressV2()`, not `.address()`
  const addressCreds = entry.credentials().addressV2();

  addressCreds.signatureExpirationLedger(validUntil);

  // address-bound payload: the WithAddress variant adds an `address` field,
  // so it hashes to different bytes than the legacy payload above
  const preimage =
    xdr.HashIdPreimage.envelopeTypeSorobanAuthorizationWithAddress(
      new xdr.HashIdPreimageSorobanAuthorizationWithAddress({
        networkId: hash(Buffer.from(networkPassphrase)),
        nonce: addressCreds.nonce(),
        invocation: entry.rootInvocation(),
        address: addressCreds.address(), // ← NEW: address committed into the payload
        signatureExpirationLedger: validUntil,
      }),
    );

  const signature = keypair.sign(hash(preimage.toXDR()));

  addressCreds.signature(encodeSignature(keypair.publicKey(), signature));
  return entry;
}
```

If you sign the *legacy* payload for an `ADDRESS_V2` entry, the network
reconstructs the *address-bound* payload from the credentials, the hashes don't
match, and the entry is rejected.

### Recommended: stop hand-rolling this entirely

If you have a local `Keypair` (or anything with a `.sign(Buffer)` method), all of
the above — choosing the arm, setting the expiration, building the right payload,
signing, verifying, and writing the signature back — is exactly what
`authorizeEntry()` already does. It handles all three credential types, so the
same call keeps working as you move entries from `ADDRESS` to `ADDRESS_V2`:

```js
import { authorizeEntry } from '@stellar/stellar-sdk';

const signed = await authorizeEntry(
  entry,        // any address-based SorobanAuthorizationEntry
  keypair,      // Keypair, or a SigningCallback (see below)
  validUntil,   // expiration ledger sequence
  networkPassphrase,
);
```

If your signer lives elsewhere — a hardware wallet, a browser extension, a remote
signing service — you only need the bytes to sign. Use
`buildAuthorizationEntryPreimage()`, which picks the correct preimage variant for
the entry's credential type (legacy for `ADDRESS`, address-bound for `ADDRESS_V2`
and `ADDRESS_WITH_DELEGATES`):

```js
import { buildAuthorizationEntryPreimage, hash } from '@stellar/stellar-sdk';

const preimage = buildAuthorizationEntryPreimage(
  entry,
  validUntil,
  networkPassphrase,
);
const payload = hash(preimage.toXDR()); // hand these bytes to your external signer
```

You can also hand the whole thing to `authorizeEntry()` via a `SigningCallback`,
which receives the `HashIdPreimage` directly so you can inspect what you're
signing rather than signing a bare hash.

## The signature value itself is unchanged

Only the *payload* changed; the structure you write into the credential's
`signature` field is exactly as before — an `scvVec` of a map keyed by the
`public_key` and `signature` symbols. This is the `encodeSignature` helper the
two examples above call:

```js
import { nativeToScVal, StrKey, xdr } from '@stellar/stellar-sdk';

// publicKey - the signer's G... address (string)
// signature - the raw signature over `hash(preimage.toXDR())` (Buffer)
function encodeSignature(publicKey, signature) {
  const sigScVal = nativeToScVal(
    {
      public_key: StrKey.decodeEd25519PublicKey(publicKey),
      signature,
    },
    {
      type: {
        public_key: ['symbol', null],
        signature: ['symbol', null],
      },
    },
  );

  return xdr.ScVal.scvVec([sigScVal]);
}
```

## Reading credentials off an entry

The accessor depends on the arm. If you used to read `credentials().address()`
unconditionally, that throws on a `V2` entry. Switch on the credential type:

```js
import { xdr } from '@stellar/stellar-sdk';

function addressCredentials(credentials) {
  switch (credentials.switch().value) {
    case xdr.SorobanCredentialsType.sorobanCredentialsAddress().value:
      return credentials.address();
    case xdr.SorobanCredentialsType.sorobanCredentialsAddressV2().value:
      return credentials.addressV2();
    case xdr.SorobanCredentialsType
      .sorobanCredentialsAddressWithDelegates().value:
      return credentials.addressWithDelegates().addressCredentials();
    default:
      return null; // source-account credentials carry no address payload
  }
}
```

`SorobanAddressCredentials` is the same struct in all three arms, so once you've
unwrapped it the `.address()`, `.nonce()`, `.signatureExpirationLedger()`, and
`.signature()` accessors work identically.

## `authorizeInvocation()` and `ADDRESS_V2`

By default, `authorizeInvocation()` still builds legacy
`SOROBAN_CREDENTIALS_ADDRESS` entries — the same shape as before P27. `ADDRESS_V2`
credentials are only valid on networks that have activated CAP-71, so V2 is
**opt-in** via the `authV2` flag and stays off until you enable it. (The default
flips to `true` once V2 becomes mandatory.)

Pass `authV2: true` to build `SOROBAN_CREDENTIALS_ADDRESS_V2`. The signing is
transparent either way — you still pass a `Keypair` or a `SigningCallback` — but
the credential arm, and therefore the accessor you read it back with, follows
the flag:

```js
// Default: legacy ADDRESS — read the result with `.address()`
const legacy = await authorizeInvocation({
  signer,
  validUntilLedgerSeq,
  invocation,
  networkPassphrase,
  publicKey, // required when `signer` is a callback
});
const addr = legacy.credentials().address();

// Opt in to ADDRESS_V2 — read the result with `.addressV2()`
const v2 = await authorizeInvocation({
  signer,
  validUntilLedgerSeq,
  invocation,
  networkPassphrase,
  publicKey,
  authV2: true, // ← build ADDRESS_V2 (CAP-71-active networks only)
});
const v2addr = v2.credentials().addressV2();
```

When you enable `authV2`, **the resulting entries are only valid on protocol
27+.** If you assert on the credential type, or target a pre-P27 network, account
for the new type.

`authorizeEntry()` already handles all three credential types and selects the
correct payload internally, so existing `authorizeEntry()` call sites keep
working unchanged regardless of which arm the entry uses.

## New: delegated signing (`ADDRESS_WITH_DELEGATES`)

[CAP-71](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0071.md) also adds delegated authorization: an account can authorize an invocation
through a tree of delegate signers rather than (or in addition to) its own
signature. Like multisig, which accounts use delegation is client-side policy —
simulation never emits this variant on its own, so you assemble it.

Two pieces make this work:

1. **`buildWithDelegatesEntry()`** wraps an `ADDRESS`/`ADDRESS_V2` entry into an
   `ADDRESS_WITH_DELEGATES` entry, attaching the delegate tree. It sorts each
   delegate array ascending by address and rejects duplicates, as the protocol
   requires — do not hand-sort.
2. **`authorizeEntry(..., forAddress)`** signs the shared payload and writes the
   signature into the node whose address matches `forAddress` (the top-level
   account or any nested delegate), instead of always the top level.

```js
import { buildWithDelegatesEntry, authorizeEntry } from '@stellar/stellar-sdk';

// Start from an ADDRESS_V2 entry (e.g. one returned by simulation) and attach
// the delegate set. The top-level signature defaults to scvVoid, which is valid
// for an account that authorizes purely through its delegates.
let entry = buildWithDelegatesEntry({
  entry: simEntry, // ADDRESS or ADDRESS_V2
  validUntilLedgerSeq,
  delegates: [
    { address: delegateA.publicKey() },
    {
      address: delegateB.publicKey(),
      nestedDelegates: [{ address: delegateC.publicKey() }],
    },
  ],
});

// Every signer signs the SAME payload — bound to the *top-level* address, not
// their own. `forAddress` just routes each signature into the right node.
entry = await authorizeEntry(
  entry, delegateA, validUntilLedgerSeq, networkPassphrase, delegateA.publicKey(),
);
entry = await authorizeEntry(
  entry, delegateB, validUntilLedgerSeq, networkPassphrase, delegateB.publicKey(),
);
entry = await authorizeEntry(
  entry, delegateC, validUntilLedgerSeq, networkPassphrase, delegateC.publicKey(),
);
```

Each `authorizeEntry()` call clones the entry it's given, so chaining preserves
the signatures already written. `forAddress` must match a node actually present
in the entry, or the call throws.

If you drive signing entirely yourself, build the shared payload once with
`buildAuthorizationEntryPreimage(entry, ...)` (it's bound to the top-level
address for every signer), hand the hash to each delegate, and write the
resulting `scvVec` signature into each delegate node directly. Remember the
ordering and de-duplication rules per delegate array if you construct the XDR by
hand.

## Quick checklist

- [ ] Replace any hand-built `envelopeTypeSorobanAuthorization` preimage with
      `buildAuthorizationEntryPreimage()` (or switch to
      `envelopeTypeSorobanAuthorizationWithAddress` and include `address`) for
      `ADDRESS_V2` entries.
- [ ] Update reads of `credentials().address()` to handle the `addressV2()` and
      `addressWithDelegates()` arms.
- [ ] `authorizeInvocation()` still returns legacy `ADDRESS` (read with
      `.address()`) by default. Only pass `authV2: true` — and read the result
      with `.addressV2()` — when targeting a CAP-71-active (protocol 27+) network.
- [ ] For delegated auth, use `buildWithDelegatesEntry()` +
      `authorizeEntry(..., forAddress)` rather than building the wrapper XDR by
      hand.
