# F911: Path blocked: SEP-10 unvalidated client-supplied home_domain into buildChallengeTx

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/911-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`buildChallengeTx -> transaction.sign`

Residual escalation question (resolved to a definitive NO): "SEP-10 server caller
passing unvalidated client-supplied home_domain to buildChallengeTx (caller
responsibility)."

## Blocker

`homeDomain` is used in exactly one place: the *name* of a `manageData`
operation, `${homeDomain} auth` (challenge_transaction.ts:99). That is a
structured XDR string field, not an interpolated command, query, or re-parsed
value, so there is no injection surface. The server signs the full transaction
(line 130), but the challenge is non-submittable: the builder uses account
sequence `-1` so the built transaction sequence is `0` with the server as source
(lines 79, 89), which can never be submitted on a real funded server account.
On verification, `readChallengeTx` requires the op name to exactly equal one of
the *verifier's own* configured home domains (`${domain} auth === operation.name`,
lines 293-300) with no normalization/case-folding, then requires the full-tx
ed25519 server signature (line 339). An attacker-influenced `home_domain` is
therefore confined to a signed, non-submittable, structured XDR field and cannot
break signing integrity, create a submittable/authenticated transaction, or
cause verifier home-domain confusion. Validating the client-supplied
`home_domain` is documented caller responsibility with no unsafe SDK default.

## Evidence

- `src/webauth/challenge_transaction.ts:97-110` - `homeDomain` flows only into the `manageData` op name `${homeDomain} auth`; a structured XDR field, no injection sink.
- `src/webauth/challenge_transaction.ts:79,89,129-132` - account seq `-1` yields built tx seq `0`, source = server; signed challenge is non-submittable.
- `src/webauth/challenge_transaction.ts:293-311` - verifier matches op name exactly against its OWN configured home domains; client-supplied value cannot pre-seed the match set.
- `src/webauth/challenge_transaction.ts:339-343` - full-transaction ed25519 server signature required before any field is trusted, binding the op name.

## Negative Scope

- Rules out: attacker-influenced/unvalidated `home_domain` passed to `buildChallengeTx` producing a materially-wrong, submittable, or authenticated transaction at `transaction.sign`, or an injection/signing-oracle effect via the manage-data op name.
- Does not rule out: a hypothetical caller that uses the same client-supplied `home_domain` on both build and verify sides (still yields only a normal client-authenticated session, no privilege gain); home-domain matching ambiguity is a distinct `readChallengeTx` route, not this build sink.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-c2513a59eea82e16e076ace5"
weakness = "transaction_signing"
record_kind = "residual_escalation"
path = ["buildChallengeTx", "transaction.sign"]
sink = "transaction.sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "re-investigate residual lead"
target_functions = ["buildChallengeTx", "transaction.sign"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "signature_unverified_until_checked"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["home_domain_into_structured_manage_data_op_name_only_no_injection", "server_signed_challenge_nonsubmittable_seq_zero", "verifier_exact_match_against_own_configured_home_domain"]
rules_out = ["unvalidated client-supplied home_domain passed to buildChallengeTx producing a materially-wrong, submittable, authenticated, or injection/oracle-tainted transaction at transaction.sign"]
does_not_rule_out = ["readChallengeTx home-domain matching ambiguity as a distinct verify-side route", "caller reusing the same client-supplied home_domain on build and verify yielding a normal no-privilege-gain session"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "home_domain reaches only the manageData op name (structured XDR); challenge is non-submittable (seq zero, server source) and server-signed; verifier exact-matches the name against its own configured home domains plus full-tx ed25519 signature, so an unvalidated client home_domain cannot break signing integrity or produce an authenticated/submittable transaction. Validation is documented caller responsibility."
why_failed_brief = "attacker home_domain confined to a signed, non-submittable structured XDR field; no SDK-level unsafe default; caller-responsibility and out-of-scope"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "readChallengeTx requires exact `${domain} auth` match against the verifier's own configured home domains and a full-transaction ed25519 server signature before any field is trusted (challenge_transaction.ts:293-311,339)"

[[sanitizer_guarantees]]
kind = "structured_field"
guarantee = "home_domain is placed only into a manageData op name (structured XDR), not an interpolated/re-parsed sink (challenge_transaction.ts:99)"

[[blockers]]
kind = "non_submittable_artifact"
guarantee = "built challenge uses account seq -1 -> tx seq 0 with server source, making the server-signed challenge non-submittable (challenge_transaction.ts:79,89,129-132)"
```
