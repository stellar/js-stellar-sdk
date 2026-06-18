# R1005-C1: Missing hash verification on sendTransactionResponse allows result substitution

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/1005-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-6, high

## Trace Summary

`SentTransaction.send` at `sent_transaction.ts:78-80` submits `this.assembled.signed!` to
`this.server.sendTransaction(...)`. At line 82, the SDK verifies that
`sendTransactionResponse.status === "PENDING"`, but at line 94, `const { hash } = this.sendTransactionResponse`
extracts the hash directly from the server response with no verification against the locally
computable hash of the submitted transaction.

`Transaction.hash()` is available at `transaction_base.ts:222` (`hash(): Buffer { return hash(this.signatureBase()); }`)
and would produce the correct cryptographic hash of the signed transaction. However, `hash()` is
never called anywhere in `sent_transaction.ts` — confirmed by grep showing zero occurrences.

At line 100, the unverified server-supplied hash is passed to `this.server.getTransaction(hash)`,
and all subsequent result processing (lines 108-129, result getter at lines 132-164) uses the
response from polling with this unverified hash.

## Findings

An attacker-controlled RPC server can substitute a different transaction hash in the
`sendTransactionResponse`, causing the SDK to poll `getTransaction` with an unrelated hash.
The SDK then delivers that unrelated transaction's result (status, returnValue, events, meta)
to the application as if it were the result of the submitted transaction.

The attack requires the application to use an attacker-controlled Soroban RPC endpoint (e.g., a
user-configurable `rpcUrl`). The attacker does not need to tamper with the submitted transaction
envelope (which prior records confirm is submitted verbatim) — only the JSON response from
`sendTransaction`.

Impact: the application receives a materially wrong transaction result. If the application uses
the result to make business decisions (e.g., confirming fund transfer, releasing goods/services),
it operates on fabricated data. The SDK provides no defense-in-depth hash verification even
though `this.assembled.signed.hash()` is trivially available.

## PoC Guidance

- **Test file**: `test/unit/contract/sent_transaction_test.ts` (or create a new file in `test/unit/contract/`)
- **Setup**: Mock the RPC server to return a fabricated `sendTransactionResponse` with `status: "PENDING"` but a different `hash` than the submitted transaction's computed hash. Mock `getTransaction` for the fabricated hash to return a SUCCESS response with a crafted `returnValue`.
- **Steps**: Build and sign an `AssembledTransaction`, call `signAndSend()`.
- **Assertion**: Assert that `sentTransaction.sendTransactionResponse.hash !== sentTransaction.assembled.signed.hash().toString('hex')` — the SDK uses the wrong hash. Assert that `sentTransaction.result` returns the fabricated value rather than erroring.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-c39118b8c167c49a379d45c1"
weakness = "transaction_integrity"
record_kind = "single_path"
path = ["send", "SentTransaction.send", "sendTransaction", "getTransaction"]
sink = "getTransaction"
sink_role = "result_delivery"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "transaction_submission"
target_functions = [
  "src/contract/sent_transaction.ts:SentTransaction.send",
  "src/contract/sent_transaction.ts:<anonymous>",
]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = ["rpc_response"]
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_by_prior_signed_equals_submitted"]
rules_out = ["prior records js-sdk-587ee082 and js-sdk-dfb2ac9b cover signed bytes == submitted bytes (no post-sign envelope mutation); they do not cover the hash returned in the sendTransaction acknowledgement, which is a server-supplied JSON field with no SDK-side derivation or verification"]
does_not_rule_out = ["attacker manipulation of other sendTransactionResponse fields beyond hash; getTransaction response fields beyond returnValue"]
assumptions = ["this.assembled.signed is a Transaction object with a callable hash() method (confirmed at transaction_base.ts:222); sendTransactionResponse.hash is accepted from the RPC JSON response without any comparison to the locally computable hash"]
mechanism_brief = "sendTransactionResponse.hash is taken from the server response verbatim at sent_transaction.ts:94 and used to poll getTransaction at line 100 without verification against this.assembled.signed.hash(); an attacker-controlled RPC can return any hash, making the SDK poll and deliver a fabricated or unrelated transaction result"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/sent_transaction.ts:SentTransaction.send"
guarantee = "send() checks sendTransactionResponse.status === PENDING at line 82 but does not check the hash field against the submitted transaction"

[[blockers]]
kind = "not_found"
source = "src/contract/sent_transaction.ts:SentTransaction.send"
guarantee = "no call to this.assembled.signed.hash() or any hash comparison exists in SentTransaction; confirmed by grep showing zero hash() calls in sent_transaction.ts"
```
