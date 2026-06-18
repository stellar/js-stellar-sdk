# F977-1: manageData name ascii lossy-masking decode (duplicate of prior reviewed VIABLE)

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/977-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate claims that `manageData` decode reads the data-entry key via
`attrs.dataName().toString("ascii")` (`src/base/operation.ts:300`), masking each
byte to 7 bits, so the `name` shown to a co-signer diverges from the on-wire
bytes that are actually signed/submitted. The decode entrypoint is the
`Transaction` constructor at `src/base/transaction.ts:146`, which routes every
operation of a peer-supplied envelope through `Operation.fromXDRObject`.

Source trace confirms the mechanism is real:
- `src/base/operation.ts:297-303` — the `manageData` arm sets
  `result.name = attrs.dataName().toString("ascii")` at line 300 with no
  charset/length/round-trip guard.
- `src/base/operation.ts:299` — the only note is an inline comment deferring the
  `iscntrl` check to stellar-core; the SDK performs no decode-side validation.
- `Buffer.toString("ascii")` masks each byte with `& 0x7f`, so high-bit bytes
  silently collapse to distinct displayed characters.

The mechanism is genuine. The candidate is non-viable only because it is an
**exact typed duplicate** of an already-confirmed reviewed finding.

## Why It Failed

The injected prior-investigations brief contains record [4]
(`route_id=js-sdk-1152ab0154ab794509ef42c3`, stage=reviewed, verdict=VIABLE,
path=`Operation.fromXDRObject; Buffer.toString`,
scope=`remote_peer_transaction_envelope/transaction_decode_for_review/caller_configured/peer_supplied_xdr_bytes/xdr_decoded`).
Its `rules_out`/`blocked_by` text explicitly enumerates that the
**manageData name (op.ts:300)** decode arm applies `Buffer.toString('ascii')`
with no SDK-side guard restoring byte fidelity or rejecting high bytes.

That is the identical sink (`Operation.fromXDRObject`), identical exact line
(op.ts:300), identical mechanism (`transaction_decode_ascii_lossy_masking`),
and identical scope (trust boundary `remote_peer_transaction_envelope`, protocol
phase `transaction_decode_for_review`, parser state `xdr_decoded`, size class
`small`, input shape `peer_supplied_xdr_bytes`) as this candidate. There is no
differing trust boundary, protocol phase, parser state, size class, or input
shape that would make this a distinct typed route. It is a true typed duplicate,
so the candidate is NOT_VIABLE for this batch (the finding is already recorded as
VIABLE upstream).

## What This Rules Out

Re-reporting the `manageData` `dataName` ascii 7-bit masking decode arm
(`src/base/operation.ts:300`) as a new finding under the
`remote_peer_transaction_envelope` / `transaction_decode_for_review` /
`xdr_decoded` scope — it is already a reviewed VIABLE record
(`js-sdk-1152ab0154ab794509ef42c3`).

## What This Does Not Rule Out

- The substantive security issue itself remains real and confirmed VIABLE under
  the prior route; this verdict only suppresses the duplicate.
- The sibling `setOptions` homeDomain ascii decode (C2, op.ts:237) — also a
  duplicate of the same prior record.
- Any genuinely distinct decode arm or scope (e.g. a different consumer-side
  trust boundary) not covered by the prior reviewed record.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-e09c1291168a83d9dec4096f"
weakness = "transaction_decode_ascii_lossy_masking"
record_kind = "single_path"
path = ["Transaction", "Operation.fromXDRObject"]
sink = "Operation.fromXDRObject"
sink_role = "transaction_decode"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/base/operation.ts:fromXDRObject", "src/base/transaction.ts:Transaction"]
scope.trust_boundary = "remote_peer_transaction_envelope"
scope.protocol_phase = "transaction_decode_for_review"
scope.auth_state = "caller_configured"
scope.attacker_control = "peer_supplied_xdr_bytes"
scope.parser_state = "xdr_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["exact_typed_duplicate_of_prior_reviewed_viable"]
rules_out = ["the manageData dataName ascii 7-bit masking decode arm at src/base/operation.ts:300 under the remote_peer_transaction_envelope/transaction_decode_for_review/xdr_decoded scope is an exact typed duplicate of reviewed VIABLE record js-sdk-1152ab0154ab794509ef42c3 which explicitly enumerates op.ts:300"]
does_not_rule_out = ["the underlying issue remains confirmed VIABLE under the prior route", "setOptions homeDomain ascii decode at operation.ts:237 (C2)", "any genuinely distinct decode arm or consumer-side scope not covered by the prior reviewed record"]
assumptions = ["the injected prior-investigations brief record [4] (js-sdk-1152ab0154ab794509ef42c3) accurately reflects a reviewed VIABLE record covering op.ts:300", "current source at op.ts:300 matches the enumerated arm, verified by reading src/base/operation.ts"]
mechanism_brief = "manageData decode uses Buffer.toString('ascii') 7-bit masking at op.ts:300 so displayed data-entry key diverges from signed on-wire bytes; mechanism is real but already recorded VIABLE"
why_failed_brief = "exact typed duplicate of prior reviewed VIABLE record js-sdk-1152ab0154ab794509ef42c3 which explicitly enumerates the manageData name (op.ts:300) ascii decode arm under the identical scope and mechanism"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/base/operation.ts:fromXDRObject"
guarantee = "the iscntrl note at op.ts:299 is a stellar-core submission check, not an SDK decode guard, and does not reject high-bit bytes; the SDK applies no charset/round-trip validation on the manageData name decode"

[[blockers]]
kind = "duplicate"
source = "src/base/operation.ts:fromXDRObject"
guarantee = "prior reviewed VIABLE record js-sdk-1152ab0154ab794509ef42c3 already establishes the op.ts:300 manageData name ascii lossy-masking decode arm as VIABLE under the identical scope; re-reporting is a typed duplicate"
```
