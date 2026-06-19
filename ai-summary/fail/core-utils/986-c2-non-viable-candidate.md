# F986: scValToNative scvMap cross-type key coercion via Object.fromEntries

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/986-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-6, high

## Trace Summary

`base/scval.ts:scValToNative` at lines 403-409 decodes `scvMap` entries via `Object.fromEntries((scv.map() ?? []).map((entry) => [scValToNative(entry.key()), scValToNative(entry.val())]))`. JavaScript `Object.fromEntries` coerces all keys to strings, so type-distinct but string-equivalent Soroban keys (e.g., `scvU32(42)` and `scvI32(42)` both produce `"42"`; `scvBool(false)` and `scvString("false")` both produce `"false"`) silently overwrite each other. The mechanism is confirmed in source.

Entry paths into base `scValToNative` for map data: `humanizeEvents` (events.ts), `getSACBalance`, and other callers that process remote RPC/contract response data. `Spec.scValToNative` (spec.ts:1043-1054) handles typed maps by returning an array of pairs, NOT using `Object.fromEntries`, so the Spec path is unaffected.

## Why It Failed

This candidate is subsumed by prior investigations [3] and [4], which assessed the identical mechanism (`Object.fromEntries` key coercion in standalone `scValToNative`) through `humanizeEvents` and `getSACBalance` entry paths:

- **Prior [3]** (route js-sdk-63809a71507c05b9211d309d): "structured/non-string scvMap key collapse in standalone scValToNative via humanizeEvents and getSACBalance" — NOT_VIABLE because "the only injecting party on both named sinks already controls the decoded value and no SDK signing/auth decision consumes the decoded map."

- **Prior [4]** (route js-sdk-63809a71507c05b9211d309d): "cross-type primitive scvMap key collision in standalone scValToNative via humanizeEvents and getSACBalance" — NOT_VIABLE for the same reason: "the only party able to inject colliding distinct ScVal keys already controls the decoded value."

C2 identifies no new entry path where the map key injector is distinct from the value controller, and no entry path where an SDK signing, auth, or security decision consumes the decoded map. The trust boundary analysis from [3] and [4] applies identically: whoever controls the contract or RPC response controls both the keys and values in the map, so silent key collision does not produce privilege escalation or trust confusion.

Additionally, Soroban protocol enforces sorted/unique XDR-encoded map keys, so cross-type collisions require a deliberately malicious contract — the same party that already controls the decoded values.

## What This Rules Out

Cross-type primitive key collision and structured key collapse in standalone `base/scval.ts:scValToNative` via `Object.fromEntries` as a Medium+ finding: the mechanism is real but below the severity floor because the injecting party already controls both keys and values, and no SDK security decision consumes the decoded map output.

## What This Does Not Rule Out

- `Spec.scValToNative` map path (returns array-of-pairs at spec.ts:1049-1053, different key handling — not affected by this mechanism)
- The known VIABLE `js-sdk-26a2c419baf9cb084b019288` (base `scValToNative` default-case tag confusion for unknown ScVal types — distinct mechanism)

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-ec63ffc0147c4b4f9535270c"
weakness = "contract_spec_conversion"
record_kind = "single_path"
path = ["scValToNative", "Object.fromEntries"]
sink = "scValToNative"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "contract_spec_conversion"
target_functions = ["src/base/scval.ts:scValToNative:403-409"]
scope.trust_boundary = "remote_rpc_or_contract_response"
scope.protocol_phase = "response_decode"
scope.auth_state = "unauthenticated_remote"
scope.attacker_control = "remote_scval_map_keys_and_order"
scope.parser_state = "scval_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["below_medium_severity_floor_injector_controls_both_keys_and_values", "subsumed_by_prior_records_3_and_4"]
rules_out = ["cross-type primitive scvMap key collision in standalone scValToNative as Medium+ finding: injecting party controls both keys and values, no SDK security decision consumes the decoded map"]
does_not_rule_out = ["Spec.scValToNative map path (returns array-of-pairs, different key handling)", "base scValToNative default-case tag confusion (already VIABLE under js-sdk-26a2c419baf9cb084b019288)"]
assumptions = ["prior records [3] and [4] correctly assessed that no SDK signing/auth/security decision consumes the base scValToNative map output on any currently reachable entry path"]
mechanism_brief = "scValToNative decodes scvMap entries via Object.fromEntries where JS key coercion collapses type-distinct but string-equivalent Soroban keys to the same JS object key, silently discarding the earlier entry. The mechanism is real but below Medium severity because the injecting party (malicious contract or RPC server) already controls both keys and values."
why_failed_brief = "subsumed by prior investigations [3] and [4] which assessed the identical mechanism at the identical sink and concluded it is below Medium severity floor: the injecting party controls both keys and values and no SDK security decision consumes the decoded map"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/base/scval.ts:scValToNative:403-409"
guarantee = "Object.fromEntries is safe against __proto__ prototype mutation (uses CreateDataPropertyOrThrow); this candidate is about data loss via key coercion, not prototype change"

[[blockers]]
kind = "trust_boundary"
source = "src/base/scval.ts:scValToNative:403-409"
guarantee = "the party able to inject colliding ScVal map keys (malicious contract or RPC server) already fully controls the decoded values; key collision does not produce privilege escalation or trust confusion beyond what the injector already has"
```
