# R9225-2: Duplicate UDT-name spec entries → first-match UDT serialization type confusion

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/9225-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the UDT serialization sink in current source:

- `src/contract/spec.ts:666-672` (`nativeToScVal`): when the type switch is
  `scSpecTypeUdt`, it resolves purely by name string —
  `this.nativeToUdt(val, udt.name().toString())`.
- `src/contract/spec.ts:876-893` (`nativeToUdt`): calls `findEntry(name)` then
  dispatches on the **first** entry's kind: `scSpecEntryUdtEnumV0` →
  `nativeToEnum(val, entry.udtEnumV0())`, `scSpecEntryUdtStructV0` →
  `nativeToStruct(val, entry.udtStructV0())`, `scSpecEntryUdtUnionV0` →
  `nativeToUnion(val, entry.udtUnionV0())`.
- `src/contract/spec.ts:647-655` (`findEntry`): first-match by raw name (shared
  root cause with C1). Later same-named UDT entries are silently ignored but were
  embedded into the runtime spec via `entry.toXDR` at codegen
  (`src/bindings/client.ts:43-64`).
- `src/contract/spec.ts:933-954` (`nativeToStruct`), `895-931` (`nativeToUnion`),
  `956-961` (`nativeToEnum`): each builds the ScVal (ScMap field set / ScVec /
  enum u32) entirely from the resolved first definition's fields/cases/kind.
- `src/contract/spec.ts:520-538` (`Spec.constructor`): again no dedup or
  kind-consistency check for UDT names (only the empty-array throw).

The hypothesis's "Expected Behavior" — a UDT name mapping to more than one
definition (or to definitions of different kinds) is ambiguous and should be
rejected before serialization — is defensible under the attacker-controlled spec
boundary, and the code genuinely deviates: it silently serializes against the
first definition.

## Findings

An attacker-controlled spec declares a UDT name twice with differing fields or a
differing kind (e.g. two `Args` structs with different field sets, or a struct
vs union sharing a name). When the developer passes a native value for that UDT
type, `nativeToUdt` → `findEntry` first-match serializes it against the first
definition: a different ScMap field set (struct), a different ScVec/tag shape
(union), or an enum encoding — producing a materially different ScVal structure
than the developer's intended declaration, embedded into the transaction's
contract arguments.

Maps to the objective's "Contract binding type confusion" (Medium floor) and the
parser/serialization-ambiguity category. Severity assigned Medium: realized harm
requires the developer to pass a UDT-typed argument and a cooperating on-chain
decoder; the source-proven SDK defect is the silent first-match UDT resolution
on an ambiguous, attacker-controlled spec with no uniqueness/kind-consistency
guard. Confidence medium (on-chain consequence is contract-dependent; some
mismatches throw in `nativeToStruct`/`nativeToUnion`).

Distinct from C1: shares the `findEntry` first-match root cause but a different
sink (`nativeToUdt`/`nativeToStruct`/`nativeToUnion`/`nativeToEnum` UDT
field/kind serialization vs. function-input serialization) and a different
material shape (ScMap/ScVec/enum structure vs. function arg list). Reported
separately so a fix at the function-name sink does not silently leave the UDT
sink open. Distinct from prior codegen-layer collision findings (js-sdk-b83e13b0
/ 09e5b44c / 310bbe7b) for the same sink/effect reasons as C1.

## PoC Guidance

- **Test file**: append to an existing contract spec unit test under
  `test/unit`.
- **Setup**: build two `xdr.ScSpecEntry` UDT entries sharing a name `Args` —
  e.g. first `scSpecEntryUdtStructV0` with fields `{a: u32}`, second
  `scSpecEntryUdtStructV0` with fields `{b: i128}` (or a struct vs a union of the
  same name). Construct `new Spec([udtA, udtB, funcEntry])` where a function
  input references the UDT `Args`.
- **Steps**: call `spec.funcArgsToScVals(fn, { arg: <native value for Args> })`
  (or `spec.nativeToScVal(val, udtTypeDef)`).
- **Assertion**: the produced ScVal reflects the first definition's
  fields/kind (assert ScMap keys match `udtA`, not `udtB`, or that a struct-vs-
  union kind mismatch is taken from the first entry), demonstrating wrong-
  definition UDT serialization. Optionally assert `new Spec([...])` does not
  throw on the duplicate UDT name.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-141e7e53d5e76a2438d35f97"
weakness = "transaction serialization integrity"
record_kind = "single_path"
path = ["generate", "nativeToScVal", "nativeToUdt", "findEntry"]
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
rules_out = ["source trace of nativeToUdt (spec.ts:876-893), nativeToScVal UDT branch (spec.ts:666-672), findEntry (spec.ts:647-655) and Spec.constructor (spec.ts:520-538) confirms no uniqueness or kind-consistency guard blocks first-match UDT resolution of an ambiguous spec", "entry.toXDR lossless roundtrip (prior js-sdk-a81567cffe) does not constrain UDT name resolution among duplicates, so it does not block this candidate"]
does_not_rule_out = ["duplicate function-name serialization (C1)", "codegen identifier/interface-collision findings already reported (js-sdk-b83e13b0, js-sdk-09e5b44c, js-sdk-310bbe7b)", "whether a specific on-chain contract realizes material harm from the mis-shaped UDT ScVal"]
assumptions = ["contract spec / RPC server is attacker-controlled per objective scope", "a malicious spec can carry two UDT entries with an identical name and differing fields/kind in crafted XDR", "developer passes a native value for the duplicated UDT type when calling the generated client"]
mechanism_brief = "Duplicate same-name UDT entries survive entry.toXDR embedding into new Spec([...]); nativeToUdt resolves by raw name via findEntry first-match and dispatches on the first definition's kind/fields, serializing a UDT argument into a wrong ScMap/ScVec/enum structure, with no uniqueness/kind-consistency guard."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:nativeToUdt"
guarantee = "entry.toXDR base64 roundtrip is lossless per prior record but does not constrain which of several same-named UDT entries is selected for serialization"

[[blockers]]
kind = "not_found"
source = "src/contract/spec.ts:Spec.constructor"
guarantee = "no uniqueness or kind-consistency guard exists for duplicate UDT names in Spec.constructor or before nativeToUdt serialization for this exact viable path"
```
