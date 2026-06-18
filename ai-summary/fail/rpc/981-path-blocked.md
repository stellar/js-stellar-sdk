# F981: Path blocked: caller transaction submission through RPC sendTransaction

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/981-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> this._s ... saction` (internal transaction submission via
`sendTransaction` / `_sendTransaction`).

## Blocker

At the submission sink the bytes posted to the RPC server are produced solely by
`transaction.toXDR()` on the caller-constructed, already-signed transaction
object (`server.ts:1194-1205`); no remote-response-derived value is read,
merged, or mutated into the submitted XDR. The remote response is parsed only
*after* submission and yields leaf values (`status`, `hash`, `errorResult`,
`diagnosticEvents`) that drive a return value or a follow-up lookup against the
same caller-trusted server — not the submitted bytes. The submitting consumer
(`sent_transaction.ts:77-80`) likewise submits `this.assembled.signed!`, a
caller-built object, and uses the remote `hash` only to re-query the same trust
boundary. So no malicious-server input can change what gets submitted; the parse
side is already adjudicated by priors [1]/[2]/[3]/[4].

## Per-Target Disposition

- `sendTransaction` (`server.ts:1188-1192`): forwards caller `transaction` to
  `_sendTransaction`, then `parseRawSendTransaction`. No remote injection into
  submitted bytes; parse side = leaf status/hash (priors [1],[2]).
- `_sendTransaction` (`server.ts:1194-1205`): posts only `transaction.toXDR()`,
  faithful encode of the caller's in-memory transaction (prior [3]).
- `<anonymous>` (the `.then(parseRawSendTransaction)` continuation and
  `SentTransaction.send`, `sent_transaction.ts:77-130`): submits caller-built
  `assembled.signed!`; remote `hash` only re-queries the same trusted server
  (prior [4]).
- `parseRawSendTransaction` (`parsers.ts:11-32`): decodes `errorResultXdr` /
  `diagnosticEventsXdr` of a single bounded response into leaf return fields.

## Evidence

- `src/rpc/server.ts:1194-1205` - `_sendTransaction` posts `transaction.toXDR()` only; no remote value enters the submitted payload.
- `src/rpc/server.ts:1188-1192` - `sendTransaction` just chains `_sendTransaction(...).then(parseRawSendTransaction)`; remote data is consumed post-submission as return value.
- `src/contract/sent_transaction.ts:77-100` - consumer submits caller `assembled.signed!` and uses remote `hash` only to poll the same server.
- `src/rpc/parsers.ts:11-32` - parse output is leaf fields (status/errorResult/diagnosticEvents), not fed back into any submitted transaction.

## Negative Scope

- Rules out: remote-response-controlled mutation of the bytes submitted at the
  `sendTransaction`/`_sendTransaction` sink (submission-integrity break at the
  submission boundary).
- Does not rule out: (a) remote simulation/assembly data feeding a *newly built*
  transaction that is later signed and submitted (the `simulateTransaction` ->
  `assembleTransaction` route_family, a different sink); (b) a malformed
  `errorResultXdr` making `parseRawSendTransaction` throw and masking an actual
  on-network submission (double-submit), which is bounded by sequence-number
  rejection and requires a malicious server — below Medium here but left open
  for the parse route.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-7abe9b28b3720dd510e6d4cb"
weakness = "transaction integrity at submission boundary"
record_kind = "area_seed"
path = ["<anonymous>", "this._s ... saction"]
sink = "this._s ... saction"
sink_role = "transaction_submission"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "transaction_submission"
target_functions = ["sendTransaction", "_sendTransaction", "this._s ... saction", "<anonymous>", "parseRawSendTransaction"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["submitted_bytes_are_caller_built_only", "remote_response_consumed_post_submission_as_leaf"]
rules_out = ["remote-response-derived value mutating the bytes submitted at sendTransaction/_sendTransaction; the payload is transaction.toXDR() / assembled.signed! built entirely by the caller before submission"]
does_not_rule_out = ["simulate/assemble route_family where remote data builds a new transaction later submitted (different sink)", "malformed errorResultXdr making parseRawSendTransaction throw and masking an on-network submission (double-submit), bounded by sequence-number rejection"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Submission sink posts only the caller-constructed (and signed) transaction's XDR; remote response is parsed post-submission into leaf status/hash/errorResult fields and never alters the submitted bytes, so a malicious server cannot change what is submitted at this sink."
why_failed_brief = "no remote value is injected into the submitted payload at the submission sink; parse-side leaf values already disposed by priors [1][2][3][4]"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "_sendTransaction serializes only transaction.toXDR() of the caller's in-memory transaction (server.ts:1194-1205); no remote-derived value enters the submitted payload"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "SentTransaction.send submits caller-built assembled.signed! and uses the remote hash only to re-query the same trusted server (sent_transaction.ts:77-100)"

[[blockers]]
kind = "data_flow_isolation"
guarantee = "remote response is consumed after submission as leaf return fields and is never fed back into the submitted transaction bytes (parsers.ts:11-32)"
```
