# F956C1: scValToNative scalar-kind confusion (no declared-type comparison)

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/956-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

I traced the full claimed path in current source:

- `AssembledTransaction.get result()` (`assembled_transaction.ts:738-743`)
  feeds `this.simulationData.result.retval` into `parseResultXdr`.
- For `Client` methods, `parseResultXdr` is
  `(result) => spec.funcResToNative(method, result)`
  (`client.ts:126-127`).
- `funcResToNative` (`spec.ts:612-637`) special-cases only
  `outputs.length===0` (void) and `scSpecTypeResult` (scvError); otherwise it
  calls `this.scValToNative(val, output)` with no kind-vs-spec reconciliation.
- `scValToNative` (`spec.ts:985-1095`) dispatches on `scv.switch().value`
  (the attacker-controlled ScVal kind). The source facts in the candidate are
  all confirmed: `scvVoid` returns `null` (1006-1007), `scvBool/scvU32/scvI32/
  scvBytes` `return scv.value()` (1065-1069), and `scvAddress` returns an
  address string (1040-1041) — none of these compare the ScVal kind to the
  declared `typeDef`, whereas Vec/Tuple (1024-1037), Map (1043-1062),
  String/Symbol (1071-1084), UDT (998) and Option (989) DO cross-check and
  throw.

The source mechanism is real. The candidate fails on **novelty**, not on a
source guard.

## Why It Failed

This exact decoder weakness is already recorded **VIABLE** under route
`js-sdk-26a2c419baf9cb084b019288` (reviewed/VIABLE). The prior-investigations
tool returns that VIABLE record verbatim:

> "funcResToNative passes the spec output type to scValToNative but no
> spec-type check exists on the primitive/bigint/address decode branches for
> this exact viable path"
> rules_out: "the integer/bigint/bool/u32/i32/bytes/address branches return
> based on the ScVal's own tag with no comparison against the declared spec
> type, so no guard blocks the cross-type decode on this exact [path]"

That VIABLE record covers exactly C1's mechanism (decode-by-ScVal-tag with no
declared-type comparison on the scalar branches: void, bool, u32, i32, bytes,
address) on the same sink (`scValToNative`), same trust boundary
(`application_input_or_remote_rpc_server`), same protocol phase
(`contract_transaction_assembly`), same parser state, and same impact class
(`parse_integrity`). The injected prior-memory brief [2]
(`js-sdk-a7b32e6177a6e7a129c7468b`) had already ruled the `scvVoid` slice of
this same weakness NOT_VIABLE as a typed duplicate of
`js-sdk-26a2c419baf9cb084b019288` facet 2.

This is true typed subsumption, not mere textual similarity: same function,
same decode-by-tag mechanism, same scalar branches, same trust boundary and
scope. Per the review protocol, exact typed duplicates / true typed
subsumption are NOT_VIABLE for the candidate.

## What This Rules Out

A new VIABLE report of the `scValToNative` "decode by ScVal kind without
comparing the declared scalar output type" weakness (void/bool/u32/i32/bytes/
address branches) on the `get result()` -> `funcResToNative` -> `scValToNative`
path. That typed weakness is already confirmed VIABLE under route
`js-sdk-26a2c419baf9cb084b019288`.

## What This Does Not Rule Out

- The numeric-width representation slice (number vs bigint) evaluated
  separately as C2 — though it shares the same root weakness.
- Any structured-type (Vec/Map/Tuple/String/Symbol/UDT) decode confusion,
  which is guarded here and is a different typed route if pursued elsewhere.
- The provenance/no-binding retval-trust route
  `js-sdk-3c0364b06a3b262ea8bd65a6`, which is a distinct mechanism.

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
target_functions = ["src/contract/spec.ts:scValToNative", "src/contract/spec.ts:funcResToNative", "src/contract/assembled_transaction.ts:result"]
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
rules_out = ["the scValToNative decode-by-ScVal-tag scalar weakness (void/bool/u32/i32/bytes/address with no declared-type comparison) is already recorded VIABLE under route js-sdk-26a2c419baf9cb084b019288, sharing sink, trust boundary, protocol phase, parser state and impact class, so C1 is a typed duplicate"]
does_not_rule_out = ["the numeric number-vs-bigint representation slice (C2)", "structured-type decode confusion which is guarded here", "the provenance retval-trust route js-sdk-3c0364b06a3b262ea8bd65a6"]
assumptions = ["get result()->parseResultXdr->funcResToNative->scValToNative path is current-source confirmed at assembled_transaction.ts:743, client.ts:126-127, spec.ts:629-637,985-1095", "the VIABLE record under js-sdk-26a2c419baf9cb084b019288 covers the integer/bigint/bool/u32/i32/bytes/address decode-by-tag branches per the prior-investigations tool output"]
mechanism_brief = "scValToNative dispatches on the attacker-controlled ScVal kind and returns scalar natives (void->null, bool/u32/i32/bytes, address) without comparing the declared spec output type; the mechanism is real but already confirmed VIABLE under route js-sdk-26a2c419baf9cb084b019288"
why_failed_brief = "typed duplicate: the scalar decode-by-tag no-declared-type-comparison weakness is already recorded VIABLE under js-sdk-26a2c419baf9cb084b019288 on the same sink/trust-boundary/scope"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:scValToNative"
guarantee = "declared-type comparison exists for Vec/Tuple/Map/String/Symbol/UDT/Option but not for scalar ScVal kinds; the absence on scalar kinds is the weakness already recorded VIABLE under js-sdk-26a2c419baf9cb084b019288"

[[blockers]]
kind = "duplicate_prior_record"
source = "src/contract/spec.ts:funcResToNative"
guarantee = "route js-sdk-26a2c419baf9cb084b019288 already records VIABLE the no-spec-type-check decode on the primitive/bigint/address branches of scValToNative, subsuming C1"
```
