# F929: Path blocked: muxed client source account in verifyChallengeTxThreshold weight/signer accounting

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/929-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`readChallengeTx -> from`

Residual question (escalated): does `verifyChallengeTxThreshold` weight accounting
and signer-matching mishandle muxed (`M...`) client source accounts as a
threshold/logic concern (distinct from the prior buffer-decode dismissal)?

## Blocker

A muxed (`M...`) client source account can only appear as `operation.source` /
returned `clientAccountID` inside a server-signed challenge (the whole tx, including
operation source, is bound by `verifyTxSignedBy(serverAccountID)` at
`challenge_transaction.ts:339`), and it surfaces only as an informational return
value. The muxed string never enters threshold weight accounting or signer
matching: `verifyChallengeTxSigners` drops every non-`G` signer at line 462 and
throws if none remain (470-474); `gatherTxSigners` calls
`Keypair.fromPublicKey(signer)` which throws `InvalidChallengeError` for any `M...`
signer (utils.ts:48-53); `signersFound` is a `Set` (utils.ts:39) consuming each
signature once via splice (utils.ts:64); `signersFound.length !== tx.signatures.length`
rejects unrecognized signatures (line 536); and the weight loop (666-669) sums one
weight per unique found signer, with `signersFound` a subset of the caller's `G...`
`signerSummary` keys, so weight cannot be inflated. Muxed accounts thus correctly
threshold against the base account's `G...` signers — the intended SEP-10 semantics —
and are fail-closed everywhere else.

## Evidence

- `src/webauth/challenge_transaction.ts:222-242` - `clientAccountID = operation.source` may be `M...` only when no memo (memo+muxed throws); it is returned but never used as a matching key.
- `src/webauth/challenge_transaction.ts:339` - full-transaction server signature gate binds the operation source, so an attacker cannot inject a muxed source without a valid server signature.
- `src/webauth/challenge_transaction.ts:462,470-474` - non-`G...` signers (including `M...`) are filtered out before matching; empty client-signer set throws.
- `src/webauth/utils.ts:39,48-53,64` - `Keypair.fromPublicKey` throws on `M...`; `signersFound` Set + per-signature splice prevent double-count/double-consume.
- `src/webauth/challenge_transaction.ts:536,666-669` - signature-count equality rejects extra signatures; weight summed once per unique found signer drawn from caller `signerSummary`, no inflation path.

## Negative Scope

- Rules out: a muxed (`M...`) client source account causing `verifyChallengeTxThreshold` to over-count weight, double-match signatures, or accept signers that did not sign, thereby meeting a threshold the attacker's actual keys do not satisfy.
- Does not rule out: caller passing a `signerSummary` resolved for the wrong account when `clientAccountID` is muxed (documented caller responsibility, out of scope); distinct non-muxed weight-accounting variants on a sibling signer path.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-155fba59d971bf203609570e"
weakness = "buffer_decode"
record_kind = "residual_escalation"
path = ["readChallengeTx", "from"]
sink = "from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "re-investigate residual lead"
target_functions = ["challenge_transaction.ts:readChallengeTx", "challenge_transaction.ts:verifyChallengeTxThreshold", "challenge_transaction.ts:verifyChallengeTxSigners", "utils.ts:gatherTxSigners"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signature_verified_before_return"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["muxed_client_source_account_breaks_threshold_weight_accounting", "muxed_client_source_account_bypasses_signer_matching"]
rules_out = ["muxed (M...) client source account in readChallengeTx causing verifyChallengeTxThreshold to over-count weight, double-consume signatures, or accept non-signing signers to meet threshold"]
does_not_rule_out = ["caller-supplied signerSummary resolved for the wrong account when clientAccountID is muxed (documented caller responsibility)", "non-muxed weight-accounting variants on sibling signer paths"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "muxed client source account only appears as a server-signed, informational clientAccountID; non-G signers are filtered (line 462) and Keypair.fromPublicKey throws on M... (utils.ts:48), so muxed strings never enter signer matching; signersFound Set + per-signature splice + signature-count equality (line 536) + per-unique-signer weight sum (666-669) prevent any threshold inflation"
why_failed_brief = "weight accounting and signer matching operate solely on caller G... signerSummary keys and consumed signatures; muxed client source accounts are fail-closed and only threshold against the base account, the intended SEP-10 semantics"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "verifyChallengeTxSigners filters out all non-G... signers (line 462) and gatherTxSigners throws InvalidChallengeError on M... via Keypair.fromPublicKey (utils.ts:48-53), so muxed strings never reach signer/weight matching"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "signersFound is a Set and each signature is spliced/consumed once (utils.ts:39,64); weight is summed once per unique found signer (challenge_transaction.ts:666-669) from caller signerSummary, preventing weight inflation or double-consume"

[[blockers]]
kind = "signature_gate"
guarantee = "full-transaction server signature (verifyTxSignedBy at line 339) plus signersFound.length !== tx.signatures.length (line 536) bind the operation source and reject unrecognized signatures, so an attacker cannot inject a muxed source or extra signatures"
```
