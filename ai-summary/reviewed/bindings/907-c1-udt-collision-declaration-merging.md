# R9071: UDT-vs-UDT sanitized-name collision silently merges distinct contract types via TS declaration merging

**Date**: 2026-06-17
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/907-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Trust boundary confirmed: a contract spec is fetched from an attacker-controlled
RPC/contract server and decoded into `Spec.entries`. `src/contract/spec.ts:495`
declares `public entries: xdr.ScSpecEntry[] = []`; the constructor
(`spec.ts:520-538`) stores the decoded array verbatim (`processSpecEntryStream`
for the Buffer/string forms, `ScSpecEntry.fromXDR` map for the array form). There
is no de-duplication and no identifier-charset/uniqueness validation on the
decode path — every `ScSpecEntry` name string is raw attacker bytes.

`TypeGenerator.generate` (`src/bindings/types.ts:53-66`) maps over
`this.spec.entries` in order, calling `generateEntry` per entry, then
`.filter((t) => t).join("\n\n")`. Duplicates are preserved — there is no
collision check, merge, or rejection.

`generateStruct` (`src/bindings/types.ts:131-152`) emits
`export interface ${name} { ... }` where
`name = sanitizeIdentifier(struct.name().toString())` (line 132). `generateEnum`
(`src/bindings/types.ts:183-204`) emits `export enum ${name} { ... }` with each
member as `${caseName} = ${caseValue}` (every member carries an explicit
initializer).

`sanitizeIdentifier` (`src/bindings/utils.ts:65-83`) is the only name transform:
`replace(/[^a-zA-Z0-9_$]/g, "_")`, append `_` for reserved words, prefix `_` for
leading digits, and `_unnamed` for all-special/empty names. This is a verified
many-to-one map — e.g. `"Token Balance"`, `"Token-Balance"`, `"Token.Balance"`
all collapse to `Token_Balance`; two all-special names both collapse to
`_unnamed`; `"class"` → `class_` collides with literal `"class_"`.

UDT references resolve through the same sanitizer: `parseTypeFromTypeDef`
(`src/bindings/utils.ts:195-198`) returns
`sanitizeIdentifier(typeDef.udt().name().toString())` for `scSpecTypeUdt`, so a
struct field or function return typed against either colliding UDT points at the
single merged identifier.

## Findings

When two distinct attacker UDT structs sanitize to the same identifier, the file
contains two `export interface Token_Balance { ... }` declarations. TypeScript
**declaration merging** silently fuses same-name interface declarations in the
same scope into one interface carrying the union of members — this is by-design
TS behavior and emits **no diagnostic** when the merged members do not conflict.
The attacker controls both structs and keeps field sets disjoint, so no
duplicate-property error fires. The merged interface advertises fields that
neither real contract type has in full, and any generated function returning or
accepting one of the two structs is typed against the merged shape — the bindings
misrepresent the contract interface and conflate two distinct contract types.

The enum-vs-enum subset behaves identically: TS allows merging enum declarations
when subsequent declarations initialize their members, and `generateEnum` always
emits explicit `= value` for every member, so two colliding `export enum`
declarations merge silently into one enum carrying the union of members.

This matches the IMPACT_CATEGORIES row "Contract bindings generated from
attacker-controlled spec data ... produce methods/types that misrepresent the
contract interface" (severity floor High). The attacker-controlled spec causes
the generated, compiled-clean bindings to present a type that does not faithfully
represent any single contract type, which can drive an application to construct
or interpret contract calls against a wrong type shape.

Novelty: distinct from prior VIABLE route `js-sdk-0283c3cad484b8dcb342fe0f`
(UDT-vs-**global** shadow of `Buffer/Address/Result/Error`) and from the route's
own NOT_VIABLE priors (trailing-section truncation; recursion-depth). UDT-vs-UDT
declaration merging is unaddressed by all of them.

## PoC Guidance

- **Test file**: append to an existing bindings type-generation Vitest under
  `test/unit` that already exercises `TypeGenerator`/`Spec` (e.g. the
  spec/bindings type generation tests).
- **Setup**: build a `Spec` from two `ScSpecEntry` UDT struct entries whose raw
  names differ only in a sanitizer-collapsed character (e.g. `"Token Balance"`
  and `"Token-Balance"`), each with a distinct non-overlapping field set; then
  add a third entry (struct or function) whose field/return type is a UDT
  reference to one of them.
- **Steps**: call `new TypeGenerator(spec).generate()`.
- **Assertion**: assert the output contains two `export interface Token_Balance`
  declarations (string match / count >= 2), demonstrating the colliding emit;
  optionally type-check the emitted string with the TS compiler API and assert it
  compiles with no error (silent merge) while the merged interface carries fields
  from both structs. Repeat with two `export enum` entries to cover the enum
  subset.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-45bef61cba5cce008f254c75"
weakness = "identifier_collision_declaration_merging"
record_kind = "single_path"
path = ["fetchFromWasmHash", "specFromWasm", "TypeGenerator.generate"]
sink = "TypeGenerator.generate"
sink_role = "code_emit"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/bindings/types.ts:generate", "src/bindings/types.ts:generateStruct", "src/bindings/types.ts:generateEnum", "src/bindings/utils.ts:sanitizeIdentifier", "src/bindings/utils.ts:parseTypeFromTypeDef"]
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
rules_out = ["source trace confirms no de-dup, name-uniqueness check, or collision disambiguation in Spec entry decode (spec.ts:495,520-538) or TypeGenerator.generate (types.ts:53-66); sanitizeIdentifier (utils.ts:65-83) is many-to-one and enforces no uniqueness, so the UDT-vs-UDT silent declaration-merge is not blocked"]
does_not_rule_out = ["union/tuple/error-enum collisions that surface as loud duplicate-identifier compile errors (DoS, below floor)", "UDT-vs-global shadowing already covered by route js-sdk-0283c3cad484b8dcb342fe0f"]
assumptions = ["TypeScript declaration merging fuses same-name interface (and member-initialized enum) declarations silently when members do not conflict; attacker keeps field/member sets disjoint to avoid a loud duplicate-property error", "spec is fetched from an attacker-controlled RPC/contract server so entry name bytes are attacker-controlled, per the cited decode path"]
mechanism_brief = "sanitizeIdentifier is many-to-one; two distinct attacker UDT structs/enums with disjoint fields sanitize to one identifier and silently merge via TS declaration merging, so a function over either is typed against the merged shape and the bindings misrepresent the contract interface"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "checked guard only maps charset and escapes reserved words; it enforces no uniqueness, so it does not block this UDT-vs-UDT collision path"

[[blockers]]
kind = "not_found"
source = "src/bindings/types.ts:generate"
guarantee = "no de-dup, name-uniqueness check, or collision-disambiguation found in TypeGenerator.generate or Spec entry decode for this exact viable path"
```
