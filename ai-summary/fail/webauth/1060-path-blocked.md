# F1060: Path blocked: SEP-10 challenge signing over attacker-influenced inputs

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/1060-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> transaction.sign`

Area seed target set: `<anonymous>`, `transaction.sign`, `buildChallengeTx`,
`sign`. Re-derived the dispatch's stated remaining_risk from source ("are the
fields bound at signing the same fields a later verifier checks") rather than
restating prior memory.

## Blocker

The signing sink only produces a non-submittable server attestation: the
challenge is built on `Account(serverKeypair.publicKey(), "-1")` so the tx
sequence is 0 with the server as source, and `transaction.sign(serverKeypair)`
adds only the server's signature (challenge_transaction.ts:79,89-95,129-132).
Authentication still requires a later genuine client signature. On the
verification side every security-relevant field is bound to the same signed
body: the server signature is checked over the full `transaction.hash()`
(utils.ts:36,62; challenge_transaction.ts:339), and readChallengeTx re-checks
seq 0, source, first-op source/clientAccountID, memo type, exact home-domain
operation-name equality, and web_auth_domain value against that hash, with
exact signature-count accounting rejecting any unrecognized signature
(challenge_transaction.ts:200-345,536). A signature therefore cannot attach to
an alternate transaction form.

## Evidence

- `src/webauth/challenge_transaction.ts:79,129-132` - challenge built on seq -1 (tx seq 0), server source, signed only by server -> non-submittable attestation.
- `src/webauth/challenge_transaction.ts:200-311` - verifier re-enforces seq 0, server source, op source, memo type, and exact `${homeDomain} auth` operation-name match.
- `src/webauth/challenge_transaction.ts:339,536` - server signature checked over full tx hash and `signersFound.length !== tx.signatures.length` rejects unrecognized signatures.
- `src/webauth/utils.ts:36,55-66` - gatherTxSigners consumes each signature once (splice) and dedups signers via a Set, so one signature cannot satisfy two signers.

## Negative Scope

- Rules out: attacker-influenced clientAccountID/homeDomain/memo/clientDomain/clientSigningKey/muxed state making buildChallengeTx's `transaction.sign` emit a submittable or pre-authenticated challenge, or making readChallengeTx/verifyChallengeTxSigners accept an alternate (re-encoded, body-mutated, or extra-signature) transaction form against the server's full-hash signature.
- Does not rule out: web_auth_domain operation being optional in readChallengeTx (no check when the op is absent) as a defense-in-depth gap, evaluated here as below-Medium for client-side verification because the home-domain operation-name match plus server-key binding already pin the challenge to the expected server; left open for a dedicated client-trust probe.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-3d5a10224340b0ec66709ad6"
weakness = "authorization integrity / transaction signing"
record_kind = "area_seed"
path = ["<anonymous>", "transaction.sign"]
sink = "transaction.sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "transaction_signing"
target_functions = ["buildChallengeTx", "transaction.sign", "readChallengeTx", "verifyChallengeTxSigners", "gatherTxSigners"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "signature_checked_during_verify"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["server_signature_over_full_tx_hash_binds_all_fields", "build_challenge_seq_zero_server_only_nonsubmittable", "exact_signature_count_accounting_rejects_unrecognized"]
rules_out = ["attacker-influenced SEP-10 challenge fields making transaction.sign emit a submittable or pre-authenticated challenge, or making readChallengeTx/verifyChallengeTxSigners accept an alternate or body-mutated transaction form against the server's full-hash signature"]
does_not_rule_out = ["web_auth_domain operation optionality in readChallengeTx as a below-Medium client-trust defense-in-depth gap"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "buildChallengeTx signs a seq-0 server-source attestation with only the server signature; verification binds every checked field to the full signed tx hash with exact signature-count accounting, so signatures cannot move to an alternate transaction form."
why_failed_brief = "signing sink is non-submittable server-only attestation and verifier binds all security-relevant fields via full-hash server signature with exact signature accounting"
confidence = "high"

[[sanitizer_guarantees]]
kind = "signature_over_full_hash"
guarantee = "server signature is verified over the complete transaction hash, binding seq, source, operations, memo, and timebounds so attacker field mutation invalidates it (challenge_transaction.ts:339; utils.ts:36,62)"

[[sanitizer_guarantees]]
kind = "exact_count_accounting"
guarantee = "verifyChallengeTxSigners requires signersFound.length === tx.signatures.length and gatherTxSigners consumes each signature once, rejecting unrecognized or double-counted signatures (challenge_transaction.ts:536; utils.ts:55-66)"

[[blockers]]
kind = "non_submittable_attestation"
guarantee = "buildChallengeTx uses account seq -1 -> tx seq 0 with server source and signs only with the server key, so the signing sink cannot emit a submittable or pre-authenticated transaction (challenge_transaction.ts:79,129-132)"
```
