# F973-C1: JSON-supplied sorobanData (footprint/resourceFee) injected at sign()

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/973-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The code mechanics in the hypothesis are accurate:

- `Client.txFromJSON` (`src/contract/client.ts:201-212`) `JSON.parse`s the input,
  splits off `method`, and forwards the rest to `AssembledTransaction.fromJSON`.
- `fromJSON` (`src/contract/assembled_transaction.ts:433-475`) rebuilds
  `txn.built` from the JSON `tx` (449), validates it with
  `validateInvokeContractOp` (451-454) and a method-name equality check (456-462),
  then decodes the JSON `simulationTransactionData` verbatim into
  `txn.simulationTransactionData` (470-473) with no cross-check against the
  operation.
- `validateInvokeContractOp` (`assembled_transaction.ts:377-431`) checks only
  operation count (381), type `invokeHostFunction` (389), host-function switch
  `hostFunctionTypeInvokeContract` (397), and `contractId` equality (424). It
  never inspects `sorobanData`/`resourceFee`/footprint.
- `get simulationData` (695-734) returns the JSON-supplied
  `this.simulationTransactionData` directly when set (699-703).
- `sign` (815-821) rebuilds `this.built` via
  `TransactionBuilder.cloneFrom(this.built, { fee, sorobanData:
  this.simulationData.transactionData })`; `cloneFrom`
  (`src/base/transaction_builder.ts:359`) applies `opts.sorobanData`, and
  `build()` folds `sorobanData.resourceFee()` into the total fee
  (`transaction_builder.ts:1038-1050`), which the source account pays.

So the JSON-supplied footprint and resource fee do end up in the transaction the
source account signs.

## Why It Failed

The disputed field is present in the exact bytes handed to the signer's wallet
at sign time. `sign` calls `signTransaction(this.built.toXDR(), signOpts)`
(`assembled_transaction.ts:834-835`); `this.built.toXDR()` is the complete
envelope including the `sorobanData` and the folded total `fee`. The wallet
(the signer's trust boundary) receives and approves exactly the fee and footprint
it is about to commit to. The resource fee, in particular, is the most
prominently displayed field in essentially every wallet signing UI.

This is the same dispositive basis the prior NOT_VIABLE records [1]/[2]
(route `js-sdk-0c7fd0f9cb24e9cff64db9ee`) used for the sibling args route on the
same deserialize→sign path: `fromJSON` accepts options
`Omit<AssembledTransactionOptions<T>, "args">` (`assembled_transaction.ts:434`),
so there is no application-expressed fee/footprint intent on the deserialize
route for the JSON value to "deviate" from, and the full reconstructed envelope
is forwarded to the caller-supplied `signTransaction` wallet for sign-time
inspection. The one VIABLE sibling ([3], retval, route
`js-sdk-3c0364b06a3b262ea8bd65a6`) was viable precisely because `retval` is
**absent** from the signed envelope and therefore cannot be caught at sign time.
`sorobanData`/fee/footprint are the opposite case: they are in the signed
envelope.

`build()` additionally caps the total fee at `UINT32_MAX`
(`transaction_builder.ts:1045-1050`), so any overpayment is bounded, and a wrong
footprint is rejected by on-chain host enforcement (footprint must cover actual
access), degrading to at-most inclusion-fee loss rather than fund redirection.

Under SOURCE_SCOPE/OUT_OF_SCOPE this is "behavior that is explicitly documented
as caller responsibility and has no SDK-level unsafe default or misleading API
contract": deserializing a counterparty's transaction and signing it without
re-simulation is the signer's responsibility, and the SDK honestly surfaces the
full to-be-signed envelope to the wallet.

## What This Rules Out

A new, non-duplicate parse-integrity finding on the `txFromJSON`→`sign` path
based on JSON-supplied `simulationTransactionData` (footprint + `resourceFee`)
being injected as `sorobanData` and signed/paid by the source account, given the
field is present in `built.toXDR()` and surfaced to the wallet at sign time and
the overpayment is uint32-bounded.

## What This Does Not Rule Out

- A field that is genuinely **absent** from the signed envelope yet trusted on
  the deserialize path (the live `retval` finding [3] is the example) remains a
  separate viable class.
- Non-interactive/headless signers that sign without surfacing the fee to a human
  are out of scope here (already-compromised/caller-responsibility environment)
  but could be revisited if an SDK-level unsafe default were identified.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-80ed626791b50e12afad51f7"
weakness = "json_deserialization"
record_kind = "single_path"
path = ["txFromJSON", "sign"]
sink = "sign"
sink_role = "transaction_signing_submission"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["src/contract/assembled_transaction.ts:fromJSON", "src/contract/assembled_transaction.ts:sign", "src/base/transaction_builder.ts:cloneFrom"]
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
negative_claim.rules_out_codes = ["soroban_data_present_in_signed_envelope_inspected_at_sign_time", "no_app_expressed_intent_on_deserialize_route_omit_args"]
rules_out = ["JSON-supplied sorobanData (footprint/resourceFee) injected at sign() is present in built.toXDR() forwarded to the wallet, so it is inspected at sign time; deserialize route Omit<...,'args'> expresses no fee/footprint intent to deviate from; overpayment is bounded by UINT32_MAX at build()"]
does_not_rule_out = ["fields absent from the signed envelope but trusted on the deserialize path (e.g. retval) remain a separate viable class", "non-interactive signers that never surface the fee to a human"]
assumptions = ["the documented multi-party flow has the source account deserialize the counterparty JSON via txFromJSON and sign without re-simulating", "the signing wallet receives built.toXDR() and can display the total fee/footprint"]
mechanism_brief = "JSON-supplied simulationTransactionData is injected as sorobanData into the built transaction in sign(), but the full envelope including sorobanData and the folded fee is handed to the signTransaction wallet at sign time and the overpayment is uint32-bounded, matching the prior NOT_VIABLE basis for the sibling args route."
why_failed_brief = "disputed field is present in the signed envelope and surfaced to the wallet at sign time; no app-expressed intent on the Omit-args deserialize route; overpayment uint32-bounded"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:sign"
guarantee = "sign() forwards the complete built.toXDR() (envelope incl. sorobanData and total fee) to the caller-supplied signTransaction wallet, the signer's sign-time inspection point"

[[blockers]]
kind = "bound"
source = "src/base/transaction_builder.ts:build"
guarantee = "build() folds resourceFee into the total fee and throws if it exceeds UINT32_MAX, bounding any overpayment; on-chain footprint enforcement rejects a footprint that does not cover actual access"
```
