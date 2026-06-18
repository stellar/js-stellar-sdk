# F936: Path blocked: status/errorResult decoupling on parseRawSendTransaction

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/936-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> _sendTransaction`

Residual question (escalated): does `parseRawSendTransaction` building
`errorResult` solely from `errorResultXdr` presence, without validating it
against `status`, create a material security effect?

## Blocker

The decoupling is real: `parseRawSendTransaction` sets `errorResult` whenever
`errorResultXdr` is present and never compares it to `raw.status`, while
`status` is copied through verbatim via the spread (parsers.ts:14-31). But it
confers no marginal attacker capability. `status` and `errorResultXdr` arrive
in the *same* untrusted `RawSendTransactionResponse` (api.ts:360-374), so a
consistency check between two attacker-controlled fields cannot constrain a
malicious RPC server that simply crafts a consistent pair. The only in-SDK
consumer gates the submission-success decision purely on `status === "PENDING"`
(sent_transaction.ts:82); `errorResult` is never read for that decision. Its
sole read (sent_transaction.ts:149-153) is in the error-message branch reached
only after a non-PENDING failure with `getTransaction` unpopulated, affecting
message text, not a security decision. Otherwise the value is a documented leaf
return. Below the Medium severity floor.

## Evidence

- `src/rpc/parsers.ts:14-31` - `errorResult` is built from `errorResultXdr` presence only; `status` is spread through unmodified and never cross-validated.
- `src/rpc/api.ts:360-374` - `status` and `errorResultXdr` are sibling fields of the one untrusted `RawSendTransactionResponse`; the doc states `errorResultXdr` is "set only when status is ERROR" as a server contract, not an SDK invariant.
- `src/contract/sent_transaction.ts:82` - success/failure of submission is decided solely by `status !== "PENDING"`; `errorResult` plays no part.
- `src/contract/sent_transaction.ts:149-153` - the only `errorResult` consumption only formats a `SendFailed` error message on an already-failed branch.
- `src/rpc/server.ts:1191` - `parseRawSendTransaction` is applied in `sendTransaction`, downstream of the seed sink `_sendTransaction` (server.ts:1194-1205), which only POSTs and returns the raw response.

## Negative Scope

- Rules out: status/errorResult decoupling in `parseRawSendTransaction` yielding a materially wrong submission-success decision or a forgeable integrity gap; the consumer gates on `status` alone and both fields share one untrusted source.
- Does not rule out: (a) an out-of-SDK caller that keys off `errorResult` presence instead of `status` (documented caller responsibility, no marginal capability); (b) the `diagnosticEventsXdr.map` decode (parsers.ts:21-26) as a separate single-response bounded resource mechanism, which is not driven by the status decoupling.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-c92e450a6ab87ea0171fb93d"
weakness = "transaction_submission"
record_kind = "residual_escalation"
path = ["<anonymous>", "_sendTransaction"]
sink = "_sendTransaction"
sink_role = "transaction_submission"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/parsers.ts:parseRawSendTransaction", "src/rpc/server.ts:_sendTransaction", "src/contract/sent_transaction.ts:send"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["status_and_errorresult_share_one_untrusted_response", "consumer_gates_on_status_only", "errorresult_is_error_text_or_leaf_value"]
rules_out = ["status/errorResult decoupling in parseRawSendTransaction creating a materially wrong submission-success decision or forgeable integrity gap, because the only in-SDK consumer gates on status==='PENDING' alone and both fields originate from the same untrusted RPC response"]
does_not_rule_out = ["out-of-SDK caller keying on errorResult presence instead of status (documented caller responsibility)", "diagnosticEventsXdr array decode at parsers.ts:21-26 as a separate single-response bounded resource mechanism"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "errorResult is derived from errorResultXdr presence without cross-checking raw.status, but status and errorResultXdr come from one attacker-controlled response and the sole consumer decides success on status alone, so the decoupling adds no attacker capability"
why_failed_brief = "decoupling confers no marginal attacker capability and drives no security decision; below Medium severity floor"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "SentTransaction.send gates submission success solely on status==='PENDING' (sent_transaction.ts:82); errorResult is not consulted for that decision"

[[blockers]]
kind = "same_trust_source"
guarantee = "status and errorResultXdr are sibling fields of one untrusted RawSendTransactionResponse (api.ts:360-374); a cross-field consistency check cannot constrain an attacker who controls both"
```
