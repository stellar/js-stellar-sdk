# D1042: sendTransaction to RPC transaction submission sink

**Subsystem**: rpc
**Weakness Family**: transaction_integrity
**Path Root**: `sendTransaction`
**Sink / Sensitive Operation**: RPC transaction submission sink (`this._s ... saction`)
**Source Dispatch Batch**: claude-sonnet-4-6, high

## Suggested Path

1. `sendTransaction`
2. `this._s ... saction`

## Target Set

- `sendTransaction`
- `this._s ... saction`
- `<anonymous>`

## Input Shape

```json
{
  "source": "remote_rpc_server",
  "attacker_control": "remote_response_and_caller_supplied_transaction",
  "auth_state": "server_selected_by_caller",
  "encoding": "json_base64_xdr",
  "size": "bounded_by_rpc_response_and_xdr",
  "sanitizers": ["unknown"],
  "remaining_risk": "Whether the caller-supplied transaction and remote RPC response are adequately validated before final submission through the RPC sink."
}
```

## Prior Memory Check

- DB area used: `codeql-area:rpc:transaction_submission`.
- Why this area is useful: least-covered transaction_submission cluster with 2 open routes; sendTransaction serializes and submits caller-supplied transactions through an RPC sink influenced by a server selected by the caller.

## Primary Question

- Which targets in this sibling set remain viable after checking shared gates, bounds, lifecycle invariants, and material sinks?

```toml-index
schema = 1
verdict = "DISPATCH_SEED"
failed_at = "dispatch"
subsystem = "rpc"
route_id = "js-sdk-47e96488c443cb7f894f39b4"
weakness = "transaction_integrity"
record_kind = "area_seed"
path = ["sendTransaction", "this._s ... saction"]
sink = "this._s ... saction"
sink_role = "transaction_submission"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "transaction_submission"
target_functions = ["sendTransaction", "this._s ... saction", "<anonymous>"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = []
rules_out = []
does_not_rule_out = []
assumptions = []
mechanism_brief = "sendTransaction serializes a caller-supplied transaction and submits it through an RPC sink where the server is caller-selected and remote response content flows into the submission path"
why_failed_brief = "dispatch seed; not adjudicated"
confidence = "medium"
```
