# F914: Path blocked: source-account auth entry cannot broaden authorization beyond user-controlled func

**Subsystem**: contract
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/contract/914-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`assembleTransaction -> signAuthEntries -> this.built.toXDR`

Residual question (escalated): can a malicious-RPC-crafted auth entry both
match a real sub-invocation and broaden authorization once it rides in the
user-signed envelope?

## Blocker

The escalation hinges on the only auth class the SDK forwards without a signing
gate: source-account credentials (`getAddressCredentials` returns `null` for
them, `src/base/auth.ts:570`), which `needsNonInvokerSigningBy` and
`signAuthEntries` both skip, so `sign()` never throws `NeedsMoreSignatures`.
But in `assembleTransaction` the attacker-controlled simulation supplies only
`auth` (`success.result!.auth`, `src/rpc/transaction.ts:115`) while `func` is
copied verbatim from the user's raw op (`invokeOp.func`,
`src/rpc/transaction.ts:109`). Auth entries gate require_auth checks; they do
not create sub-invocations. The executed sub-invocation tree is fixed by the
user-controlled `func`, and a source-account credential only authorizes the
source account. So an injected entry can at most match a sub-invocation the
user's own call already performs — exactly what signing M(args) inherently
authorizes. "Matches a real sub-invocation" therefore cannot coincide with
"broadens authorization."

## Evidence

- `src/rpc/transaction.ts:109,115` - attacker controls `auth` from simulation but `func` is taken from the user's raw op, so the sub-invocation set is not attacker-controlled.
- `src/base/auth.ts:559-572` - `getAddressCredentials` returns `null` for source-account credentials, the only entry class the SDK forwards unsigned.
- `src/contract/assembled_transaction.ts:950-967` - `needsNonInvokerSigningBy` filters out source-account entries (null) and unsigned address entries it returns.
- `src/contract/assembled_transaction.ts:804-812` - `sign()` throws `NeedsMoreSignatures` for any remaining non-invoker non-contract signer, blocking injected address-credential entries (prior route).
- `src/contract/assembled_transaction.ts:1049-1053` - `signAuthEntries` `continue`s on null (source-account) credentials, never re-signing them.

## Negative Scope

- Rules out: a malicious RPC injecting a source-account-credential auth entry that broadens what the source account authorizes, because the executed sub-invocation set is bounded by the user-controlled `func` and the host requires each entry to match a real sub-invocation.
- Does not rule out: the separately-confirmed VIABLE resource-fee route on this same `route_id` (unbounded RPC `resourceFee` entering the signed envelope), nor host-side nondeterminism where contract state between simulate and submit changes which source-account sub-invocations execute.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-37b8abbeef5856e72db630c2"
weakness = "transaction_serialization"
record_kind = "residual_escalation"
path = ["assembleTransaction", "signAuthEntries", "this.built.toXDR"]
sink = "this.built.toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/contract/assembled_transaction.ts:signAuthEntries", "src/contract/assembled_transaction.ts:needsNonInvokerSigningBy", "src/base/auth.ts:getAddressCredentials"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["source_account_auth_bounded_by_user_controlled_func", "injected_auth_gates_not_triggers_subinvocations"]
rules_out = ["a malicious-RPC source-account auth entry broadening authorization, since func is user-controlled and source-account credentials only authorize sub-invocations the user's own call already performs"]
does_not_rule_out = ["unbounded RPC resourceFee on same route_id (separately VIABLE)", "simulate-vs-submit state nondeterminism changing executed source-account sub-invocations"]
assumptions = ["host (out-of-repo) requires each consumed auth entry to match a real require_auth call in the recorded invocation tree, per Soroban auth semantics"]
mechanism_brief = "RPC controls only auth not func; source-account credentials forwarded unsigned can only authorize sub-invocations the user-controlled func already makes, so they match real sub-invocations without broadening authorization."
why_failed_brief = "source-account auth entries gate rather than trigger execution and the executed sub-invocation set is fixed by user-controlled func; no SDK path adds a new authorized sub-invocation."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "func is copied from the user raw op (rpc/transaction.ts:109), not from the attacker-controlled simulation, so the executed sub-invocation set is user-bounded"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "address-credential injected entries are caught by needsNonInvokerSigningBy and force sign() to throw NeedsMoreSignatures (assembled_transaction.ts:804-812)"

[[blockers]]
kind = "invariant"
guarantee = "source-account credentials authorize only the source account for sub-invocations that actually execute; auth entries cannot create new sub-invocations"
```
