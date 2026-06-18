# F968: Path blocked: readChallengeTx subsequent-op source/name + web_auth_domain verification

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/968-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> (readChallengeTx caller) -> transaction envelope/operation verification (challenge_transaction.ts:314-337)`

Residual escalation of ai-summary/fail/webauth/1054-path-blocked.md. The prior
NOT_VIABLE records on this route_id were about the build/`toEnvelope`/`toXDR`
**serialization** boundary; this run resolves the distinct **verification-logic**
question the seed left open, traced directly from source.

## Blocker

The subsequent-operation gate at line 320 is logically correct by De Morgan:
`op.source !== serverAccountID && op.name !== "client_domain"` throws unless
`op.source === serverAccountID || op.name === "client_domain"`, which is exactly
SEP-10's rule (all extra ManageData ops must be server-sourced except the
`client_domain` op, whose source is the client-domain signing key). The
`web_auth_domain` branch (325-335) does an exact `Buffer.compare`, throwing on
mismatch. Critically, the entire operation set — including the attacker-relevant
`client_domain` source that later becomes `clientSigningKey` (line 484) — is
bound by the server signature check (`verifyTxSignedBy`, line 339; re-checked
line 514), by sequence-zero non-submittability (line 200), and by transaction
source == server (line 207). A malicious client therefore cannot add, re-type,
or re-source any operation without invalidating the server signature, and the
signer accounting requires `signersFound.length === tx.signatures.length`
(line 536), blocking signature/binding inflation via a forged `client_domain` op.

## Evidence

- `src/webauth/challenge_transaction.ts:320` - accept iff server-sourced OR named `client_domain`; matches SEP-10 intent, no permissive non-`client_domain` foreign-source path.
- `src/webauth/challenge_transaction.ts:325-335` - `web_auth_domain` op value exact `Buffer.compare`, throws on mismatch; checked only when such an op is present (optional per spec).
- `src/webauth/challenge_transaction.ts:339,514` - server signature over the whole tx is required, binding the entire operation set against client tampering.
- `src/webauth/challenge_transaction.ts:200,207` - sequence must be 0 and tx source must equal server, so a tampered/foreign challenge fails before op checks.
- `src/webauth/challenge_transaction.ts:478-486,521,536` - single `client_domain` op enforced; its source must produce a real signature and total signatures must equal recognized signers, blocking forged-source inflation.

## Negative Scope

- Rules out: line 314-337 subsequent-operation source/name verification or `web_auth_domain` matching accepting an attacker-controlled, server-signature-unbound operation/binding in `readChallengeTx`/`verifyChallengeTxSigners`.
- Does not rule out: a missing `web_auth_domain` operation (absent → no check) as a spec-compliance gap on a wallet-side `readChallengeTx`-only validation, and the out-of-scope fully-malicious-anchor flow where the attacker owns the server key.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-c2496fb67b1b3d8af0e91f61"
weakness = "transaction_serialization"
record_kind = "residual_escalation"
path = ["<anonymous>", "transac ... nvelope"]
sink = "transac ... nvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/webauth/challenge_transaction.ts:readChallengeTx", "src/webauth/challenge_transaction.ts:verifyChallengeTxSigners"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signature_verified_before_return"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["sep10_subsequent_op_source_name_gate_correct", "server_signature_binds_operation_set"]
rules_out = ["line 314-337 subsequent-operation source/name check or web_auth_domain matching accepting an attacker-controlled server-signature-unbound operation or verifier-relied binding"]
does_not_rule_out = ["absent web_auth_domain operation skipping the value check on wallet-side readChallengeTx-only validation", "fully-malicious-anchor flow owning the server key (out of scope)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "subsequent-op gate (op.source!=server && op.name!=client_domain) is De-Morgan-correct vs SEP-10; web_auth_domain uses exact Buffer.compare; entire op set including client_domain source is bound by server signature, seq-0, and signersFound==signatures count"
why_failed_brief = "verification logic is correct and the operation set is bound by the server signature, sequence-zero, and signer-count invariants, so no attacker-controlled binding survives"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "line 320 accepts a subsequent op only if server-sourced or named client_domain, matching SEP-10; web_auth_domain value is exact-compared (line 331)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "verifyTxSignedBy(serverAccountID) at line 339/514, sequence==0 at line 200, and signersFound.length==tx.signatures.length at line 536 bind the full operation set against tampering and inflation"

[[blockers]]
kind = "invariant"
guarantee = "server signature over the whole transaction prevents a malicious client from adding/re-typing/re-sourcing any operation, so the line 314-337 checks never see an attacker-controlled unbound binding"
```
