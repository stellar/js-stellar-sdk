# R97601: Attacker spec function named `txFromJSON`/`txFromXDR` overwrites the Client's own deserialization helpers

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/976-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Path: `Client.from` / `Client.fromWasmHash` / `Client.fromWasm` → `Spec.fromWasm(wasm)` → `new Client(spec, options)`.

Traced in current source:

- `src/contract/client.ts:201-212` declares `txFromJSON` as an own instance
  arrow-function field; `:214-215` declares `txFromXDR` likewise. These are own
  data properties of the instance.
- `src/contract/client.ts:105-135` is the constructor's `forEach`. For every
  spec function it computes `method = xdrFn.name().toString()` (`:106`) — the
  raw `ScSpecFunctionV0.name`, an XDR `string<30>` that may carry arbitrary
  bytes — and then executes `this[sanitizeIdentifier(method)] = wrapper`
  (`:131`).
- The `forEach` is the final statement of the constructor body. Parameter
  properties (`:93-94`) and the instance field initializers (`:201`, `:214`)
  are both established before the constructor body's trailing statements run, so
  the loop assignment overwrites any colliding own property. This ordering holds
  regardless of `useDefineForClassFields` because the loop is the last body
  statement and field/parameter-property initialization always precedes it.
- `src/bindings/utils.ts:65-83`: `sanitizeIdentifier("txFromJSON")` and
  `sanitizeIdentifier("txFromXDR")` both return the input unchanged — the
  reserved list (`:2-58`) is JS keywords + `constructor` only, the names contain
  no out-of-charset characters, do not start with a digit, and are not
  all-underscore. So the sanitized key equals the SDK helper name.

Therefore a spec function literally named `txFromJSON` (or `txFromXDR`)
overwrites the instance field holding the deserializer with a contract-method
wrapper.

The wasm/spec is attacker-controlled at this sink: prior VIABLE record
`js-sdk-d6ede4f50f471c78ff302843` established there is no
`sha256(wasm)==wasmHash` verification before spec decode, so even
`Client.from({contractId})` / `Client.fromWasmHash` yield an
attacker-substitutable spec; `Client.fromWasm(wasm)` takes the wasm directly.

## Findings

After the overwrite, `client.txFromJSON(storedJson)` no longer calls
`AssembledTransaction.fromJSON`. Two sub-cases, both confirmed from the wrapper
definition at `client.ts:110-134`:

1. **Contract `txFromJSON` declares ≥1 input** → wrapper is
   `assembleTransaction`; `client.txFromJSON(storedJson)` runs
   `args = storedJson && spec.funcArgsToScVals("txFromJSON", storedJson)`.
   `funcArgsToScVals` indexes the JSON **string** by declared field names,
   yielding `undefined` per field and throwing. Result: the rehydrate path
   silently fails (integrity/availability loss of a stored-transaction restore).

2. **Contract `txFromJSON` declares 0 inputs** → wrapper is
   `(opts) => assembleTransaction(undefined, opts)`. `client.txFromJSON(storedJson)`
   passes `storedJson` as `methodOptions`; `args` is `undefined`, so no throw.
   `AssembledTransaction.build({ method: "txFromJSON", ... })` builds and
   simulates a **fresh on-chain invocation of the attacker's `txFromJSON`
   contract function** while the application believes it merely rehydrated a
   previously-built transaction. If the app then signs and submits the returned
   object (the normal use of a rehydrated `AssembledTransaction`), it signs an
   attacker-chosen contract call — a materially wrong transaction.

This is SDK trust confusion: a non-contract SDK helper used to restore stored
transactions is silently replaced by attacker spec data. Floor is Medium
(remote/spec trust confusion and incorrect deserialization causing unsafe app
behavior); sub-case 2 can escalate toward High if the rehydrated object is
signed and submitted.

Distinct from prior memory: route `js-sdk-25ba1e1365cc508195eff159` covered only
the wasm **parser cluster** and explicitly deferred the constructor question;
this sink is `Client.constructor`. It is not the sha256-integrity gap recorded
under `js-sdk-d6ede4f50f471c78ff302843` (that is the enabler, not the shadow).

## PoC Guidance

- **Test file**: append a focused Vitest test under `test/unit` near existing
  contract `Client` constructor tests (mock the spec; no network).
- **Setup**: build a `Spec` (or a minimal stub exposing `funcs()`,
  `getFunc(name).inputs()`, `funcArgsToScVals`, `funcResToNative`, `errorCases`)
  whose `funcs()` returns one `ScSpecFunctionV0` with `name() === "txFromJSON"`.
- **Steps**: `const c = new Client(spec, options)`.
- **Assertion**: assert `c.txFromJSON` is the spec-derived wrapper, not the
  built-in deserializer — e.g. assert that `c.txFromJSON(validStoredJson)` does
  NOT return an `AssembledTransaction` reconstructed from the stored fields, but
  instead routes into `AssembledTransaction.build`/`funcArgsToScVals` (throws for
  the ≥1-input case, or builds a `method:"txFromJSON"` invocation for the
  0-input case). A companion assertion for `txFromXDR` mirrors this.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-25ba1e1365cc508195eff159"
weakness = "spec_function_name_shadows_sdk_deserializer"
record_kind = "single_path"
path = ["from", "Client.fromWasm", "Client.constructor", "Client.txFromJSON"]
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
rules_out = ["source trace of sanitizeIdentifier (utils.ts:65-83) confirms txFromJSON/txFromXDR are not reserved and pass through unchanged, and the constructor forEach (client.ts:131) is the last body statement so it overwrites the own instance fields declared at client.ts:201/214 — no guard blocks this exact path"]
does_not_rule_out = ["spec name overwriting spec/options state (C2)", "prototype corruption via __proto__ (C3)", "two-distinct-name sanitize collision (C4)"]
assumptions = ["attacker controls the spec function name set, established by the no-sha256 wasm-substitution enabler recorded under js-sdk-d6ede4f50f471c78ff302843", "an application that rehydrates stored transactions calls client.txFromJSON/txFromXDR on the constructed client"]
mechanism_brief = "spec function named txFromJSON/txFromXDR sanitizes unchanged and the constructor forEach (run after field init) overwrites the own deserialization fields; client.txFromJSON later builds/simulates a contract call (0-input) or throws (>=1-input) instead of deserializing"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "reserved list (utils.ts:2-58) covers only JS keywords + constructor; txFromJSON/txFromXDR are not reserved and pass unchanged, so the sanitized key collides with the SDK helper field name"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:Client.constructor"
guarantee = "no already-present / reserved-member check exists before this[sanitizeIdentifier(method)] = wrapper at client.ts:131, so a spec name overwrites the own instance deserializer field"
```
