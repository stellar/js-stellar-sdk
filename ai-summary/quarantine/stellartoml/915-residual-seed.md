# Residual escalation D915: unbounded read when timeout<=0/default (VIABLE js-sdk-a0a2d5acc9407b3b...

**Subsystem**: stellartoml
**Record Kind**: residual_escalation (deeper re-investigation of a near-miss)
**Re-investigates**: ai-summary/fail/stellartoml/910-path-blocked.md

## Primary Question (escalated budget — confirm or refute exactly this)

unbounded read when timeout<=0/default (VIABLE js-sdk-a0a2d5acc9407b3ba398d119)

A prior hypothesis ruled out the narrow route but left this specific question
open for lack of source-read budget. Investigate exactly this lead with the
escalated budget; do not merely re-derive the original NOT_VIABLE. Resolve the
named symbols below to a concrete yes/no.

## Suggested Path

1. `resolve`
2. `httpCli ...    .get`

## Target Set

- `resolve`
- `httpCli ...    .get`

```toml-index
schema = 1
verdict = "DISPATCH_SEED"
failed_at = "dispatch"
subsystem = "stellartoml"
route_id = "js-sdk-5087e2e1586dd529943e74ec"
weakness = "network_request"
record_kind = "residual_escalation"
path = ["resolve", "httpCli ...    .get"]
sink = "httpCli ...    .get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "re-investigate residual lead"
target_functions = ["resolve", "httpCli ...    .get"]
scope.trust_boundary = "remote_domain_well_known_file"
scope.protocol_phase = "stellar_toml_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_and_toml_body"
scope.parser_state = "toml_decoded"
scope.size_class = "bounded_by_stellar_toml_max_size"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = []
rules_out = []
does_not_rule_out = []
assumptions = []
residual_question = "unbounded read when timeout<=0/default (VIABLE js-sdk-a0a2d5acc9407b3ba398d119)"
mechanism_brief = "residual re-investigation: unbounded read when timeout<=0/default (VIABLE js-sdk-a0a2d5acc9407b3b..."
why_failed_brief = "residual escalation seed; not adjudicated"
confidence = "medium"
```
