# F940: Path blocked: SEP-10 challenge XDR buffer decode in readChallengeTx and signer gathering

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/940-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`readChallengeTx -> Buffer.from`

Area seed targets: `readChallengeTx`, `Buffer.from`, `verifyChallengeTxSigners`,
`gatherTxSigners`.

## Blocker

Every attacker-influenced buffer decode that affects integrity runs *before* a
gate that rejects anything not bound by the server's ed25519 signature. In
`readChallengeTx` the nonce length decode (`:278`) and the `web_auth_domain`
value compare (`:331`) are structural checks that throw `InvalidChallengeError`
on malformed input; the function only returns after `verifyTxSignedBy(transaction,
serverAccountID)` at `:339`, which binds the entire transaction (source, seq,
ops, memo, manage-data names/values) to the server signature. A forged or
attacker-tweaked challenge cannot satisfy that signature, so decode leniency
yields no valid-looking accepted challenge. In the signer-gathering path the
"buffer decode" is the signature bytes fed straight into `keypair.verify`
(`utils.ts:62`) — that decode *is* the crypto gate, not a pre-gate. Its cost is
bounded by caller-supplied `signers` times the envelope's signature vector, with
a per-signature `hint().equals` short-circuit before any verify; no
producer/consumer accumulation crosses an SDK boundary (one synchronous call per
received challenge), so no material resource exhaustion.

## Evidence

- `src/webauth/challenge_transaction.ts:278` - nonce base64 decode only enforces a 48-byte length and throws on mismatch; no integrity decision is finalized here.
- `src/webauth/challenge_transaction.ts:325-336` - `web_auth_domain` op value `Buffer.compare` against caller `webAuthDomain`; throws on mismatch, decode cannot be coerced into acceptance.
- `src/webauth/challenge_transaction.ts:339-345` - `verifyTxSignedBy` gates the return; whole-tx server signature binds all decoded fields before any value is trusted.
- `src/webauth/utils.ts:55-66` - signature decode used as input to `keypair.verify`; hint mismatch (`:58`) skips verify, found signatures are spliced out, bounding work to signers x signatures.
- `src/webauth/challenge_transaction.ts:500-537` - `verifyChallengeTxSigners` re-verifies all signatures via `gatherTxSigners` and rejects unrecognized/extra signatures (`:536`), reinforcing the signature gate post-decode.

## Per-Target Disposition

- `readChallengeTx` / `Buffer.from` (`:278`, `:331`): NOT_VIABLE — decode is pre-signature structural validation, blocked by `:339`.
- `verifyChallengeTxSigners` (`:419`): NOT_VIABLE — delegates to `readChallengeTx` then re-checks signatures; no new decode trust precedes signature matching.
- `gatherTxSigners` (`utils.ts:32`): NOT_VIABLE — signature-buffer decode is the verify gate; cost bounded, no cross-event accumulation.

## Negative Scope

- Rules out: attacker-supplied challenge XDR exploiting buffer-decode length/content leniency in nonce, manage-data value, or signature decode to make `readChallengeTx`/`verifyChallengeTxSigners` return a forged challenge as valid, or to cause material resource exhaustion on a single challenge.
- Does not rule out: a flaw in the underlying `Transaction`/XDR envelope decoder (`new Transaction(...)`, `tx.signatures`) outside `src/webauth`, or signature-vector cap behavior in `base` not re-derived here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-375c48d6c983962c3a50ef4b"
weakness = "encoding integrity / buffer decode"
record_kind = "area_seed"
path = ["readChallengeTx", "Buffer.from"]
sink = "Buffer.from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "buffer_decode"
target_functions = ["readChallengeTx", "Buffer.from", "verifyChallengeTxSigners", "gatherTxSigners"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signature_verified_before_return"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["buffer_decode_encoding_leniency_accepts_forged_sep10_challenge", "signature_buffer_decode_is_verify_gate_not_pregate", "single_challenge_decode_bounded_no_resource_exhaustion"]
rules_out = ["lenient nonce/manage-data/signature buffer decode in readChallengeTx, verifyChallengeTxSigners, or gatherTxSigners cannot make a forged or malformed challenge return as valid; the ed25519 server signature at challenge_transaction.ts:339 binds the whole transaction before any decoded field is trusted, and the signer-gathering decode feeds keypair.verify directly", "single attacker challenge cannot cause material resource exhaustion: decode work is bounded by one envelope, signers x signatures, with hint short-circuit before verify and no cross-event accumulation"]
does_not_rule_out = ["bugs in the underlying base Transaction/XDR envelope decoder or signatures vector cap outside src/webauth", "muxed-account clientAccountID handling semantics beyond buffer decode"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Attacker-influenced SEP-10 challenge XDR is decoded into buffers (nonce length, web_auth_domain compare, signature bytes) across readChallengeTx and gatherTxSigners, but integrity decodes precede the server-signature gate and the signature decode is the verify gate itself."
why_failed_brief = "server ed25519 signature over the full transaction (challenge_transaction.ts:339) is required before any decoded challenge field is trusted; signer-gathering decode is the crypto verify gate and is cost-bounded"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "verifyTxSignedBy at challenge_transaction.ts:339 rejects any challenge whose full transaction is not signed by the server before readChallengeTx returns, binding all decoded fields"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "verifyChallengeTxSigners rejects unrecognized/extra signatures (challenge_transaction.ts:536) and requires the server signature, re-consuming signatures after decode"

[[blockers]]
kind = "signature_gate"
guarantee = "ed25519 server signature over the entire transaction must verify before any attacker-influenced decoded value (nonce, manage-data value, web_auth_domain) is accepted"

[[blockers]]
kind = "cost_bound"
guarantee = "gatherTxSigners work is bounded by caller-supplied signers times the envelope signature vector with a hint short-circuit before verify; single synchronous call per challenge, no cross-event accumulation"
```
