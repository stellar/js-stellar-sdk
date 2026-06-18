# F988: Path blocked: gatherTxSigners buffer decode of unverified challenge signer material

**Subsystem**: webauth
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/webauth/988-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`gatherTxSigners -> Array.from`

(area_seed siblings: `readChallengeTx`, `verifyChallengeTxSigners`, `gatherTxSigners`,
`Array.from`, `Buffer.from`)

## Blocker

The seed's named sink `Array.from(signersFound)` (utils.ts:70) is a `Set<string>`→array
conversion of *public-key strings*, not a buffer decode of attacker bytes — no length,
bound, or accounting decision is made there. Every signer/signature byte that the seed
calls "buffer decode" (`decSig.hint()`, `decSig.signature()`, `Buffer.from` in
readChallengeTx) is gated by two source-proven invariants before any value is trusted:
(1) a full-transaction ed25519 server signature is required (`verifyTxSignedBy`,
challenge_transaction.ts:339); (2) strict signature accounting — each signature is
consumed at most once via `txSignatures.splice(i,1)` after a cryptographic
`keypair.verify` (utils.ts:62-64), `signersFound` is a `Set` so a signer counts once,
and `signersFound.length !== tx.signatures.length` rejects any extra/unrecognized/
duplicate signature (challenge_transaction.ts:536). An attacker-set decorated-signature
`hint` only changes which sigs are *tried*; a non-matching or duplicate sig stays
unconsumed and trips the count check. No attacker-influenced field bypasses these.

## Evidence

- `src/webauth/utils.ts:70` - sink is `Array.from(new Set<string>)` of pubkeys; no byte decode/bound here.
- `src/webauth/utils.ts:62-64` - signature accepted only on cryptographic `keypair.verify`, then spliced (consumed once).
- `src/webauth/challenge_transaction.ts:339` - server signature over the whole tx required before any field is trusted.
- `src/webauth/challenge_transaction.ts:536` - `signersFound.length !== tx.signatures.length` rejects unrecognized/duplicate signatures.

## Negative Scope

- Rules out: buffer decode / `Array.from` / `Buffer.from` of signer/signature material in `gatherTxSigners`/`readChallengeTx`/`verifyChallengeTxSigners` producing a forged-valid or mis-accounted SEP-10 signer set before server-signature verification.
- Does not rule out: algorithmic-cost amplification in the `signers × signatures` verify loop (attacker-set hints forcing extra ed25519 verifies) — checked and bounded below Medium by the ≤20-signature envelope limit, but the exact envelope-decode cap was not source-read here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "webauth"
route_id = "js-sdk-fc362ffda93f19786dce2b9a"
weakness = "encoding/decoding integrity"
record_kind = "area_seed"
path = ["gatherTxSigners", "Array.from"]
sink = "Array.from"
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
negative_claim.rules_out_codes = ["gathertxsigners_array_from_buffer_decode_breaks_signer_accounting"]
rules_out = ["buffer decode / Array.from of signer/signature material in gatherTxSigners or its callers producing a forged-valid or mis-accounted SEP-10 signer set before the server signature is verified"]
does_not_rule_out = ["algorithmic-cost amplification in the gatherTxSigners signers x signatures verify loop via attacker-set decorated-signature hints (bounded below Medium by envelope signature cap, exact cap not source-read)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "gatherTxSigners' Array.from sink only converts a Set of pubkey strings; all signer/signature bytes are gated by a full-tx server ed25519 signature (line 339) and strict consume-once accounting (utils.ts:62-64, line 536) before any value is trusted."
why_failed_brief = "named sink is a Set-to-array conversion, not a byte decode; integrity is bound by server-signature verification plus signersFound.length !== tx.signatures.length consume-once accounting."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "full-transaction ed25519 server signature required before any decoded challenge field is trusted (challenge_transaction.ts:339)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "each signature consumed at most once after cryptographic verify and signersFound.length !== tx.signatures.length rejects extra/duplicate/unrecognized signatures (utils.ts:62-64, challenge_transaction.ts:536)"

[[blockers]]
kind = "invariant"
guarantee = "Array.from(signersFound) at utils.ts:70 converts a Set of public-key strings; it performs no byte decode, length check, or accounting decision on attacker-controlled bytes"
```
