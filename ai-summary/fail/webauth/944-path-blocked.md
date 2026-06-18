# F944: Path blocked: gatherTxSigners signers×signatures verify-loop algorithmic cost

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/944-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`gatherTxSigners -> Array.from`

(escalated residual re-investigation of the algorithmic-cost amplification lead,
not the prior buffer-decode/accounting angle)

## Blocker

The nested `signers (N) × txSignatures (M)` loop in `gatherTxSigners`
(`utils.ts:41-68`) gates the only expensive operation — `keypair.verify()`
ed25519 at `utils.ts:62` — behind a cheap 4-byte hint equality check
(`utils.ts:58` `continue` when `decSig.hint()` ≠ `keypair.signatureHint()`).
`M = tx.signatures.length` is hard-capped at 20 by the XDR schema
(`varArray(DecoratedSignature, 20)`), enforced at decode for all envelope types.
`N = allSigners` is server-supplied and deduplicated into a Set
(`challenge_transaction.ts:450-500`), not attacker-controlled, and bounded by
Stellar account signer limits. A forged signature carries exactly one hint and
thus matches at most one distinct server signer (the attacker cannot force the
server's keys to share last-4-byte hints), so each ≤20 signatures is ed25519
-verified at most once. Worst realistic cost ≈ M verifies; absolute ceiling
N×M ≤ 400 verifies (~tens of ms) per call, with no accumulating queue/cache
sink. This constant per-request bound is below Medium.

## Evidence

- `src/webauth/utils.ts:55-67` - inner loop verifies only on hint match; the `continue` at line 58 skips ed25519 verify for non-matching hints, so the expensive op is hint-gated, not per-pair.
- `node_modules/@stellar/stellar-base/lib/generated/curr_generated.js:5118` - `TransactionV1Envelope` signatures is `xdr.varArray(DecoratedSignature, 20)`; lines 5052/5188 cap V0 and FeeBump envelopes identically, so M ≤ 20 at decode.
- `src/webauth/challenge_transaction.ts:450-500` - `allSigners` (N) is built from the caller-supplied `signers` arg deduped via a Set plus the server key; it is server-controlled, not from the challenge XDR.

## Negative Scope

- Rules out: attacker-set decorated-signature hints amplifying the
  `gatherTxSigners` signers×signatures ed25519 verify loop into a Medium+
  resource-exhaustion DoS, given the XDR `signatures<20>` cap and server
  -controlled signer set.
- Does not rule out: generic repeated-request flooding of the SEP-10 verify
  endpoint (out of SDK scope), or cost in unrelated callers that pass a large
  attacker-controlled `signers` array directly to `gatherTxSigners`.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-fc362ffda93f19786dce2b9a"
weakness = "algorithmic_complexity"
record_kind = "residual_escalation"
path = ["gatherTxSigners", "Array.from"]
sink = "Array.from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/webauth/utils.ts:gatherTxSigners", "src/webauth/challenge_transaction.ts:verifyChallengeTxSigners"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signature_verified_before_return"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["gathertxsigners_verify_loop_bounded_by_xdr_signature_cap"]
rules_out = ["attacker-set decorated-signature hints amplifying the gatherTxSigners signers x signatures ed25519 verify loop into a Medium+ DoS"]
does_not_rule_out = ["generic repeated-request flooding of SEP-10 verify (out of SDK scope)", "callers passing a large attacker-controlled signers array directly to gatherTxSigners"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "gatherTxSigners verify is hint-gated; M (tx.signatures) <= 20 by XDR varArray cap, N (signers) is server-controlled and deduped, so per-call ed25519 verify count is a small constant (<=400) with no accumulating sink"
why_failed_brief = "expensive ed25519 verify is gated on 4-byte hint match; signature vector hard-capped at 20 by XDR (curr_generated.js:5118) and signer set is server-controlled, bounding per-request cost below Medium"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "constant_bound"
guarantee = "tx.signatures is decoded as xdr.varArray(DecoratedSignature, 20); M <= 20 enforced at XDR decode for V0/V1/FeeBump envelopes"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "utils.ts:58 hint-equality continue gates the ed25519 verify; a forged signature's single 4-byte hint matches at most one distinct server signer, so each signature is verified at most once"

[[blockers]]
kind = "trust_boundary"
guarantee = "allSigners (N) in verifyChallengeTxSigners is built from the caller/server-supplied signers list deduped via Set, not from the attacker-controlled challenge XDR"
```
