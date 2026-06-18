# F928: Path blocked: SEP-10 verification-side trust decisions over structured challenge fields

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/928-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`buildChallengeTx -> sign`

Residual escalation lead resolved: the verification-side trust decisions in
`readChallengeTx`, `verifyChallengeTxSigners`, `verifyChallengeTxThreshold`, and
`gatherTxSigners` that consume the attacker-influenced structured fields
(first-op source / clientAccountID, manage-data op name / home domain, memo,
`web_auth_domain` value, `client_domain` op source, sequence, tx source). Prior
records (route a9f6c50, c2513a5, 375c48d) were budget-blocked at the sign sink;
this run source-traced the four named verification functions in full.

## Blocker

Every structured field the verifier trusts is bound by the ed25519 server
signature over the whole transaction, checked at `readChallengeTx` line 339
(`verifyTxSignedBy(transaction, serverAccountID)`) before any decoded value is
returned, and the tx source / sequence-zero gates (lines 198-211) pin the
challenge to the server account. The only attacker-controlled-and-not-server-signed
input on the verify path is the client's added signatures, and these are tightly
accounted for in `verifyChallengeTxSigners`: signers are deduped into a Set with
the server excluded (450-467), `gatherTxSigners` consumes each signature at most
once via splice over the real `transaction.hash()` (utils.ts 36-67), and lines
529 / 536 reject when only the server matched or when any signature is left
unconsumed. A client cannot mutate a server-signed field, inject extra accepted
signatures, or double-count one signature toward the threshold.

## Evidence

- `src/webauth/challenge_transaction.ts:339` - server ed25519 signature over the full tx is required before any structured field is trusted/returned.
- `src/webauth/challenge_transaction.ts:198-211` - sequence-zero and tx.source==serverAccountID gates bind the challenge to the server account.
- `src/webauth/challenge_transaction.ts:529,536` - rejects "only server matched" and any unconsumed signature, closing extra/unrecognized client signatures.
- `src/webauth/utils.ts:36-67` - `gatherTxSigners` verifies against real tx hash, dedups via Set, splices each consumed signature so one signature maps to at most one signer.
- `src/webauth/challenge_transaction.ts:654-669` - threshold weight sums over the deduped `signersFound` using first-match `.find`, so duplicate `signerSummary` keys cannot inflate weight.

## Negative Scope

- Rules out: attacker-influenced structured challenge fields (clientAccountID, home-domain op name, memo, `web_auth_domain`, `client_domain` source) or extra/duplicate client signatures making `readChallengeTx`/`verifyChallengeTxSigners`/`verifyChallengeTxThreshold` accept a forged or under-signed challenge as authenticated.
- Does not rule out: a malicious Horizon `signerSummary` (weights/signers) supplied by the caller to `verifyChallengeTxThreshold` mis-stating account thresholds — that is a documented caller-provided trust input, not an SDK signature-integrity break; and the optional `web_auth_domain` op being absent (prior route 375c48d).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-a9f6c50dcfe1730cf98bbd7a"
weakness = "transaction_signing"
record_kind = "residual_escalation"
path = ["buildChallengeTx", "sign"]
sink = "sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "re-investigate residual lead"
target_functions = ["readChallengeTx", "verifyChallengeTxSigners", "verifyChallengeTxThreshold", "gatherTxSigners"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signature_verified_before_return"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["server_signature_binds_all_structured_fields_before_trust", "client_signature_accounting_consumes_each_sig_once"]
rules_out = ["attacker-influenced structured challenge fields or extra/duplicate client signatures making readChallengeTx/verifyChallengeTxSigners/verifyChallengeTxThreshold accept a forged or under-signed challenge as authenticated"]
does_not_rule_out = ["malicious caller-supplied Horizon signerSummary weights mis-stating account threshold in verifyChallengeTxThreshold", "optional web_auth_domain op absent (route 375c48d)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "all verifier-trusted structured fields are bound by the full-tx ed25519 server signature checked before return; client signatures are deduped and each consumed once, with length checks rejecting unconsumed or server-only signatures, so no attacker-controlled field or extra signature breaks SEP-10 verification"
why_failed_brief = "server-signature gate plus tight signature accounting block attacker control of every verifier trust decision on this route"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "readChallengeTx requires ed25519 server signature over full tx (line 339) and seq-zero/source gates (198-211) before any structured field is trusted or returned"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "gatherTxSigners verifies each signature against real tx hash, dedups signers via Set, and splices each consumed signature; verifyChallengeTxSigners lines 529/536 reject server-only matches and any unconsumed signature"

[[blockers]]
kind = "signature_gate"
guarantee = "client cannot alter server-signed structured fields or add accepted signatures without the server private key; threshold weight sums over deduped signers so duplicates cannot inflate"
```
