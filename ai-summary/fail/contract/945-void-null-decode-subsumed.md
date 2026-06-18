# F945: scValToNative scvVoid->null for non-option declared type

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/945-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The claimed mechanism is source-real. In `scValToNative` (spec.ts:985-1096) the
`Option` pre-check (spec.ts:989-996) and the UDT pre-check (spec.ts:998-1000)
run first; if neither matches, control reaches the ScVal-tag switch at
spec.ts:1005, whose first arm is:

```ts
case xdr.ScValType.scvVoid().value:
  return null as T;
```

This fires for ANY declared non-option, non-UDT concrete type (u64, u32, bool,
vec, map, address, string, …). So a remote ScVal of `scvVoid` substituted for a
declared concrete type yields `null` instead of throwing, reachable from the
remote retval via the confirmed `funcResToNative -> scValToNative` chain
(assembled_transaction.ts:515-516, 740-743). The trace is accurate.

## Why It Failed

True typed subsumption of the already-VIABLE route
`js-sdk-26a2c419baf9cb084b019288`. The prior-investigations probe on that
route returned its facet-2 VIABLE record verbatim: "the integer/bigint/bool/
u32/i32/bytes/address branches return based on the ScVal's own tag with no
comparison against the declared spec type, so no guard blocks the cross-type
decode." The `scvVoid` branch at spec.ts:1006-1007 is part of that exact same
switch, in the exact same function (`scValToNative`), exhibiting the exact same
typed weakness: the arm is selected by the ScVal's own tag with no comparison to
the declared spec type. A single declared-type guard in `scValToNative` fixes
both the primitive cross-type cases and the void case; they are not separable
fixes.

C2 differs from the prior on NONE of the dispositive dimensions: same trust
boundary (`application_input_or_remote_rpc_server`), same protocol phase, same
parser state (`json_xdr_or_wasm_decoded`), same size class, same input shape (a
tag-mismatched ScVal in the retval), and the same sink (`scValToNative`). The
only difference the hypothesis offers — "distinct branch, distinct effect (null
vs cross-primitive value)" — is a free-text distinction within one typed
weakness, not a different trust boundary/phase/parser-state/size-class/input
shape. Direct precedent confirms this disposal: prior
`js-sdk-1704e35f985caf506dd6a0f1` was already rejected NOT_VIABLE as
"typed_subsumption_of_js-sdk-26a2c419baf9cb084b019288 ... sharing trust
boundary, input shape, parser state, and sink." C2 matches the same four-factor
test.

## What This Rules Out

The `scvVoid`-as-`null` decode branch in `scValToNative` (spec.ts:1006-1007) as
a *separately reportable* finding: it is the same `scValToNative`
decode-by-ScVal-tag, no-declared-type-comparison weakness already confirmed
VIABLE under route `js-sdk-26a2c419baf9cb084b019288`, with identical trust
boundary, input shape, parser state, and sink.

## What This Does Not Rule Out

- The enum-case membership gap in `enumToNative` (C1), a distinct sink and a
  distinct value-domain defect, which is reported VIABLE separately.
- `unionToNative` tuple positional decode, which was not assessed here.
- Any future change that gives `scValToNative` a declared-type guard but leaves
  a void-specific bypass — out of scope for this typed record.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-a7b32e6177a6e7a129c7468b"
weakness = "type_confusion"
record_kind = "single_path"
path = ["funcResToNative", "scValToNative"]
sink = "scValToNative"
sink_role = "remote_response_decode"
impact_class = "decoded_result_integrity"
route_family = "remote_response_decoding"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/spec.ts:scValToNative", "src/contract/assembled_transaction.ts:result"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["typed_subsumption_of_js-sdk-26a2c419baf9cb084b019288"]
rules_out = ["scvVoid->null at spec.ts:1006-1007 is the same scValToNative decode-by-ScVal-tag, no-declared-type-comparison weakness already confirmed VIABLE under route js-sdk-26a2c419baf9cb084b019288, sharing trust boundary, input shape, parser state, and sink"]
does_not_rule_out = ["enum-case membership gap in enumToNative (C1, reported VIABLE)", "unionToNative tuple positional decode not assessed"]
assumptions = ["the prior-investigations facet-2 record for js-sdk-26a2c419baf9cb084b019288 (scValToNative returns by ScVal tag with no declared-type comparison) is the controlling VIABLE typed claim"]
mechanism_brief = "scValToNative returns null for scvVoid regardless of declared non-option type; real branch but same scValToNative tag-decode weakness already VIABLE under js-sdk-26a2c419baf9cb084b019288"
why_failed_brief = "true typed subsumption: same function, switch, mechanism, trust boundary, input shape, parser state, and sink as the confirmed VIABLE scValToNative cross-type decode finding"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:scValToNative"
guarantee = "the Option pre-check at spec.ts:989-996 is the only type-justified void->null path; the spec.ts:1006-1007 branch has no declared-type guard, matching the already-VIABLE tag-decode weakness"

[[blockers]]
kind = "duplicate"
source = "src/contract/spec.ts:scValToNative"
guarantee = "the scValToNative no-declared-type-comparison decode weakness is already recorded VIABLE under route js-sdk-26a2c419baf9cb084b019288 (facet 2), so this void branch is a typed duplicate"
```
