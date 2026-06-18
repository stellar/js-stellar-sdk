# R916: scValToNative decodes primitive results by wire ScVal type, not the spec-declared output type

**Date**: 2026-06-18
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/916-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The generated/contract client decodes a method result through a chain that is
fully verified in current source:

1. `AssembledTransaction.result` getter
   (`src/contract/assembled_transaction.ts:738-750`) returns
   `this.options.parseResultXdr(this.simulationData.result.retval)` at line 743.
   `retval` is the ScVal carried in the simulation/transaction result supplied
   by the RPC server — attacker-controlled under the in-scope trust boundary
   `contract_spec_or_rpc_server`.
2. `parseResultXdr` is wired in the client to
   `(result) => spec.funcResToNative(method, result)`
   (`src/contract/client.ts:126-127`, and again at `207-208` for `txFromJSON`).
3. `funcResToNative` (`src/contract/spec.ts:612-637`) selects the single output
   type from the spec and calls `scValToNative(val, output)` (line 636), or
   `scValToNative(val, output.result().okType())` for `Result` outputs (634).
4. `scValToNative` (`src/contract/spec.ts:985-1096`) only consults the declared
   `typeDef` for the `scSpecTypeOption` (989-996), `scSpecTypeUdt` (998-1000),
   `scvVec`/tuple (1023-1038), `scvMap` (1043-1062), and `scvString`/`scvSymbol`
   (1071-1084) branches — those throw on declared-vs-actual mismatch. The
   primitive branches switch purely on the **wire** ScVal type and return the
   value with no comparison to the declared output type:
   - `scvVoid` → `null` (1006-1007)
   - `scvU64/I64/Timepoint/Duration/U128/I128/U256/I256` → `scValToBigInt(scv)`
     (1010-1021)
   - `scvAddress` → `Address.fromScVal(scv).toString()` (1040-1041)
   - `scvBool/scvU32/scvI32/scvBytes` → `scv.value()` (1065-1069)

The static TS return type the developer codes against is produced solely from
the *declared* output type by `parseTypeFromTypeDef`
(`src/bindings/utils.ts:101-202`): `bool`→`boolean`, `u32/i32`→`number`,
`u64..i256`→`bigint`, `bytes/bytesN`→`Buffer`, `address/muxedAddress`→`string`,
`void`→`null`. Nothing at decode time enforces that the wire value matches this
declared type for the primitive set.

## Findings

This is a real, source-proven divergence between the emitted static type and
the runtime decode for the unguarded primitive ScVal cases. A malicious or
compromised RPC server can return a `retval` whose ScVal type differs from the
declared output type, and the SDK hands application code a native value of a
different runtime type than the TS signature promises, with no error:

- Declared `address` (TS `string`) + server returns `scvBytes` → app receives a
  `Buffer`. Allowlist logic using `===` / `.startsWith` on the "address string"
  silently mishandles the value (can fail open or closed).
- Declared `u32` (TS `number`) + server returns `scvU64`/`scvU128` → app
  receives a `bigint`; mixed-type arithmetic/comparison throws or misbehaves.
- Declared non-option `bool` (TS `boolean`) + server returns `scvVoid` → app
  receives `null` (1006-1007) where the type promised a boolean.

This matches the impact category "Remote RPC/Horizon response decoded into a
materially wrong return value" (remote-response trust confusion), which floors
at **Medium**. No specific generated method whose mis-decoded return drives
signing/submission or fund movement is asserted, so it is not escalated to High
here.

Novelty: prior record [1] (`js-sdk-a81567cffe291c84348a5355`, NOT_VIABLE) closed
only the *encode/serialize* axis — that `entry.toXDR("base64")` re-serialization
is lossless and injection-free. That blocker holds for its own claim and does
not touch the *decode* axis re-opened here; the declared-vs-actual primitive
type check in `scValToNative` is a distinct sink. Records [2]/[3]/[4] concern
identifier collision and TS source injection during generation, not response
decode. This finding is not a typed duplicate or subsumption of any prior
record.

## PoC Guidance

- **Test file**: append a focused Vitest test under `test/unit` near existing
  `Spec`/contract decode tests (e.g. a `spec`-focused unit test file).
- **Setup**: build a minimal `Spec` whose single function declares an output
  type with a primitive declared type (start with `address` → TS `string`),
  using the existing `Spec` constructor / spec-builder helpers used elsewhere in
  the unit tests. No network needed.
- **Steps**:
  1. Construct a function spec entry with declared output type `address`.
  2. Call `spec.funcResToNative(method, retval)` with a hand-built
     `xdr.ScVal.scvBytes(Buffer.from([...]))` as the `retval` (i.e. wire type
     `scvBytes`, not `scvAddress`).
  3. Repeat for declared `bool` with `xdr.ScVal.scvVoid()`, and declared `u32`
     with `xdr.ScVal.scvU64(...)`.
- **Assertion**: assert the call does **not** throw and that the returned value
  is the wrong runtime type vs. the declared/emitted TS type — e.g.
  `Buffer.isBuffer(result) === true` for the declared-`address` case (TS said
  `string`); `result === null` for declared non-option `bool`; `typeof result
  === "bigint"` for declared `u32`. Contrast with a declared `string` output +
  `scvBytes`/`scvU32` wire value, which should throw at spec.ts:1071-1084,
  demonstrating the primitive branches are the unguarded set.
- **Build/run**: `yarn build:node` then a targeted
  `yarn test:node -- <path>`-style run before claiming the PoC passes; do not
  contact public Stellar infrastructure.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-a81567cffe291c84348a5355"
weakness = "remote_response_type_confusion"
record_kind = "single_path"
path = ["malicious_rpc_response.retval", "AssembledTransaction.result", "Spec.funcResToNative", "Spec.scValToNative"]
sink = "Spec.scValToNative"
sink_role = "response_decoding"
impact_class = "remote_response_trust_confusion"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/spec.ts:scValToNative", "src/contract/spec.ts:funcResToNative", "src/bindings/utils.ts:parseTypeFromTypeDef", "src/contract/client.ts:parseResultXdr", "src/contract/assembled_transaction.ts:result"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms the scValToNative primitive branches (scvVoid 1006-1007, scvU64..scvI256 1010-1021, scvAddress 1040-1041, scvBool/scvU32/scvI32/scvBytes 1065-1069) return the wire-typed value with no comparison against the declared typeDef, so no declared-vs-actual guard blocks this exact path", "prior record [1] encode/base64 re-serialization blocker is on the encode axis and does not cover this decode-side sink"]
does_not_rule_out = ["scvString/scvSymbol (spec.ts:1071-1084), scvVec/tuple (1023-1038), scvMap (1043-1062), and udt (998-999) decode branches that do validate the declared type and throw on mismatch", "encode-side nativeToScVal strict mismatch throws (spec.ts:666+)", "whether any specific generated method's mis-decoded primitive return escalates into unsafe signing/submission (would raise severity to High)"]
assumptions = ["a malicious or compromised RPC server can return a simulation/transaction retval ScVal of an arbitrary wire type, reachable via AssembledTransaction.result -> parseResultXdr -> funcResToNative -> scValToNative as traced in current source", "application code relies on the emitted static TS return type from parseTypeFromTypeDef"]
mechanism_brief = "scValToNative decodes a server result by wire ScVal type, not the spec-declared output type, for scvBool/scvU32/scvI32/scvBytes/scvU64-scvI256/scvAddress/scvVoid; the emitted client return type reflects only the declared type via parseTypeFromTypeDef, so a malicious RPC retval yields a native value of a different runtime type than the static type promises, with no error"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:scValToNative"
guarantee = "scvString/scvSymbol (1071-1084) and scvVec/scvMap (1023-1062) decode branches validate against the declared typeDef and throw on mismatch; the primitive branches at 1006-1007/1010-1021/1040-1041/1065-1069 do not"

[[blockers]]
kind = "not_found"
source = "src/contract/spec.ts:scValToNative"
guarantee = "no source-proven declared-vs-actual type check found for the primitive scValToNative branches reached via funcResToNative for this exact viable path"
```
