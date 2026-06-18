# R9472: Structured ScVal map keys collapse to one property in standalone scValToNative

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/947-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Same sink as C1: the `scvMap` arm of standalone `scValToNative`
(`src/base/scval.ts:403-409`) builds the result with `Object.fromEntries` over
`[scValToNative(key), scValToNative(val)]` pairs, with no guard that the decoded
key is a valid distinct JS property key.

Source-confirmed structured-key decode results:
- `scval.ts:397-398` — `scvVec` decodes to a JS `Array` (`(scv.vec() ?? []).map`).
- `scval.ts:403-409` — a nested `scvMap` key decodes to a plain JS object.
- `scval.ts:415-416` — `scvBytes` returns `scv.value()`, a `Uint8Array`.

When such a value is used as the key argument to `Object.fromEntries`,
`ToPropertyKey` coerces it via `String()`: a plain object becomes the literal
property `"[object Object]"`, and an `Array`/`Uint8Array` becomes its
comma-joined string (e.g. `[1]` and the bytes `01` both become `"1"`). There is
**no branch in `scval.ts:403-409` that detects or rejects a non-primitive
decoded key** before assigning it. Consequently:
- Any two `scvMap`-keyed or distinct-object-keyed entries collapse onto the
  single property `"[object Object]"`.
- Distinct array/byte keys that share a joined-string form (e.g.
  `scvVec([scvU32(1)])` vs `scvBytes([0x01])`) collapse onto the same property.

All but the last colliding entry are silently dropped, and raw map order is
attacker-controlled. Remote reachability is identical to C1 and source-confirmed
(`src/base/events.ts:29,31` via exported `humanizeEvents`;
`src/rpc/server.ts:1476` via `getLedgerEntries`).

## Findings

This is a structured-key variant of the same result-decode ambiguity. Multiple
distinct, individually-legal structured Soroban map keys are coerced to one
lossy property string, so an application enumerating or indexing the decoded
object cannot observe entries that existed on chain, and the attacker chooses
which survives via map order.

Severity is Medium for the same reason as C1: the decoded object is handed to
the application and no SDK-internal signing/auth decision is shown consuming the
collapsed key on this path. It clears the Medium floor for "remote response
decoded into a materially wrong event/return value" and "parser ambiguity ...
that changes user-visible security decisions." The collapse is undocumented —
the `scval.ts` JSDoc does not warn that map decode is lossy for structured or
colliding keys.

This is a distinct mechanism from C1 (primitive same-string collision): here the
collision arises because decoded structured keys are not valid distinct property
keys at all, so even semantically unrelated keys merge.

## PoC Guidance

- **Test file**: append to `test/unit/scval_test.js` (or the existing scval
  unit test).
- **Setup**: build two `xdr.ScMapEntry` values with structured keys, e.g.
  `xdr.ScVal.scvVec([xdr.ScVal.scvMap([...])])` style or two different
  `xdr.ScVal.scvMap(...)` keys (both coerce to `"[object Object]"`), or
  `xdr.ScVal.scvVec([xdr.ScVal.scvU32(1)])` vs an `xdr.ScVal.scvBytes` of one
  byte `0x01` (both coerce to `"1"`); give them different values.
- **Steps**: assemble `xdr.ScVal.scvMap([entryA, entryB])` and call
  `scValToNative(map)`.
- **Assertion**: assert the decoded object has only a single property
  (`"[object Object]"` or the joined string) holding only the last entry's
  value, demonstrating that distinct structured keys collapsed and entries were
  silently lost. No network calls required.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-63809a71507c05b9211d309d"
weakness = "result_decode_ambiguity"
record_kind = "single_path"
path = ["humanizeEvents", "scValToNative.scvMap"]
sink = "Object.fromEntries"
sink_role = "scval_map_decode"
impact_class = "remote_response_trust_confusion"
route_family = "contract_spec_conversion"
material_effect = "re-investigate residual lead"
target_functions = ["src/base/scval.ts:scValToNative", "src/base/events.ts:extractEvent", "src/rpc/server.ts:scValToNative"]
scope.trust_boundary = "remote_rpc_or_contract_response"
scope.protocol_phase = "response_decode"
scope.auth_state = "unauthenticated_remote"
scope.attacker_control = "remote_scval_map_keys_and_order"
scope.parser_state = "scval_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms no branch in scValToNative scvMap decode detects or rejects a non-primitive decoded key before assigning it via Object.fromEntries; structured keys are coerced to lossy strings and collide"]
does_not_rule_out = ["Spec.scValToNative typed map decode in src/contract/spec.ts remains a separate unassessed path", "C1 primitive same-string collisions are tracked separately and not subsumed here"]
assumptions = ["a malicious/compromised contract or RPC server can return an scvMap whose keys are structured ScVals (scvMap/scvVec/scvBytes), which is within the remote-response trust boundary"]
mechanism_brief = "scValToNative decodes scvVec to Array, nested scvMap to object, scvBytes to Uint8Array; used as Object.fromEntries keys these coerce to '[object Object]' or comma-joined strings, so distinct structured ScVal keys collapse to one property and attacker-ordered later entries silently overwrite earlier ones"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "not_found"
source = "src/base/scval.ts:scValToNative"
guarantee = "no guard validates that a decoded scvMap key is a distinct primitive property key; structured keys are coerced to lossy strings"

[[blockers]]
kind = "not_found"
source = "src/base/scval.ts:scValToNative"
guarantee = "no dedup, collision-throw, canonicalization, or structured-key rejection prevents distinct structured ScVal keys from collapsing to one JS property"
```
