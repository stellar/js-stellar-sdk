# F9181: UDT-vs-UDT struct name collision silent declaration merge in TypeGenerator

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/918-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The claimed mechanism is source-correct:

- `src/bindings/types.ts:53-66` `TypeGenerator.generate` maps every
  `this.spec.entries` element through `generateEntry`, filters falsy results,
  and `join`s them. There is no `Set`, no name registry, and no duplicate-name
  check across emitted top-level identifiers.
- `src/bindings/types.ts:131-152` `generateStruct` emits
  `export interface ${name} { ... }` where `name = sanitizeIdentifier(struct.name())`.
- `src/bindings/utils.ts:65-83` `sanitizeIdentifier` is many-to-one:
  `replace(/[^a-zA-Z0-9_$]/g,"_")` collapses distinct raw names, reserved names
  get a `_` suffix, and empty/all-special names collapse to `_unnamed`.
- `src/bindings/utils.ts:2-59` `isNameReserved` only enumerates JS keywords; it
  keeps no record of previously emitted UDT names.

So two attacker-supplied struct UDTs whose sanitized names are equal are both
emitted as `export interface X` with no de-dup, and TypeScript declaration
merging silently unions disjoint field sets. The source mechanism is real.

## Why It Failed

This is a typed duplicate / true subsumption of an existing VIABLE prior record.

Prior-investigations query (`--route-id js-sdk-45bef61cba5cce008f254c75`) returns
a VIABLE reviewed record:

- path `fetchFromWasmHash; specFromWasm; TypeGenerator.generate`
- scope `contract_spec_or_rpc_server/binding_generation/none/contract_spec_names_types_and_wasm_bytes/spec_decoded`
- blocked_by / rules_out: "no de-dup, name-uniqueness check, or
  collision-disambiguation found in TypeGenerator.generate or Spec entry decode
  ... sanitizeIdentifier (utils.ts:65-83) is many-to-one."

C1's scope is identical (same trust boundary, protocol phase, auth state,
attacker control, and parser state), the sink is identical
(`TypeGenerator.generate`), the impact class is identical (`type_misrepresentation`),
and the root weakness is identical (absence of de-dup + many-to-one
`sanitizeIdentifier`). C1's struct-struct silent-merge effect is one downstream
consequence of that already-confirmed defect, not a new trust boundary,
protocol phase, parser state, size class, or input shape. The hypothesis
batch's novelty argument cited only the global-shadow record
(`js-sdk-0283c3cad484b8dcb342fe0f`) and the fromXDR decode-bounds NOT_VIABLE
record (`js-sdk-a0f8ceeb9ef88e7b53029acf`); it did not account for the
`js-sdk-45bef61cba5cce008f254c75` UDT-collision VIABLE record, which already
covers this exact typed route.

## What This Rules Out

A new, separately-reportable UDT-vs-UDT struct name-collision /
no-de-dup finding at the `TypeGenerator.generate` sink under the binding
generation scope: it is already documented VIABLE under route
`js-sdk-45bef61cba5cce008f254c75` with the same impact class.

## What This Does Not Rule Out

The underlying defect remains real and confirmed VIABLE elsewhere; this verdict
only marks C1 as non-novel. Nearby variants not subsumed by the prior record —
field-name collisions inside a single struct/union, or collisions with a JS
global (separately covered by `js-sdk-0283c3cad484b8dcb342fe0f`) — are not
adjudicated here.

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
target_functions = ["src/bindings/types.ts:TypeGenerator.generate", "src/bindings/types.ts:generateStruct", "src/bindings/utils.ts:sanitizeIdentifier"]
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
rules_out = ["a new separately-reportable UDT-vs-UDT struct name-collision / no-de-dup finding at TypeGenerator.generate under binding-generation scope: already VIABLE under route js-sdk-45bef61cba5cce008f254c75 with identical scope, sink, and type_misrepresentation impact"]
does_not_rule_out = ["the underlying no-de-dup defect remains real and confirmed VIABLE elsewhere", "field-name collisions inside a single struct/union", "UDT collision with a JS global (covered by js-sdk-0283c3cad484b8dcb342fe0f)"]
assumptions = ["source trace of types.ts:53-66/131-152 and utils.ts:65-83 confirms no de-dup and many-to-one sanitize", "prior VIABLE record js-sdk-45bef61cba5cce008f254c75 path fetchFromWasmHash; specFromWasm; TypeGenerator.generate shares the identical scope and sink"]
mechanism_brief = "two sanitize-equal struct UDTs emit two export interface X blocks with no de-dup; TS declaration merging silently unions disjoint fields, misrepresenting the contract struct"
why_failed_brief = "typed subsumption of prior VIABLE UDT-collision record js-sdk-45bef61cba5cce008f254c75 at the same TypeGenerator.generate sink, scope, and type_misrepresentation impact"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier/isNameReserved enforce only JS-keyword and char-set safety and keep no emitted-name registry; they do not block UDT-vs-UDT collision (confirmed, mechanism is real but already recorded VIABLE)"

[[blockers]]
kind = "duplicate_prior_record"
source = "src/bindings/types.ts:TypeGenerator.generate"
guarantee = "prior VIABLE record js-sdk-45bef61cba5cce008f254c75 already documents no-de-dup/collision-disambiguation at TypeGenerator.generate under identical scope, subsuming this candidate"
```
