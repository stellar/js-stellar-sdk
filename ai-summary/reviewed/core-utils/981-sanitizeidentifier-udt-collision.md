# R981: sanitizeIdentifier UDT-name collision emits same-named TypeScript declarations that silently merge/conflict in generated types

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/980-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

`TypeGenerator.generate` (`src/bindings/types.ts:53-66`) maps every spec entry
through `generateEntry` (line 71-87) and joins the results with no uniqueness
check across UDT names. Each UDT generator keys its top-level declaration on
`sanitizeIdentifier(...)`:

- `generateStruct` (line 131-152): `export interface ${name} { … }` where
  `name = sanitizeIdentifier(struct.name().toString())` (line 132).
- `generateUnion` (line 157-178): `export type ${name} = …` (line 158,176).
- `generateEnum` (line 183-204): `export enum ${name} { … }` (line 184,201).
- `generateErrorEnum` (line 209-228): `export const ${name} = { … }` (line
  210,225).

`sanitizeIdentifier` is the same confirmed many-to-one mapping as in C1
(`src/bindings/utils.ts:65-83`): reserved-word suffixing, leading-digit prefix,
`_unnamed` fallback — all reachable with `[a-zA-Z0-9_]` names. There is no
dedup across `generateEntry`, so two distinct UDT names that collide emit two
top-level declarations of the same identifier.

Expected behavior — each distinct UDT produces a distinct, faithful TypeScript
declaration — is violated. The most material sub-case is two structs colliding
to the same name: TypeScript **declaration merging** silently combines both
`export interface ${name}` field sets into one interface with no compile error,
misrepresenting the contract's types.

## Findings

Trust boundary is attacker-controlled contract spec data (same as C1). A
malicious contract declaring a colliding struct-name pair (e.g. struct `delete`
+ struct `delete_`) yields a single merged interface in generated `types.ts`
whose field set is the union of two distinct UDTs. This is contract-binding type
confusion: the developer compiles against a type that faithfully represents
neither UDT, which can lead to mis-typed encode/decode call sites.

Scope limits that keep this at Medium rather than High:

- The misrepresentation is at the generated-TypeScript / compile-time layer.
  Runtime encode/decode is performed by `Spec` (`funcArgsToScVals` /
  `funcResToNative`) keyed on the **original** spec names, not the sanitized TS
  identifiers, so this does not by itself corrupt on-wire values.
- Only the interface+interface (struct+struct) combination merges silently.
  Other combinations (interface+enum, type+type, const+const, etc.) produce
  duplicate-identifier `tsc` errors that surface at build time and are therefore
  self-defeating as a stealthy attack.

This matches the Medium criterion "contract binding type confusion." Severity is
a threshold/policy judgment on the silent-merge sub-case, hence medium
confidence.

## PoC Guidance

- **Test file**: append to a bindings unit test under `test/unit` that exercises
  `TypeGenerator` (e.g. a new `test/unit/bindings_types_collision.test.ts`).
- **Setup**: build a `Spec` whose entries include two `scSpecEntryUdtStructV0`
  structs named `delete` and `delete_`, each with a distinct field set.
- **Steps**: call `new TypeGenerator(spec).generate()` and inspect the emitted
  source.
- **Assertion**: the output contains two `export interface delete_ { … }`
  declarations (which TypeScript merges) rather than two distinct types,
  demonstrating the silent field-set merge / interface misrepresentation.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-04ce42a44c26c2e20e582d55"
weakness = "code_generation"
record_kind = "single_path"
path = ["<anonymous>", "generate"]
sink = "generate"
sink_role = "code_generation"
impact_class = "generated_code_integrity"
route_family = "code_generation"
material_effect = "re-investigate residual lead"
target_functions = ["src/bindings/types.ts:generateStruct", "src/bindings/types.ts:generateUnion", "src/bindings/types.ts:generateEnum", "src/bindings/types.ts:generateErrorEnum", "src/bindings/utils.ts:sanitizeIdentifier"]
scope.trust_boundary = "contract_spec_data"
scope.protocol_phase = "binding_generation"
scope.auth_state = "caller_configured"
scope.attacker_control = "contract_spec_names"
scope.parser_state = "spec_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms no uniqueness/dedup guard across generateStruct/Union/Enum/ErrorEnum in types.ts; the struct+struct collision merges silently via TypeScript declaration merging with no compile error; prior NOT_VIABLE [1] only blocked config-value embedding, a different mechanism"]
does_not_rule_out = ["exact tsc outcome for non-struct collision combinations (interface+enum, type+type, const+const) which produce duplicate-identifier errors and are out of this silent-merge sub-case", "field-name collisions inside a single struct/union/enum, which were not separately traced"]
assumptions = ["contract spec data is attacker-controlled because types are generated for arbitrary on-chain contracts", "two valid [a-zA-Z0-9_] UDT names such as delete and delete_ can both appear in a single spec"]
mechanism_brief = "two UDT names colliding under sanitizeIdentifier emit same-named top-level declarations in generated types.ts; the struct+struct case merges silently via TypeScript declaration merging, producing one interface that misrepresents both contract types"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier normalizes UDT names but performs no uniqueness/dedup across UDTs and does not block this candidate path"

[[blockers]]
kind = "not_found"
source = "src/bindings/types.ts:generateEntry"
guarantee = "no source-proven dedup guard found across generateStruct/Union/Enum/ErrorEnum; only TypeScript declaration merging (struct+struct) or tsc duplicate-identifier errors (other combos) act downstream"
```
