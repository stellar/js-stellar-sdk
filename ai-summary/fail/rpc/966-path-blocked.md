# F966: Path blocked: deeply nested server-controlled ScVal recursion (catchable RangeError, below Medium)

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/966-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> nativeToScVal` (seed identity), and the symbol the residual
question actually points at: `getSACBalance -> scValToNative` recursion at
`src/base/scval.ts:398,405-407`.

## Blocker

Resolved to a concrete **no (not Medium+)**. The seed sink `nativeToScVal`
(encode direction) is reached only with caller-supplied input: at
`server.ts:1447` the key is built from a constant `"Balance"` symbol plus the
StrKey-validated caller address, so a remote server cannot drive deep encode
recursion. The residual line numbers (398, 405-407) are in the decode direction
`scValToNative`, whose `scvVec`/`scvMap` cases recurse with no depth guard and
are reachable from server-controlled data at `server.ts:1476`. That recursion is
genuinely unguarded, but its only material effect is a single **catchable**
`RangeError` (stack overflow): depth is self-limited by the V8 call stack, CPU
and memory are bounded, the throw propagates through the `await` chain to the
caller's `getSACBalance` call as a rejected promise (catchable with try/catch),
and the XDR decode in `getLedgerEntries` would itself overflow first. The server
already fully controls the SAC balance value with no signature or cross-check,
so the throw grants no integrity or capability gain — local-only inconvenience,
rated Low, below the objective Medium minimum. The sink is a synchronous throw,
not a queue/cache/timer, so repeated responses yield independent catchable
throws with no accumulation.

## Evidence

- `src/base/scval.ts:398` - `scvVec` case: `(scv.vec() ?? []).map(scValToNative)` recurses with no depth bound.
- `src/base/scval.ts:405-407` - `scvMap` case recurses on each key and value with no depth bound.
- `src/rpc/server.ts:1476` - `scValToNative(val.contractData().val())` runs on server-controlled ledger-entry XDR inside an `async` method, so the RangeError surfaces as a catchable rejected promise.
- `src/rpc/server.ts:1447-1449` - `nativeToScVal` (the seed sink) input is a constant symbol plus the validated caller address, not remote-controlled depth.

## Negative Scope

- Rules out: deeply nested server-controlled ScVals producing a catchable single-call `RangeError` via `scValToNative` (scval.ts:398,405-407) reached from `getSACBalance` (server.ts:1476) as Medium+; and `nativeToScVal` (server.ts:1447) encode recursion being remotely exploitable.
- Does not rule out: the depth-bounded `Spec.scValToNative`/`Spec.nativeToScVal` recursion in `src/contract/spec.ts` (contract subsystem, different code path) or any genuinely unbounded (non-self-terminating) processing elsewhere in the rpc response parsers.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-7aea41b1dd99d10a80ac9754"
weakness = "contract_spec_conversion"
record_kind = "residual_escalation"
path = ["<anonymous>", "nativeToScVal"]
sink = "nativeToScVal"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "re-investigate residual lead"
target_functions = ["src/base/scval.ts:scValToNative", "src/rpc/server.ts:getSACBalance", "src/base/scval.ts:nativeToScVal"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["scValToNative_deep_recursion_catchable_rangeerror_below_medium", "nativeToScVal_encode_input_caller_controlled_not_remote"]
rules_out = ["deeply nested server-controlled ScVal causing a catchable single-call RangeError via scValToNative recursion (src/base/scval.ts:398,405-407) reached from getSACBalance (src/rpc/server.ts:1476) as Medium+", "nativeToScVal encode recursion (src/rpc/server.ts:1447) being remotely exploitable for deep recursion"]
does_not_rule_out = ["depth-bounded Spec.scValToNative/Spec.nativeToScVal recursion in src/contract/spec.ts (contract subsystem)", "genuinely unbounded non-self-terminating processing elsewhere in rpc response parsers"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Unguarded recursion in scValToNative scvVec/scvMap (scval.ts:398,405-407) on server-controlled ledger-entry ScVal at server.ts:1476 yields only a catchable, self-limiting RangeError; the named encode sink nativeToScVal takes caller-controlled constant+validated-address input."
why_failed_brief = "Material effect is a catchable single-call RangeError (Low, below Medium minimum); recursion is self-limited by the JS call stack, throw is catchable via the async caller, no accumulation across responses, and the server already controls the value so no capability gain; encode-direction nativeToScVal is not remote-controlled."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "input_validation"
guarantee = "nativeToScVal encode sink at server.ts:1447 receives a constant 'Balance' symbol plus a StrKey.isValidContract-validated address (server.ts:1435), so remote input cannot drive deep encode recursion"

[[sanitizer_guarantees]]
kind = "runtime_behavior"
guarantee = "scValToNative deep recursion terminates with a catchable RangeError bounded by the V8 call stack; thrown inside async getSACBalance it surfaces as a rejected promise the caller can try/catch, and XDR decode in getLedgerEntries would overflow first"

[[blockers]]
kind = "severity_threshold"
guarantee = "the only material effect is a catchable, self-limiting single-call RangeError with no integrity or capability gain (server already controls the value), rated Low and below the objective Medium minimum"
```
