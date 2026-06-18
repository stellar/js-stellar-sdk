# F958: Path blocked: verify-side consumption of attacker-signed SEP-10 challenge XDR

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/958-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> transaction.sign`

Residual escalation: the prior high-confidence record disposed of the build-side
`transaction.sign` (server-only signature over a non-submittable seq-0 challenge)
and explicitly deferred the verify-side re-verification for budget. This run
source-traces the material downstream verify surface
(`readChallengeTx`, `verifyChallengeTxSigners`, `verifyChallengeTxThreshold`,
`gatherTxSigners`/`verifyTxSignedBy`) to confirm or refute that the
re-verification of attacker-supplied challenge XDR is sound. It is sound.

## Blocker

Verification re-binds every security-relevant field and requires real
cryptographic signatures. `readChallengeTx` rejects FeeBump, enforces seq 0,
source == serverAccountID, manageData shape, home-domain match, base64 nonce
length, non-infinite/unexpired timebounds, and a valid server signature over the
tx hash (challenge_transaction.ts:183-345). Because the server signature covers
the full tx body, an attacker cannot mutate any operation/source/memo without
invalidating it. `gatherTxSigners` verifies each signature with full Ed25519
`keypair.verify` against the server-trusted `signers` list and consumes each
signature at most once (utils.ts:55-67). `verifyChallengeTxSigners` then requires
the server signature (514), a client_domain signature when that op exists (521),
at least one matched client signer (529,547), and exact
`signersFound.length === tx.signatures.length` accounting that rejects any extra
or unrecognized signature (536). An attacker holding only a genuine server-signed
challenge cannot forge a signature for an authorized client key, so no
verification success without a real authorized client signature is reachable.

## Evidence

- `src/webauth/challenge_transaction.ts:183-211` - readChallengeTx rejects FeeBump, enforces seq 0 and source == serverAccountID before any trust.
- `src/webauth/challenge_transaction.ts:339-345` - server signature over the tx hash is required, fixing the entire body the server built.
- `src/webauth/utils.ts:55-67` - gatherTxSigners does full Ed25519 verify per signature and splices each consumed signature once (no reuse/cross-attribution).
- `src/webauth/challenge_transaction.ts:514-547` - verifyChallengeTxSigners requires server sig, client_domain sig (if op present), >=1 client signer, and exact signature-count match rejecting unrecognized signatures.
- `src/webauth/challenge_transaction.ts:656-675` - verifyChallengeTxThreshold sums weights only over signers returned by the sound verifyChallengeTxSigners against the server-trusted signerSummary.

## Negative Scope

- Rules out: attacker-signed or post-sign-mutated challenge XDR being consumed by readChallengeTx/verifyChallengeTxSigners/verifyChallengeTxThreshold to yield a successful verification without a genuine authorized client signature, or to attribute the challenge to an unauthorized signer (signature reuse, count-accounting gap, hint-collision, or body mutation under the server signature).
- Does not rule out: memo-to-subaccount binding, which readChallengeTx returns but does not bind (caller responsibility); and the SEP-10-optional case where no `web_auth_domain` manageData op is present, so its value is not validated — both depend on server/caller configuration of its own challenge, not on attacker-signed XDR.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-3d5a10224340b0ec66709ad6"
weakness = "transaction_signing"
record_kind = "residual_escalation"
path = ["<anonymous>", "transaction.sign"]
sink = "transaction.sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "re-investigate residual lead"
target_functions = ["src/webauth/challenge_transaction.ts:readChallengeTx", "src/webauth/challenge_transaction.ts:verifyChallengeTxSigners", "src/webauth/challenge_transaction.ts:verifyChallengeTxThreshold", "src/webauth/utils.ts:gatherTxSigners"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "signature_checked_during_verify"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["verify_side_full_ed25519_signature_check", "exact_signature_count_accounting_rejects_unrecognized", "server_signature_over_tx_hash_fixes_body"]
rules_out = ["attacker-signed or post-sign-mutated SEP-10 challenge XDR consumed by readChallengeTx/verifyChallengeTxSigners/verifyChallengeTxThreshold yielding successful verification without a genuine authorized client signature, or attributing the challenge to an unauthorized signer"]
does_not_rule_out = ["memo-to-subaccount binding not enforced by readChallengeTx (caller responsibility)", "optional web_auth_domain manageData op absent so its value is unvalidated (server self-config)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "verify side re-enforces all structured bindings, requires server signature over the fixed tx body, full Ed25519 per-signature verification against the server-trusted signers, single-consumption splice, and exact signature-count match; attacker cannot forge an authorized client signature on a server-signed challenge"
why_failed_brief = "verify-side consumption requires real cryptographic authorized client signatures and rejects unrecognized signatures; no bypass reachable from attacker-controlled challenge XDR"
confidence = "high"

[[sanitizer_guarantees]]
kind = "cryptographic_check"
guarantee = "gatherTxSigners performs full Ed25519 keypair.verify on each signature against the server-trusted signers and consumes each signature at most once (utils.ts:55-67)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "verifyChallengeTxSigners requires server signature, client_domain signature when present, >=1 client signer, and exact signersFound.length == tx.signatures.length rejecting unrecognized signatures (challenge_transaction.ts:514-547)"

[[blockers]]
kind = "signature_integrity"
guarantee = "readChallengeTx requires a valid server signature over the full tx hash, fixing every operation/source/memo the server built so an attacker cannot mutate the body without invalidating it (challenge_transaction.ts:339-345)"
```
