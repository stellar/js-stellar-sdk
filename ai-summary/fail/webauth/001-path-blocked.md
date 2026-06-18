# F001: Path blocked: Challenge XDR buffer decode during SEP-10 read

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/001-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`readChallengeTx -> Buffer.from`

Area seed; sibling targets `readChallengeTx`, `from`, `Buffer.from`,
`<anonymous>`, `Array.from`, `verifyChallengeTxSigners`, `gatherTxSigners` all
evaluated against the buffer-decode / encoding-integrity question.

## Blocker

Every buffer decode of attacker-influenced challenge fields in `readChallengeTx`
either gates only rejection (a wrong decode makes the function THROW, never
falsely accept) or is downstream of content the server itself controls, and the
function cannot RETURN a valid result without passing the unconditional
server-signature check `verifyTxSignedBy(transaction, serverAccountID)` at
`challenge_transaction.ts:339`, the last gate before the return at line 345.
The nonce decode `Buffer.from(operation.value.toString(),"base64").length !== 48`
(line 278) only length-checks server-chosen randomness, and the web_auth_domain
decode `op.value.compare(Buffer.from(webAuthDomain))` (line 331) is an exact
byte compare against the caller's expected domain. The manage-data value is
XDR-bounded to 64 bytes, so no resource amplification exists. Encoding leniency
therefore cannot upgrade an unsigned/forged challenge into an accepted one.

## Evidence

- `src/webauth/challenge_transaction.ts:278` - nonce decode is a pure length
  gate on server-generated randomness; non-conforming bytes only throw.
- `src/webauth/challenge_transaction.ts:331` - web_auth_domain is an exact
  `Buffer.compare` against the caller-supplied expected domain; mismatch throws.
- `src/webauth/challenge_transaction.ts:339-345` - server signature is verified
  unconditionally before any valid `{tx, clientAccountID, ...}` is returned.
- `src/webauth/utils.ts:55-66` - `gatherTxSigners` authority is `keypair.verify`
  (ed25519); the `hint()` Buffer compare is only a pre-filter, not a decision.
- `src/webauth/challenge_transaction.ts:428-498` - `verifyChallengeTxSigners`
  delegates to `readChallengeTx` then re-verifies every signature
  cryptographically; its `Array.from` calls are Set→array, not attacker decode.

## Negative Scope

- Rules out: lenient/length-only base64 decode or domain `Buffer.compare` in
  `readChallengeTx` being used to get a forged or unsigned SEP-10 challenge
  accepted via encoding-integrity manipulation of decoded buffer fields.
- Does not rule out: (a) absent `web_auth_domain` operation skipping the
  domain check entirely (different weakness family: missing-op, not
  buffer_decode), and (b) lenient base64 acceptance of a malformed nonce when
  the server is itself the adversary — both downstream of, but not refuted by,
  this buffer-decode trace.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-375c48d6c983962c3a50ef4b"
weakness = "encoding_integrity / buffer_decode"
record_kind = "area_seed"
path = ["readChallengeTx", "Buffer.from"]
sink = "Buffer.from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "buffer_decode"
target_functions = ["readChallengeTx", "from", "Buffer.from", "<anonymous>", "Array.from", "verifyChallengeTxSigners", "gatherTxSigners"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signature_verified_before_return"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["buffer_decode_encoding_leniency_accepts_forged_sep10_challenge"]
rules_out = ["lenient base64 nonce length-check and web_auth_domain Buffer.compare in readChallengeTx cannot make an unsigned or forged challenge return as valid; server signature binds the whole tx before return"]
does_not_rule_out = ["absent web_auth_domain operation skips the domain check (missing-op family)", "lenient base64 nonce acceptance when the trusted server is itself the adversary"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "All buffer decodes of attacker challenge fields in readChallengeTx only gate rejection or decode server-controlled content, and a valid return requires the unconditional server-signature check; the manage-data value is XDR-bounded to 64 bytes so no amplification exists."
why_failed_brief = "server signature verifyTxSignedBy at challenge_transaction.ts:339 is an unconditional pre-return gate; encoding leniency on decoded fields cannot upgrade a forged challenge to accepted, and decode size is bounded."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "readChallengeTx returns a valid result only after verifyTxSignedBy(transaction, serverAccountID) succeeds (challenge_transaction.ts:339-345)"

[[sanitizer_guarantees]]
kind = "size_bound"
guarantee = "manage-data operation value is XDR-bounded to 64 bytes, bounding every Buffer.from decode on this path"

[[blockers]]
kind = "signature_gate"
guarantee = "ed25519 server signature over the full transaction is required before any decoded challenge field is trusted as accepted"
```
