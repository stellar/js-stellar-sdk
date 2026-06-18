# F949C1: JSON simulationTransactionData spliced into signed envelope at sign()

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/949-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Source-confirmed the mechanism as a code fact:

- `Client.txFromJSON` (`src/contract/client.ts:201-212`) does
  `const { method, ...tx } = JSON.parse(json)` and forwards `tx` to
  `AssembledTransaction.fromJSON`.
- `fromJSON` (`src/contract/assembled_transaction.ts:433-475`) sets
  `built = TransactionBuilder.fromXDR(tx, ...)`, runs
  `validateInvokeContractOp` (`:377-431`) which checks only op-count, op-type,
  host-function-type, and contractId, then `fromJSON` checks the method name
  (`:456-462`). It deserializes `simulationTransactionData` verbatim via
  `xdr.SorobanTransactionData.fromXDR` (`:470-473`) with no binding to the
  envelope's own resource section.
- `simulationData` getter (`:695-704`) returns the stored
  `simulationTransactionData` for the deserialized object.
- `sign()` (`:814-821`) rebuilds via
  `TransactionBuilder.cloneFrom(this.built!, { fee, timebounds: undefined, sorobanData: this.simulationData.transactionData })`
  and then signs `this.built.toXDR()` (`:834-836`).

So the JSON `simulationTransactionData` does override whatever
`SorobanTransactionData` was in the deserialized `tx` envelope, and there is no
SDK consistency check between the two fields. The code fact in the hypothesis is
accurate.

## Why It Failed

The security boundary the candidate needs — "a signer authorizes a different
resource section than what is submitted" — does not exist on this path.

`sign()` hands the caller-supplied `signTransaction` wallet the FULL,
already-merged envelope: `signTransaction(this.built.toXDR(), signOpts)`
(`:834-836`), where `this.built` is the post-`cloneFrom` transaction that
already contains the spliced `sorobanData`. The XDR signature commits to exactly
those bytes, and those exact bytes are what is submitted. The authoritative
signing party therefore inspects the actual resource section it is signing; the
signed value and the submitted value are identical.

The only "divergence" the candidate identifies is between the input `tx` field
and the signed envelope. But in this threat model both the `tx` envelope's
resource section AND `simulationTransactionData` originate from the same
(untrusted) JSON producer, and `fromJSON` accepts no application-supplied args or
resource intent (`Omit<..., "args">`, `:434`). There is no
application-expressed, independent `sorobanData` intent for the SDK to violate —
only two attacker-supplied candidate values, of which the SDK deterministically
selects one and presents it to the wallet for authorization. Splicing the
serialized simulation `transactionData` back in at sign time is the documented
`toJSON`/`fromJSON` roundtrip design (`:354-369`, `:288-320`), where the
serialized resource data is the authoritative section produced by simulation.

This is the same blocker class as prior route `js-sdk-0c7fd0f9...` ("the
reconstructed envelope is forwarded in full to the caller's signTransaction
wallet, inspected at sign time"), independently re-verified in current source
for the exact sorobanData-at-sign path. Unlike the retval consumer (C2), the
sorobanData IS part of the envelope the wallet receives, so sign-time inspection
fully covers it.

## What This Rules Out

A "transaction submitted with a different Soroban resource section than the
signer authorized" integrity violation via the `fromJSON` → `sign()` path:
ruled out because the wallet receives and signs the post-merge
`this.built.toXDR()`, so the authorized bytes equal the submitted bytes and the
spliced sorobanData is fully visible at the authoritative inspection point.

## What This Does Not Rule Out

- The retval consumer (C2), which is surfaced through `get result()` and is never
  part of the envelope the wallet inspects — a genuinely different consumer.
- Application/UX confusion where a developer logs or displays the pre-sign
  `assembledTx.toXDR()` (envelope sorobanData) and trusts it instead of the
  wallet's view; that is a caller-side display concern, not an SDK signing-
  integrity bug, and is below the Medium severity floor.
- `simulationResult.auth[]` merge angle, not assessed on this exact path.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-3c0364b06a3b262ea8bd65a6"
weakness = "json_deserialization"
record_kind = "single_path"
path = ["txFromJSON", "fromJSON", "sign", "signTransaction"]
sink = "TransactionBuilder.cloneFrom"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["src/contract/assembled_transaction.ts:sign", "src/contract/assembled_transaction.ts:fromJSON", "src/contract/assembled_transaction.ts:simulationData"]
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
negative_claim.rules_out_codes = ["signed_payload_forwarded_in_full_to_wallet_inspected_at_sign_time", "no_application_expressed_sorobandata_intent_in_deserialize_flow"]
rules_out = ["sign() forwards the post-cloneFrom this.built.toXDR() (including the spliced sorobanData) to the caller's signTransaction wallet, so the authorized bytes equal the submitted bytes and the resource section is visible at the authoritative inspection point", "fromJSON omits application args/resource intent so both candidate sorobanData sources are attacker-supplied JSON with no independent SDK-honored intent to violate"]
does_not_rule_out = ["retval consumer via get result() never reaches the wallet (see C2)", "caller-side display/logging confusion below Medium floor", "simulationResult.auth merge angle on this path"]
assumptions = ["sign() always routes the to-be-signed bytes through signTransaction(this.built.toXDR()) (src/contract/assembled_transaction.ts:834-836)", "toJSON/fromJSON is the documented multi-auth roundtrip where serialized transactionData is the authoritative simulation resource section"]
mechanism_brief = "fromJSON stores JSON simulationTransactionData unvalidated and sign() splices it into the envelope via cloneFrom; however the merged envelope is signed and submitted as-is and forwarded in full to the signing wallet, so no different-than-authorized resource section reaches the network."
why_failed_brief = "signed payload (post-merge built.toXDR) is forwarded to the wallet and equals the submitted bytes; both sorobanData sources are attacker JSON with no application-expressed intent; splice is documented roundtrip design."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:sign"
guarantee = "the to-be-signed bytes are this.built.toXDR() after cloneFrom merges sorobanData, so the wallet inspects and authorizes the exact spliced resource section that is later submitted"

[[blockers]]
kind = "design_invariant"
source = "src/contract/assembled_transaction.ts:fromJSON"
guarantee = "fromJSON accepts no application-supplied args/resource intent (Omit args); both the tx-envelope sorobanData and simulationTransactionData come from the same untrusted JSON producer, so there is no SDK-honored intent for the splice to violate"
```
