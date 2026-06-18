# F943-C1: RPC-supplied auth-entry rootInvocation signed by user's own key

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/943-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The mechanical path is source-confirmed:

- `src/rpc/transaction.ts:100-117` — on a fresh build with no caller-supplied
  auth (`existingAuth.length === 0`), the InvokeHostFunction op's `auth` is set
  to `success.result!.auth`, i.e. the auth entries returned by the RPC
  `simulateTransaction` response. Only the top-level `func` is preserved from
  the user's build.
- `src/contract/assembled_transaction.ts:947-967` — `needsNonInvokerSigningBy`
  surfaces any address-credential entry whose signature is `scvVoid`, so an
  injected void-sig entry carrying the user's own `G...` address appears in the
  list.
- `src/contract/assembled_transaction.ts:1043-1080` — `signAuthEntries`
  iterates the RPC-supplied entries; for an entry whose address equals the
  signing `address` (default `this.options.publicKey`), it calls
  `authorizeEntry(entry, signFn, await expiration, networkPassphrase)`, where
  the preimage is built from `entry.rootInvocation()`.
- `src/contract/assembled_transaction.ts:1067-1073` — the **full preimage** is
  forwarded to the caller-supplied `signAuthEntry` as
  `sign(preimage.toXDR("base64"), { address })`.
- `src/contract/basic_node_signer.ts:36-44` — the example signer signs
  `hash(Buffer.from(authEntry,"base64"))` without inspecting the blob.

The hypothesis's two claimed bypasses are also source-confirmed: the
`NeedsMoreSignatures` guard at lines 804-812 only fires for still-`scvVoid`
non-`C` addresses, so signing the user's own address first removes it from the
unsigned set; and `validateInvokeContractOp` (377-431) binds only the top-level
`func`/method, never the auth-entry `rootInvocation`.

## Why It Failed

The candidate does not describe a deviation from correct SDK behavior; it
describes the documented Soroban auth model, and the protection lives at a
boundary the SDK genuinely cannot move:

1. **The expected behavior is not implementable.** The hypothesis asserts the
   SDK should "only let the user sign auth entries whose `rootInvocation`
   corresponds to the expressed `func`." Under Soroban's authorization model,
   auth-entry `rootInvocation`s are legitimately *distinct* from the top-level
   `func`: a single contract call (`func`) routinely triggers `require_auth`
   on sub-invocations (cross-contract transfers, co-signer authorizations) whose
   `rootInvocation` is a sub-tree, not the `func` itself. Binding auth
   `rootInvocation == func` would break all legitimate cross-contract and
   non-invoker auth. `validateInvokeContractOp` binds `func` *by design*; there
   is no correct SDK-level invariant that would also bind the auth
   `rootInvocation` to it.

2. **The auth determination inherently trusts simulation.** The SDK is a
   client; it cannot run the contract WASM locally to learn what auth a call
   requires. It must rely on the RPC `simulateTransaction` result. This is the
   same inherent trust that governs the entire simulate→assemble→sign flow
   (fees, footprint, retval, sorobanData all come from the same response). A
   malicious RPC that lies about required auth is lying about everything.

3. **The full preimage is forwarded to the signer — the documented inspection
   boundary.** `signAuthEntries` hands the complete preimage
   (`rootInvocation`, `nonce`, `signatureExpirationLedger`) to the
   caller-supplied `signAuthEntry`/wallet, which is exactly the Soroban auth
   inspection point. This is the same disposition recorded for the deserialize
   route `js-sdk-0c7fd0f9` reviewer record ("the auth-entry rootInvocation is
   forwarded in full to the wallet... no application-expressed invocation intent
   for the SDK to bind against"). The hypothesis is correct that prior record
   was scoped to the `fromJSON` path, but the reason it generalizes is
   independent of how the entry arrived: the func→rootInvocation binding is
   impossible regardless of entrypoint, so the signer remains the boundary in
   the simulate flow too.

4. **`basicNodeSigner` is a documented example, not an SDK default.** It is
   described in source as "useful for testing and maybe some simple Node
   applications. Feel free to use this as a starting point for your own
   Wallet/TransactionSigner implementation." Its blind signing is a property of
   the example signer the caller explicitly opts into, not an SDK unsafe
   default. The SDK core never defaults to blind signing.

5. **The triggering action is outside the normal self-call flow.** Self-
   authorized invocations where the source is also the authorizer use
   source-account credentials (filtered out at line 957), so
   `needsNonInvokerSigningBy` is empty and `signAuthEntries` is never invoked by
   `signAndSend`. The attack additionally requires the user to deliberately call
   `signAuthEntries({ address: ownKey })` for an address-credential entry naming
   their own key — which is the non-invoker co-signer path, where the signer is
   authorizing a sub-invocation it is responsible for inspecting.

Per the objective's OUT_OF_SCOPE clause, this is "behavior that is explicitly
documented as caller (signer) responsibility and has no SDK-level unsafe
default or misleading API contract."

## What This Rules Out

The exact typed route: a malicious/MITM RPC injecting an address-credential
auth entry for the user's own key in the `simulateTransaction` response and
having the SDK produce a user-signed `SorobanAuthorizationEntry` over an
attacker-chosen `rootInvocation`, on the basis that the SDK should bind auth
`rootInvocation` to the expressed `func`. That binding is not implementable
without breaking legitimate cross-contract/co-signer auth, and the full preimage
is forwarded to the signer for inspection.

## What This Does Not Rule Out

- A production wallet/`signAuthEntry` implementation that signs blindly without
  surfacing the decoded `rootInvocation` to the user — that would be exploitable,
  but the defect is in that wallet, not in `src/`.
- A custom `authorizeEntry` override path (line 1019) that bypasses
  `needsNonInvokerSigningBy` gating entirely.
- Any future change that made `signAndSend` auto-invoke `signAuthEntries`, which
  would change this calculus.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-21a283f9416b523123d156ca"
weakness = "signing / authorization integrity"
record_kind = "single_path"
path = ["signAuthEntry", "keypair\\n      .sign"]
sink = "keypair\\n      .sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "transaction_signing"
target_functions = ["src/contract/assembled_transaction.ts:signAuthEntries", "src/rpc/transaction.ts:assembleTransaction", "src/contract/basic_node_signer.ts:signAuthEntry", "src/contract/assembled_transaction.ts:validateInvokeContractOp"]
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
negative_claim.rules_out_codes = ["auth_rootinvocation_cannot_bind_to_func_under_soroban_crosscontract_auth", "full_preimage_forwarded_to_signer_inspection_boundary", "basic_node_signer_is_documented_example_not_sdk_default"]
rules_out = ["binding the auth-entry rootInvocation to the expressed func is not implementable without breaking legitimate cross-contract and non-invoker auth, so validateInvokeContractOp binding only func is correct, not a missing guard", "signAuthEntries forwards the full preimage (rootInvocation, nonce, expiration) to the caller-supplied signer, which is the documented Soroban auth inspection boundary", "basicNodeSigner is a documented test/example signer and starting point, not an SDK default, so its blind signing is not an SDK unsafe default"]
does_not_rule_out = ["production wallet signAuthEntry implementations that sign blindly without surfacing the decoded rootInvocation", "custom authorizeEntry override path that bypasses needsNonInvokerSigningBy gating", "a future change making signAndSend auto-invoke signAuthEntries"]
assumptions = ["RPC simulateTransaction is the only source of auth-requirement determination available to a client SDK that cannot execute the contract WASM locally", "the auth-entry rootInvocation in a Soroban call can legitimately differ from the top-level func (cross-contract and co-signer authorization)", "signAuthEntries is invoked deliberately for the non-invoker signing path, not by signAndSend in the self-authorized flow"]
mechanism_brief = "RPC simulation supplies auth entries that signAuthEntries signs for the matching address; the SDK cannot bind auth rootInvocation to the expressed func (cross-contract auth makes them legitimately distinct) and forwards the full preimage to the signer, the documented inspection boundary, so this is the Soroban auth model rather than an SDK guard gap."
why_failed_brief = "no SDK-level deviation: func->rootInvocation binding is not implementable, full preimage is forwarded to the signer boundary, basicNodeSigner is a documented example not a default, and the trigger is outside the normal self-call flow."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "design_invariant"
source = "src/contract/assembled_transaction.ts:signAuthEntries"
guarantee = "the full preimage (rootInvocation, nonce, signatureExpirationLedger) is forwarded to the caller-supplied signAuthEntry, the documented Soroban auth inspection boundary"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:validateInvokeContractOp"
guarantee = "binds the top-level func/method by design; auth rootInvocation is a distinct sub-invocation that cannot be bound to func without breaking legitimate cross-contract auth"

[[blockers]]
kind = "documented_contract"
source = "src/contract/basic_node_signer.ts:basicNodeSigner"
guarantee = "basicNodeSigner is documented as a test/example signer and starting point for the caller's own implementation, not an SDK default, so blind signing is not an SDK unsafe default"
```
