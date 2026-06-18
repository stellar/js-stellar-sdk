# F969: Path blocked: SEP-10 challenge remote bytes reaching verify/Buffer.from

**Subsystem**: core-utils
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/core-utils/969-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`verify -> Buffer.from`

Residual question (escalated): does a remote RPC/Horizon/SEP-10 response byte
source reach the `Buffer.from` sinks pre-verification in the signature-`verify`
cluster, producing a forged signature or a wrong-shaped trusted buffer?

Concrete answer: **remote bytes DO reach one `Buffer.from` (the SEP-10 nonce
length check) before the server-signature verify, but the decoded result is
discarded after a length comparison and never becomes a trusted value; the
other `Buffer.from` operand on the path is caller-configured. No forgery or
wrong-shaped trusted buffer results.**

## Blocker

The SEP-10 `readChallengeTx` path parses the remote challenge via
`new Transaction(challengeTx, ...)` (challenge_transaction.ts:183). The only
remote-fed `Buffer.from` reached pre-verification is the nonce check
`Buffer.from(operation.value.toString(), "base64").length !== 48`
(challenge_transaction.ts:278): its decoded buffer is used solely for a
`.length` comparison and immediately discarded — it is never stored, returned,
hashed, or used as a trusted key/hash, so a lenient base64 decode cannot
produce a wrong-shaped trusted buffer. The second `Buffer.from` on the path,
`op.value.compare(Buffer.from(webAuthDomain))` (line 331), takes the
caller-supplied `webAuthDomain` argument as its operand (not remote bytes); the
remote `op.value` is the value being validated against it. The actual trust
anchor, `keypair.verify(hashedSignatureBase, decSig.signature())`
(utils.ts:62, reached via `verifyTxSignedBy` at challenge_transaction.ts:339),
consumes XDR-decoded signature bytes from `transaction.signatures`, not a
`Buffer.from` of remote bytes, so no lenient decode feeds signature
verification. A non-server attacker cannot produce a valid server signature, so
bypassing the discarded nonce length check yields no material effect.

## Evidence

- `src/webauth/challenge_transaction.ts:183` - remote challenge base64 parsed into a `Transaction` (XDR decode in ../base).
- `src/webauth/challenge_transaction.ts:278` - `Buffer.from(operation.value.toString(),"base64")` result used only for `.length !== 48`, then discarded.
- `src/webauth/challenge_transaction.ts:331` - `Buffer.from(webAuthDomain)` operand is the caller-supplied domain; remote `op.value` is the validated input, not the trusted operand.
- `src/webauth/challenge_transaction.ts:339` - server-signature `verifyTxSignedBy` is the trust gate after the nonce check.
- `src/webauth/utils.ts:62` - `keypair.verify` consumes `decSig.signature()` XDR bytes, not a `Buffer.from` of remote bytes.

## Negative Scope

- Rules out: a lenient/remote `Buffer.from` decode in the SEP-10 `verify`/`readChallengeTx` cluster forging a valid signature or producing a wrong-shaped trusted buffer from a remote challenge response.
- Does not rule out: semantic/disguised-transaction validation flaws in `readChallengeTx` (sequence/source/operation-type/timebound/home-domain checks) that do not flow through a `Buffer.from` sink — covered by sibling readChallengeTx records.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "core-utils"
route_id = "js-sdk-083ff40f27c9f10b6fa69450"
weakness = "buffer_decode"
record_kind = "residual_escalation"
path = ["verify", "Buffer.from"]
sink = "Buffer.from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/webauth/challenge_transaction.ts:readChallengeTransaction", "src/webauth/utils.ts:gatherTxSigners"]
scope.trust_boundary = "remote_sep10_server"
scope.protocol_phase = "sep10_challenge_validation"
scope.auth_state = "pre_signature_verify"
scope.attacker_control = "remote_challenge_response_bytes"
scope.parser_state = "xdr_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["sep10_nonce_buffer_decode_result_discarded", "webauthdomain_buffer_from_operand_caller_configured", "signature_verify_consumes_xdr_bytes_not_buffer_from"]
rules_out = ["lenient or remote Buffer.from decode in the SEP-10 verify/readChallengeTx cluster forging a valid signature or producing a wrong-shaped trusted buffer from a remote challenge response"]
does_not_rule_out = ["semantic disguised-transaction validation flaws in readChallengeTx (sequence/source/operation-type/timebound/home-domain) that do not flow through a Buffer.from sink"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Remote challenge bytes reach Buffer.from at challenge_transaction.ts:278 pre-verification, but the decoded buffer is only length-checked and discarded; the line 331 Buffer.from operand is the caller's webAuthDomain; signature verify (utils.ts:62) consumes XDR-decoded bytes. No wrong-shaped trusted buffer or signature forgery."
why_failed_brief = "remote Buffer.from result is discarded after a length check and never trusted; trust anchor is the server signature a non-server attacker cannot produce"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "challenge_transaction.ts:278 uses the Buffer.from result only for a 48-byte length comparison and discards it; it is never stored, returned, or used as a key/hash/trusted buffer"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "challenge_transaction.ts:331 Buffer.from operand is the caller-supplied webAuthDomain; the remote op.value is the validated input compared against it"

[[blockers]]
kind = "trust_anchor"
guarantee = "verifyTxSignedBy/keypair.verify (challenge_transaction.ts:339, utils.ts:62) require the server account signature over the challenge; a non-server attacker cannot forge it, and verify consumes XDR-decoded signature bytes rather than a Buffer.from of remote bytes"
```
