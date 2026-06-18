# F1024: Path blocked: SEP-10 challenge transaction signing surface

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/1024-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> sign`

Area seed targets traced from source: `buildChallengeTx`, `transaction.sign`
(build side), and the verification consumers `readChallengeTx`,
`verifyChallengeTxSigners`, `verifyChallengeTxThreshold`, plus
`gatherTxSigners`/`verifyTxSignedBy` (the material side where a signature
becomes an authorization decision).

## Blocker

The signing sink is split by a server-private-key gate that no attacker input
can cross. On the build side, `buildChallengeTx` signs a sequence-0
(`Account(..., "-1")`) transaction sourced by the server with only the server
key, so its `sign` output is non-submittable and non-authenticating until
re-verified. On the material (verify) side, every accepted field is bound by a
real server signature over the full transaction hash
(`readChallengeTx` line 339; re-checked `verifyChallengeTxSigners` line 514),
so attacker-influenced domains/memos/client-account fields cannot be altered
without invalidating that signature. Signatures are matched by real
`keypair.verify`, each consumed once via splice, signers deduped in a `Set`, and
`signersFound.length === tx.signatures.length` is enforced — so weight/signature
forgery or inflation is closed.

## Evidence

- `src/webauth/challenge_transaction.ts:79,129-132` - build signs a seq-0,
  server-sourced tx with only the server key; output is non-submittable.
- `src/webauth/challenge_transaction.ts:339` - `verifyTxSignedBy(tx, server)`
  gates all structured fields behind the server signature over `tx.hash()`.
- `src/webauth/challenge_transaction.ts:536-538,529-533` - all signatures must
  be consumed by a recognized signer; unrecognized signatures rejected.
- `src/webauth/utils.ts:36,55-66` - signatures verified cryptographically and
  spliced (consumed) once each; `signersFound` is a `Set` (no duplicate weight).
- `src/webauth/challenge_transaction.ts:665-675` - threshold sums weight over
  the deduped `signersFound` only; missing keys contribute `0`.

## Distinct shape dimensions checked (beyond prior records)

- Muxed `clientAccountID` with no memo (line 230-242): accepted by design but
  still server-signature-bound; underlying signer matching unaffected.
- Absent timebounds (line 251-263): only reachable on a server-signed tx, and
  `buildChallengeTx` always sets timebounds (line 92-95); attacker cannot forge
  a no-timebounds, server-signed challenge.
- Signature-hint collision / signer ordering in `gatherTxSigners`: a hint
  collision cannot pass `keypair.verify`; ordering only ever reduces matches
  (stricter), never inflates weight.
- `clientSigningKey` overlapping a client signer (line 542-544): removal makes
  verification stricter (drops a legit signer), not an auth bypass.

## Negative Scope

- Rules out: attacker-influenced SEP-10 challenge XDR (domains, memos, client
  accounts) or extra/duplicate client signatures steering which transaction the
  server signs, or making the `sign`/verify path emit a materially-wrong,
  submittable, or under-signed challenge that is accepted as authenticated.
- Does not rule out: defects in the downstream `base` XDR/`Transaction.hash`
  primitives or `Keypair.verify` themselves (out of this route), or
  caller-supplied `threshold`/`signerSummary` misuse by a trusted integrator.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-21ec7ae7ad0f3e8358ab8493"
weakness = "authorization integrity in challenge signing"
record_kind = "area_seed"
path = ["<anonymous>", "sign"]
sink = "sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "transaction_signing"
target_functions = ["buildChallengeTx", "transaction.sign", "readChallengeTx", "verifyChallengeTxSigners", "verifyChallengeTxThreshold", "gatherTxSigners"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signature_verified_before_return"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["server_signature_binds_all_structured_fields_before_trust", "server_signed_challenge_nonsubmittable_seq_zero", "weight_sum_dedup_set_one_signature_per_signer"]
rules_out = ["attacker-influenced challenge XDR (domains/memos/client accounts) or extra/duplicate client signatures steering the sign sink or making readChallengeTx/verifyChallengeTxSigners/verifyChallengeTxThreshold accept a forged, under-signed, submittable, or pre-authenticated SEP-10 challenge"]
does_not_rule_out = ["defects inside base XDR / Transaction.hash / Keypair.verify primitives", "caller-supplied threshold or signerSummary misuse by a trusted integrator", "muxed-account edge cases in non-webauth consumers of the returned clientAccountID"]
assumptions = ["no additional assumptions beyond cited source evidence", "the base layer Transaction.hash and Keypair.verify behave correctly"]
mechanism_brief = "Attacker-influenced SEP-10 challenge XDR reaches transaction signing, but build-side sign is a seq-0 server-sourced non-submittable tx and verify-side trust is gated by a real server signature over the full tx hash, with each client signature cryptographically verified and consumed once over a deduped signer set."
why_failed_brief = "Server-private-key signature gate binds every accepted field and signature; attacker cannot forge or inflate signed/weighted state without a real private key, and build-side output is non-authenticating."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "readChallengeTx line 339 and verifyChallengeTxSigners line 514 require a real server signature over tx.hash() before any structured field or signature is trusted"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "gatherTxSigners (utils.ts:55-66) verifies each signature with keypair.verify and splices it once; verifyChallengeTxSigners dedups signers in a Set and enforces signersFound.length === tx.signatures.length, so weight cannot be inflated"

[[blockers]]
kind = "invariant"
guarantee = "buildChallengeTx signs a sequence-0, server-sourced transaction with only the server key (challenge_transaction.ts:79,129-132), so the build-side sign output is non-submittable and non-authenticating"
```
