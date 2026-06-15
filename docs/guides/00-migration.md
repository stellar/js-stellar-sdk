---
title: Migration Guide
description:
  Breaking changes by version for @stellar/stellar-sdk, newest first. Covers the
  v16 modernization release (base fold-in, native fetch, ESM, Node 22) and the
  Protocol 27 Soroban authorization changes.
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

Most apps only need the [Installation](#installation-node-22-is-now-required),
[Imports](#imports-the-default-export-was-removed), and
[Transport](#transport-native-fetch-is-now-the-default) changes. Review the
transaction, asset, and behavior sections if your code depends on lower-level
base types or previously lenient validation. The
[Auth](#auth-protocol-27-readiness) changes only affect code that signs
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
`lib/esm/`, CommonJS resolves `lib/cjs/`, axios variants resolve under
`lib/axios/esm/` and `lib/axios/cjs/`, and type declarations live alongside the
ESM output. `require()` still works. If you deep imported a raw build path, it
moved. Use the subpath exports instead.

```ts del={1} ins={2}
import { Server } from "@stellar/stellar-sdk/lib/rpc/index.js"
import { rpc } from "@stellar/stellar-sdk/rpc"
```

Available subpaths: `.`, `./rpc`, `./contract`, `./axios`, `./axios/rpc`,
`./axios/contract`, `./http-client/axios`.

### Imports: browser auto-resolution was removed

The `package.json` `browser` field and browser export conditions were removed.
Bundlers now resolve the package entry to ESM or CJS source instead of
auto-substituting the prebuilt UMD bundle. If you need the standalone browser
bundle, load it from the explicit `dist/` path. The UMD filenames are unchanged.

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
are gone). Re-test Horizon `.stream()` flows. v4 uses spec-compliant
`EventTarget` behavior, so exceptions thrown inside `onmessage` or `onerror`
handlers now surface as uncaught exceptions instead of being swallowed. Handle
errors inside stream callbacks.

### Utilities: `server.serverURL` is now a native `URL`

The `serverURL` on [`Horizon.Server`](/reference/network-horizon/#horizonserver) and
[`rpc.Server`](/reference/network-rpc/#rpcserver) changed from a `urijs` `URI` to the
global `URL`. Method calls become property reads.

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

### Transactions: min account sequence age is now `bigint`

[`Transaction`](/reference/core-transactions/#transaction)'s
`minAccountSequenceAge` is now a native `bigint`. It is no longer a `number` or
an `xdr.UnsignedHyper` object.

Search for `minAccountSequenceAge` and `setMinAccountSequenceAge` in your code.
Change numeric seconds to `bigint` values when passing them to
[`TransactionBuilder.setMinAccountSequenceAge`](/reference/core-transactions/)
or `TransactionBuilderOptions.minAccountSequenceAge`. If you compare a
transaction's `minAccountSequenceAge`, compare against a `bigint`.

If you set `minAccountSequenceAge: 0n`, the builder now preserves that value
instead of coercing it to `null`. Code that checks `hasV2Preconditions()` may see
`true` when a zero-age precondition is present.

Before:

```ts
const builder = new TransactionBuilder(account, {
  fee,
  networkPassphrase,
  minAccountSequenceAge: 60,
})

builder.setMinAccountSequenceAge(120)
```

After:

```ts
const builder = new TransactionBuilder(account, {
  fee,
  networkPassphrase,
  minAccountSequenceAge: 60n,
})

builder.setMinAccountSequenceAge(120n)
```

### Transactions: type and operation changes

Update code that directly types transactions, reads transaction preconditions,
mutates transaction internals, or switches on operation types:

- Remove generic parameters from `Transaction` type annotations, such as
  `Transaction<Memo<MemoType.Text>>`.
- Convert `tx.extraSigners` to StrKey strings before treating it as `string[]`;
  it is now typed as `xdr.SignerKey[]`.
- Delete calls to `Operation.isValidAmount()`,
  `Operation.constructAmountRequirementsError()`, and
  `Operation.setSourceAccount()`. They are no longer runtime methods on
  `Operation`.
- Replace `operation.type === "revokeSponsorship"` checks with the specific
  revoke-sponsorship type strings:
  `"revokeAccountSponsorship"`, `"revokeTrustlineSponsorship"`,
  `"revokeOfferSponsorship"`, `"revokeDataSponsorship"`,
  `"revokeClaimableBalanceSponsorship"`,
  `"revokeLiquidityPoolSponsorship"`, and `"revokeSignerSponsorship"`.

Before:

```ts
import { Memo, MemoType, Transaction } from "@stellar/stellar-sdk"

type TextTransaction = Transaction<Memo<MemoType.Text>>

const signerKeys: string[] = tx.extraSigners ?? []

switch (operation.type) {
  case "revokeSponsorship":
    handleRevokeSponsorship(operation)
    break
}
```

After:

```ts
import { SignerKey, Transaction } from "@stellar/stellar-sdk"

type TextTransaction = Transaction

const signerKeys = tx.extraSigners?.map(SignerKey.encodeSignerKey) ?? []

switch (operation.type) {
  case "revokeAccountSponsorship":
  case "revokeTrustlineSponsorship":
  case "revokeOfferSponsorship":
  case "revokeDataSponsorship":
  case "revokeClaimableBalanceSponsorship":
  case "revokeLiquidityPoolSponsorship":
  case "revokeSignerSponsorship":
    handleRevokeSponsorship(operation)
    break
}
```

### Transactions: mutating `.tx` is now a silent no-op

**This is a silent behavior change — it does not throw, and no types change.**
`TransactionBase.tx` now returns a fresh defensive copy on every access. The old
pattern of setting fields _through_ it mutates that throwaway copy and has **no
effect** on the transaction that gets signed or serialized:

```ts
const tx = new TransactionBuilder(account, opts).addOperation(op).build()

tx.tx.fee("200") // silently discarded
tx.tx.operations(newOps) // silently discarded
tx.tx.cond(newCond) // silently discarded
```

Because nothing throws, code that relied on this keeps compiling and running
while signing and submitting the **unmodified** transaction — a payment can go
out with the wrong fee, operations, or preconditions, and the only signal is the
on-chain result. If you were patching a built transaction this way, rebuild it
so the change is part of what you sign:

```ts del={2} ins={3}
const built = new TransactionBuilder(account, opts).addOperation(op).build()
built.tx.fee(200) // no-op in v16
const tx = TransactionBuilder.cloneFrom(built, { fee: "200" }).build()
```

Reading `.tx` to inspect a transaction is unaffected.

### Assets, keys, and signing helpers

[`Asset.code`](/reference/core-assets/#assetcode) and
[`Asset.issuer`](/reference/core-assets/#assetissuer) are now `readonly`.
Construct a new `Asset` instead of mutating either field. `Asset.issuer` is typed
as `string | undefined`, because native assets do not have an issuer.

[`Keypair.rawSecretKey()`](/reference/core-keys/#keypairrawsecretkey) now throws
`Error("no secret seed available")` on public-key-only keypairs instead of
returning `undefined`.

Two exports were removed:

- `FastSigning` was removed. Signing now goes through `@noble/ed25519`.
- `TransactionI` was removed. Use `TransactionBase` instead.

### Utilities: `BigNumber.DEBUG` removed

`bignumber.js` was bumped from v9 to v11, and the SDK now exports a strict
`.clone()`d instance. The introspection flag moved.

```ts del={1} ins={2}
if (BigNumber.DEBUG) { /* ... */ }
if (BigNumber.config().STRICT) { /* ... */ }
```

Amount and price helpers (`fromXDRAmount`, `toXDRPrice`, `getAmountInLumens`)
inherit upstream v10/v11 behavior. The v11 behavior that changed most for SDK
callers is that a high-precision JavaScript `number` passed as an amount or
price no longer throws for having more than 15 significant digits; it is rounded
to floating-point precision. Pass such values as strings or `bigint` to avoid
quiet precision loss. A `BigNumber` from your own `bignumber.js` install is a
different class, so `instanceof` can fail across the boundary.

### TypeScript: corrected declarations may affect compile-time checks

The TypeScript declarations now match runtime behavior more closely:

- `CreateInvocation.token` was renamed to `CreateInvocation.asset`.
- `ScIntType` adds `"timepoint"` and `"duration"`; update exhaustive switches.
- `XdrLargeInt.getType()` returns `ScIntType | undefined` instead of a raw
  lowercased string. Non-integer types return `undefined`.
- `SorobanDataBuilder.fromXDR` returns `xdr.SorobanTransactionData`.
- `SetOptions.clearFlags` and `SetOptions.setFlags` accept arbitrary numeric
  bitmasks through `AuthFlags`, so combined flags no longer need a cast.
- The ignored `supportMuxing` parameter was removed from the
  `decodeAddressToMuxedAccount` and `encodeMuxedAccountToAddress` declarations.

### Behavior: stricter ed25519 verification

The ed25519 backend swapped to `@noble/ed25519` v3.
[`Keypair`](/reference/core-keys/#keypair)'s `random`, `sign`, `verify`, and
`generate` keep the same API and `Buffer` return types, but v3
verification is stricter about non-canonical and malleable signatures.
Edge-case signatures that previously verified may now be rejected.

### Behavior: stellar.toml parser swapped to `smol-toml`

SEP-1 resolution now uses a stricter TOML 1.0 parser. The parsed shape is
generally the same, but it accepts and rejects different inputs and throws
different error messages, which propagate into the rejected promise /
`StellarTomlResolveError`.

### Behavior: stricter validation and parsing

Several APIs now reject invalid input that older versions accepted or partially
parsed:

- `toXDRPrice` rejects zero, negative, `NaN`, and `Infinity` numeric prices
  before reaching `best_r()`. Zero denominators are rejected too.
- Constructors and operation builders validate more strictly: `MuxedAccount`
  validates uint64 IDs, `Claimant` rejects falsy destinations, `Account` rejects
  `NaN` sequences, `Memo` is immutable and throws on invalid types,
  `Memo.id()` rejects non-plain-digit strings, `allow_trust` requires
  `authorize`, `setTrustLineFlags` requires boolean flag values, and
  `Asset.getAssetType()` throws for unknown types instead of returning
  `"unknown"`.
- `TransactionBuilder.build()` throws on total-fee overflow past `uint32` max,
  `cloneFrom()` throws on zero-operation inputs, and the constructor rejects
  negative or inverted `timebounds` and `ledgerbounds`.
- `Operation.setOptions()` rejects malformed numeric strings such as `"123abc"`
  for flag, weight, and threshold fields instead of parsing only the leading
  digits.
- `nativeToScVal` bounds-checks `u32` and `i32` values and rejects malformed
  numeric strings. `XdrLargeInt.toI128()` and `toI256()` reject unsigned values
  outside the signed range instead of silently flipping the sign bit.
- `XdrLargeInt` and `ScInt` built from an array of limbs now decode correctly.
  Code that relied on the old nested-array bug will see different values.

### Behavior: recent RPC and simulation response fixes

The following fixes landed shortly before v16. They are listed here because they
are observable when upgrading from older 15.x releases to v16.

Several fixes change observable behavior:

- [`rpc.Server.getLatestLedger()`](/reference/network-rpc/#servergetlatestledger) now includes `closeTime`, `headerXdr`, and
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

### Auth: Protocol 27 readiness

Protocol 27 ([CAP-71](https://github.com/stellar/stellar-protocol/blob/master/core/cap-0071.md))
adds two address-bound Soroban credential types, `AddressV2` and
`AddressWithDelegates`. This only affects code that signs Soroban authorization
entries or inspects their credential arms.

By default the SDK still uses the legacy `ADDRESS` credential: simulation
returns `ADDRESS` entries and `authorizeInvocation` builds them. `ADDRESS_V2`
is only valid on networks that have upgraded to protocol 27, so it is **opt-in** until
 protocol 28 makes it mandatory (at which point the default flips). Opt in with
the `authV2` flag on `authorizeInvocation`'s params — when your target network
supports it.

SDK-driven signing ([`contract.Client`](/reference/contracts-client/#contractclient),
[`basicNodeSigner`](/reference/contracts-client/#contractbasicnodesigner),
[`authorizeEntry`](/reference/core-soroban-primitives/#authorizeentry),
[`signAuthEntries`](/reference/contracts-client/#contractassembledtransaction)) is
forward-compatible with no code change: it signs whichever credential the entry
carries, `ADDRESS` or `ADDRESS_V2`. The entries below break only code that reads
the credential arm or builds the signature payload by hand.

For the full walkthrough of signing Soroban authorization entries, see
[Authorize a Contract Call](/guides/07-contract-auth/).

### Auth: `authorizeInvocation` takes a params object

[`authorizeInvocation`](/reference/core-soroban-primitives/#authorizeinvocation) now
takes a single params object instead of positional arguments. It still builds a
legacy `SOROBAN_CREDENTIALS_ADDRESS` entry by default, so keep reading the result
with `.address()`.

```ts del={1-4} ins={5-7}
const entry = await authorizeInvocation(
  signer, validUntilLedgerSeq, invocation, publicKey, networkPassphrase,
)
const entry = await authorizeInvocation({
  signer, validUntilLedgerSeq, invocation, networkPassphrase, publicKey,
})
const addr = entry.credentials().address()
```

To build a CAP-71 `ADDRESS_V2` entry instead, pass `authV2: true` and read the
result with `.addressV2()`. Only do this on networks that have upgraded to protocol 27.

```ts ins={6}
const entry = await authorizeInvocation({
  signer,
  validUntilLedgerSeq,
  invocation,
  networkPassphrase,
  authV2: true,
})
const addr = entry.credentials().addressV2()
```

### Auth: build the signing payload with `buildAuthorizationEntryPreimage`

Code that reconstructs the authorization payload by hand hardcodes the legacy
`ENVELOPE_TYPE_SOROBAN_AUTHORIZATION`. That is wrong for `AddressV2`, which signs
the address-bound `ENVELOPE_TYPE_SOROBAN_AUTHORIZATION_WITH_ADDRESS`. Use the new
[`buildAuthorizationEntryPreimage`](/reference/core-soroban-primitives/#buildauthorizationentrypreimage),
which picks the right payload from the entry's
own credential type, so the same code is correct on `ADDRESS` today and
`AddressV2` when simulation returns the newer credential.

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
`unsupported credential type` for other non-address credentials. It no longer
defaults `networkPassphrase` to `Networks.FUTURENET`, so pass the network
passphrase explicitly at every call site.

It also gained an optional 5th parameter, `forAddress`, that routes the
signature to a specific node (the top-level account or a nested delegate) for
delegated auth. Existing four-argument calls are unaffected if they already pass
`networkPassphrase`.

```ts ins={2}
authorizeEntry(entry, signer, validUntilLedgerSeq, networkPassphrase) // unchanged
authorizeEntry(entry, signer, validUntilLedgerSeq, networkPassphrase, forAddress)
```

For delegated authorization (`ADDRESS_WITH_DELEGATES`, CAP-71-01), build the
wrapper with
[`buildWithDelegatesEntry`](/reference/core-soroban-primitives/#buildwithdelegatesentry)
(it sorts each delegate array by address
and rejects duplicates, as the protocol requires), then route each signer's
signature with `forAddress`. Every signer signs the same payload, bound to the
top-level address.

### Earlier 15.x deprecation: `BalanceResponse.revocable`

On [`BalanceResponse`](/reference/network-rpc/#rpcapibalanceresponse), use
`authorizedToMaintainLiabilities`, which reflects the correct trustline flag
semantics.

```ts del={1} ins={2}
const flag = balance.revocable
const flag = balance.authorizedToMaintainLiabilities
```

### Deprecated: bare `Buffer` return from `SigningCallback`

A custom [`SigningCallback`](/reference/core-soroban-primitives/#signingcallback)
passed to `authorizeEntry` should return
`{ signature, publicKey }`. The bare `Buffer` return is deprecated.

```ts del={1} ins={2-5}
const signAuthEntry = async (preimage) => keypair.sign(hash(preimage.toXDR()))
const signAuthEntry = async (preimage) => ({
  signature: keypair.sign(hash(preimage.toXDR())),
  publicKey: keypair.publicKey(),
})
```
