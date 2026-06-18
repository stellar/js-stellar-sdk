# F925C2: signAuthEntries signs rootInvocation without intent binding

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/925-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced `signAuthEntries` (985-1081), `needsNonInvokerSigningBy` (924-967),
`validateInvokeContractOp` (377-431), and the `basicNodeSigner.signAuthEntry`
helper (basic_node_signer.ts:36-44).

Source facts in the hypothesis are accurate:
- `signAuthEntries` reads auth entries straight from
  `this.built.operations[0].auth` (1038-1041), i.e. the deserialized envelope.
- For each entry whose `authEntryAddress === address` (1061), it calls
  `authorizeEntry(entry, sign, expiration, networkPassphrase)` (1065-1079) and
  the wallet signs `preimage.toXDR("base64")` (1068-1069).
- The only content check is the address match (1061) plus the
  `needsNonInvokerSigningBy` filter (1020-1030); the rootInvocation contents are
  never compared against any application intent, and `validateInvokeContractOp`
  only inspects the top-level op, never `operations[0].auth`.

## Why It Failed

The candidate again misstates the expected behavior. `signAuthEntries` is the
documented multi-auth primitive (905-922): a party deserializes a transaction
they received and authorizes the auth entries for their address. The entries
to be authorized **are** the input — the application expresses no separate
"intended invocation tree" through `fromJSON`/`signAuthEntries` for the SDK to
bind against. By design you authorize the invocation present in the
transaction handed to you; trusting or inspecting that transaction is the
signer's job under the Soroban authorization model.

Critically, the SDK forwards the full authorization preimage
(`preimage.toXDR("base64")`, 1068-1069) to the caller-supplied `signAuthEntry`
callback. The preimage is the `HashIDPreimage` for the Soroban authorization,
which carries the entire `rootInvocation` (contract, function, args, and
sub-invocations). A correct wallet decodes and displays it before signing —
this is exactly the inspection point the auth model requires. The SDK provides
the data needed to inspect; it does not and cannot manufacture an "intended"
tree in the deserialize-and-sign flow.

The SDK ships no unsafe production default that signs blindly: `basicNodeSigner`
hashes and signs the preimage without inspection (basic_node_signer.ts:36-44),
but it is explicitly caveated as "useful for testing and maybe some simple Node
applications… a starting point for your own Wallet" (basic_node_signer.ts:8-10).
Relying on it for adversarial multi-auth is the documented caller
responsibility, not an SDK-level unsafe default or misleading contract.

This is working-as-designed signer behavior, where the signer authorizes the
invocation tree it was given and the SDK forwards the full preimage for
inspection. It does not constitute an SDK integrity bug at Medium+.

## What This Rules Out

Rules out a confirmed Medium+ finding on
`fromJSON`/`fromXDR` -> `signAuthEntries` based on the absence of a
rootInvocation-vs-intent binding: no application-expressed invocation intent
exists in this flow, and the SDK forwards the complete authorization preimage
to the caller's `signAuthEntry` for inspection as the Soroban auth model
requires.

## What This Does Not Rule Out

- Envelope-level argument confusion via `sign()` (candidate C1), assessed
  separately.
- `sorobanData` injection already VIABLE under
  `js-sdk-1704e35f985caf506dd6a0f1`.
- A future API that accepts an application-supplied expected invocation tree
  and then fails to enforce it before signing.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-0c7fd0f9cb24e9cff64db9ee"
weakness = "auth-entry rootInvocation signed without binding to validated application intent"
record_kind = "single_path"
path = ["<anonymous>", "fromXDR", "signAuthEntries"]
sink = "signAuthEntries"
sink_role = "auth_entry_signing"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/contract/assembled_transaction.ts:signAuthEntries", "src/contract/assembled_transaction.ts:validateInvokeContractOp", "src/contract/assembled_transaction.ts:fromJSON"]
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
negative_claim.rules_out_codes = ["auth_entry_invocation_is_signer_inspection_responsibility", "full_preimage_forwarded_no_intended_tree_expressed"]
rules_out = ["signAuthEntries authorizes the auth entries present in the received transaction by design and no separate application-expressed invocation intent exists in the fromJSON flow for the SDK to bind against", "the SDK forwards the complete authorization preimage (rootInvocation tree) to the caller-supplied signAuthEntry callback at assembled_transaction.ts:1068-1069, providing the inspection point the Soroban auth model requires", "the only SDK-shipped blind signer (basicNodeSigner) is explicitly caveated as testing/starting-point, so there is no unsafe production default"]
does_not_rule_out = ["envelope-level arg confusion via sign() covered by C1", "sorobanData injection already VIABLE under js-sdk-1704e35f985caf506dd6a0f1", "a future API accepting an expected invocation tree that is then unenforced before signing"]
assumptions = ["stellar-base authorizeEntry derives the signed preimage from the entry rootInvocation as documented", "a production multi-auth signer supplies an inspecting wallet rather than the explicitly-caveated basicNodeSigner"]
mechanism_brief = "signAuthEntries signs the authorizeEntry preimage of each address-matched auth entry's rootInvocation with no intent binding, but the rootInvocation is the input by design, the full preimage is forwarded to the signer for inspection per the Soroban auth model, and the SDK ships no blind-signing production default."
why_failed_brief = "working-as-designed signer behavior; no application-expressed invocation intent exists in the deserialize-and-sign flow and the full authorization preimage is forwarded to the caller's signAuthEntry for inspection."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:signAuthEntries"
guarantee = "signAuthEntries filters entries by needsNonInvokerSigningBy and authEntryAddress === address (assembled_transaction.ts:1020-1061) and forwards the full authorization preimage to the caller-supplied signAuthEntry callback for inspection (1068-1069)"

[[blockers]]
kind = "design_contract"
source = "src/contract/assembled_transaction.ts:signAuthEntries"
guarantee = "the auth-entry rootInvocation is the deserialized input the signer chose to authorize and is forwarded in full to the wallet, so under the Soroban auth model there is no application-expressed invocation intent for the SDK to bind and inspection is the documented signer responsibility"
```
