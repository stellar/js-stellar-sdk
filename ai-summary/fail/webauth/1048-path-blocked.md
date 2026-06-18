# F1048: Path blocked: SEP-10 challenge build serialized to XDR envelope

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/1048-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`buildChallengeTx -> toXDR`

## Blocker

The serialization sink is canonical, lossless XDR encoding over an
already-structured, server-signed `TransactionEnvelope`
(`challenge_transaction.ts:129-132`): `builder.build()` →
`transaction.sign(serverKeypair)` → `transaction.toEnvelope().toXDR("base64")`.
Every attacker-influenced field (`clientAccountID`, `memo`, `clientDomain`,
`clientSigningKey`, `homeDomain`/`webAuthDomain`) is committed to typed XDR
structures via `Operation.manageData`, `Memo.id`, and the timebounds builder
*before* the sink, so `toXDR` adds no attacker surface beyond those structured
fields. The account is built with sequence `"-1"` (→ 0), making the signed
challenge non-submittable, and integrity is enforced read-side by
`readChallengeTx`/`verifyChallengeTx*`. Malformed numeric/memo/domain inputs
throw in `manageData`/`Memo.id` rather than producing a materially-wrong
envelope.

## Evidence

- `src/webauth/challenge_transaction.ts:75-77` - muxed-account + memo combination is rejected before assembly, preventing a conflicting memo/source state.
- `src/webauth/challenge_transaction.ts:97-123` - attacker-influenced fields enter only as typed `manageData` operands (`name`/`value`/`source`); invalid values throw in `Operation.manageData` before the sink.
- `src/webauth/challenge_transaction.ts:129-132` - build/sign then `toEnvelope().toXDR("base64")`; canonical deterministic encoding over the signed envelope, the same blocker confirmed by prior route memory (route_id js-sdk-b30276fb071b7f1fb432d163).

## Per-Target Disposition (area_seed)

- `buildChallengeTx` - assembles typed ops; no integrity break at assembly (lines 89-127).
- `toEnvelope` / `toXDR` / `transac ... ).toXDR` / `transac ... nvelope` - canonical lossless serialization sink, no added attacker surface (line 132).
- `<anonymous>` - no distinct serialization-side mechanism; builder closures only forward typed operands.

## Negative Scope

- Rules out: `toXDR`/`toEnvelope` serialization of `buildChallengeTx` producing a materially-wrong, submittable, or integrity-broken challenge envelope from attacker-influenced account IDs, muxed accounts, memos, or domains.
- Does not rule out: read-side string-matching/memo/muxed acceptance edge cases in `readChallengeTx`/`verifyChallengeTxSigners`/`verifyChallengeTxThreshold` (separate routes).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-b30276fb071b7f1fb432d163"
weakness = "transaction serialization integrity"
record_kind = "area_seed"
path = ["buildChallengeTx", "toXDR"]
sink = "toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["buildChallengeTx", "toEnvelope", "toXDR"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "signature_unverified_until_checked"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["attacker_challenge_fields_into_structured_xdr_only_no_signing_integrity_break", "server_signed_challenge_nonsubmittable_seq_zero"]
rules_out = ["toXDR/toEnvelope serialization of buildChallengeTx producing a materially-wrong, submittable, or integrity-broken challenge envelope from attacker-influenced account IDs, muxed accounts, memos, or domains"]
does_not_rule_out = ["read-side muxed-account, memo, or home-domain string-matching edge cases in readChallengeTx/verifyChallengeTxSigners/verifyChallengeTxThreshold"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "buildChallengeTx commits all attacker-influenced fields to typed XDR ops/memo/timebounds, signs with the server key over a seq-zero (non-submittable) tx, then serializes via canonical lossless toEnvelope().toXDR; the sink adds no attacker surface beyond structured fields."
why_failed_brief = "canonical deterministic XDR serialization over a server-signed non-submittable challenge; attacker fields confined to structured fields, malformed values throw before the sink; integrity enforced read-side."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "muxed-account + memo combination rejected before assembly (challenge_transaction.ts:75-77); attacker fields enter only as typed manageData/Memo operands that throw on invalid values before the sink"

[[blockers]]
kind = "canonical_encoding"
guarantee = "toEnvelope().toXDR('base64') is deterministic and lossless over the signed envelope, adding no attacker surface beyond structured fields (challenge_transaction.ts:129-132); seq -1 -> 0 makes the challenge non-submittable"
```
