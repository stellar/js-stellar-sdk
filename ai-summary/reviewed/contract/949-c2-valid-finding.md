# R949C2: Untrusted JSON retval surfaced as authoritative `result` after txFromJSON

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/949-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Source-confirmed end to end:

- `Client.txFromJSON` (`src/contract/client.ts:201-212`) parses the JSON, sets
  `parseResultXdr: (result) => this.spec.funcResToNative(method, result)`
  (`:207-208`), and forwards `tx` to `AssembledTransaction.fromJSON`.
- `fromJSON` (`src/contract/assembled_transaction.ts:433-475`) validates only the
  envelope: `validateInvokeContractOp` (`:377-431`) binds op-count, op-type,
  host-function-type, and contractId, and `fromJSON` binds the method name
  (`:456-462`). It then deserializes the JSON-supplied retval verbatim:
  `retval: xdr.ScVal.fromXDR(simulationResult.retval, "base64")` (`:468`), with
  no binding to the envelope or to any real local simulation.
- `simulationData` getter (`:695-704`) returns the stored `simulationResult` for
  the deserialized object.
- `get result()` (`:738-743`) returns
  `this.options.parseResultXdr(this.simulationData.result.retval)`, i.e.
  `spec.funcResToNative(method, <attacker ScVal>)`, decoding the attacker-chosen
  ScVal as the method's declared return type.

Crucially, `result` is reached only by application code reading `tx.result`; it
is **never** part of the envelope passed to the signing wallet
(`sign()` forwards `this.built.toXDR()`, `:834-836`, which contains no retval).
So no sign-time wallet inspection can detect a falsified retval — the value is
not in the signed bytes at all.

## Findings

This is a remote-response / cross-party trust-confusion issue at Medium.

In the documented multi-auth / multi-sig coordination flow (`toJSON`/`fromJSON`,
`:354-369`), the JSON producer is a remote or merely-cooperating party that the
signing side does not control. `fromJSON` reconstructs and validates the envelope
(contractId + method), but the `simulationResult.retval` is accepted verbatim and
later returned through `get result()` with the **same interface and no trust
signal** as a locally computed simulation result. A consuming application that
follows the documented pattern (call `txFromJSON`, read `tx.result` to learn the
"expected result" before deciding whether to co-sign) is shown an attacker-chosen
value decoded as the method's return type, decoupled from what the envelope's
arguments would actually produce.

Unlike C1 (sorobanData splice) and the prior `js-sdk-0c7fd0f9...` dismissals
(args / auth-entry / fromXDR), the "signer inspects the full envelope at sign
time" guard does **not** cover this consumer: retval is not part of the envelope,
so even a maximally diligent signer who fully re-parses the wallet's XDR cannot
detect the falsified `result`. The getter presents no provenance distinction
between a re-simulated retval and a JSON-supplied one (`:738-743`,
`:695-704`), which is the misleading-default / trust-confusion gap.

Severity is Medium, not High: `result` is informational pre-submission state, it
does not change the on-chain effect (the envelope is what is signed and
submitted), and the harm is decision-influence rather than direct fund movement.
This matches the impact category "remote RPC/Horizon response decoded into a
materially wrong return value" (Medium) and "remote-response trust confusion"
(Medium).

This is distinct from prior VIABLE `js-sdk-3d586da6...` (encode direction,
`nativeToScVal`/`stringToScVal` BytesN); this is the decode direction on a
JSON-supplied retval through `funcResToNative`, a consumer not covered by any
prior record per the injected brief.

## PoC Guidance

- **Test file**: append to an existing contract unit test, e.g.
  `test/unit/spec/*` or a contract `assembled_transaction` test under
  `test/unit`.
- **Setup**: build a `Spec`/`Client` for a contract whose method has a
  non-trivial declared return type (e.g. returns a `u32`/`i128`/struct). Produce
  a valid serialized AssembledTransaction via `toJSON` for a benign call.
- **Steps**:
  1. Take the legitimate JSON and replace only `simulationResult.retval` with a
     different, attacker-chosen base64 `ScVal` that is still valid for the
     method's declared return type (leave `tx` and `method` untouched so envelope
     validation in `fromJSON` still passes).
  2. Call `client.txFromJSON(tamperedJson)`.
  3. Read the deserialized transaction's `result`.
- **Assertion**: assert that `tx.result` equals the attacker-chosen value (not
  the value implied by the envelope's arguments), demonstrating that
  `funcResToNative` decodes the unvalidated JSON retval and that `fromJSON`
  applied no envelope/simulation binding or provenance flag to it. Mock RPC; do
  not contact public infrastructure.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-3c0364b06a3b262ea8bd65a6"
weakness = "json_deserialization"
record_kind = "single_path"
path = ["txFromJSON", "fromJSON", "result", "funcResToNative"]
sink = "AssembledTransaction.result"
sink_role = "result_decode"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["src/contract/assembled_transaction.ts:result", "src/contract/assembled_transaction.ts:fromJSON", "src/contract/client.ts:txFromJSON"]
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
rules_out = ["source trace confirms get result() (assembled_transaction.ts:738-743) decodes the JSON-supplied retval (fromJSON:468) via funcResToNative with no envelope/simulation binding and no provenance flag, and the retval is never part of the envelope forwarded to the signing wallet, so the prior wallet-inspects-at-sign-time blocker (js-sdk-0c7fd0f9) does not cover this consumer"]
does_not_rule_out = ["sorobanData merge at sign() which is covered by the wallet-inspects guard (see C1)", "auth-entry forwarding angle (prior js-sdk-0c7fd0f9)", "applications that always re-simulate before trusting result"]
assumptions = ["consuming application reads tx.result after txFromJSON to inform a signing/proceed decision without re-simulating, consistent with the documented multi-auth roundtrip", "the method has a declared return type for which an attacker can supply an alternative valid ScVal accepted by funcResToNative"]
mechanism_brief = "fromJSON stores JSON simulationResult.retval unvalidated; get result() decodes it via funcResToNative as the method's trusted return value, a consumer the signing wallet never inspects and that no sign-time envelope check can cover."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:fromJSON"
guarantee = "validateInvokeContractOp and fromJSON bind contractId and method only; retval is never bound to the envelope or to a real local simulation, so the checked guards do not block this candidate"

[[blockers]]
kind = "not_found"
source = "src/contract/assembled_transaction.ts:result"
guarantee = "no source-proven provenance check distinguishes a re-simulated retval from a JSON-supplied one before get result() decodes and trusts it, and retval is absent from the signed envelope so sign-time inspection cannot catch it"
```
