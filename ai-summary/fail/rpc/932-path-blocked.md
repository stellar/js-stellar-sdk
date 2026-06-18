# F932: Path blocked: getSACBalance entry.amount.toString() unhandled-throw DoS (Low, out of scope)

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/932-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`getSACBalance -> scValToNative`

## Residual Question Resolved

Residual lead: "unhandled-throw DoS on `entry.amount.toString()` if Low-severity
availability is later in scope."

Concrete yes/no from source: **YES, the throw is reachable.** At
`server.ts:1476` `entry = scValToNative(val.contractData().val())` where `val`
is fully RPC-server-controlled (selected-but-untrusted server). At
`server.ts:1486` the code does `entry.amount.toString()` with no presence/type
coercion (the comment at 1478-1480 explicitly *presumes* the SAC structure).
If the server returns SAC contract data whose native conversion yields an
object/value without an `amount` property (or `amount` null/undefined),
`entry.amount` is `undefined` and `.toString()` raises `TypeError`. The
function is `async`, so this surfaces as a rejected promise.

## Blocker

The mechanism exists but its only material effect is a **catchable,
caller-recoverable promise rejection on a single `await`ed call**. `getSACBalance`
is a public async method; the throw becomes a rejected promise the caller can
`try/catch`. The single in-SDK callsite (`server.ts:412`) merely `return`s the
promise to the SDK consumer — no swallowing into unsafe state, no global crash,
no fund/transaction/auth integrity impact. The wrong-but-valid-value variant is
already disposed by prior route record js-sdk-7100aeb7a0fdaadb43143881: under
`remote_rpc_server` scope the server already fully controls balance semantics
via validly-typed ScVals, so neither a wrong value nor a throw grants new
attacker capability. The throw is therefore Low-severity availability, and the
escalation predicate ("if Low-severity availability is later in scope") is
unmet under this objective's **minimum severity Medium**; Low is explicitly
out of scope.

## Evidence

- `src/rpc/server.ts:1476` - `scValToNative(val.contractData().val())` decodes fully server-controlled ScVal into `entry`.
- `src/rpc/server.ts:1486` - `amount: entry.amount.toString()` dereferences `entry.amount` with no presence/type guard; throws `TypeError` when absent.
- `src/rpc/server.ts:412` - sole in-SDK caller just `return`s the promise to the consumer; throw stays a catchable rejection, no unsafe propagation.

## Negative Scope

- Rules out: unhandled-throw / wrong-value DoS on the `getSACBalance` -> `scValToNative` SAC return as a Medium+ finding — the throw is a single-call catchable rejection (Low) and the value is already fully server-controlled, granting no new capability.
- Does not rule out: distinct Medium+ integrity routes on other `scValToNative` consumers where decoded remote data feeds transaction assembly, auth-entry handling, or signing decisions rather than a returned read-only balance.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-7100aeb7a0fdaadb43143881"
weakness = "contract_spec_conversion"
record_kind = "residual_escalation"
path = ["getSACBalance", "scValToNative"]
sink = "scValToNative"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/server.ts:getSACBalance", "src/rpc/server.ts:scValToNative"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["incremental_effect_only_catchable_dos_low_out_of_scope", "malicious_server_already_controls_value_no_new_capability"]
rules_out = ["unhandled-throw DoS on getSACBalance entry.amount.toString() (server.ts:1486) as Medium+: throw is a single-call catchable async rejection (Low), and server already fully controls balance value via valid ScVals so it grants no new capability"]
does_not_rule_out = ["distinct Medium+ integrity routes on other scValToNative consumers whose decoded remote data feeds transaction assembly, auth-entry handling, or signing"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "server-controlled ScVal -> scValToNative -> entry.amount.toString() throws TypeError when amount absent; reachable but only a catchable single-call promise rejection (Low availability), and server already controls the value"
why_failed_brief = "mechanism confirmed reachable but caps at Low-severity catchable DoS / no-new-capability wrong value; below objective Medium floor, Low out of scope"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "throw at server.ts:1486 surfaces as a rejected promise from public async getSACBalance and from the sole in-SDK caller server.ts:412, fully caller-catchable with no unsafe in-SDK state propagation"

[[blockers]]
kind = "severity_floor"
guarantee = "only material effect is a catchable single-call availability throw (Low) plus already-server-controlled value (no new capability); below objective minimum severity Medium"
```
