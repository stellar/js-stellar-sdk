# F973-C3: Unvalidated invocation args on txFromJSON path signed verbatim

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/973-hypothesis-batch.md
**Candidate ID**: C3
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The code mechanics are accurate:

- `fromJSON` (`src/contract/assembled_transaction.ts:449`) builds `txn.built`
  from the JSON `tx`; the only string-level check is `xdrMethod !==
  options.method` (456-462).
- `validateInvokeContractOp` (403-428) reads `invokeContractArgs` only to compare
  `contractAddress()` (409/424) and `functionName()` (410/456); it never examines
  `invokeContractArgs.args()`.
- `sign` (815-821) rebuilds and (834-835) signs `this.built.toXDR()`, which
  carries the original JSON invocation args verbatim.

So a JSON `tx` whose top-level invoke matches the expected contractId+method but
carries different args passes both checks and is signed unchanged.

## Why It Failed

This is a typed duplicate / subsumption of prior NOT_VIABLE records [1]/[2]
(route `js-sdk-0c7fd0f9cb24e9cff64db9ee`), which cover this exact mechanism on
the same `fromJSON`→`validateInvokeContractOp`→`sign` path. Their dispositive
reasoning applies verbatim and is confirmed against current source:

1. **No application-expressed arg intent on the deserialize route.** `fromJSON`
   accepts options `Omit<AssembledTransactionOptions<T>, "args">`
   (`assembled_transaction.ts:434`). The caller of `txFromJSON` supplies no args,
   so the decoded args are the caller's own reconstructed input — there is no
   separately-expressed intended-args value for them to "deviate" from. The
   partial validation the hypothesis worries about (contractId + method) is a
   deserialization sanity check that the JSON targets this Client's contract, not
   an advertised guarantee that the full call was independently authorized.

2. **The args are present in the bytes surfaced to the signer's wallet.** `sign`
   forwards the complete `this.built.toXDR()` to the caller-supplied
   `signTransaction` wallet (834-835); the operation and its args are in that
   envelope and are the signer's sign-time inspection point. This matches the
   distinction that made the sibling retval finding [3]
   (`js-sdk-3c0364b06a3b262ea8bd65a6`) VIABLE only because retval is **absent**
   from the signed envelope — args are the opposite.

Per OUT_OF_SCOPE this is "behavior explicitly documented as caller responsibility
with no SDK-level unsafe default or misleading API contract." Re-validating a
deserialized counterparty transaction before signing is the signer's role; the
SDK honestly surfaces the full envelope to the wallet.

## What This Rules Out

A new parse-integrity finding on `txFromJSON`→`sign` based on
`invokeContractArgs.args()` being unvalidated while contractId+method are checked
— ruled out as a typed duplicate of [1]/[2]: no app-expressed arg intent exists
on the `Omit<...,"args">` deserialize route, and the args are in the signed
envelope forwarded to the wallet.

## What This Does Not Rule Out

- A field absent from the signed envelope yet trusted on the deserialize path
  (the retval finding [3]) remains a separate viable class.
- A future API change that has the application pass intended args alongside the
  JSON (removing the `Omit`) would reopen the deviation question.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-80ed626791b50e12afad51f7"
weakness = "json_deserialization"
record_kind = "single_path"
path = ["txFromJSON", "validateInvokeContractOp"]
sink = "validateInvokeContractOp"
sink_role = "envelope_validation_gate"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["src/contract/assembled_transaction.ts:fromJSON", "src/contract/assembled_transaction.ts:validateInvokeContractOp", "src/contract/assembled_transaction.ts:sign"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["typed_duplicate_of_args_not_viable_route_0c7fd0f9", "no_app_expressed_intent_on_deserialize_route_omit_args", "args_present_in_signed_envelope_inspected_at_sign_time"]
rules_out = ["unvalidated invokeContractArgs.args() on txFromJSON->sign is a typed duplicate of prior NOT_VIABLE [1]/[2]: fromJSON options Omit 'args' so no application-expressed arg intent exists, and the args are present in built.toXDR() forwarded to the signTransaction wallet for sign-time inspection"]
does_not_rule_out = ["fields absent from the signed envelope but trusted on the deserialize path (retval finding)", "a future API that passes intended args alongside the JSON, removing the Omit and reintroducing a deviation surface"]
assumptions = ["the txFromJSON caller supplies no args and reconstructs the entire transaction from the JSON", "the signing wallet receives built.toXDR() including the invocation and its args"]
mechanism_brief = "validateInvokeContractOp validates contractId and method but not args; however the deserialize route omits app-supplied args (no intent to deviate from) and the args are in the signed envelope handed to the wallet, matching prior NOT_VIABLE [1]/[2] on the same path."
why_failed_brief = "typed duplicate of prior args NOT_VIABLE route; no app-expressed arg intent on Omit-args deserialize route; args present in signed envelope and inspected at sign time"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:validateInvokeContractOp"
guarantee = "validateInvokeContractOp + fromJSON method check validate contractId and method as a deserialization sanity check; args are reconstructed caller input, not an advertised authorization guarantee"

[[blockers]]
kind = "api_contract"
source = "src/contract/assembled_transaction.ts:fromJSON"
guarantee = "fromJSON options are Omit<AssembledTransactionOptions<T>,'args'> so no application-expressed args intent exists, and sign() forwards the full built.toXDR() (incl. args) to the wallet for sign-time inspection"
```
