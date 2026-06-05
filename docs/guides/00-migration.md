---
title: Migration Guide
description:
  Breaking changes by version for @stellar/stellar-sdk, newest first. Covers the
  v16 modernization release (base fold-in, native fetch, ESM, Node 22) and the
  Protocol 27 / 28 Soroban authorization changes.
---

# Migration Guide

If you are coming from an earlier version of `@stellar/stellar-sdk`, update the
APIs listed below.

> **Versioning.** Always run the latest `@stellar/stellar-sdk`; an older SDK may
> fail to decode newer network data as the protocol upgrades. These docs cover
> the latest version only. See
> [Versioning and compatibility](/#versioning-and-compatibility).

## 16.x.x Breaking changes

The 16.x.x release is a major modernization. `@stellar/stellar-base` is folded
into the SDK, native `fetch` replaces axios as the default transport, the package
is ESM-first, and Node 22 is required. It also lands
[Protocol 27](https://stellar.org/blog/foundation-news/stellar-zipper-protocol-27-upgrade-guide)
Soroban authorization (`AddressV2`).

Most apps only need the [Installation](#installation-node-22-is-now-required) and
[Imports](#imports-the-default-export-was-removed) changes. The
[Auth](#auth-protocol-27--28-readiness) changes only affect code that signs
Soroban contract authorization entries.

### Installation: Node 22 is now required

The minimum Node version is now `22` (up from `20`). Installing on older Node
produces an `EBADENGINE` warning. Two runtime globals are now assumed and are
built into Node 22: `fetch` (the default transport) and `crypto.getRandomValues`
(used by SEP-10 `buildChallengeTx`, which dropped the `randombytes` dependency).
Constrained runtimes such as React Native need polyfills for both.

A `.nvmrc` pinned to `v22` is included:

```shell
nvm install && nvm use
```

### Installation: `@stellar/stellar-base` is folded into `@stellar/stellar-sdk`

`@stellar/stellar-base` is now bundled into and re-exported from
`@stellar/stellar-sdk`, and is no longer a separate dependency. Symbol names are
unchanged. If you imported the base package directly, change the import source:

```ts del={1} ins={2}
import { Keypair, TransactionBuilder, Asset } from "@stellar/stellar-base"
import { Keypair, TransactionBuilder, Asset } from "@stellar/stellar-sdk"
```

Then uninstall it. Keeping both installed causes `instanceof` checks to fail on
values that look correct.

```shell
npm uninstall @stellar/stellar-base
```

### Imports: the default export was removed

`export default module.exports` was removed from the entry points. Replace any
default import with a namespace or named import.

```ts del={1} ins={2,3}
import StellarSdk from "@stellar/stellar-sdk"
import * as StellarSdk from "@stellar/stellar-sdk"
import { Keypair, rpc, contract } from "@stellar/stellar-sdk"
```

### Imports: build paths moved under `lib/esm`

The package is now ESM-first and dual (`"type": "module"`). ESM resolves
`lib/esm/`, CommonJS resolves `lib/cjs/`, and `require()` still works. If you deep
imported a raw build path, it moved. Use the subpath exports instead.

```ts del={1} ins={2}
import { Server } from "@stellar/stellar-sdk/lib/rpc/index.js"
import { rpc } from "@stellar/stellar-sdk/rpc"
```

Available subpaths: `.`, `./rpc`, `./contract`, `./axios`, `./axios/rpc`,
`./axios/contract`, `./http-client/axios`.

### Transport: native `fetch` is now the default

The default HTTP client switched from axios to native `fetch` (backed by
`feaxios`). Normal Horizon and RPC use needs no change. Code that relied on
axios-specific behavior (the axios `config` object, axios error shapes,
interceptors, `httpClient.CancelToken`) now gets the fetch client instead.

To opt back into axios, import the axios-backed build:

```ts del={1} ins={2}
import * as StellarSdk from "@stellar/stellar-sdk"
import * as StellarSdk from "@stellar/stellar-sdk/axios"
```

Per module, use `@stellar/stellar-sdk/axios/rpc` and
`@stellar/stellar-sdk/axios/contract`. For a self-built browser bundle, build with
`USE_AXIOS=true` (`pnpm run build:lib:axios`).

### Removed entrypoints

The `no-axios`, `minimal`, and `no-eventsource` subpaths (and each one's
`/contract` and `/rpc` variants) were removed. The plain `@stellar/stellar-sdk`
import is now fetch-based, so it already provides what `no-axios` and `minimal`
used to.

```ts del={1-3} ins={4}
import { Horizon } from "@stellar/stellar-sdk/no-axios"
import { Horizon } from "@stellar/stellar-sdk/minimal"
import { Horizon } from "@stellar/stellar-sdk/no-eventsource"
import { Horizon } from "@stellar/stellar-sdk"
```

### Streaming: `eventsource` upgraded to v4

The `eventsource` dependency jumped from v2 to v4 and is now always bundled (the
`USE_EVENTSOURCE=false` build flag and the "Streaming requires eventsource" guard
are gone). Re-test Horizon `.stream()` flows. Reconnect and error semantics
differ in v4: a reconnect after the server closes the stream can surface as a
stream error (for example `ECONNREFUSED`) rather than an uncaught throw, so an
`onerror` handler that rethrows behaves differently.

### Utilities: `server.serverURL` is now a native `URL`

`Horizon.Server.serverURL` and `rpc.Server.serverURL` changed from a `urijs`
`URI` to the global `URL`. Method calls become property reads.

```ts del={1} ins={2}
const host = server.serverURL.hostname()
const host = server.serverURL.hostname
```

`URL.protocol` returns the WHATWG form with a trailing colon, so update equality
checks.

```ts del={1} ins={2}
if (server.serverURL.protocol === "https") { /* ... */ }
if (server.serverURL.protocol === "https:") { /* ... */ }
```

The `Server` constructors now require an absolute URL with a scheme. A bare host
or scheme-less string throws `TypeError: Invalid URL` at construction time. If you
subclass `CallBuilder`, its constructor parameter and `protected url` field are
now `URL`, and there is a new `protected setPath(...segments)` helper.

### Utilities: `BigNumber.DEBUG` removed

`bignumber.js` was bumped from v9 to v11, and the SDK now exports a strict
`.clone()`d instance. The introspection flag moved.

```ts del={1} ins={2}
if (BigNumber.DEBUG) { /* ... */ }
if (BigNumber.config().STRICT) { /* ... */ }
```

Amount and price helpers (`fromXDRAmount`, `toXDRPrice`, `getAmountInLumens`)
inherit upstream v10/v11 behavior. A `BigNumber` from your own `bignumber.js`
install is a different class, so `instanceof` can fail across the boundary.

### Behavior: stricter ed25519 verification

The ed25519 backend swapped to `@noble/ed25519` v3. `Keypair.random`, `sign`,
`verify`, and `generate` keep the same API and `Buffer` return types, but v3
verification is stricter about non-canonical and malleable signatures.
Edge-case signatures that previously verified may now be rejected.

### Behavior: stellar.toml parser swapped to `smol-toml`

SEP-1 resolution now uses a stricter TOML 1.0 parser. The parsed shape is
generally the same, but it accepts and rejects different inputs and throws
different error messages, which propagate into the rejected promise /
`StellarTomlResolveError`.

### Behavior: corrected RPC and simulation responses

Several fixes change observable behavior:

- `rpc.Server.getLatestLedger()` now includes `closeTime`, `headerXdr`, and
  `metadataXdr`, with the XDR fields parsed into objects rather than base64.
- A `parseSuccessful` precedence bug that silently dropped simulation results and
  state changes is fixed, so they now appear in the parsed response.
- `pollTransaction` now runs the configured number of attempts (it previously ran
  one fewer).
- `maxRedirects` and `maxContentLength` are now enforced on the default client
  (they were no-ops before), tightening the SSRF and DoS guards used by
  `StellarToml.Resolver.resolve` and `FederationServer`.

### Dependencies: removed transitive packages

If your code reached through the SDK for any of these, declare them yourself now:
`@stellar/stellar-base`, `urijs`, `@noble/curves`, `sha.js`, `randombytes`,
`toml`.

### Auth: Protocol 27 / 28 readiness

Protocol 27 ([CAP-71](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0071.md))
adds two address-bound Soroban credential types, `AddressV2` and
`AddressWithDelegates`. This only affects code that signs Soroban authorization
entries. The timeline matters:

- **At Protocol 27:** the network accepts `AddressV2`, but RPC simulation still
  returns the legacy `ADDRESS` credential.
- **At Protocol 28:** the simulation default flips to `AddressV2`. Both remain
  valid on-chain.

SDK-driven signing (`contract.Client`, `basicNodeSigner`, `authorizeEntry`,
`signAuthEntries`) is forward-compatible across the flip with no code change: it
signs whichever credential simulation returns. The entries below break only code
that reads the credential arm or builds the signature payload by hand.

For the full walkthrough of signing Soroban authorization entries, see
[Authorize a Contract Call](/guides/07-contract-auth/).

### Auth: `authorizeInvocation` now returns `AddressV2`

`authorizeInvocation` now takes a single params object and builds
`SOROBAN_CREDENTIALS_ADDRESS_V2` entries instead of legacy `ADDRESS`. Read the
result with `.addressV2()`.

```ts del={1-4} ins={5-8}
const entry = await authorizeInvocation(
  signer, validUntilLedgerSeq, invocation, publicKey, networkPassphrase,
)
const addr = entry.credentials().address()
const entry = await authorizeInvocation({
  signer, validUntilLedgerSeq, invocation, networkPassphrase, publicKey,
})
const addr = entry.credentials().addressV2()
```

### Auth: build the signing payload with `buildAuthorizationEntryPreimage`

Code that reconstructs the authorization payload by hand hardcodes the legacy
`ENVELOPE_TYPE_SOROBAN_AUTHORIZATION`. That is wrong for `AddressV2`, which signs
the address-bound `ENVELOPE_TYPE_SOROBAN_AUTHORIZATION_WITH_ADDRESS`. Use the new
`buildAuthorizationEntryPreimage`, which picks the right payload from the entry's
own credential type, so the same code is correct on `ADDRESS` today and
`AddressV2` after the flip.

```ts del={1-8} ins={9}
const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
  new xdr.HashIdPreimageSorobanAuthorization({
    networkId: hash(Buffer.from(networkPassphrase)),
    nonce: credentials.nonce(),
    invocation: entry.rootInvocation(),
    signatureExpirationLedger: validUntil,
  }),
)
const preimage = buildAuthorizationEntryPreimage(entry, validUntil, networkPassphrase)
const signature = keypair.sign(hash(preimage.toXDR()))
```

Simpler still, hand the whole entry to `authorizeEntry`, which builds, signs,
verifies, and writes the signature back:

```ts
const signed = await authorizeEntry(entry, keypair, validUntil, networkPassphrase)
```

### Auth: `authorizeEntry` is stricter and gains a `forAddress` parameter

`authorizeEntry` now handles `ADDRESS`, `ADDRESS_V2`, and `ADDRESS_WITH_DELEGATES`,
short-circuits only for an explicit source-account credential, and throws
`unsupported credential type` for other non-address credentials. It gained an
optional 5th parameter, `forAddress`, that routes the signature to a specific
node (the top-level account or a nested delegate) for delegated auth. Existing
four-argument calls are unaffected.

```ts ins={2}
authorizeEntry(entry, signer, validUntilLedgerSeq, networkPassphrase) // unchanged
authorizeEntry(entry, signer, validUntilLedgerSeq, networkPassphrase, forAddress)
```

For delegated authorization (`ADDRESS_WITH_DELEGATES`, CAP-71-01), build the
wrapper with `buildWithDelegatesEntry` (it sorts each delegate array by address
and rejects duplicates, as the protocol requires), then route each signer's
signature with `forAddress`. Every signer signs the same payload, bound to the
top-level address.

### Auth: closed export surface

The auth module's wildcard re-export was replaced with an explicit allow-list. The
package root now exports exactly `authorizeEntry`, `authorizeInvocation`,
`buildAuthorizationEntryPreimage`, `buildWithDelegatesEntry`, and the types
`SigningCallback`, `AuthorizeInvocationParams`, `DelegateSignature`,
`BuildWithDelegatesParams`. Anything else imported from the auth module (notably
`getAddressCredentials`, now internal) no longer resolves.

### Deprecated: `BalanceResponse.revocable`

Use `authorizedToMaintainLiabilities`, which reflects the correct trustline flag
semantics.

```ts del={1} ins={2}
const flag = balance.revocable
const flag = balance.authorizedToMaintainLiabilities
```

### Deprecated: `rpc.Server.requestAirdrop`

Use `fundAddress`, which also funds contract addresses.

```ts del={1} ins={2}
await server.requestAirdrop(publicKey)
await server.fundAddress(publicKey)
```

### Deprecated: bare `Buffer` return from `SigningCallback`

A custom `SigningCallback` passed to `authorizeEntry` should return
`{ signature, publicKey }`. The bare `Buffer` return is deprecated.

```ts del={1} ins={2-5}
const signAuthEntry = async (preimage) => keypair.sign(hash(preimage.toXDR()))
const signAuthEntry = async (preimage) => ({
  signature: keypair.sign(hash(preimage.toXDR())),
  publicKey: keypair.publicKey(),
})
```

<!--
AUTHOR NOTES — remove before publishing. Grounded in the master...modernization
diff (14 PRs), not the prose guides.

1. Version: package.json on the branch still reads 15.0.1; the README documents
   the base fold-in as v16.0.0. Confirm the published version and replace the
   "16.x.x" heading if it ships differently.
2. Diff markers: viem's `[!code]` Shiki syntax is NOT supported by this site's
   renderer (Expressive Code). Converted to its native fence syntax,
   `ts del={lines} ins={lines}`. The line numbers are positional, so re-number
   them if you edit a code block.
3. Browser bundle: resolved against the PR descriptions. PR #1397 confirms a
   browser-UMD bundle IS still built by Rollup (to dist/); PR #1396 removed the
   package.json `browser` field, so automatic browser resolution is gone. Net:
   the UMD artifact exists, but document the explicit <script>/dist path rather
   than relying on the `browser` field. README Bower instructions are stale.
4. P28 flip timing: this is the one claim NOT provable from the SDK. PR #1429
   confirms the SDK supports P27 / AddressV2, but says nothing about when RPC
   simulation changes its default credential. "Simulation default flips at P28"
   comes from the protocol upgrade guide, not this repo. Confirm before publish.
5. Changelog: the big v16 breaks (fetch default, ESM, base fold-in, Node 22) are
   not all marked "breaking" in CHANGELOG.md Unreleased yet. Land them there with
   a clear marker, since this guide mirrors the changelog's version sections.
-->
