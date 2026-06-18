# F943-C2: RPC-derived signatureExpirationLedger widens auth replay window

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/943-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The mechanical path is source-confirmed:

- `src/contract/assembled_transaction.ts:985-987` — the default `expiration` for
  `signAuthEntries` is `(await this.server.getLatestLedger()).sequence + 100`,
  i.e. derived from a remote RPC call.
- `src/contract/assembled_transaction.ts:1065-1078` — `await expiration` is
  passed straight into `authorizeEntry`, where it becomes the
  `signatureExpirationLedger` baked into the signed preimage.
- `src/contract/basic_node_signer.ts:36-44` — the example signer applies no
  bound on the value.

So a malicious/MITM RPC that returns an inflated `getLatestLedger().sequence`
makes the `signatureExpirationLedger` of any user-signed auth entry far larger
than the documented "~8.3 minutes" window.

## Why It Failed

The candidate identifies a real RPC-derived input but does not describe an
SDK-fixable deviation:

1. **No trusted local ledger clock exists.** Ledger sequence is a network
   concept; a client SDK has no trusted local source for "the current ledger
   sequence." The hypothesis's expected behavior ("bounded by a trusted local
   clock/policy") is not implementable — the *base* of any expiration must come
   from the network, and `getLatestLedger` is the SDK's only source. The
   relative offset the SDK adds (`+ 100`) is exactly the kind of local bound
   that is implementable, and it is present.

2. **Same trust boundary as the rest of the flow.** The RPC that can inflate
   `getLatestLedger` is the same RPC supplying the simulation auth, fees,
   footprint, and submission. A malicious RPC compromises the whole flow; the
   expiration window is one symptom, not an independent SDK bug.

3. **The value is forwarded to the signer, and is caller-overridable.** The
   `signatureExpirationLedger` is part of the preimage handed to the
   caller-supplied `signAuthEntry` (the inspection boundary), and the caller may
   pass an explicit `expiration` to `signAuthEntries`. The default is documented
   in source as "about 8.3 minutes from now."

4. **Impact is contingent on C1.** A widened expiration only matters if there
   is a replayable signed authorization for an attacker to lift — i.e. it
   "compounds C1 rather than [being] a standalone High," as the hypothesis
   itself states. With C1 dispositioned NOT_VIABLE under the Soroban auth /
   signer-inspection model, the standalone window-extension does not reach the
   Medium integrity bar: there is no SDK-level decoding error and no misleading
   security contract beyond the documented, overridable default.

## What This Rules Out

The exact typed route: a malicious RPC inflating `getLatestLedger().sequence` to
extend the `signatureExpirationLedger` of a user-signed auth entry beyond its
intended short window, treated as an SDK-fixable bug. The SDK has no trusted
local ledger clock to bound the base against, forwards the value to the signer,
and exposes an explicit caller override.

## What This Does Not Rule Out

- A caller who relies on the documented "~8.3 minutes" default without passing
  an explicit `expiration` and uses an untrusted RPC — defense-in-depth (e.g. a
  sanity cap or warning on absurd RPC sequence jumps) could still be a
  hardening improvement, but it is not a current-source security bug.
- The compounding effect with a genuinely replayable signed authorization, were
  one to exist via a different, viable route.

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
target_functions = ["src/contract/assembled_transaction.ts:signAuthEntries", "src/contract/basic_node_signer.ts:signAuthEntry"]
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
negative_claim.rules_out_codes = ["ledger_sequence_inherently_network_sourced_no_local_clock", "expiration_forwarded_in_preimage_to_signer", "default_expiration_documented_and_caller_overridable"]
rules_out = ["the signatureExpirationLedger base (current ledger sequence) is inherently a network value; the SDK has no trusted local ledger clock, so bounding it by a local clock as the hypothesis expects is not implementable", "the expiration is part of the preimage forwarded to the caller-supplied signer and is overridable via an explicit expiration argument, with the default documented as ~8.3 minutes"]
does_not_rule_out = ["defense-in-depth caps or warnings on implausible RPC ledger-sequence jumps as a hardening improvement", "compounding window-extension if a genuinely replayable signed authorization existed via another viable route"]
assumptions = ["a client SDK has no trusted local source of the current ledger sequence and must obtain it from RPC", "the same RPC trust boundary governs simulation auth, fees, footprint, and submission, so an inflated getLatestLedger is not an independent escalation", "standalone window-extension without a replayable signed authorization does not reach the Medium integrity bar"]
mechanism_brief = "Default signatureExpirationLedger is derived from getLatestLedger RPC; a malicious RPC can inflate it, but ledger sequence is inherently network-sourced with no trusted local clock, the value is forwarded to the signer and is caller-overridable, and impact only matters as a compounding factor on a replayable signed authorization."
why_failed_brief = "no SDK-fixable deviation: no trusted local ledger clock exists, expiration is forwarded to the signer and caller-overridable, and standalone window-extension does not reach Medium without a viable replay route."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "design_invariant"
source = "src/contract/assembled_transaction.ts:signAuthEntries"
guarantee = "the signatureExpirationLedger is part of the signed preimage forwarded to the caller-supplied signer, and an explicit expiration argument overrides the RPC-derived default"

[[blockers]]
kind = "environment_constraint"
source = "src/contract/assembled_transaction.ts:signAuthEntries"
guarantee = "ledger sequence is inherently a network value obtained via RPC; the SDK has no trusted local ledger clock to bound the expiration base against, so the RPC-derived base is the only available source"
```
