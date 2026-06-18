# F977-2: setOptions homeDomain ascii lossy-masking decode (duplicate of prior reviewed VIABLE)

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/977-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate claims that `setOptions` decode reads `attrs.homeDomain().toString("ascii")`
(`src/base/operation.ts:235-238`), masking each byte to 7 bits, so a reviewer
sees a benign home domain while the signed `SET_OPTIONS` operation carries
different bytes; distinct byte strings can collapse to the same displayed domain.
The decode entrypoint is the `Transaction` constructor
(`src/base/transaction.ts:146`), which decodes every operation of a peer-supplied
envelope through `Operation.fromXDRObject`.

Source trace confirms the mechanism is real:
- `src/base/operation.ts:235-238` —
  `result.homeDomain = attrs.homeDomain() !== undefined ? attrs.homeDomain().toString("ascii") : undefined`,
  guarded only by an `undefined` check (line 236), with the `.toString("ascii")`
  conversion at line 237.
- `src/base/operation.ts:234` — the only note is a comment deferring the
  `iscntrl` control-char check to stellar-core; the SDK performs no decode-side
  charset/round-trip validation.
- `Buffer.toString("ascii")` masks each byte with `& 0x7f`, so high-bit bytes in
  the home domain silently collapse to distinct displayed characters.

The mechanism is genuine. The candidate is non-viable only because it is an
**exact typed duplicate** of an already-confirmed reviewed finding.

## Why It Failed

The injected prior-investigations brief contains record [4]
(`route_id=js-sdk-1152ab0154ab794509ef42c3`, stage=reviewed, verdict=VIABLE,
path=`Operation.fromXDRObject; Buffer.toString`,
scope=`remote_peer_transaction_envelope/transaction_decode_for_review/caller_configured/peer_supplied_xdr_bytes/xdr_decoded`).
Its `rules_out`/`blocked_by` text explicitly enumerates that the
**homeDomain (op.ts:237)** decode arm applies `Buffer.toString('ascii')` with no
SDK-side guard restoring byte fidelity or rejecting high bytes.

That is the identical sink (`Operation.fromXDRObject`), identical exact line
(op.ts:237), identical mechanism (`transaction_decode_ascii_lossy_masking`), and
identical scope (trust boundary `remote_peer_transaction_envelope`, protocol
phase `transaction_decode_for_review`, parser state `xdr_decoded`, size class
`small`, input shape `peer_supplied_xdr_bytes`) as this candidate. There is no
differing trust boundary, protocol phase, parser state, size class, or input
shape that would make this a distinct typed route. It is a true typed duplicate,
so the candidate is NOT_VIABLE for this batch (the finding is already recorded as
VIABLE upstream).

The candidate's own anti-evidence flags the one unproven consumer-side condition
(a downstream SEP-1 federation consumer using raw vs masked domain). That residual
does not create a distinct typed route from the prior reviewed record, which
already covers the homeDomain ascii decode under the same display-vs-signed-bytes
divergence scope.

## What This Rules Out

Re-reporting the `setOptions` `homeDomain` ascii 7-bit masking decode arm
(`src/base/operation.ts:237`) as a new finding under the
`remote_peer_transaction_envelope` / `transaction_decode_for_review` /
`xdr_decoded` scope — it is already a reviewed VIABLE record
(`js-sdk-1152ab0154ab794509ef42c3`).

## What This Does Not Rule Out

- The substantive security issue itself remains real and confirmed VIABLE under
  the prior route; this verdict only suppresses the duplicate.
- The sibling `manageData` name ascii decode (C1, op.ts:300) — also a duplicate
  of the same prior record.
- A genuinely distinct downstream SEP-1/federation consumer scope that resolves
  the raw signed bytes rather than the masked display value, if it can be shown
  as its own typed route distinct from the prior reviewed record.

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
target_functions = ["src/base/operation.ts:fromXDRObject"]
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
rules_out = ["the setOptions homeDomain ascii 7-bit masking decode arm at src/base/operation.ts:237 under the remote_peer_transaction_envelope/transaction_decode_for_review/xdr_decoded scope is an exact typed duplicate of reviewed VIABLE record js-sdk-1152ab0154ab794509ef42c3 which explicitly enumerates op.ts:237"]
does_not_rule_out = ["the underlying issue remains confirmed VIABLE under the prior route", "manageData name ascii decode at operation.ts:300 (C1)", "a genuinely distinct downstream SEP-1/federation consumer scope resolving raw signed bytes as its own typed route"]
assumptions = ["the injected prior-investigations brief record [4] (js-sdk-1152ab0154ab794509ef42c3) accurately reflects a reviewed VIABLE record covering op.ts:237", "current source at op.ts:235-238 matches the enumerated arm, verified by reading src/base/operation.ts"]
mechanism_brief = "setOptions homeDomain decode uses Buffer.toString('ascii') 7-bit masking at op.ts:237 so displayed home domain diverges from signed on-wire bytes; mechanism is real but already recorded VIABLE"
why_failed_brief = "exact typed duplicate of prior reviewed VIABLE record js-sdk-1152ab0154ab794509ef42c3 which explicitly enumerates the homeDomain (op.ts:237) ascii decode arm under the identical scope and mechanism"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/base/operation.ts:fromXDRObject"
guarantee = "the iscntrl note at op.ts:234 is a stellar-core submission check, not an SDK decode guard, and permits high-bit bytes; the SDK applies no charset/round-trip validation on the homeDomain decode, only an undefined check at op.ts:236"

[[blockers]]
kind = "duplicate"
source = "src/base/operation.ts:fromXDRObject"
guarantee = "prior reviewed VIABLE record js-sdk-1152ab0154ab794509ef42c3 already establishes the op.ts:237 homeDomain ascii lossy-masking decode arm as VIABLE under the identical scope; re-reporting is a typed duplicate"
```
