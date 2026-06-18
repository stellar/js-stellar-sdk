# F1041: Path blocked: caller transaction submission via RPC sendTransaction

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/1041-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> _sendTransaction`

Area seed targets: `sendTransaction`, `_sendTransaction`, `parseRawSendTransaction`.

## Blocker

The submitted bytes are produced solely by `transaction.toXDR()` (server.ts:1202),
a caller-built envelope with no remote-response feedback before submission, so
transaction integrity at the submit boundary cannot be subverted by the RPC
server. On the response side, `parseRawSendTransaction` treats `errorResultXdr`,
`diagnosticEventsXdr`, `hash`, and `status` as sibling fields of one untrusted
`RawSendTransactionResponse` (parsers.ts:14-31); a cross-field consistency check
cannot constrain an attacker who controls every field, and the only in-SDK
decision gates on `status` alone, while the returned hash is a leaf value never
re-read by the SDK. These dispose of the status/errorResult-decoupling and
leaf-hash routes already recorded NOT_VIABLE for this route_id.

## Evidence

- `src/rpc/server.ts:1194-1205` - `_sendTransaction` submits `transaction.toXDR()` only; caller-built bytes, no remote value mixed in.
- `src/rpc/parsers.ts:14-31` - `errorResultXdr`/`diagnosticEventsXdr`/rest-of-`raw` are sibling fields of one untrusted object; no cross-field integrity guarantee possible.
- `src/rpc/parsers.ts:21-27` - response XDR decode (`DiagnosticEvent`/`TransactionResult.fromXDR`) runs only when `errorResultXdr` set (post-submission); a throw propagates after submission, non-material, and identical resubmit is seqnum-bounded.

## Negative Scope

- Rules out: remote-response or sibling-field manipulation in the sendTransaction submit/parse path creating a materially wrong submission-integrity decision or mutating the submitted envelope bytes.
- Does not rule out: a downstream caller reconciliation pattern outside SDK control; unbounded per-response resource cost if RPC response size itself is unbounded upstream of `diagnosticEventsXdr.map`.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-c92e450a6ab87ea0171fb93d"
weakness = "transaction integrity at remote submission boundary"
record_kind = "area_seed"
path = ["<anonymous>", "_sendTransaction"]
sink = "_sendTransaction"
sink_role = "transaction_submission"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "transaction_submission"
target_functions = ["sendTransaction", "_sendTransaction", "parseRawSendTransaction"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["submitted_bytes_are_caller_built_only", "consumer_gates_on_status_only", "leaf_return_value_never_re_read_by_sdk"]
rules_out = ["remote-response or sibling-field manipulation in parseRawSendTransaction/_sendTransaction creating a materially wrong submission-integrity decision or mutating submitted envelope bytes"]
does_not_rule_out = ["downstream caller reconciliation pattern outside SDK control", "unbounded per-response decode cost if RPC response size is unbounded upstream of diagnosticEventsXdr.map"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Submitted bytes are caller-built transaction.toXDR() with no remote feedback; response fields are siblings of one untrusted object consumed as leaf/status-gated values, so neither submission integrity nor a material parse decision can be subverted."
why_failed_brief = "caller-built submission bytes plus status-gated/leaf response consumption leave no material integrity gap on this route"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "_sendTransaction submits only transaction.toXDR(); no remote-response value enters the submitted bytes (server.ts:1202)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "in-SDK consumer gates submission success on status alone; errorResult/hash are leaf fields of the same untrusted response (parsers.ts:14-31)"

[[blockers]]
kind = "invariant"
guarantee = "attacker controls all sibling fields of RawSendTransactionResponse, so no cross-field consistency check can constrain them and no field feeds back into submitted bytes"
```
