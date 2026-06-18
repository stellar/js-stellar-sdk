# F1018: Path blocked: SEP-10 challenge transaction signing path

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/1018-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> transaction.sign`

Area seed sibling targets: `<anonymous>`, `sign`, `transaction.sign`, `buildChallengeTx`.

## Blocker

The only real server-signing sink in `src/webauth` is `transaction.sign(serverKeypair)`
at `challenge_transaction.ts:130` inside `buildChallengeTx` (the three other
`transaction.sign(...)` strings in the file/`utils.ts` are JSDoc `@example`
comments). The signed object is built from `new Account(serverKeypair.publicKey(),
"-1")` (line 79), so the resulting transaction sequence is 0, which is
non-submittable on the network. Only the server key signs; the client signature
required for SEP-10 authentication is added later and re-verified by
`verifyChallengeTxSigners`/`verifyChallengeTxThreshold`. All attacker-influenced
fields (`clientAccountID`, `homeDomain`, `memo`, `clientDomain`,
`clientSigningKey`, muxed state) flow only into structured `manageData`
ops/memo, and every build-side constraint (muxed+memo line 75,
clientDomain+clientSigningKey line 113) is enforced before `build()`/`sign()`,
so no attacker field reaches signing before its binding constraint is set.

## Evidence

- `src/webauth/challenge_transaction.ts:79` - server source account uses seq "-1", yielding tx sequence 0 (non-submittable).
- `src/webauth/challenge_transaction.ts:130` - sign uses only `serverKeypair`; no client/attacker key is added at build time.
- `src/webauth/challenge_transaction.ts:75,113` - muxed+memo and clientDomain+clientSigningKey constraints throw before `build()`/`sign()`, so signing never precedes constraint establishment.
- `grep transaction.sign( src/webauth/` - sole non-comment signing sink is line 130; sibling targets `<anonymous>`/`sign`/`transaction.sign` all resolve here.

## Negative Scope

- Rules out: attacker-influenced challenge fields (clientAccountID/homeDomain/memo/clientDomain/clientSigningKey/muxed state) reaching `buildChallengeTx`'s `transaction.sign` to produce a submittable, pre-authenticated, or materially-wrong server-signed challenge before build-side binding constraints are established.
- Does not rule out: integrity issues on the verify side (`readChallengeTx`, `verifyChallengeTxSigners`, `verifyChallengeTxThreshold`) where attacker-signed challenge XDR is consumed — a distinct sink not covered by this signing path.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-3d5a10224340b0ec66709ad6"
weakness = "authorization_integrity"
record_kind = "area_seed"
path = ["<anonymous>", "transaction.sign"]
sink = "transaction.sign"
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
negative_claim.rules_out_codes = ["server_signed_challenge_nonsubmittable_seq_zero", "build_constraints_enforced_before_sign", "attacker_fields_into_structured_xdr_only_no_signing_integrity_break"]
rules_out = ["attacker-influenced clientAccountID/homeDomain/memo/clientDomain/clientSigningKey/muxed state making buildChallengeTx's transaction.sign emit a submittable, pre-authenticated, or materially-wrong server-signed SEP-10 challenge"]
does_not_rule_out = ["verify-side consumption of attacker-signed challenge XDR in readChallengeTx/verifyChallengeTxSigners/verifyChallengeTxThreshold"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "buildChallengeTx signs a seq-0 (Account '-1') transaction with only the server key after enforcing all build-side constraints; the signed challenge is non-submittable and non-authenticating, and attacker fields land only in structured manageData ops/memo re-checked on the verify side."
why_failed_brief = "sole signing sink (line 130) emits a seq-0 server-only-signed non-submittable challenge with all constraints enforced before sign; no signing-integrity break reachable"
confidence = "high"

[[sanitizer_guarantees]]
kind = "invariant"
guarantee = "Account seq '-1' yields tx sequence 0 (challenge_transaction.ts:79), making the server-signed challenge non-submittable on-network."

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "muxed+memo (line 75) and clientDomain+clientSigningKey (line 113) constraints throw before build()/sign(), so no attacker field reaches signing before its binding constraint."

[[blockers]]
kind = "invariant"
guarantee = "transaction.sign at line 130 adds only the server signature; SEP-10 authentication requires a later client signature re-verified by verifyChallengeTxSigners/Threshold."
```
