# R9225-C1: Duplicate-named contract functions cause first-match serialization of transaction args against an attacker-chosen declaration

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/9225-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

I traced the full decode → embed → reconstruct → serialize path in current source.

1. **Decode/construct (no dedup).** `Spec.constructor` (`src/contract/spec.ts:520-538`) assigns
   `this.entries` directly from the supplied array, or from `processSpecEntryStream`
   (`src/contract/utils.ts:181-189`) which loops `while (!reader.eof)` pushing every
   `xdr.ScSpecEntry.read(reader)` with **no uniqueness / count-by-name / dedup check**. Two
   entries with the identical function name both survive.

2. **Embed into generated client (duplicates preserved).** `ClientGenerator.generate`
   (`src/bindings/client.ts:43-45`) emits `this.spec.entries.map(entry => "${entry.toXDR("base64")}")`
   and reconstructs `new Spec([${specEntries}])` (`src/bindings/client.ts:62`). All entries —
   including duplicates — are faithfully round-tripped into the runtime spec (prior memory confirms
   the per-entry base64 round-trip is lossless).

3. **Runtime method wiring (both entries iterated; same name string).** The base `Client`
   constructor (`src/contract/client.ts:105-128`) does
   `this.spec.funcs().forEach(xdrFn => { const method = xdrFn.name().toString(); ... })`. With a
   duplicate name, both closures bind to the *same* `method` string; whichever is assigned last wins
   as `this[method]`, but every closure serializes via `spec.funcArgsToScVals(method, args)`
   (`src/contract/client.ts:116`).

4. **First-match selection sink.** `funcArgsToScVals` (`src/contract/spec.ts:590-595`) →
   `getFunc` (`562-570`) → `findEntry` (`647-654`). `findEntry` returns
   `this.entries.find(e => e.value().name().toString() === name)` — the **first** name match. The
   later duplicate is unreachable but trusted as present. `funcArgsToScVals` then maps
   `fn.inputs()` **in order**, reading each input by name with `readObj(args, input)`, producing a
   positional `xdr.ScVal[]`. The positional order and per-field types are therefore fully determined
   by the **first** declaration, regardless of the signature the developer believes (per generated
   types) they are invoking.

## Findings

**Security impact: High — transaction submitted with different contract arguments than the
application intended (contract binding type confusion).**

The objective trust boundary is an attacker-controlled contract spec / RPC server
(`contract_spec_names_types_and_wasm_bytes`, no auth) via `fromWasm` / `fromContractId` /
`fromWasmHash` / `fromSpec`. An attacker who serves a tampered spec can include two
`scSpecEntryFunctionV0` entries with the identical name but differing input lists.

The cleanest *silent, successful, materially-wrong* exploit is **input reordering with identical
field names/types**:

- First entry: `transfer(amount: i128, to: Address)`
- Second entry: `transfer(to: Address, amount: i128)`

The generated `export interface Client` declaration-merges both signatures, so the developer codes
`client.transfer({ to, amount })`. At runtime `funcArgsToScVals("transfer", {to, amount})` resolves
the **first** entry, reads `args.amount`→i128 and `args.to`→Address (both succeed, types match the
named values), and emits the positional array `[i128(amount), Address(to)]` — i.e. the arguments
are **swapped** relative to what the developer intended and relative to the contract the developer
believes they are calling. This `ScVal[]` becomes the `InvokeContractArgs` of the transaction the
developer signs and submits. No exception is thrown; nothing flags the ambiguity.

This is a genuine deviation from expected behavior: an SDK whose `Spec` lookup assumes unique names
should reject (or disambiguate) a spec that maps one callable name to multiple declarations before
serializing any argument. Instead it silently serializes against the attacker-chosen first
declaration. It maps directly to the High impact category "Transaction submitted with different …
contract arguments than the application intended" and to "Contract binding type confusion".

Notes on related cases that strengthen viability:
- Type-narrowing variants (e.g. first `amount: u32`, second `amount: i128`) tend to **fail closed**
  (out-of-range / type-mismatch throw in `nativeToScVal`), so the strongest case is the
  reorder/compatible-type variant above, which succeeds silently.
- This is distinct from the dismissed single-entry `toXDR` round-trip/injection route
  (js-sdk-a81567cffe…): lossless round-trip of *one* entry says nothing about *which* of several
  same-named entries is selected. It is also distinct from the already-VIABLE codegen
  identifier-collision findings (js-sdk-b83e13b0, js-sdk-09e5b44c, js-sdk-310bbe7b…), which live at
  the TypeScript interface/identifier *emission* layer; this finding's sink is the **runtime**
  `Spec` lookup → `funcArgsToScVals` and its material effect is the actual serialized transaction
  arguments.

## PoC Guidance

- **Test file**: append to `test/unit/spec_test.js` (or a focused new
  `test/unit/spec_duplicate_entry_test.ts`).
- **Setup**: Build two `xdr.ScSpecEntry.scSpecEntryFunctionV0` entries with the same name
  `transfer` but reordered inputs (`[amount: i128, to: Address]` then `[to: Address, amount: i128]`).
  Construct `const spec = new Spec([entryA, entryB])` (or pass both base64 strings to mimic the
  generated client's `new Spec([...])`).
- **Steps**: Call `spec.funcArgsToScVals("transfer", { to: addr, amount: 1000n })`.
- **Assertion**: Assert the returned `ScVal[]` is positionally `[i128(1000), Address(addr)]`
  (first-entry order) rather than the intended `[Address(addr), i128(1000)]`, demonstrating that the
  serialized argument order is dictated by the attacker's first declaration. Optionally assert that
  `spec.funcs()` contains two `transfer` entries (proving the duplicate survived with no dedup).

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-141e7e53d5e76a2438d35f97"
weakness = "transaction serialization integrity"
record_kind = "single_path"
path = ["Client.constructor", "funcArgsToScVals", "getFunc", "findEntry"]
sink = "funcArgsToScVals"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["src/contract/spec.ts:findEntry", "src/contract/spec.ts:getFunc", "src/contract/spec.ts:funcArgsToScVals", "src/contract/spec.ts:Spec.constructor", "src/contract/client.ts:Client.constructor", "src/bindings/client.ts:generate"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace of Spec.constructor (spec.ts:520-538), processSpecEntryStream (utils.ts:181-189), getFunc/findEntry (spec.ts:562-570,647-654) confirms no duplicate-name rejection, dedup, or uniqueness guard exists on the decode->construct->serialize path, so first-match selection of an ambiguous same-named function entry is not blocked", "this finding is not the dismissed single-entry toXDR roundtrip/injection route (js-sdk-a81567cffe): lossless roundtrip of one entry does not constrain which of several same-named entries findEntry selects", "this finding is not the already-VIABLE codegen identifier-collision findings: sink is runtime funcArgsToScVals, not TypeScript interface/identifier emission"]
does_not_rule_out = ["duplicate-UDT-name struct/union/enum serialization (C2), a distinct sink", "type-narrowing duplicate variants that fail closed in nativeToScVal rather than serializing silently", "whether a specific on-chain contract treats the reordered/retyped args as fund-moving"]
assumptions = ["attacker controls spec/RPC bytes per objective trust boundary (contract_spec_or_rpc_server)", "developer generates bindings for and calls the untrusted contract via the generated client (client.ts:105-128)", "a real Soroban wasm exports unique function names, but the attacker-served spec metadata is not so constrained and the SDK does not enforce uniqueness"]
mechanism_brief = "Duplicate same-name function entries survive entry.toXDR embedding and new Spec([...]); runtime findEntry first-match makes funcArgsToScVals serialize transaction args positionally against the attacker-chosen first declaration's input order/types, with no dedup/uniqueness guard, producing a signed/submitted transaction whose contract arguments differ from the application's intent."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/client.ts:generate"
guarantee = "entry.toXDR base64 roundtrip is lossless/injection-free per prior memory but does not constrain which of several same-named entries is selected at runtime"

[[blockers]]
kind = "not_found"
source = "src/contract/spec.ts:Spec.constructor"
guarantee = "no duplicate-name rejection, dedup, or uniqueness guard exists in Spec.constructor, processSpecEntryStream, getFunc, or findEntry for this exact path"
```
