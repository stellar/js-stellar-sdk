# F909: Path blocked: absent web_auth_domain operation skips domain check (missing-op)

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/909-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`readChallengeTx -> Buffer.from`

Residual question: "absent web_auth_domain operation skips the domain check
(missing-op family)".

## Blocker

The residual is factually true but not exploitable at Medium+. The
`web_auth_domain` value check runs only inside the `subsequentOperations` loop
under `if (op.name === "web_auth_domain")` (challenge_transaction.ts:325-336),
so omitting the operation skips it. However, `readChallengeTx` returns only
after `verifyTxSignedBy(transaction, serverAccountID)` (line 339), which calls
`gatherTxSigners` and requires a valid ed25519 server signature over the
**entire** transaction. An attacker who controls the challenge XDR but not the
server secret key cannot strip or forge the `web_auth_domain` operation from a
server-signed challenge without invalidating that signature. Additionally the
home_domain manage-data operation is mandatory: `matchedHomeDomain` must be
truthy or the function throws (lines 307-311), binding the first operation to
the caller's expected home domain. The only absent-op challenge that passes is
one the trusted server itself issued without the op, which is SEP-10 "verify if
present" conformant and a server choice, not an SDK attacker capability.

## Evidence

- `src/webauth/challenge_transaction.ts:325-336` - web_auth_domain value
  compare is guarded by `op.name === "web_auth_domain"`; no presence requirement.
- `src/webauth/challenge_transaction.ts:339-343` - `verifyTxSignedBy` gate;
  challenge rejected unless signed by `serverAccountID` before return.
- `src/webauth/utils.ts:94-99` - `verifyTxSignedBy` requires a cryptographically
  valid server signer via `gatherTxSigners`, so the whole tx (all ops) is bound.
- `src/webauth/challenge_transaction.ts:307-311` - mandatory home_domain match;
  first operation name must equal `${domain} auth`.

## Negative Scope

- Rules out: omitting the web_auth_domain operation lets an attacker get a
  forged/relayed challenge accepted as valid by readChallengeTx; server
  signature over the full tx and the mandatory home_domain check block it.
- Does not rule out: a shared-signing-key, multi-web-auth-domain server
  misconfiguration where one endpoint omits web_auth_domain while colliding on
  home_domain could enable cross-endpoint challenge reuse — server-side
  defense-in-depth gap, below Medium and out of scope for the SDK objective.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-375c48d6c983962c3a50ef4b"
weakness = "buffer_decode"
record_kind = "residual_escalation"
path = ["readChallengeTx", "Buffer.from"]
sink = "Buffer.from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/webauth/challenge_transaction.ts:readChallengeTx", "src/webauth/utils.ts:verifyTxSignedBy"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signature_verified_before_return"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["missing_web_auth_domain_op_skips_check_blocked_by_server_signature"]
rules_out = ["absent web_auth_domain manage-data op skipping the value compare in readChallengeTx cannot make a forged or attacker-stripped challenge return as valid; the ed25519 server signature binds all operations and the home_domain op is mandatory"]
does_not_rule_out = ["shared-signing-key server serving multiple web_auth_domains where one endpoint omits the op and home_domain collides (server-side misconfig, below Medium)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "web_auth_domain compare is guarded by op.name match (challenge_transaction.ts:325); absent op skips it, but verifyTxSignedBy (line 339) requires a valid server signature over the whole tx so the op cannot be stripped/forged, and home_domain match is mandatory (lines 307-311)"
why_failed_brief = "absent-op skip is real but not attacker-reachable: server ed25519 signature binds all ops and mandatory home_domain match; only a trusted-server choice yields an absent op, which is SEP-10 verify-if-present conformant and below Medium"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "verifyTxSignedBy at challenge_transaction.ts:339 requires a valid ed25519 server signature over the entire transaction before any decoded field is trusted, binding all operations including any web_auth_domain op"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "home_domain operation is mandatory at challenge_transaction.ts:307-311; matchedHomeDomain must be truthy or the challenge is rejected"

[[blockers]]
kind = "signature_binding"
guarantee = "attacker cannot strip or forge the web_auth_domain operation from a server-signed challenge without invalidating the full-transaction server signature checked at line 339"
```
