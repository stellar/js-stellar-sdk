# F97603: Spec function named `__proto__` mutates a single Client instance prototype (below severity floor)

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/976-hypothesis-batch.md
**Candidate ID**: C3
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The sanitizer-bypass mechanism is **confirmed real** in current source:

- `src/bindings/utils.ts:78`: the all-underscore fallback `/^_+$/.test(...)`
  does not match `"__proto__"` (the string contains the letters `proto`), so the
  `_unnamed` fallback does not fire and `"__proto__"` is returned verbatim from
  `sanitizeIdentifier` (it is also not in the reserved list and has no
  out-of-charset characters).
- `src/contract/client.ts:131`: `this["__proto__"] = wrapper`. Assignment to the
  `__proto__` key goes through the accessor inherited from `Object.prototype`;
  because the assigned value is a function (an object), it sets the instance's
  internal `[[Prototype]]` to that function.

So a spec function named `__proto__` does change the constructed instance's
prototype — the intended dunder defense is bypassed.

## Why It Failed

The realized security impact is below the Medium floor:

- This is **single-instance** prototype replacement, not global
  `Object.prototype` pollution. The assigned value is a fresh wrapper function,
  and the assignment uses the `__proto__` setter (it does not create an
  enumerable own `__proto__` key or write to any shared prototype). No other
  object or client is affected.
- `Client` has no behavior-critical methods on its prototype:
  `deploy`/`from`/`fromWasm`/`fromWasmHash` are static; `txFromJSON`/`txFromXDR`
  and every spec-derived method are **own** instance properties
  (`client.ts:201,214,131`). So after the prototype swap the instance still
  carries its own functional methods.
- Observable effects are limited to `instanceof Client` returning false and the
  loss of `Object.prototype` helpers on that one instance — app-dependent,
  speculative, and non-fund-impacting. No materially-wrong transaction, no
  silently-corrupted security decision, no unbounded resource use.

This is a `Low / informational` defense-in-depth bypass (an internal sanitizer
fallback that fails to defuse `__proto__`). The objective sets a hard Medium
minimum and excludes low/informational findings, so this candidate is
NOT_VIABLE for this objective. (The sanitizer gap is still worth a one-line
hardening note — reserve dunder/own-member names — but it does not meet the
severity bar here.)

## What This Rules Out

The `__proto__` spec-name bypass produces only single-instance `[[Prototype]]`
mutation; it does **not** cause global `Object.prototype` pollution, does not
remove the instance's own functional methods, and produces no materially-wrong
transaction or silent security decision (Low / below the Medium floor).

## What This Does Not Rule Out

- Global `Object.prototype` pollution via some other gadget (not demonstrated by
  this path).
- C1 (deserializer shadowing) and C4 (name collision) — separately VIABLE.
- A future change that placed a security-critical method on `Client.prototype`
  would make this prototype swap material.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-25ba1e1365cc508195eff159"
weakness = "sanitizeIdentifier_dunder_fallback_bypass_proto"
record_kind = "single_path"
path = ["from", "Client.fromWasm", "Client.constructor"]
sink = "Client.constructor"
sink_role = "runtime_binding_method_assignment"
impact_class = "contract_interface_integrity"
route_family = "contract_wasm_parse"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/client.ts:Client.constructor", "src/bindings/utils.ts:sanitizeIdentifier"]
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
negative_claim.rules_out_codes = ["impact_below_medium_severity_floor_single_instance_proto"]
rules_out = ["this['__proto__']=fn (client.ts:131) mutates only the single constructed instance's [[Prototype]] via the Object.prototype setter; it is not global Object.prototype pollution and leaves own functional methods intact, so no material security impact results"]
does_not_rule_out = ["global Object.prototype pollution via a different gadget", "deserializer shadowing C1", "name collision C4", "future security-critical methods placed on Client.prototype"]
assumptions = ["Client has no security-critical prototype methods (verified: methods are static or own instance fields)", "attacker controls spec function names via the no-sha256 enabler js-sdk-d6ede4f50f471c78ff302843"]
mechanism_brief = "spec function named __proto__ bypasses the all-underscore _unnamed fallback (utils.ts:78) and the constructor forEach this['__proto__']=fn swaps the single instance prototype, breaking instanceof but leaving own methods intact"
why_failed_brief = "confirmed sanitizer bypass but only single-instance prototype mutation with no material impact; below the Medium floor and out of scope"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "all-underscore fallback /^_+$/ at utils.ts:78 does not match __proto__, so the dunder name passes through verbatim (confirmed sanitizer gap)"

[[blockers]]
kind = "impact_bound"
source = "src/contract/client.ts:Client.constructor"
guarantee = "the assignment changes only the single instance [[Prototype]] (a fresh function value, via the proto setter); no global Object.prototype pollution and own functional methods remain, bounding impact below the Medium floor"
```
