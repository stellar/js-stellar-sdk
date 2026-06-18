# F975: sendTransaction hash re-read by SentTransaction without reconciliation against signed hash

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/975-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate's source claims are all confirmed:

- `Server.sendTransaction` (`src/rpc/server.ts:1188-1192`) returns
  `parseRawSendTransaction(...)`; `parseRawSendTransaction`
  (`src/rpc/parsers.ts:11-32`) passes the server-provided `hash`/`status`
  through to the consumer verbatim.
- `SentTransaction.send` (`src/contract/sent_transaction.ts:77-106`) sends the
  caller's signed transaction (`sendTransaction(this.assembled.signed!)`,
  line 78-80), gates only on `status !== "PENDING"` (line 82), then destructures
  `const { hash } = this.sendTransactionResponse;` (line 94) and polls
  `this.server.getTransaction(hash)` (line 100) using the **server-echoed** hash.
- `SentTransaction.result` (`src/contract/sent_transaction.ts:132-144`) returns
  `parseResultXdr(this.getTransactionResponse.returnValue!)` (lines 136-139) to
  the application.
- No `this.assembled.signed.hash()` vs `response.hash` comparison exists in
  `src/contract` or `src/rpc`.

So the candidate is factually right that prior record [1]'s narrow blocker — "the
returned hash is a leaf return value never re-read by the SDK" — is **wrong** for
this consumer: the hash IS re-read inside the SDK by `SentTransaction.send` and
drives result retrieval. That correction is accepted.

## Why It Failed

Correcting prior [1]'s factual error does not change the disposition, because the
proposed defense provides **no security value against the in-scope attacker**.

The objective's trust boundary is a fully attacker-controlled, caller-selected
remote RPC server (remote responses are attacker-controlled). Both the
`sendTransaction` response (carrying `hash`) and the `getTransaction` response
(carrying `returnValue`/`resultMetaXdr`) come from that **same** server over the
**same** channel. The candidate's proposed reconciliation —
`require this.assembled.signed.hash() === sendTransactionResponse.hash` before
polling — is trivially defeated: a malicious server simply returns the genuine
locally-computable hash `H` (which it can compute from the submitted XDR exactly
as the SDK can), passes the reconciliation check, and then forges the
`getTransaction(H)` response with any chosen `returnValue`. The check passes and
the result is still forged. The missing reconciliation therefore yields no
incremental constraint on the attacker who controls both responses.

This is the same structural defect prior record [3] already ruled out for this
route family: a consistency check across fields that are all controlled by the
same untrusted source "cannot constrain an attacker who controls both." Here the
two fields live in two responses, but they originate from the same trust
boundary, so the reasoning is identical.

The only scenarios in which a hash check would change behavior are out of scope
or non-security:

- **Partial-tamper / relay** (attacker mutates the small `sendTransaction`
  response but `getTransaction` resolves an honest on-chain transaction): not a
  realistic model for a single server URL on a single TLS/transport channel — an
  adversary able to tamper one response can tamper the other. No SDK validation
  bug enables a single-field tamper here.
- **Buggy / misrouted (non-malicious) RPC** returning a wrong hash: this is a
  reliability/correctness concern, not an attacker; under the severity scale it
  is a best-practice / defense-in-depth gap (Low), which is explicitly out of
  scope (minimum severity Medium).

This matches prior [1]'s ultimate conclusion ("defense-in-depth gap, not a
finding") via a sound mechanism rather than its flawed "never re-read" premise.
The SDK faithfully decodes the responses; it does not mis-decode them into wrong
semantics, so the "remote response decoded into a materially wrong return value"
impact category (which targets SDK decoding bugs, not server-forged values that
the SDK cannot detect) does not apply.

## What This Rules Out

The absence of a `signed.hash()` vs `sendTransaction` `hash` reconciliation in
`SentTransaction.send`/`result` being a Medium+ transaction-integrity /
materially-wrong-return-value finding: the reconciliation is a cross-response
consistency check whose two inputs originate from the same attacker-controlled
RPC trust boundary, so it cannot constrain the in-scope fully-malicious-server
attacker (who returns the genuine hash and forges `getTransaction`). The residual
benefit only addresses non-malicious buggy/misrouted servers (Low / out of
scope).

## What This Does Not Rule Out

- The distinct prior VIABLE route `js-sdk-3504706c3cfcfc3ec6179739`
  (prepareTransaction/assembleTransaction footprint reconciliation) is unaffected
  by this decision.
- A future SDK feature that obtained transaction results from an independent,
  separately-trusted source (e.g. a second RPC/Horizon endpoint) while pinning to
  the locally computed hash would change the threat model and is not assessed
  here.
- Variants where the SDK itself mis-decodes a `getTransaction` payload into wrong
  semantics (a true decoding bug, distinct from a server returning forged values)
  remain a separate, unassessed class.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-47e96488c443cb7f894f39b4"
weakness = "transaction integrity at the RPC submission boundary"
record_kind = "single_path"
path = ["SentTransaction.send", "getTransaction", "SentTransaction.result"]
sink = "SentTransaction.result"
sink_role = "transaction_result_presentation"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "transaction_submission"
target_functions = ["src/contract/sent_transaction.ts:SentTransaction.send", "src/contract/sent_transaction.ts:SentTransaction.result", "src/rpc/server.ts:sendTransaction", "src/rpc/parsers.ts:parseRawSendTransaction"]
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
negative_claim.rules_out_codes = ["consistency_check_across_same_trust_boundary_responses", "defense_provides_no_value_against_in_scope_attacker", "residual_benefit_is_low_or_out_of_scope"]
rules_out = ["the missing signed.hash() vs sendTransaction hash reconciliation in SentTransaction.send/result being a Medium+ finding: the proposed check reconciles two responses (sendTransaction hash, getTransaction returnValue) that originate from the same attacker-controlled RPC trust boundary, so a malicious server returns the genuine locally-computable hash, passes the check, and forges the getTransaction returnValue; the check yields no constraint on the in-scope attacker"]
does_not_rule_out = ["distinct prior VIABLE prepareTransaction/assembleTransaction footprint reconciliation route (js-sdk-3504706c3cfcfc3ec6179739)", "a future design that fetches results from an independent separately-trusted source while pinning to the locally computed hash", "a true SDK mis-decoding bug of getTransaction payloads (distinct from server-forged values the SDK cannot detect)"]
assumptions = ["sendTransaction and getTransaction target the same caller-selected RPC server over one transport (src/contract/sent_transaction.ts:78-80,100; same this.server)", "the locally signed transaction hash is computable by both SDK and server from the submitted XDR, so a server can echo the genuine hash at will"]
mechanism_brief = "SentTransaction.send does re-read the server-provided hash (line 94) and polls getTransaction(hash) (line 100), and result returns parseResultXdr(returnValue) (136-139) with no signed.hash() reconciliation; but the proposed reconciliation is a cross-response consistency check whose inputs both come from the same attacker-controlled RPC, so it cannot constrain a malicious server that echoes the genuine hash and forges getTransaction."
why_failed_brief = "correctly breaks prior [1]'s 'never re-read' premise, but the missing hash reconciliation provides no security value against the in-scope fully-malicious RPC (controls both responses), matching prior [3]'s same-trust-boundary consistency-check blocker; residual benefit is buggy/misrouted-server reliability (Low, out of scope)"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/sent_transaction.ts:SentTransaction.send"
guarantee = "the only guard on the consumed sendTransaction response is status !== 'PENDING' (line 82); the hash (line 94) is then used directly in getTransaction (line 100) with no reconciliation"

[[blockers]]
kind = "design_invariant"
source = "src/contract/sent_transaction.ts:SentTransaction.send"
guarantee = "the proposed signed.hash() vs response.hash check reconciles two responses from the same attacker-controlled RPC trust boundary, so it cannot constrain a malicious server that echoes the genuine hash and forges the getTransaction returnValue; no incremental security against the in-scope attacker"
```
