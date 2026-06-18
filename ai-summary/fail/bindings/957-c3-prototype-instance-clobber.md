# F957-C3: Runtime Client instance/prototype clobber via reserved spec names

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/957-hypothesis-batch.md
**Candidate ID**: C3
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The mechanism is source-confirmed:

- `src/contract/client.ts:92-94` — `spec` and `options` are parameter properties, so
  `this.spec` and `this.options` are own instance fields.
- `src/contract/client.ts:131` — the binding loop assigns `this[sanitizeIdentifier(method)] = fn`
  with no exclusion of the Client's own members.
- `src/bindings/utils.ts:2-59` — the reserved-name list omits `spec`, `options`, and
  `__proto__`. `__proto__` is entirely identifier-safe, so `sanitizeIdentifier("__proto__")`
  returns `"__proto__"` unchanged (`utils.ts:65-83`); `constructor` → `constructor_`
  (reserved, `utils.ts:52`) so that specific clobber is blocked.

So a spec function named `spec`/`options` overwrites the corresponding own field with a
closure, and a function named `__proto__` invokes the `__proto__` setter, replacing the
instance's prototype with the function object.

## Why It Failed

The candidate is below the Medium severity floor and falls under the objective's
out-of-scope "Low and informational issues."

- The transaction-building closures capture the **local parameters** `spec`/`options`
  (`client.ts:105` uses `this.spec.funcs()` only to seed the loop; inside the closure
  the captured names are the params `spec` at `client.ts:116,127` and `options` at
  `client.ts:117`). Overwriting `this.spec`/`this.options` after construction therefore
  does **not** change which function is invoked, the arg encoding, the network, or any
  submitted-transaction field — it only corrupts external reads of `client.spec` /
  `client.options`.
- The `__proto__` case swaps the instance prototype, which breaks the client (lost
  prototype methods, `instanceof` false) — an availability/integrity nuisance against a
  client the developer has chosen to build from an attacker-controlled contract. There
  is no fund movement, no auth/SEP-10 effect, no transaction misdirection, and no
  remote-response trust confusion.

No transaction-integrity or auth-integrity impact is reachable on this path, so it does
not meet the Medium floor (security-significant integrity loss). It is local-only
integrity/DoS, which the severity scale classifies as Low / out of scope.

## What This Rules Out

A Medium-or-higher security impact from clobbering `this.spec`/`this.options`/`__proto__`
via attacker-chosen spec names on the runtime `Client.constructor` binding path: the
submitted-transaction-affecting state is held in closure-captured parameters, not the
clobbered instance fields.

## What This Does Not Rule Out

- The distinct runtime method dispatch collision that *does* change the invoked function
  (C1 — VIABLE).
- Generated-source duplicate/merging declarations (C2 — VIABLE).
- Any future path where `client.spec`/`client.options` reads feed a security decision
  (none found in current source).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-e7f284422e64462425cb9d4b"
weakness = "identifier_collision"
record_kind = "single_path"
path = ["Client.constructor", "sanitizeIdentifier"]
sink = "sanitizeIdentifier"
sink_role = "identifier_normalization"
impact_class = "state_integrity"
route_family = "xdr_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/client.ts:Client.constructor", "src/bindings/utils.ts:isNameReserved"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["below_minimum_severity_floor", "local_only_integrity_no_transaction_effect"]
rules_out = ["Medium+ impact from spec/options/__proto__ clobber: the tx-building closures capture the constructor params not this.spec/this.options, so clobbering instance fields/prototype cannot alter the submitted transaction, args, network, or auth"]
does_not_rule_out = ["runtime method dispatch collision that changes the invoked function (C1)", "generated-source duplicate/merging declarations (C2)"]
assumptions = ["sanitizeIdentifier('__proto__') returns '__proto__' unchanged and triggers the prototype setter", "reserved list omits spec/options/__proto__ but includes constructor->constructor_", "closures bind the spec/options parameters rather than the instance fields"]
mechanism_brief = "runtime Client constructor assigns this[sanitizeIdentifier(name)] without excluding own fields/prototype, so spec functions named spec/options/__proto__ clobber instance state or the prototype; but tx-building closures use the captured params, so the effect is local integrity/DoS with no transaction, fund, or auth impact"
why_failed_brief = "below Medium severity floor: local-only instance/prototype corruption against an attacker-chosen contract, no submitted-transaction or auth effect, so out of scope per minimum-severity rule"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:isNameReserved"
guarantee = "reserved-word list blocks constructor (-> constructor_) but not __proto__/spec/options"

[[blockers]]
kind = "scope_limit"
source = "src/contract/client.ts:Client.constructor"
guarantee = "tx-building closures capture the spec/options parameters, so clobbering this.spec/this.options/prototype yields no submitted-transaction, fund, or auth impact -> below Medium floor"
```
