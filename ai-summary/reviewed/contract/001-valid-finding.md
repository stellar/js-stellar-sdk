# R001: ScVal-to-native type confusion: primitive/bigint/address decode branches ignore declared spec output type

**Date**: 2026-06-17
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/001-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate claims `Spec.scValToNative` dispatches on the ScVal's own type tag
without validating the contract's declared output (spec) type for the integer,
bool/u32/i32/bytes, and address branches, so a malicious RPC response can be
decoded into a wrong-typed native value. Source confirms this exactly.

`scValToNative(scv, typeDef)` (`src/contract/spec.ts:985`) computes the declared
spec type once (`const value = t.value`, lines 986-987) and uses it only for the
`Option`, `Udt`, `vec`/`tuple`, `map`, and `string`/`symbol` cases:

- `src/contract/spec.ts:1010-1021` — `scvU64/I64/Timepoint/Duration/U128/I128/U256/I256`
  all return `scValToBigInt(scv)` with **no** comparison against `value`. The
  decode is keyed entirely on the ScVal's own tag.
- `src/contract/spec.ts:1040-1041` — `scvAddress` returns
  `Address.fromScVal(scv).toString()` with no spec-type check.
- `src/contract/spec.ts:1064-1069` — `scvBool/scvU32/scvI32/scvBytes` return
  `scv.value()` directly with no spec-type check.

The contrast branches prove the omission is a real gap, not uniform intended
laxity: `src/contract/spec.ts:1023-1038` (vec/tuple), `1043-1062` (map), and
`1071-1084` (string/symbol) all test `value === xdr.ScSpecType.scSpecType...().value`
and `throw` a `TypeError`/`Error` on mismatch. If laxity were intended across the
board, the string/symbol and vec/map branches would not bother checking `value`.

Remote control and reachability are confirmed:
- `src/contract/assembled_transaction.ts:743` — `get result()` passes
  `this.simulationData.result.retval` (the simulate RPC response) to
  `parseResultXdr`.
- `src/contract/sent_transaction.ts:137-139` — `get result()` passes
  `this.getTransactionResponse.returnValue!` (the getTransaction RPC response) to
  `parseResultXdr`.
- `parseResultXdr` is wired to `spec.funcResToNative(method, result)` at
  `src/contract/client.ts:126-127` and `src/contract/assembled_transaction.ts:515-516`,
  and `funcResToNative` calls `scValToNative(val, output)` at
  `src/contract/spec.ts:634,636`, where `output` is the spec-declared type and
  `val` is the attacker-controlled ScVal.

## Findings

Expected behavior (validated against the vec/map/string/symbol branches): a
decode that is handed the declared output type should reject an ScVal whose tag
is incompatible with that declared type. The primitive/bigint/address branches
deviate: they decode whatever tag the ScVal carries and return it as if it were
the declared type.

Impact under the objective's explicit "malicious or compromised RPC server"
trust boundary:
- A method declared to return `bytes` (app expects `Buffer`) can be served an
  `scvBool`/`scvU32`, so the app receives a JS `boolean`/`number`; subsequent
  `Buffer` operations (`.length`, `.equals`, `.slice`) misbehave or throw.
- A method declared to return `u32` (app expects `number`) can be served
  `scvBytes`, so the app receives a `Buffer` in place of a number, corrupting
  arithmetic/index logic.
- A method declared to return signed `i128` can be served `scvU128`, so
  `scValToBigInt` reads it unsigned, sign-flipping an amount/balance and
  exceeding the i128 range the app assumes.

This is "remote-response trust confusion / incorrect result decoding that can
cause unsafe application behavior" and "remote RPC response decoded into a
materially wrong return value," which is the Medium floor in the objective. It is
not promoted to High because the decoded result is a read path that does not, by
itself, alter the signed/submitted envelope or move funds; the marginal harm
over same-type value lying is the cross-type/JS-type confusion of an otherwise
trusted decode contract.

## PoC Guidance

- **Test file**: append to an existing `test/unit/spec` test (the suite that
  exercises `Spec`/`scValToNative`), or a new `test/unit/spec_decode_test.ts`.
- **Setup**: build a `Spec` from a minimal contract entry whose function output
  type is `bytes` (and a second case with output `i128`). No network needed.
- **Steps**: call `spec.funcResToNative("fn", scVal)` where `scVal` is an
  `xdr.ScVal.scvBool(true)` (for the `bytes`-declared function) and a
  `xdr.ScVal.scvU128(...)` near 2^127 (for the `i128`-declared function).
- **Assertion**: assert that the `bytes` case returns a JS `boolean` (i.e.,
  `typeof result === "boolean"`) instead of a `Buffer` — demonstrating the
  missing type check — and that the `i128` case returns a large positive bigint
  beyond the signed i128 max. Contrast with the `string`-declared case, which
  throws on a mismatched tag, to show the inconsistency.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-26a2c419baf9cb084b019288"
weakness = "ScVal-to-native type confusion: decode dispatches on ScVal tag without validating declared spec output type"
record_kind = "single_path"
path = ["<anonymous>", "Assembl ... fromXDR"]
sink = "Assembl ... fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/contract/spec.ts:scValToNative", "src/contract/spec.ts:funcResToNative"]
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
rules_out = ["source trace confirms the integer/bigint/bool/u32/i32/bytes/address branches return based on the ScVal's own tag with no comparison against the declared spec type, so no guard blocks the cross-type decode on this exact path"]
does_not_rule_out = ["struct field-order confusion (see C2/R002)", "signed/unsigned bigint sign confusion within scValToBigInt as a distinct measured impact", "nearby variants outside this exact reviewed path remain unassessed"]
assumptions = ["RPC simulate/getTransaction response retval is attacker-controlled per the objective's compromised-RPC trust boundary, confirmed reachable via assembled_transaction.ts:743 and sent_transaction.ts:137-139", "application consumes the decoded result trusting it conforms to the contract's declared output type"]
mechanism_brief = "scValToNative integer/bool/u32/i32/bytes/address branches (spec.ts:1010-1021,1040-1041,1064-1069) return based on the ScVal's own type tag without checking the declared spec output type, so a malicious RPC returnValue of a different XDR tag decodes into a wrong-typed native value; vec/map/string/symbol branches validate and throw, proving the omission."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:scValToNative"
guarantee = "vec/map/string/symbol branches (spec.ts:1023-1062,1071-1084) validate the declared type and throw, but the integer/bigint/bool/u32/i32/bytes/address branches do not, so this candidate path is not blocked"

[[blockers]]
kind = "not_found"
source = "src/contract/spec.ts:funcResToNative"
guarantee = "funcResToNative passes the spec output type to scValToNative but no spec-type check exists on the primitive/bigint/address decode branches for this exact viable path"
```
