# F952: Path blocked: malformed errorResultXdr throw masking on-network submission (double-submit)

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/952-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`sendTransaction (<anonymous> caller) -> _sendTransaction -> parseRawSendTransaction (this._s ... saction)`

Residual question (escalated): can a malformed `errorResultXdr` make
`parseRawSendTransaction` throw and mask an on-network submission, causing a
double-submit, bounded by sequence-number rejection?

## Blocker

The throw is reachable but cannot produce a Medium+ double-submit. In
`parseRawSendTransaction` the `xdr.TransactionResult.fromXDR(errorResultXdr)`
decode (parsers.ts:18-27) runs only when `errorResultXdr` is present, which by
Soroban RPC protocol accompanies an ERROR status — a transaction that was
rejected at submission and therefore is NOT on-network, so there is no
successful submission to mask on the honest-server path. A malicious server can
attach a malformed `errorResultXdr` to a PENDING (genuinely submitted) response
to force a throw, but it already fully controls the response (prior record [3],
route js-sdk-c92e450a6ab87ea0171fb93d) and gains no new capability. Crucially
the SDK performs no automatic retry on this throw: `SentTransaction.send`
awaits `sendTransaction` and lets the rejection propagate, and
`withExponentialBackoff` wraps only `getTransaction` on NOT_FOUND
(sent_transaction.ts:77-106). Any retry is a caller decision; an identical
resubmission (same source/sequence) is rejected by network sequence-number
enforcement (txBAD_SEQ / DUPLICATE), the question's own bound. Material
double-execution would require the caller to rebuild with a fresh sequence,
which is documented caller responsibility and outside SDK control.

## Evidence

- `src/rpc/parsers.ts:18-27` - decode that can throw runs only inside `if (errorResultXdr)`; throw rejects the promise, it is not caught or retried in the parser.
- `src/rpc/server.ts:1188-1205` - `sendTransaction` = `_sendTransaction(...).then(parseRawSendTransaction)`; submitted bytes are `transaction.toXDR()`, caller-built; the parser only post-processes the leaf response.
- `src/contract/sent_transaction.ts:77-106` - sole in-SDK consumer awaits `sendTransaction` (no try/catch retry); `withExponentialBackoff` retries only `getTransaction` on NOT_FOUND, so a parse throw triggers no SDK-driven resubmission.

## Negative Scope

- Rules out: malformed `errorResultXdr` decode throw in `parseRawSendTransaction` causing an SDK-driven double-submit / masked on-network submission at Medium+ severity.
- Does not rule out: a caller's own catch-and-rebuild-with-new-sequence retry policy double-executing (out-of-SDK, documented caller responsibility); a malicious server forging non-throwing status/errorResultXdr combinations (covered by route js-sdk-c92e450a6ab87ea0171fb93d).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-7abe9b28b3720dd510e6d4cb"
weakness = "transaction_submission"
record_kind = "residual_escalation"
path = ["<anonymous>", "this._s ... saction"]
sink = "this._s ... saction"
sink_role = "transaction_submission"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/parsers.ts:parseRawSendTransaction", "src/rpc/server.ts:sendTransaction", "src/contract/sent_transaction.ts:send"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["parse_throw_post_submission_not_sdk_retried", "identical_resubmit_bounded_by_seqnum"]
rules_out = ["malformed errorResultXdr decode throw in parseRawSendTransaction causing an SDK-driven double-submit or masked on-network submission at Medium+ severity"]
does_not_rule_out = ["caller-implemented catch-and-rebuild-with-new-sequence retry double-executing (out of SDK)", "malicious server forging non-throwing status/errorResultXdr combinations (route js-sdk-c92e450a6ab87ea0171fb93d)"]
assumptions = ["no additional assumptions beyond cited source evidence", "Soroban RPC sets errorResultXdr only with ERROR status on an honest server"]
mechanism_brief = "errorResultXdr decode in parseRawSendTransaction can throw on malformed input, but the throw is not auto-retried by the SDK and an identical resubmit is bounded by network sequence-number enforcement; honest-server errorResultXdr accompanies a non-submitted ERROR, so no on-network submission is masked"
why_failed_brief = "throw rejects the promise with no SDK-driven retry (sent_transaction.ts:77-106); identical double-submit blocked by seqnum; material re-execution needs caller rebuild = documented caller responsibility"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "errorResultXdr decode runs only inside if(errorResultXdr); on honest server this accompanies ERROR (non-submitted) status (parsers.ts:18-27)"

[[sanitizer_guarantees]]
kind = "no_auto_retry"
guarantee = "SentTransaction.send awaits sendTransaction without catch/retry; withExponentialBackoff wraps only getTransaction on NOT_FOUND (sent_transaction.ts:77-106)"

[[blockers]]
kind = "network_invariant"
guarantee = "identical resubmission (same source/sequence) is rejected by network sequence-number enforcement (txBAD_SEQ/DUPLICATE), bounding any double-submit"
```
