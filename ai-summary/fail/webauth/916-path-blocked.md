# F916: Path blocked: SEP-10 challenge signing over attacker-influenced fields

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/916-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`buildChallengeTx -> transaction.sign`

## Blocker

`buildChallengeTx` (challenge_transaction.ts:63-133) signs a transaction whose
source is the server's own account at sequence `-1` (built as sequence 0,
`Account(serverKeypair.publicKey(), "-1")`, line 79), so the signed artifact is
never network-submittable and confers no on-chain authorization. Every
attacker-influenced field (clientAccountID, memo, homeDomain, webAuthDomain,
clientDomain/clientSigningKey) is placed into structured XDR manage-data ops or
a `Memo.id`, with no string-injection surface; the only cross-field hazard
(muxed account + memo) is explicitly rejected at lines 75-77. The server
signature merely attests "this is a genuine challenge"; no authorization exists
until the client also signs and the server runs `readChallengeTx` /
`verifyChallengeTxSigners`, where prior records confirm the full-transaction
server signature binds all operations. Signing attacker-chosen account/memo/
domain into a non-submittable challenge is intended SEP-10 behavior.

## Per-Target Disposition

- `buildChallengeTx` (line 63): traced fully; produces a non-submittable,
  server-signed challenge — no material side effect beyond intended SEP-10.
- `transaction.sign` / `sign` / `<anonymous>` (line 130): generic
  ed25519 signing over the construction-time transaction; not SEP-10-specific
  and adds no attacker-controlled re-typing or field drop. Adjacent
  serialization boundary already settled by route
  `js-sdk-f0db09f63984613d62d62039` (faithful XDR round-trip; sign-before-serialize).

## Evidence

- `src/webauth/challenge_transaction.ts:79` - server account at sequence `-1`/0 makes the signed challenge non-submittable on-network.
- `src/webauth/challenge_transaction.ts:75-77` - muxed-account + memo combination is rejected before any op is built.
- `src/webauth/challenge_transaction.ts:97-127` - attacker-influenced fields enter only structured XDR manage-data ops (no injection); `Memo.id(memo)` at 126 enforces uint64 domain.
- `src/webauth/challenge_transaction.ts:130-132` - server signs the full tx, then a deterministic XDR serialization returns it; no authorization granted at this sink.

## Negative Scope

- Rules out: attacker-influenced clientAccountID/memo/homeDomain/webAuthDomain/clientDomain fields causing `buildChallengeTx` to sign a materially-wrong or network-submittable authenticated transaction at the `transaction.sign` sink.
- Does not rule out: a SEP-10 server caller passing an unvalidated client-supplied `home_domain` to `buildChallengeTx` (caller-responsibility validation, not an SDK signing defect), and the separate verify-side routes (`readChallengeTx`, `verifyChallengeTxSigners`).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-c2513a59eea82e16e076ace5"
weakness = "authorization integrity of signed challenge"
record_kind = "area_seed"
path = ["buildChallengeTx", "transaction.sign"]
sink = "transaction.sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "transaction_signing"
target_functions = ["buildChallengeTx", "transaction.sign", "sign", "<anonymous>"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "signature_unverified_until_checked"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["server_signed_challenge_nonsubmittable_seq_zero", "attacker_challenge_fields_into_structured_xdr_only_no_signing_integrity_break"]
rules_out = ["attacker-influenced clientAccountID/memo/homeDomain/webAuthDomain/clientDomain fields making buildChallengeTx sign a materially-wrong or network-submittable authenticated transaction at transaction.sign"]
does_not_rule_out = ["SEP-10 server caller passing unvalidated client-supplied home_domain to buildChallengeTx (caller responsibility)", "verify-side routes readChallengeTx and verifyChallengeTxSigners"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "buildChallengeTx signs a server-sourced, sequence-zero (non-submittable) challenge embedding attacker fields only as structured XDR manage-data ops; muxed+memo is rejected; the signature attests a challenge and grants no authorization until client-sign + server-verify."
why_failed_brief = "server signs a non-submittable challenge whose attacker-influenced fields enter only structured XDR ops with no injection; no authorization or wrong-transaction effect arises at the signing sink, and verify-side server-signature binding is already confirmed by prior records."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "buildChallengeTx rejects muxed clientAccountID combined with a memo (challenge_transaction.ts:75-77) and builds the tx on the server account at sequence -1/0, making the signed challenge non-submittable (line 79)."

[[blockers]]
kind = "intended_nonsubmittable_attestation"
guarantee = "the transaction.sign sink only attests a non-submittable SEP-10 challenge with attacker fields confined to structured XDR ops; authorization requires subsequent client signature and server verification, so signing attacker-influenced fields here grants nothing."
```
