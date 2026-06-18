# F956C2: scValToNative numeric-width confusion (no declared-width comparison)

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/956-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

I traced the numeric branches in current source:

- Path is identical to C1: `get result()` (`assembled_transaction.ts:743`) ->
  `parseResultXdr` (`client.ts:126-127`) -> `funcResToNative`
  (`spec.ts:629-637`) -> `scValToNative` (`spec.ts:985-1095`).
- The candidate's numeric source facts are confirmed:
  `scvU64/scvI64/scvTimepoint/scvDuration/scvU128/scvI128/scvU256/scvI256`
  all `return scValToBigInt(scv) as T` (`spec.ts:1010-1021`) regardless of the
  declared numeric width, and `scvU32/scvI32` `return scv.value()` (a
  `number`, `spec.ts:1066-1069`) regardless of declared width. `funcResToNative`
  forwards with no numeric-width reconciliation (`spec.ts:629-637`).

The number-vs-bigint representation is chosen from the attacker-controlled
ScVal kind, not the declared spec width. The source mechanism is real; the
candidate fails on novelty.

## Why It Failed

C2 is the numeric-width slice of the same root weakness as C1: `scValToNative`
decodes by ScVal tag with no comparison against the declared spec type. The
prior-investigations tool returns the VIABLE record for route
`js-sdk-26a2c419baf9cb084b019288` whose `rules_out` explicitly names the
numeric branches:

> "the **integer/bigint**/bool/u32/i32/bytes/address branches return based on
> the ScVal's own tag with no comparison against the declared spec type, so no
> guard blocks the cross-type decode on this exact [path]"

The `integer/bigint` branches in that already-VIABLE record are precisely the
`scvU32/scvI32` (number) and `scvU64..scvI256` (bigint) branches that C2
targets. Same sink (`scValToNative`), same trust boundary
(`application_input_or_remote_rpc_server`), same protocol phase, same parser
state, same impact class (`parse_integrity`). C2 reframes the impact as
representation/precision/`TypeError` on arithmetic, but the typed mechanism —
decode-by-ScVal-tag with no declared-type/width comparison on the numeric
branches — is the one already confirmed VIABLE under
`js-sdk-26a2c419baf9cb084b019288`.

This is true typed subsumption (same function, same numeric branches, same
trust boundary and scope), so C2 is NOT_VIABLE per the review protocol. A
narrower impact framing on an identical typed decode path does not constitute a
distinct route.

## What This Rules Out

A new VIABLE report of the `scValToNative` numeric decode-by-tag weakness
(`scvU32/scvI32` -> number, `scvU64..scvI256` -> bigint, with no declared-width
comparison) on the `get result()` -> `funcResToNative` -> `scValToNative` path.
That typed weakness is already confirmed VIABLE under route
`js-sdk-26a2c419baf9cb084b019288`.

## What This Does Not Rule Out

- The non-numeric scalar slice (void/bool/bytes/address) evaluated as C1 —
  also subsumed by the same VIABLE route.
- Structured-type (Vec/Map/Tuple/String/Symbol/UDT) decode confusion, which is
  guarded here.
- The provenance/no-binding retval-trust route
  `js-sdk-3c0364b06a3b262ea8bd65a6`, a distinct mechanism.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-500a631bc8106478c89fe491"
weakness = "binding_type_confusion"
record_kind = "single_path"
path = ["txFromJSON", "scValToNative"]
sink = "scValToNative"
sink_role = "scval_type_decoding"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/spec.ts:scValToNative", "src/contract/spec.ts:funcResToNative"]
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
negative_claim.rules_out_codes = ["typed_duplicate_of_js-sdk-26a2c419baf9cb084b019288"]
rules_out = ["the scValToNative numeric decode-by-ScVal-tag weakness (scvU32/scvI32->number and scvU64..scvI256->bigint with no declared-width comparison) is already recorded VIABLE under route js-sdk-26a2c419baf9cb084b019288, whose rules_out explicitly names the integer/bigint branches, sharing sink, trust boundary, protocol phase, parser state and impact class, so C2 is a typed duplicate"]
does_not_rule_out = ["the non-numeric scalar slice (C1)", "structured-type decode confusion which is guarded here", "the provenance retval-trust route js-sdk-3c0364b06a3b262ea8bd65a6"]
assumptions = ["numeric branches at spec.ts:1010-1021 and 1066-1069 return based on ScVal kind with no declared-width reconciliation in funcResToNative (spec.ts:629-637), current-source confirmed", "the VIABLE record under js-sdk-26a2c419baf9cb084b019288 explicitly covers the integer/bigint decode-by-tag branches per the prior-investigations tool output"]
mechanism_brief = "scValToNative picks number vs bigint from the attacker ScVal kind not the declared numeric width; the mechanism is real but is the numeric slice of the decode-by-tag weakness already confirmed VIABLE under route js-sdk-26a2c419baf9cb084b019288"
why_failed_brief = "typed duplicate: the integer/bigint decode-by-tag no-declared-type-comparison branches are already recorded VIABLE under js-sdk-26a2c419baf9cb084b019288 on the same sink/trust-boundary/scope"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:scValToNative"
guarantee = "no numeric-width reconciliation between declared spec type and ScVal kind exists; this absence is the weakness already recorded VIABLE under js-sdk-26a2c419baf9cb084b019288"

[[blockers]]
kind = "duplicate_prior_record"
source = "src/contract/spec.ts:funcResToNative"
guarantee = "route js-sdk-26a2c419baf9cb084b019288 already records VIABLE the no-spec-type-check decode on the integer/bigint branches of scValToNative, subsuming C2"
```
