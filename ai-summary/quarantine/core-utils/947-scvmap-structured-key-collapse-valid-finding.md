# R947-2: Standalone scValToNative scvMap decode collapses distinct structured (map/vec/bytes) keys to one JS property

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/947-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Same sink as C1 — the standalone `scValToNative` `scvMap` arm
(`src/base/scval.ts:403-409`) — but a distinct input shape: structured (non-
primitive) map keys.

Source-confirmed decoded representations of candidate structured keys:
- `scvVec` (scval.ts:397-398) decodes to a JS `Array`.
- `scvMap` (scval.ts:403-409) decodes to a plain `object`.
- `scvBytes` (scval.ts:415-416) returns `scv.value()`, a `Uint8Array`.
- `scvAddress` (scval.ts:400-401) decodes to a `string` (distinct addresses give
  distinct strings, so addresses do not self-collide — but see cross-type note).

None of `Array`, `object`, or `Uint8Array` is a valid distinct JS property key.
`Object.fromEntries` coerces them via `ToPropertyKey` → `ToString`:
- any `object` key → `"[object Object]"`, so every `scvMap` key (regardless of
  contents) collapses to the single property `"[object Object]"`;
- an `Array`/`Uint8Array` key → its comma-joined string, so `scvVec([1,2])` and
  `scvBytes([1,2])` both yield property `"1,2"` (cross-type collapse), and
  `scvVec([1])` and `scvBytes([1])` both yield `"1"`.

No branch in scval.ts:403-409 detects or rejects a non-primitive decoded key
before assigning it as a property. Thus multiple distinct structured-key entries
collapse to one property and all but the last (in attacker-controlled raw map
order) are silently lost.

Remote reachability is the same as C1 and is source-confirmed:
`src/base/events.ts:29,31` (exported `humanizeEvents` → `extractEvent`) and
`src/rpc/server.ts:1476` (`getLedgerEntries` contractData decode).

## Findings

**Security impact (Medium — remote-response trust confusion via structured-key
collapse).** A malicious/compromised contract or RPC/Horizon server can return a
legal `scvMap` whose keys are themselves maps, vecs, or bytes. After
`scValToNative`, every such map-keyed entry shares the property
`"[object Object]"`, and vec/bytes keys collide on their joined string, so
multiple distinct on-chain entries silently merge into one — hiding entries from
any application that enumerates or indexes the decoded object. The attacker
controls raw map order and therefore which entry survives.

This is a real deviation from the reasonable expectation that structured map keys
are preserved distinctly or rejected, and the lossiness is undocumented in the
scval.ts JSDoc (scval.ts:355-368). Severity is Medium for the same reason as C1:
the decoded object is returned to the application and impact depends on the
application trusting/enumerating it; no SDK-internal signing/auth decision is
shown consuming a collided structured key on this path.

Distinct from C1: C1 covers cross-type *primitive* key collision (string/symbol,
numeric); C2 covers *structured* keys coercing to `"[object Object]"`/joined
strings. Both are source-proven on the same sink but are different input shapes
and worth tracking separately. Distinct from prior [1], which disposed only of
prototype pollution and the encode-side path.

## PoC Guidance

- **Test file**: `test/unit/scval_test.js` (or the existing scval unit test).
- **Setup**: Build an `xdr.ScVal.scvMap` with two entries whose keys are distinct
  maps (e.g. `scvMap([{key: scvSymbol("a"), val: scvU32(1)}])` and
  `scvMap([{key: scvSymbol("b"), val: scvU32(2)}])`), each mapped to a different
  value. Also build a cross-type case: `[scvVec([scvU32(1)]), valA]` and
  `[scvBytes(Uint8Array.from([1])), valB]`.
- **Steps**: Call standalone `scValToNative(map)`.
- **Assertion**: Assert `Object.keys(result).length === 1` and that the single
  surviving key is `"[object Object]"` (map-key case) or `"1"` (vec/bytes case),
  with the value equal to the later entry — demonstrating distinct structured
  keys collapsed and earlier entries were silently dropped.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-63809a71507c05b9211d309d"
weakness = "scvmap_decode_structured_key_collapse"
record_kind = "single_path"
path = ["humanizeEvents/getLedgerEntries", "scValToNative.scvMap"]
sink = "scValToNative.scvMap"
sink_role = "remote_response_decode"
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
rules_out = ["source trace confirms scvVec decodes to Array (scval.ts:397-398), scvMap to object (403-409), scvBytes to Uint8Array (415-416), and that Object.fromEntries coerces these to '[object Object]'/joined-string property keys with no non-primitive-key detection or rejection, so distinct structured keys collapse"]
does_not_rule_out = ["Spec.scValToNative typed map decode in src/contract/spec.ts remains unassessed", "downstream application security decisions keyed on the decoded object are application-specific and unassessed", "primitive cross-type collision variant tracked separately as C1"]
assumptions = ["humanizeEvents and getLedgerEntries deliver attacker-controlled ScVal from remote/untrusted sources as source-confirmed at events.ts:29,31 and rpc/server.ts:1476", "a malicious contract or RPC/Horizon server is an in-scope remote attacker per the objective impact categories"]
mechanism_brief = "scValToNative scvMap arm decodes structured keys to Array/object/Uint8Array then Object.fromEntries coerces them to '[object Object]' (all map keys) or joined strings (vec/bytes keys, including cross-type vec-vs-bytes collisions); distinct structured entries collapse to one JS property and the attacker-ordered later entry silently overwrites the earlier, yielding a materially wrong decoded remote event/return value"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/base/scval.ts:scValToNative"
guarantee = "Object.fromEntries defines own __proto__ rather than mutating the prototype (prior [1]); this blocks prototype pollution only and does NOT prevent structured-key coercion/collapse"

[[blockers]]
kind = "not_found"
source = "src/base/scval.ts:scValToNative"
guarantee = "no source branch detects or rejects a non-primitive decoded map key before assigning it as a property, so distinct structured ScVal keys collapse to one JS property in scvMap decode"
```
