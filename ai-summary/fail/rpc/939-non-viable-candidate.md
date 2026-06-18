# F939: Unbounded adoption of remote simulation resource fee into signed transaction

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/939-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The C1 path is source-confirmed end to end:

- `src/rpc/parsers.ts:parseSuccessful` (lines 181-182) builds the success
  response with `transactionData: new SorobanDataBuilder(sim.transactionData!)`
  and `minResourceFee: sim.minResourceFee!`, taken directly from the raw RPC
  simulation with no numeric/range validation.
- `src/rpc/transaction.ts:assembleTransaction` (lines 85-98) clones the raw
  transaction via `TransactionBuilder.cloneFrom`, setting `fee:
  classicFeeNum.toString()` and `sorobanData: success.transactionData.build()`.
  The adopted `transactionData` carries the simulation-declared `resourceFee`
  and footprint, which flow into the final transaction fee. The function's own
  docstring (lines 27-42) documents this as applying "the proper auth and
  **resource (fee, footprint)** simulation data."
- `src/rpc/server.ts:prepareTransaction` (lines 1133-1139) calls
  `simulateTransaction`, throws on simulation error, then returns
  `assembleTransaction(tx, simResponse).build()` — a *built but unsigned*
  transaction. Per the documented example (server.ts:1119-1124) the caller then
  explicitly calls `preparedTransaction.sign(sourceKeypair)`.

So a malicious/MITM RPC server that returns a structurally valid simulation with
an inflated `transactionData.resourceFee`/`minResourceFee` does cause that
inflated fee to be built into the transaction the caller subsequently signs.
The mechanism is real; the disposition is about scope and design intent, not a
broken trace.

## Why It Failed

This is documented, working-as-designed simulation adoption under the declared
`remote_rpc_server` trust boundary, with no SDK-level unsafe default or
misleading API contract:

1. **No caller-authored baseline exists for resource fee.** Unlike the envelope
   source/memo/network (which the caller authors and the SDK must preserve), a
   Soroban resource fee cannot be known by the caller independently — the entire
   purpose of `simulateTransaction`/`prepareTransaction` is to *discover* the
   resource fee and footprint from the server's simulation. There is no "intended"
   value against which a cap, ceiling, or diff would be meaningful; any bound the
   SDK invented would be arbitrary and could reject legitimately expensive
   contract calls.

2. **Documented design intent.** `assembleTransaction`'s docstring explicitly
   states it applies the resource (fee, footprint) simulation data, and
   `prepareTransaction` documents trusting the configured RPC server. Treating
   the adopted fee as a bug misreads the documented contract. Per the security
   review procedure, behavior that matches documented design intent is
   NOT_VIABLE.

3. **No silent/hidden adoption.** `prepareTransaction` returns the built,
   *unsigned* transaction; signing is a separate explicit caller step. The
   adopted `fee` and `sorobanData` are readable fields on the returned
   transaction, so the caller can inspect the declared fee before signing. There
   is no hidden auto-sign or concealed mutation — this is documented-caller-
   responsibility with a caller-visible result, which the objective places out of
   scope.

4. **Typed-sibling disposition.** This is the same `parseSuccessful ->
   assembleTransaction` route disposed of in prior record `js-sdk-aa9b65c6...`
   for the auth sub-field. C1 is the distinct fee/resource sub-field (so it is
   not an exact duplicate and was traced independently), but it resolves on the
   same rationale: documented simulation adoption under the caller-selected-server
   trust model.

The hypothesis's own anti-evidence concedes the only loss-magnitude mitigation
(protocol-level resource-fee refund of the unused declared fee) is external to
this repo and unverified here; it is recorded as anti-evidence, not relied on as
the blocker. The blocker is the documented-design-intent / no-caller-baseline /
caller-visible-output basis above, all source-confirmed in this repo.

## What This Rules Out

Verbatim adoption of the simulation-declared Soroban `resourceFee` /
`minResourceFee` / `transactionData` into the prepared transaction's
`fee`+`sorobanData` on the `parseSuccessful -> assembleTransaction ->
prepareTransaction` path being a viable Medium+ finding: it is documented
simulation adoption with no caller-authored baseline to validate against, and the
fee is caller-inspectable on the returned unsigned transaction before the
explicit sign step.

## What This Does Not Rule Out

- A malicious server enlarging the footprint to cause on-chain transaction
  failure (DoS-of-submission) rather than fee inflation.
- `minResourceFee` / `restorePreamble` adoption on the restore-footprint flow,
  which is a different code path than the success/assemble flow traced here.
- Any future API change that auto-signs prepared transactions, which would
  remove the caller-visible-before-signing mitigation.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-d8fe689893049ffbbe84f5cb"
weakness = "unbounded adoption of remote simulation resource fee into signed transaction"
record_kind = "single_path"
path = ["parseSuccessful", "assembleTransaction", "prepareTransaction"]
sink = "TransactionBuilder.cloneFrom sorobanData/fee"
sink_role = "transaction_assembly"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/rpc/parsers.ts:parseSuccessful", "src/rpc/transaction.ts:assembleTransaction", "src/rpc/server.ts:prepareTransaction"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["documented_simulation_resource_fee_adoption", "no_caller_authored_baseline_for_resource_fee", "caller_visible_output_before_signing"]
rules_out = ["verbatim adoption of simulation-declared resourceFee/minResourceFee/transactionData into the prepared transaction fee+sorobanData on the parseSuccessful->assembleTransaction->prepareTransaction path being a Medium+ finding: it is documented simulation adoption with no caller-authored resource-fee baseline to validate against, and the fee is caller-inspectable on the returned unsigned transaction before the explicit sign step"]
does_not_rule_out = ["malicious server enlarging footprint to cause on-chain tx submission failure rather than fee inflation", "minResourceFee/restorePreamble adoption on the restore-footprint flow which is a distinct path", "a future API change that auto-signs prepared transactions removing the caller-visible-before-signing mitigation"]
assumptions = ["prepareTransaction returns a built but unsigned transaction and signing is a separate explicit caller step (server.ts:1133-1139, 1119-1124)", "resource fee for a Soroban tx has no caller-authored baseline and is discovered by simulation by design (transaction.ts:27-42 docstring)", "exploit loss-magnitude further depends on protocol-level resource-fee refund behavior not present in this repo"]
mechanism_brief = "parseSuccessful adopts simulation transactionData/minResourceFee with no bound; assembleTransaction applies it as sorobanData and derives the tx fee; prepareTransaction returns the unsigned tx for the caller to inspect and sign."
why_failed_brief = "documented working-as-designed simulation resource-fee adoption under the caller-selected-server trust boundary; no caller-authored baseline exists to cap/diff against and the adopted fee is readable on the returned unsigned transaction before the explicit sign step, so there is no unsafe default or misleading contract"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "documented_contract"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "docstring (lines 27-42) documents application of resource (fee, footprint) simulation data; prepareTransaction (server.ts:1133-1139) documents trusting the configured RPC server, so adoption of the simulated resource fee is the documented intended behavior"

[[sanitizer_guarantees]]
kind = "caller_visible_output"
source = "src/rpc/server.ts:prepareTransaction"
guarantee = "prepareTransaction returns a built but unsigned transaction whose fee and sorobanData are readable fields; signing is a separate explicit caller step (server.ts:1119-1124), so the adopted fee is inspectable before signing"

[[blockers]]
kind = "design_intent"
source = "src/rpc/parsers.ts:parseSuccessful"
guarantee = "resource fee has no caller-authored baseline; simulation exists to discover it, so a numeric cap/diff is not meaningful and adopting the simulated fee is working-as-designed rather than a missing guard"
```
