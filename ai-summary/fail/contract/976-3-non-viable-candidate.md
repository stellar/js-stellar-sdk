# F976C3: Spec function named `__proto__` replaces the Client instance prototype

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/976-hypothesis-batch.md
**Candidate ID**: C3
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The mechanism is source-confirmed. `sanitizeIdentifier("__proto__")`
(`src/bindings/utils.ts:65-83`): the replace at `utils.ts:67` leaves `__proto__`
unchanged (only `_` and letters); it is not in the reserved list (`utils.ts:2-58`);
it does not start with a digit; and the all-underscore fallback
`/^_+$/.test("__proto__")` at `utils.ts:78` is `false` because the string
contains the letters `proto`. So `__proto__` is returned verbatim — the
`_unnamed` fallback intended to defuse underscore/dunder names does not fire.

The constructor then runs `this["__proto__"] = wrapperFn` (`client.ts:131`).
Because `__proto__` is the accessor property inherited from `Object.prototype` and
the assigned wrapper is a function (an object), this invokes the `__proto__`
setter and replaces the instance's `[[Prototype]]` rather than creating an own
enumerable key. `Object.getPrototypeOf(client)` becomes the wrapper function and
`client instanceof Client` becomes `false`. The spec function name is
attacker-controlled (`ScSymbol` = `xdr.string(32)`, no char validation,
`curr_generated.js:9464,10162`; RPC-substitutable wasm per
`js-sdk-d6ede4f50f471c78ff302843`).

## Why It Failed

The bug is real but its security impact is below this objective's Medium floor.
The assignment changes the prototype of a single Client instance only — it is not
`Object.prototype` pollution: the value is a fresh per-instance wrapper function
and the assignment uses the proto setter, creating no shared enumerable
`__proto__` gadget. After the change the instance chain is
`client -> wrapperFn -> Function.prototype -> Object.prototype`, so
`Object.prototype` helpers remain reachable, and Client has no behavior-critical
methods on `Client.prototype` (`deploy`/`from`/`fromWasm`/`fromWasmHash` are
static; `txFromJSON`/`txFromXDR` are own instance fields that remain present as
own properties). The realized impact is therefore `instanceof Client === false`
plus loss of any (currently none) Client.prototype methods on that one instance.

No transaction is mis-signed or mis-submitted, no remote response is decoded to a
materially wrong value, no HTTPS/auth gate is bypassed, no parser ambiguity flips
a user-visible security decision, and no global prototype pollution occurs. That
places the confirmed deviation at Low/informational, which is OUT_OF_SCOPE for
this objective (minimum severity Medium). This is a sanitizer-defense-bypass worth
noting, but it does not meet the Medium materiality bar, so the candidate is
NOT_VIABLE for this objective.

## What This Rules Out

The `__proto__` spec-name path through the Client constructor is a single-instance
prototype replacement only and does not reach the Medium severity floor: no global
`Object.prototype` pollution, no signing/submission/decoding integrity loss, no
security-gate bypass.

## What This Does Not Rule Out

A global `Object.prototype` pollution gadget (not demonstrated here), or any
other constructor-loop overwrite that does reach the Medium floor — specifically
the sibling deserializer-shadowing (C1), spec/options state overwrite (C2), and
two-name interface-misrepresentation collision (C4), which are reviewed
separately as VIABLE.

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
negative_claim.rules_out_codes = ["impact_below_medium_severity_floor_single_instance_prototype_only", "no_global_object_prototype_pollution"]
rules_out = ["this['__proto__']=fn replaces only the single instance prototype (proto setter, fresh per-instance function), reaches no signing/submission/decoding/auth/parser security decision, and creates no global Object.prototype pollution, so it is Low/out-of-scope under the Medium floor"]
does_not_rule_out = ["a distinct global Object.prototype pollution gadget", "sibling constructor-loop overwrites that do reach the Medium floor (C1 deserializer shadowing, C2 spec/options overwrite, C4 name collision)"]
assumptions = ["spec function names are attacker-controlled (ScSymbol = xdr.string(32), no char validation, curr_generated.js:9464,10162; RPC-substitutable wasm per route js-sdk-d6ede4f50f471c78ff302843)", "objective minimum severity is Medium; Low/informational findings are out of scope", "Client.prototype carries no behavior-critical methods (deploy/from/fromWasm static; txFromJSON/txFromXDR own fields)"]
mechanism_brief = "spec function named __proto__ bypasses the all-underscore _unnamed fallback (utils.ts:78) and this['__proto__']=fn replaces the single Client instance prototype; real bug but single-instance only, no global pollution, below Medium floor"
why_failed_brief = "confirmed deviation but impact is single-instance prototype change with no security decision flipped and no global pollution; Low/out-of-scope for the Medium-floor objective"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "missing_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "the all-underscore fallback /^_+$/ at utils.ts:78 does not match __proto__ (verified), so the dunder name passes through unchanged"

[[blockers]]
kind = "out_of_scope_severity"
source = "src/contract/client.ts:Client.constructor"
guarantee = "the resulting single-instance [[Prototype]] replacement (client.ts:131) causes no global pollution and flips no signing/submission/decoding/auth/parser security decision, holding impact below the Medium floor"
```
