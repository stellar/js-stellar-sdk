# F9182: Cross-kind UDT name collision producing non-compiling bindings

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/918-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The claimed mechanism is source-correct:

- `src/bindings/types.ts:53-66` `TypeGenerator.generate` emits every entry with
  no de-dup and no emitted-name registry.
- Heterogeneous emitter kinds produce non-mergeable declaration forms for the
  same `name`: `generateStruct` → `export interface X` (types.ts:149),
  `generateUnion` → `export type X` (types.ts:176), `generateTupleStruct` →
  `export type X` (types.ts:279), `generateEnum` → `export enum X` (types.ts:201),
  `generateErrorEnum` → `export const X` (types.ts:225).
- `src/bindings/utils.ts:65-83` `sanitizeIdentifier` is many-to-one, so visibly
  different raw names (e.g. `My-Type` and `My_Type`, or any all-special names →
  `_unnamed`) can collapse to one identifier across kinds.

Two colliding UDTs of different kinds therefore emit conflicting top-level
declarations that TypeScript rejects with a duplicate-identifier / cannot-
redeclare error. The source mechanism is real.

## Why It Failed

This is a downstream manifestation of the same already-confirmed no-de-dup /
collision defect, and is subsumed by an existing VIABLE prior record.

Prior-investigations query (`--route-id js-sdk-45bef61cba5cce008f254c75`) returns
a VIABLE reviewed record:

- path `fetchFromWasmHash; specFromWasm; TypeGenerator.generate`
- scope `contract_spec_or_rpc_server/binding_generation/none/contract_spec_names_types_and_wasm_bytes/spec_decoded`
- blocked_by / rules_out: "no de-dup, name-uniqueness check, or
  collision-disambiguation found in TypeGenerator.generate ... sanitizeIdentifier
  (utils.ts:65-83) is many-to-one."

C2 shares the identical scope, the identical sink (`TypeGenerator.generate`), and
the identical root weakness (absence of de-dup + many-to-one `sanitizeIdentifier`)
as that VIABLE record. C2's only distinction is the *consequence* of the
collision: a loud compile-time duplicate-identifier error instead of the silent
declaration merge / misrepresentation already captured. That is a strictly
weaker, more visible manifestation (the consumer's build breaks and the problem
surfaces immediately) of the same single missing-de-dup defect at the same sink.
It does not introduce a new trust boundary, protocol phase, parser state, size
class, or input shape relative to the prior record, so it is true typed
subsumption rather than a distinct route. The hypothesis batch's novelty
argument did not account for `js-sdk-45bef61cba5cce008f254c75`.

## What This Rules Out

A separately-reportable cross-kind UDT name-collision finding at
`TypeGenerator.generate`: the no-de-dup/collision defect at this sink and scope
is already recorded VIABLE under route `js-sdk-45bef61cba5cce008f254c75`. The
compile-error outcome is a less-severe, loud manifestation of that same defect.

## What This Does Not Rule Out

The underlying no-de-dup defect remains real and confirmed VIABLE elsewhere; this
verdict only marks C2 as non-novel. The silent struct-struct merge variant (C1,
type_misrepresentation) and field-name collisions inside a single struct/union
are not adjudicated here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-a0f8ceeb9ef88e7b53029acf"
weakness = "identifier_collision"
record_kind = "single_path"
path = ["getRemoteWasmFromHash", "TypeGenerator.generate"]
sink = "TypeGenerator.generate"
sink_role = "code_emit"
impact_class = "type_misrepresentation"
route_family = "xdr_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/bindings/types.ts:TypeGenerator.generate", "src/bindings/types.ts:generateTupleStruct", "src/bindings/utils.ts:sanitizeIdentifier"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "duplicate_or_subsumed_by_prior_viable"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["duplicate_of_prior_viable_typegenerator_generate_collision_route"]
rules_out = ["a separately-reportable cross-kind UDT name-collision finding at TypeGenerator.generate: the no-de-dup/collision defect at this sink and scope is already VIABLE under route js-sdk-45bef61cba5cce008f254c75; the compile-error outcome is a less-severe loud manifestation of that same defect"]
does_not_rule_out = ["the underlying no-de-dup defect remains real and confirmed VIABLE elsewhere", "silent struct-struct merge variant (C1, type_misrepresentation)", "field-name collisions inside a single struct/union"]
assumptions = ["source trace of types.ts:53-66/149/176/201/225/279 and utils.ts:65-83 confirms no de-dup and many-to-one sanitize across heterogeneous emitter kinds", "prior VIABLE record js-sdk-45bef61cba5cce008f254c75 shares the identical scope and TypeGenerator.generate sink for the no-de-dup/collision weakness"]
mechanism_brief = "many-to-one sanitizeIdentifier plus no de-dup lets cross-kind UDT names collapse to one identifier, emitting non-mergeable conflicting declarations that fail compilation; same root defect as the prior VIABLE collision record"
why_failed_brief = "typed subsumption of prior VIABLE no-de-dup/collision record js-sdk-45bef61cba5cce008f254c75 at the same TypeGenerator.generate sink and scope; compile-error is a weaker loud manifestation of the same defect"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier collapses distinct names to one identifier and keeps no emitted-name registry; no guard prevents cross-kind name collision (confirmed, mechanism is real but already recorded VIABLE)"

[[blockers]]
kind = "duplicate_prior_record"
source = "src/bindings/types.ts:TypeGenerator.generate"
guarantee = "prior VIABLE record js-sdk-45bef61cba5cce008f254c75 already documents the no-de-dup/collision-disambiguation defect at TypeGenerator.generate under identical scope, subsuming this candidate's compile-error manifestation"
```
