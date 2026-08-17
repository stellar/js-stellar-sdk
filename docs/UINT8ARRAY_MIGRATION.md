---
title: Uint8Array Migration Guide
description:
  How to migrate code that consumed Buffer-typed APIs to the Uint8Array-based
  API in @stellar/stellar-sdk v17.
---

As of v17, every public SDK API that used Node's `Buffer` uses the web-standard
`Uint8Array` instead ([#1457](https://github.com/stellar/js-stellar-sdk/issues/1457)).
The `buffer` dependency is gone, and the browser bundle no longer needs (or
ships) a Buffer polyfill, so the SDK now runs in browsers, edge runtimes, Deno,
and Bun with no shims.

**Inputs are not breaking.** `Buffer` is a subclass of `Uint8Array`, so
everywhere the SDK now accepts a `Uint8Array` you can keep passing a `Buffer`.

**Returns are breaking.** Methods that returned `Buffer` now return a plain
`Uint8Array`, which lacks Buffer's convenience methods. If you called
`.toString("hex")`, `.toString("base64")`, `.equals()`, `.readBigUInt64BE()`,
etc. on an SDK result, that code needs updating.

---

## 1. Recipes: replacing Buffer methods on SDK results

The [`uint8array-extras`](https://github.com/sindresorhus/uint8array-extras)
package (which the SDK itself uses) covers most of these; plain `DataView`
covers the rest. In Node you can also just wrap the result:
`Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)`.

| Before (Buffer)                    | After (Uint8Array)                                          |
| ---------------------------------- | ----------------------------------------------------------- |
| `buf.toString("hex")`              | `uint8ArrayToHex(bytes)`                                    |
| `buf.toString("base64")`           | `uint8ArrayToBase64(bytes)`                                 |
| `buf.toString("utf8")` / `.toString()` | `uint8ArrayToString(bytes)`                             |
| `Buffer.from(hex, "hex")`          | `hexToUint8Array(hex)`                                      |
| `Buffer.from(b64, "base64")`       | `base64ToUint8Array(b64)`                                   |
| `Buffer.from(str)` (UTF-8)         | `stringToUint8Array(str)`                                   |
| `Buffer.concat([a, b])`            | `concatUint8Arrays([a, b])`                                 |
| `a.equals(b)`                      | `areUint8ArraysEqual(a, b)`                                 |
| `a.compare(b)`                     | `compareUint8Arrays(a, b)`                                  |
| `Buffer.alloc(n)`                  | `new Uint8Array(n)`                                         |
| `Buffer.isBuffer(x)`               | `x instanceof Uint8Array`                                   |
| `buf.readUInt32BE(o)`              | `new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(o)` |
| `buf.readBigUInt64BE(o)`           | `…same DataView….getBigUint64(o)`                           |
| `buf.slice(a, b)` (view)           | `bytes.subarray(a, b)`. Note that `Uint8Array.prototype.slice` **copies**, while `Buffer.prototype.slice` returned a view |

Three semantic traps to check for:

- `.toString("hex")` fails silently. `Uint8Array.prototype.toString` ignores its
  argument and returns comma-joined decimals (`"185,77,39,…"`). Code comparing
  that to a hex string stops matching, and nothing throws. Grep your
  codebase for `.toString("hex")`/`.toString("base64")` applied to SDK results.
- Decoding is stricter. Where the SDK parses hex/base64 strings you hand it
  (e.g. hex signer keys in `Operation.setOptions`, base64 envelopes), invalid
  input now throws (`Invalid Hex character…`) instead of being silently
  truncated the way `Buffer.from(str, "hex")` was.
- Test assertions stop matching. A `Buffer` and a `Uint8Array` holding identical
  bytes are **not** deep-equal under vitest or Jest. `toEqual`, `toStrictEqual`,
  and nested comparisons all fail, because the two report different types. So a
  test whose expected value is a `Buffer` fixture now fails against an SDK
  result. Normalize one side, or compare encodings:

  ```ts
  expect(uint8ArrayToHex(actual)).toBe(expectedHex); // preferred
  expect(Array.from(actual)).toEqual(Array.from(expectedBuffer));
  ```

## 2. Method-by-method: returns that changed `Buffer` → `Uint8Array`

### base

| API |
| --- |
| `hash(data)` |
| `Keypair.rawPublicKey()` / `rawSecretKey()` |
| `Keypair.sign(data)` / `signMessage(message)` |
| `Keypair.signatureHint()` |
| `StrKey.decodeEd25519PublicKey` / `decodeEd25519SecretSeed` / `decodeMed25519PublicKey` / `decodePreAuthTx` / `decodeSha256Hash` / `decodeSignedPayload` / `decodeContract` / `decodeClaimableBalance` / `decodeLiquidityPool` |
| `decodeCheck(versionByteName, encoded)` |
| `Transaction.hash()` / `signatureBase()` (also on `FeeBumpTransaction`) |
| `Memo.value` for `MemoHash` / `MemoReturn` (and the decoded bytes of a `MemoText` read back via `Memo.fromXdrObject`) |
| `Address.toBuffer()` (name kept, now returns `Uint8Array`) |
| `Operation.fromXdrObject` records: `manageData`'s `value`, `setOptions`/`revokeSponsorship` signer `sha256Hash` / `preAuthTx` |
| signing helpers: `generate`, `sign` |
| `getLiquidityPoolId(type, params)` |

### rpc / contract / horizon

| API |
| --- |
| `rpc.Server.getContractWasmByContractId()` / `getContractWasmByHash()` |
| `contract.Spec` byte-typed spec entries and `specFromWasm` results |
| `contract.Spec.scValToNative` / `funcResToNative` for `Bytes` / `BytesN`, including values nested in structs, vecs, and maps. These are generically typed (`T`), so TypeScript will **not** flag the change: a `client.get_hash().result.toString("hex")` keeps compiling and starts returning comma-joined decimals. |

### auth (CAP-71 / Soroban)

- `SigningCallback` must now resolve to a `Uint8Array` (or
  `{ signature: Uint8Array; publicKey: string }`). Returning a `Buffer` still
  works; returning a **raw `ArrayBuffer` no longer does**, so wrap it:
  `new Uint8Array(arrayBuffer)`.
- The **signing payload** handed *to* a `SigningCallback` as its second argument
  is a `Uint8Array` too (it used to be a `Buffer`). A callback that logs or
  forwards it with `payload.toString("hex")` silently gets decimals.
- `AuthEntrySignature.signature` (from `inspectAuthEntry`) is a `Uint8Array`.
- **Not** `DecoratedSignature.signature` / `.hint`, despite the matching name:
  what `tx.signatures[i]` holds are `xdr.Signature` / `xdr.SignatureHint`
  wrappers, not bytes. Unwrap with `.toBytes()`. See
  [`XDR_MIGRATION.md`](./XDR_MIGRATION.md) § 6.1.

## 3. Inputs that got more flexible

- `Operation.manageData`'s `value` accepts `string | Uint8Array | null`
  directly (Buffers still work).
- `Memo.text` accepts `string | Uint8Array`. It no longer takes a plain
  `number[]`, which 16.2.0 did accept, so pass `new Uint8Array(arr)` instead.
  Note that `Memo.text([])` was a valid zero-byte memo and now throws.
- Everything that accepted `Buffer` accepts any `Uint8Array` now, including
  ones backed by `SharedArrayBuffer`-free views from `fetch()` responses,
  `crypto.getRandomValues`, WASM memory, etc.

## 4. Environment changes

- The `buffer` npm package is no longer a dependency; bundlers no longer need
  a Buffer global or polyfill configuration for the SDK.
- `base32.js` (which required a Buffer global in browsers) was replaced with
  [`@exodus/bytes`](https://github.com/ExodusOSS/bytes); strkey behavior is
  unchanged, except that malformed strkeys are rejected by its strict decoder
  with more specific errors (still a thrown `Error` / `isValid* === false`).
- Node `Buffer` keeps working everywhere as an *input* since it is a
  `Uint8Array`. The SDK just never hands one back.
