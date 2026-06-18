# F912-C1: Missing success-status gate on SentTransaction.result post-execution path

**Date**: 2026-06-17
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/912-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The claimed mechanism is source-accurate as a code observation:

- `SentTransaction.result` (sent_transaction.ts:132-144) checks
  `"getTransactionResponse" in this && this.getTransactionResponse`, then
  `if ("returnValue" in this.getTransactionResponse)` and returns
  `this.assembled.options.parseResultXdr(this.getTransactionResponse.returnValue!)`.
  There is no comparison against `Api.GetTransactionStatus.SUCCESS`. The only
  status handling is the `NOT_FOUND` retry/throw inside `send` (lines 104,
  110-127).
- `Server.getTransaction` (server.ts:757-782) copies `status: raw.status`
  verbatim (line 771) and, for any status `!== NOT_FOUND`, merges
  `parseTransactionInfo(raw)` (lines 766-767).
- `parseTransactionInfo` (parsers.ts:34-75) sets
  `info.returnValue = metaV.sorobanMeta()?.returnValue() ?? undefined` inside
  `switch (meta.switch())` on case 3/4 only (lines 56-66), with no guard on the
  transaction's success/failure status.

So a response with `status: FAILED` plus a crafted valid `TransactionMetaV3/V4`
carrying a `sorobanMeta().returnValue()` does cause `returnValue` to be present,
and the getter takes the parse branch instead of throwing.

## Why It Failed

The missing `status === SUCCESS` gate confers **no marginal attacker
capability**, so the distinct finding does not cross the Medium severity floor.

`status`, `resultXdr`, and `resultMetaXdr` all originate from the *same* untrusted
`getTransaction` JSON (server.ts:770-778); none is cryptographically bound to the
real ledger outcome. An attacker who controls that response and wants the
application to act on a forged `returnValue` simply sets `status: SUCCESS` (with
the same crafted `resultMetaXdr`), which the getter already accepts on the very
same branch. The candidate's specific `status: FAILED` + `returnValue` scenario
adds nothing the attacker cannot achieve with `status: SUCCESS`, and adding a
`status === SUCCESS` gate would not prevent the attack — the attacker would route
through `SUCCESS`.

Under an honest RPC the reliance on `returnValue` presence is correct: a failed
Soroban transaction is not delivered with a populated `sorobanMeta().returnValue()`,
so `info.returnValue` stays unset and the getter throws
`"Transaction failed! Cannot parse result."` (sent_transaction.ts:144). The
defect only manifests with a malicious RPC, which already controls `status`.

The genuinely material residual on this path — an attacker-controlled
`returnValue` `ScVal` being decoded into a wrong native value with no spec-type
or struct key/order enforcement — is the decode-confusion weakness already
confirmed VIABLE under route `js-sdk-26a2c419baf9cb084b019288` (priors [3]/[4]),
not a property of the missing status gate.

## What This Rules Out

The specific typed mechanism "missing `status === SUCCESS` gate in
`SentTransaction.result` lets a malicious RPC present a FAILED on-chain call as a
successful attacker-chosen return value" is ruled out as a distinct Medium+
finding: the gate is not the security boundary because the attacker controls
`status` in the same response and forges success via `status: SUCCESS`.

## What This Does Not Rule Out

- The decode-internal type/key/order confusion reachable when an attacker
  returns `status: SUCCESS` with a type- or field-order-mismatched `returnValue`
  `ScVal`, already tracked under route `js-sdk-26a2c419baf9cb084b019288`
  (priors [3]/[4]).
- Any separate finding about the absence of cryptographic/on-ledger verification
  of the `getTransaction` response as a whole (out of the narrow status-gate
  claim evaluated here).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-1704e35f985caf506dd6a0f1"
weakness = "missing_success_status_gate_on_post_execution_result"
record_kind = "single_path"
path = ["fromJSON", "result"]
sink = "result"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/sent_transaction.ts:result", "src/rpc/server.ts:getTransaction", "src/rpc/parsers.ts:parseTransactionInfo"]
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
negative_claim.rules_out_codes = ["missing_gate_confers_no_marginal_attacker_capability", "below_medium_severity_floor"]
rules_out = ["the missing status===SUCCESS gate in SentTransaction.result is not a security boundary: status and resultMetaXdr come from the same untrusted getTransaction response, so an attacker forging a result sets status=SUCCESS, which the getter already accepts; adding the gate would not block the attack"]
does_not_rule_out = ["decode-internal type/key/order confusion of an attacker-controlled SUCCESS returnValue, tracked under js-sdk-26a2c419baf9cb084b019288 (priors 3/4)", "any separate finding about absent cryptographic verification of the whole getTransaction response"]
assumptions = ["status, resultXdr, and resultMetaXdr in getTransaction all originate from the same untrusted RPC JSON with no cryptographic binding (server.ts:770-778)", "an honest RPC does not deliver a populated sorobanMeta returnValue for a failed Soroban transaction"]
mechanism_brief = "SentTransaction.result returns parseResultXdr(returnValue) whenever returnValue is present without checking status===SUCCESS, but status is attacker-controlled in the same response; forging success via status=SUCCESS already succeeds, so the missing FAILED-status gate adds no exploit capability and falls below the Medium floor"
why_failed_brief = "missing status gate confers no marginal attacker capability since status is attacker-controlled in the same untrusted response; below Medium severity floor as a distinct finding"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/sent_transaction.ts:result"
guarantee = "result throws on absent returnValue and, under an honest RPC, a failed Soroban tx carries no sorobanMeta returnValue (parsers.ts:56-66), so honest failures correctly throw"

[[blockers]]
kind = "attacker_control_already_total"
source = "src/rpc/server.ts:getTransaction"
guarantee = "status is copied verbatim from the same untrusted response (server.ts:771), so a status===SUCCESS gate cannot constrain an attacker who forges status=SUCCESS"
```
