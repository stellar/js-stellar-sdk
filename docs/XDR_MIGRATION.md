# Migration Guide

This release replaces the `@stellar/js-xdr`-backed XDR layer with an in-tree,
class-based one (`src/base/xdr/`). The wire format is unchanged, but **every
XDR value now exposes a different API** — discriminated-union classes with
property access instead of method-call-style getters and setters.

This guide documents every user-visible change so you can update existing
code.

---

## 1. Method-name changes (XDR/JSON acronyms → PascalCase)

The all-caps acronyms in method names normalize to single-initial-cap form.
This is the one rename that **does** affect application code.

| Before              | After             |
| ------------------- | ----------------- |
| `value.toXDR()`     | `value.toXdr()`   |
| `Class.fromXDR(…)`  | `Class.fromXdr(…)`|
| `value.toXDRObject()` | `value.toXdrObject()` |
| `Class.fromXDRObject(…)` | `Class.fromXdrObject(…)` |
| `Class.fromJSON(json)` | `Class.fromJson(json)` |
| `asset.toChangeTrustXDRObject()` | `asset.toChangeTrustXdrObject()` |
| `asset.toTrustLineXDRObject()` | `asset.toTrustLineXdrObject()` |

`toJSON()` is **kept as-is** — it's a JavaScript standard called automatically
by `JSON.stringify()`, and renaming it would break that integration.

> **Note on type/field names.** The PascalCase-with-collapsed-acronyms rule
> (`AccountId`, `ScVal`, `Uint128Parts`, `TtlEntry`, `HashIdPreimage`,
> `ScSpecUdtUnionV0`, …) **also** applies to types — but those names already
> matched the legacy SDK's public surface. The names you imported from
> `@stellar/stellar-sdk` haven't changed. Field names on structs
> (`accountId`, `sponsoredId`, `offerId`, `balanceId`, `sellerId`, …) are
> likewise unchanged. The only rename that breaks application code is the
> method-name table above.

---

## 2. Union types: discriminated classes, not switch/value pairs

The biggest behavioral change. Every XDR `union` (and any type defined like
one — `Asset`, `SCVal`, `OperationBody`, `LedgerEntryData`, `TransactionEnvelope`,
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

The legacy `new xdr.UnionType(discriminant, payload)` pattern is gone (the
base class is now `abstract`). Use the per-variant factory:

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
`test/unit/base/support/xdr.ts` (and is the recommended pattern in
application code too):

```ts
import { expectVariant } from "@stellar/stellar-base/.../xdr.js";

const v1 = expectVariant(tx.toEnvelope(), "envelopeTypeTx").v1;
const cond = expectVariant(v1.tx.cond, "precondV2").v2;
// cond is fully typed PreconditionsV2 here
```

---

## 3. Enums: singletons, not factory calls

```ts
// Before — factory-call returning an enum singleton
xdr.AssetType.assetTypeNative()
xdr.ScValType.scvU32()
xdr.SignerKeyType.signerKeyTypeEd25519()
xdr.ContractDataDurability.persistent()

// After — drop the parens
xdr.AssetType.assetTypeNative
xdr.ScValType.scvU32
xdr.SignerKeyType.signerKeyTypeEd25519
xdr.ContractDataDurability.persistent
```

Each enum member is now a static readonly instance with `.name` (string) and
`.value` (number) properties. To compare, prefer `obj.type === "name"`
(see § 2). For raw enum equality, instances are reference-stable
singletons — `===` works.

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

For backward compatibility, `new xdr.Int64(v)` is still supported (via a
`Proxy` `construct` trap that returns a boxed bigint), but the call form
`xdr.Int64(v)` is preferred.

---

## 5. Wide ints: bigint-direct, not `LargeInt` subclasses

`Int128`, `Uint128`, `Int256`, `Uint256` are now thin classes built on the
new `BigIntValue` base. They hold a single `value: bigint` and round-trip
through the generated `Int128Parts` / `Uint128Parts` / etc. structs.

```ts
// Before — multi-arg constructors with 32- or 64-bit slices
new Int128(lo, hi)
new Int256(loLo, loHi, hiLo, hiHi)
new Uint256(1n, 2n, 3n, 4n).toBigInt()
i128.size                                  // 128
i128.unsigned                              // false

// After — single bigint
new Int128(42n)
new Uint256(123456789n).value              // bigint
Int128.fromXdrObject({ hi, lo })           // round-trip via the parts struct
i128.value                                  // bigint
i128.toParts()                              // { hi, lo }
i128.toXdr()                                // 16 bytes
Int128.fromJson("42")                       // JSON deserialize
```

To reconstruct a bigint from XDR parts (the old `new Int128(lo, hi).toBigInt()`
pattern), use `XdrLargeInt` directly. It accepts slices in **big-endian**
order (parts[0] is most significant):

```ts
import { XdrLargeInt } from "@stellar/stellar-base";

new XdrLargeInt("i128", [i128.hi, i128.lo]).toBigInt();
new XdrLargeInt("u256", [hiHi, hiLo, loHi, loLo]).toBigInt();
```

`XdrLargeInt` also **range-checks at construction** for single-value form
(legacy `LargeInt` did this; the new bigint-direct impl preserves the
behavior). `new XdrLargeInt("u64", 1n << 64n)` throws a `RangeError`.

`ScInt` is unchanged.

---

## 6. Bytes: `Uint8Array` everywhere

Every fixed-length and variable-length byte field is a `Uint8Array`. The
SDK used to surface `Buffer` in many places — now it's `Uint8Array`. `Buffer`
**is** a `Uint8Array` subclass so most code that just reads bytes (indexing,
`.length`) keeps working. The differences appear when:

- **You compare values with `toEqual` / deep equality.** `Buffer` vs
  `Uint8Array` containing identical bytes are *not* deep-equal under vitest /
  Jest. Convert with `Array.from()` on both sides, or compare via
  `.toXdr("base64")`.
- **You call Buffer-only methods** (e.g. `.toString("hex")`). Wrap at the
  boundary: `Buffer.from(uint8array).toString("hex")`.
- **You construct an XDR class that wants `Hash` or `SCBytes`.** Wrap raw
  bytes in the field type:

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

---

## 7. `toXdr()` / `fromXdr()`: simpler signatures

The legacy `toXDR()` (no args) returned a `Buffer`; `toXDR("base64")` returned
a string. The new `toXdr()` returns `Uint8Array` by default; `toXdr("base64")`
or `toXdr("hex")` returns a string. **No more `.toXDR().toString("base64")`
pattern** — that was a Buffer idiom and will now produce comma-separated
bytes instead of base64.

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

Every field on a generated XDR class is `readonly`. Code that mutated XDR
values after construction will silently no-op (non-strict) or throw
(strict).

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

`Transaction.toEnvelope()` returns a fresh, decoded copy on every call, so
the legacy "defensive copy" tests still pass — but you can no longer rely on
post-build mutation.

---

## 9. Class-XDR layer: imports, exports, generated docs

### Where to import from

Two import styles work, both pulling from the same canonical layer:

```ts
// Default namespace — best for hand-typed code
import xdr from "@stellar/stellar-base";
xdr.Asset.assetTypeNative();
xdr.ScVal.scvU32(42);

// Named imports — best for migrated code where you want types directly
import { Asset, ScVal, AccountId } from "@stellar/stellar-base";
Asset.assetTypeNative();
```

### Variant-class types

Each union variant ships as its own class (and TS type). Import named
variant types when you need them in annotations or `as` casts (the default
`xdr.X` runtime namespace does not carry variant types):

```ts
import type {
  SCValAddress,
  SCAddressMuxedAccount,
  TransactionEnvelopeTx,
  ScSpecEntryUdtUnionV0,
} from "@stellar/stellar-base";

const v1 = (env as TransactionEnvelopeTx).v1;
```

### Generated TSDoc

Every generated class carries its original `.x` source as a TSDoc comment,
so hovering over a type in your IDE shows the upstream Stellar XDR
definition:

```ts
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
```

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

// ============== METHODS ==============
.toXDR()                     →   .toXdr()
.toXDR().toString("base64")  →   .toXdr("base64")
.fromXDR(buf, "base64")      →   .fromXdr(buf, "base64")
.toXDRObject()               →   .toXdrObject()
.fromXDRObject(wire)         →   .fromXdrObject(wire)
.fromJSON(json)              →   .fromJson(json)

// ============== BYTES ==============
contractExecutableWasm(buf)  →   contractExecutableWasm(new xdr.Hash(buf))
scvBytes(buf)                →   scvBytes(new xdr.ScBytes(buf))

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
import type { SCValAddress } from "@stellar/stellar-base";
const addr = (scv as SCValAddress).address;
```
