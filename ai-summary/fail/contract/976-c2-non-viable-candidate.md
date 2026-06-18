# F976C2: Spec function named `spec`/`options` overwrites Client state — availability only, below Medium floor

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/976-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The overwrite mechanism is real and source-confirmed: `this.spec`/`this.options`
are parameter properties assigned at the start of the constructor body
(`src/contract/client.ts:92-95`), and the `funcs().forEach` loop
(`client.ts:105-135`) is the last constructor statement. A spec function named
`spec` or `options` sanitizes unchanged (`sanitizeIdentifier`,
`src/bindings/utils.ts:65-83` — neither is reserved), so `client.ts:131`
`this["spec"] = wrapper` / `this["options"] = wrapper` overwrites the
parameter-property value.

However, tracing the consumers of `this.spec`/`this.options` shows the impact is
self-inflicted availability loss, not security-significant integrity confusion:

- The per-method wrappers built in the loop close over the **closure** params
  `spec` and `options` (`client.ts:116-117`), NOT `this.spec`/`this.options`.
  Confirmed at `client.ts:114-128`. So every generated contract method keeps
  working correctly after `this.spec`/`this.options` are clobbered.
- The only readers of `this.spec`/`this.options` are `txFromJSON`
  (`client.ts:205-208`) and `txFromXDR` (`client.ts:215`). After the overwrite,
  `this.spec` is a function, so `this.spec.funcResToNative` is `undefined` and
  `this.options` is a function spread into options — these calls simply **throw**
  rather than produce a wrong-but-valid transaction.

## Why It Failed

The objective sets a **Medium minimum severity** and explicitly places Low /
informational / "local-only inconvenience" / availability issues out of scope.
The realized effect of C2 is that two own methods of a Client built from an
attacker-chosen contract throw exceptions when used — a self-DoS of an
attacker-selected client with no wrong-but-valid transaction, no fund movement,
and no decode confusion (the result is an exception, not a materially wrong
result). It does not reach the Medium band of "security-significant integrity
loss." There is no production code path that makes a security decision on the
basis of the corrupted `this.spec`/`this.options` before the exception.

## What This Rules Out

For this exact route/sink, overwriting `this.spec`/`this.options` via the
constructor forEach does not yield a material (>= Medium) integrity-confusion
outcome: the method wrappers are immune (closure capture), and the only affected
calls fail closed (throw) rather than producing attacker-shaped valid output.

## What This Does Not Rule Out

- The deserializer-shadowing variant (C1), where the own field itself is replaced
  by a working wrapper and can build a valid attacker transaction — assessed
  VIABLE separately.
- The two-contract-function collision (C4) — assessed VIABLE separately.
- Any future change that makes the per-method wrappers read `this.spec`/
  `this.options` instead of the closure params, which would change this analysis.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-25ba1e1365cc508195eff159"
weakness = "spec_function_name_overwrites_client_state"
record_kind = "single_path"
path = ["from", "Client.fromWasm", "Client.constructor"]
sink = "Client.constructor"
sink_role = "runtime_binding_method_assignment"
impact_class = "contract_interface_integrity"
route_family = "contract_wasm_parse"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/client.ts:Client.constructor", "src/contract/client.ts:Client.txFromJSON", "src/bindings/utils.ts:sanitizeIdentifier"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["availability_only_below_medium_floor", "no_material_integrity_confusion_on_this_path"]
rules_out = ["overwriting this.spec/this.options via the constructor forEach causes only fail-closed exceptions in txFromJSON/txFromXDR; method wrappers are immune via closure capture (client.ts:116-117), so no >= Medium integrity-confusion outcome on this path"]
does_not_rule_out = ["deserializer field shadowing producing a valid attacker tx (C1)", "two-contract-function name collision (C4)", "future code reading this.spec/this.options inside the per-method wrappers"]
assumptions = ["spec function names attacker-controlled per js-sdk-d6ede4f50f471c78ff302843", "per-method wrappers continue to close over the constructor params spec/options rather than this.spec/this.options"]
mechanism_brief = "spec function named spec/options overwrites the readonly parameter-properties via the constructor forEach, but method wrappers use closure params and the only this.spec/this.options readers (txFromJSON/txFromXDR) fail closed"
why_failed_brief = "real overwrite but effect is self-DoS / availability of an attacker-chosen client; below the Medium severity floor and out of scope"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "spec/options are not reserved (utils.ts:2-58), so the overwrite is not prevented; but consumers fail closed"

[[blockers]]
kind = "behavioral"
source = "src/contract/client.ts:Client.constructor"
guarantee = "per-method wrappers close over closure params spec/options (client.ts:116-117), so the overwrite cannot redirect contract calls; only txFromJSON/txFromXDR throw"
```
