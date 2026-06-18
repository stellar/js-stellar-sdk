# F969: Path blocked: SAC balance helper conversion boundary (nativeToScVal / scValToNative)

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/969-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`getSACBalance -> nativeToScVal`

Area seed; sibling targets `scValToNative`, `nativeToScVal`, `<anonymous>` also dispositioned below.

## Blocker

For the seed sink `nativeToScVal` (server.ts:1447-1449) the arguments are the constant symbol `"Balance"` plus `addressString`, the caller-supplied `address` already constrained by `StrKey.isValidContract` (server.ts:1435). The remote RPC server has no influence on these arguments, so it cannot make the forward conversion build a key for a victim the caller did not choose. The only remote-fed value, the passphrase from `getNetwork()` (server.ts:1441), feeds `sac.contractId()` (server.ts:1444), not `nativeToScVal`; tampering only redirects the query to a contract the same malicious server then answers, granting no new capability. For the return sibling `scValToNative` (server.ts:1476), the server is the sole source of truth for the balance with no signature or cross-check, so decoding confusion grants no capability beyond returning validly-typed values; the map decode at scval.ts:403-409 uses `Object.fromEntries` (CreateDataProperty), so a `"__proto__"` key is an own property, not prototype pollution.

## Evidence

- `src/rpc/server.ts:getSACBalance:1435` - caller `address` is gated by `StrKey.isValidContract` before any conversion.
- `src/rpc/server.ts:getSACBalance:1447-1449` - `nativeToScVal(["Balance", addressString], {type:["symbol","address"]})` takes only the constant symbol and the validated caller address; no remote-response input reaches it.
- `src/rpc/server.ts:getSACBalance:1481-1490` - balanceEntry is returned verbatim from server-decoded data with no signature/cross-check, so the server already controls balance semantics.
- `src/base/scval.ts:scValToNative:403-409` - ScMap decode via `Object.fromEntries` defines own properties, so attacker map keys cannot pollute `Object.prototype`.

## Negative Scope

- Rules out: remote-server or caller influence on the forward `getSACBalance -> nativeToScVal` key conversion producing a wrong/forged ledger key as a Medium+ contract-interface-integrity finding.
- Does not rule out: deeply nested server ScVal causing unbounded `scValToNative` recursion (catchable RangeError, Low) on `getSACBalance`; and `scValToNative`/`nativeToScVal` reachability from other non-SAC callers (contract bindings, event/invoke result decoding) outside this route.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-db5293e0ca099d54e84903a3"
weakness = "contract interface integrity"
record_kind = "area_seed"
path = ["getSACBalance", "nativeToScVal"]
sink = "nativeToScVal"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "contract_spec_conversion"
target_functions = ["src/rpc/server.ts:getSACBalance", "src/base/scval.ts:nativeToScVal", "src/base/scval.ts:scValToNative"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["nativeToScVal_args_caller_controlled_and_strkey_validated", "balance_value_server_controlled_no_new_capability", "object_fromentries_createdataproperty_no_proto_pollution"]
rules_out = ["remote-server or caller influence on the getSACBalance->nativeToScVal forward key conversion (server.ts:1447-1449) producing a wrong/forged ledger key as Medium+; args are a constant symbol plus the StrKey-validated caller address (server.ts:1435) with no remote input"]
does_not_rule_out = ["unbounded scValToNative recursion on deeply nested server ScVal (catchable RangeError, Low)", "scValToNative/nativeToScVal reached from non-SAC callers such as contract bindings or invoke/event result decoding"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "getSACBalance forward conversion feeds nativeToScVal only the constant Balance symbol and the StrKey-validated caller address; the return path scValToNative decodes a server-controlled ScVal where the server is already the sole source of truth, so neither direction yields a new contract-interface-integrity capability."
why_failed_brief = "nativeToScVal args are caller-controlled and validated with no remote influence; scValToNative return is fully server-controlled with no integrity reference, and Object.fromEntries avoids prototype pollution, so only Low catchable-throw effects remain."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "getSACBalance gates the caller address with StrKey.isValidContract before nativeToScVal (server.ts:1435)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "scValToNative ScMap decode uses Object.fromEntries CreateDataProperty semantics, so attacker map keys define own properties and cannot pollute Object.prototype (scval.ts:403-409)"

[[blockers]]
kind = "no_new_capability"
guarantee = "the remote server is the sole source of truth for the SAC balance with no signature or cross-check (server.ts:1481-1490), so conversion confusion in either direction grants no capability beyond returning validly-typed values"
```
