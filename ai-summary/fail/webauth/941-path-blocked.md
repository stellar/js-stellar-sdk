# F941: Path blocked: weight/threshold accounting in verifyChallengeTxThreshold

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/941-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> sign` (residual escalation of the SEP-10 verify-side weight
sum: `verifyChallengeTxThreshold -> verifyChallengeTxSigners -> gatherTxSigners`)

## Blocker

The residual lead — a distinct weight/threshold accounting weakness beyond the
signer-count invariant — does not exist. `verifyChallengeTxThreshold` sums
`signerSummary.weight` over `signersFound`, and `signersFound` is produced by
`gatherTxSigners`, which returns `Array.from(new Set(...))` after consuming each
transaction signature exactly once via `splice`. Every found signer therefore
appears once, is backed by one distinct verified signature, and contributes its
`signerSummary` weight at most once. The server key and the `client_domain`
signing key are spliced out before the weight loop, so they cannot inflate the
sum (they are conservatively excluded). All counted signers are a subset of
`signerSummary.map(s => s.key)`, so the `?.weight || 0` fallback never adds a
weight for a signer outside the trusted summary. Forging weight requires forging
a real signature, which needs the private key. The accounting is sound.

## Evidence

- `src/webauth/challenge_transaction.ts:665-669` - weight summed once per entry in `signersFound` via `signerSummary.find`, no per-signature double count.
- `src/webauth/utils.ts:39,62-70` - `gatherTxSigners` collects into a `Set` and `splice`s each matched signature out, so the returned signer list is deduplicated and one-to-one with consumed signatures.
- `src/webauth/challenge_transaction.ts:536-544` - count invariant rejects unrecognized signatures and server/clientSigningKey are spliced out before the weight loop, so neither can contribute weight.

## Negative Scope

- Rules out: attacker-controlled challenge XDR / client signatures inflating, double-counting, or otherwise mis-accounting the weight sum in `verifyChallengeTxThreshold` so an under-weighted challenge passes the threshold check.
- Does not rule out: a malicious/compromised Horizon feeding the verifying server forged `signerSummary` weights (different trust boundary, not the challenge-XDR attacker route); caller passing a non-positive `threshold` (documented caller responsibility).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-21ec7ae7ad0f3e8358ab8493"
weakness = "transaction_signing"
record_kind = "residual_escalation"
path = ["<anonymous>", "sign"]
sink = "sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "re-investigate residual lead"
target_functions = ["src/webauth/challenge_transaction.ts:verifyChallengeTxThreshold", "src/webauth/challenge_transaction.ts:verifyChallengeTxSigners", "src/webauth/utils.ts:gatherTxSigners"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signature_verified_before_return"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["weight_sum_dedup_set_one_signature_per_signer", "server_and_client_domain_keys_excluded_from_weight"]
rules_out = ["attacker-influenced challenge XDR or client signatures causing duplicate, inflated, or mis-attributed weight in verifyChallengeTxThreshold so an under-weighted challenge meets threshold"]
does_not_rule_out = ["malicious Horizon supplying forged signerSummary weights to the verifying server (distinct trust boundary)", "caller-supplied non-positive threshold (documented caller responsibility)"]
assumptions = ["no additional assumptions beyond cited source evidence", "signerSummary weights are supplied by the verifying server's trusted Horizon query, not by the challenge-XDR attacker"]
mechanism_brief = "weight sum iterates deduplicated signersFound (gatherTxSigners Set + per-signature splice), counts each verified signer's signerSummary weight once, and excludes server/client_domain keys, so no distinct accounting weakness exists beyond the signer-count invariant"
why_failed_brief = "weight accounting is source-proven sound: deduped signers, one signature per signer, trusted weights, conservative exclusions"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "gatherTxSigners returns Array.from(Set) and splices each matched signature out, so weight is summed at most once per signer and per signature"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "server key and client_domain signing key are spliced from signersFound before the weight loop, so they cannot inflate the threshold sum"

[[blockers]]
kind = "invariant"
guarantee = "every weighted signer is backed by one distinct verified signature and is a member of the trusted signerSummary; forging weight requires a real private-key signature"
```
