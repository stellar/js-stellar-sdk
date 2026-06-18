# F959: Residual retval-trust on the JSON deserialize path (txFromJSON -> get result)

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/959-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The claimed source path is confirmed in current source:

- `src/contract/client.ts:201-212` — `txFromJSON` does `JSON.parse(json)`, splits
  off `method`, and routes the remaining caller/remote-supplied object into
  `AssembledTransaction.fromJSON`, injecting
  `parseResultXdr = (result) => this.spec.funcResToNative(method, result)`.
- `src/contract/assembled_transaction.ts:433-475` — `fromJSON` rebuilds
  `txn.built` from the JSON `tx`, calls `validateInvokeContractOp`, then at
  `:464-469` sets `txn.simulationResult.retval =
  xdr.ScVal.fromXDR(simulationResult.retval, "base64")` with **no** cross-check
  against `txn.built` or any re-simulation.
- `src/contract/assembled_transaction.ts:377-431` — `validateInvokeContractOp`
  validates only operation count, `invokeHostFunction` type,
  `hostFunctionTypeInvokeContract`, contract address (vs `expectedContractId`),
  and function name. It never inspects `retval`.
- `src/contract/assembled_transaction.ts:738-743` — `get result` returns
  `this.options.parseResultXdr(this.simulationData.result.retval)` directly,
  i.e. the JSON-supplied `retval` decoded through `funcResToNative`.
- `src/contract/assembled_transaction.ts:360-371` — `toJSON` emits `retval`
  under `simulationResult`, separate from `tx: this.built?.toXDR()`, confirming
  `retval` is outside the signed envelope.
- `src/contract/sent_transaction.ts:132-144` — post-send `get result` instead
  parses the on-chain `getTransactionResponse.returnValue`, so a forged
  simulation `retval` does not affect sent state-changing transaction results.

The mechanism is therefore real and source-proven: on the deserialize path a
JSON-supplied `retval` is decoded and surfaced via `get result` with no
provenance or envelope binding.

## Why It Failed

This is an **exact typed duplicate of an existing VIABLE finding** in structured
prior memory. Prior record [4] (VIABLE, reviewed, route_id
`js-sdk-3c0364b06a3b262ea8bd65a6`, path `txFromJSON; fromJSON; result;
funcResToNative`) already established the identical mechanism: `get result()`
decodes the JSON-supplied `retval` via `funcResToNative` with no
envelope/simulation binding and no provenance flag, and `retval` is absent from
the signed envelope so sign-time inspection cannot catch it.

Candidate C1 re-files the same typed weakness under the envelope-validation
route_id (`js-sdk-80ed626791b50e12afad51f7`). It shares the identical scope
(trust boundary `application_input_or_remote_rpc_server`, protocol phase
`contract_transaction_assembly`, parser state `json_xdr_or_wasm_decoded`, size
class, input shape) and overlapping target functions (`txFromJSON`, `fromJSON`,
`validateInvokeContractOp`, `result`). No new trust boundary, protocol phase,
parser state, size class, input shape, sink role, or attacker-control surface
distinguishes C1 from [4]; the "read-only/view result" and "pre-send co-signer
display" angles are the same retval-trust consequence already covered by [4],
not a distinct typed route. Per the novelty rule, an exact typed duplicate of an
existing finding is NOT_VIABLE for that candidate.

This NOT_VIABLE is a novelty/dedup disposition only. It does **not** assert the
underlying behavior is safe — the finding stands as already documented in [4].

## What This Rules Out

- C1 as a novel route: the retval-trust-on-deserialize weakness on the exact
  `txFromJSON -> fromJSON -> get result -> funcResToNative` path is already
  captured as VIABLE [4]; re-filing it under the envelope-validation route_id
  adds no new typed route, sink, or trust boundary.

## What This Does Not Rule Out

- The underlying VIABLE retval-trust finding [4] itself, which remains valid.
- Any genuinely distinct variant with a different trust boundary, sink, parser
  state, or input shape (e.g. the XDR deserialize path `fromXDR`, or a
  provenance check added that distinguishes re-simulated vs JSON-supplied
  retval), which would not be a typed duplicate of [4].

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-80ed626791b50e12afad51f7"
weakness = "envelope_validation_gate"
record_kind = "single_path"
path = ["txFromJSON", "fromJSON", "validateInvokeContractOp", "result"]
sink = "result"
sink_role = "result_decode_trust"
impact_class = "parse_integrity"
route_family = "envelope_validation_gate"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/client.ts:txFromJSON", "src/contract/assembled_transaction.ts:fromJSON", "src/contract/assembled_transaction.ts:validateInvokeContractOp", "src/contract/assembled_transaction.ts:result"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "duplicate_of_prior_finding"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["typed_duplicate_of_viable_retval_trust_finding_js-sdk-3c0364b06a3b262ea8bd65a6"]
rules_out = ["C1 as a novel route: the JSON-supplied retval-trust mechanism on the exact txFromJSON->fromJSON->get result->funcResToNative path with this scope is an exact typed duplicate of the existing VIABLE finding [4] (route_id js-sdk-3c0364b06a3b262ea8bd65a6)"]
does_not_rule_out = ["the underlying VIABLE retval-trust finding [4] itself, which remains valid", "a genuinely distinct variant with a different trust boundary, sink, parser state (e.g. the fromXDR deserialize path), or input shape that is not a typed duplicate of [4]"]
assumptions = ["source trace at client.ts:201-212, assembled_transaction.ts:360-371/377-431/433-475/738-743 and sent_transaction.ts:132-144 reflects current source", "prior record [4] in the injected brief accurately captures the same retval-trust mechanism and scope"]
mechanism_brief = "fromJSON stores the JSON-supplied simulationResult.retval unvalidated (assembled_transaction.ts:464-469) and get result returns parseResultXdr(retval) directly (:738-743); validateInvokeContractOp (:377-431) binds only contract/method, never retval, and retval is outside the signed envelope (toJSON :360-371). Mechanism is real but is an exact typed duplicate of existing VIABLE finding [4]."
why_failed_brief = "exact typed duplicate of existing VIABLE retval-trust finding [4] (route_id js-sdk-3c0364b06a3b262ea8bd65a6, same path/scope/target functions); not a novel route despite the different envelope-validation route_id"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:validateInvokeContractOp"
guarantee = "validateInvokeContractOp validates operation count, invokeHostFunction type, invokeContract host-function, contract address, and method name only; it does not validate or constrain retval"

[[blockers]]
kind = "duplicate"
source = "src/contract/assembled_transaction.ts:result"
guarantee = "the get result retval-trust mechanism on the JSON deserialize path is already documented as VIABLE in prior record [4] (route_id js-sdk-3c0364b06a3b262ea8bd65a6); C1 is a typed duplicate, not a novel finding"

[[blockers]]
kind = "partial"
source = "src/contract/sent_transaction.ts:result"
guarantee = "post-send SentTransaction.result reads on-chain getTransactionResponse.returnValue, so a forged simulation retval does not affect sent state-changing transaction results; impact is limited to AssembledTransaction.result for read-only/pre-send usage (same scope as [4])"
```
