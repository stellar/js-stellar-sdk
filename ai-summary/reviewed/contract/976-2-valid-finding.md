# R976C2: Spec function named `spec`/`options` overwrites Client trust state

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/976-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

`Client.constructor` declares `public readonly spec: Spec` and
`public readonly options: ClientOptions` as parameter properties
(`src/contract/client.ts:92-94`); these become own data properties assigned at
the top of the constructor body. The constructor then runs
`this.spec.funcs().forEach(...)` and, at `client.ts:131`, assigns
`this[sanitizeIdentifier(method)] = wrapper` with no already-present check
(only `__constructor` is skipped, client.ts:107).

`sanitizeIdentifier` (`src/bindings/utils.ts:65-83`) does not reserve the instance
state names `spec` or `options` (the reserved list at `utils.ts:2-58` is JS
keywords + `constructor`). Both names contain only `[a-zA-Z0-9_$]`, are not
keywords, do not start with a digit, and are not all-underscore, so they pass
through unchanged. The spec function name is attacker-controlled: `ScSymbol`
decodes as `xdr.string(32)` with no character validation
(`src/base/generated/curr_generated.js:9464,10162`), and the wasm is
RPC-substitutable (no sha256 check, prior VIABLE `js-sdk-d6ede4f50f471c78ff302843`)
or app-supplied via `Client.fromWasm`.

The loop body reads the closure parameter `spec` (`client.ts:116,127`), not
`this.spec`, and `this.spec.funcs()` is evaluated once before iteration begins
(`client.ts:105`), so overwriting `this.spec`/`this.options` mid-loop does not
break the loop — the corruption is latent and surfaces only on later instance use.

## Findings

A spec function named `spec` or `options` overwrites the readonly parameter
property with a wrapper function. Every later operation that reads `this.spec` or
`this.options` then misbehaves: `txFromJSON` reads `this.options` and
`this.spec.funcResToNative` (`client.ts:205,208`) and `txFromXDR` reads
`this.options`/`this.spec` (`client.ts:215`); with `this.spec` now a function,
`this.spec.funcResToNative` is `undefined` and the call throws. This is
remote/spec trust confusion: remote contract-spec data silently corrupts the
Client's own trust/config state, breaking subsequent decode/sign/submit
operations on that Client. Severity floor Medium (security-significant integrity
loss without direct fund loss); the primary realized outcome is integrity
corruption / denial of the constructed Client's deserialization path rather than
guaranteed malicious submission. Distinct from C1 (which overwrites the
deserializer method itself) by target member, though both stem from the same
missing reserved-member guard in the constructor loop.

## PoC Guidance

- **Test file**: append to an existing `test/unit/contract_client*` unit test (mock spec).
- **Setup**: build a `Spec` whose function list includes a function named `spec`
  (second case: `options`); construct `new Client(spec, options)` with a mock
  `server`/`rpcUrl`.
- **Steps**: after construction, inspect `client.spec` / `client.options`.
- **Assertion**: assert `typeof client.spec === "function"` (state overwritten),
  and that a subsequent `client.txFromXDR(validBase64)` or `client.txFromJSON`
  throws because `this.spec.funcResToNative` is no longer callable.

```toml-index
schema = 1
verdict = "VIABLE"
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
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms sanitizeIdentifier does not reserve spec/options (utils.ts:2-58) and the constructor loop reads the closure parameter spec (client.ts:116,127) so it does not self-break, leaving this.spec/this.options overwritable with no guard (client.ts:131)"]
does_not_rule_out = ["deserializer-method shadowing (C1)", "two-name collision interface misrepresentation (C4)"]
assumptions = ["spec function names are attacker-controlled under the established RPC-substitutable-wasm trust boundary (route js-sdk-d6ede4f50f471c78ff302843) and direct app-supplied wasm via Client.fromWasm", "ScSymbol decodes as xdr.string(32) with no character-set validation (curr_generated.js:9464,10162)", "constructor forEach body runs after parameter-property assignment of this.spec/this.options"]
mechanism_brief = "spec function named spec/options overwrites the readonly Client parameter-properties via the constructor forEach assignment, latently corrupting later decode/sign/submit that read this.spec/this.options"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "reserved list (utils.ts:2-58) does not include the instance state names spec/options; both pass through unchanged"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:Client.constructor"
guarantee = "no already-present/reserved-member check prevents overwriting this.spec/this.options in the constructor forEach (client.ts:131)"
```
