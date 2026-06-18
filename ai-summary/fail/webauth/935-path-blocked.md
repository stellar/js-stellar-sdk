# F935: Path blocked: verify-side home-domain / memo / duplicate-signer accounting

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/935-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> transac ... ).toXDR`

Residual escalation resolving the open question: home-domain matching, memo
handling, and duplicate-signer accounting in
`readChallengeTx` / `verifyChallengeTxSigners` / `verifyChallengeTxThreshold`.
All three sub-leads were source-traced to a concrete yes/no (answer: refuted).

## Blocker

Three independent source-proven invariants close the named leads. Home-domain
matching uses exact string equality (`` `${domain} auth` === operation.name ``)
for both the string and array branches, with no prefix/substring/case slack and
a throw when no exact match is found. The memo is restricted to `MemoID`,
rejected when the client account is muxed, and — like every structured field —
covered by the full-transaction server ed25519 signature verified at
`challenge_transaction.ts:339`, so a client cannot alter or re-type it.
Duplicate-signer accounting is deduplicated twice (client-signer `Set` and the
`signersFound` `Set` in `gatherTxSigners`), each transaction signature is
consumed at most once via `splice`, and `signersFound.length !== tx.signatures.length`
(`:536`) rejects any extra/duplicate/unrecognized signature; threshold weight
sums unique found signers with a first-match `.find`, so duplicates cannot
inflate weight.

## Evidence

- `src/webauth/challenge_transaction.ts:293-311` - home-domain match is exact `===` (string) / `.find` exact (array); no match throws.
- `src/webauth/challenge_transaction.ts:229-242` - memo accepted only as `MemoID`, rejected for muxed client; value not attacker-mutable post-sign.
- `src/webauth/challenge_transaction.ts:339` - full-transaction server signature gate binds memo, op name, and all structured fields before trust.
- `src/webauth/challenge_transaction.ts:450,466,494` - client signers deduplicated into a `Set`; server key excluded.
- `src/webauth/utils.ts:39,63-64` - `gatherTxSigners` adds each signer once (Set) and splices each matched signature so it is consumed only once.
- `src/webauth/challenge_transaction.ts:536` - `signersFound.length !== tx.signatures.length` rejects unrecognized/duplicate signatures.
- `src/webauth/challenge_transaction.ts:665-669` - threshold sums unique found signers with first-match `.find`; duplicate keys cannot double-count.

## Negative Scope

- Rules out: home-domain ambiguity, memo type/integrity confusion, or duplicate/under-counted signer accounting in `readChallengeTx`/`verifyChallengeTxSigners`/`verifyChallengeTxThreshold` causing acceptance of a forged or under-signed SEP-10 challenge.
- Does not rule out: caller-side failure to compare the `memo` returned by `readChallengeTx` against an expected value (a caller-responsibility contract, not an SDK gate); and a fails-safe under-count when a `client_domain` signing key coincides with an account signer in `signerSummary` (rejects a valid challenge, no over-grant).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-4e1e89d77bb6d5e0f5457545"
weakness = "transaction_serialization"
record_kind = "residual_escalation"
path = ["<anonymous>", "transac ... ).toXDR"]
sink = "transac ... ).toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/webauth/challenge_transaction.ts:readChallengeTx", "src/webauth/challenge_transaction.ts:verifyChallengeTxSigners", "src/webauth/challenge_transaction.ts:verifyChallengeTxThreshold", "src/webauth/utils.ts:gatherTxSigners"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signature_verified_before_return"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["homedomain_exact_string_equality_no_ambiguous_match", "verify_side_memo_bound_by_full_tx_server_signature", "signer_dedup_and_signature_count_invariant_block_duplicate_inflation"]
rules_out = ["verify-side home-domain matching, memo handling, or duplicate/under-counted signer accounting in readChallengeTx/verifyChallengeTxSigners/verifyChallengeTxThreshold accepting a forged or under-signed SEP-10 challenge as authenticated"]
does_not_rule_out = ["caller failing to compare readChallengeTx's returned memo against an expected value (caller-responsibility contract)", "fails-safe threshold under-count when a client_domain signing key equals an account signer in signerSummary"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Home-domain uses exact === / .find equality; memo is MemoID-restricted and bound by the full-tx server signature at line 339; signers are deduped via two Sets, each signature consumed once via splice, and signersFound.length !== tx.signatures.length plus first-match threshold weighting block duplicate inflation."
why_failed_brief = "All three named residual leads are closed by concrete, non-conditional, current-source guards: exact home-domain equality, server-signature integrity over the memo, and the signer dedup + exact signature-count invariant."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "readChallengeTx matches home domain by exact string equality (`${domain} auth` === operation.name) for both string and array inputs and throws when no exact match exists (challenge_transaction.ts:293-311)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "memo is accepted only as MemoID, rejected for muxed client, and bound by the full-transaction server ed25519 signature verified at challenge_transaction.ts:339"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "client signers and found signers are deduplicated into Sets, each signature is consumed once via splice in gatherTxSigners, and signersFound.length !== tx.signatures.length rejects extra/duplicate signatures (utils.ts:39,63-64; challenge_transaction.ts:494,536)"

[[blockers]]
kind = "invariant"
guarantee = "the number of unique recognized signers must equal the number of transaction signatures (signersFound.length !== tx.signatures.length, challenge_transaction.ts:536), so duplicate or unrecognized signatures cannot satisfy verification or inflate threshold weight"
```
