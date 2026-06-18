# R1005-C2: Status-blind returnValue extraction delivers fabricated success from FAILED transactions

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/1005-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-6, high

## Trace Summary

`parseTransactionInfo` at `parsers.ts:56-64` extracts `returnValue` from V3/V4
`TransactionMeta.sorobanMeta()` unconditionally — there is no check on transaction status:

```
switch (meta.switch()) {
  case 3:
  case 4: {
    const metaV = meta.value() as xdr.TransactionMetaV3 | xdr.TransactionMetaV4;
    if (metaV.sorobanMeta() !== null) {
      info.returnValue = metaV.sorobanMeta()?.returnValue() ?? undefined;
    }
  }
}
```

`server.getTransaction` at `server.ts:766-768` calls `parseTransactionInfo(raw)` for any
response where `raw.status !== Api.GetTransactionStatus.NOT_FOUND` — this includes FAILED
responses. The resulting `foundInfo` (including `returnValue`) is spread into the final
response object via `...foundInfo` at line 777.

The TypeScript type `GetFailedTransactionResponse` (api.ts:97-109) does not include a
`returnValue` field, but this is a compile-time constraint only. At runtime, `Object.assign`
and object spread produce a plain JS object that DOES have `returnValue` when the V3/V4
meta contains `sorobanMeta`.

In `SentTransaction.result` at `sent_transaction.ts:136`, the check is
`if ("returnValue" in this.getTransactionResponse)` — a runtime presence check that
does not verify `status === SUCCESS`. For a FAILED response with V3/V4 meta, `returnValue`
IS present at runtime, so `parseResultXdr(this.getTransactionResponse.returnValue!)` is called
and returns a value to the application as if the transaction succeeded.

The `send()` method (lines 98-129) only checks for NOT_FOUND to continue polling and does not
throw on FAILED status, so FAILED responses reach the `result` getter.

## Findings

An attacker-controlled RPC server can return a `getTransaction` response with
`status: "FAILED"` and crafted V3/V4 `resultMetaXdr` containing a `sorobanMeta.returnValue`
set to any desired ScVal. The SDK will:

1. Parse the FAILED response through `parseTransactionInfo`, extracting the crafted `returnValue`
2. Spread this `returnValue` onto the response object via `Object.assign`
3. Detect `"returnValue" in this.getTransactionResponse` as true in the `result` getter
4. Call `parseResultXdr` on the fabricated `returnValue` and return it to the application

The application receives a "successful" result from a transaction that actually FAILED. This
bypasses the error path at `sent_transaction.ts:144` (`throw new Error("Transaction failed!")`)
which only triggers when `returnValue` is absent.

This bug can also occur with a legitimate (non-attacker) RPC server: any Soroban transaction
that fails but produces V3/V4 meta with sorobanMeta (which is normal Soroban behavior for
failed invocations) will have its `returnValue` extracted and delivered as a successful result.
The attacker scenario amplifies this by allowing a chosen fabricated returnValue.

Impact: the application acts on a materially wrong transaction result status. A transaction
the application believes succeeded may have actually failed, or the return value may be
entirely fabricated. If the application uses the result to confirm fund transfers, release
assets, or make signing decisions, it operates on false data.

## PoC Guidance

- **Test file**: `test/unit/contract/sent_transaction_test.ts` or `test/unit/rpc/parsers_test.ts`
- **Setup**: Construct a V3 or V4 `TransactionMeta` XDR blob with `sorobanMeta.returnValue` set to a specific ScVal (e.g., `ScVal.scvU64(42)`). Mock the RPC server's `getTransaction` response with `status: "FAILED"` and this `resultMetaXdr`.
- **Steps**: Submit a transaction via `SentTransaction.init`. After polling completes, access `sentTransaction.result`.
- **Assertion**: Assert that `sentTransaction.getTransactionResponse.status === "FAILED"` but `sentTransaction.result` returns the fabricated value (42) instead of throwing "Transaction failed!". This demonstrates the status-blind result delivery.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-c39118b8c167c49a379d45c1"
weakness = "transaction_integrity"
record_kind = "single_path"
path = ["send", "getTransaction", "parseTransactionInfo", "result"]
sink = "result"
sink_role = "result_delivery"
impact_class = "transaction_integrity"
route_family = "transaction_submission"
material_effect = "transaction_submission"
target_functions = [
  "src/rpc/parsers.ts:parseTransactionInfo",
  "src/rpc/server.ts:getTransaction",
  "src/contract/sent_transaction.ts:result",
]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = ["rpc_response"]
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["no runtime status gate exists before returnValue extraction in parseTransactionInfo (parsers.ts:56-64) or before parseResultXdr in the result getter (sent_transaction.ts:136); TypeScript type exclusion of returnValue from GetFailedTransactionResponse is compile-time only and bypassed at runtime by Object.assign/spread"]
does_not_rule_out = ["other status-sensitive fields in parseTransactionInfo that may also be misinterpreted for FAILED responses; non-soroban transaction meta versions (V0/V1/V2) which do not have sorobanMeta"]
assumptions = ["V3/V4 TransactionMeta for failed Soroban transactions can contain sorobanMeta with a returnValue; this is structurally valid XDR and occurs in normal Soroban operation; Object.assign spreads all properties regardless of TypeScript type declarations"]
mechanism_brief = "parseTransactionInfo (parsers.ts:56-64) extracts returnValue from sorobanMeta regardless of transaction status; server.getTransaction (server.ts:766-768) calls parseTransactionInfo for FAILED responses; result getter (sent_transaction.ts:136) checks only 'returnValue in response' without verifying status === SUCCESS; a FAILED response with V3/V4 meta delivers a fabricated success result to the application"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/api.ts:GetFailedTransactionResponse"
guarantee = "TypeScript type excludes returnValue from GetFailedTransactionResponse, but this is a compile-time check only; runtime Object.assign/spread bypasses it"

[[blockers]]
kind = "not_found"
source = "src/contract/sent_transaction.ts:result"
guarantee = "no runtime status check before returnValue presence check at sent_transaction.ts:136; the 'Transaction failed!' error at line 144 only triggers when returnValue is absent, not when status is FAILED"
```
