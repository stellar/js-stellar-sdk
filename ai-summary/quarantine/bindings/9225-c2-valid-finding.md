# R9225-C2: Duplicate-named UDT entries cause first-match resolution, serializing a UDT argument against the wrong attacker-chosen declaration

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/9225-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Same decode→embed→reconstruct root cause as C1, but a distinct serialization sink at the UDT
resolution branch.

1. **No dedup on construct.** As in C1, `Spec.constructor` (`src/contract/spec.ts:520-538`) and
   `processSpecEntryStream` (`src/contract/utils.ts:181-189`) admit two entries that share a UDT
   name (two `scSpecEntryUdtStructV0` named `Args`, or a struct and a union with the same name) with
   no uniqueness or kind-consistency check. Both survive `entry.toXDR("base64")` embedding and
   `new Spec([...])` reconstruction (`src/bindings/client.ts:43-62`).

2. **UDT serialization resolves purely by name.** When a function input (or nested type) is a UDT,
   `nativeToScVal` (`src/contract/spec.ts:666-672`) takes the `scSpecTypeUdt` branch and calls
   `this.nativeToUdt(val, udt.name().toString())` — resolution is by raw name string only.

3. **First-match selection sink.** `nativeToUdt` (`src/contract/spec.ts:876-893`) calls
   `findEntry(name)` (`647-654`, first-match `.find`) and then dispatches on the **first** entry's
   kind via `entry.switch()`: `scSpecEntryUdtEnumV0` → `nativeToEnum` (`956-961`),
   `scSpecEntryUdtStructV0` → `nativeToStruct` (`933-954`), `scSpecEntryUdtUnionV0` → `nativeToUnion`
   (`895-931`). The developer's native value is therefore serialized against the **first**
   declaration's kind and field set, not the one their generated types represent.

## Findings

**Security impact: Medium — contract binding type confusion; a UDT argument is serialized into a
materially different ScVal structure than intended, inside the transaction the developer signs.**

Under the attacker-controlled-spec trust boundary, the attacker declares a UDT name twice with
differing fields/kind. Concrete silent-corruption variant:

- Two `scSpecEntryUdtStructV0` named `Args`, both numeric-field (tuple) structs, with the field
  *types* reordered (e.g. first `(i128, Address)`, second `(Address, i128)`). `nativeToStruct`
  (`spec.ts:933-943`) detects numeric field names and emits a positional
  `scvVec(fields.map((_, i) => nativeToScVal(val[i], fields[i].type())))`. Resolution against the
  first entry produces a `ScVec` whose element order/types follow the attacker's first declaration,
  silently differing from the developer's intent.

Other shapes are also material though some fail closed: a struct-vs-union kind mismatch makes
`nativeToUdt` dispatch on the first entry's kind, so a value shaped for a union (`{tag, values}`)
hitting a first `struct` entry (or vice versa) generally throws (fail-closed); but two same-kind
structs/unions with overlapping-but-different field/case sets can serialize successfully into a
wrong `ScMap`/`ScVec`/enum value.

This is a genuine deviation from expected behavior: a UDT name that maps to more than one definition
(or to definitions of different kinds) is ambiguous and should be rejected before serialization;
instead the SDK silently serializes against the first. Severity is Medium (below C1's High) because
it requires the developer to pass a UDT-typed argument and the resulting on-chain consequence
depends on the contract's decoder, but the SDK-level integrity gap — silent first-match UDT
selection — is the material defect, matching the "Contract binding type confusion" / "Parser
ambiguity that changes user-visible security decisions" categories.

Distinctness: shares the `findEntry` first-match root cause with C1 but a **different sink**
(`nativeToUdt` UDT field/kind resolution vs `funcArgsToScVals` function-input ordering) and a
different material shape (struct/union/enum `ScVal` structure). It is also distinct from the
already-VIABLE struct type-name collision finding (js-sdk-b83e13b0), which is at the **codegen**
layer (duplicate `export interface` emission relying on TypeScript declaration merging — a
compile-time type-misrepresentation); this finding is the **runtime** serialization layer where the
wrong UDT definition shapes an actual transaction `ScVal`. Reported separately so a fix at the
function sink (C1) or at the codegen layer does not silently leave the runtime UDT sink open.

## PoC Guidance

- **Test file**: append to `test/unit/spec_test.js` (or a focused new
  `test/unit/spec_duplicate_udt_test.ts`).
- **Setup**: Build two `xdr.ScSpecEntry.scSpecEntryUdtStructV0` entries with the same `name` `"Args"`
  but reordered numeric (tuple) fields: first `[{name:"0", type:i128},{name:"1", type:Address}]`,
  second `[{name:"0", type:Address},{name:"1", type:i128}]`. Plus a `transfer(arg: Args)` function
  entry. Construct `const spec = new Spec([fnEntry, structA, structB])`.
- **Steps**: Call `spec.funcArgsToScVals("transfer", { arg: [1000n, addr] })` (or call
  `nativeToScVal` against the UDT type directly).
- **Assertion**: Assert the produced UDT `ScVal` is an `scvVec` whose element types follow the first
  struct declaration (`[i128, Address]`) rather than the second (`[Address, i128]`), demonstrating
  the attacker-chosen first definition dictates UDT serialization. Optionally assert
  `spec.entries.filter(e => name=="Args").length === 2` (duplicate survived, no dedup).

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-141e7e53d5e76a2438d35f97"
weakness = "transaction serialization integrity"
record_kind = "single_path"
path = ["nativeToScVal", "nativeToUdt", "findEntry", "nativeToStruct"]
sink = "nativeToUdt"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["src/contract/spec.ts:nativeToUdt", "src/contract/spec.ts:nativeToScVal", "src/contract/spec.ts:findEntry", "src/contract/spec.ts:nativeToStruct", "src/contract/spec.ts:nativeToUnion", "src/contract/spec.ts:nativeToEnum"]
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
rules_out = ["source trace of nativeToUdt (spec.ts:876-893) -> findEntry (647-654) confirms UDT resolution is by raw name with first-match .find and dispatch on the first entry's kind, with no uniqueness or kind-consistency guard in Spec.constructor/processSpecEntryStream, so wrong-definition UDT serialization is not blocked", "distinct from the codegen struct type-name collision finding (js-sdk-b83e13b0): that is compile-time export interface declaration merging; this sink is runtime nativeToUdt producing an actual transaction ScVal"]
does_not_rule_out = ["duplicate function-name serialization (C1), a distinct sink", "struct-vs-union kind-mismatch variants that fail closed in nativeToUdt/nativeToStruct rather than serializing silently", "whether a specific on-chain contract decoder treats the wrong-shaped UDT ScVal as fund-moving"]
assumptions = ["attacker controls spec/RPC bytes per objective trust boundary", "developer generates bindings for the untrusted contract and passes a UDT-typed argument to a generated method", "the SDK does not enforce UDT name uniqueness or kind consistency, so attacker-served spec metadata can carry duplicate UDT names"]
mechanism_brief = "Duplicate same-name UDT entries survive entry.toXDR embedding and new Spec([...]); nativeToScVal's UDT branch resolves by raw name via nativeToUdt -> findEntry first-match and dispatches on the first entry's kind/fields, serializing a UDT argument against the attacker-chosen first declaration into a materially different ScMap/ScVec/enum inside the signed transaction."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/client.ts:generate"
guarantee = "entry.toXDR base64 roundtrip is lossless but does not constrain UDT name resolution among duplicates at runtime"

[[blockers]]
kind = "not_found"
source = "src/contract/spec.ts:nativeToUdt"
guarantee = "no uniqueness or kind-consistency guard exists for UDT names before nativeToUdt serialization on this exact path"
```
