# R982: Auto-restore footprint injection allows attacker-chosen archived ledger entry restoration

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/982-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-6, high

## Trace Summary

The auto-restore path in `AssembledTransaction` accepts arbitrary `LedgerKey`s from an attacker-controlled RPC server and embeds them into a signed `RestoreFootprintOp` transaction with no SDK-level validation.

**Step 1 — Unvalidated RPC deserialization:** `parsers.ts:220-222` wraps the raw `restorePreamble.transactionData` base64 string from the RPC simulation response into a `SorobanDataBuilder` with no key-level validation.

**Step 2 — Direct footprint passthrough:** `assembled_transaction.ts:631-634` in `buildFootprintRestoreTransaction` calls `.setSorobanData()` with the attacker-supplied `SorobanDataBuilder` directly. No cross-check against the original transaction's footprint occurs.

**Step 3 — Second attacker-controlled simulation:** `assembled_transaction.ts:638` calls `simulate({ restore: false })` on the restore transaction. At line 657, `this.server.simulateTransaction(this.built)` hits the same attacker-controlled RPC endpoint. The attacker returns a `SimulateTransactionSuccessResponse` with arbitrary `transactionData`.

**Step 4 — Unconditional footprint application:** `transaction.ts:96` in `assembleTransaction` writes `success.transactionData.build()` to the cloned transaction for all Soroban operation types. Lines 100-118 only special-case `invokeHostFunction` for auth entries; `restoreFootprint` operations pass through with no filtering.

**Step 5 — Signed with attacker footprint:** `assembled_transaction.ts:818` in `sign()` re-applies `this.simulationData.transactionData` — which at line 730 is `simulation.transactionData.build()` from the attacker's success response — to the final signed transaction.

The wallet then signs a `RestoreFootprintOp` whose `readWrite` footprint contains exactly the attacker-specified `LedgerKey`s. `RestoreFootprintOp` restores all archived entries in the footprint on-chain.

## Findings

**Impact:** An attacker-controlled RPC server can force restoration of arbitrary archived ledger entries on the Stellar network when a user invokes any contract method with `restore: true`. This constitutes unauthorized on-chain state modification beyond fee impact.

**Security significance:** Soroban contracts that use TTL expiry as an access-revocation mechanism (expired allowances, permissions, ownership entries) are vulnerable. The attacker can force restoration of the expired entry, re-enabling permissions that were meant to have expired via TTL. This changes contract-visible access state on-chain.

**Attack preconditions:**
1. Attacker controls the RPC endpoint used by the SDK client.
2. Attacker knows of specific archived ledger entries whose restoration yields a security benefit (realistic when operating an RPC node that observes on-chain entry expirations).
3. The target contract uses TTL expiry for access revocation.

**Mitigating factors:**
- The wallet must sign the restore transaction, but `RestoreFootprintOp` transactions present as opaque operations — wallets do not enumerate XDR-encoded `LedgerKey` entries to the user.
- `RestoreFootprintOp` fails on-chain if injected keys are not actually archived; the attacker cannot inject currently-live entries.
- The `restore: false` guard prevents infinite auto-restore recursion, constraining the attacker to returning `SimulateTransactionSuccessResponse` (not `SimulationRestoreResponse`) for the restore tx simulation — still fully attacker-controlled.

**Novelty:** Prior record [1] (`js-sdk-c39118b8c167c49a379d45c1`, NOT_VIABLE) ruled out auto-restore *fee inflation* as an SDK defect. Its `negative_scope` is `no_sdk_resource_fee_cap_contract_to_violate` and `resource_fee_overdeclare_refunded_below_severity_floor` — fee-scoped only. Arbitrary key injection for state modification is a distinct mechanism outside that ruled-out scope.

## PoC Guidance

- **Test file:** `test/unit/contract/assembled_transaction_test.js` or a new test file alongside existing contract tests.
- **Setup:** Mock an RPC server that returns a `SimulationRestoreResponse` for the initial contract call with a crafted `restorePreamble.transactionData` containing attacker-chosen `LedgerKey`s (e.g., a contract data entry for a different contract). Then for the restore tx simulation, return a `SimulateTransactionSuccessResponse` with the same attacker-chosen keys in `transactionData`.
- **Steps:** Call `AssembledTransaction.build()` with `restore: true` against the mock RPC. Intercept the signed restore transaction before submission.
- **Assertion:** Decode the signed restore transaction's `SorobanTransactionData` and assert that its `readWrite` footprint contains the attacker-injected `LedgerKey`s rather than only keys from the original contract's footprint. Verify the user's wallet signed a transaction containing keys it did not intend to restore.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-c39118b8c167c49a379d45c1"
weakness = "transaction_submission"
record_kind = "single_path"
path = ["simulate", "restoreFootprint", "buildFootprintRestoreTransaction", "signAndSend"]
sink = "signAndSend"
sink_role = "transaction_submission"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "attacker-chosen archived ledger entries restored on-chain via injected restore footprint"
target_functions = [
  "src/contract/assembled_transaction.ts:buildFootprintRestoreTransaction",
  "src/contract/assembled_transaction.ts:simulate",
  "src/rpc/transaction.ts:assembleTransaction",
  "src/contract/assembled_transaction.ts:sign",
]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = ["rpc_simulation_response", "soroban_transaction_data"]
defense_tags = ["wallet_signing"]
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_by_prior_fee_scoped_record", "candidate_not_blocked_by_wallet_signing_defense"]
rules_out = [
  "prior record js-sdk-c39118b8c167c49a379d45c1 NOT_VIABLE ruled out fee inflation only (negative_scope: no_sdk_resource_fee_cap_contract_to_violate, resource_fee_overdeclare_refunded_below_severity_floor); does not address arbitrary key injection for state modification",
  "wallet signing defense does not block this path: RestoreFootprintOp transactions are presented as opaque operations and wallets do not enumerate XDR-encoded LedgerKey entries to the user",
]
does_not_rule_out = [
  "fee impact from the same restore injection path (already captured by prior record)",
  "restore injection for contracts without TTL-based revocation (fee-only harm, below Medium)",
  "similar injection via the primary simulate path for invokeHostFunction (different operation type, different auth handling at transaction.ts:100-118)",
]
assumptions = [
  "attacker controls the RPC endpoint used by the SDK client — confirmed reachable via Server.simulateTransaction at assembled_transaction.ts:657",
  "attacker knows of specific archived ledger entries whose restoration yields a security benefit — realistic for an RPC operator observing on-chain entry expirations",
  "target contract uses TTL expiry as an access-revocation or permission-expiry mechanism — a realistic class of Soroban contracts",
  "RestoreFootprintOp succeeds on-chain only if injected keys are actually archived — network-layer constraint confirmed but does not prevent security impact",
]
mechanism_brief = "attacker-controlled RPC injects arbitrary archived LedgerKeys into the RestoreFootprintOp footprint via unvalidated restorePreamble.transactionData (parsers.ts:220) and restore-tx simulation transactionData (transaction.ts:96); both flow to sign() at assembled_transaction.ts:818 with no SDK-level key validation; buildFootprintRestoreTransaction at line 631-634 passes the attacker SorobanDataBuilder directly to setSorobanData with no cross-check against the original transaction footprint"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:buildFootprintRestoreTransaction"
guarantee = "restore: false prevents SimulationRestoreResponse for the restore tx from triggering auto-restore recursion; attacker must return SimulateTransactionSuccessResponse, which is still fully attacker-controlled"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "stellar-core:RestoreFootprintOp"
guarantee = "RestoreFootprintOp fails on-chain if injected keys are not actually archived; constrains attack to archived entries but does not prevent security impact on TTL-aware contracts"

[[blockers]]
kind = "not_found"
source = "src/contract/assembled_transaction.ts:buildFootprintRestoreTransaction"
guarantee = "no SDK-level guard validates that LedgerKeys in restorePreamble.transactionData are a subset of the original transaction footprint or belong to the target contract"

[[blockers]]
kind = "not_found"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "no special-case filtering for restoreFootprint operations at transaction.ts:96; lines 100-118 only handle invokeHostFunction auth entries"
```
