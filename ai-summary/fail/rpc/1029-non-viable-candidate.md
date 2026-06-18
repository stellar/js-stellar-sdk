# F1029: Contract-layer SentTransaction trusts server-returned hash to fetch the authoritative returnValue

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/1029-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate's source claims are all confirmed against current source:

- `SentTransaction.send` (`src/contract/sent_transaction.ts:77-130`) submits the
  caller-built `this.assembled.signed!` via `this.server.sendTransaction`
  (lines 78-80).
- It gates on `status !== "PENDING"` (line 82) — the attacker-controlled status
  field.
- It destructures `{ hash }` from the server-controlled `sendTransactionResponse`
  (line 94) and polls `this.server.getTransaction(hash)` with that
  server-supplied hash (line 100).
- `get result` (lines 132-140) parses `getTransactionResponse.returnValue` via
  `parseResultXdr` and returns it as the authoritative call result, with no
  comparison of the fetched transaction to the locally signed transaction.
- `server.sendTransaction` (`src/rpc/server.ts:1188-1192`) and
  `_sendTransaction` (1194-1205) pass the remote `hash` through
  `parseRawSendTransaction` unvalidated.
- `server.getTransaction` (`src/rpc/server.ts:757-782`) sets `txHash: hash` from
  the passed-in hash and copies `parseTransactionInfo(raw)` straight from the raw
  remote response; it performs **no** check that the returned transaction's true
  hash equals the requested hash.

So the candidate correctly identifies that prior memory [2]'s "hash is a leaf
value never re-read by the SDK" is false for this contract-layer consumer: the
hash IS re-read at lines 94/100. This is assessed as a distinct route
(route_id `js-sdk-c0ae1ab847aed5e1f3fb7c58`), not suppressed by [2].

## Why It Failed

The candidate fails on **material effect / attacker model**, not on a source
misread.

Both `sendTransaction` and `getTransaction` are issued against the *same*
`this.server` instance (sent_transaction.ts:59, used at lines 78 and 100) — one
URL, one httpClient. There is no split-trust scenario in source where the
sendTransaction responder differs from the getTransaction responder.

Consequently, any attacker who can substitute the `hash` in the sendTransaction
response also fully controls the subsequent `getTransaction(hash)` response from
the very same server. Such an attacker does not need hash substitution at all:
it can return any `returnValue` it likes directly from `getTransaction`
(server.ts:767 copies `parseTransactionInfo(raw)` from the raw remote object).

Decisively, the proposed fix provides **zero** marginal integrity: even if the
SDK computed the local hash `H_local` of `assembled.signed` and required
`getTransaction` to be queried for `H_local`, the malicious server — when asked
`getTransaction(H_local)` — would still return an arbitrary attacker-chosen
`returnValue`. Hash/provenance binding cannot constrain an attacker who controls
the response that produces the value being bound. The missing local hash
comparison is therefore a defense-in-depth gap, not an exploitable integrity
defect, which is Low/Informational and below the Medium minimum severity for this
objective (OUT_OF_SCOPE: low and informational issues).

This is materially different from the VIABLE prior [4]
(`prepareTransaction -> assembleTransaction`): there, remote-supplied auth
entries flow into the transaction **before signing**, so attacker content reaches
bytes the user signs and submits. Here the flow is **post-submission**: the
submitted bytes are caller-built only (consistent with prior [3]), and the
reported `returnValue` is informational data already fully under the same
server's control. There is no influence on signed/submitted bytes and no
marginal capability conferred by the missing binding.

## What This Rules Out

The absence of a local hash/transaction provenance binding in
`SentTransaction.send` -> `get result` creating a materially wrong,
attacker-forgeable contract-call result that the attacker could not already
produce: ruled out because the same remote trust boundary controls the
`getTransaction` response that yields `returnValue`, so the proposed binding
yields no additional integrity guarantee and a malicious server forges the result
directly regardless.

## What This Does Not Rule Out

- A genuinely malicious server forging `getTransaction` `returnValue` directly
  (a separate, broader "fully malicious server" route, not a hash-binding
  defect).
- The pre-signing auth-entry reconciliation gap on
  `prepareTransaction -> assembleTransaction`
  (route `js-sdk-014c7e2b1c426cfa3f7f5c02`, prior [4]).
- Any future split-trust deployment where sendTransaction and getTransaction
  resolve to different trust domains (not present in current source).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-c0ae1ab847aed5e1f3fb7c58"
weakness = "transaction integrity at remote-submission boundary"
record_kind = "single_path"
path = ["send", "getTransaction"]
sink = "result"
sink_role = "transaction_result_decode"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "transaction_submission"
target_functions = ["src/contract/sent_transaction.ts:send", "src/contract/sent_transaction.ts:result", "src/rpc/server.ts:getTransaction"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["no_marginal_effect_same_trust_boundary_controls_downstream_response", "defense_in_depth_gap_below_min_severity"]
rules_out = ["missing local hash/provenance binding in SentTransaction.send -> result creating an attacker-forgeable contract-call result the attacker could not already produce, because the same server controls the getTransaction response that yields returnValue and the proposed binding adds no integrity guarantee"]
does_not_rule_out = ["fully malicious server forging getTransaction returnValue directly", "pre-signing auth-entry reconciliation gap on prepareTransaction -> assembleTransaction (route js-sdk-014c7e2b1c426cfa3f7f5c02)", "hypothetical split-trust deployment with distinct send/get responders"]
assumptions = ["SentTransaction uses a single this.server for both sendTransaction and getTransaction (sent_transaction.ts:59,78,100)", "submitted bytes are caller-built assembled.signed and not influenced by the remote response"]
mechanism_brief = "SentTransaction.send re-reads the server-returned hash to poll getTransaction and returns its returnValue, but both calls hit the same remote server, so the missing hash binding confers no marginal attacker capability and cannot be cured by binding."
why_failed_brief = "post-submission leaf result; same trust boundary controls the getTransaction response, so hash/provenance binding gives zero marginal integrity; defense-in-depth gap below Medium minimum severity."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/server.ts:getTransaction"
guarantee = "getTransaction sets txHash from the requested hash and copies parseTransactionInfo(raw) from the remote response; it does not validate the fetched transaction against the request, and crucially the same server controls this response"

[[blockers]]
kind = "no_marginal_effect"
source = "src/contract/sent_transaction.ts:send"
guarantee = "send and getTransaction both use the single this.server; an attacker controlling the sendTransaction hash already controls the getTransaction returnValue, so the missing local hash comparison yields no additional integrity that binding could restore"
```
