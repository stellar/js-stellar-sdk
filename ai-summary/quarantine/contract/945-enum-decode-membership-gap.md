# R945: enumToNative accepts undeclared u32 enum values on remote decode

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/945-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Remote retval reaches the enum decoder through the confirmed chain:
`AssembledTransaction` builds `parseResultXdr = (result) =>
spec.funcResToNative(method, result)` and `get result()` calls it on the
RPC-simulation or `fromJSON`-supplied ScVal. `funcResToNative` (spec.ts:612-637)
forwards the declared output type to `scValToNative` (spec.ts:636 ->
spec.ts:985). For a declared UDT the type IS respected: `scValToNative` routes
UDTs at spec.ts:998-1000 to `scValUdtToNative` (spec.ts:1098), which dispatches
a declared enum entry to `enumToNative` at spec.ts:1102.

`enumToNative` (spec.ts:1166-1172) is the sink:

```ts
private enumToNative(scv: xdr.ScVal): number {
  if (scv.switch().value !== xdr.ScValType.scvU32().value) {
    throw new Error(`Enum must have a u32 value`);
  }
  const num = scv.u32();
  return num;
}
```

It validates only that the ScVal tag is `scvU32`, then returns the raw integer.
It is invoked at spec.ts:1102 as `this.enumToNative(scv)` WITHOUT being passed
the `entry.udtEnumV0()` spec, so it has no access to the declared case set and
cannot perform a membership check. The encode side `nativeToEnum`
(spec.ts:956-960) DOES guard membership:
`if (enum_.cases().some((entry) => entry.value() === val)) return scvU32(val);
throw new TypeError(...)`. The asymmetry confirms a dropped domain check on the
decode side, not an intended design.

## Findings

Under the in-scope trust boundary "remote RPC/Horizon response decoded into a
materially wrong return value", a malicious or buggy RPC simulation response (or
attacker-controlled `fromJSON` state) can deliver `scvU32(9999)` for a declared
enum-typed output. `assembledTx.result` returns `9999`, an integer that is not a
declared variant, and the application trusts it as a valid enum value. This is a
well-typed but out-of-domain value injected past the SDK's type contract — a
decoded-result-integrity defect.

This is distinct from the already-VIABLE route
`js-sdk-26a2c419baf9cb084b019288`: that finding is the `scValToNative` switch
dispatching on the ScVal's own *tag* with no comparison to the declared spec
type (cross-primitive confusion) plus `structToNative` positional field
assignment. C1 is a different sink (`enumToNative`), reached only after the
declared UDT type is correctly honored, and a different defense gap (enum-case
*value-domain membership*, not type-tag comparison). The fix is also distinct: it
requires threading `entry.udtEnumV0()` into `enumToNative` and adding a
`cases().some(...)` check symmetric with `nativeToEnum`. No prior memory record
covers enum-case membership (sink-, text-, and route-scoped prior queries
returned nothing on this branch).

Severity Medium: the decoded value is still a number; escalation to High would
require an application that signs/submits based on the enum variant, which is
caller-side and not demonstrated here.

## PoC Guidance

- **Test file**: append to `test/unit/spec_test.js` (or the existing spec
  conversion unit suite).
- **Setup**: build a `Spec` containing a `udtEnumV0` with declared cases (e.g.
  `0`, `1`, `2`) and a function whose single output type is that UDT enum.
- **Steps**: call `spec.funcResToNative("fn", xdr.ScVal.scvU32(9999))` (or
  `scValToNative` directly with the enum `typeDef`).
- **Assertion**: it currently returns `9999`; assert that today's behavior
  returns the undeclared value (demonstrating the gap), and that the symmetric
  `nativeToEnum(9999, enum_)` throws `TypeError` — proving the decode/encode
  asymmetry.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-a7b32e6177a6e7a129c7468b"
weakness = "type_confusion"
record_kind = "single_path"
path = ["funcResToNative", "scValToNative", "scValUdtToNative", "enumToNative"]
sink = "enumToNative"
sink_role = "remote_response_decode"
impact_class = "decoded_result_integrity"
route_family = "remote_response_decoding"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/spec.ts:enumToNative", "src/contract/spec.ts:nativeToEnum", "src/contract/spec.ts:scValUdtToNative", "src/contract/assembled_transaction.ts:result"]
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
rules_out = ["source trace confirms enumToNative (spec.ts:1166-1172) checks only the scvU32 tag and is called at spec.ts:1102 without the declared udtEnumV0 entry, so no enum-case membership guard blocks an out-of-domain u32 on this exact viable path"]
does_not_rule_out = ["union tuple positional decode (unionToNative) remains unassessed", "void->null substitution in scValToNative is a separate branch (C2)"]
assumptions = ["malicious-or-buggy RPC simulation response or attacker-supplied fromJSON ScVal is in-scope per the objective remote-response-decode trust boundary", "declared output type is a udtEnumV0 reachable via scValUdtToNative"]
mechanism_brief = "enumToNative returns the raw u32 with no declared-case membership check and is not even passed the enum spec; nativeToEnum does check, so a remote ScVal yields an undeclared enum value"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:enumToNative"
guarantee = "validates only that the ScVal tag is scvU32, not enum-case membership"

[[blockers]]
kind = "not_found"
source = "src/contract/spec.ts:scValUdtToNative"
guarantee = "enumToNative is invoked without the udtEnumV0 entry, so no source-proven membership/domain guard exists on the enum decode path"
```
