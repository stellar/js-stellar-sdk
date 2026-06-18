# R913: Unbounded RPC-supplied resource fee folded into the signed Soroban transaction

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/913-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the outbound assembly/signing path in current source:

- `src/contract/assembled_transaction.ts:688-690` (`simulate`): on a success
  simulation, `this.built = assembleTransaction(this.built, this.simulation).build()`.
  The simulation object is the verbatim Soroban RPC `simulateTransaction`
  response, JSON/XDR-decoded by `parseRawSimulation`.
- `src/rpc/transaction.ts:63-98` (`assembleTransaction`): after the
  `isSorobanTransaction` shape gate and `Api.isSimulationSuccess` status gate,
  it clones the raw tx with `sorobanData: success.transactionData.build()`
  (line 96). `success.transactionData` is the parsed RPC response and carries
  `resourceFee` inside the Soroban transaction data. The Soroban resource fee is
  added to the transaction's total fee at submission. Neither gate bounds or
  sanity-checks the RPC-supplied resource fee, and there is no comparison
  against any caller-provided maximum (no such option exists on this path).
- `src/contract/assembled_transaction.ts:815-821` (`sign`): re-clones with
  `fee: this.built!.fee` and `sorobanData: this.simulationData.transactionData`
  — `simulationData.transactionData` (`:730`) is again the RPC-supplied
  `simulation.transactionData.build()`. The inflated fee/resource data is thus
  present in the bytes.
- `src/contract/assembled_transaction.ts:834-837` (`sign`): the resulting
  envelope `this.built.toXDR()` is handed to the wallet `signTransaction`
  callback and the returned signed XDR is stored as `this.signed`, then
  submitted by `send()`.

The two guards on the path (`isSorobanTransaction`, `isSimulationSuccess`)
constrain operation shape and simulation status only; neither imposes any upper
bound on the resource fee. No SDK-level fee cap or caller-max validation exists
before the fee enters the signed envelope.

## Findings

Per the objective scope (`attacker_control = contract_spec_wasm_json_and_rpc_response`),
the Soroban RPC `simulateTransaction` response is an in-scope attacker-controlled
trust boundary (compromised/MITM'd RPC endpoint). A malicious RPC can return a
success simulation whose `transactionData.resourceFee` is arbitrarily large.
Because the SDK folds this value, unbounded, into the transaction the caller
signs and submits — and many integrations auto-sign using the simulation-derived
"expected fee" — the source account can be made to overpay fees up to its
balance. This is direct loss of funds (burned to the network) caused by a remote
response decoded into a materially wrong fee that reaches signed/submitted bytes,
which the severity scale and impact table place at High.

Expected behavior (validated by tracing): there is genuinely no local way to
compute the Soroban resource fee without simulation, so trusting the magnitude
from simulation is by design — but the SDK exposes no cap, no explicit
pre-sign approval of the derived fee, and no caller-max gate. The absence of any
bound on an untrusted value that lands in the signed envelope is the deviation.

This is the outbound direction (simulation-supplied fee written into the
to-be-signed envelope) and is distinct from the inbound decode-confusion route
`js-sdk-26a2c419baf9cb084b019288` (priors 1/2) and the advisory-preview route
`js-sdk-1704e35f985caf506dd6a0f1` (priors 3/4). No prior record covers this
sink, so it is novel.

## PoC Guidance

- **Test file**: append to an existing `test/unit/server/transaction` or
  `test/unit/contract` Vitest spec that exercises `assembleTransaction` /
  `AssembledTransaction.sign` with a mocked `server.simulateTransaction`.
- **Setup**: build an invokeHostFunction transaction; mock the RPC simulation
  success response so `transactionData` carries an absurd `resourceFee`
  (e.g. near 2^63-1). Provide a `signTransaction` stub that records the XDR it
  is asked to sign.
- **Steps**: call `assembleTransaction(raw, sim).build()` (or drive
  `AssembledTransaction.simulate()` then `sign()` with the stub).
- **Assertion**: decode the built/signed envelope and assert its total fee
  reflects the attacker's inflated `resourceFee` with no clamping — i.e. the
  signed bytes carry a fee far above any caller-intended ceiling. Demonstrates
  that no SDK-level bound exists before signing.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-37b8abbeef5856e72db630c2"
weakness = "RPC-supplied resource fee folded into signed transaction without bound"
record_kind = "single_path"
path = ["simulate", "assembleTransaction", "sign", "this.built.toXDR"]
sink = "this.bu ... nvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/contract/assembled_transaction.ts:simulate", "src/contract/assembled_transaction.ts:sign"]
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
rules_out = ["source trace confirms the only guards on the path (isSorobanTransaction shape gate, isSimulationSuccess status gate) do not bound the RPC-supplied resourceFee, and sign() re-applies simulationData.transactionData into the signed envelope with no cap or caller-max validation"]
does_not_rule_out = ["footprint/ledger-key manipulation inside the same sorobanData", "auth-entry injection variants (C2 path)"]
assumptions = ["per objective scope the Soroban RPC simulateTransaction response is an in-scope attacker-controlled trust boundary", "application uses default simulate:true and signs the simulation-derived envelope (auto-sign or wallet that does not independently bound resource fee)"]
mechanism_brief = "assembleTransaction applies success.transactionData (carrying RPC resourceFee) verbatim and sign() signs this.built.toXDR() with that fee; no SDK-level upper bound or caller-max gate exists."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "isSorobanTransaction and isSimulationSuccess gate operation shape and simulation status only; neither bounds the RPC-supplied resource fee"

[[blockers]]
kind = "not_found"
source = "src/contract/assembled_transaction.ts:sign"
guarantee = "no source-proven fee cap or caller-max validation exists before the resource fee enters the signed envelope"
```
