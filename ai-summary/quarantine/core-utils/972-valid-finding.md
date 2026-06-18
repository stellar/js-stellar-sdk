# R972: Lossy `ascii` decode of remote XDR string fields in `Operation.fromXDRObject`

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/972-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

`Operation.fromXDRObject` decodes three peer/remote-supplied XDR string fields
with Node's lossy `'ascii'` codec, confirmed in current source:

- `src/base/operation.ts:235-238` — setOptions `homeDomain`:
  `attrs.homeDomain().toString("ascii")` (comment at 234 explicitly defers
  validation: "home_domain is checked by iscntrl in stellar-core").
- `src/base/operation.ts:300` — manageData `name`:
  `attrs.dataName().toString("ascii")` (comment at 299 defers to stellar-core
  `iscntrl`).
- `src/base/operation.ts:518` — revokeDataSponsorship ledger-key `name`:
  `ledgerKey.data().dataName().toString("ascii")`.

Node's `Buffer.toString('ascii')` decodes as `latin1` after unsetting the high
bit of every byte (`byte & 0x7F`); it never rejects non-ASCII input. Bytes
`0x80-0xFF`, which stellar-core's `iscntrl` check (rejecting only `<0x20` and
`0x7F`) permits on-chain, therefore alias to low-ASCII characters
(`0xC1`→`'A'`, `0xE9`→`'i'`). The decoded string returned to the application
does not faithfully represent the on-wire bytes.

This is reached through the standard remote-envelope decode path
(`TransactionBuilder.fromXDR` → `Transaction` → `Operation.fromXDRObject`) —
the same entry/scope the existing VIABLE allowTrust finding
(route `js-sdk-5629e9bb...`) traced — and the signed bytes are the raw
`this.tx` committed by `signatureBase`, so the masked decoded string and the
signed bytes provably diverge.

## Findings

This is a DISTINCT sibling decode from the recorded VIABLE allowTrust assetCode
finding (route `js-sdk-5629e9bb...`), which targets `attrs.asset().value()` at
`src/base/operation.ts:216-217` using the **default** `.toString()` (utf8) plus
`trimEnd` of nulls, with a *missing charset/length validation* failure mode.
C1 covers three different fields on different operation arms using the explicit
`"ascii"` codec, with a *high-bit-masking aliasing* failure mode. Different
route_id, different sink fields, different codec — not a typed duplicate or
subsumption.

Impact: an application that decodes an untrusted/peer-supplied envelope (e.g. a
multisig co-signing review flow) and displays or compares the decoded
`homeDomain` / manageData `name` / ledger-key `name` will see a string that
differs from the bytes actually signed and submitted. An attacker can choose
on-wire bytes that mask to a benign-looking value, or make two distinct on-wire
values render identically, defeating a trust comparison or user review keyed on
these fields. The SDK ships this lossy decode as the only decode API for these
string-typed fields (unlike manageData `value` at line 301, which is returned as
a raw Buffer), so a consuming app cannot recover the true bytes from the
returned record.

The decoded record is read-only output; the SDK does not re-sign from the
decoded string, so this is a display/comparison-integrity defect, not direct
signature forgery — bounding severity to **Medium** under the
"XDR parsing ambiguity that changes user-visible security decisions" floor.

## PoC Guidance

- **Test file**: `test/unit/operation_test.js` (append a new decode-fidelity case).
- **Setup**: Build a setOptions operation XDR (or manageData) whose `home_domain`
  / `name` field carries a high byte (e.g. `0xC1` followed by ASCII), using the
  raw XDR builders rather than the high-level op builder so the high byte is
  preserved on the wire.
- **Steps**: Round-trip via `Operation.fromXDRObject` (or
  `TransactionBuilder.fromXDR`) and read the decoded `homeDomain` / `name`.
- **Assertion**: Assert that the decoded string differs from a faithful
  `latin1`/`utf8` decode of the same bytes — e.g. two distinct input buffers
  (`0xC1...` and `0x41...`) decode to the same string, demonstrating aliasing /
  loss of byte fidelity versus the signed envelope.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-1152ab0154ab794509ef42c3"
weakness = "lossy ascii decode of remote XDR string fields aliases distinct bytes"
record_kind = "single_path"
path = ["Operation.fromXDRObject", "Buffer.toString"]
sink = "Buffer.toString"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "buffer_decode"
target_functions = ["src/base/operation.ts:Operation.fromXDRObject"]
scope.trust_boundary = "remote_peer_transaction_envelope"
scope.protocol_phase = "transaction_decode_for_review"
scope.auth_state = "caller_configured"
scope.attacker_control = "peer_supplied_xdr_bytes"
scope.parser_state = "xdr_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms the homeDomain (op.ts:237), manageData name (op.ts:300), and revokeDataSponsorship name (op.ts:518) decode arms apply Buffer.toString('ascii') with no SDK-side guard restoring byte fidelity or rejecting high bytes; this is a distinct route and codec from the allowTrust assetCode default-utf8 decode at op.ts:216-217 (route js-sdk-5629e9bb), so it is neither a typed duplicate nor subsumed"]
does_not_rule_out = ["whether a specific downstream consumer compares or displays the decoded homeDomain/name for a trust decision", "lossy decode of other string-typed XDR fields not enumerated in this trace"]
assumptions = ["Operation.fromXDRObject is reached from the public TransactionBuilder.fromXDR remote-envelope decode path under the same scope traced for route js-sdk-5629e9bb", "Node Buffer.toString('ascii') masks the high bit of each byte (documented Node semantics) and never rejects non-ASCII input", "signatureBase commits to the raw this.tx bytes so signed bytes and the masked decoded string diverge"]
mechanism_brief = "Operation.fromXDRObject decodes setOptions homeDomain, manageData name, and revokeDataSponsorship ledger-key name with Buffer.toString('ascii'), which unsets the high bit of each byte; distinct remote-supplied byte strings alias to one decoded string and on-wire bytes render as a different string than is signed."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/base/operation.ts:Operation.fromXDRObject"
guarantee = "only manageData value (line 301, raw Buffer) is faithful; string-typed homeDomain/name decode arms apply the lossy 'ascii' codec with no SDK-side charset/byte-fidelity validation"

[[blockers]]
kind = "not_found"
source = "src/base/operation.ts:Operation.fromXDRObject"
guarantee = "no source-proven guard restores byte fidelity or rejects high bytes on the homeDomain (237), manageData-name (300), or ledger-key-name (518) decode arms"
```
