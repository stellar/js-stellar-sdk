# F950: Path blocked: unbounded scValToNative recursion on deeply nested server ScVal in getSACBalance

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/950-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`getSACBalance -> scValToNative (residual recursion sink at server.ts:1476)`

Seed structured sink is `nativeToScVal` (the forward key build at server.ts:1447,
already ruled out by prior route js-sdk-db5293e0ca099d54e84903a3 record [1]).
The escalated residual question targets `scValToNative` recursion, so the
material sink traced here is `scValToNative` at `server.ts:1476`, with the seed
path/sink identity preserved in the trailing index.

## Blocker

The technical lead is *confirmed*: `scValToNative` (`src/base/scval.ts:375-485`)
recurses with no depth parameter, no depth guard, and no try/catch — `scvVec`
maps `scValToNative` over elements (line 398) and `scvMap` recurses into each
key and val (lines 405-407). A malicious RPC server can therefore deliver a
deeply nested ScVal in the SAC balance contract-data value (`server.ts:1476`,
`val.contractData().val()`) and force recursion to the nesting depth. However,
the *only* material effect is a catchable `RangeError` (stack overflow) thrown
synchronously inside the async `getSACBalance` and surfaced as a rejected
promise on a single call. This is a catchable single-call availability throw
rated Low, below the objective Medium floor. The remote server already fully
controls the entire balance response with validly-typed ScVals, so throwing
instead of returning a value grants no new capability. Work is linear in the
RPC-response-bounded XDR size (only stack depth, not memory/CPU, is at issue),
and no SDK queue/cache/timer/retry accumulates the value across calls
(`server.ts:411-413` dispatches once; no internal loop), so the
resource-exhaustion accumulation analysis yields nothing.

## Evidence

- `src/base/scval.ts:375-409` - `scValToNative` recurses on `scvVec` (398) and `scvMap` key/val (405-407) with no depth guard or try/catch; recursion depth equals attacker-chosen ScVal nesting depth.
- `src/rpc/server.ts:1476` - the recursion input `scValToNative(val.contractData().val())` is the remote-server-controlled SAC contract-data ScVal; the XDR is already decoded by `getLedgerEntries` (js-xdr would itself catchably overflow first on equally deep input), so this sink is not even uniquely first.
- `src/rpc/server.ts:411-413` - sole internal caller dispatches `getSACBalance` exactly once with no loop/batch; result is returned synchronously and not stored, so no accumulation across events.

## Negative Scope

- Rules out: unbounded `scValToNative` recursion on a deeply nested server-controlled SAC balance ScVal (`server.ts:1476`) as a Medium+ finding — its only material effect is a catchable single-call `RangeError` (Low) and the server already controls the response value, granting no new capability.
- Does not rule out: an uncaught-promise-rejection process-exit if the application omits `await`/`catch` on `getSACBalance` (documented caller responsibility, out of scope); the same catchable deep-nesting `RangeError` reachable through other `scValToNative` consumers (e.g. `src/contract/spec.ts` result decoding) under their own scope.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-db5293e0ca099d54e84903a3"
weakness = "contract_spec_conversion"
record_kind = "residual_escalation"
path = ["getSACBalance", "nativeToScVal"]
sink = "nativeToScVal"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/server.ts:getSACBalance", "src/base/scval.ts:scValToNative", "src/rpc/server.ts:nativeToScVal"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["scValToNative_recursion_catchable_rangeerror_low", "balance_value_server_controlled_no_new_capability"]
rules_out = ["unbounded scValToNative recursion on deeply nested server-controlled SAC balance ScVal (src/base/scval.ts:398,405-407 via src/rpc/server.ts:1476) as Medium+: depth-bounded recursion is genuinely unguarded but its only material effect is a catchable single-call RangeError (Low) and the server already fully controls the response value, so no new capability is granted"]
does_not_rule_out = ["uncaught-promise-rejection process exit when caller omits await/catch on getSACBalance (documented caller responsibility)", "same catchable deep-nesting RangeError via other scValToNative consumers such as src/contract/spec.ts result decoding under their own scope"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "scValToNative recurses on scvVec/scvMap with no depth guard; a malicious RPC server can nest the SAC balance ScVal deeply to force a stack-overflow RangeError in a single getSACBalance call"
why_failed_brief = "recursion is genuinely unbounded but the only material effect is a catchable single-call RangeError (Low, below Medium floor) and the server already controls the response value so no new capability is granted"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "getSACBalance dispatches scValToNative exactly once per call with no internal loop/batch (server.ts:411-413) and the result is returned synchronously, not stored; no SDK queue/cache/timer accumulates the value across events"

[[blockers]]
kind = "severity_floor"
guarantee = "the only material effect is a catchable single-call RangeError (stack overflow), rated Low and below the objective Medium minimum; the remote server already fully controls the balance response with valid ScVals so throwing grants no new capability"
```
