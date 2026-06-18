# F925C1: validateInvokeContractOp omits arg check before sign()

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/925-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced `assembled_transaction.ts` `validateInvokeContractOp` (377-431),
`fromJSON` (433-475), `fromXDR` (492-520), and `sign` (766-845).

The source facts in the hypothesis are accurate:
- `validateInvokeContractOp` checks operation count (381), `invokeHostFunction`
  type (389), `hostFunctionTypeInvokeContract` switch (397), and contract
  address equality (424). It returns `invokeContractArgs` (430) without ever
  reading `invokeContractArgs.args()`.
- `fromJSON` (458) and `fromXDR` (511) add only a method-name equality check.
- `sign` (815-835) rebuilds `this.built` via `cloneFrom` and forwards
  `this.built.toXDR()` to the caller-supplied `signTransaction` callback.

So contract arguments are not validated between decode and signing. That part
of the hypothesis is source-confirmed.

## Why It Failed

The candidate misstates the expected behavior. `fromJSON`/`fromXDR` are
deserialize-and-reconstruct APIs that, by design, take the entire call —
including arguments — from the serialized input. These entry points accept
**no application-supplied args** (`fromJSON` options are
`Omit<..., "args">`, 434; `fromXDR` is `Omit<..., "args" | "method" | ...>`,
494). There is therefore no application-expressed argument intent for the
decoded args to "deviate" from. The args are whatever the caller chose to
deserialize.

`validateInvokeContractOp` does exactly what its docstring states: "Validate
that a built transaction is a single invokeContract operation targeting the
expected contract" (374-376). It does not claim to validate arguments, and the
contract+method checks exist to route the reconstructed transaction to the
correct `Client`/`parseResultXdr` and reject wrong-contract envelopes — not as
an argument-binding security boundary. The docstring is honest ("targeting the
expected contract"), so there is no misleading API contract that over-promises
argument validation.

For the `sign()` path to authorize attacker-chosen args, the victim must
deserialize an untrusted counterparty envelope and sign it as the transaction
**source account**, making their own account the authorizer. `sign()` forwards
the complete `this.built.toXDR()` to the caller-supplied `signTransaction`
wallet (834-837) for inspection; the SDK ships no unsafe production signer
(`basicNodeSigner` is explicitly caveated as testing/"a starting point",
basic_node_signer.ts:8-10). Blind-signing a fully-provided remote envelope is
the documented caller/wallet responsibility under the Soroban model, with the
full XDR available for display. This is working-as-designed deserialization,
not an SDK integrity bug.

## What This Rules Out

Rules out a confirmed Medium+ finding on the exact path
`fromJSON`/`fromXDR` -> `validateInvokeContractOp` -> `sign` based on the
absence of an `invokeContractArgs.args()` check: there is no
application-expressed arg intent to violate, the gate is honestly documented,
and the full envelope is forwarded to the signer for inspection.

## What This Does Not Rule Out

- A future variant where `fromJSON`/`fromXDR` (or a higher-level Client API)
  begins accepting an application-supplied expected-args parameter and then
  fails to enforce it.
- Auth-entry invocation-tree signing via `signAuthEntries` (candidate C2),
  assessed separately.
- `scValToNative`-family result-decode confusion already VIABLE under
  `js-sdk-26a2c419baf9cb084b019288`.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-0c7fd0f9cb24e9cff64db9ee"
weakness = "post-decode validation gate omits contract arguments before signing"
record_kind = "single_path"
path = ["<anonymous>", "fromXDR", "validateInvokeContractOp", "sign"]
sink = "sign"
sink_role = "transaction_signing"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/contract/assembled_transaction.ts:validateInvokeContractOp", "src/contract/assembled_transaction.ts:fromJSON", "src/contract/assembled_transaction.ts:sign"]
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
negative_claim.rules_out_codes = ["deserialize_and_sign_is_caller_responsibility_no_arg_intent_expressed", "validation_gate_honestly_documented_no_misleading_contract"]
rules_out = ["fromJSON/fromXDR accept no application-supplied args (Omit<...,'args'>), so the decoded args are the caller's own chosen input and there is no application-expressed arg intent for them to deviate from", "validateInvokeContractOp docstring claims only contract targeting, not arg validation, so the contract+method check is a routing/type guard not a misleading security promise", "sign() forwards the full this.built.toXDR() envelope to the caller-supplied signTransaction wallet for inspection, so there is no unsafe SDK default"]
does_not_rule_out = ["a future variant where an expected-args parameter is accepted and then unenforced", "auth-entry rootInvocation signing via signAuthEntries covered by C2", "scValToNative-family result decode confusion already VIABLE under js-sdk-26a2c419baf9cb084b019288"]
assumptions = ["the multi-auth envelope signer is the transaction source account responsible for what it authorizes", "a production caller supplies its own inspecting wallet rather than the explicitly-caveated basicNodeSigner"]
mechanism_brief = "validateInvokeContractOp checks contract address and method name but not invokeContractArgs.args(); however fromJSON/fromXDR take args from the serialized input by design, the gate is honestly documented as contract-targeting only, and sign() forwards the full envelope to the signer, so there is no application-expressed arg intent to violate and no misleading contract."
why_failed_brief = "working-as-designed deserialize-and-sign; no application-expressed arg intent exists through fromJSON/fromXDR and the gate honestly documents contract-only checking while the full envelope is forwarded to the signer."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:validateInvokeContractOp"
guarantee = "validateInvokeContractOp confirms operation count, invokeHostFunction/invokeContract type, contract address, and (via fromJSON/fromXDR) method name, and its docstring scopes itself to contract targeting only (assembled_transaction.ts:374-430)"

[[blockers]]
kind = "design_contract"
source = "src/contract/assembled_transaction.ts:fromJSON"
guarantee = "fromJSON/fromXDR accept no application-supplied args and forward the full reconstructed envelope to the caller-supplied signTransaction wallet, so the decoded args are caller-chosen input inspected at sign time rather than a violated application intent"
```
