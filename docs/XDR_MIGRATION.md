---
title: XDR Migration Guide
description: How to migrate existing code to the class-based XDR API in @stellar/stellar-sdk.
---

This release replaces the `@stellar/js-xdr`-backed XDR layer with an in-tree,
class-based one (`src/base/xdr/`). The wire format is unchanged, but **every XDR
value now exposes a different API** — discriminated-union classes with property
access instead of method-call-style getters and setters.

This guide documents every user-visible change so you can update existing code.

---

## 1. Method-name changes (XDR/JSON acronyms → PascalCase)

The all-caps acronyms in method names normalize to single-initial-cap form. This
affects application code that called the renamed methods directly.

**True renames** — the legacy method existed with the all-caps name:

| Before                           | After                            |
| -------------------------------- | -------------------------------- |
| `value.toXDR()`                  | `value.toXdr()`                  |
| `Class.fromXDR(…)`               | `Class.fromXdr(…)`               |
| `asset.toChangeTrustXDRObject()` | `asset.toChangeTrustXdrObject()` |
| `asset.toTrustLineXDRObject()`   | `asset.toTrustLineXdrObject()`   |

**Net-new methods** — these didn't exist in the legacy SDK at all (no rename to
do; they're brand-new capabilities):

| Method                                              | Description                                                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `value.toXdrObject()` / `Class.fromXdrObject(wire)` | Bridges instance ↔ wire-shape object. Legacy types directly held their wire shape, so this distinction wasn't meaningful. |
| `value.toJson()` / `Class.fromJson(json)`           | [SEP-51](https://stellar.org/protocol/sep-51)-compliant JSON serialization. See § 13.                                     |

`toJSON()` (capital JSON) is **kept as-is** — it's a JavaScript standard called
automatically by `JSON.stringify()`, and renaming it would break that
integration. The new SDK's `toJson()` (lowercase) is the SEP-0051 serializer;
the two are intentionally separate methods.

> **Note on type/field names.** The PascalCase-with-collapsed-acronyms rule
> (`AccountId`, `ScVal`, `Uint128Parts`, `TtlEntry`, `HashIdPreimage`,
> `ScSpecUdtUnionV0`, …) **also** applies to types — but those names already
> matched the legacy SDK's public surface. The names you imported from
> `@stellar/stellar-sdk` haven't changed. Field names on structs (`accountId`,
> `sponsoredId`, `offerId`, `balanceId`, `sellerId`, …) are likewise unchanged.
> The only rename that breaks application code is the method-name table above.

---

## 2. Union types: discriminated classes, not switch/value pairs

The biggest behavioral change. Every XDR `union` (and any type defined like one
— `Asset`, `ScVal`, `OperationBody`, `LedgerEntryData`, `TransactionEnvelope`,
all the `*Result` types, etc.) is now a TypeScript discriminated union of
concrete variant classes.

### `.switch()` → `.type` (string literal)

```ts
// Before
if (op.body().switch() === xdr.OperationType.payment()) { … }

// After
if (op.body.type === "payment") { … }
```

`obj.type` is a literal-typed string. TypeScript narrows on it, so you don't
need `as` casts inside `switch (obj.type)`.

### `.value()` and arm-getters → properties

```ts
// Before
const scv = xdr.ScVal.scvU32(42);
scv.value();        // 42
scv.switch();       // xdr.ScValType.scvU32()

const asset = ...;            // xdr.Asset
asset.alphaNum4();            // returns the AlphaNum4 payload

// After
const scv = xdr.ScVal.scvU32(42);
scv.value;          // 42 (property)
scv.type;           // "scvU32" (literal string)
scv.u32;            // 42 (variant-specific named field also works)

// Asset, after narrowing:
if (asset.type === "assetTypeCreditAlphanum4") {
  asset.alphaNum4;       // property on the AssetCreditAlphanum4 variant class
  asset.value;           // same thing — every variant exposes `.value`
}
```

### Construction: factories instead of `new XdrType(disc, value)`

The legacy `new xdr.UnionType(discriminant, payload)` pattern is gone (the base
class is now `abstract`). Use the per-variant factory:

```ts
// Before
new xdr.AccountEntryExt(0);
new xdr.LedgerEntryExt(0);
new xdr.SorobanTransactionDataExt(0);
new xdr.ContractEventBody(0, new xdr.ContractEventV0({ … }));
new xdr.TransactionMeta(2, transactionMetaV2);
new xdr.ExtensionPoint(0);

// After
xdr.AccountEntryExt.v0();
xdr.LedgerEntryExt.v0();
xdr.SorobanTransactionDataExt.v0();
xdr.ContractEventBody.v0(new xdr.ContractEventV0({ … }));
xdr.TransactionMeta.v2(transactionMetaV2);
xdr.ExtensionPoint.v0();
```

### `expectVariant` helper

A test helper for narrowing a union to a specific variant lives at
`test/unit/base/support/xdr.ts` (and is the recommended pattern in application
code too):

```ts
import { expectVariant } from "@stellar/stellar-sdk/.../xdr.js";

const v1 = expectVariant(tx.toEnvelope(), "envelopeTypeTx").v1;
const cond = expectVariant(v1.tx.cond, "precondV2").v2;
// cond is fully typed PreconditionsV2 here
```

---

## 3. Enums: singletons, not factory calls

```ts
// Before — factory-call returning an enum singleton
xdr.AssetType.assetTypeNative();
xdr.ScValType.scvU32();
xdr.SignerKeyType.signerKeyTypeEd25519();
xdr.ContractDataDurability.persistent();

// After — drop the parens
xdr.AssetType.assetTypeNative;
xdr.ScValType.scvU32;
xdr.SignerKeyType.signerKeyTypeEd25519;
xdr.ContractDataDurability.persistent;
```

Each enum member is now a static readonly instance with `.name` (string) and
`.value` (number) properties. To compare, prefer `obj.type === "name"` (see §
2). For raw enum equality, instances are reference-stable singletons — `===`
works.

---

## 4. Primitives: bigint and number, not class wrappers

`Int64` / `Uint64` are `bigint`. `Int32` / `Uint32` are `number`.

```ts
// Before
new xdr.Int64("123456789101112");   // a Hyper instance
new xdr.Uint64(0);                   // a UnsignedHyper instance
xdr.Int64.fromString("…");

// After — these all return native primitives
xdr.Int64("123456789101112");        // bigint
xdr.Uint64(0);                       // bigint
xdr.Int64.fromString("…");           // bigint

// Most call sites simply use literals
const nonce = 12345n;                 // bigint literal
const fee = 100;                       // number
new xdr.SorobanAddressCredentials({ nonce: 0n, … });
```

For backward compatibility, `new xdr.Int64(v)` is still supported (via a `Proxy`
`construct` trap that returns a boxed bigint), but the call form `xdr.Int64(v)`
is preferred.

---

## 5. Wide ints: bigint-direct, not `LargeInt` subclasses

`Int128`, `Uint128`, `Int256`, `Uint256` are now thin classes built on the new
`BigIntValue` base. They hold a single `value: bigint` and round-trip through
the generated `Int128Parts` / `Uint128Parts` / etc. structs.

```ts
// Before — multi-arg constructors with 32- or 64-bit slices
new Int128(lo, hi);
new Int256(loLo, loHi, hiLo, hiHi);
new Uint256(1n, 2n, 3n, 4n).toBigInt();
i128.size; // 128
i128.unsigned; // false

// After — single bigint
new Int128(42n);
new Uint256(123456789n).value; // bigint
Int128.fromXdrObject({ hi, lo }); // round-trip via the parts struct
i128.value; // bigint
i128.toParts(); // { hi, lo }
i128.toXdr(); // 16 bytes
Int128.fromJson("42"); // JSON deserialize
```

To reconstruct a bigint from XDR parts (the old `new Int128(lo, hi).toBigInt()`
pattern), use `XdrLargeInt` directly. It accepts slices in **big-endian** order
(parts[0] is most significant):

```ts
import { XdrLargeInt } from "@stellar/stellar-sdk";

new XdrLargeInt("i128", [i128.hi, i128.lo]).toBigInt();
new XdrLargeInt("u256", [hiHi, hiLo, loHi, loLo]).toBigInt();
```

`XdrLargeInt` also **range-checks at construction** for single-value form
(legacy `LargeInt` did this; the new bigint-direct impl preserves the behavior).
`new XdrLargeInt("u64", 1n << 64n)` throws a `RangeError`.

`ScInt` is unchanged.

---

## 6. Bytes: `Uint8Array` everywhere

Every fixed-length and variable-length **byte** field (`opaque[N]`, `opaque<N>`,
`Hash`, `Signature`, `ScBytes`, …) is a `Uint8Array`. The SDK used to surface
`Buffer` in many places — now it's `Uint8Array`. `Buffer` **is** a `Uint8Array`
subclass so most code that just reads bytes (indexing, `.length`) keeps working.
The differences appear when:

(**Note:** XDR _string_ fields are a separate story — see § 12.)

- **You compare values with `toEqual` / deep equality.** `Buffer` vs
  `Uint8Array` containing identical bytes are _not_ deep-equal under vitest /
  Jest. Convert with `Array.from()` on both sides, or compare via
  `.toXdr("base64")`.
- **You call Buffer-only methods** (e.g. `.toString("hex")`). Wrap at the
  boundary: `Buffer.from(uint8array).toString("hex")`.
- **You construct an XDR class that wants `Hash` or `ScBytes`.** Wrap raw bytes
  in the field type:

```ts
// Before — passing a Buffer worked
xdr.ContractExecutable.contractExecutableWasm(Buffer.alloc(32));
xdr.LedgerKeyContractCode({ hash: someBuffer });
xdr.ScVal.scvBytes(Buffer.from([1, 2, 3]));

// After — explicit class wrappers
xdr.ContractExecutable.contractExecutableWasm(new xdr.Hash(Buffer.alloc(32)));
xdr.LedgerKeyContractCode({ hash: new xdr.Hash(someBuffer) });
xdr.ScVal.scvBytes(new xdr.ScBytes(Buffer.from([1, 2, 3])));
```

Byte-class constructors also accept hex strings as a convenience —
`new xdr.Hash("aabbcc…")` works the same as passing 32 bytes.

### 6.1 Typedef-opaque aliases became distinct classes

`PoolId`, `ContractId`, and similar typedef-aliases-of-`Hash` used to be plain
re-exports (`export const PoolId = Hash`). They now emit as their own
`BytesValue<"PoolId">` / `BytesValue<"ContractId">` subclasses with distinct
named schemas. Byte semantics are identical, but class identity isn't.

```ts
// Before — PoolId === Hash at runtime
new xdr.Hash(bytes) instanceof xdr.Hash; // true
xdr.ScAddress.scAddressTypeContract(new xdr.Hash(bytes)); // worked

// After
new xdr.PoolId(bytes) instanceof xdr.Hash; // false — distinct class
xdr.ScAddress.scAddressTypeContract(new xdr.ContractId(bytes)); // required
xdr.ScAddress.scAddressTypeLiquidityPool(new xdr.PoolId(bytes));
```

The motivation is JSON output (§ 13): the walker dispatches encoding overrides
on `schema.name`, so `PoolId` can render as an `L`-strkey and `ContractId` as a
`C`-strkey, while a plain `Hash` stays hex.

---

## 7. `toXdr()` / `fromXdr()`: simpler signatures

The legacy `toXDR()` (no args) returned a `Buffer`; `toXDR("base64")` returned a
string. The new `toXdr()` returns `Uint8Array` by default; `toXdr("base64")` or
`toXdr("hex")` returns a string. **No more `.toXDR().toString("base64")`
pattern** — that was a Buffer idiom and will now produce comma-separated bytes
instead of base64.

```ts
// Before — relied on Buffer.toString("base64")
tx.toEnvelope().toXDR().toString("base64");

// After — pass the encoding directly
tx.toEnvelope().toXdr("base64");
```

`fromXdr` is symmetric:

```ts
// raw bytes
xdr.Asset.fromXdr(uint8array);

// encoded string (format required)
xdr.Asset.fromXdr(base64String, "base64");
xdr.Asset.fromXdr(hexString, "hex");
```

---

## 8. Immutability: fields are `readonly`

Every field on a generated XDR class is `readonly`. Code that mutated XDR values
after construction will silently no-op (non-strict) or throw (strict).

```ts
// Before — mutating the envelope post-build worked
const envelope = tx.toEnvelope();
envelope.v1().tx().fee(1000);
envelope.signatures().push(decoratedSig);

// After — build a fresh envelope with the desired state
const newEnvelope = xdr.TransactionEnvelope.envelopeTypeTx(
  new xdr.TransactionV1Envelope({
    tx: new xdr.Transaction({ …baseTx, fee: 1000 }),
    signatures: [...baseEnv.signatures, decoratedSig],
  }),
);
```

`Transaction.toEnvelope()` returns a fresh, decoded copy on every call, so the
legacy "defensive copy" tests still pass — but you can no longer rely on
post-build mutation.

---

## 9. Class-XDR layer: imports, exports, generated docs

### Where to import from

Two import styles work, both pulling from the same canonical layer:

```ts
// Default namespace — best for hand-typed code
import xdr from "@stellar/stellar-sdk";
xdr.Asset.assetTypeNative();
xdr.ScVal.scvU32(42);

// Named imports — best for migrated code where you want types directly
import { Asset, ScVal, AccountId } from "@stellar/stellar-sdk";
Asset.assetTypeNative();
```

### Variant-class types

Each union variant ships as its own class (and TS type). Import named variant
types when you need them in annotations or `as` casts (the default `xdr.X`
runtime namespace does not carry variant types):

```ts
import type {
  ScValAddress,
  SCAddressMuxedAccount,
  TransactionEnvelopeTx,
  ScSpecEntryUdtUnionV0,
} from "@stellar/stellar-sdk";

const v1 = (env as TransactionEnvelopeTx).v1;
```

### Generated TSDoc

Every generated class carries its original `.x` source as a TSDoc comment, so
hovering over a type in your IDE shows the upstream Stellar XDR definition:

````ts
/**
 * ```xdr
 * struct SCPBallot
 * {
 *     uint32 counter; // n
 *     Value value;    // x
 * };
 * ```
 */
export class ScpBallot extends XdrValue { … }
````

---

## 10. Quick reference

```ts
// ============== UNIONS ==============

// switch → type
op.body().switch().name      →   op.body.type
op.body().switch() === T.X() →   op.body.type === "x"

// value → value (no parens)
scv.value()                  →   scv.value

// arm getters
asset.alphaNum4()            →   asset.alphaNum4         (after narrowing)

// constructors → factories
new xdr.AccountEntryExt(0)   →   xdr.AccountEntryExt.v0()
new xdr.TransactionMeta(2,x) →   xdr.TransactionMeta.v2(x)

// ============== ENUMS ==============
xdr.AssetType.assetTypeNative()  →  xdr.AssetType.assetTypeNative

// ============== PRIMITIVES ==============
new xdr.Int64(v)             →   BigInt(v)  or  v + "n" literal
new xdr.Uint64(v)            →   BigInt(v)
new xdr.Int32(v)             →   Number(v)

// ============== METHODS (renames) ==============
.toXDR()                     →   .toXdr()
.toXDR().toString("base64")  →   .toXdr("base64")
.fromXDR(buf, "base64")      →   .fromXdr(buf, "base64")

// ============== METHODS (new — no legacy equivalent) ==============
                                 .toXdrObject() / .fromXdrObject(wire)
                                 .toJson()      / .fromJson(json)

// ============== BYTES ==============
contractExecutableWasm(buf)  →   contractExecutableWasm(new xdr.Hash(buf))
scvBytes(buf)                →   scvBytes(new xdr.ScBytes(buf))
new xdr.Hash(buf)            →   (still works; also accepts hex strings)
new xdr.Hash(bytes) for PoolId/ContractId  →  use new xdr.PoolId(bytes) /
                                              new xdr.ContractId(bytes)

// ============== STRINGS ==============
memo.text                    →   memo.text.toString() or memo.text.bytes
memo.value (memoText)        →   (Buffer; was string) — call .toString("utf8")
scvString.str (was string)   →   scvString.str.bytes (or scvString.value: string)

// ============== JSON (new) ==============
                                 value.toJson()           // SEP-0051 encode
                                 Type.fromJson(json)      // SEP-0051 decode

// ============== WIDE INTS ==============
new Int128(lo, hi)           →   new XdrLargeInt("i128", [hi, lo])
new Int256(loLo, …, hiHi)    →   new XdrLargeInt("i256", [hiHi, …, loLo])
new Int128(42n).toBigInt()   →   new Int128(42n).value
i128.size, i128.unsigned     →   (no longer exposed — pick the right class)

// Type and field names (AccountId, ScVal, accountId, offerId, sponsoredId,
// Uint128Parts, TtlEntry, …) are unchanged from the legacy SDK — only
// method names with embedded XDR/JSON acronyms have been normalized.
```

---

## 11. Common test-suite patterns

These come up over and over when migrating tests against the new layer:

```ts
// Narrow a union for typed access
import { expectVariant } from ".../support/xdr.js";
const v2 = expectVariant(cond, "precondV2").v2;

// Compare bytes when Buffer/Uint8Array deep-equal fails
expect(Array.from(actualBytes)).toEqual(Array.from(expectedBytes));
expect(actual.toXdr("base64")).toBe(expected.toXdr("base64"));

// Round-trip a fixture to normalize Buffer → Uint8Array internals
const normalized = xdr.LedgerKey.fromXdr(legacyKey.toXdr());

// Variant types for casts
import type { ScValAddress } from "@stellar/stellar-sdk";
const addr = (scv as ScValAddress).address;
```

---

## 12. Strings: the `XdrString` wrapper

XDR `string<N>` fields no longer surface as JavaScript `string`. They're wrapped
in a new `XdrString` class. The reason: a JS `string` can't be both
byte-faithful and text-friendly (it's UTF-16 internally with no clean
representation for arbitrary byte sequences), and Stellar's wire format puts
arbitrary bytes in some `string<N>` fields — notably `MemoText`, where real
envelopes on mainnet carry binary tokens, signatures, and other non- UTF-8
content. `XdrString` stores the wire bytes as the canonical representation and
lets the caller choose decoding semantics explicitly.

**Affects** any field declared as `string<N>` in the XDR — including
`MemoText.text`, `ScValString.str`, `ScValSymbol.sym`,
`SetOptionsOp.homeDomain`, `ManageDataOp.dataName`,
`InvokeContractArgs.functionName`, every `ScSpec*.name`, and similar.

### Construction

`XdrString` and the union/struct constructors that wrap it accept three input
shapes:

```ts
import { XdrString } from "@stellar/stellar-sdk";

new XdrString("hello"); // string → UTF-8 encoded
new XdrString(new Uint8Array([0xd1, 0xff])); // bytes → byte-exact
new XdrString(otherXdrString); // copy

// Generated factories accept the same union shape:
xdr.Memo.memoText("hello"); // string
xdr.Memo.memoText(new Uint8Array([0xd1, 0xff])); // bytes
xdr.ScVal.scvSymbol("transfer"); // string
```

### Reading values

Pick the access pattern that matches what you want:

```ts
const text: XdrString = (memo as MemoText).text;

text.bytes; // Uint8Array — canonical wire form
text.toString(); // "hello" — UTF-8 decode; U+FFFD on invalid
text.toStringStrict(); // "hello" — throws on invalid UTF-8
text.asStringOrBytes(); // string | Uint8Array — best-effort decode
text.toJson(); // SEP-0051 escape form (see § 13)
text.length; // byte length
text.equals(other); // byte-equal comparison
```

**`.toString()` is the default JS string coercion**, so `${memo.text}` works
naturally for ASCII / UTF-8 content. It will _not_ throw on binary bytes —
invalid sequences become U+FFFD. If you want a hard failure on malformed UTF-8,
use `.toStringStrict()`.

### The `.value` getter on union arms

For union arms whose payload is `string<N>` (e.g. `ScValString`, `ScValSymbol`,
`MemoText`), the `.value` getter returns the _decoded JS string_ — not the
`XdrString`. The arm-named field exposes the raw wrapper:

```ts
const scv = xdr.ScVal.scvString("hi");

scv.value; // "hi" — decoded string (was previously `string`-typed; unchanged)
scv.str; // XdrString { bytes: Uint8Array(2) [0x68, 0x69] }
scv.str.bytes; // Uint8Array
```

This split keeps the `.value` shortcut convenient for the 99% case while still
letting binary callers reach the raw bytes through the arm field.

### Round-trip caveat: `Memo.fromXdrObject`

The SDK-level `Memo` class (in `src/base/memo.ts`) now surfaces decoded
`MemoText` content as a `Buffer`, not a `string` — because the underlying bytes
might not be valid UTF-8:

```ts
const memo = xdr.Memo.memoText("hi").toXdr();
const back = Memo.fromXdr(memo);
back.value; // Buffer "hi" (was: string "hi")
back.value.toString("utf8"); // "hi" — explicit decode at the boundary
```

If you previously did `someMemo.value === "expected-string"`, switch to
`someMemo.value?.toString("utf8") === "expected-string"`.

---

## 13. SEP-0051 JSON output: `toJson()` / `fromJson()`

Every generated XDR class has
[SEP-51](https://stellar.org/protocol/sep-51)-compliant JSON serialization built
in. New in this release; no legacy equivalent.

```ts
// Encode any XDR value to JSON
xdr.Asset.assetTypeNative().toJson();
//   → "native"

xdr.ScVal.scvI128(new xdr.Int128Parts({ hi: 0n, lo: 12345n })).toJson();
//   → { i128: "12345" }

xdr.ScAddress.scAddressTypeAccount(pubkey).toJson();
//   → "GAAQEAYEAUDAOCAJBIFQYDIO…"   (StrKey)

// Round-trip
const json = original.toJson();
const recovered = xdr.Asset.fromJson(json);
recovered.toXdr(); // byte-identical to original.toXdr()
```

### Shape conventions

- **Unions, void arm:** snake_case case-name string. `Memo.memoNone()` →
  `"none"`. `Asset.assetTypeNative()` → `"native"`.
- **Unions, non-void arm:** single-key object.
  `Asset.assetTypeCreditAlphanum4(...)` →
  `{ credit_alphanum4: {...payload...} }`.
- **Unions switched on an integer (not an enum):** discriminant retained as
  `v<N>`. `SorobanTransactionMetaExt.v0()` → `"v0"`.
- **Structs:** object with snake_case keys. `AlphaNum4` →
  `{ asset_code: "USD", issuer: "GAAQ…" }`.
- **Enums:** snake_case member name with the common prefix stripped.
  `AssetType.assetTypeCreditAlphanum4` → `"credit_alphanum4"`.
- **`int32` / `uint32`:** JSON number.
- **`int64` / `uint64`:** decimal string (to avoid JS precision loss).
- **`bool`:** JSON boolean.
- **`opaque[N]` / `opaque<N>`:** lowercase hex string.
- **`string<N>`:** SEP-0051 escape form — printable ASCII pass-through, `\0`
  `\t` `\n` `\r` `\\` for the common control bytes, `\xNN` for everything else.
  Reversible.
- **Optional `T?`:** JSON `null` when unset, typed value when set.

### Stellar-specific JSON forms (overrides)

Several types have spec-mandated JSON forms that the walker dispatches on the
schema name:

| Type                                                         | JSON form                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `PublicKey`, `AccountId`, `NodeId`                           | `G`-strkey                                                                |
| `MuxedAccount` (muxed arm), `MuxedEd25519Account`            | `M`-strkey                                                                |
| `ContractId`, `ScAddress` (contract arm)                     | `C`-strkey                                                                |
| `PoolId`, `ScAddress` (liquidity_pool arm)                   | `L`-strkey                                                                |
| `ClaimableBalanceId`, `ScAddress` (claimable_balance arm)    | `B`-strkey                                                                |
| `SignerKey` `preAuthTx` / `hashX` / `ed25519SignedPayload`   | `T`/`X`/`P`-strkey                                                        |
| `Int128Parts`, `Uint128Parts`, `Int256Parts`, `Uint256Parts` | decimal string                                                            |
| `AssetCode4`                                                 | trimmed text (trailing zero bytes removed)                                |
| `AssetCode12`                                                | trimmed text, minimum 5 bytes (so it's distinguishable from `AssetCode4`) |

### `fromJson` accepts both canonical and forgiving inputs

`fromJson` is lenient on input shape — accepts either the SEP-0051 form
(snake_case keys) or the raw wire field names (camelCase keys), so
internally-produced JSON round-trips even if a caller hands you the older shape.

```ts
// Both work:
xdr.AlphaNum4.fromJson({ asset_code: "USD", issuer: "GAAQ…" }); // canonical
xdr.AlphaNum4.fromJson({ assetCode: "USD", issuer: "GAAQ…" }); // legacy
```

### Method names

- `value.toJson()` — JSON-encode. Returns the parsed JSON value (object, array,
  string, number, boolean, or `null`). Use `JSON.stringify(...)` if you want a
  string.
- `Type.fromJson(json)` — JSON-decode. Accepts the same shape `toJson` produces;
  throws on malformed structure.
- `value.toJSON()` (capital JSON) is the JavaScript-standard hook called by
  `JSON.stringify`; it's separate from `toJson()` and _not_ SEP-0051. We haven't
  wired it; if you need SEP-0051 via `JSON.stringify`, call `.toJson()`
  explicitly.

---

## 14. Removed: v4 `Reader` / `Writer` exports

The XDR layer now consumes its runtime from `@stellar/js-xdr` v5 rather than a
vendored in-tree copy. As part of this, the SDK **no longer exports the v4
`Reader` and `Writer`**.

The `Reader` and `Writer` re-exported from the SDK are now the **v5**
implementations, sourced from `@stellar/js-xdr` v5:

```ts
// These now resolve to the js-xdr v5 Reader/Writer:
import { Reader, Writer } from "@stellar/stellar-sdk";
import xdr from "@stellar/stellar-sdk";
xdr.Reader; // v5
xdr.Writer; // v5
```

If you depended on the **v4** `Reader`/`Writer` — either imported directly from
`@stellar/js-xdr@4` or obtained through the SDK — you must migrate to the v5
API. The wire format is unchanged; only the class API differs. If you still need
the v4 runtime for legacy code, install it under an alias (the SDK itself only
uses it for its own legacy test fixtures):

```jsonc
// package.json
"devDependencies": {
  "js-xdr-v4": "npm:@stellar/js-xdr@4.0.0"
}
```
