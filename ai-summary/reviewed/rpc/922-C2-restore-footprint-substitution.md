# R922b: Remote RPC simulation substitutes restoreFootprint footprint adopted verbatim by assembleTransaction

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/922-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Same construction path as C1, but for the `restoreFootprint` operation, where
the **read-write** footprint is the operation payload (the set of archived
ledger entries to restore and pay rent for):

1. `prepareTransaction` (`src/rpc/server.ts:1133-1139`): simulate, then
   `assembleTransaction(tx, simResponse).build()` returned for signing; no
   footprint check.
2. `parseSuccessful` (`src/rpc/parsers.ts:181`):
   `transactionData: new SorobanDataBuilder(sim.transactionData!)` decodes the
   full `SorobanTransactionData` (including read-write footprint) from the
   attacker-controlled response field.
3. `assembleTransaction` (`src/rpc/transaction.ts:44-121`): `isSorobanTransaction`
   admits `restoreFootprint` (lines 16-20). Lines 75-83 touch only the fee.
   Line 96 sets `sorobanData: success.transactionData.build()`, replacing the
   caller's entire footprint. The op rebuild branch (lines 100-118) is gated on
   `invokeHostFunction` only, so `restoreFootprint` falls through with its raw op
   cloned but carrying no footprint of its own.
4. `TransactionBuilder.cloneFrom` (`src/base/transaction_builder.ts:281-366`):
   reads raw `sorobanData` only for fee de-counting (lines 312-325);
   `Object.assign(builderOpts, opts)` (line 359) lets the simulation
   `sorobanData` override the footprint; the raw read-write footprint is
   discarded.
5. `restoreFootprint` (`src/base/operations/restore_footprint.ts:9-38`): "takes
   no parameters because the relevant footprint is derived from the transaction
   itself" (lines 16-17); "the ledger keys to restore are specified ... in
   read-write footprint of the transaction" (lines 13-14).

A malicious RPC supplies a `transactionData` whose read-write footprint names
attacker-chosen archived entries. After signing, the user pays restoration rent
for the attacker's entries, while the entries they intended to restore remain
archived/unavailable.

## Findings

Transaction-integrity break identical in shape to C1 but on the read-write
footprint of `restoreFootprint`. The footprint is the operation's entire
semantic target, fully determining which archived entries are restored and paid
for. There is no SDK-side reconciliation or warning. Maps to "Transaction
submitted with different operation target than the application intended" →
**High**.

Distinct from prior [7] (fee inflation, same line, different effect), prior [1]
(serialization-stage break only — this is the upstream construction at
assembleTransaction:96), and priors [2]/[3] (auth-entry adoption, not footprint).
The docstring (transaction.ts:39) treats footprint as trusted resource data and
provides no verification affordance — unsafe default under the attacker-
controlled-RPC trust model.

## PoC Guidance

- **Test file**: append to the existing `assembleTransaction` unit test under
  `test/unit` (e.g. `test/unit/server/transaction_test.js`).
- **Setup**: build a real `restoreFootprint` transaction whose raw `sorobanData`
  read-write footprint names a caller-intended archived key K_user
  (`SorobanDataBuilder().setReadWrite([K_user])`).
- **Steps**: construct a mocked successful `RawSimulateTransactionResponse`
  whose `transactionData` base64 encodes a `SorobanTransactionData` with a
  different read-write footprint K_attacker. Call
  `assembleTransaction(rawTx, mockedSim).build()`.
- **Assertion**: decode the resulting tx's `ext().value()` read-write footprint
  and assert it equals `[K_attacker]` and no longer contains `K_user`, proving
  the caller's restore target was silently replaced by the remote-supplied set.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-3504706c3cfcfc3ec6179739"
weakness = "remote_simulation_footprint_substitution_in_assembleTransaction"
record_kind = "single_path"
path = ["prepareTransaction", "parseSuccessful", "assembleTransaction", "cloneFrom", "build"]
sink = "assembleTransaction"
sink_role = "transaction_construction_sorobandata_adoption"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/base/operations/restore_footprint.ts:restoreFootprint", "src/rpc/server.ts:prepareTransaction", "src/rpc/parsers.ts:parseSuccessful", "src/base/transaction_builder.ts:cloneFrom"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms no read-write footprint reconciliation: assembleTransaction:75-83 and cloneFrom:312-325 read raw sorobanData only for fee de-counting, and cloneFrom Object.assign lets the simulation sorobanData footprint override unconditionally", "restoreFootprint op carries no footprint of its own (restore_footprint.ts:16-17), so the replaced sorobanData fully determines the restore target", "distinct from prior [7] fee effect, prior [1] serialization-stage blocker, and priors [2]/[3] auth-entry adoption"]
does_not_rule_out = ["resource-fee inflation effect already VIABLE under route js-sdk-37b8abbeef5856e72db630c2", "invokeHostFunction footprint manipulation (contract logic bounds actual accesses)", "manual flows that build sorobanData and never call prepareTransaction/assembleTransaction", "extendFootprintTtl variant of the same mechanism (tracked separately as C1)"]
assumptions = ["objective trust model treats the caller-selected RPC simulation response as attacker-controlled", "caller follows the documented prepareTransaction/simulate+assemble flow and signs the returned tx", "no additional assumptions beyond cited source evidence"]
mechanism_brief = "assembleTransaction:96 unconditionally replaces the raw tx sorobanData with the simulation response's transactionData; for restoreFootprint the read-write footprint IS the operation payload, so a malicious RPC substitutes which archived ledger entries are restored and paid for, and the user signs a different-than-intended operation."
why_failed_brief = "viable; not failed"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "isSorobanTransaction (transaction.ts:11) and isSimulationSuccess (transaction.ts:64) are the only gates; neither inspects or reconciles the read-write footprint, and the success status is read from the same attacker-controlled response"

[[blockers]]
kind = "not_found"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "no source-proven footprint reconciliation or caller-intent check exists between the raw tx read-write footprint and the simulation footprint before signing on the prepareTransaction/assembleTransaction path"
```
