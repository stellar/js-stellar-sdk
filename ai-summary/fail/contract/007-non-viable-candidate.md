# F007: Peer-supplied `simulationResult.retval` surfaced via `result` getter

**Date**: 2026-06-17
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/007-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The boundary claim is source-confirmed in `src/contract/assembled_transaction.ts`:

- `fromJSON` (`464-469`) sets `txn.simulationResult.retval =
  xdr.ScVal.fromXDR(simulationResult.retval, "base64")` directly from the JSON
  field, unbound to the `tx` envelope.
- The `result` getter (`738-743`) returns
  `this.options.parseResultXdr(this.simulationData.result.retval)`, and
  `simulationData` (`699-704`) returns the fromJSON value verbatim.

However, a full-file trace of `retval` shows it is consumed in **only** three
places: `toJSON` serialization (`366`), the `fromJSON` setter (`468`), the
`scvVoid` default (`728`), and the `result` getter decode (`743`). It is
**never** read by `sign()`, `cloneFrom`, `send`, auth-entry signing, or any path
that contributes to the signed or submitted transaction bytes. (Only
`simulationTransactionData` and `simulationResult.auth` affect what is
signed/submitted; those are addressed elsewhere — `simulationTransactionData` is
the VIABLE C1 finding.) Therefore the only observable effect of a tampered
`retval` is the value returned by the `result` getter.

## Why It Failed

The `result` getter exposes the **simulated** return value, which is inherently
non-authoritative: Soroban simulation is a preview that the network re-executes,
and the authoritative outcome is produced later by `SentTransaction` from the
network response (the hypothesis's own anti-evidence concedes this). The SDK
never guarantees that the pre-send `result` of a simulated — let alone a
deserialized peer — transaction is the trusted on-chain outcome.

Because `retval` does not flow into any signed or submitted bytes, the worst
observable impact is a misleading **preview value** that the SDK already
documents as advisory. Realizing any security impact requires an application to
treat the pre-send simulated `result` of a deserialized peer transaction as an
authoritative security decision — i.e., over-trusting documented-advisory
simulation output. That is caller-side over-trust with no SDK-level unsafe
default and no effect on transaction integrity, which lands at Low/informational.

Per the objective severity scale, **minimum severity is Medium** and Low /
informational issues are out of scope (and the Medium "incorrect result
decoding" floor requires the decoding to *cause unsafe application behavior*,
which is not met here because the value is advisory and never affects
signing/submission). C2 is therefore NOT_VIABLE for this objective on
severity-floor grounds.

## What This Rules Out

A tampered `simulationResult.retval` in a deserialized multi-auth JSON cannot
affect the signed or submitted transaction bytes: `retval` is consumed only by
`toJSON`/`fromJSON`/`result` and is absent from `sign`, `cloneFrom`, `send`, and
auth-entry signing. Its sole effect is the advisory `result` getter output.

## What This Does Not Rule Out

- The C1 sibling-field gap (`simulationTransactionData` injected at sign) — a
  distinct route that **does** reach signed bytes — remains VIABLE.
- Post-execution `SentTransaction` return-value handling is outside this trace.
- The prior VIABLE decode-internal records on route
  `js-sdk-26a2c419baf9cb084b019288` (scValToNative/funcResToNative primitive
  branches lacking spec-type checks) remain valid for the decode layer; this
  candidate concerned the `fromJSON` admission boundary, not the decoder.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-1704e35f985caf506dd6a0f1"
weakness = "transaction serialization integrity"
record_kind = "single_path"
path = ["fromJSON", "result"]
sink = "a.toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["assembled_transaction.ts:fromJSON", "assembled_transaction.ts:result"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["below_medium_severity_floor", "advisory_simulation_preview_not_signing_relevant"]
rules_out = ["full-file retval trace proves simulationResult.retval is consumed only by toJSON/fromJSON/result and never reaches signed or submitted bytes (sign, cloneFrom, send, auth-entry signing), so a tampered retval cannot alter transaction integrity; the only effect is the advisory result preview value"]
does_not_rule_out = ["C1 simulationTransactionData injection at sign (VIABLE, distinct route reaching signed bytes)", "post-execution SentTransaction return-value handling", "prior VIABLE decode-internal scValToNative/funcResToNative gaps on a different route"]
assumptions = ["simulation retval is documented-advisory preview, with the authoritative outcome produced by SentTransaction post-execution", "no in-repo consumer makes a security decision on the pre-send simulated result of a deserialized peer transaction"]
mechanism_brief = "fromJSON admits simulationResult.retval from an unvalidated JSON field unbound to the tx envelope and the result getter decodes it via parseResultXdr, but retval never flows into signed/submitted bytes, so the only impact is an advisory preview value."
why_failed_brief = "below Medium severity floor: retval affects only the non-authoritative result preview getter, never signing/submission, so impact reduces to caller over-trust of documented-advisory simulation output (Low/informational, out of scope)."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "assembled_transaction.ts:validateInvokeContractOp"
guarantee = "validateInvokeContractOp validates the envelope contract id and method only; simulationResult.retval is not validated against the envelope but also never affects signed/submitted bytes"

[[blockers]]
kind = "scope_floor"
source = "assembled_transaction.ts:result"
guarantee = "retval is consumed only by the advisory result preview getter (and toJSON/fromJSON); it does not reach sign/cloneFrom/send, so the worst impact is a misleading non-authoritative preview, below the Medium severity floor"
```
