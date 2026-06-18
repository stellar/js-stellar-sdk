# R913: RPC-supplied resource fee folded into signed transaction without caller-intent bound

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/913-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the outbound assembly/sign/submit path in current source:

- `src/contract/assembled_transaction.ts:688-689` (`simulate`):
  `this.built = assembleTransaction(this.built, this.simulation).build()` —
  the simulation response is the remote Soroban RPC `simulateTransaction`
  result (`this.simulation = await this.server.simulateTransaction(...)`,
  line 657), which is in scope as attacker-controlled per the dispatch seed.
- `src/rpc/transaction.ts:63-98` (`assembleTransaction`): after the
  `isSorobanTransaction` shape gate and `Api.isSimulationSuccess` status gate,
  the builder is cloned with `sorobanData: success.transactionData.build()`
  (line 96). `success.transactionData` is the parsed RPC response; the
  `resourceFee` rides inside this `SorobanTransactionData`. No bound, cap, or
  comparison against a caller-supplied maximum is applied to the fee here.
- `src/base/transaction_builder.ts:1038-1050` (build): when `sorobanData` is
  present, `attrs.fee = attrs.fee + sorobanData.resourceFee()`. The **only**
  guard is `if (attrs.fee > UINT32_MAX) throw` — a structural overflow cap, not
  a fee-sanity check. UINT32_MAX (4,294,967,295 stroops ≈ 429.5 XLM) is far
  above any normal Soroban resource fee, so an inflated RPC `resourceFee` up to
  that ceiling is accepted silently.
- `src/contract/assembled_transaction.ts:814-837` (`sign`): re-clones with
  `fee: this.built!.fee` and `sorobanData: this.simulationData.transactionData`
  (the cached RPC `transactionData`), then `setTimeout().build()` and hands
  `this.built.toXDR()` to the wallet `signTransaction`. The inflated total fee
  (classic + RPC resourceFee) is therefore inside the signed bytes and is
  submitted in `send()`.

`isSorobanTransaction` (transaction.ts:11-25) and `Api.isSimulationSuccess`
(transaction.ts:64) gate operation shape and simulation status only; neither
bounds the RPC-supplied resource fee. `cloneFrom`'s soroban handling
(transaction_builder.ts:319-323) only avoids double-counting an *incoming*
soroban data's resourceFee; it does not validate the *simulation-supplied* fee.

## Findings

A malicious or MITM'd Soroban RPC returns a successful simulation whose
`transactionData.resourceFee` is arbitrarily inflated (up to the UINT32_MAX
total-fee ceiling). The SDK folds that fee into the to-be-signed envelope with
no caller-facing approval step and no comparison against `options.fee` or any
caller maximum. With the default `simulate: true` write flow, the application
signs and submits a transaction overpaying fees, draining up to ~429.5 XLM per
transaction from the source account directly to network fees. This is a remote
response decoded into a materially wrong fee that leads directly to fund
movement, meeting the High impact category for "transaction submitted with a
different fee than the application intended."

The `UINT32_MAX` check is the sole bound: it caps the *magnitude* of the loss
but does not block the mechanism, since legitimate resource fees are orders of
magnitude below it. There is no SDK-level fee cap, caller-max validation, or
explicit per-fee approval gate on this path.

## Novelty

Route `js-sdk-37b8abbeef5856e72db630c2` is distinct from prior route
`js-sdk-26a2c419baf9cb084b019288` (priors 1/2, inbound decode confusion on the
simulation **result** `retval`/struct via `funcResToNative`/`structToNative`)
and `js-sdk-1704e35f985caf506dd6a0f1` (priors 3/4, advisory result preview).
Those priors cover the inbound result-decode direction; this is the outbound
fee written into the signed/submitted envelope — a different sink role
(`transaction_serialization`) and material effect. No prior covers the
simulation-supplied fee. Not a duplicate or subsumption.

## PoC Guidance

- **Test file**: append to a unit test under `test/unit` exercising
  `assembleTransaction` / `AssembledTransaction.simulate` with a mocked RPC
  (follow existing `test/unit/server/soroban` or contract-client mocked
  simulation patterns; do not contact public infrastructure).
- **Setup**: build a soroban invokeHostFunction transaction; construct a mocked
  `SimulateTransactionResponse` success whose `transactionData.resourceFee` is
  set to a large value (e.g. near UINT32_MAX minus the classic fee).
- **Steps**: call `assembleTransaction(raw, mockedSim).build()` (or
  `tx.simulate()` with the mocked server), then read the built transaction's
  `fee`.
- **Assertion**: assert the built/signed transaction `fee` equals
  `classicFee + inflatedResourceFee` with no rejection, demonstrating the
  unbounded RPC fee reaches the envelope. Optionally assert that a fee above
  UINT32_MAX throws (showing the only existing bound) while any value below it
  is accepted unchallenged.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-37b8abbeef5856e72db630c2"
weakness = "RPC-supplied resource fee folded into signed transaction without caller-intent bound"
record_kind = "single_path"
path = ["assembleTransaction", "TransactionBuilder.build", "sign", "this.bu ... nvelope"]
sink = "this.bu ... nvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/contract/assembled_transaction.ts:simulate", "src/contract/assembled_transaction.ts:sign", "src/base/transaction_builder.ts:build"]
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
rules_out = ["source trace confirms the only fee guard on this path is the UINT32_MAX total-fee overflow check in transaction_builder.ts:1045-1050, which bounds magnitude (~429.5 XLM) but is not a caller-intent fee-sanity check, so it does not block the inflated-RPC-fee mechanism", "isSorobanTransaction and isSimulationSuccess gate operation shape and simulation status only and do not bound the resource fee"]
does_not_rule_out = ["footprint/ledger-key manipulation carried in the same sorobanData", "auth-entry injection (C2) on the same serialization sink"]
assumptions = ["the Soroban RPC simulateTransaction response is attacker-controlled per dispatch seed scope (malicious or MITM'd RPC)", "the application uses the default simulate:true write flow and signs the assembled transaction"]
mechanism_brief = "assembleTransaction applies RPC simulation transactionData (carrying resourceFee) verbatim; TransactionBuilder.build adds resourceFee into the total fee bounded only by UINT32_MAX, and sign() re-applies the cached transactionData so the inflated fee enters the signed/submitted envelope."
why_failed_brief = "viable; survived shape/status gates and the UINT32_MAX overflow cap does not block the mechanism"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/base/transaction_builder.ts:build"
guarantee = "UINT32_MAX total-fee check caps fee magnitude (~429.5 XLM) but is a structural overflow guard, not a caller-intent fee-sanity bound, so it does not block the inflated-RPC-fee mechanism"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "isSorobanTransaction and isSimulationSuccess gate operation shape and simulation status only; neither bounds the RPC-supplied resource fee"

[[blockers]]
kind = "not_found"
source = "src/contract/assembled_transaction.ts:sign"
guarantee = "no source-proven fee cap, caller-max validation, or explicit per-fee approval gate exists before the RPC-supplied resource fee enters the signed envelope"
```
