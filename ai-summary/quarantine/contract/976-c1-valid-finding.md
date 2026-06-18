# R976C1: Spec function named `txFromJSON`/`txFromXDR` shadows the Client's own deserialization methods

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/976-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Path: `Client.from` / `Client.fromWasmHash` -> `Client.fromWasm` ->
`Spec.fromWasm(wasm)` -> `new Client(spec, options)`.

The spec consumed by the constructor is decoded from a contract wasm. Prior
VIABLE record `js-sdk-d6ede4f50f471c78ff302843` established that there is no
`sha256(wasm)==wasmHash` verification before spec decode, so even a "trusted"
contractId yields an attacker-substitutable wasm/spec and **spec function names
are attacker-controlled**.

Source trace of the constructor (`src/contract/client.ts:92-136`):

- `txFromJSON` (`client.ts:201-212`) and `txFromXDR` (`client.ts:214-215`) are
  declared as instance arrow-function fields — own properties of every Client
  instance.
- The parameter properties `spec`/`options` (`client.ts:92-95`) are assigned at
  the very start of the constructor body, and the field initializers run before
  the constructor body statements. The `this.spec.funcs().forEach(...)` loop
  (`client.ts:105-135`) is the LAST statement in the constructor, so any own
  property it touches is overwritten.
- Inside the loop, `method = xdrFn.name().toString()` (`client.ts:106`). For a
  spec function literally named `txFromJSON`, `sanitizeIdentifier("txFromJSON")`
  returns `"txFromJSON"` unchanged: `src/bindings/utils.ts:67` only replaces
  chars outside `[a-zA-Z0-9_$]`, the reserved list (`utils.ts:2-58`) contains
  only JS keywords + `constructor` (not `txFromJSON`/`txFromXDR`), it does not
  start with a digit, and `/^_+$/` does not match.
- Therefore `client.ts:131` `this["txFromJSON"] = wrapper` overwrites the
  deserializer field with the contract-method wrapper.

The wrapper closes over the raw `method` name and builds a real contract call
(`client.ts:114-128`, confirmed: `AssembledTransaction.build({ method, args,
... })`). Two reachable sub-cases:

1. If the attacker declares `txFromJSON` with zero inputs, then
   `spec.getFunc(method).inputs().length === 0` (`client.ts:132`,
   `spec.ts:562-570`/`590-593`) selects `(opts?) => assembleTransaction(undefined, opts)`.
   A later `client.txFromJSON(storedJson)` call passes `storedJson` as
   `methodOptions` and builds a **clean no-arg AssembledTransaction for the
   attacker's `txFromJSON` contract function** — no arg-conversion throw. The
   app believes it rehydrated its own stored transaction and may sign/submit it.
2. If `txFromJSON` declares inputs, the wrapper calls
   `spec.funcArgsToScVals("txFromJSON", storedJsonString)` with a string instead
   of a named-args Record, which mis-builds or throws.

## Findings

This is remote/spec trust confusion: an SDK-owned, documented deserialization
API (`client.txFromJSON` / `client.txFromXDR`, used to rehydrate a previously
built `AssembledTransaction`) is silently replaced by attacker-controlled
contract-method logic at construction time. In the zero-input sub-case the
hijack is clean and produces a valid-looking AssembledTransaction for an
attacker-named function in place of the app's intended rehydration, which can
lead to unsafe signing/submission — i.e. the impact can reach the High band, but
the dependable floor is Medium (integrity loss / unsafe application behavior).
`sanitizeIdentifier` does not reserve the Client's own instance members, and the
constructor loop performs no already-present check before assignment.

## PoC Guidance

- **Test file**: add a focused Vitest unit under `test/unit/` (mirror existing
  `client`/`spec` unit tests; no network).
- **Setup**: build a `Spec` whose entries include a function entry named exactly
  `txFromJSON` with zero inputs (construct `xdr.ScSpecEntry` /
  `ScSpecFunctionV0` directly, as the spec unit tests do), then
  `new Client(spec, { contractId, rpcUrl, networkPassphrase, ... })`.
- **Steps**: after construction, inspect the instance.
- **Assertion**: assert that `client.txFromJSON` is no longer the SDK
  deserializer — e.g. calling `client.txFromJSON(validStoredJson)` returns an
  `AssembledTransaction` whose built operation invokes the contract method
  `txFromJSON` (raw `method`) rather than reconstructing the stored transaction,
  demonstrating the own-field was overwritten by the forEach loop.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-25ba1e1365cc508195eff159"
weakness = "spec_function_name_shadows_sdk_deserializer"
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
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["constructor forEach (client.ts:105-135) runs after txFromJSON/txFromXDR field init and overwrites the own deserializer field; sanitizeIdentifier reserved list (utils.ts:2-58) does not contain txFromJSON/txFromXDR so no guard blocks this exact path", "prior NOT_VIABLE js-sdk-25ba1e1365cc508195eff159 covered only the wasm parser cluster and explicitly deferred the constructor sink, so this is not a typed duplicate"]
does_not_rule_out = ["spec/options state corruption variant (C2)", "two-contract-function name collision (C4)", "__proto__ prototype replacement variant (C3)"]
assumptions = ["spec function names are attacker-controlled per the un-verified-wasm-hash gap js-sdk-d6ede4f50f471c78ff302843", "app later calls client.txFromJSON/txFromXDR to rehydrate a stored AssembledTransaction"]
mechanism_brief = "spec function named txFromJSON/txFromXDR sanitizes unchanged and the constructor forEach (running after field init) overwrites the Client's own deserialization fields with a contract-method wrapper closing over the raw method name"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "checked guard does not block this exact candidate path: reserved list covers only JS keywords + constructor; txFromJSON/txFromXDR pass through unchanged"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:Client.constructor"
guarantee = "no already-present check or own-member reservation prevents the forEach from overwriting an own instance property"
```
