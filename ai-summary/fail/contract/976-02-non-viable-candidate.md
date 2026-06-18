# F97602: Spec function named `spec`/`options` overwrites Client state (DoS-only, below severity floor)

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/976-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The mechanism is **confirmed real** in current source:

- `src/contract/client.ts:92-94` declares `public readonly spec` and
  `public readonly options` as parameter-properties (`readonly` is
  compile-time only; at runtime they are ordinary writable own data
  properties).
- `src/bindings/utils.ts:65-83`: `sanitizeIdentifier("spec")` → `"spec"` and
  `sanitizeIdentifier("options")` → `"options"` (neither is reserved, no
  out-of-charset chars, not digit-leading, not all-underscore).
- `src/contract/client.ts:131`: `this[sanitizeIdentifier(method)] = wrapper`,
  the last statement of the constructor body, overwrites the parameter-property
  own values when a spec function is named `spec` or `options`.
- The loop body itself reads the **closure** params `spec`/`options`
  (`client.ts:114-127`), not `this.spec`/`this.options`, so the loop completes
  and all spec-derived method wrappers are built correctly with the genuine
  spec/options. Only later code that reads `this.spec`/`this.options` is
  affected — `txFromJSON` (`:205,208`) and `txFromXDR` (`:215`).

So the overwrite happens, but its only downstream effect is on `this.spec` /
`this.options` readers.

## Why It Failed

The realized impact is **DoS-only / loud failure**, below the Medium floor:

- After `this.spec = wrapper`, `txFromJSON`'s `parseResultXdr` closure calls
  `this.spec.funcResToNative(...)` where `this.spec` is now a function →
  `funcResToNative` is `undefined` → throws at parse time.
- After `this.options = wrapper`, `txFromJSON`/`txFromXDR` spread
  `...this.options` (a function, whose enumerable own props are typically none)
  into `AssembledTransaction.fromJSON`/`fromXDR`, producing missing
  `rpcUrl`/`contractId`/etc → a thrown error or an unusable object.

In every sub-case the result is a thrown exception (a loud, non-silent failure)
that affects only the two helper methods of a client the application chose to
build from an already-malicious contract. The generated contract-method wrappers
(the security-relevant submission path) are unaffected because they use closure
state. No materially-wrong-but-valid transaction is produced, no security
decision is silently corrupted, and there is no unbounded resource consumption.
This is `Low / local-only inconvenience` — explicitly OUT_OF_SCOPE for this
objective (minimum severity Medium; do not confirm low/informational findings).

This contrasts with C1 (VIABLE): C1's 0-input sub-case builds and simulates an
attacker contract call disguised as a rehydrate (a materially-wrong transaction),
whereas C2 only throws.

## What This Rules Out

A spec function named `spec`/`options` does not produce a materially-wrong
transaction, a silently-corrupted security decision, or unbounded resource use
through `this.spec`/`this.options` overwrite; the outcome is a thrown exception
in `txFromJSON`/`txFromXDR` only (Low / below the Medium floor).

## What This Does Not Rule Out

- C1 (txFromJSON/txFromXDR deserializer shadowing) — separately VIABLE.
- C4 (two distinct names colliding to one method) — separately VIABLE.
- Any future code path that reads `client.spec`/`client.options` and makes a
  *security decision* on it (rather than merely throwing) could lift this to a
  material finding; not present in current source.

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
negative_claim.rules_out_codes = ["impact_below_medium_severity_floor_dos_only"]
rules_out = ["overwriting this.spec/this.options yields only thrown exceptions in txFromJSON/txFromXDR (client.ts:205,208,215); generated method wrappers use closure state (client.ts:114-127) and are unaffected, so no materially-wrong transaction or silent security-decision corruption results"]
does_not_rule_out = ["txFromJSON/txFromXDR deserializer shadowing C1", "two-distinct-name sanitize collision C4", "any future code that makes a security decision from client.spec/client.options rather than throwing"]
assumptions = ["readonly is compile-time only so the runtime own property is writable", "attacker controls spec function names via the no-sha256 enabler js-sdk-d6ede4f50f471c78ff302843"]
mechanism_brief = "spec function named spec/options overwrites the writable parameter-property own values via the constructor forEach, but the loop uses closure spec/options so only this.spec/this.options readers (txFromJSON/txFromXDR) break, and they throw"
why_failed_brief = "confirmed mechanism but DoS-only loud failure of two helpers on an attacker-chosen client; below the Medium severity floor and out of scope"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier does not reserve instance-state names spec/options (utils.ts:2-58), so they pass through and collide with the parameter-properties"

[[blockers]]
kind = "impact_bound"
source = "src/contract/client.ts:txFromJSON"
guarantee = "downstream effect of this.spec/this.options overwrite is a thrown exception in txFromJSON/txFromXDR only; generated method wrappers use closure state and produce no materially-wrong transaction"
```
