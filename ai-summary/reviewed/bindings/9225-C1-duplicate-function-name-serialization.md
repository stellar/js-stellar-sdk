# R9225-1: Duplicate function-name spec entries → runtime first-match argument serialization

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/9225-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full decode → embed → reconstruct → serialize path in current source:

- `src/contract/spec.ts:520-538` (`Spec.constructor`): the only validation is the
  empty-array throw (`entries.length === 0`). Decoded entries are assigned
  directly (`this.entries = entries`) or via `processSpecEntryStream`. There is
  **no** dedup, name-uniqueness, or count-by-name check.
- `src/contract/spec.ts:544-552` (`funcs()`): filters entries by
  `scSpecEntryFunctionV0` kind and returns **all** of them — duplicates included,
  no dedup.
- `src/contract/spec.ts:647-655` (`findEntry`): resolves by raw name with
  first-match semantics — `this.entries.find((e) => e.value().name().toString() === name)`.
  Later same-named entries are unreachable but were already trusted into the set.
- `src/contract/spec.ts:562-570` (`getFunc`) and `590-595` (`funcArgsToScVals`):
  `funcArgsToScVals(name, args)` → `getFunc(name)` → `findEntry(name)` returns the
  **first** match; arguments are then serialized through that first entry's
  `inputs().map(... nativeToScVal(readObj(args, input), input.type()))`.
- `src/bindings/client.ts:43-64` (`ClientGenerator.generate`): every
  `this.spec.entries` is embedded via `entry.toXDR("base64")` and the generated
  client reconstructs `new Spec([${specEntries.join(", ")}])`. Duplicate entries
  are roundtripped losslessly into the runtime spec (consistent with prior
  `entry.toXDR` lossless record js-sdk-a81567cffe…, which does **not** constrain
  multi-entry selection).
- `src/contract/client.ts:105-135` (base `ContractClient` constructor): iterates
  `this.spec.funcs().forEach`, binding `this[sanitizeIdentifier(method)]` per
  entry. With two `transfer` entries the binding is overwritten by the second
  closure, but **both** closures close over the same `method` string and call
  `spec.funcArgsToScVals("transfer", args)`, so serialization always resolves via
  `findEntry` to the **first** entry regardless of which closure survives.

The hypothesis's "Expected Behavior" (an ambiguous spec resolving the same
callable name to multiple declarations should be rejected/disambiguated before
any argument is serialized) is defensible under the in-scope attacker-controlled
spec trust boundary, and the code genuinely deviates: it silently serializes
against the first declaration with no guard.

## Findings

Under the objective's in-scope trust boundary (contract spec / RPC server is
attacker-controlled; `fromWasm`/`fromContractId`/`fromSpec`), an attacker crafts
a spec with two `scSpecEntryFunctionV0` entries sharing a function name but
differing in input types/order/names. The generated TypeScript surfaces both
(overloaded signatures), promising the developer one serialization contract,
while the runtime locks every call to the first entry's input declaration. This
is a contract-binding type confusion that misrepresents the contract interface
and can place ScVals into `InvokeContractArgs` that differ from what the
application intended (different types, different positional order via `readObj`
name-keyed reads mapped in the first entry's input order).

Maps to the objective High impact categories: "Transaction submitted with …
different contract arguments than the application intended (contract binding type
confusion)" and "bindings generated from attacker-controlled spec data … produce
methods/types that misrepresent the contract interface." Severity assigned High
on that basis. Confidence is held at medium because realized on-chain fund
movement is contract-dependent: many divergences throw during `nativeToScVal` or
are rejected host-side as a type mismatch; the source-proven, non-conditional
SDK defect is the silent first-match serialization against an ambiguous,
attacker-controlled spec with no uniqueness guard.

Distinct from prior VIABLE codegen-layer findings (js-sdk-b83e13b0 duplicate
`export interface` merging, js-sdk-09e5b44c sanitize-identifier member collision,
js-sdk-310bbe7b field shadowing): those live at the TS identifier/interface
emission layer. This finding's sink is the runtime `Spec` lookup
(`findEntry`/`funcArgsToScVals`) and its material effect is the actual emitted
transaction ScVal arguments — a different sink and different material effect.
Also distinct from exact duplicates: it does not rely on sanitization collision
(raw names are identical) and is not the `entry.toXDR` injection/roundtrip angle.

## PoC Guidance

- **Test file**: append to an existing `test/unit/spec` or contract spec unit
  test (e.g. `test/unit/spec_test.js` / equivalent under `test/unit`).
- **Setup**: build two `xdr.ScSpecEntry.scSpecEntryFunctionV0` entries with the
  identical name `transfer` but different `inputs` (first `amount: u32`, second
  `amount: i128`). Construct `new Spec([entryA, entryB])` (or feed both base64
  strings to mirror the embedded-client path).
- **Steps**: call `spec.funcArgsToScVals("transfer", { to, amount })` with an
  `amount` intended for the i128 declaration.
- **Assertion**: the resulting `xdr.ScVal[]` is serialized against the first
  (u32) declaration (assert the produced ScVal switch is `scvU32`, not the i128
  type, or that input ordering follows the first entry), demonstrating the
  developer's intended declaration was not the one used. Optionally assert
  `new Spec([entryA, entryB])` does not throw on the duplicate name.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-141e7e53d5e76a2438d35f97"
weakness = "transaction serialization integrity"
record_kind = "single_path"
path = ["generate", "funcArgsToScVals", "getFunc", "findEntry"]
sink = "findEntry"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["src/contract/spec.ts:findEntry", "src/contract/spec.ts:getFunc", "src/contract/spec.ts:funcArgsToScVals", "src/contract/spec.ts:Spec.constructor", "src/bindings/client.ts:generate", "src/contract/client.ts:Client.constructor"]
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
rules_out = ["source trace of Spec.constructor (spec.ts:520-538), funcs (spec.ts:544-552), findEntry (spec.ts:647-655) and getFunc/funcArgsToScVals (spec.ts:562-595) confirms no dedup/uniqueness/first-vs-duplicate guard blocks first-match serialization of an ambiguous spec", "entry.toXDR lossless roundtrip (prior js-sdk-a81567cffe) does not constrain which of several same-named entries is selected, so it does not block this candidate"]
does_not_rule_out = ["duplicate-UDT-name struct/union/enum serialization (C2)", "codegen identifier/interface-collision findings already reported (js-sdk-b83e13b0, js-sdk-09e5b44c, js-sdk-310bbe7b)", "whether a specific on-chain contract realizes fund movement from the mis-serialized args"]
assumptions = ["contract spec / RPC server is attacker-controlled per objective scope", "a malicious spec can carry two scSpecEntryFunctionV0 entries with an identical name (not producible by legitimate compilation but representable in crafted XDR)", "developer generates bindings for and submits to the untrusted contract"]
mechanism_brief = "Duplicate same-name function entries survive entry.toXDR embedding into new Spec([...]); runtime findEntry first-match makes funcArgsToScVals serialize transaction args against the attacker-chosen first declaration's input types/order, with no dedup/uniqueness guard anywhere on decode->construct->serialize."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:funcArgsToScVals"
guarantee = "entry.toXDR base64 roundtrip is lossless/injection-free per prior record but does not constrain which of several same-named function entries is selected for serialization"

[[blockers]]
kind = "not_found"
source = "src/contract/spec.ts:Spec.constructor"
guarantee = "no duplicate-name rejection or name-uniqueness guard exists in Spec.constructor, funcs, findEntry, or getFunc for this exact viable path"
```
