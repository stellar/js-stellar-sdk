# F910: Path blocked: SEP-10 challenge serialization boundary (buildChallengeTx -> toEnvelope)

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/910-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> (buildChallengeTx) -> toEnvelope`

Area seed sibling targets adjudicated: `buildChallengeTx`, `toEnvelope`,
`toXDR`, and the trailing `transaction.toEnvelope().toXDR("base64")` expression.

## Blocker

In `buildChallengeTx` the server signs the assembled transaction
(`transaction.sign(serverKeypair)`) **before** it serializes
(`transaction.toEnvelope().toXDR("base64")`), so the ed25519 server signature
binds the exact wire bytes that are emitted. Serialization is the standard
deterministic XDR round-trip of construction state (the same
`faithful_caller_state_serialization` invariant recorded for the Horizon-side
`toEnvelope` route), so no attacker-influenced field can be added, dropped, or
re-typed at the serialization boundary. Every attacker-influenced field
(`homeDomain`, `clientAccountID`, `clientDomain`, `clientSigningKey`, `memo`)
passes through `Operation.manageData` / `Memo.id` first, which reject oversized
or malformed input with a catchable build-time throw (fail-closed, Low) before
any bytes are serialized. On verification, `readChallengeTx` re-requires the
server signature before trusting any field, so a binding cannot be silently
lost across build serialization.

## Evidence

- `src/webauth/challenge_transaction.ts:130-132` - server signs, then `toEnvelope().toXDR("base64")` serializes the already-signed tx; signature covers the emitted bytes.
- `src/webauth/challenge_transaction.ts:97-127` - attacker fields flow into `Operation.manageData`/`Memo.id`, which throw on invalid/oversized input before serialization (fail-closed).
- `src/webauth/challenge_transaction.ts:339-343` - `verifyTxSignedBy(transaction, serverAccountID)` gates trust of every decoded field on the server signature, matching prior negative memory.

## Negative Scope

- Rules out: attacker-influenced SEP-10 challenge fields losing or altering a verifier-relied binding at the `toEnvelope`/`toXDR` serialization boundary in `buildChallengeTx`.
- Does not rule out: verify-side parsing ambiguities in `readChallengeTx` (exact-match home-domain extraction `${domain} auth`, the `op.source !== serverAccountID && op.name !== "client_domain"` unrecognized-op logic at line 320, and the optional `web_auth_domain` value check) — these are a distinct `readChallengeTx` parsing sink, not the serialization sink, and remain governed by the server-signature blocker in prior record js-sdk-375c48d6c983962c3a50ef4b.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-f0db09f63984613d62d62039"
weakness = "Transaction Serialization Integrity"
record_kind = "area_seed"
path = ["<anonymous>", "toEnvelope"]
sink = "toEnvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["buildChallengeTx", "toEnvelope", "toXDR", "src/webauth/challenge_transaction.ts:buildChallengeTx"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signed_before_serialization"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["faithful_caller_state_serialization", "sign_before_serialize"]
rules_out = ["attacker-influenced SEP-10 challenge fields altering or dropping a verifier-relied binding at the toEnvelope/toXDR serialization boundary in buildChallengeTx; the server signs before serializing and the deterministic XDR round-trip emits exactly the signed construction state"]
does_not_rule_out = ["readChallengeTx verify-side parsing: home-domain exact-match extraction, the line-320 unrecognized-op condition (op.source != server && op.name != client_domain), and the optional web_auth_domain value check"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "buildChallengeTx signs the assembled transaction before toEnvelope().toXDR() serializes it, so the server ed25519 signature binds the exact emitted bytes; attacker fields throw at manageData/Memo build time before serialization and are re-gated on the server signature at verify time."
why_failed_brief = "serialization faithfully encodes server-signed construction state; no binding lost at the toEnvelope/toXDR sink and oversized/invalid fields fail closed before serialization"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "transaction.sign(serverKeypair) at challenge_transaction.ts:130 runs before toEnvelope().toXDR at :132, so the server signature binds the serialized bytes"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "Operation.manageData/Memo.id at challenge_transaction.ts:97-127 reject oversized or malformed attacker fields with a catchable throw before serialization"

[[blockers]]
kind = "invariant"
guarantee = "toEnvelope/toXDR is a deterministic XDR round-trip of construction state (faithful_caller_state_serialization); it cannot add, drop, or re-type a field at the serialization boundary"
```
