# F912-C2: Authoritative post-execution result decode confusion (subsumed)

**Date**: 2026-06-17
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/912-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The post-execution decode path is source-accurate:

- `SentTransaction.result` (sent_transaction.ts:137-139) calls
  `this.assembled.options.parseResultXdr(returnValue!)` on the RPC-supplied
  `returnValue`.
- `parseResultXdr` is defined as
  `(result: xdr.ScVal) => spec.funcResToNative(method, result)`
  (assembled_transaction.ts:515-516), inherited identically by `fromJSON`/
  `fromXDR` via `options`.
- `funcResToNative` → `scValToNative` decodes integer/bigint/bool/bytes/address
  branches purely from the `ScVal`'s own tag, and `structToNative` assigns struct
  fields positionally without key/order validation.

So an attacker-controlled `returnValue` `ScVal` of a different type or field-order
than the method's declared spec return type is coerced into a native value the
application trusts.

## Why It Failed

This is the **identical typed weakness** already confirmed VIABLE under route
`js-sdk-26a2c419baf9cb084b019288` (priors [3] and [4]):

- Prior [3] (VIABLE): "integer/bigint/bool/u32/i32/bytes/address branches return
  based on the ScVal's own tag with no comparison against the declared spec type."
- Prior [4] (VIABLE): "structToNative selects fields[i] by map entry index and
  never compares entry.key() to fields[i].name(), so no key/order guard blocks a
  reordered ScMap from a malicious RPC."

The candidate itself concedes "the decode-internal weakness itself is already
tracked under route_id `js-sdk-26a2c419baf9cb084b019288`." Its only added claim
is an "authoritative post-execution context elevation" relative to prior [1]'s
preview-only dismissal. But that elevation adds nothing: priors [3]/[4] are
already VIABLE — the decode confusion is already established as material — and
they share this candidate's trust boundary (`application_input_or_remote_rpc_server`),
input shape (attacker-controlled `ScVal` returned by a malicious RPC), parser
state (`json_xdr_or_wasm_decoded`), sink (`funcResToNative`/`scValToNative`/
`structToNative`), and impact class. Reaching the same sink through the
`SentTransaction.result` entry instead of `fromXDR` is a different entry point,
not a new typed weakness.

This is true typed subsumption: the security boundary, input shape, and sink are
the same as the already-VIABLE record, so re-reporting it under this route would
duplicate an existing confirmed finding.

## What This Rules Out

That the post-execution `SentTransaction.result` decode confusion is a *distinct*
novel finding. It is the same `funcResToNative` spec-type / struct key-order
confusion already confirmed under `js-sdk-26a2c419baf9cb084b019288`, reached via a
different entry point.

## What This Does Not Rule Out

- The underlying decode-confusion weakness remains a real, already-VIABLE finding
  under route `js-sdk-26a2c419baf9cb084b019288` (priors [3]/[4]); this NOT_VIABLE
  verdict only declines to re-file it as a new route, not the weakness itself.
- Any genuinely new sink reachable only from this post-execution path that is not
  the shared `funcResToNative` decode (none found in this trace).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-1704e35f985caf506dd6a0f1"
weakness = "authoritative_post_execution_result_decode_confusion"
record_kind = "single_path"
path = ["fromJSON", "result"]
sink = "result"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/sent_transaction.ts:result", "src/contract/assembled_transaction.ts:parseResultXdr"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "duplicate_of_prior_finding"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["typed_subsumption_of_js-sdk-26a2c419baf9cb084b019288"]
rules_out = ["the post-execution decode confusion is the same funcResToNative/scValToNative/structToNative spec-type and struct key/order weakness already confirmed VIABLE under route js-sdk-26a2c419baf9cb084b019288 (priors 3/4), with the same trust boundary, attacker-controlled ScVal input shape, parser state, and sink; reaching it via SentTransaction.result is a different entry point not a new typed weakness"]
does_not_rule_out = ["the underlying decode-confusion weakness itself, which remains an already-VIABLE finding under js-sdk-26a2c419baf9cb084b019288", "a hypothetical distinct sink reachable only from the post-execution path that is not the shared funcResToNative decode"]
assumptions = ["parseResultXdr on the SentTransaction.result path resolves to the same spec.funcResToNative(method, result) definition (assembled_transaction.ts:515-516) traced in priors 3/4", "the decode branches and structToNative behavior are unchanged from the source confirmed in priors 3/4"]
mechanism_brief = "post-execution SentTransaction.result feeds an attacker-controlled RPC returnValue ScVal into parseResultXdr=spec.funcResToNative, whose tag-based decode and positional structToNative lack spec-type and key/order enforcement; this is the identical typed weakness already VIABLE under js-sdk-26a2c419baf9cb084b019288, reached via a different entry point"
why_failed_brief = "true typed subsumption of already-VIABLE decode-confusion route js-sdk-26a2c419baf9cb084b019288; authoritative-context elevation adds nothing since priors 3/4 already establish materiality"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "not_found"
source = "src/contract/assembled_transaction.ts:parseResultXdr"
guarantee = "no spec-type or struct key/order check exists between the RPC returnValue and funcResToNative on this path, identical to the already-VIABLE sibling route"

[[blockers]]
kind = "duplicate_prior_record"
source = "src/contract/spec.ts:funcResToNative"
guarantee = "the decode-confusion sink is already a confirmed VIABLE finding under route js-sdk-26a2c419baf9cb084b019288 (priors 3/4) sharing trust boundary, input shape, parser state, and sink"
```
