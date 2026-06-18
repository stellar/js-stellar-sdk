# F976: Path blocked: SEP-10 challenge transaction serialization area

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/976-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> transac ... ).toXDR`

Area seed sibling set: `buildChallengeTx`, `toEnvelope`, `toXDR`, the
`transaction.toEnvelope().toXDR()` serialization expression, and the
`transaction.sign` predecessor.

## Blocker

`buildChallengeTx` computes the server signature over the fully constructed
transaction (`transaction.sign(serverKeypair)`, challenge_transaction.ts:130)
and only then serializes via `transaction.toEnvelope().toXDR("base64")`
(line 132). `toXDR` is a deterministic XDR encoding of already-built state: it
cannot add, drop, or re-type a field at the serialization boundary, so it
cannot strip or mutate a verifier-relied binding after signing. Every
attacker-influenced field — muxed/base `clientAccountID` (op source, line 101),
`homeDomain` (structured manage_data op name, line 99), `webAuthDomain`
(line 107), `clientDomain`/`clientSigningKey` (lines 119-120), and `memo`
(`Memo.id`, line 126) — enters only as a structured XDR field. Guards reject
muxed+memo (line 75) and clientDomain without signing key (line 113-114). The
challenge uses account seq -1 -> tx seq 0, making the server-signed artifact
non-submittable.

## Evidence

- `src/webauth/challenge_transaction.ts:79` - account seeded with seq "-1" so the built challenge has tx sequence 0 (non-submittable).
- `src/webauth/challenge_transaction.ts:130` - server signs the fully built transaction before any serialization.
- `src/webauth/challenge_transaction.ts:132` - `toEnvelope().toXDR("base64")` deterministically serializes already-signed state; no field transform at the boundary.
- `src/webauth/challenge_transaction.ts:75,113-114` - structural guards reject muxed+memo and clientDomain-without-signing-key before build.
- `src/webauth/challenge_transaction.ts:97-127` - all attacker-influenced inputs become structured manage_data op fields, not free-form serialized text.

## Negative Scope

- Rules out: attacker-influenced SEP-10 challenge fields (domains, memos, muxed/base client accounts, client-domain signing key) altering, dropping, re-typing, or injecting a verifier-relied binding at the `buildChallengeTx` build/`toEnvelope`/`toXDR` serialization boundary.
- Does not rule out: verify-side trust decisions in `readChallengeTx`/`verifyChallengeTxSigners`/`verifyChallengeTxThreshold` (different sink set) such as home-domain matching ambiguity, memo handling, or duplicate-signer accounting; these were not re-traced here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-4e1e89d77bb6d5e0f5457545"
weakness = "transaction_serialization_integrity"
record_kind = "area_seed"
path = ["<anonymous>", "transac ... ).toXDR"]
sink = "transac ... ).toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["<anonymous>", "transac ... ).toXDR", "buildChallengeTx", "toEnvelope", "toXDR", "transac ... nvelope"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signed_before_serialization"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["faithful_caller_state_serialization", "sign_before_serialize", "challenge_seq_zero_nonsubmittable"]
rules_out = ["attacker-influenced SEP-10 challenge fields altering, dropping, re-typing, or injecting a verifier-relied binding at the buildChallengeTx build/toEnvelope/toXDR serialization boundary"]
does_not_rule_out = ["verify-side home-domain matching, memo handling, or duplicate-signer accounting in readChallengeTx/verifyChallengeTxSigners/verifyChallengeTxThreshold"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "buildChallengeTx signs the fully constructed transaction before toEnvelope().toXDR() deterministically serializes it; attacker-influenced domains, memos, muxed/base client accounts, and client-domain signing key only enter as structured XDR op fields, so the serialization boundary cannot add, drop, or re-type a verifier-relied binding."
why_failed_brief = "sign-before-serialize plus deterministic faithful XDR round-trip leaves no field-mutation surface at the serialization sink; built challenge is also seq-zero non-submittable"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "muxed clientAccountID with memo is rejected (line 75) and clientDomain without clientSigningKey is rejected (lines 113-114) before build"

[[sanitizer_guarantees]]
kind = "ordering_invariant"
guarantee = "transaction.sign(serverKeypair) at line 130 runs before toEnvelope().toXDR() at line 132, so the server signature covers the final serialized state"

[[blockers]]
kind = "deterministic_serialization"
guarantee = "toEnvelope().toXDR() is a deterministic XDR encoding of already-built signed state and cannot add, drop, or re-type a field at the serialization boundary"

[[blockers]]
kind = "non_submittable_artifact"
guarantee = "account seq -1 yields tx seq 0 (line 79), making the server-signed challenge non-submittable"
```
