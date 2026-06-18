# F1005-C3: Auto-restore fee inflation via attacker-controlled simulation

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/1005-hypothesis-batch.md
**Candidate ID**: C3
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-6, high

## Trace Summary

`isSimulationRestore` at `api.ts:490-498` checks `isSimulationSuccess(sim) &&
"restorePreamble" in sim && !!sim.restorePreamble.transactionData` — confirmed trivially
satisfiable by any non-empty `transactionData` in a success simulation.

`assembled_transaction.ts:659-664` triggers automatic `restoreFootprint` when `restore` is
truthy and `isSimulationRestore` passes. `restoreFootprint` at lines 1137-1144 calls
`buildFootprintRestoreTransaction` with the preamble's `transactionData` and `minResourceFee`,
then `signAndSend()`. `buildFootprintRestoreTransaction` at lines 620-640 re-simulates the
restore transaction via the same RPC server (line 638: `await tx.simulate({ restore: false })`),
so the second simulation's fee parameters are also attacker-controlled.

## Why It Failed

This candidate is subsumed by prior investigation [js-sdk-587ee082…] (prior record [3] in the
injected brief), which concluded with `resource_fee_overdeclare_refunded_below_severity_floor`
and `no_sdk_resource_fee_cap_contract_to_violate`. That record ruled out simulation-derived
`sorobanData/resourceFee` injection as an SDK security defect because "it is the intended,
unavoidable Soroban assembly path with no unsafe default or misleading fee contract, and impact
is bounded."

The auto-restore path is the same mechanism applied in a different transaction context: the
simulation response controls the fee, and the SDK assembles the transaction accordingly. This
is Soroban's intended design, not an SDK vulnerability.

Additionally:
1. `restore: true` is an explicit opt-in (defaults to `undefined`/falsy at
   `assembled_transaction.ts:652`). It is not an unsafe default.
2. The wallet signing prompt shows the restore transaction including its fee. The user can
   reject the signing request if the fee is unexpected.
3. Soroban protocol refund mechanics bound the actual cost: `resourceFee` declares a maximum,
   and excess beyond actual resource usage is refunded. The non-refundable portion is bounded
   by actual compute/bandwidth/rent.
4. Prior VIABLE finding [js-sdk-37b8abbeef…] (prior record [4]) covers the absence of SDK-level
   fee caps on the main simulation→sign path, which is the same fundamental mechanism. The
   auto-restore variant adds no distinct security surface beyond what that record already covers.

## What This Rules Out

Fee inflation via attacker-controlled auto-restore simulation responses as an SDK security
defect distinct from the general simulation-derived fee injection mechanism. The auto-restore
path uses the same assembly flow, the same fee mechanism, and the same wallet defense as the
main transaction path.

## What This Does Not Rule Out

An SDK-level resource fee cap or caller-specified maximum fee that bounds both the main
transaction and restore transaction fees — the absence of such a cap is already captured by
prior VIABLE finding [js-sdk-37b8abbeef…]. Auto-restore scenarios where the attacker causes
a restore of state that interferes with a subsequent operation (beyond fee impact) are also
not ruled out.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-c39118b8c167c49a379d45c1"
weakness = "transaction_integrity"
record_kind = "single_path"
path = ["send", "simulate", "restoreFootprint", "signAndSend"]
sink = "sendTransaction"
sink_role = "transaction_submission"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "transaction_submission"
target_functions = [
  "src/contract/assembled_transaction.ts:simulate",
  "src/contract/assembled_transaction.ts:buildFootprintRestoreTransaction",
  "src/rpc/api.ts:isSimulationRestore",
]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = ["rpc_response"]
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["resource_fee_overdeclare_refunded_below_severity_floor", "no_sdk_resource_fee_cap_contract_to_violate", "restore_opt_in_with_wallet_defense"]
rules_out = ["auto-restore fee inflation as an SDK security defect distinct from the general simulation-derived fee injection mechanism; prior record js-sdk-587ee082 rules out simulation-derived fee injection as the intended Soroban assembly path with no unsafe default; restore: true is explicit opt-in with wallet signing defense"]
does_not_rule_out = ["SDK-level resource fee cap absence is already captured by prior VIABLE finding js-sdk-37b8abbeef; auto-restore scenarios causing restore of attacker-chosen state entries beyond fee impact"]
assumptions = ["Soroban protocol refunds excess resourceFee beyond actual usage; wallet signing prompt displays the fee and allows rejection; restore: true defaults to undefined/falsy"]
mechanism_brief = "isSimulationRestore (api.ts:490-498) is trivially satisfiable; assembled_transaction.ts:661-664 triggers automatic signAndSend for restore; buildFootprintRestoreTransaction re-simulates with attacker-controlled RPC; but this is the intended Soroban assembly path, restore is opt-in, wallet shows fee, and protocol refunds excess"
why_failed_brief = "subsumed by prior record js-sdk-587ee082 (resource_fee_overdeclare_refunded_below_severity_floor, no_sdk_resource_fee_cap_contract_to_violate); auto-restore uses the same simulation-derived fee mechanism with explicit opt-in and wallet defense"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:simulate"
guarantee = "restore: true is explicit opt-in; defaults to undefined/falsy at assembled_transaction.ts:652"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:restoreFootprint"
guarantee = "wallet signTransaction callback is required (checked at assembled_transaction.ts:1130-1133) and shows the restore transaction including fee before signing"

[[blockers]]
kind = "subsumed_by_prior"
source = "src/contract/assembled_transaction.ts:buildFootprintRestoreTransaction"
guarantee = "prior record js-sdk-587ee082 ruled out simulation-derived fee injection as the intended Soroban assembly path; auto-restore uses the same mechanism with the same wallet defense"
```
