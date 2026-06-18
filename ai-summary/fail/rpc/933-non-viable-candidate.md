# F933: Unverified transaction hash returned from RPC sendTransaction

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/933-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The hypothesis's factual trace is accurate and source-confirmed:

- `src/rpc/server.ts:1188-1192` — `sendTransaction` chains
  `this._sendTransaction(transaction).then(parseRawSendTransaction)`.
- `src/rpc/server.ts:1194-1205` — `_sendTransaction` serializes the caller's
  transaction with `transaction.toXDR()` and posts it via `jsonrpc.postObject`;
  the `transaction` object (which exposes `.hash()`) is not retained past the
  POST.
- `src/rpc/parsers.ts:11-32` — `parseRawSendTransaction` destructures only
  `errorResultXdr` / `diagnosticEventsXdr`, deletes them, and returns
  `{ ...raw }` (or the error-augmented variant). The `hash`, `status`, and
  `latestLedger` fields are passed through verbatim. No local
  `transaction.hash()` recomputation or comparison exists anywhere on the send
  path.

So the SDK does decline to compare the remote-supplied `hash` against the
locally-computable hash of the exact transaction it just serialized. The
mechanism description is factually correct.

## Why It Failed

The missing comparison is a defense-in-depth opportunity, not a deviation from
expected behavior, and its only impact path is a non-consumed leaf value under
an already-compromised trust boundary:

1. **Working-as-designed pass-through.** The SDK has no documented contract to
   verify the returned hash. server.ts:1145-1148 explicitly documents that
   "Clients should call `getTransaction` to learn about transaction
   success/failure" — transaction confirmation is documented caller
   responsibility, and `hash` is an identifier to forward. There is no unsafe
   default and no misleading API contract: under the honest-server model the
   returned `hash` is the transaction hash, exactly as typed. Declining to add a
   verifiable check is not the same as the code deviating from what it should do.

2. **`hash` is a pure leaf value never re-read by the SDK.** It is returned to
   the caller and never consumed by any further SDK logic. This is the same
   reasoning that disposed of the sibling Horizon submit-path result decode
   (decoded leaf return values never re-read by the SDK). The route_id differs,
   but the leaf-value principle transfers: with no in-SDK consumption there is
   no in-flow material effect for the SDK to get wrong.

3. **Impact is conditional on a self-inflicted caller pattern.** Harm requires a
   caller who both trusts the server-returned hash and reconciles it against a
   different trusted source — yet such a caller already holds the local
   transaction and would normally use the locally-computed hash for external
   reconciliation. Under the `remote_rpc_server` trust boundary (malicious
   server selected by the caller), the confirmation flow is already
   caller-managed and the same server can lie on `getTransaction`. This matches
   the Low getSACBalance "server already controls value" precedent rather than
   clearing the Medium "remote-response trust confusion" bar.

This is distinguishable from the accepted VIABLE wasm-content-integrity finding
(`route_id=js-sdk-0283c3ca...`): there the returned bytes ARE the deliverable
consumed by the SDK as authentic contract code, giving a direct in-flow material
effect when substituted. Here the substituted value is a non-consumed leaf
identifier whose harm is downstream, conditional, and inside documented caller
responsibility.

## What This Rules Out

The specific claim that the absence of a local
`raw.hash == transaction.hash()` check on the `parseRawSendTransaction` /
`_sendTransaction` response path is an SDK integrity bug clearing Medium. The
returned `hash` is a leaf identifier never re-read by the SDK, transaction
confirmation is documented caller responsibility, and no unsafe default or
misleading contract is presented.

## What This Does Not Rule Out

- The status/errorResult decoupling variant the hypothesis itself flagged
  (`errorResult` built solely from `errorResultXdr` presence and not validated
  against `status`) on the same parse path — not assessed here.
- Content-integrity findings where a returned remote value IS consumed
  downstream by the SDK (wasm-style), which remain a distinct and live route
  family.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-c92e450a6ab87ea0171fb93d"
weakness = "remote-response trust confusion: unverified transaction hash returned from sendTransaction"
record_kind = "single_path"
path = ["<anonymous>", "_sendTransaction"]
sink = "_sendTransaction"
sink_role = "transaction_submission"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "transaction_submission"
target_functions = ["src/rpc/parsers.ts:parseRawSendTransaction", "src/rpc/server.ts:sendTransaction", "src/rpc/server.ts:_sendTransaction"]
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
negative_claim.rules_out_codes = ["leaf_return_value_never_re_read_by_sdk", "working_as_designed_documented_caller_responsibility"]
rules_out = ["the returned sendTransaction hash is a leaf value never re-read by the SDK and confirmation is documented caller responsibility (server.ts:1145-1148), so the missing local hash comparison is a defense-in-depth gap, not a Medium-clearing integrity bug"]
does_not_rule_out = ["status/errorResult decoupling on the same parseRawSendTransaction path where errorResult is built solely from errorResultXdr presence and not validated against status", "content-integrity findings where a returned remote value is consumed downstream by the SDK (wasm-style)"]
assumptions = ["parseRawSendTransaction returns hash verbatim with no recomputation (parsers.ts:11-32, source-verified)", "_sendTransaction does not retain the transaction object to reconcile the returned hash (server.ts:1194-1205, source-verified)", "transaction confirmation is documented caller responsibility per server.ts:1145-1148"]
mechanism_brief = "parseRawSendTransaction returns the remote-supplied hash verbatim; the SDK declines to compare it against the locally-computable transaction.hash(), but the hash is a leaf identifier never re-read by the SDK and confirmation is documented caller responsibility, so no SDK-level material effect occurs under the malicious-RPC trust boundary."
why_failed_brief = "working-as-designed pass-through of a leaf identifier never consumed by the SDK; harm is conditional on a self-inflicted caller reconciliation pattern under an already-compromised remote_rpc_server trust boundary; below Medium."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "documented_contract"
source = "src/rpc/server.ts:sendTransaction"
guarantee = "server.ts:1145-1148 documents transaction confirmation as caller responsibility via getTransaction; the returned hash is forwarded as an identifier, not presented as an SDK-verified value"

[[blockers]]
kind = "leaf_value_not_consumed"
source = "src/rpc/parsers.ts:parseRawSendTransaction"
guarantee = "the returned hash is a leaf return value never re-read by the SDK, so a substituted hash produces no in-SDK material effect; impact requires a downstream caller reconciliation pattern outside SDK control"
```
