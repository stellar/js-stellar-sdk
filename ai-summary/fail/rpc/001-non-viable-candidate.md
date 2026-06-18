# F001: Simulation-derived resource fee applied to prepared transaction

**Date**: 2026-06-17
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/001-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The claimed data flow is real and unconditional:

- `src/rpc/parsers.ts:181-182` — `parseSuccessful` builds
  `transactionData: new SorobanDataBuilder(sim.transactionData!)` and
  `minResourceFee: sim.minResourceFee!` directly from the raw RPC JSON. The XDR
  decode (`SorobanTransactionData`) is type-enforced but the embedded
  `resourceFee` value is taken verbatim.
- `src/rpc/transaction.ts:75-83` — only fee adjustment is the double-count
  subtraction guard (`classicFeeNum - rawSorobanData.resourceFee()`) for raw
  transactions that already carry Soroban data; no upper bound.
- `src/rpc/transaction.ts:85-98` — `TransactionBuilder.cloneFrom` is called with
  `sorobanData: success.transactionData.build()`, so the RPC-supplied resource
  fee is embedded in the assembled transaction.
- `src/rpc/server.ts:1133-1139` — `prepareTransaction` calls
  `assembleTransaction(...).build()` and the documented example
  (`server.ts:1117-1124`) signs the returned transaction directly.

So a malicious/compromised RPC can inflate the resource fee that ends up in a
transaction the caller signs. The mechanism is source-confirmed.

## Why It Failed

This is working-as-designed behavior, not a deviation from expected behavior:

1. **The resource fee is intrinsically an RPC-computed value.** Soroban
   simulation exists precisely to compute the resource fee and footprint; there
   is no SDK-side ground truth to validate it against. A static cap would break
   legitimate large-resource contract invocations. The hypothesis's proposed
   "bound it" remedy is not achievable without a heuristic that would reject
   valid transactions.

2. **The documented contract applies simulation results.** The
   `assembleTransaction` JSDoc (`transaction.ts:38-39`) states it returns "a
   new, cloned transaction with the proper auth and resource (fee, footprint)
   simulation data applied." Adopting the simulation resource fee is the
   intended design, not an accident.

3. **The hypothesis's "expose it" remedy is already satisfied.** The resulting
   fee is a standard, readable field (`tx.fee`) on the returned transaction.
   Reviewing the fee on a transaction before signing is universal caller
   responsibility for every Stellar transaction, not a Soroban-specific gap.

4. **Impact is fee overpayment, not theft.** Fees are burned to the network,
   not paid to the attacker (acknowledged in the hypothesis anti-evidence). The
   residual is at most a documentation/warning gap, which is a best-practice
   (Low) issue and out of scope for this objective's Medium minimum.

This matches the out-of-scope criterion "behavior that is explicitly documented
as caller responsibility and has no SDK-level unsafe default or misleading API
contract": the simulation flow inherently requires trusting the chosen RPC for
the computed fee, and the fee is exposed for caller review before signing.

## What This Rules Out

A static SDK-side cap or mandatory validation on the simulation-derived resource
fee on the exact `parseSuccessful` -> `assembleTransaction` -> `cloneFrom` path
is not a viable finding: the fee is intrinsically RPC-computed, is exposed on the
returned transaction, and is applied per the documented contract.

## What This Does Not Rule Out

- Auth-entry injection on the same assembly path (C2, separately assessed).
- Response decode-cost exhaustion (C3, separately assessed).
- A distinct bug where the double-count subtraction guard
  (`transaction.ts:80-82`) produces an arithmetically wrong fee for a specific
  raw-Soroban-data input shape — not the mechanism claimed here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-aa9b65c61d46ef89d4540f22"
weakness = "Untrusted XDR Decode"
record_kind = "single_path"
path = ["parseSuccessful", "assembleTransaction", "fromXDR"]
sink = "cloneFrom"
sink_role = "transaction_assembly"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/rpc/parsers.ts:parseSuccessful", "src/rpc/transaction.ts:assembleTransaction"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "working_as_designed"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["simulation_resource_fee_is_documented_design_and_exposed"]
rules_out = ["a static SDK-side cap or mandatory validation on the simulation-derived resource fee on the parseSuccessful->assembleTransaction->cloneFrom path: the fee is intrinsically RPC-computed with no SDK ground truth, is exposed as tx.fee for caller review, and is applied per the documented assembleTransaction contract"]
does_not_rule_out = ["auth-entry injection on the same assembly path (C2)", "response decode-cost exhaustion (C3)", "an arithmetic error in the double-count subtraction guard for a specific raw-Soroban-data input shape"]
assumptions = ["the Soroban resource fee has no SDK-side ground truth and must be computed by simulation", "reviewing tx.fee before signing is universal caller responsibility, and tx.fee is readable on the returned transaction", "fees are burned to the network rather than paid to the attacker"]
mechanism_brief = "RPC-supplied resource fee in transactionData flows uncapped into the assembled, signed transaction, but this is the documented simulation-apply design with the fee exposed for caller review."
why_failed_brief = "working as designed; resource fee is intrinsically RPC-computed, exposed as tx.fee, and applied per the documented prepareTransaction/assembleTransaction contract; impact is burned-fee overpayment, a Low documentation gap below the Medium bar."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "documented_contract"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "JSDoc documents that resource (fee, footprint) simulation data is applied to the returned transaction; fee is exposed as tx.fee for caller review before signing"

[[blockers]]
kind = "design_invariant"
source = "src/rpc/server.ts:prepareTransaction"
guarantee = "simulation is the only source of the Soroban resource fee; no SDK-side ground truth exists to validate or cap it without breaking legitimate large invocations"
```
