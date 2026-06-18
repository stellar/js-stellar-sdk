# R976C4: Lossy `sanitizeIdentifier` collapses distinct contract function names to one client method (interface misrepresentation)

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/976-hypothesis-batch.md
**Candidate ID**: C4
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Path: `Client.from` / `Client.fromWasmHash` -> `Client.fromWasm` ->
`Spec.fromWasm(wasm)` -> `new Client(spec, options)`. Spec function names are
attacker-controlled (un-verified wasm hash, prior VIABLE
`js-sdk-d6ede4f50f471c78ff302843`).

`ScSpecFunctionV0.name` is an XDR `string<30>`, not a restricted Soroban
`Symbol`, so it may contain arbitrary bytes (`-`, `.`, spaces, etc.). The
constructor loop maps each function to a client method by sanitized key:

- `src/bindings/utils.ts:67` `identifier.replace(/[^a-zA-Z0-9_$]/g, "_")` is a
  many-to-one (lossy) mapping with no collision detection or de-duplication
  anywhere in `sanitizeIdentifier` (`utils.ts:65-83`).
- `src/contract/client.ts:131` `this[sanitizeIdentifier(method)] = wrapper`
  assigns by sanitized key with no already-present/duplicate check, so when two
  distinct raw names sanitize to the same key the **last-iterated entry wins**
  (last-write).
- The surviving wrapper closes over the **raw** `method` string
  (`client.ts:106,115-116,127`), so the executed call uses
  `funcArgsToScVals(rawName, ...)` (`spec.ts:590-593`) and
  `parseResultXdr -> spec.funcResToNative(rawName, ...)` (`client.ts:126-127`) —
  i.e. it invokes the surviving raw-named function, not the name the app reasoned
  about.

Example: spec exports both `transfer_fee` and `transfer-fee`. Both sanitize to
`transfer_fee`. `client.transfer_fee` exists once and dispatches to whichever
raw entry was iterated last (spec order is attacker-controlled).

## Findings

This is a contract-interface-integrity / type-confusion bug:
`client.<name>` can invoke a different on-chain function than the spec/UI/review
displays. The material High-severity scenario is any consumer that makes a
security decision from the enumerated spec names — a wallet/UI that lists
`spec.funcs()` names for user approval, or a name-based method allowlist — while
the dynamically generated client exposes only one collapsed method that
dispatches to the attacker-chosen raw function. The user/allowlist approves
`transfer_fee` (the benign name shown) but the invoked function is the colliding
malicious raw entry, leading to a transaction with materially different
semantics that the app may sign and submit. This matches the IMPACT category
"methods that misrepresent the contract interface" (High floor).

The conditionality (it requires a name-enumerating display/allowlist to be the
deceived party; a fully malicious contract could otherwise just name its
malicious function directly) is why confidence is calibrated medium rather than
high, but the bug — lossy mapping + last-write with no de-dup — is source-proven.

## PoC Guidance

- **Test file**: focused Vitest unit under `test/unit/` (no network).
- **Setup**: build a `Spec` containing two function entries, e.g. `transfer-fee`
  (with one distinguishing input/return) and `transfer_fee`, plus
  `new Client(spec, options)`.
- **Steps**: enumerate `spec.funcs().map(f => f.name().toString())` to show two
  distinct names; then inspect the client's own keys.
- **Assertion**: assert that the client exposes only a single `transfer_fee`
  method (collision), and that invoking `client.transfer_fee(args)` builds an
  `AssembledTransaction` whose `method` equals the last-iterated raw name
  (e.g. `transfer-fee`), proving the displayed name and invoked function diverge.

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
rules_out = ["sanitizeIdentifier (utils.ts:65-83) performs lossy many-to-one mapping with no collision detection; constructor loop (client.ts:105-135) has no already-present/de-dup check so last-write wins and the wrapper dispatches by raw method name", "prior NOT_VIABLE js-sdk-25ba1e1365cc508195eff159 scoped only the parser cluster and deferred the constructor sink, so not a typed duplicate"]
does_not_rule_out = ["shadowing of SDK own members txFromJSON/txFromXDR (C1)", "spec/options state corruption (C2)", "__proto__ prototype replacement (C3)"]
assumptions = ["spec function names attacker-controlled per js-sdk-d6ede4f50f471c78ff302843", "a consumer makes a security decision from enumerated spec.funcs() names (wallet display, review, or name allowlist)"]
mechanism_brief = "two distinct ScSpecFunctionV0 string<30> names sanitize to one JS key; constructor assigns by sanitized key with no de-dup so last-write wins, and the surviving wrapper invokes the raw function name, diverging from the displayed/approved name"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "checked guard does not block this exact candidate path: lossy [^a-zA-Z0-9_$]->_ mapping has no collision detection"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:Client.constructor"
guarantee = "no de-duplication or already-present check exists in the constructor forEach (client.ts:105-135)"
```
