# R985-C3: getTransaction Envelope/Hash Trust Confusion via Unvalidated RPC Response

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/985-hypothesis-batch.md
**Candidate ID**: C3
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-6, high

## Trace Summary

Traced the `getTransaction` response construction and `parseTransactionInfo` decode path:

1. `Server.getTransaction` (src/rpc/server.ts:757-782) receives a `hash: string` parameter from the application. At line 772, `txHash: hash` is set directly from this application-supplied input.

2. When the transaction is found (`raw.status !== Api.GetTransactionStatus.NOT_FOUND`), `parseTransactionInfo(raw)` is called at line 767. The result is spread into the response object at line 777 via `...foundInfo`.

3. `parseTransactionInfo` (src/rpc/parsers.ts:34-75) decodes `envelopeXdr` from the raw server response at line 43: `envelopeXdr: xdr.TransactionEnvelope.fromXDR(raw.envelopeXdr!, "base64")`. No hash verification is performed on the decoded envelope.

4. The resulting `Api.GetTransactionResponse` object presents `txHash` (trusted, from application input) alongside `envelopeXdr` (untrusted, from RPC server response) as if they form a verified pair. No SDK-side validation confirms that `hash(envelope) == txHash`.

5. The `Server` class constructor (server.ts) does not store the network passphrase, so it cannot compute the transaction hash from the decoded envelope to verify the match. The network passphrase would need to be passed or retrieved for verification.

6. `getTransactions` (server.ts:817-833) calls `parseRawTransactions` (parsers.ts:77-85) which uses the same `parseTransactionInfo` function but takes `txHash` from the server response (`r.txHash` at line 82), so both fields come from the server in the batch path — a different trust profile than the singular `getTransaction`.

## Findings

A malicious or compromised RPC server can return any `envelopeXdr` for any transaction hash queried via `getTransaction`. The SDK creates a response object where `txHash` comes from the application's trusted input and `envelopeXdr` comes from the untrusted server response, with no cross-validation between them.

Applications that call `server.getTransaction(submittedTxHash)` and then inspect `txInfo.envelopeXdr` to determine what operations, source, memo, fee, or auth entries executed on-chain will see attacker-controlled data. This creates trust confusion: the application believes the envelope corresponds to the queried hash because the SDK presents them as a single response object.

This is Medium severity because:
- The decoded `envelopeXdr` is read-only query data (not directly signed or submitted)
- The impact depends on whether applications make security decisions based on `envelopeXdr` inspection
- The `Server` class lacks the network passphrase needed to compute the envelope hash, making SDK-side verification non-trivial without API changes
- Applications that independently hash the envelope can detect the mismatch, but the SDK does not guide or require this

Prior [1] covers `returnValue` status check on the `result` field in `sent_transaction.ts:136`, a different field, mechanism, and code path than C3's envelope/hash mismatch.

## PoC Guidance

- **Test file**: `test/unit/server/soroban/get_transaction_test.js`
- **Setup**: Mock an RPC server that responds to `getTransaction` with a valid-looking JSON-RPC response containing `envelopeXdr` for a completely different transaction than the queried hash
- **Steps**: Call `server.getTransaction(knownTxHash)` against the mock, then inspect the response's `txHash` and `envelopeXdr` fields
- **Assertion**: Verify that `response.txHash` equals the queried hash while `response.envelopeXdr` decodes to a transaction with different operations/source/memo than what the queried hash actually committed. The SDK should return both fields without error, demonstrating the trust confusion

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-4bffeef38fbfee0e8fc501e8"
weakness = "xdr_decode"
record_kind = "single_path"
path = ["getTransaction", "parseTransactionInfo", "xdr.TransactionEnvelope.fromXDR"]
sink = "xdr.TransactionEnvelope.fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/rpc/parsers.ts:parseTransactionInfo", "src/rpc/server.ts:getTransaction"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "transaction_result_query"
scope.auth_state = "post_submission"
scope.attacker_control = "rpc_response_fields"
scope.parser_state = "json_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["no cross-validation between decoded envelopeXdr and queried txHash exists in getTransaction or parseTransactionInfo; txHash is set from application input at server.ts:772 while envelopeXdr is decoded from server response at parsers.ts:43; Server class does not store network passphrase needed for hash computation"]
does_not_rule_out = ["resultXdr and resultMetaXdr also decoded without hash cross-validation in the same parseTransactionInfo call", "getTransactions batch path with same envelope decode gap but different trust profile (both fields from server)"]
assumptions = ["application uses txInfo.envelopeXdr to determine which operations executed on-chain", "malicious or compromised RPC endpoint", "application does not independently hash the envelope and compare to the queried txHash"]
mechanism_brief = "getTransaction sets txHash from application input (server.ts:772) but decodes envelopeXdr from server response via parseTransactionInfo (parsers.ts:43) without computing hash(envelope) == txHash; the response object mixes trusted and untrusted fields as a single pair; a malicious RPC server can return any envelope for any queried hash, deceiving applications that inspect envelopeXdr to verify on-chain execution."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/server.ts:getTransaction"
guarantee = "txHash is set from application input at line 772, not from server response; the queried hash itself is not spoofed, but it is not cross-validated against the decoded envelope"

[[blockers]]
kind = "not_found"
source = "src/rpc/parsers.ts:parseTransactionInfo"
guarantee = "no source-proven cross-validation between decoded envelopeXdr and queried txHash in getTransaction or parseTransactionInfo; Server class does not store network passphrase needed for envelope hash computation"
```
