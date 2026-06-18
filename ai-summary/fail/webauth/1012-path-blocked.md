# F1012: Path blocked: SEP-10 challenge envelope toXDR serialization

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/1012-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`buildChallengeTx -> toXDR`

Typed scope investigated: wallet/service caller input, SEP-10 challenge build
phase, signature-unverified, attacker-influenced challenge XDR / domains / memos
/ client accounts, transaction-xdr-decoded, bounded by transaction envelope.

## Blocker

The `toXDR` sink is the final canonical XDR encoding of an already-built,
server-signed, non-submittable challenge envelope. The account is constructed
with sequence `-1` so the transaction sequence is `0`, with the server as the
transaction source (`challenge_transaction.ts:79,89`), making the serialized
challenge non-submittable. Every attacker-influenced field is placed into a
structured, constructor-validated XDR slot before serialization: `clientAccountID`
as a `manageData` op `source` and `homeDomain`/`webAuthDomain`/`clientDomain` as
`manageData` name/value (`:97-122`), `memo` via `Memo.id` (`:126`), with the
muxed-account+memo combination rejected up front (`:75-77`). XDR encoding is
lossless and deterministic, so `toXDR` cannot introduce an integrity gap distinct
from the structured fields themselves, and the verification path
(`readChallengeTx`/`verifyChallengeTx*`) re-validates those fields against the
server signature before any trust. Serialization adds no new attacker surface.

## Evidence

- `src/webauth/challenge_transaction.ts:79` - server account seq `-1` yields tx seq `0` (non-submittable) with server source.
- `src/webauth/challenge_transaction.ts:97-122` - attacker-influenced fields enter constructor-validated `manageData` name/value/source slots only.
- `src/webauth/challenge_transaction.ts:130,132` - server signs, then `toEnvelope().toXDR("base64")` is a lossless canonical encode of the signed envelope.

## Negative Scope

- Rules out: the `toXDR` serialization step itself producing a materially-wrong, submittable, or integrity-broken challenge envelope from attacker-influenced account IDs, muxed accounts, memos, or domains.
- Does not rule out: read-side muxed-account / home-domain matching edge cases in `readChallengeTx`/`verifyChallengeTxSigners`/`verifyChallengeTxThreshold` (distinct sinks, not the serialization sink).

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
negative_claim.rules_out_codes = ["server_signed_challenge_nonsubmittable_seq_zero", "attacker_challenge_fields_into_structured_xdr_only_no_signing_integrity_break"]
rules_out = ["toXDR serialization of buildChallengeTx producing a materially-wrong, submittable, or integrity-broken challenge envelope from attacker-influenced account IDs, muxed accounts, memos, or domains"]
does_not_rule_out = ["read-side muxed-account or home-domain matching edge cases in readChallengeTx/verifyChallengeTxSigners/verifyChallengeTxThreshold"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "toXDR is a lossless canonical encode of a server-signed seq-0 non-submittable challenge; attacker fields sit in constructor-validated structured manageData/memo slots re-validated by the verification path."
why_failed_brief = "serialization sink is lossless and deterministic over a non-submittable server-signed envelope, introducing no integrity gap distinct from already-dismissed sign-path routes."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "muxed-account clientAccountID combined with a memo is rejected before build (challenge_transaction.ts:75-77); attacker fields confined to constructor-validated manageData name/value/source and Memo.id."

[[sanitizer_guarantees]]
kind = "invariant"
guarantee = "account sequence -1 yields tx sequence 0 with server source, making the serialized challenge non-submittable (challenge_transaction.ts:79,89)."

[[blockers]]
kind = "lossless_encoding"
guarantee = "toEnvelope().toXDR canonical XDR encoding is deterministic and lossless over the signed envelope, adding no attacker surface beyond the structured fields (challenge_transaction.ts:130,132)."
```
