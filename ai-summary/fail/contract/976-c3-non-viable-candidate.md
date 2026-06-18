# F976C3: Spec function named `__proto__` replaces the instance prototype — real sanitizer-bypass, but Low impact, below Medium floor

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/976-hypothesis-batch.md
**Candidate ID**: C3
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The sanitizer-bypass is real and source-confirmed. `sanitizeIdentifier`
(`src/bindings/utils.ts:65-83`): `"__proto__"` survives the
`/[^a-zA-Z0-9_$]/` replacement unchanged (underscores and letters are all in the
allowed set), is not in the reserved list (`utils.ts:2-58`), does not start with
a digit, and the all-underscore fallback `/^_+$/` (`utils.ts:78`) does **not**
match because the string contains letters. So `__proto__` is returned verbatim,
defeating the evident intent of the `_unnamed` fallback to neutralize
underscore/dunder names.

Then `src/contract/client.ts:131` `this["__proto__"] = fn` performs an ordinary
`[[Set]]` that walks the prototype chain, finds the `__proto__` accessor on
`Object.prototype`, and invokes its setter; since `fn` (the wrapper) is an
object, the instance's `[[Prototype]]` is replaced (no own enumerable
`__proto__` key is created).

## Why It Failed

The realized impact is below the Medium floor and not a prototype-pollution
gadget:

- This is **single-instance** `[[Prototype]]` replacement, not global
  `Object.prototype` pollution. The assigned value is a fresh per-instance
  function; no enumerable own `__proto__` key is created and no shared object is
  mutated.
- The Client remains functional for its core purpose: `deploy`/`from`/`fromWasm`
  are static (`client.ts:38,148,176,188`); `txFromJSON`/`txFromXDR` and every
  forEach-assigned contract method are **own** properties (`client.ts:201,214,131`),
  so they are unaffected by the prototype swap.
- The concrete consequences are `c instanceof Client === false` and loss of
  `Object.prototype` helpers on the instance. No production SDK code path makes a
  security decision on `instanceof Client` or on inherited Object helpers of a
  Client instance, so there is no fund-loss, no wrong-but-valid transaction, and
  no decode/sign confusion.

This is a genuine `sanitizeIdentifier` fallback gap worth a defensive fix
(reserve/neutralize `__proto__`), but its security impact is Low/defense-in-depth,
which the objective places out of scope (Medium minimum).

## What This Rules Out

For this exact route/sink, a `__proto__`-named spec function replaces only the
single Client instance's prototype and does not produce global prototype
pollution or any >= Medium integrity/fund/decoding impact; the instance's own
methods continue to function.

## What This Does Not Rule Out

- A global `Object.prototype` pollution gadget via some other sink (not
  demonstrated here, and not reachable through this single-instance setter).
- The deserializer shadowing (C1) and the two-function name collision (C4),
  assessed VIABLE separately.
- The defensive-hardening value of reserving `__proto__`/dunder keys in
  `sanitizeIdentifier`.

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
negative_claim.rules_out_codes = ["single_instance_proto_swap_no_global_pollution", "low_impact_below_medium_floor"]
rules_out = ["this['__proto__']=fn invokes the Object.prototype setter and replaces only the single instance prototype; no global Object.prototype pollution and no enumerable own __proto__ key; own methods (txFromJSON/txFromXDR and forEach-assigned) keep working so no >= Medium impact"]
does_not_rule_out = ["global Object.prototype pollution via a different sink (not demonstrated)", "deserializer shadowing (C1)", "two-function name collision (C4)", "defensive value of reserving __proto__/dunder names"]
assumptions = ["spec function names attacker-controlled per js-sdk-d6ede4f50f471c78ff302843", "no production SDK code makes a security decision on instanceof Client or inherited Object helpers of a Client instance"]
mechanism_brief = "spec function named __proto__ bypasses the /^_+$/ fallback and replaces the single Client instance [[Prototype]] via the Object.prototype __proto__ setter; own properties unaffected, no global pollution"
why_failed_brief = "real sanitizer fallback bypass but only single-instance prototype change with Low/defense-in-depth impact; below Medium floor and out of scope"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "missing_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "all-underscore fallback /^_+$/ at utils.ts:78 does not match __proto__, so the dunder name is not neutralized"

[[blockers]]
kind = "behavioral"
source = "src/contract/client.ts:Client.constructor"
guarantee = "the __proto__ setter changes only the single instance prototype; Client core methods are static or own properties and remain functional, capping impact below Medium"
```
