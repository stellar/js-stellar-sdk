# F1054: Path blocked: Challenge transaction serialization to envelope

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/1054-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> transac ... nvelope`

Area seed sibling targets adjudicated: `buildChallengeTx`, `toEnvelope`,
`toXDR`, `transaction.toEnvelope().toXDR`.

## Blocker

`buildChallengeTx` constructs the challenge with `TransactionBuilder`, calls
`builder.build()`, then `transaction.sign(serverKeypair)`, and only then
`transaction.toEnvelope().toXDR("base64").toString()`
(`challenge_transaction.ts:129-132`). The server signature is computed over the
built transaction hash *before* serialization, and `toEnvelope()/toXDR()` is a
deterministic structural XDR encoding of that already-built, already-signed
state. The serialization boundary cannot add, drop, or re-type any field: every
attacker-influenced input (`clientAccountID` incl. muxed `M...` op source,
`homeDomain` op name, `webAuthDomain` value, `clientDomain` value,
`clientSigningKey` as the `client_domain` op source) is placed into typed
builder operations before signing and is encoded faithfully. Re-derived from
source on this exact route, not copied from prior memory; bypass attempts on
each sibling target failed because XDR encoding preserves structure.

## Evidence

- `challenge_transaction.ts:129-132` - `build()` then `sign()` then
  `toEnvelope().toXDR("base64")`: sign-before-serialize, deterministic encoding.
- `challenge_transaction.ts:97-123` - all attacker-influenced fields are placed
  into typed `Operation.manageData` ops (names/values/sources) before build.
- `challenge_transaction.ts:75-77,125-127` - muxed-account/memo exclusivity is a
  build-time throw, not a serialization-time field drop.

## Negative Scope

- Rules out: attacker-influenced SEP-10 challenge fields altering, dropping,
  re-typing, or injecting a verifier-relied binding at the
  `buildChallengeTx`/`toEnvelope`/`toXDR` serialization boundary.
- Does not rule out: verification-side handling in `readChallengeTx`
  (`challenge_transaction.ts:314-337`), e.g. the subsequent-operation source
  check `op.source !== serverAccountID && op.name !== "client_domain"` and
  `web_auth_domain` matching — a distinct sink (`readChallengeTx`), not the
  serialization route adjudicated here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-c2496fb67b1b3d8af0e91f61"
weakness = "Transaction Integrity / Serialization"
record_kind = "area_seed"
path = ["<anonymous>", "transac ... nvelope"]
sink = "transac ... nvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["buildChallengeTx", "toEnvelope", "toXDR", "transaction.toEnvelope().toXDR"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signed_before_serialization"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["faithful_caller_state_serialization", "sign_before_serialize"]
rules_out = ["attacker-influenced SEP-10 challenge fields altering/dropping/re-typing a verifier-relied binding at the buildChallengeTx/toEnvelope/toXDR serialization boundary"]
does_not_rule_out = ["readChallengeTx subsequent-operation source/name verification (op.source != serverAccountID && op.name != client_domain) and web_auth_domain matching at challenge_transaction.ts:314-337"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "buildChallengeTx places attacker-influenced fields into typed manageData ops, builds, signs, then deterministically XDR-encodes; serialization cannot add/drop/re-type a binding."
why_failed_brief = "Sign-before-serialize plus deterministic structural XDR encoding means the serialization boundary preserves every field; no binding can be lost or injected here."
confidence = "high"

[[sanitizer_guarantees]]
kind = "faithful_serialization"
guarantee = "toEnvelope().toXDR() deterministically encodes already-built signed state (challenge_transaction.ts:129-132); no field added, dropped, or re-typed"

[[sanitizer_guarantees]]
kind = "sign_before_serialize"
guarantee = "serverKeypair signs the built transaction before serialization, binding the server signature to the final field set"

[[blockers]]
kind = "structural_invariant"
guarantee = "XDR serialization preserves typed builder operation structure; attacker-influenced inputs survive encoding without losing the verifier-relied binding"
```
