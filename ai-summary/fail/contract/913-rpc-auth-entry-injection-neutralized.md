# F913: RPC-supplied auth entries embedded in signed transaction (intent validation)

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/913-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The embedding the hypothesis describes is real and current:

- `src/rpc/transaction.ts:100-117` (`assembleTransaction`): for an
  invokeHostFunction op with no pre-existing auth, the resulting op's
  `auth` is set to `success.result!.auth` — the verbatim RPC simulation result
  (line 115). The host function itself (`invokeOp.func` = contract + args) is
  taken from the caller's raw op (line 109), not from simulation.
- `src/contract/assembled_transaction.ts:1043-1061` (`signAuthEntries`): for
  each embedded entry, source/invoker-credential entries
  (`getAddressCredentials === null`) are `continue`d (line 1049-1054) and ride
  the source-account envelope signature; address-credential entries whose
  address differs from the signer are also `continue`d (line 1061).
- `src/contract/assembled_transaction.ts:924-967` (`needsNonInvokerSigningBy`):
  every embedded **address-credential** entry with an unsigned (`scvVoid`)
  signature is surfaced as a required non-invoker signer.
- `src/contract/assembled_transaction.ts:804-812` (`sign`): if any such signer
  remains (non-contract), `sign()` throws `NeedsMoreSignatures` and refuses to
  produce signed bytes.

## Why It Failed

The deviation (embedding RPC `result.auth` verbatim) exists, but the source
trace shows it cannot produce a materially wrong, source-provable security
decision at or above the Medium floor:

1. **Injected address-credential entries cannot be silently authorized.** Any
   non-source credential the RPC injects appears in `needsNonInvokerSigningBy`
   (`:950-966`); `sign()` then throws `NeedsMoreSignatures` (`:804-812`) unless
   a genuine signature from that exact address is supplied. A malicious RPC
   cannot forge those third-party signatures, so it cannot cause the caller to
   submit a transaction bearing valid auth for an attacker-chosen address. The
   worst outcome is a refused/erroring sign — below the Medium severity floor.

2. **Injected source-credential entries grant nothing beyond the envelope
   signature.** These entries are `continue`d (`:1049-1054`) and authorized
   implicitly by the source-account envelope signature, which already
   authorizes source-account credentials for the caller-intended invocation.
   The invoked host function (contract + args) is caller-supplied, not from
   simulation, and Soroban host-side enforcement honors authorized invocations
   only when they match the actually-executed invocation tree. Injected source
   auth for sub-invocations that do not occur is unused; for sub-invocations
   that do occur it is already covered by the source signature. No broadened
   capability is source-provable, and the host-side behavior that would be
   required to weaponize it is out of this repo and explicitly unproven.

Both the hypothesis's own anti-evidence and this trace converge: the SDK
embeds the auth scaffold, but realistic material harm is neutralized by the
non-invoker-signing gate (attacker cannot forge signatures) and by source-auth
being bounded by the envelope signature and host tree-matching.

## What This Rules Out

The exact typed mechanism "malicious RPC `result.auth` embedded via
`assembleTransaction` line 115 and implicitly authorized in `signAuthEntries`
grants attacker-chosen authorization in the signed transaction" — ruled out at
the SDK level for both credential classes (address-credential entries blocked
by `needsNonInvokerSigningBy` + `NeedsMoreSignatures`; source-credential
entries bounded by the envelope signature) on this exact reviewed path.

## What This Does Not Rule Out

- A concrete host-side proof (out of this repo) that a crafted entry can both
  match a real sub-invocation and broaden authorization would reopen this.
- The fee/footprint sibling on the same `sorobanData` sink (C1) is unaffected
  and remains VIABLE.
- A denial-of-signing nuisance (RPC injecting an address entry to force a
  `NeedsMoreSignatures` error) exists but is below the Medium floor.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-37b8abbeef5856e72db630c2"
weakness = "RPC-supplied auth entries embedded in signed transaction without intent validation"
record_kind = "single_path"
path = ["assembleTransaction", "signAuthEntries", "this.built.toXDR"]
sink = "this.bu ... nvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/contract/assembled_transaction.ts:signAuthEntries", "src/contract/assembled_transaction.ts:needsNonInvokerSigningBy"]
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
negative_claim.rules_out_codes = ["injected_auth_gated_by_non_invoker_signing_requirement", "source_credential_auth_bounded_by_envelope_signature_and_host_tree_match"]
rules_out = ["address-credential entries injected by a malicious RPC surface in needsNonInvokerSigningBy and force sign() to throw NeedsMoreSignatures, which the attacker cannot satisfy without forging a third-party signature", "source-credential entries are continue'd and ride the source-account envelope signature, granting no capability beyond what the caller-intended invocation already authorizes"]
does_not_rule_out = ["an out-of-repo host-side proof that a crafted entry both matches a real sub-invocation and broadens authorization", "the C1 fee/footprint sibling on the same sorobanData sink", "a below-floor denial-of-signing nuisance from injected address entries"]
assumptions = ["the invoked host function (contract + args) is caller-supplied, taken from raw op not simulation (src/rpc/transaction.ts:109)", "Soroban host enforcement honors source-account auth only for actually-executed, tree-matching invocations (protocol behavior outside this repo)"]
mechanism_brief = "assembleTransaction embeds RPC result.auth verbatim when no prior auth exists; signAuthEntries implicitly authorizes source-credential entries via the envelope signature."
why_failed_brief = "embedding is real but address-credential injection is blocked by the non-invoker-signing gate (no forgeable signature) and source-credential injection is bounded by the envelope signature and host tree-matching; no source-provable material impact at the Medium floor."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:needsNonInvokerSigningBy"
guarantee = "every injected address-credential entry with an unsigned signature is surfaced as a required non-invoker signer, and sign() throws NeedsMoreSignatures until a genuine signature for that exact address is provided"

[[blockers]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:sign"
guarantee = "sign() refuses to produce signed bytes while non-contract non-invoker signers remain, so injected address auth cannot be silently submitted"
```
