# R007: Unvalidated `simulationTransactionData` from `fromJSON` overrides signed envelope sorobanData

**Date**: 2026-06-17
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/007-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The full override chain is source-proven in `src/contract/assembled_transaction.ts`:

1. **Wire format carries the field separately.** `toJSON` (`360-369`) serializes
   four independent fields: `method`, `tx` (envelope XDR), `simulationResult`
   (`auth` + `retval`), and `simulationTransactionData` (base64). The doc
   comments at `905-983` document the multi-auth workflow: the invoker serializes
   with `toJSON`, sends the JSON over the wire to co-signers who deserialize with
   `txFromJSON`/`fromJSON`, sign auth entries, re-serialize, and send back to the
   invoker who calls `sign()` then `send()`. The in-scope attacker is a malicious
   co-signer or a wire tamperer who returns modified JSON.

2. **`fromJSON` admits the field unbound.** `fromJSON` (`433-475`) builds
   `txn.built` from `tx`, runs `validateInvokeContractOp`, then at `470-473` sets
   `txn.simulationTransactionData = xdr.SorobanTransactionData.fromXDR(simulationTransactionData, "base64")`
   directly from the JSON field with **no consistency check** against the `tx`
   envelope's embedded `SorobanTransactionData`.

3. **The only guard is orthogonal.** `validateInvokeContractOp` (`377-431`)
   validates op count, op type, host-function type, contract id (`424`), and
   method name (`456-462`) — and nothing else. It never inspects sorobanData,
   resource fee, or footprint.

4. **The getter prefers the injected field verbatim.** `simulationData`
   (`695-736`) returns `this.simulationTransactionData` directly whenever
   `simulationResult && simulationTransactionData` are set (`699-704`),
   preferring the fromJSON-supplied value over any fresh simulation.

5. **`sign()` injects it into the signed bytes.** `sign()` (`766-845`) rebuilds
   `this.built = TransactionBuilder.cloneFrom(this.built!, { fee: this.built!.fee,
   timebounds: undefined, sorobanData: this.simulationData.transactionData })`
   (`815-819`) and then signs `this.built.toXDR()` (`834-835`). Passing
   `sorobanData` to `cloneFrom` is exactly the mechanism the SDK uses to set the
   envelope's `SorobanTransactionData`; the unvalidated separate field therefore
   **replaces** the envelope's embedded sorobanData in the bytes the invoker
   signs.

6. **No upstream guard blocks the write path.** The `!force && this.isReadCall`
   check (`783`) does not block: `isReadCall` (`1089-1096`) is derived from
   `simulationData` (auth count + readWrite footprint length); for a multi-auth
   write call (auth entries present) it is `false`, so `sign()` proceeds.

## Findings

A malicious co-signer or wire tamperer returns multi-auth JSON with the **same
`tx`** (passing the contract-id and method-name checks in
`validateInvokeContractOp`) but a **tampered `simulationTransactionData`**
carrying an inflated `resourceFee` or an altered read/write footprint. At sign
time the invoker signs and submits a transaction whose `SorobanTransactionData`
(resource fee / footprint) diverges from the validated envelope and from what the
application intended — the application only ever inspected/validated the contract
id and method. This matches the High impact category "Transaction submitted with
different envelope (resource fee / footprint / sorobanData) than the application
intended." The recent commit `f8a0a7f4a` changed fee derivation in `cloneFrom`
but added no provenance validation for the injected sorobanData, so the override
path remains.

Severity High; confidence medium because the exact economic magnitude of an
inflated `resourceFee` (refund mechanics, transaction-level `fee` ceiling) was
not concretely evaluated in source — `cloneFrom` internals live in the
`@stellar/stellar-base` dependency, which is not installed in this checkout.
The integrity violation itself (signed bytes diverge from the validated
envelope via an unvalidated sibling field) is source-proven and non-conditional.

## What This Rules Out

The faithful-serialization NOT_VIABLE prior records (`toEnvelope`/`toXDR` is a
deterministic round-trip of construction state) do **not** block this candidate:
here the construction state (`this.built`'s sorobanData) is itself poisoned by
`cloneFrom` before serialization, so the serialization being faithful is
irrelevant. The decode-internal VIABLE records on route
`js-sdk-26a2c419baf9cb084b019288` (funcResToNative/scValToNative,
structToNative) are a different mechanism (decode lacks spec-type/key checks);
this is the `fromJSON` binding gap that admits unvalidated sorobanData in the
first place. Different route_id (`js-sdk-1704e35f985caf506dd6a0f1`), distinct
sink behavior.

## PoC Guidance

- **Test file**: `test/unit/server/soroban/assembled_transaction.test.ts`
  (append a new test).
- **Setup**: Build an `AssembledTransaction` for an `invokeContract` write call
  with at least one non-source auth entry (so `isReadCall` is false), using a
  mocked simulation (mock the RPC `Server.simulateTransaction` as existing tests
  do) so that `built`, `simulationResult`, and `simulationTransactionData` are
  populated. Provide a `signTransaction` mock that captures the XDR string passed
  to it.
- **Steps**:
  1. `const json = JSON.parse(tx.toJSON())`.
  2. Decode `json.simulationTransactionData`, mutate the
     `SorobanTransactionData` (inflate `resourceFee`, or change a footprint
     `readWrite` key) so it differs from the `SorobanTransactionData` embedded in
     `json.tx`, re-encode to base64, and write it back into the JSON.
  3. `const tampered = AssembledTransaction.fromJSON(options, json)` — assert it
     does **not** throw (validation passes on contract id + method).
  4. `await tampered.sign({ signTransaction: capturingMock })`.
- **Assertion**: Parse the captured signed XDR and assert its
  `SorobanTransactionData` equals the **tampered** value (and differs from the
  `SorobanTransactionData` embedded in the original `tx` envelope), proving the
  unvalidated sibling field overrides the validated envelope's sorobanData with
  no provenance check.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-1704e35f985caf506dd6a0f1"
weakness = "transaction serialization integrity"
record_kind = "single_path"
path = ["fromJSON", "sign.cloneFrom", "a.toXDR"]
sink = "a.toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["assembled_transaction.ts:fromJSON", "assembled_transaction.ts:validateInvokeContractOp", "assembled_transaction.ts:simulationData", "assembled_transaction.ts:sign"]
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
rules_out = ["source trace confirms no cross-check binds the fromJSON simulationTransactionData field to the validated tx envelope before sign() injects it via cloneFrom as sorobanData and signs this.built.toXDR(); validateInvokeContractOp checks only contract id and method", "faithful-serialization blocker is inapplicable because construction state is poisoned by cloneFrom before toXDR serializes it"]
does_not_rule_out = ["simulationResult.auth divergence affecting isReadCall classification", "envelope embedded sorobanData vs separate field divergence in non-multi-auth persistence flows", "exact economic magnitude of inflated resourceFee under refund/fee-ceiling mechanics not measured in source"]
assumptions = ["multi-auth JSON round-trips simulationTransactionData over the wire per documented workflow (assembled_transaction.ts:905-983, toJSON 360-369)", "cloneFrom honors the sorobanData option to set the envelope SorobanTransactionData, consistent with the SDK using it for exactly that purpose"]
mechanism_brief = "fromJSON sets simulationTransactionData from an unvalidated sibling JSON field never cross-checked against the validated tx envelope; sign() injects it via cloneFrom as sorobanData and the invoker signs this.built.toXDR(), so a tampered multi-auth JSON makes the invoker sign a transaction with attacker-chosen resource fee/footprint."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "assembled_transaction.ts:validateInvokeContractOp"
guarantee = "validateInvokeContractOp checks only op count/type, host-function type, contract id, and method name on the envelope; it does not validate sorobanData/resource fee/footprint, so it does not block the override"

[[blockers]]
kind = "not_found"
source = "assembled_transaction.ts:fromJSON"
guarantee = "no source-proven cross-check binds simulationTransactionData to the tx envelope before it overrides sorobanData at sign time"
```
