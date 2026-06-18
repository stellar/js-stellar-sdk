# F952: Path blocked: SEP-10 challenge XDR buffer-decode surface

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/952-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`readChallengeTx -> from`

Area seed sibling set: `readChallengeTx`, `from`, `<anonymous>`, `Array.from`,
`verifyChallengeTxSigners`, `gatherTxSigners`, `Buffer.from`.

## Blocker

Every attacker-influenced buffer decode on this surface is either gated by the
full-transaction ed25519 server signature or bounded by the transaction
envelope. `readChallengeTx` performs all field decodes (nonce base64-length at
`challenge_transaction.ts:278`, `web_auth_domain` `Buffer.compare` at
`:331`) but only *returns* after `verifyTxSignedBy(transaction, serverAccountID)`
succeeds at `:339`; that check hashes the whole transaction and verifies the
ed25519 server signature over it (`gatherTxSigners` `keypair.verify` at
`utils.ts:62`), so no decoded value is accepted before the signature binds the
operations. `gatherTxSigners` binds each signature to a public key by
verification and splices it out once, and signature/signer counts are bounded by
the Stellar transaction-envelope cap, so the decode loops carry no unbounded or
forgeable input. `Array.from` sites only materialize `Set`s of already-validated
`G...` strkeys.

## Per-Target Disposition

- `readChallengeTx`: orchestrator; nonce/`web_auth_domain` decodes precede but do
  not bypass the `:339` server-signature gate; no field is returned before it.
- `Buffer.from` (`:278`, `:331`): lenient base64/utf8 decode, but the value is
  server-signed and length-/equality-checked; acceptance gated by `:339`.
- `verifyChallengeTxSigners`: re-runs `readChallengeTx` (server-sig gate),
  dedups signers into a `Set` (`:450`), and requires every signature consumed
  (`signersFound.length !== tx.signatures.length` at `:536`); no double-count or
  unrecognized-signature acceptance.
- `gatherTxSigners` / `Buffer.from`: each signature verified by `keypair.verify`
  (`utils.ts:62`) and consumed once; loop bounded by envelope signature count.
- `Array.from` / `<anonymous>` / `from`: materialize validated strkey sets only;
  no attacker encoding boundary crossed.

## Evidence

- `src/webauth/challenge_transaction.ts:339` - `verifyTxSignedBy` server-sig
  check is the last gate before `readChallengeTx` returns the decoded fields.
- `src/webauth/utils.ts:62` - `keypair.verify(hashedSignatureBase, decSig.signature())`
  binds each signature to a public key over the full transaction hash.
- `src/webauth/challenge_transaction.ts:536` - all signatures must be consumed by
  a matched signer, blocking unrecognized/duplicate-signature acceptance.

## Negative Scope

- Rules out: lenient base64/utf8/`Buffer.compare` decode of nonce,
  `web_auth_domain`, manage-data, or signature material in `readChallengeTx`,
  `verifyChallengeTxSigners`, or `gatherTxSigners` making a forged, malformed, or
  attacker-mutated SEP-10 challenge return as valid before the server signature
  binds the transaction.
- Does not rule out: weight/threshold accounting semantics in
  `verifyChallengeTxThreshold` against muxed (`M...`) client source accounts, and
  signer-matching behavior when the manage-data operation source is a muxed
  account (logic concern, not a buffer-decode encoding concern).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-155fba59d971bf203609570e"
weakness = "encoding integrity / buffer decode"
record_kind = "area_seed"
path = ["readChallengeTx", "from"]
sink = "from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "buffer_decode"
target_functions = ["readChallengeTx", "from", "<anonymous>", "Array.from", "verifyChallengeTxSigners", "gatherTxSigners", "Buffer.from"]
scope.trust_boundary = "wallet_or_service_user_input"
scope.protocol_phase = "sep10_challenge_build_and_verify"
scope.auth_state = "server_signature_verified_before_return"
scope.attacker_control = "challenge_xdr_domains_memos_and_client_accounts"
scope.parser_state = "transaction_xdr_decoded"
scope.size_class = "bounded_by_transaction_envelope"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["buffer_decode_encoding_leniency_accepts_forged_sep10_challenge", "signature_buffer_decode_is_verify_gate_not_pregate"]
rules_out = ["lenient base64/utf8/Buffer.compare decode of nonce, web_auth_domain, manage-data, or signature material across readChallengeTx, verifyChallengeTxSigners, and gatherTxSigners cannot make a forged, malformed, or attacker-mutated challenge return as valid; the full-transaction ed25519 server signature is verified at challenge_transaction.ts:339 before any decoded field is returned, and gatherTxSigners binds each signature by verification at utils.ts:62 with counts bounded by the transaction envelope"]
does_not_rule_out = ["verifyChallengeTxThreshold weight accounting and signer-matching against muxed (M...) client source accounts, which is a threshold/logic concern rather than a buffer-decode encoding concern"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Attacker-influenced SEP-10 challenge XDR is decoded into buffers (nonce base64-length at :278, web_auth_domain compare at :331, signature verify in gatherTxSigners) before the read and signer-gathering paths, but no decoded value is accepted until the full-transaction server signature is verified, and decode loops are bounded by the transaction envelope."
why_failed_brief = "all attacker-influenced decode sites are gated by the full-transaction ed25519 server signature verified at challenge_transaction.ts:339 (gatherTxSigners verify at utils.ts:62) before any field is returned, and signature/signer counts are bounded by the transaction envelope; no distinct Medium+ encoding-integrity mechanism survives"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "signature_gate"
guarantee = "verifyTxSignedBy at challenge_transaction.ts:339 verifies the ed25519 server signature over the entire transaction before readChallengeTx returns any decoded field"

[[sanitizer_guarantees]]
kind = "signature_verification"
guarantee = "gatherTxSigners binds each transaction signature to a public key via keypair.verify over the transaction hash at utils.ts:62 and consumes it once via splice"

[[blockers]]
kind = "checked_guard"
guarantee = "verifyChallengeTxSigners requires every signature consumed by a matched signer (signersFound.length !== tx.signatures.length at challenge_transaction.ts:536), blocking unrecognized or duplicate signature acceptance"

[[blockers]]
kind = "bound"
guarantee = "signature and signer counts processed by the decode loops are bounded by the Stellar transaction-envelope cap; manage-data values are bounded, so no unbounded decode exists on this surface"
```
