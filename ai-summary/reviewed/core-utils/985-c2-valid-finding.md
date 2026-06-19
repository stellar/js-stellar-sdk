# R985-C2: AssembledTransaction.fromXDR Method-Confusion in Multi-Party Signing

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/985-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-6, high

## Trace Summary

Traced the `fromXDR` and `fromJSON` deserialization paths and their validation behavior:

1. `AssembledTransaction.fromXDR` (src/contract/assembled_transaction.ts:492-520) has the type signature `Omit<AssembledTransactionOptions<T>, "args" | "method" | "parseResultXdr">` for its `options` parameter. The `method` field is explicitly excluded from the options type, so the caller **cannot** provide an expected method for validation.

2. At line 511, the method is read directly from the attacker-controlled XDR: `const method = invokeContractArgs.functionName().toString("utf-8")`. No validation against any expected value occurs.

3. `validateInvokeContractOp` (line 377-431) is called at line 506-508 and validates:
   - Operation count is exactly 1 (line 381-385)
   - Operation type is `invokeHostFunction` (line 389-393)
   - Host function type is `invokeContract` (line 397-401)
   - Contract ID matches `options.contractId` (line 423-428)
   - Function name is extracted (line 410) but **not** validated against any expected value

4. In contrast, `AssembledTransaction.fromJSON` (line 433-475) accepts the full `options` object including `method`, and validates at lines 456-462:
   ```
   const xdrMethod = invokeContractArgs.functionName().toString("utf-8");
   if (xdrMethod !== options.method) {
     throw new Error(`Transaction envelope calls method '${xdrMethod}', but the provided method is '${options.method}'.`);
   }
   ```

5. The `fromXDR` type signature actively prevents passing `method`, so even a security-conscious caller cannot use the existing validation infrastructure.

## Findings

In the multi-party Soroban signing flow, Party A serializes a transaction with `toXDR()` and transmits the base64 XDR to Party B. If an attacker substitutes the XDR in transit (via MITM on URL, QR code, or plaintext channel), Party B calls `AssembledTransaction.fromXDR(options, attackerXDR, spec)` and the SDK reads the method from the attacker-controlled XDR without validation.

The `contractId` check in `validateInvokeContractOp` constrains the attacker to methods on the same contract, but this still allows substitution to any other method on that contract (e.g., `burn`, `drain_funds`, `approve` instead of `transfer`). Party B then signs and submits a transaction calling the attacker's chosen method.

This is a High severity finding because:
- The type system actively prevents callers from providing method validation in `fromXDR`, unlike `fromJSON`
- The multi-party signing flow is the documented primary use case for `fromXDR`
- An attacker who can substitute the XDR (feasible for URL/QR/plaintext channels) can change the method to any function on the same contract
- Party B has no SDK-level protection; manual inspection of `txn.options.method` is possible but not prompted or required

## PoC Guidance

- **Test file**: `test/unit/spec/assembled_transaction_test.js` or a new `test/unit/contract/fromxdr_method_test.js`
- **Setup**: Create a valid `AssembledTransaction` for method `transfer` on a contract, serialize with `toXDR()`, then create a second transaction for method `burn` on the same contract and serialize it
- **Steps**: Call `AssembledTransaction.fromXDR(options, burnXDR, spec)` where `burnXDR` is the attacker-substituted XDR. Verify that `fromXDR` succeeds without error and that `txn.options.method` equals `burn`, not `transfer`
- **Assertion**: Demonstrate that `fromXDR` accepts any method without validation, while `fromJSON` with the same `burn` XDR and `method: "transfer"` in options throws `"Transaction envelope calls method 'burn', but the provided method is 'transfer'"`

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-4bffeef38fbfee0e8fc501e8"
weakness = "xdr_decode"
record_kind = "single_path"
path = ["AssembledTransaction.fromXDR", "validateInvokeContractOp", "sign"]
sink = "sign"
sink_role = "tx_signing"
impact_class = "wrong_tx_signing"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/contract/assembled_transaction.ts:AssembledTransaction.fromXDR", "src/contract/assembled_transaction.ts:validateInvokeContractOp"]
scope.trust_boundary = "application_configuration"
scope.protocol_phase = "multi_party_signing"
scope.auth_state = "caller_configured"
scope.attacker_control = "base64_xdr_input"
scope.parser_state = "configuration_loaded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["no function-name validation exists in AssembledTransaction.fromXDR; the options type explicitly Omit<..., 'method'> prevents callers from passing an expected method; validateInvokeContractOp checks contractId (line 423) but not functionName; fromJSON validates method (line 456-462) confirming the validation infrastructure exists but is not wired into fromXDR"]
does_not_rule_out = ["same mechanism via fromJSON if options.method is not caller-validated against the expected value", "other multi-party signing XDR substitution vectors beyond method (e.g., args, source account)"]
assumptions = ["attacker can intercept or substitute encodedXDR on the multi-party signing channel (URL, QR code, plaintext storage)", "Party B (signer) does not independently validate txn.options.method before signing", "the transmitted XDR is not integrity-protected by Party A's signature or a secure channel"]
mechanism_brief = "AssembledTransaction.fromXDR reads method from XDR (line 511) without validating against any expected value; the options type Omit<..., 'method'> actively prevents callers from providing method for validation; validateInvokeContractOp checks contractId (line 423) but not functionName; asymmetric with fromJSON which validates method at lines 456-462. Attacker-substituted XDR with a different method on the same contract passes all validation and is signed."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:validateInvokeContractOp"
guarantee = "contractId validation at line 423-428 constrains attacker to methods on the same contract; does not validate functionName"

[[blockers]]
kind = "not_found"
source = "src/contract/assembled_transaction.ts:AssembledTransaction.fromXDR"
guarantee = "no source-proven function-name validation in fromXDR; the type signature Omit<..., 'method'> prevents callers from providing the expected method for comparison"
```
