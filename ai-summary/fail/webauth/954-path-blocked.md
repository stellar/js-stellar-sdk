# F954: Path blocked: read-side muxed-account / home-domain matching in readChallengeTx & verify*

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/954-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`buildChallengeTx -> toXDR` (seed identity), escalated to the residual read-side
question: `readChallengeTx -> verifyChallengeTxSigners -> verifyChallengeTxThreshold`
muxed-account and home-domain matching edge cases.

## Blocker

Both residual dimensions are source-guarded for the high-severity cases. Muxed:
the server account ID is rejected outright if it starts with `M`
(`challenge_transaction.ts:175`); a memo plus a muxed client account is rejected
(`:231`); a muxed source on a `client_domain` op feeds
`Keypair.fromPublicKey` and throws `InvalidChallengeError` before any bypass
(`utils.ts:48-52`); and a muxed transaction source can never equal the
required non-muxed `serverAccountID` string (`:207`), so muxed forms cannot
masquerade as the server. Home-domain matching is byte-exact equality of
`` `${domain} auth` === operation.name `` against the caller-supplied whitelist
(`:294`, `:298-300`); there is no prefix, normalization, or attacker-injected
return value — only a domain already in the caller's list can match, and a
non-match throws (`:307`). Signature acceptance is bounded by Set dedup, per-sig
splice, and the `signersFound.length !== tx.signatures.length` all-consumed check
(`:536`), defeating duplicate/replayed-signature accounting tricks. No muxed or
home-domain-match input shape crosses into a materially-wrong, submittable, or
mis-authenticated result.

## Evidence

- `src/webauth/challenge_transaction.ts:175,207,231` - server-muxed reject, source-equality bind, memo+muxed-client reject.
- `src/webauth/challenge_transaction.ts:294,298-300,307` - exact home-domain string match against caller whitelist, throw on no match.
- `src/webauth/challenge_transaction.ts:500,536,541` - gatherTxSigners result with all-signatures-consumed and server-removed checks.
- `src/webauth/utils.ts:48-67` - per-signer Keypair.fromPublicKey (throws on muxed), hint+verify match, splice consumes each signature once.

## Negative Scope

- Rules out: read-side muxed-account or home-domain string-matching edge cases in `readChallengeTx`/`verifyChallengeTxSigners`/`verifyChallengeTxThreshold` producing SEP-10 acceptance of a materially-wrong account, domain, or signature set.
- Does not rule out: the `web_auth_domain` ManageData op being optional (absent op silently skips the `webAuthDomain` binding, `:325-336`), which permits cross-endpoint challenge replay only under the unprovable environmental precondition of a server signing key shared across distinct web-auth domains; and a muxed `clientAccountID` (M...) being returned to the caller (`:227,345`) for the caller to strip before signer lookup.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-b30276fb071b7f1fb432d163"
weakness = "transaction_serialization"
record_kind = "residual_escalation"
path = ["buildChallengeTx", "toXDR"]
sink = "toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["readChallengeTx", "verifyChallengeTxSigners", "verifyChallengeTxThreshold", "gatherTxSigners"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "signature_unverified_until_checked"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["read_side_muxed_or_home_domain_match_no_integrity_break"]
rules_out = ["read-side muxed-account or home-domain string-matching edge cases in readChallengeTx/verifyChallengeTxSigners/verifyChallengeTxThreshold producing SEP-10 acceptance of a materially-wrong account, domain, or signature set"]
does_not_rule_out = ["web_auth_domain ManageData op optionality (absent op skips webAuthDomain binding) enabling cross-endpoint replay only under a server key shared across web-auth domains", "muxed clientAccountID returned to caller for signer lookup"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "muxed forms are rejected (server-muxed reject, memo+muxed-client reject, muxed client_domain source throws in Keypair.fromPublicKey, muxed tx source cannot equal server) and home-domain matching is byte-exact against the caller whitelist; signature accounting is consumed-once with an all-signatures-matched check"
why_failed_brief = "source-confirmed guards block muxed and home-domain matching integrity breaks on the read-side; only a documented web_auth_domain optionality with an unprovable shared-key precondition remains open"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "muxed server rejected (:175), muxed tx source cannot equal serverAccountID (:207), memo+muxed-client rejected (:231), muxed signer throws in Keypair.fromPublicKey (utils.ts:48-52)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "home-domain matched by exact `${domain} auth` === operation.name against caller whitelist (:294,:298-300), throw on no match (:307)"

[[blockers]]
kind = "invariant"
guarantee = "signatures consumed once with signersFound.length === tx.signatures.length all-consumed check (:536), blocking duplicate/replayed-signature acceptance"
```
