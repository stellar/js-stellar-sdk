# Residual escalation D981: Spec/result type confusion when SentTransaction.result parses RPC getT...

**Subsystem**: contract
**Record Kind**: residual_escalation (deeper re-investigation of a near-miss)
**Re-investigates**: ai-summary/fail/contract/1004-path-blocked.md

## Primary Question (escalated budget — confirm or refute exactly this)

Spec/result type confusion when SentTransaction.result parses RPC getTransactionResponse.returnValue (distinct result-decode route)

A prior hypothesis ruled out the narrow route but left this specific question
open for lack of source-read budget. Investigate exactly this lead with the
escalated budget; do not merely re-derive the original NOT_VIABLE. Resolve the
named symbols below to a concrete yes/no.

## Suggested Path

1. `send`
2. `this.se ... saction`

## Target Set

- `send`
- `this.se ... saction`

```toml-index
schema = 1
verdict = "DISPATCH_SEED"
failed_at = "dispatch"
subsystem = "contract"
route_id = "js-sdk-dfb2ac9b8611377f55d03e10"
weakness = "transaction_submission"
record_kind = "residual_escalation"
path = ["send", "this.se ... saction"]
sink = "this.se ... saction"
sink_role = "transaction_submission"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "re-investigate residual lead"
target_functions = ["send", "this.se ... saction"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = []
rules_out = []
does_not_rule_out = []
assumptions = []
residual_question = "Spec/result type confusion when SentTransaction.result parses RPC getTransactionResponse.returnValue (distinct result-decode route)"
mechanism_brief = "residual re-investigation: Spec/result type confusion when SentTransaction.result parses RPC getT..."
why_failed_brief = "residual escalation seed; not adjudicated"
confidence = "medium"
```
