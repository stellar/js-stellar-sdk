# R001: homeDomain / manageData name decode masks high-bit bytes, diverging from signed bytes

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/001-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

`new Transaction(envelopeXdr, passphrase)` decodes a peer-supplied envelope and
maps every operation through `Operation.fromXDRObject`
(`src/base/transaction.ts:145-146`). In that decoder:

- SetOptions `homeDomain` is decoded with
  `attrs.homeDomain().toString("ascii")` (`src/base/operation.ts:235-238`), with
  the inline comment "home_domain is checked by iscntrl in stellar-core".
- ManageData `name` is decoded with `attrs.dataName().toString("ascii")`
  (`src/base/operation.ts:300`), same iscntrl comment.

Node's `Buffer.prototype.toString("ascii")` masks the high bit of every byte
(`& 0x7f`). I verified this empirically:
`Buffer.from([0x65,0xE5,0x6F]).toString("ascii")` → `"eeo"`, while
`.toString("latin1")` → `"eåo"`. So bytes `128–255` decode to a *different*
printable character than the raw byte.

stellar-core validates `home_domain` / `data name` only with `iscntrl`, which
excludes control bytes `0–31` and `127` but admits `128–255`. Therefore high-bit
bytes pass core acceptance and are signed/submitted verbatim.

The signature commits to the raw bytes, not the decoded string:
`signatureBase()` (`src/base/transaction.ts:246-274`) serializes the raw
`this.tx` XDR object. So the signed/submitted bytes are the unmasked originals
while the decoded `homeDomain`/`name` field shown to a reviewer is the masked
ASCII string. The display/sign divergence is source-proven.

## Findings

A peer/co-signer can craft a SetOptions `homeDomain` (or ManageData `name`)
whose raw bytes contain high-bit characters chosen so that, after `& 0x7f`
masking, the decoded string reads as a benign value (e.g. raw bytes that render
as `"example.com"` after masking). A human or automated reviewer inspecting the
decoded `Operation` object approves the transaction, but the bytes actually
signed and submitted set a *different* `home_domain` — which downstream governs
federation / SEP-10 stellar.toml resolution for that account.

This is "parsing ambiguity that changes user-visible security decisions" (Medium
per the impact table). It is not direct fund loss, so it stays at Medium, not
High. ManageData `value` is returned as a raw Buffer (`operation.ts:301`) and is
not affected; only `name` masks.

Impact depends on a review/co-sign consumer reading the decoded `homeDomain` /
`name` (a realistic multisig/wallet-review flow), which is why confidence is
medium rather than high on impact even though the byte-masking divergence itself
is proven.

## PoC Guidance

- **Test file**: append to an existing `test/unit/operation_test.js` (or the
  TypeScript equivalent under `test/unit/`).
- **Setup**: construct a SetOptions operation XDR whose `homeDomain` raw bytes
  contain a high-bit byte (e.g. `0xE5`) positioned so `& 0x7f` yields a
  benign-looking domain. Build it as an `xdr.Operation` directly (bypassing the
  builder's own validation) to mimic peer-supplied bytes.
- **Steps**: call `Operation.fromXDRObject(op)` and also re-serialize / inspect
  the raw `attrs.homeDomain()` buffer.
- **Assertion**: assert that `result.homeDomain` (masked ascii) is NOT equal to
  the latin1/raw decoding of the same buffer, demonstrating the decoded display
  string diverges from the signed bytes. Repeat for ManageData `name`.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-5629e9bbb72358dafa4960a5"
weakness = "xdr_decode"
record_kind = "single_path"
path = ["<anonymous>", "Operation.fromXDRObject"]
sink = "Operation.fromXDRObject"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/base/operation.ts:fromXDRObject", "src/base/transaction.ts:constructor"]
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
rules_out = ["source trace confirms no SDK guard re-aligns the masked ascii decode with the raw signed bytes; signatureBase serializes raw this.tx so display and signed bytes provably diverge"]
does_not_rule_out = ["allowTrust assetCode display field (C2)", "muxed-account base-vs-mux display nuance", "nearby variants outside this exact reviewed path remain unassessed"]
assumptions = ["a review/co-sign consumer reads the decoded homeDomain/name field", "stellar-core admits bytes 128-255 in home_domain/data name (iscntrl only excludes 0-31/127)"]
mechanism_brief = "toString('ascii') masks high-bit bytes so decoded homeDomain/manageData name diverge from signed bytes"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/base/operation.ts:fromXDRObject"
guarantee = "stellar-core iscntrl only excludes 0-31/127, not 128-255; SDK applies no regex/charset check to homeDomain or manageData name and does not block this exact candidate path"

[[blockers]]
kind = "not_found"
source = "src/base/transaction.ts:signatureBase"
guarantee = "no source-proven guard re-aligns the decoded ascii string with the raw signed bytes; signatureBase commits to raw this.tx"
```
