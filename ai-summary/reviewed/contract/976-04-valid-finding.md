# R97604: Lossy `sanitizeIdentifier` collapses two distinct spec function names to one client method (interface misrepresentation)

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/976-hypothesis-batch.md
**Candidate ID**: C4
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Path: `Client.from` / `Client.fromWasmHash` / `Client.fromWasm` → `Spec.fromWasm(wasm)` → `new Client(spec, options)`.

Traced in current source:

- `src/bindings/utils.ts:67`: `sanitizeIdentifier` performs a lossy mapping —
  `identifier.replace(/[^a-zA-Z0-9_$]/g, "_")` — collapsing every character
  outside `[a-zA-Z0-9_$]` to `_`. Many distinct inputs map to one output (e.g.
  `transfer-fee`, `transfer.fee`, `transfer fee` all → `transfer_fee`, which also
  equals the already-legal `transfer_fee`). There is no collision detection or
  de-duplication anywhere in `sanitizeIdentifier`.
- `src/contract/client.ts:105-135`: the constructor `forEach` iterates
  `this.spec.funcs()` in spec order and assigns `this[sanitizeIdentifier(method)]
  = wrapper` (`:131`) with no already-present check. The last colliding entry
  therefore wins (last-write).
- `src/contract/client.ts:106,115-116,127`: each wrapper closes over the **raw**
  `method` string and uses it for `spec.funcArgsToScVals(method, args)` and
  `AssembledTransaction.build({ method })` / `spec.funcResToNative(method, ...)`.
  So the surviving `client.<sanitizedName>` invokes whichever **raw** name was
  last written, not necessarily the name the application reasoned about.
- `ScSpecFunctionV0.name` is an XDR `string<30>` (no Soroban-Symbol charset
  restriction at the SDK XDR-decode layer), so a crafted/substituted spec may
  legitimately carry both `transfer-fee` and `transfer_fee` (or any collision
  pair) up to 30 bytes each.

The wasm/spec is attacker-controlled (no `sha256(wasm)==wasmHash` check before
spec decode, per prior VIABLE `js-sdk-d6ede4f50f471c78ff302843`).

## Findings

Two distinct on-chain functions collapse to one client method; the method that
survives invokes only one of them, and which one is non-obvious (spec iteration
order). The material High-floor case is **interface misrepresentation that
defeats name-based review or display**: a wallet/UI/allowlist that enumerates
`spec.funcs()` shows two functions (`transfer-fee` and `transfer_fee`), and a
reviewer or user authorizing `client.transfer_fee` believes they invoke the
reviewed function — but the generated binding routes that single accessible
method to the other (last-written) raw name. This matches the objective's
High impact category "bindings generated from attacker-controlled spec data
produce methods/types that misrepresent the contract interface."

This is distinct from "the operator could just make the named function
malicious": the value here is specifically that the binding presents a faithful
two-function interface while only one function is reachable under a name the
auditor trusts, bypassing a name allowlist / review / display layer. Severity
High; confidence held at medium because realized fund movement depends on a
downstream name-based trust layer plus a sign+submit.

Distinct from prior memory: the parser-cluster record
`js-sdk-25ba1e1365cc508195eff159` deferred the constructor question; this sink is
`Client.constructor` and the weakness is the lossy-sanitize + last-write
collision, not the parser bounds or the sha256 gap.

## PoC Guidance

- **Test file**: append a focused Vitest test under `test/unit` near existing
  contract `Client` constructor tests; mock the spec, no network.
- **Setup**: construct a `Spec` (or stub of `funcs()`/`getFunc()`/
  `funcArgsToScVals`/`funcResToNative`/`errorCases`) whose `funcs()` returns two
  entries with `name()` values `"transfer-fee"` then `"transfer_fee"` (distinct
  raw names that sanitize identically), with differing inputs so the executed
  function is observable.
- **Steps**: `const c = new Client(spec, options); c.transfer_fee(args)`.
- **Assertion**: assert only one own key `transfer_fee` exists on `c`, and that
  invoking `c.transfer_fee(...)` builds an `AssembledTransaction` whose `method`
  equals the **last** raw spec name (`"transfer_fee"`), demonstrating the
  earlier-listed `"transfer-fee"` function is unreachable yet still present in
  `spec.funcs()` — i.e. the displayed interface differs from the callable one.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-25ba1e1365cc508195eff159"
weakness = "lossy_sanitizeIdentifier_method_name_collision"
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
rules_out = ["source trace confirms sanitizeIdentifier (utils.ts:67) is lossy with no collision detection and the constructor forEach (client.ts:131) has no already-present check, so two distinct raw names collapse to one last-write key while the wrapper invokes the surviving raw method (client.ts:106,116,127) — no guard blocks this"]
does_not_rule_out = ["shadowing of SDK own deserializer members (C1)", "overwrite of spec/options state (C2)", "prototype mutation via __proto__ (C3)"]
assumptions = ["attacker controls the spec function name set (no-sha256 enabler js-sdk-d6ede4f50f471c78ff302843)", "a downstream name-based review/allowlist/display enumerates spec.funcs() names and trusts the sanitized client method name"]
mechanism_brief = "lossy sanitizeIdentifier maps two distinct ScSpecFunctionV0 string<30> names to one JS key; last-write wins in the constructor loop and client.<name> invokes a different raw contract function than the displayed interface implies"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier performs lossy [^a-zA-Z0-9_$]->_ mapping (utils.ts:67) with no collision detection or de-duplication"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:Client.constructor"
guarantee = "no de-duplication or already-present check in the constructor loop (client.ts:105-135); the last colliding sanitized key overwrites the earlier one"
```
