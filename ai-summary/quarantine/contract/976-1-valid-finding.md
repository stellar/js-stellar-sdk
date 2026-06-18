# R976C1: Spec function named `txFromJSON`/`txFromXDR` overwrites SDK deserializer

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/976-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

`Client.constructor` (`src/contract/client.ts:92-136`) iterates `this.spec.funcs()`
and, for every spec function, assigns

```js
this[sanitizeIdentifier(method)] = ...assembleTransaction wrapper...   // client.ts:131
```

`method = xdrFn.name().toString()` (client.ts:106) is the raw spec function name.
The XDR type of that name is `ScSymbol` = `xdr.string(32)`
(`src/base/generated/curr_generated.js:9464,10162`); the XDR decoder enforces only
the 32-byte length, not the Soroban symbol character set, so the name is an
arbitrary attacker-controlled string. The trust boundary is established: for
`Client.from`/`Client.fromWasmHash` the wasm is RPC-fetched with no
`sha256(wasm)==wasmHash` verification (prior VIABLE `js-sdk-d6ede4f50f471c78ff302843`),
and `Client.fromWasm(wasm, options)` takes wasm directly from the app — so the
spec function names reaching the constructor are attacker-substitutable.

`sanitizeIdentifier` (`src/bindings/utils.ts:65-83`) reserves only JS keywords +
`constructor` (`utils.ts:2-58`). `txFromJSON` and `txFromXDR` are not reserved,
contain no characters outside `[a-zA-Z0-9_$]`, do not start with a digit, and are
not all-underscore, so both pass through unchanged (`utils.ts:67-82`).

`txFromJSON` and `txFromXDR` are own instance arrow-function fields
(`client.ts:201`, `client.ts:214`). Under TypeScript class-field emit these
initializers run before the explicit constructor body in both native-field
(`useDefineForClassFields: true`) and downlevel emit; the `forEach` loop is the
last body statement and therefore overwrites the previously-initialized own
field. The loop skips only `CONSTRUCTOR_FUNC` (`client.ts:107`) and performs no
already-present check at `client.ts:131`.

## Findings

A spec function literally named `txFromJSON` (or `txFromXDR`) replaces the SDK's
own deserialization method with an `assembleTransaction` wrapper. When the app
later calls `client.txFromJSON(storedJson)` to rehydrate a previously-built
`AssembledTransaction`, it instead invokes the contract-method wrapper:
`AssembledTransaction.build({ method: "txFromJSON", args: spec.funcArgsToScVals("txFromJSON", json) ... })`.
This is remote/spec trust confusion: remote contract-spec data silently
overrides a core SDK API surface that the application relies on for an unrelated
purpose. Outcome ranges from a broken rehydrate (the wrapper receives a JSON
string where `funcArgsToScVals` expects a named-args Record and throws — most
reliable) to building an unintended contract call when the shadowing function has
zero declared inputs (`client.ts:132-134`, wrapper called with `args=undefined`).
Severity floor is Medium (security-significant integrity loss / unsafe
application behavior via remote-response trust confusion); not High because the
most reliable outcome is failed/incorrect deserialization rather than guaranteed
malicious submission.

## PoC Guidance

- **Test file**: append to an existing `test/unit/contract_client*` unit test (mock spec).
- **Setup**: build a `Spec` whose function list includes a function named
  `txFromJSON` (and a second case `txFromXDR`); construct `new Client(spec, options)`
  with a mock `server`/`rpcUrl` so the constructor completes.
- **Steps**: after construction, read `typeof client.txFromJSON`.
- **Assertion**: assert the own field was overwritten — e.g. `client.txFromJSON`
  is no longer the original deserializer (calling it with a valid stored-tx JSON
  string throws or routes into `AssembledTransaction.build` with
  `method === "txFromJSON"`), demonstrating the deserializer was replaced by spec
  data.

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
rules_out = ["source trace confirms sanitizeIdentifier reserved list (utils.ts:2-58) excludes txFromJSON/txFromXDR and the constructor loop (client.ts:131) has no already-present guard, so the own deserializer field is overwritten by spec data"]
does_not_rule_out = ["sibling overwrite of spec/options state (C2)", "collision between two distinct contract function names (C4)"]
assumptions = ["spec function names are attacker-controlled under the established trust boundary: RPC-substitutable wasm with no sha256(wasm)==wasmHash check (route js-sdk-d6ede4f50f471c78ff302843) and direct app-supplied wasm via Client.fromWasm", "ScSymbol decodes as xdr.string(32) with no character-set validation (curr_generated.js:9464,10162)", "constructor forEach runs after instance field/parameter-property initialization under TS class-field emit"]
mechanism_brief = "spec function named txFromJSON/txFromXDR sanitizes unchanged and the constructor forEach (run after field init) overwrites the own deserializer instance field with a contract-method wrapper"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "reserved list (utils.ts:2-58) covers only JS keywords + constructor; txFromJSON/txFromXDR are not reserved and pass through unchanged"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:Client.constructor"
guarantee = "no already-present/reserved-member check prevents a spec function name from overwriting the txFromJSON/txFromXDR own instance fields at client.ts:131"
```
