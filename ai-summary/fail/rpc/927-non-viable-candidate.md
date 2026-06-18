# F927: getSACBalance returns uncoerced scValToNative balance fields

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/927-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate's source claims are accurate and current-source verified:

- `src/rpc/server.ts:1476` — `const entry = scValToNative(val.contractData().val());`
  passes the remote `contractData` ScVal directly into native conversion.
- `src/rpc/server.ts:1481-1490` — the SAC branch returns
  `amount: entry.amount.toString()`, `authorized: entry.authorized`,
  `clawback: entry.clawback` with no presence check, type guard, or `Boolean()`
  coercion; the comment at 1478-1480 states the structure is "presumed."
- `src/rpc/server.ts:400-409` — the sibling trustline branch does emit
  `tl.balance().toString()` and `Boolean(tl.flags() & 0x1)`.
- `src/base/scval.ts:375-480` — `scValToNative` faithfully maps each ScVal type
  to its native shape; `scvMap` (403-409) is built via `Object.fromEntries`,
  passing every map value through verbatim, and bool/u32/i32/bytes (412-416)
  return distinct native primitives.

So the structural difference between the two branches is real: the trustline
branch consumes an XDR-typed `TrustLineEntry` whose `balance()`/`flags()` are
statically Int64/Uint32, so its "coercion" is mere type extraction from a
strongly-typed record — not a defensive validation. The SAC branch consumes a
dynamically-typed `ScVal`, which XDR decoding only guarantees to be *a* valid
ScVal, not a SAC `BalanceEntry`-shaped map.

## Why It Failed

The candidate does not reach the objective's Medium severity floor.

1. **Trigger requires a malicious/compromised RPC server**, which is in scope
   under the `remote_rpc_server` trust boundary — but under that exact threat
   model the server *already has complete semantic control* over the balance
   entry using correctly-typed ScVals. It can return `authorized = ScBool(true)`
   or `ScBool(false)`, `clawback` either way, and any `ScI128` `amount`. The
   missing coercion therefore grants no *new* security capability:
   - `if (entry.authorized)` is truthy for a valid `ScBool(true)` just as for an
     attacker's truthy object/string; a falsy outcome is reproducible with
     `ScBool(false)` or `ScVoid`. The type-confused value changes no decision
     that a validly-typed malicious value could not already force.
   - `amount` is always `.toString()`-ed, and the attacker already controls its
     numeric content fully via a valid i128.

2. **No SDK decode bug exists.** `scValToNative` correctly represents whatever
   ScVal it is given; with an honest server and a real SAC the output is exactly
   right. The "wrongness" is entirely the server's asserted state, not an SDK
   mis-decode, so this is not a "response decoded into a materially wrong ledger
   entry" in the sense the impact table targets.

3. **No implied integrity contract is broken.** Unlike the prior VIABLE
   wasm-by-hash finding (where content-addressing implies a
   `sha256(bytes)==hash` check the SDK omits), the SDK never promises and cannot
   verify the authenticity of server-asserted balance state, so there is no
   missing guard whose absence is a security defect.

4. **The only incremental effect is Low/out-of-scope.** A non-i128 `amount`
   value would make `entry.amount.toString()` yield a non-numeric string (later
   `BigInt(...)`/`parseInt(...)` → throw/NaN in caller code), and an absent
   `amount` key makes `undefined.toString()` throw. These are catchable parse
   failures / robustness-DoS issues, which the objective rates Low and lists as
   out of scope.

## What This Rules Out

The missing `Boolean()`/structural coercion on the `getSACBalance` ->
`scValToNative` SAC balance return (`server.ts:1481-1490`) is not a
Medium-or-higher finding: a malicious RPC server already fully controls the
returned balance semantics via validly-typed ScVals, so the type-confusion adds
no material security decision beyond legitimate-typed lies, and the only
incremental impact is a catchable parse-failure/throw (Low, out of scope).

## What This Does Not Rule Out

- A distinct route where `scValToNative` output flows into transaction assembly
  or signing (rather than a read-only `BalanceResponse`) such that type
  confusion changes a signed/submitted artifact — a different material effect
  not on this read path.
- Prototype-pollution-style variants via crafted `scvMap` keys reaching a
  vulnerable assignment sink elsewhere (here blocked by `Object.fromEntries`
  CreateDataProperty semantics).
- Unhandled-throw DoS on `entry.amount.toString()` if the objective scope were
  later widened to include Low-severity availability issues.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-7100aeb7a0fdaadb43143881"
weakness = "untrusted remote response decoding / contract interface integrity"
record_kind = "single_path"
path = ["getSACBalance", "scValToNative"]
sink = "scValToNative"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "contract_spec_conversion"
target_functions = ["src/rpc/server.ts:getSACBalance", "src/base/scval.ts:scValToNative"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["malicious_server_already_controls_value_no_new_capability", "incremental_effect_only_catchable_dos_low_out_of_scope"]
rules_out = ["missing Boolean/structural coercion on the getSACBalance scValToNative SAC return (server.ts:1481-1490) as a Medium+ finding: a malicious RPC server already fully controls balance semantics via validly-typed ScVals so type confusion yields no new security decision, and the only incremental impact is a catchable parse-failure/throw rated Low and out of scope"]
does_not_rule_out = ["scValToNative output feeding transaction-assembly/signing sinks where type confusion alters a signed artifact", "prototype-pollution via scvMap keys reaching a vulnerable assignment sink elsewhere", "unhandled-throw DoS on entry.amount.toString() if Low-severity availability is later in scope"]
assumptions = ["remote_rpc_server is the trust boundary, so the server can return any valid ScVal including a correctly-typed malicious SAC BalanceEntry map", "scValToNative faithfully represents the input ScVal with no decode bug (verified src/base/scval.ts:375-480)", "the returned BalanceResponse is read-only data and does not flow into signing on this path (server.ts:1481-1490)"]
mechanism_brief = "getSACBalance returns scValToNative output of an attacker-influenced contractData ScVal as a typed BalanceResponse without field coercion, but under the remote_rpc_server trust boundary the server already controls all balance semantics via validly-typed ScVals, so the missing coercion grants no material new security decision and the only incremental effect is a catchable Low/out-of-scope parse-failure or throw."
why_failed_brief = "below Medium severity floor: malicious server already controls content via valid types; type confusion adds only a catchable Low-severity parse/throw; no SDK decode bug and no implied integrity contract broken."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/base/scval.ts:scValToNative"
guarantee = "scValToNative faithfully maps each ScVal type to native; scvMap uses Object.fromEntries (CreateDataProperty) so no prototype pollution, and no decode-step bug introduces wrongness beyond the server-supplied content"

[[blockers]]
kind = "severity_threshold"
source = "src/rpc/server.ts:getSACBalance"
guarantee = "under remote_rpc_server scope the server already fully controls balance semantics with valid types, so the missing coercion's only incremental impact is a catchable parse-failure/throw rated Low and out of scope, below the Medium floor"
```
