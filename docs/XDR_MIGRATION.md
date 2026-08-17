---
title: XDR Migration Guide
description:
  How to migrate existing code to the class-based XDR API in
  @stellar/stellar-sdk.
---

This release replaces the method-call-style XDR API (backed by `@stellar/js-xdr`
v4) with a class-based one built on `@stellar/js-xdr` v5. The wire format is
unchanged, but **every XDR value now exposes a different API**:
discriminated-union classes with property access instead of method-call-style
getters and setters.

This guide documents every user-visible change so you can update existing code.

The same release also switches the SDK's public byte-returning APIs from
`Buffer` to `Uint8Array`. That change reaches beyond the XDR layer and has its
own guide: [`UINT8ARRAY_MIGRATION.md`](./UINT8ARRAY_MIGRATION.md). Read both,
because `Buffer` methods like `.toString("hex")` and `.toString("utf8")` fail _silently_
on a `Uint8Array`, which is the most common way this migration goes wrong.

---

## 1. Method-name changes (XDR/JSON acronyms → PascalCase)

The all-caps acronyms in method names normalize to single-initial-cap form. This
affects application code that called the renamed methods directly.

**True renames**, where the legacy method existed with the all-caps name. None of
these kept a back-compat alias, so every call site is a hard failure (TypeScript
error; `TypeError: … is not a function` in plain JavaScript):

| Before                           | After                            |
| -------------------------------- | -------------------------------- |
| `value.toXDR()`                  | `value.toXdr()`                  |
| `Class.fromXDR(…)`               | `Class.fromXdr(…)`               |
| `Class.validateXDR(…)`           | `Class.validateXdr(…)`           |
| `value.toXDRObject()`            | `value.toXdrObject()`            |
| `Class.fromXDRObject(…)`         | `Class.fromXdrObject(…)`         |
| `asset.toChangeTrustXDRObject()` | `asset.toChangeTrustXdrObject()` |
| `asset.toTrustLineXDRObject()`   | `asset.toTrustLineXdrObject()`   |

This reaches well beyond the `xdr` namespace: the wrapper classes you use every
day carry these methods too, including some of the SDK's most-called APIs. The
full list of renamed public methods:

| Class                                   | Renamed                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------- |
| `Transaction`, `FeeBumpTransaction`     | `toXDR()` → `toXdr()`                                                     |
| `TransactionBuilder`                    | `fromXDR()` → `fromXdr()`                                                 |
| `contract.AssembledTransaction`         | `toXDR()` / `fromXDR()` → `toXdr()` / `fromXdr()`                         |
| `SorobanDataBuilder`                    | `fromXDR()` → `fromXdr()`                                                 |
| `Asset`                                 | `toXDRObject()` → `toXdrObject()`                                         |
| `Memo`                                  | `toXDRObject()` / `fromXDRObject()` → `toXdrObject()` / `fromXdrObject()` |
| `Operation`                             | `fromXDRObject()` → `fromXdrObject()`                                     |
| `Claimant`                              | `toXDRObject()` → `toXdrObject()`, `fromXDR()` → `fromXdr()`              |
| `MuxedAccount`                          | `toXDRObject()` → `toXdrObject()`                                         |
| `LiquidityPoolAsset`, `LiquidityPoolId` | `toXDRObject()` → `toXdrObject()`                                         |

`contract.Client.txFromJSON` was likewise renamed to `txFromJson`, but it keeps
a deprecated alias, so existing calls still work.

**Net-new methods**, with no legacy equivalent:

| Method                                    | Description                                                                                                                                                                                  |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value.toXdrObject()` on **XDR values**   | Bridges instance ↔ wire-shape object. Legacy XDR types held their wire shape directly, so the distinction wasn't meaningful. (On the wrapper classes above it's a rename, not a new method.) |
| `value.toJson()` / `Class.fromJson(json)` | [SEP-51](https://stellar.org/protocol/sep-51)-compliant JSON serialization. See § 12.                                                                                                        |
| `value.equals(other)`                     | Structural comparison. Handy because a `Buffer` and a `Uint8Array` of identical bytes are not deep-equal under vitest/Jest (§ 6).                                                            |

Note that `toJson()` (lowercase) is the API to call; the JavaScript-standard
`toJSON()` hook is also implemented as a thin delegate to it, so
`JSON.stringify()` produces SEP-0051 output for any XDR value (including ones
nested inside plain objects). See § 12.

Struct **field** names (`accountId`, `sponsoredId`, `offerId`, `balanceId`,
`sellerId`, …) are unchanged. Most **type** names are too, because the
PascalCase-with-collapsed-acronyms rule (`AccountId`, `ScVal`, `TtlEntry`,
`HashIdPreimage`, `ScSpecUdtUnionV0`, …) already matched the legacy SDK's public
surface. But a handful of type names did change; see § 1.1.

### 1.1 Renamed and removed type names

Three renames. The first two are easy to miss because only the _unsigned_
spelling changed:

| Legacy             | Now                |
| ------------------ | ------------------ |
| `UInt128Parts`     | `Uint128Parts`     |
| `UInt256Parts`     | `Uint256Parts`     |
| `ThresholdIndices` | `ThresholdIndexes` |

And the following typedef aliases are gone entirely. The new layer inlines what they
stood for rather than exporting a name for it:

| Legacy alias                                   | Was                                  | Now write                         |
| ---------------------------------------------- | ------------------------------------ | --------------------------------- |
| `Duration`, `TimePoint`                        | `Uint64`                             | `bigint`                          |
| `SequenceNumber`                               | `Int64`                              | `bigint`                          |
| `ScVec`                                        | array of `ScVal`                     | `xdr.ScVal[]`                     |
| `ScMap`                                        | array of `ScMapEntry`                | `xdr.ScMapEntry[]`                |
| `LedgerEntryChanges`                           | array of `LedgerEntryChange`         | `xdr.LedgerEntryChange[]`         |
| `ContractCostParams`                           | array of `ContractCostParamEntry`    | `xdr.ContractCostParamEntry[]`    |
| `SorobanAuthorizationEntries`                  | array of `SorobanAuthorizationEntry` | `xdr.SorobanAuthorizationEntry[]` |
| `ScString`, `ScSymbol`, `String32`, `String64` | `XDRString`                          | `xdr.XdrString` (§ 11)            |
| `SponsorshipDescriptor`                        | `undefined \| AccountId`             | `xdr.AccountId \| null` (§ 14)    |

These only bite type annotations and `import type` lines. The runtime values
were always the underlying types.

---

## 2. Union types: discriminated classes, not switch/value pairs

The biggest behavioral change. Every XDR `union` (and any type defined like one:
`Asset`, `ScVal`, `OperationBody`, `LedgerEntryData`, `TransactionEnvelope`,
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

The legacy form throws a `TypeError` naming a factory to use instead, so a call
site TypeScript can't reach — plain JavaScript, or TypeScript run without a
type-check pass — fails at the `new` rather than later, inside serialization:

```text
TypeError: new xdr.TransactionMeta(...) is not supported: XDR unions are built
from per-variant factories. Call xdr.TransactionMeta.operations(...) (or another
arm factory) instead.
```

### Narrowing helpers

Two helpers ship on the `xdr` namespace for narrowing a union to a specific
variant when a full `switch`/`if` on `.type` is overkill:

```ts
import { xdr } from "@stellar/stellar-sdk";

// Assert-and-narrow — throws TypeError on mismatch
const v1 = xdr.expectUnionVariant(tx.toEnvelope(), "envelopeTypeTx").v1;
const cond = xdr.expectUnionVariant(v1.tx.cond, "precondV2").v2;
// cond is fully typed PreconditionsV2 here

// Type-guard form — narrows inside the branch
if (xdr.isUnionVariant(scv, "scvU32")) {
  scv.u32; // number
}
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
2). For raw enum equality, instances are reference-stable singletons, so `===`
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

The `new xdr.Int64(v)` form is **not** supported. It throws a `TypeError`
telling you to use the call form. (JavaScript can't return a primitive from a
constructor, and a boxed bigint would fail deep inside serialization instead of
at the call site.)

---

## 5. Wide ints: bigint-direct, not `LargeInt` subclasses

`Int128`, `Uint128`, `Int256`, `Uint256` are now thin classes built on the new
`BigIntValue` base. They hold a single `value: bigint` and round-trip through
the generated `Int128Parts` / `Uint128Parts` / etc. structs.

These four are reachable **both** as `xdr.Int128` and as a top-level `Int128`.
It is the same class either way, and one of the few exceptions to the "XDR types
are namespace-only" rule in § 9. That matters when migrating: the legacy SDK also
exported a top-level `Int128`, but it was a _different_ class (a `LargeInt`
subclass). So `import { Int128 } from "@stellar/stellar-sdk"` still resolves and
still constructs. It just builds a different object with a different
constructor contract, rather than failing at the import.

```ts
// Before — multi-arg constructors with 32- or 64-bit slices
new xdr.Int128(lo, hi);
new xdr.Int256(loLo, loHi, hiLo, hiHi);
new xdr.Uint256(1n, 2n, 3n, 4n).toBigInt();
i128.size; // 128
i128.unsigned; // false

// After — single bigint
new xdr.Int128(42n);
new xdr.Uint256(123456789n).value; // bigint
xdr.Int128.fromXdrObject({ hi, lo }); // round-trip via the parts struct
i128.value; // bigint
i128.toParts(); // { hi, lo }
i128.toXdr(); // 16 bytes
xdr.Int128.fromJson("42"); // JSON deserialize
```

To reconstruct a bigint from XDR parts (the old `new Int128(lo, hi).toBigInt()`
pattern), use `XdrLargeInt`, one of the few XDR-adjacent classes exported
top-level, alongside `ScInt`. As in the legacy SDK, it accepts slices in
**little-endian** order (parts[0] is least significant):

```ts
import { XdrLargeInt } from "@stellar/stellar-sdk";

const { hi, lo } = i128.toParts(); // no `.lo` / `.hi` directly on the instance
new XdrLargeInt("i128", [lo, hi]).toBigInt();
new XdrLargeInt("u256", [loLo, loHi, hiLo, hiHi]).toBigInt();
```

`XdrLargeInt` also **range-checks at construction** (legacy `LargeInt` did this;
the new bigint-direct impl preserves the behavior).
`new XdrLargeInt("u64", 1n << 64n)` throws a `RangeError`, as does a slice that
doesn't fit its width (e.g. `new XdrLargeInt("u128", [0n, 2n ** 80n])`).

### `XdrLargeInt` and `ScInt`

`ScInt`'s own API is unchanged, but it extends `XdrLargeInt`, whose shape moved
underneath it, so inherited members changed for both classes:

- `.int` is gone. It used to hold a `LargeInt` instance (`Hyper`, `Int128`,
  `Int256`, …). It's replaced by `readonly value: bigint` plus
  `readonly type: ScIntType`. Anything reaching through it, such as
  `new ScInt(x).int.toBigInt()`, `.int.size`, `.int.unsigned`, or `.int.slice(…)`,
  now fails with `Cannot read properties of undefined`.
- `valueOf()` returns a `bigint` instead of the wrapped `LargeInt`. This is
  a silent change: `xli + 1n` works where it previously didn't, and comparisons
  against a `LargeInt` behave differently.
- `type` is now `readonly`, so reassigning it is a compile error.
- The constructor validates `type` up front (`TypeError: invalid type: …`)
  instead of failing later, and slice input has new guards: an empty slice array
  throws `RangeError`, and a slice count that doesn't evenly divide the width
  throws `TypeError`.

---

## 6. Bytes: `Uint8Array` everywhere

Every fixed-length and variable-length **byte** field (`opaque[N]`, `opaque<N>`,
`Hash`, `Signature`, `ScBytes`, …) is a `Uint8Array`. The SDK used to surface
`Buffer` in many places; now it's `Uint8Array`. `Buffer` **is** a `Uint8Array`
subclass so most code that just reads bytes (indexing, `.length`) keeps working.
The differences appear when:

(**Note:** XDR _string_ fields are a separate story; see § 11.)

- You compare values with `toEqual` or another deep equality check. `Buffer` and
  `Uint8Array` containing identical bytes are _not_ deep-equal under vitest /
  Jest. Convert with `Array.from()` on both sides, or compare via
  `.toXdr("base64")`.
- You call Buffer-only methods (e.g. `.toString("hex")`). Wrap at the
  boundary: `Buffer.from(uint8array).toString("hex")`, or use
  [`uint8array-extras`](https://github.com/sindresorhus/uint8array-extras). See
  [`UINT8ARRAY_MIGRATION.md`](./UINT8ARRAY_MIGRATION.md).

### Passing bytes in

Byte fields still accept raw bytes, so there's no need to wrap every call site.
Both forms typecheck and encode identically:

```ts
// Equivalent
xdr.ContractExecutable.contractExecutableWasm(new Uint8Array(32));
xdr.ContractExecutable.contractExecutableWasm(new xdr.Hash(new Uint8Array(32)));
xdr.ScVal.scvBytes(new Uint8Array([1, 2, 3]));
xdr.ScVal.scvBytes(new xdr.ScBytes(new Uint8Array([1, 2, 3])));

// Struct constructors need `new` — they're classes now, not factory functions
new xdr.LedgerKeyContractCode({ hash: someBytes });
```

The one place a specific class **is** required is the typedef-opaque aliases;
see § 6.1.

Byte-class constructors also accept hex strings as a convenience, so
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

This is what lets JSON output (§ 12) render a `PoolId` as an `L`-strkey and a
`ContractId` as a `C`-strkey while a plain `Hash` stays hex.

Note that this break is type-level: at runtime a `Hash` still encodes to the
same 32 bytes, so plain JavaScript callers see no error.

---

## 7. `toXdr()` / `fromXdr()`: simpler signatures

The legacy `toXDR()` (no args) returned a `Buffer`; `toXDR("base64")` returned a
string. The new `toXdr()` returns `Uint8Array` by default; `toXdr("base64")` or
`toXdr("hex")` returns a string. **No more `.toXDR().toString("base64")`
pattern.** That was a Buffer idiom and will now produce comma-separated bytes
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

Every field on a generated XDR class is declared `readonly`, so code that
mutated XDR values after construction is now a TypeScript compile error. This is
a **type-level** guarantee only. Instances aren't frozen, so plain JavaScript
callers get no error and the assignment takes effect. Either way, treat XDR
values as immutable: the setter-style call chains are gone, and mutating a
decoded value is no longer a supported way to change one.

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
legacy "defensive copy" tests still pass, but you can no longer rely on
post-build mutation.

---

## 9. Imports and generated docs

### Where to import from

Exactly as in the legacy SDK, all XDR types live on the named `xdr` namespace
export. They are deliberately **not** exported top-level, because names like `Asset`,
`Memo`, and `Operation` at the top level are the SDK wrapper classes, which
would collide:

```ts
import { xdr } from "@stellar/stellar-sdk";

xdr.Asset.assetTypeNative();
xdr.ScVal.scvU32(42);

import { Asset } from "@stellar/stellar-sdk";
// ⚠ This is the SDK's Asset wrapper class, NOT xdr.Asset — same as before.
```

The exceptions are `Int128`, `Uint128`, `Int256`, and `Uint256`, which are
exported top-level as well as on `xdr` (§ 5), plus the XDR-adjacent
`XdrLargeInt` and `ScInt`, which are top-level only.

### Variant-class types

Each union variant ships as its own class (and TS type) on the same `xdr`
namespace. Use the qualified name in annotations or `as` casts:

```ts
import { xdr } from "@stellar/stellar-sdk";

const v1 = (env as xdr.TransactionEnvelopeTx).v1;
const addr: xdr.ScValAddress = xdr.ScVal.scvAddress(scAddress);
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
.validateXDR(s, "base64")    →   .validateXdr(s, "base64")

// ============== METHODS (new — no legacy equivalent) ==============
                                 .toXdrObject() / .fromXdrObject(wire)
                                 .toJson()      / .fromJson(json)

// ============== BYTES ==============
contractExecutableWasm(buf)  →   (unchanged; raw bytes still accepted)
scvBytes(buf)                →   (unchanged; raw bytes still accepted)
new xdr.Hash(buf)            →   (still works; also accepts hex strings)
new xdr.Hash(bytes) for PoolId/ContractId  →  use new xdr.PoolId(bytes) /
                                              new xdr.ContractId(bytes)

// ============== STRINGS ==============
memo.text                    →   memo.text.toString() or memo.text.bytes
memo.value (memoText, after  →   (Uint8Array; was string) — decode with
  Memo.fromXdrObject)            uint8ArrayToString(), NOT .toString("utf8")
scvString.str (was string)   →   scvString.str.bytes (or scvString.value: string)

// ============== JSON (new) ==============
                                 value.toJson()           // SEP-0051 encode
                                 Type.fromJson(json)      // SEP-0051 decode

// ============== WIDE INTS ==============
new xdr.Int128(lo, hi)       →   new XdrLargeInt("i128", [lo, hi])
new xdr.Int256(loLo, …)      →   new XdrLargeInt("i256", [loLo, …, hiHi])
new xdr.Int128(42n).toBigInt() → new xdr.Int128(42n).value
i128.lo, i128.hi             →   i128.toParts()  // { hi, lo }
i128.size, i128.unsigned     →   (no longer exposed — pick the right class)
scInt.int / xli.int          →   scInt.value / xli.value  (bigint) — `.int` is gone

// ============== OPTIONALS (§ 14) ==============
x === undefined              →   x == null    // decoded absent = null now

// ============== REMOVED (§ 13) ==============
xdr.scvSortedMap(entries)    →   scvSortedMap(entries)   // top-level export
xdr.Hyper / xdr.Option / xdr.Opaque / xdr.XDRString / …  →  (gone; see § 13)
Hyper, UnsignedHyper, cereal →   (gone from top-level)

// ============== TYPE NAMES (§ 1.1) ==============
UInt128Parts, UInt256Parts   →   Uint128Parts, Uint256Parts
ThresholdIndices             →   ThresholdIndexes
Duration, TimePoint, SequenceNumber  →  bigint
ScVec, ScMap                 →   xdr.ScVal[], xdr.ScMapEntry[]
ScString, ScSymbol, String32/64      →  xdr.XdrString
SponsorshipDescriptor        →   xdr.AccountId | null

// Struct field names (accountId, offerId, sponsoredId, …) and most type names
// (AccountId, ScVal, TtlEntry, …) are unchanged.
```

---

## 11. Strings: the `XdrString` wrapper

XDR `string<N>` fields no longer surface as JavaScript `string`. They're wrapped
in a new `XdrString` class. The reason: a JS `string` can't be both
byte-faithful and text-friendly (it's UTF-16 internally with no clean
representation for arbitrary byte sequences), and Stellar's wire format puts
arbitrary bytes in some `string<N>` fields, notably `MemoText`, where real
envelopes on mainnet carry binary tokens, signatures, and other non- UTF-8
content. `XdrString` stores the wire bytes as the canonical representation and
lets the caller choose decoding semantics explicitly.

**Affects** any field declared as `string<N>` in the XDR, including
`MemoText.text`, `ScValString.str`, `ScValSymbol.sym`,
`SetOptionsOp.homeDomain`, `ManageDataOp.dataName`,
`InvokeContractArgs.functionName`, every `ScSpec*.name`, and similar.

### Construction

`XdrString` and the union/struct constructors that wrap it accept three input
shapes:

```ts
import { xdr } from "@stellar/stellar-sdk";

new xdr.XdrString("hello"); // string → UTF-8 encoded
new xdr.XdrString(new Uint8Array([0xd1, 0xff])); // bytes → byte-exact
new xdr.XdrString(otherXdrString); // copy

// Generated factories accept the same union shape:
xdr.Memo.memoText("hello"); // string
xdr.Memo.memoText(new Uint8Array([0xd1, 0xff])); // bytes
xdr.ScVal.scvSymbol("transfer"); // string
```

### Reading values

Pick the access pattern that matches what you want:

```ts
const text: xdr.XdrString = (memo as xdr.MemoText).text;

text.bytes; // Uint8Array — canonical wire form
text.toString(); // "hello" — UTF-8 decode; U+FFFD on invalid
text.toStringStrict(); // "hello" — throws on invalid UTF-8
text.asStringOrBytes(); // string | Uint8Array — best-effort decode
text.toJson(); // SEP-0051 escape form (see § 12)
text.length; // byte length
text.equals(other); // byte-equal comparison
```

**`.toString()` is the default JS string coercion**, so `${memo.text}` works
naturally for ASCII / UTF-8 content. It will _not_ throw on binary bytes;
invalid sequences become U+FFFD. If you want a hard failure on malformed UTF-8,
use `.toStringStrict()`.

### The `.value` getter on union arms

For union arms whose payload is `string<N>` (e.g. `ScValString`, `ScValSymbol`,
`MemoText`), the `.value` getter returns the _decoded JS string_, not the
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
`MemoText` content as a `Uint8Array`, not a `string`, because the underlying
bytes might not be valid UTF-8:

```ts
import { uint8ArrayToString } from "uint8array-extras";

const wire = xdr.Memo.memoText("hi").toXdr();
const back = Memo.fromXdrObject(xdr.Memo.fromXdr(wire));
back.value; // Uint8Array [0x68, 0x69] (was: string "hi")
uint8ArrayToString(back.value); // "hi" — explicit decode at the boundary
```

If you previously did `someMemo.value === "expected-string"`, switch to
`someMemo.value && uint8ArrayToString(someMemo.value) === "expected-string"`.

> **Don't reach for `.toString("utf8")`.** It's a `Buffer` method, and
> `Uint8Array.prototype.toString` ignores the argument, so you get `"104,105"`, a
> comma-joined byte list, and nothing throws. See
> [`UINT8ARRAY_MIGRATION.md`](./UINT8ARRAY_MIGRATION.md) for the full set of
> `Buffer`-method replacements.

Note that this only affects the decode path. A `Memo` you constructed yourself
(`Memo.text("hi")`) still holds the `string` you passed.

---

## 12. SEP-0051 JSON output: `toJson()` / `fromJson()`

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
- **`string<N>`:** SEP-0051 escape form, with printable ASCII pass-through, `\0`
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

### `fromJson` accepts SEP-0051 keys only

`fromJson` accepts the SEP-0051 form and nothing else. The raw wire field names
(camelCase) are **not** accepted, and an unknown struct key is rejected rather
than ignored. An omitted optional field decodes to `null`, so a silently
skipped typo would drop data without any error.

```ts
xdr.AlphaNum4.fromJson({ asset_code: "USD", issuer: "GAAQ…" }); // ok
xdr.AlphaNum4.fromJson({ assetCode: "USD", issuer: "GAAQ…" }); // throws: unknown field assetCode
xdr.AlphaNum4.fromJson({ asset_code: "USD", issuer: "GAAQ…", extra: 1 }); // throws: unknown field extra
```

The same applies to enum and union case names. Only the snake_case,
prefix-stripped spelling works:

```ts
xdr.ScValType.fromJson("i32"); // ok
xdr.ScValType.fromJson("scvI32"); // throws: unknown enum name scvI32
xdr.Asset.fromJson({ credit_alphanum4: payload }); // ok
xdr.Asset.fromJson({ assetTypeCreditAlphanum4: payload }); // throws: unknown case
```

One exception: for struct fields whose name is a Rust keyword, the Rust
`stellar-xdr` crate emits a keyword-escaped key (`type_` instead of `type`).
`fromJson` accepts that legacy spelling alongside the plain one so JSON from the
Rust tooling still parses. Supplying both spellings of the same field is
ambiguous and throws.

```ts
xdr.ContractEvent.fromJson({ ...rest, type: "contract" }); // ok (canonical)
xdr.ContractEvent.fromJson({ ...rest, type_: "contract" }); // ok (Rust legacy)
xdr.ContractEvent.fromJson({ ...rest, type: "contract", type_: "contract" }); // throws
```

### Method names

- `value.toJson()` JSON-encodes. It returns the parsed JSON value (object, array,
  string, number, boolean, or `null`). Use `JSON.stringify(...)` if you want a
  string.
- `Type.fromJson(json)` JSON-decodes. It accepts the same shape `toJson` produces
  and throws on malformed structure.
- `value.toJSON()` (capital JSON) is the JavaScript-standard hook called by
  `JSON.stringify`; it delegates to `toJson()`, so
  `JSON.stringify(value) === JSON.stringify(value.toJson())`. Call `toJson()` in
  your own code; the hook exists for implicit serialization (loggers,
  `res.json`, snapshots). To substitute a custom encoding under
  `JSON.stringify`, use a replacer function (its `this[key]` is the original
  instance, before the hook fired).

---

## 13. Removed exports

The SDK's XDR runtime is now `@stellar/js-xdr` v5 (previously v4), and the SDK
**no longer exports `Reader` or `Writer`**, which are internal runtime details.
For decoding and encoding, use `Type.fromXdr(...)` and `value.toXdr(...)` (see §
7). For the main legacy `Reader` use case, several values of one type
concatenated in a single buffer, use the new `xdr.decodeStream` helper:

```ts
import { xdr } from "@stellar/stellar-sdk";

// Uint8Array containing N back-to-back ScSpecEntry values:
const entries = xdr.decodeStream(xdr.ScSpecEntry, bytes);
```

`decodeStream` decodes until the buffer is exhausted and throws if the remaining
bytes don't form a complete value. It never returns a partial list.

### Runtime type constructors

The v4 schema/authoring types the legacy SDK re-exported on `xdr` are gone, as
values and as types: `Bool`, `Hyper`, `UnsignedHyper`, `SignedInt`,
`UnsignedInt`, `Opaque`, `VarOpaque`, `Option`, `XDRArray`, and `XDRString`. The
new layer's generated classes and native primitives (§ 4, § 6, § 11) replace
them; the schema builders behind them are internal.

`Hyper` and `UnsignedHyper` were also exported **top-level**, as was `cereal`
(the raw js-xdr namespace). All three are gone. For 64-bit values use `bigint`
(§ 4).

### `validateXDR` and `xdr.scvSortedMap`

- **`validateXDR(input, format)`** was a static on every generated type — a
  "is this decodable?" check. It survives as **`validateXdr`** (casing now
  matches `fromXdr`/`toXdr`): `Uint8Array` input, or a string with
  `"hex" | "base64"`. As with `fromXdr`, the optional `"raw"` format argument
  is gone — pass bytes alone (§ 7). It does a full decode and returns a
  boolean; it never throws. When you need the failure reason, call `fromXdr`
  in a `try`/`catch` instead (§ 15).

  ```ts
  // Before
  if (xdr.TransactionEnvelope.validateXDR(str, "base64")) { … }

  // After
  if (xdr.TransactionEnvelope.validateXdr(str, "base64")) { … }
  ```

- **`xdr.scvSortedMap()`** is gone. The legacy SDK monkey-patched it onto the
  `xdr` namespace for backwards compatibility; the new layer doesn't. Use the
  top-level export, which was always the real home:
  `import { scvSortedMap } from "@stellar/stellar-sdk"`.

If you depended on the `Reader`/`Writer` previously obtained through the SDK,
depend on `@stellar/js-xdr` directly instead. Note that v5's `Reader`/`Writer`
API differs from v4's (the wire format is unchanged); if you still need the v4
runtime for legacy code, install it under an alias:

```jsonc
// package.json
"dependencies": {
  "js-xdr-v4": "npm:@stellar/js-xdr@4.0.0"
}
```

---

## 14. Optional fields: `null`, not `undefined`

An absent optional (`T*` in the XDR) now decodes to **`null`**. The legacy layer
used `undefined`:

```ts
// Legacy: an unset optional read back as undefined
tx.cond().v2().timeBounds(); // undefined

// Now: null
xdr.PreconditionsV2.fromXdr(bytes).timeBounds; // null
```

This is a **silent** change. The shape of the check is what breaks, not the
type:

```ts
// ⚠ Compiles, never matches any more
if (v2.timeBounds === undefined) { … }

// ⚠ Worse: the guard passes for null, then the access throws
if (v2.timeBounds !== undefined) {
  v2.timeBounds.minTime; // TypeError: … of null
}

// ✅ Covers both
if (v2.timeBounds == null) { … }
if (!v2.timeBounds) { … }
```

Construct absent fields with `null`, not `undefined`. TypeScript already
requires it (`timeBounds: TimeBounds | null`), and the runtime holds you to it
at encode time: the constructor stores whatever you pass, so `undefined` or an
omitted key still builds an instance, but `toXdr()` / `toXdrObject()` on that
instance then throws: a `TypeError` for struct-typed optionals, an
`xdr.XdrError` for primitive ones. Decoded values are always `null`. Prefer
`== null` / falsy checks over `=== undefined` everywhere.

In JSON output an unset optional is `null` too (§ 12).

---

## 15. Errors and validation

Every failure in the XDR layer now throws **`XdrError`**, which the SDK exports,
so you can finally match on the class instead of on message text:

```ts
import { xdr } from "@stellar/stellar-sdk";

try {
  xdr.TransactionEnvelope.fromXdr(input, "base64");
} catch (e) {
  if (e instanceof xdr.XdrError) { … }
}
```

Two things to know when migrating:

- Every message changed. The v4 runtime threw `XdrReaderError` /
  `XdrWriterError` (neither of which the SDK exported, so message-matching was
  the only option) with text like `"XDR Write Error: invalid i32 value"`. The
  equivalent is now `"Uint32: value 4294967296 out of range [0, 4294967295]"`.
  Any `catch` block matching on error text needs rewriting.
- There is one exception to the rule. Invalid base64 surfaces as a
  `DOMException: Invalid character` from the platform decoder, not an
  `XdrError`. Catch broadly if you accept untrusted base64.

Strictness itself is mostly unchanged. v4 also rejected buffers it didn't fully
consume (`"source buffer not entirely consumed"`), which is now
`"Asset: trailing 4 byte(s) after XDR value"`. Byte-length mismatches on
fixed-size fields, out-of-range integers, unknown union discriminants, and
unknown enum values all throw as before, with new wording.

`validateXDR` survives as `validateXdr` (casing matches `fromXdr`/`toXdr`) —
see § 13. It returns a bare boolean; decode directly when you need the error.

### Enum lookup

Enums keep name- and value-based lookup, useful when decoding from external
input:

```ts
xdr.AssetType.fromName("assetTypeCreditAlphanum4");
xdr.AssetType.fromValue(1);
```

---

## 16. Changes outside the `xdr` namespace

The XDR swap changed a few SDK-level behaviors that have nothing to do with
typing `xdr.` yourself. These are the easiest ones to miss because most produce
no error at all.

### `scValToNative` may return bytes for a string

An `scvString` whose contents aren't valid UTF-8 now comes back as a
`Uint8Array` instead of a lossily-decoded string:

```ts
scValToNative(xdr.ScVal.scvString("hello")); // "hello"      (string, as before)
scValToNative(xdr.ScVal.scvString(rawBytes)); // Uint8Array   (was a U+FFFD string)
```

The legacy implementation looked like it did this, but its byte-returning branch
was unreachable: it decoded with a non-fatal `TextDecoder`, which never throws.
So in practice legacy **always** returned a string. Code doing
`result.startsWith(…)`, `result.trim()`, `result.length`, or
`typeof result === "string"` on contract output is now data-dependent.

`scvSymbol` follows the same rule, but it can't reach the byte-returning branch
in practice: the host restricts symbols to `[_0-9A-Za-z]` and at most 32 bytes,
rejecting anything else with `Error(Value, InvalidInput)`, so a symbol that came
off the network is always valid UTF-8.

The same applies to `contract.Spec.scValToNative` and `funcResToNative` for
`Bytes` / `BytesN`, which return `Uint8Array`; because those are generically
typed (`T`), TypeScript won't flag it.

### `homeDomain` and data-entry names decode as UTF-8, not ASCII

`Operation.fromXdrObject` used `.toString("ascii")`, which masks every byte to 7
bits. It now decodes UTF-8 leniently, so bytes ≥ `0x80` read back differently:

```ts
// wire dataName bytes: [0xC3, 0xA9]
rec.name; // "é"   — was "C)"
```

Affects `manageData`'s `name`, `setOptions`'s `homeDomain`, and
`revokeSponsorship`'s data-entry name. **No valid operation is affected.**
stellar-core's
[`isStringValid`](https://github.com/stellar/stellar-core/blob/master/src/util/types.cpp)
rejects any byte outside `0x20`–`0x7E` in all three, and ASCII and UTF-8 agree
over that range. Only synthetic or hand-forged XDR decodes differently.

For such input the new decode round-trips valid UTF-8 (the legacy pairing of
ASCII reads with UTF-8 writes did not) but still loses bytes that aren't valid
UTF-8, which become U+FFFD. If you need byte fidelity, read the `XdrString`
instead of going through `Operation.fromXdrObject`: `attrs.homeDomain.bytes`,
`.asStringOrBytes()` to branch, or `.toStringStrict()` to throw.

### `SorobanDataBuilder` rebuilds instead of mutating

Setters used to mutate one internal object; they now replace it. Any value you
captured earlier is a stale snapshot:

```ts
const fp = builder.getFootprint();
builder.setReadOnly(keys);
fp.readOnly.length; // 0 — the builder moved on without it
```

Re-read from the builder after each call, and note that the legacy
mutate-through idiom (`builder.getFootprint().readOnly(keys)`) is gone, because
footprint fields are readonly arrays now.

### `MuxedAccount.setId` no longer mutates a handed-out object

This section covers the top-level `MuxedAccount` helper class. The XDR union
`xdr.MuxedAccount` has no setter methods, and its fields are declared
`readonly`.

```ts
import { Account, MuxedAccount } from "@stellar/stellar-sdk";

const muxed = new MuxedAccount(new Account(pubKey, "1"), "5");
const held = muxed.toXdrObject(); // an xdr.MuxedAccount
muxed.setId("99");

// `toXdrObject()` returns the `MuxedAccount` union, so narrow before
// reading the arm (see § on union access).
if (held.type === "keyTypeMuxedEd25519") {
  held.med25519.id; // 5n — still the old id
}
```

`setId` replaces the internal XDR object instead of mutating it in place, so
call `toXdrObject()` again afterwards.

#### How to check for the two cases above

The legacy mutate-through idiom fails loudly. Those accessors were methods, and
they no longer exist:

```ts
held.med25519().id(99n);
// tsc:     error TS2339: Property 'med25519' does not exist on type 'MuxedAccount'
// runtime: TypeError: held.med25519 is not a function
```

TypeScript users get a build error; plain-JS users get a `TypeError` the first
time the line runs. Neither can keep mutating unnoticed. (A direct field write,
`held.med25519.id = 99n`, is a `readonly` error in TypeScript. Nothing is frozen
at runtime, though, so from JS the write lands and silently desyncs the helper's
cached `id()` and M-address.)

What *is* silent is narrower: capture a reference, call a mutator, then read the
stale capture. Seven methods can do it: `MuxedAccount.setId`, plus
`SorobanDataBuilder.setResourceFee`, `setResources`, `appendFootprint`,
`setFootprint`, `setReadOnly`, and `setReadWrite`. Only `MuxedAccount.toXdrObject()`
and `SorobanDataBuilder.getFootprint()` (and `getReadOnly`&nbsp;/
`getReadWrite`, which delegate to it) hand out a reference that can go stale;
`SorobanDataBuilder.build()` returns a clone, so the normal build path is
unaffected.

```sh
tsc --noEmit    # catches every mutate-through

rg -n '\.setId\(|\.set(ResourceFee|Resources|Footprint|ReadOnly|ReadWrite)\(|\.appendFootprint\('
```

For each hit, look back for a `toXdrObject()` or `getFootprint()` result stored
in a variable and forward for a read of it. If the getter result is used
immediately, which is the usual shape, there is nothing to fix.

### Byte-typed results

`getLiquidityPoolId()`, `AuthEntrySignature.signature`, and the second argument
handed to a `SigningCallback` are all `Uint8Array` now. `.toString("hex")` on
any of them silently yields comma-joined decimals. See
[`UINT8ARRAY_MIGRATION.md`](./UINT8ARRAY_MIGRATION.md).
