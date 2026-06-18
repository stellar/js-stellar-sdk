# F973-C2: Unvalidated auth-entry rootInvocation presented to wallet in signAuthEntries

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/973-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The code mechanics are accurate:

- `validateInvokeContractOp` (`src/contract/assembled_transaction.ts:377-431`)
  validates only the top-level operation: count, `invokeHostFunction` type,
  `hostFunctionTypeInvokeContract` switch, and `contractId` equality (424). It
  never reads `operations[0].auth`.
- `needsNonInvokerSigningBy` (947-967) and `signAuthEntries` (1038-1041) read
  the auth set from `built.operations[0].auth` — i.e. the JSON-supplied `tx`.
- `signAuthEntries` (1043-1080) iterates the entries, skips source-account
  credentials (1048-1053), filters to entries whose address equals `address`
  (1055-1061), and for those calls `authorizeEntry(entry, sign, expiration, ...)`
  where `sign` invokes the wallet's `signAuthEntry(preimage.toXDR("base64"), {
  address })` (1067-1069). So the wallet is asked to sign over the entry's
  `rootInvocation` without any SDK binding to the validated top-level
  contractId/method.

## Why It Failed

Two independent reasons.

1. **The hypothesis's expected behavior is incorrect (working-as-designed).**
   The hypothesis demands that the SDK bind each auth entry's `rootInvocation`
   to the validated top-level contractId/method. That contradicts the Soroban
   authorization model: auth entries legitimately authorize sub-invocations on
   *other* contracts. In this file's own documented atomic-swap example
   (`assembled_transaction.ts:170-256`), the top-level call is `swap` on the
   swap contract, but Bob's auth entry authorizes a `transfer` on `TOKEN_B` — a
   different contract and method by design. Binding auth entries to the top-level
   call would break the very cross-contract multi-party flow `signAuthEntries`
   exists to support. So `validateInvokeContractOp` deliberately and correctly
   does not constrain auth entries.

2. **The signed bytes are surfaced to the signer's wallet.** What Bob's wallet
   signs is exactly `preimage.toXDR("base64")` (1068-1069), the
   `HashIDPreimage` that fully determines the authorized `rootInvocation`. The
   wallet is the cryptographically required and documented approval point for
   auth-entry signing ("Your app can verify that Bob has the correct wallet
   selected, then `await tx.signAuthEntries()`", 236-243). This is the same
   dispositive basis as prior NOT_VIABLE records [1]/[2] for the sibling
   deserialize→sign path: the to-be-signed bytes are forwarded to the
   caller-supplied wallet for sign-time inspection, and `fromJSON` options are
   `Omit<...,"args">` (434) so there is no application-expressed auth intent for
   the JSON value to deviate from. The one VIABLE sibling ([3], retval) was
   viable only because `retval` is absent from the signed bytes; the auth-entry
   preimage is the opposite — it *is* the thing being signed.

Under OUT_OF_SCOPE this is "behavior explicitly documented as caller
responsibility with no SDK-level unsafe default or misleading API contract":
approving exactly what a wallet is asked to sign is the wallet/signer's role.

## What This Rules Out

A new parse-integrity finding claiming `signAuthEntries` presents an
attacker-chosen authorization to the victim wallet because
`validateInvokeContractOp` does not bind auth-entry `rootInvocation` to the
top-level contractId/method — ruled out because (a) such a binding would be
semantically wrong for cross-contract auth and (b) the exact signed preimage is
handed to the wallet for approval.

## What This Does Not Rule Out

- A defect in how the preimage itself is *constructed* (e.g. `authorizeEntry`
  signing a preimage that does not faithfully represent `entry`/`expiration`/
  network) would be a different, still-open mechanism.
- A field absent from the signed preimage but nonetheless trusted on the
  deserialize path remains a separate viable class (cf. retval finding [3]).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-80ed626791b50e12afad51f7"
weakness = "json_deserialization"
record_kind = "single_path"
path = ["txFromJSON", "signAuthEntries"]
sink = "signAuthEntries"
sink_role = "auth_entry_signing"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["src/contract/assembled_transaction.ts:validateInvokeContractOp", "src/contract/assembled_transaction.ts:signAuthEntries"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "working_as_designed_no_misleading_contract"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["auth_entry_root_invocation_legitimately_differs_from_top_level_cross_contract_auth", "auth_preimage_surfaced_to_wallet_at_sign_time"]
rules_out = ["binding auth-entry rootInvocation to the top-level contractId/method is semantically wrong (cross-contract auth, e.g. swap example authorizes transfer on a different token contract), and the exact preimage signed is handed to the signAuthEntry wallet callback (1068-1069) for approval, so there is no SDK-level unsafe default or misleading contract"]
does_not_rule_out = ["a defect in preimage construction inside authorizeEntry that misrepresents the entry/expiration/network", "fields absent from the signed preimage yet trusted on the deserialize path (cf. retval finding)"]
assumptions = ["Soroban auth entries cryptographically commit the signer to the rootInvocation contained in the preimage", "the signAuthEntry wallet callback is the documented approval boundary for what is authorized"]
mechanism_brief = "signAuthEntries signs auth entries taken from the JSON tx without binding them to the validated top-level call, but that binding is semantically wrong for cross-contract auth and the exact preimage is handed to the signer's wallet for approval."
why_failed_brief = "incorrect expected behavior (cross-contract auth entries legitimately differ from top-level) and the signed preimage is surfaced to the wallet at sign time"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:signAuthEntries"
guarantee = "authorizeEntry hands the exact preimage.toXDR('base64') (the HashIDPreimage fully determining the authorized rootInvocation) to the caller-supplied signAuthEntry wallet callback, the documented approval point"

[[blockers]]
kind = "design_invariant"
source = "src/contract/assembled_transaction.ts:validateInvokeContractOp"
guarantee = "auth entries legitimately authorize sub-invocations on other contracts (cross-contract auth, e.g. the documented swap authorizes transfer on a token contract), so not constraining them to the top-level call is required correct behavior, not a missing guard"
```
