# D986: Contract Spec Conversion via nativeToScVal and scValToNative

**Subsystem**: core-utils
**Weakness Family**: contract_spec_conversion
**Path Root**: `nativeToScVal`
**Sink / Sensitive Operation**: `nativeToScVal` — converts caller-supplied native values into Soroban contract ScVal representations
**Source Dispatch Batch**: claude-sonnet-4-6, high

## Suggested Path

1. `nativeToScVal`
2. `nativeToScVal`

## Target Set

- `authorizeEntry`
- `nativeToScVal`
- `addSacTransferOperation`
- `extractEvent`
- `scValToNative`
- `<anonymous>`

## Input Shape

```json
{
  "source": "application_configuration",
  "attacker_control": "configuration_values",
  "auth_state": "caller_configured",
  "encoding": "typescript_values",
  "size": "small",
  "sanitizers": [],
  "remaining_risk": "Whether recursive or type-dispatch paths in native-to-ScVal and ScVal-to-native conversion preserve contract interface integrity when handling unexpected native value shapes."
}
```

## Prior Memory Check

- DB area used: `codeql-area:core-utils:contract_spec_conversion`.
- Why this area is useful: 9 open routes covering authorization entry, SAC transfer, event extraction, and bidirectional native/ScVal conversion with no prior dismissals.

## Primary Question

- Which targets in this sibling set remain viable after checking shared gates, bounds, lifecycle invariants, and material sinks?

```toml-index
schema = 1
verdict = "DISPATCH_SEED"
failed_at = "dispatch"
subsystem = "core-utils"
route_id = "js-sdk-ec63ffc0147c4b4f9535270c"
weakness = "contract_spec_conversion"
record_kind = "area_seed"
path = ["nativeToScVal", "nativeToScVal"]
sink = "nativeToScVal"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "contract_spec_conversion"
target_functions = ["authorizeEntry", "nativeToScVal", "addSacTransferOperation", "extractEvent", "scValToNative", "<anonymous>"]
scope.trust_boundary = "application_configuration"
scope.protocol_phase = "sdk_configuration"
scope.auth_state = "caller_configured"
scope.attacker_control = "configuration_values"
scope.parser_state = "configuration_loaded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = []
rules_out = []
does_not_rule_out = []
assumptions = []
mechanism_brief = "nativeToScVal recursively converts caller-supplied native JS values into Soroban ScVal contract types, with sibling routes through authorization entry, SAC transfer, and event extraction."
why_failed_brief = "dispatch seed; not adjudicated"
confidence = "medium"
```
