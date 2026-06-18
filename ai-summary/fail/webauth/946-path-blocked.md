# F946: Path blocked: SEP-10 challenge build signing surface

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/946-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`buildChallengeTx -> sign`

## Blocker

`buildChallengeTx` constructs the challenge over `new Account(serverKey, "-1")`, so `build()` emits a transaction with **sequence 0** and the server account as source (challenge_transaction.ts:79,89,129) — a non-submittable object on the live network. Every attacker-influenced input (`clientAccountID`, `homeDomain`, `webAuthDomain`, `memo`, `clientDomain`, `clientSigningKey`) is placed only into structured, length-bounded XDR fields: manage-data op names/values and memo (L97-127), not into any parsed/evaluated text sink. The `sign` sink at L130 is a plain ed25519 attestation over that structured state. Producing a server signature here grants no authorization: SEP-10 still requires the subsequent client signature plus server-side `readChallengeTx`/`verifyChallengeTxSigners`/`verifyChallengeTxThreshold` validation behind the full-transaction server-signature gate. No attacker field can make this sink emit a materially-wrong, submittable, or authenticated transaction.

## Evidence

- `src/webauth/challenge_transaction.ts:79,89,129` - account seq `-1` -> built tx sequence 0 with server source, non-submittable.
- `src/webauth/challenge_transaction.ts:97-127` - attacker-influenced domains/memo/client fields confined to structured manage-data ops and `Memo.id`; op names are length-bounded XDR strings (no injection sink).
- `src/webauth/challenge_transaction.ts:75-77,113-114` - muxed+memo and clientDomain/clientSigningKey guards are server-side preconditions; bypass yields only a thrown error, not attacker gain.
- `src/webauth/challenge_transaction.ts:130` - `transaction.sign(serverKeypair)` is ed25519 over the tx hash of the above structured state, no field re-typing.

## Per-Target Disposition (area_seed)

- `buildChallengeTx` - traced end-to-end; blocked as above.
- `transaction.sign` / `sign` / `<anonymous>` - all resolve to the single L130 signing call over non-submittable seq-0 structured state; no distinct material sink.

## Negative Scope

- Rules out: attacker-influenced clientAccountID/memo/homeDomain/webAuthDomain/clientDomain fields causing `buildChallengeTx` to sign a materially-wrong, submittable, or authenticated transaction at the `sign` sink.
- Does not rule out: verification-side trust decisions in `readChallengeTx`, `verifyChallengeTxSigners`, `verifyChallengeTxThreshold`, and `gatherTxSigners` (distinct sinks/route_ids) where these structured fields are consumed.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-a9f6c50dcfe1730cf98bbd7a"
weakness = "authorization integrity / transaction signing"
record_kind = "area_seed"
path = ["buildChallengeTx", "sign"]
sink = "sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "transaction_signing"
target_functions = ["<anonymous>", "sign", "transaction.sign", "buildChallengeTx"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "signature_unverified_until_checked"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["server_signed_challenge_nonsubmittable_seq_zero", "attacker_challenge_fields_into_structured_xdr_only_no_signing_integrity_break"]
rules_out = ["attacker-influenced clientAccountID/memo/homeDomain/webAuthDomain/clientDomain fields making buildChallengeTx sign a materially-wrong, submittable, or authenticated transaction at the sign sink"]
does_not_rule_out = ["verification-side trust decisions in readChallengeTx, verifyChallengeTxSigners, verifyChallengeTxThreshold, and gatherTxSigners that consume these structured fields"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "buildChallengeTx places attacker-influenced domains/memo/client fields into structured manage-data ops on a seq-0 non-submittable transaction, then signs with the server key; the sign sink yields no authorization on its own."
why_failed_brief = "seq-0 non-submittable server-signed challenge with attacker fields confined to structured XDR ops; authorization still requires client signature plus downstream server verification."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "invariant"
guarantee = "account seq -1 -> tx sequence 0 makes the server-signed challenge non-submittable to the live network"

[[sanitizer_guarantees]]
kind = "structured_field"
guarantee = "attacker-influenced inputs land only in length-bounded manage-data op names/values and Memo.id, no text-injection/eval sink"

[[blockers]]
kind = "protocol_gate"
guarantee = "SEP-10 authorization requires a subsequent client signature and server-side readChallengeTx/verifyChallengeTx* validation behind the full-transaction server-signature gate"
```
