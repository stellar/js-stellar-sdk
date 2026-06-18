# R981: Numeric integer type substitution in scValToNative decode path

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/981-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-6, high

## Trace Summary

`SentTransaction.result` (sent_transaction.ts:132-139) reads `getTransactionResponse.returnValue` — an `xdr.ScVal` extracted from the post-execution transaction metadata (parsers.ts:37,63). The value passes through `parseResultXdr` → `spec.funcResToNative(method, result)` (client.ts:126-127) → `scValToNative(val, output)` (spec.ts:636).

Inside `scValToNative` (spec.ts:985-1095), the spec-declared type is available as `typeDef` (line 986: `const t = typeDef.switch(); const value = t.value`), but the switch at line 1005 dispatches on the **actual** ScVal type tag (`scv.switch().value`), not the spec type. For all integer numeric kinds — `scvU64`, `scvI64`, `scvTimepoint`, `scvDuration`, `scvU128`, `scvI128`, `scvU256`, `scvI256` — the same branch at lines 1010-1021 returns `scValToBigInt(scv) as T` without consulting `typeDef`.

`scValToBigInt` (numbers/index.ts:31-86) derives the integer type from the actual ScVal tag: `XdrLargeInt.getType(scv.switch().name)` (line 33), which slices the "scv" prefix and lowercases — e.g., `"scvI64"` → `"i64"`. The `XdrLargeInt` constructor (xdr_large_int.ts:70-72) creates a signed `Hyper` for `"i64"` vs an unsigned `UnsignedHyper` for `"u64"`. `toBigInt()` (line 116-118) returns the sign-aware interpretation.

A malicious RPC server controls `resultMetaXdr` (parsers.ts:37), which contains the `returnValue` ScVal. No guard between the RPC layer and `scValToNative` validates that the actual ScVal type tag matches the spec-declared type.

## Findings

**Impact**: A malicious or compromised Soroban RPC node can forge `getTransactionResponse.returnValue` with a signed integer ScVal type (e.g., `scvI64`) where the contract spec declares an unsigned return type (e.g., `scSpecTypeU64`). The application receives a negative BigInt from `SentTransaction.result` where only a non-negative value is valid.

**Concrete scenario**: Contract function `get_balance()` spec declares `outputs = [scSpecTypeU64]`. Real ledger execution returns `scvU64(1_000_000n)`. Malicious RPC substitutes `scvI64(-1_000_000n)` in the `returnValue` field of the transaction metadata. The application reads `SentTransaction.result` as the authoritative post-execution outcome and receives `BigInt(-1_000_000n)`. A check like `balance > 0n` evaluates false, causing the application to incorrectly treat the account as empty or trigger error-handling paths.

**Mechanism distinctness from struct confusion**: The confirmed VIABLE under `js-sdk-26a2c419baf9cb084b019288` documents `structToNative` positional field misassignment (spec.ts:1156-1162). This finding documents a different code path (spec.ts:1010-1021 → `scValToBigInt` → `XdrLargeInt`), a different ScVal family (integer scalars, not struct/map), and a different impact pattern (sign confusion producing negative values, not field reordering). The prior subsumption claims in fail records (routes `js-sdk-500a631bc8106478c89fe491` and `js-sdk-a7b32e6177a6e7a129c7468b`) specifically listed "void/bool/u32/i32/bytes/address" and did not trace the large integer path through `scValToBigInt` → `XdrLargeInt` sign-aware construction.

**Severity justification**: Medium per "Remote RPC response decoded into a materially wrong … return value." The result is the authoritative post-execution contract return value consumed by application logic, not an advisory simulation preview.

## PoC Guidance

- **Test file**: `test/unit/spec/contract_spec_test.js` or a new file `test/unit/spec/scval_numeric_type_test.js`
- **Setup**: Construct a `Spec` from a contract spec that declares a function returning `scSpecTypeU64`. Build an `scvI64` ScVal with a negative value (e.g., `xdr.ScVal.scvI64(new xdr.Int64(-1_000_000n))`).
- **Steps**: Call `spec.funcResToNative("method_name", forgedScVal)`.
- **Assertion**: Assert the returned BigInt is negative (`result < 0n`), demonstrating that the spec-declared unsigned type was not enforced and the actual signed type tag controlled the interpretation.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-dfb2ac9b8611377f55d03e10"
weakness = "type_confusion"
record_kind = "single_path"
path = ["SentTransaction.result", "parseResultXdr", "funcResToNative", "scValToNative", "scValToBigInt"]
sink = "scValToBigInt"
sink_role = "result_decode"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "re-investigate residual lead"
target_functions = [
  "src/contract/sent_transaction.ts:result",
  "src/contract/spec.ts:scValToNative",
  "src/base/numbers/index.ts:scValToBigInt",
]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "post_execution_result_decode"
scope.auth_state = "post_execution"
scope.attacker_control = "rpc_response_returnValue_scval_type_tag"
scope.parser_state = "xdr_decoded_scval"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_by_prior_struct_subsumption", "candidate_not_blocked_after_source_trace"]
rules_out = ["prior VIABLE js-sdk-26a2c419baf9cb084b019288 documents structToNative positional field confusion (spec.ts:1156-1162), not the numeric integer sign substitution through scValToBigInt (spec.ts:1010-1021 -> numbers/index.ts:31-86 -> xdr_large_int.ts:70-72); different code path, different ScVal family, different impact pattern", "prior fail records (routes js-sdk-500a631bc8106478c89fe491, js-sdk-a7b32e6177a6e7a129c7468b) that claimed broad subsumption listed void/bool/u32/i32/bytes/address specifically and did not trace the large integer path through XdrLargeInt sign-aware construction"]
does_not_rule_out = ["struct field confusion via structToNative positional misassignment (already VIABLE under js-sdk-26a2c419baf9cb084b019288)", "same numeric substitution applied within a Result<u64,E> ok branch via funcResToNative:634", "u32/i32 substitution via scvU32/scvI32 returning scv.value() directly without spec-type check (spec.ts:1064-1069)"]
assumptions = ["malicious RPC server controls getTransactionResponse.returnValue ScVal type tag via forged resultMetaXdr (parsers.ts:37)", "application trusts SentTransaction.result as authoritative post-execution output without independent ledger verification", "XdrLargeInt sign-aware construction confirmed: i64 -> Hyper (signed) at xdr_large_int.ts:72, u64 -> UnsignedHyper (unsigned) at xdr_large_int.ts:83"]
mechanism_brief = "scValToNative dispatches on actual ScVal type tag (scv.switch().value) not spec-declared type (typeDef.switch().value) for integer numerics at spec.ts:1010-1021; scValToBigInt constructs XdrLargeInt using the actual type as sign key, so scvI64(-amount) forged for scSpecTypeU64 return produces a negative BigInt in SentTransaction.result"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/sent_transaction.ts:result"
guarantee = "'returnValue' in getTransactionResponse key-presence check (sent_transaction.ts:136) does not validate ScVal type tag against spec-declared type"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:scValToNative"
guarantee = "typeDef is available as parameter (spec.ts:985) and extracted at line 986-987 but is not consulted in the integer branch (lines 1010-1021); dispatch is on scv.switch().value only"

[[blockers]]
kind = "not_found"
source = "src/contract/spec.ts:scValToNative"
guarantee = "no guard between RPC response parsing (parsers.ts:37,63) and scValToBigInt (numbers/index.ts:31) validates that actual ScVal type tag matches spec-declared integer type"
```
