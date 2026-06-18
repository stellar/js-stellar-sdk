# R957-C2: Generated TypeScript declaration collision / silent merge via sanitizeIdentifier

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/957-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Confirmed in current source:

- `src/bindings/client.ts:99-123` — `generateInterfaceMethod` emits an interface member
  keyed by `sanitizeIdentifier(func.name())` (`client.ts:100,112`), and
  `generateFromJSONMethod` emits an object-literal property keyed the same way
  (`client.ts:116,122`). All members are joined into one `export interface Client { ... }`
  (`client.ts:35-39,55-57`) and one `fromJSON` object literal (`client.ts:47-51,68-70`).
- `src/bindings/types.ts:131-204` — `generateStruct` emits `export interface ${name}`
  keyed by `sanitizeIdentifier(struct.name())` (`types.ts:132,149`) with struct fields
  keyed by `sanitizeIdentifier(field.name())` (`types.ts:141,145`); `generateUnion`
  (`types.ts:158,176`), `generateEnum` (`types.ts:184,201`), and `generateErrorEnum`
  (`types.ts:210`) likewise key top-level declaration names by `sanitizeIdentifier`.
- `src/bindings/utils.ts:65-83` — non-injective `sanitizeIdentifier`.

No deconfliction/uniqueness pass exists anywhere on the generator path
(`TypeGenerator.generate` `types.ts:53-66`, `ClientGenerator.generate`
`client.ts:24-72`).

Trust-boundary widening relative to C1: UDT struct/union/enum names and struct field
names are XDR `string` fields (e.g. `SCSpecUDTStructV0.name`, `SCSpecUDTStructFieldV0.name`),
not SCSymbol-constrained. They may contain arbitrary characters, so collisions are
trivial and do not depend on the reserved-word/all-underscore trick. Examples: structs
`My-Type` and `My.Type` both → `My_Type`; fields `a-b` and `a.b` both → `a_b`.

Consequences in the single emitted file:
- Two `export interface My_Type {...}` blocks **declaration-merge** in TypeScript into
  one combined interface (silent, compiles).
- Duplicate `fromJSON` object keys and duplicate interface members keep the last (silent).
- Duplicate struct field names keep the last → a field is silently dropped.
- Duplicate `type`/`enum` names produce a TS compile error (loud; not the security case).

## Findings

Expected behavior — distinct contract symbols produce distinct, non-merging TS
declarations (or generation deconflicts/rejects) — is violated for the silent cases.
The generated client's static type surface then misrepresents the real contract
interface: a developer coding against the merged/last-wins types can construct
arguments that type-check but do not match the actual contract symbol they intended,
or omit a silently-dropped field. This is the "contract binding type confusion /
produce types that misrepresent the contract interface" impact (Medium scale; the
objective impact table lists interface-misrepresenting bindings at a High floor, so
this could be argued High — kept at Medium here because the effect is compile-time
type confusion, with runtime arg encoding still driven by the real `Spec`).

Novelty: priors [1] and [3] on this exact `route_id`/sink ruled out *TypeScript
injection* (`negative_scope = identifiers_stripped_to_ascii_ident_set`; only numeric
enum values and base64 entries are unescaped). C2 is a different weakness —
`identifier_collision` causing duplicate/merging declarations, not injection of
executable TS. Priors are anti-evidence only and do not dispose of this candidate.

## PoC Guidance

- **Test file**: append to an existing `TypeGenerator`/`ClientGenerator` unit test under
  `test/unit` (a bindings generation test that builds a `Spec` from synthetic entries).
- **Setup**: build a `Spec` with two `scSpecEntryUdtStructV0` entries whose names are
  `My-Type` and `My.Type` with different field sets.
- **Steps**: run `new TypeGenerator(spec).generate()`.
- **Assertion**: the output contains two `export interface My_Type {` blocks (proving a
  silent TS declaration merge), and a second test with two colliding struct field names
  shows only the last field survives.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-e7f284422e64462425cb9d4b"
weakness = "identifier_collision"
record_kind = "single_path"
path = ["ClientGenerator.generate", "sanitizeIdentifier"]
sink = "sanitizeIdentifier"
sink_role = "code_emission"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/bindings/client.ts:ClientGenerator.generateInterfaceMethod", "src/bindings/types.ts:TypeGenerator.generateStruct"]
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
rules_out = ["source trace confirms no deconfliction/uniqueness pass over sanitized declaration names; UDT/type/field names are unconstrained XDR strings so colliding silent declaration-merge and last-wins overwrite are reachable; distinct from the injection weakness ruled out by priors 1 and 3"]
does_not_rule_out = ["runtime method dispatch collision (C1)", "duplicate type/enum names that surface as a loud TS compile error rather than a silent merge"]
assumptions = ["UDT struct/union/enum names and struct field names are XDR string fields not restricted to the SCSymbol charset", "remote wasm/spec is attacker-controlled per scope"]
mechanism_brief = "TypeGenerator/ClientGenerator emit interface/type/struct/field/fromJSON declarations keyed by lossy sanitizeIdentifier with no uniqueness pass; colliding attacker-named symbols silently declaration-merge or last-wins-overwrite in the single generated file, producing a client whose static types misrepresent the real contract interface"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier normalizes charset but is non-injective and adds no per-name uniqueness check"

[[blockers]]
kind = "not_found"
source = "src/bindings/client.ts:ClientGenerator.generate"
guarantee = "no deconfliction/uniqueness pass over sanitized declaration names in the generator output path"
```
