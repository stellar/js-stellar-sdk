# Residual escalation D983: base scValToNative default-case tag confusion (already VIABLE under js...

**Subsystem**: core-utils
**Record Kind**: residual_escalation (deeper re-investigation of a near-miss)
**Re-investigates**: ai-summary/fail/core-utils/986-c2-non-viable-candidate.md

## Primary Question (escalated budget — confirm or refute exactly this)

base scValToNative default-case tag confusion (already VIABLE under js-sdk-26a2c419baf9cb084b019288)

A prior hypothesis ruled out the narrow route but left this specific question
open for lack of source-read budget. Investigate exactly this lead with the
escalated budget; do not merely re-derive the original NOT_VIABLE. Resolve the
named symbols below to a concrete yes/no.

## Suggested Path

1. `scValToNative`
2. `Object.fromEntries`

## Target Set

- `scValToNative`
- `Object.fromEntries`

```toml-index
schema = 1
verdict = "DISPATCH_SEED"
failed_at = "dispatch"
subsystem = "core-utils"
route_id = "js-sdk-ec63ffc0147c4b4f9535270c"
weakness = "contract_spec_conversion"
record_kind = "residual_escalation"
path = ["scValToNative", "Object.fromEntries"]
sink = "Object.fromEntries"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "re-investigate residual lead"
target_functions = ["scValToNative", "Object.fromEntries"]
scope.trust_boundary = "remote_rpc_or_contract_response"
scope.protocol_phase = "response_decode"
scope.auth_state = "unauthenticated_remote"
scope.attacker_control = "remote_scval_map_keys_and_order"
scope.parser_state = "scval_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = []
rules_out = []
does_not_rule_out = []
assumptions = []
residual_question = "base scValToNative default-case tag confusion (already VIABLE under js-sdk-26a2c419baf9cb084b019288)"
mechanism_brief = "residual re-investigation: base scValToNative default-case tag confusion (already VIABLE under js..."
why_failed_brief = "residual escalation seed; not adjudicated"
confidence = "medium"
```
