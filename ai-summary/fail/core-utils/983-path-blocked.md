# F983: Path blocked: base scValToNative default-case tag confusion via Object.fromEntries

**Subsystem**: core-utils
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/core-utils/983-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`scValToNative -> Object.fromEntries`

## Blocker

Three independent source-backed blockers dispose of this route. First, `Object.fromEntries` (src/base/scval.ts:403-409) uses `[[DefineOwnProperty]]` semantics, not setter dispatch — key `"__proto__"` would create an own enumerable property, not mutate the prototype chain. Second, the only parties that can supply unhandled ScVal types (`scvContractInstance`, `scvLedgerKeyContractInstance`, `scvLedgerKeyNonce`) as map keys are a malicious contract or RPC server that already controls the corresponding map values, so default-case key coercion to `"[object Object]"` or `"undefined"` does not produce privilege escalation beyond what the injecting party has. Third, no SDK code makes a security decision from the object produced by base `scValToNative` on arbitrary maps; callers access named fields directly (`entry.amount`, `entry.authorized`) or pass the result to user-facing display without re-trusting it.

## Evidence

- `src/base/scval.ts:403-409` — scvMap case calls `Object.fromEntries` with recursively converted keys; no sanitization of unhandled-type coercions, but `Object.fromEntries` is prototype-safe by spec
- `src/base/scval.ts:477-478` — default case returns `scv.value()` raw: `ScContractInstance` or `ScNonceKey` XDR object (coerces to `"[object Object]"`) or `undefined` for `scvLedgerKeyContractInstance` (coerces to `"undefined"`)
- `src/rpc/server.ts:1476-1490` — sole SDK consumer of base `scValToNative` on contract map data accesses only explicit named properties (`entry.amount`, `entry.authorized`, `entry.clawback`); no key-driven security decision
- `src/contract/spec.ts:1087-1094` — Spec.scValToNative default case throws; the spec conversion path does not silently fall through to the base default, keeping the two paths isolated

## Negative Scope

- Rules out: default-case tag confusion in base `scValToNative → Object.fromEntries` as a standalone Medium+ finding; `Object.fromEntries` is prototype-safe, and the injecting party controls both keys and values without additional escalation
- Does not rule out: `Spec.scValToNative → structToNative` bracket-notation assignment (prior VIABLE [2], route `js-sdk-ec63ffc0147c4b4f9535270c`); does not rule out callers outside the SDK that pass base `scValToNative` output to a security-sensitive key-dispatch path

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "core-utils"
route_id = "js-sdk-ec63ffc0147c4b4f9535270c"
weakness = "contract_spec_conversion"
record_kind = "single_path"
path = ["scValToNative", "Object.fromEntries"]
sink = "Object.fromEntries"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "re-investigate residual lead"
target_functions = ["src/base/scval.ts:scValToNative", "src/base/scval.ts:Object.fromEntries"]
scope.trust_boundary = "remote_rpc_or_contract_response"
scope.protocol_phase = "response_decode"
scope.auth_state = "unauthenticated_remote"
scope.attacker_control = "remote_scval_map_keys_and_order"
scope.parser_state = "scval_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["below_medium_severity_floor_injector_controls_both_keys_and_values", "object_from_entries_prototype_safe", "no_sdk_security_decision_on_decoded_map"]
rules_out = ["base scValToNative default-case unhandled-type key coercion via Object.fromEntries as Medium+ finding: Object.fromEntries is prototype-safe, injecting party controls both keys and values, and no SDK security decision uses the decoded map"]
does_not_rule_out = ["Spec.scValToNative structToNative bracket-notation field name assignment (prior VIABLE js-sdk-ec63ffc0147c4b4f9535270c)", "external SDK callers that pass scValToNative output to key-driven security logic"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "base scValToNative default case returns scv.value() for scvContractInstance/scvLedgerKeyContractInstance/scvLedgerKeyNonce; these coerce to string keys [object Object] or undefined in Object.fromEntries; Object.fromEntries is prototype-safe by spec; injecting party controls full map; no SDK security decision exploitable"
why_failed_brief = "Object.fromEntries is prototype-safe; injecting party already controls decoded values; no SDK security decision uses the decoded arbitrary map; Spec.scValToNative default case throws independently"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "Object.fromEntries uses [[DefineOwnProperty]] semantics — key __proto__ creates an own enumerable property, does not mutate prototype chain (src/base/scval.ts:404)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "Spec.scValToNative default case throws TypeError (src/contract/spec.ts:1087-1094) — spec path does not silently fall through to base default-case return"

[[blockers]]
kind = "attacker_controls_both_keys_and_values"
guarantee = "the only parties able to inject scvContractInstance/scvLedgerKeyContractInstance/scvLedgerKeyNonce map keys (malicious contract or RPC server) already control the corresponding values; tag confusion adds no new attack surface"

[[blockers]]
kind = "no_security_decision_on_output"
guarantee = "all SDK callers of base scValToNative on contract map data access only named fields directly (entry.amount, entry.authorized, entry.clawback at src/rpc/server.ts:1476-1490) or pass output to user display; no key-driven security decision found"
```
