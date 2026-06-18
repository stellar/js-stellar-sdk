# R976C4: Lossy `sanitizeIdentifier` collision maps two spec functions to one client method

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/976-hypothesis-batch.md
**Candidate ID**: C4
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

`sanitizeIdentifier` maps every character outside `[a-zA-Z0-9_$]` to `_`
(`src/bindings/utils.ts:67`) with no collision detection or de-duplication. The
spec function name is `ScSymbol` = `xdr.string(32)`
(`src/base/generated/curr_generated.js:9464,10162`); the XDR decoder enforces
only the byte length, not the Soroban symbol character set, so two distinct names
such as `transfer_fee` and `transfer-fee` are both valid in a crafted spec and
both sanitize to `transfer_fee`.

The constructor loop assigns by sanitized key with no already-present check
(`src/contract/client.ts:131`), so the later-iterated colliding entry overwrites
the earlier one (last-write-wins). Each iteration builds a fresh wrapper closing
over its own raw `method` (`client.ts:106,110-128`): the surviving wrapper calls
`spec.funcArgsToScVals(method, args)` (client.ts:116) and
`AssembledTransaction.build({ method })` (client.ts:114-115) with the raw name of
whichever entry won. Therefore `client.transfer_fee(args)` invokes the on-chain
function whose raw name was iterated last, which may differ from the name the
application/reviewer reasoned about.

## Findings

This is a contract-binding name-confusion gap: an attacker-crafted spec (the
trust boundary is established — RPC-substitutable wasm with no sha256 check,
route `js-sdk-d6ede4f50f471c78ff302843`, or app-supplied wasm via
`Client.fromWasm`) can include two function names that collapse to one client
identifier, so the generated method silently invokes a different on-chain
function than its name represents. The material security case is defeating a
defensive layer that enumerates `spec.funcs()` names (allowlist, review, or
wallet display) while the executed invocation follows the surviving raw name —
i.e. the method misrepresents the contract interface.

I downgrade the candidate's claimed High to **Medium**. The robust,
always-present impact is contract binding name/type confusion, which the severity
scale lists at Medium. The High interpretation (silent execution of a different
function than the one reviewed) requires a name-based allowlist/review layer to
exist and to be the security gate; note also that a fully attacker-authored
contract could make the directly-named function malicious without a collision, so
the collision's distinct value is precisely the allowlist/display-bypass framing.
That keeps the floor at Medium rather than High. It remains VIABLE: the lossy
mapping, absence of de-duplication, and last-write-wins are all source-proven and
reachable under the established trust boundary; collisions cannot arise from a
genuinely on-chain-deployed contract (host enforces symbol chars) but can from a
crafted/substituted spec, which is in scope.

## PoC Guidance

- **Test file**: append to an existing `test/unit/contract_client*` unit test (mock spec).
- **Setup**: build a `Spec` whose function list contains two functions,
  `transfer_fee` and `transfer-fee`, in a known order, each with the same input
  arity; construct `new Client(spec, options)` with a mock `server`/`rpcUrl`.
- **Steps**: call `client.transfer_fee(args)` and capture the built
  `AssembledTransaction` / the `method` passed to `AssembledTransaction.build`.
- **Assertion**: assert the built operation's invoked function name equals the
  later-iterated raw name (`transfer-fee`), not `transfer_fee`, demonstrating the
  client method invokes a different function than its identifier displays.

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
rules_out = ["source trace confirms sanitizeIdentifier performs a lossy [^a-zA-Z0-9_$]->_ mapping with no collision detection (utils.ts:67) and the constructor loop has no de-duplication/already-present check (client.ts:131), so two distinct raw spec names collapse to one client method with last-write-wins and the wrapper executes the surviving raw name (client.ts:114-116)"]
does_not_rule_out = ["shadowing of SDK own members txFromJSON/txFromXDR (C1)", "overwrite of spec/options state (C2)"]
assumptions = ["spec function names are attacker-controlled via crafted/RPC-substituted wasm (route js-sdk-d6ede4f50f471c78ff302843) or app-supplied wasm; collisions require a crafted spec because on-chain-deployed contracts have host-validated symbol names", "ScSymbol decodes as xdr.string(32) with no character-set validation (curr_generated.js:9464,10162)", "the material High-vs-Medium boundary depends on whether a spec-name allowlist/review/display layer is the security gate; absent that, impact is binding name/type confusion at Medium"]
mechanism_brief = "lossy sanitizeIdentifier maps two distinct ScSymbol string<32> names to one JS key; last-write-wins and client.<name> invokes a different raw contract function than the identifier displays, bypassing spec-name allowlist/review/display"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "sanitizeIdentifier performs lossy [^a-zA-Z0-9_$]->_ mapping with no collision detection (utils.ts:67)"

[[blockers]]
kind = "not_found"
source = "src/contract/client.ts:Client.constructor"
guarantee = "no de-duplication or already-present check in the constructor loop (client.ts:105-135); last colliding entry overwrites the earlier one at client.ts:131"
```
