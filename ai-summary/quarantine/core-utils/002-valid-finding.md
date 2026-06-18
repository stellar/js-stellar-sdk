# R002: allowTrust assetCode decode skips the Asset alphanumeric validation

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/001-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

In `Operation.fromXDRObject` the `allowTrust` arm decodes the asset code with
no validation (`src/base/operation.ts:213-219`):

```
result.assetCode = attrs.asset().value().toString();
result.assetCode = trimEnd(result.assetCode as string, "\0");
```

`attrs.asset().value()` is the `AssetCode4`/`AssetCode12` buffer; `.toString()`
defaults to utf8 and only trailing nulls are trimmed. No charset/length check is
applied.

Contrast with every other asset-producing path: `Asset.fromOperation`
(`src/base/asset.ts:90-110`) trims trailing nulls and then funnels the code
through `new this(code, issuer)`, and the `Asset` constructor
(`src/base/asset.ts:56-61`) enforces `/^[a-zA-Z0-9]{1,12}$/`, throwing on any
non-alphanumeric or over-length code. The codebase therefore treats unvalidated
asset codes as unsafe everywhere — except the allowTrust decode arm, which
surfaces them verbatim.

The transaction decode entry maps every op through `Operation.fromXDRObject`
(`src/base/transaction.ts:145-146`), and `signatureBase()`
(`src/base/transaction.ts:246-274`) commits to the raw `this.tx` bytes, so the
displayed `assetCode` can diverge from a real/valid asset code while the signed
op authorizes a specific on-chain code.

## Findings

A peer-supplied envelope with an `allowTrust` (or SetTrustLineFlags) op whose
`AssetCode4/12` buffer contains non-alphanumeric, whitespace, embedded
non-trailing `\0`, high-bit, or homoglyph bytes will decode to a
trusted-looking-but-mismatched `assetCode` string in a review UI, while the
on-chain trustline authorization commits to the raw bytes. Embedded
non-trailing nulls survive (only trailing nulls are trimmed), strengthening the
divergence. This is "XDR parsing ambiguity that changes user-visible security
decisions" affecting a trustline authorization decision — Medium per the impact
table; it is display/trust confusion in a review flow, not direct fund movement,
so it does not rise to High.

`allowTrust` is a deprecated operation (superseded by SetTrustLineFlags), which
narrows the realistic op mix but does not eliminate the path — the decode arm is
still live. Impact depends on a review/co-sign consumer reading the decoded
`assetCode`, so impact confidence is medium even though the missing-validation
asymmetry is source-proven.

## PoC Guidance

- **Test file**: append to an existing `test/unit/operation_test.js` (or the
  TypeScript equivalent under `test/unit/`).
- **Setup**: build an `xdr.Operation` for `allowTrust` whose `AssetCode4` buffer
  contains a non-alphanumeric byte (e.g. a space, control-adjacent high-bit
  byte, or an embedded non-trailing `\0`), constructed directly as XDR to mimic
  peer-supplied bytes.
- **Steps**: call `Operation.fromXDRObject(op)` to get the decoded `assetCode`,
  and separately attempt `new Asset(code, issuer)` with the same code.
- **Assertion**: assert that `Operation.fromXDRObject` returns the unvalidated
  `assetCode` without throwing, while `new Asset(...)` with the same code throws
  the alphanumeric-validation error — demonstrating the allowTrust arm surfaces
  codes the rest of the SDK rejects.

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
target_functions = ["src/base/operation.ts:fromXDRObject", "src/base/asset.ts:fromOperation"]
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
rules_out = ["source trace confirms the allowTrust decode arm applies no charset/length validation while Asset.fromOperation routes the same kind of code through the constructor's /^[a-zA-Z0-9]{1,12}$/ check; only trailing nulls are trimmed so non-trailing/non-alphanumeric bytes survive"]
does_not_rule_out = ["homeDomain/manageData ascii-mask decode (C1)", "nearby variants outside this exact reviewed path remain unassessed"]
assumptions = ["a review/co-sign consumer reads the decoded allowTrust assetCode field", "AssetCode4/12 admits non-trailing or non-alphanumeric bytes at the XDR layer"]
mechanism_brief = "allowTrust assetCode decode skips the Asset-constructor alphanumeric validation applied on every other asset path"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/base/asset.ts:constructor"
guarantee = "Asset constructor /^[a-zA-Z0-9]{1,12}$/ validates codes on Asset.fromOperation but is not applied on the allowTrust decode arm, so it does not block this candidate path"

[[blockers]]
kind = "not_found"
source = "src/base/operation.ts:fromXDRObject"
guarantee = "no source-proven charset/length validation on the allowTrust assetCode decode field; only trimEnd of trailing nulls"
```
