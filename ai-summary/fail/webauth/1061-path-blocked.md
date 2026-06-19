# F1061: Path blocked: buildChallengeTx → sign challenge signing boundary

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/1061-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`buildChallengeTx -> sign`

**Target set**: `buildChallengeTx`, `sign`, `transaction.sign`

## Blocker

Three independent blockers shut this area. First, the sign sink in `buildChallengeTx` always uses `serverKeypair` (line 130 of challenge_transaction.ts); no attacker-controlled input (clientAccountID, memo, homeDomain, webAuthDomain, clientDomain, clientSigningKey) can substitute a different signing key or make the resulting sequence-0 transaction submittable. Second, the transaction hash fed to `transaction.sign()` includes the network passphrase (TransactionSignaturePayload, transaction.ts:268-271); the server's signed challenge cannot be replayed on a different network passphrase without invalidating the server signature. Third, `readChallengeTx` re-verifies the server signature at line 339 before any trust is granted, so a modified or forged challenge XDR is always caught. Adversarial re-review of all three prior-record blockers from source confirmed each gate holds on this exact route.

## Evidence

- `src/webauth/challenge_transaction.ts:79,130` — Account seq set to "-1" (sequence becomes 0 after build), then `transaction.sign(serverKeypair)` — signing key is always the server keypair, not any attacker-controlled parameter
- `src/base/transaction.ts:268-271` — `signatureBase()` hashes `networkPassphrase` into the signature payload; hash differs per passphrase, blocking cross-network replay
- `src/webauth/challenge_transaction.ts:339-343` — `verifyTxSignedBy(transaction, serverAccountID)` runs before returning any decoded challenge, so any XDR modification invalidates the path
- `src/base/operation.ts:143-147` — `fromXDRObject` leaves `result.source` unset when `sourceAccount()` is null; `readChallengeTx:320` conditionally passes `client_domain` ops with undefined source, but the bypass is blocked by the server-signature gate at line 339
- `src/webauth/challenge_transaction.ts:540-545` — `splice(indexOf(...), 1)` on already-removed server key returns index -1, causing `splice(-1, 1)` to trim the last client signer — real correctness bug but causes false rejection (DoS), not false acceptance

## Adversarial Re-Review of Prior Blockers

**Prior [1] and [2]** (route_id js-sdk-a9f6c50dcfe1730cf98bbd7a): Blocker "seq-0 non-submittable + server-sig gate" confirmed at lines 79, 130, 339. Bypass attempt: attacker-provided `homeDomain`, `memo`, or `clientSigningKey` feeds only into manage_data op content, not the signing key or the server sig check. No bypass found.

**Prior [3]** (sibling js-sdk-21ec7ae7ad0f3e8358ab8493): Blocker "build-side sign output non-authenticating" confirmed; manage_data operations carry no financial authority and seq-0 is protocol-rejected by validators if the server account seq is higher. No bypass found.

**Prior [4]** (sibling js-sdk-21ec7ae7ad0f3e8358ab8493): Blocker "deduped signersFound Set + per-signature splice" confirmed in utils.ts gatherTxSigners; a signature is spliced from the copy once consumed, preventing any signer from being credited twice.

## Negative Scope

- Rules out: attacker-influenced clientAccountID/memo/homeDomain/webAuthDomain/clientDomain/clientSigningKey altering which key signs or what network-bound hash is signed in `buildChallengeTx`, and duplicate or extra client signatures inflating threshold weight
- Does not rule out: (a) the `splice(-1, 1)` correctness bug at challenge_transaction.ts:544 as a DoS (false-rejection) vector if an attacker's clientDomain TOML advertises `SIGNING_KEY = serverKP.publicKey()`, triggering incorrect removal of the last client signer; (b) sourceless `client_domain` op bypass (challenge_transaction.ts:320 + verifyChallengeTxSigners:484) if a non-`buildChallengeTx` challenge construction path signs an op without explicit source; neither reaches Medium severity on this exact route

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-a9f6c50dcfe1730cf98bbd7a"
weakness = "transaction_signing"
record_kind = "area_seed"
path = ["buildChallengeTx", "sign"]
sink = "sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "transaction_signing"
target_functions = ["buildChallengeTx", "sign", "transaction.sign"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "signature_unverified_until_checked"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = [
  "attacker_inputs_alter_signing_key_in_buildChallengeTx",
  "attacker_inputs_make_challenge_submittable_or_preauthenticated",
  "duplicate_client_signatures_inflate_threshold_weight",
  "cross_network_passphrase_replay_of_server_signature"
]
rules_out = [
  "attacker-influenced challenge fields (clientAccountID/memo/homeDomain/webAuthDomain/clientDomain/clientSigningKey) altering which key signs or what is signed in buildChallengeTx",
  "duplicate or extra client signatures inflating verifyChallengeTxThreshold weight"
]
does_not_rule_out = [
  "splice(-1, 1) correctness bug at challenge_transaction.ts:544 as a DoS false-rejection vector (not false acceptance) when clientSigningKey matches a key already removed from signersFound",
  "sourceless client_domain op bypass of clientSigningKey requirement if a non-buildChallengeTx path signs such a challenge"
]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "buildChallengeTx always signs with serverKeypair over a seq-0 non-submittable transaction; no attacker-controlled input can change the signing key, the network passphrase binding, or bypass the server-signature gate in readChallengeTx"
why_failed_brief = "server signature gate (challenge_transaction.ts:339) and fixed signing key (line 130) block all attacker-influenced inputs from altering signing integrity; adversarial re-review of all four prior blockers confirmed from source"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "transaction.sign(serverKeypair) at line 130 uses the server's keypair only; no attacker parameter substitutes a different key"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "signatureBase() at transaction.ts:268-271 binds hash(networkPassphrase) into the signature payload, preventing cross-network replay"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "verifyTxSignedBy(transaction, serverAccountID) at challenge_transaction.ts:339 rejects any XDR where the server signature does not cover the exact transaction bytes"

[[blockers]]
kind = "guard_confirmed"
guarantee = "seq-0 Account('-1') at line 79 produces a non-submittable challenge; the build-side sign output has no material financial authority and cannot be replayed as authenticated without a subsequent client signature and server-side readChallengeTx/verifyChallengeTx* call"
```
