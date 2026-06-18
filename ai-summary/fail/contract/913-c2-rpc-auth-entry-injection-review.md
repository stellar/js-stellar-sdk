# F913: RPC-supplied auth entries embedded in signed transaction

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/913-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The code-level mechanism is real and was confirmed in source:

- `src/rpc/transaction.ts:100-117` (`assembleTransaction`): for an
  `invokeHostFunction` op with no pre-existing auth, the embedded auth set is
  `existingAuth.length > 0 ? existingAuth : success.result!.auth` (line 115) —
  i.e. the simulation-supplied (remote RPC) auth entries are used verbatim on a
  first-time simulation. Critically, `func` and `source` (lines 108-109) are
  taken from the caller's `raw` op, not from simulation: the actual invocation
  command is caller-chosen.
- `src/contract/assembled_transaction.ts:1043-1053` (`signAuthEntries`): for
  each auth entry, `getAddressCredentials(credentials)` returning `null`
  (`src/base/auth.ts:559-573`: the `SorobanCredentialsSourceAccount` case)
  causes a `continue` — source/invoker-credential entries are not separately
  signed and instead ride the source-account envelope signature.
- `src/contract/assembled_transaction.ts:950-963` (`needsNonInvokerSigningBy`):
  source-account credentials are explicitly skipped because "they are covered by
  the envelope signature on the source account"; only address-based credentials
  for *other* accounts are surfaced for separate signing.

## Why It Failed

This is working-as-designed, and the candidate's "Expected Behavior" — that the
SDK should validate simulation auth entries against the caller-intended
invocation tree before embedding — misunderstands the design intent:

1. **Simulation is the discovery mechanism for required auth.** The SDK cannot
   derive the required `SorobanAuthorizedInvocation` tree without simulating;
   that is the documented purpose of `simulateTransaction`/`assembleTransaction`
   (transaction.ts:27-42). There is no caller-supplied "intended auth tree" to
   validate against — the simulation is how that tree is obtained.

2. **The Soroban host enforces auth at execution.** Auth entries are *demands*
   matched against the deterministic execution of the caller-chosen `func`/args,
   not *commands* that cause execution. An injected entry that does not
   correspond to an authorization actually required by the caller's intended
   call is unused (or causes the tx to fail) — it cannot grant capability the
   caller did not already trigger. This host-side enforcement is the protocol's
   real trust boundary and lives outside this repo.

3. **Source-account credentials bind only the source account.** The `continue`d
   entries authorize the source account (the caller itself), never a third
   party. A malicious RPC cannot use them to authorize a different signer, and
   any source-account sub-invocation they cover must actually occur during the
   caller's chosen call to have any effect — in which case that authorization
   was genuinely required anyway.

Consequently there is no source-provable material integrity loss or capability
gain: the worst outcome of injected auth is a failed transaction, not
unintended authorization. This falls below the Medium severity floor, and the
hypothesis itself rated it confidence=low with the host-side enforcement as
unproven anti-evidence.

## What This Rules Out

The specific typed mechanism ruled out: a malicious RPC using
`success.result!.auth` (transaction.ts:115) plus the source-account `continue`
path (assembled_transaction.ts:1049-1053) to embed auth entries that grant
authorization beyond the caller's chosen `func`/args. The invocation command is
caller-controlled, source-account credentials bind only the caller, and the
host matches provided auth against actual required auth, so injected entries
cannot broaden authorization.

## What This Does Not Rule Out

- A finding where injected/altered **address-based** (non-source) credentials
  measurably mislead a separate signer flow (`needsNonInvokerSigningBy` /
  multi-party auth signing) rather than the source-account envelope path.
- The outbound **fee** manipulation on the same serialization sink, which is
  tracked as VIABLE under C1 (route `js-sdk-37b8abbeef5856e72db630c2`).
- Footprint/ledger-key manipulation carried in the same `sorobanData`.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-37b8abbeef5856e72db630c2"
weakness = "RPC-supplied auth entries embedded in signed transaction without intent validation"
record_kind = "single_path"
path = ["assembleTransaction", "signAuthEntries", "this.bu ... nvelope"]
sink = "this.bu ... nvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/contract/assembled_transaction.ts:signAuthEntries", "src/base/auth.ts:getAddressCredentials"]
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
negative_claim.rules_out_codes = ["working_as_designed_simulation_supplies_auth_host_enforces", "below_medium_severity_floor"]
rules_out = ["injected RPC auth entries cannot grant authorization beyond the caller-chosen func/args: the invocation command is taken from the caller's raw op (transaction.ts:108-109), source-account credentials bind only the source account, and the Soroban host matches provided auth against actually-required auth so unmatched injected entries are unused or fail the tx"]
does_not_rule_out = ["address-based (non-source) credential manipulation misleading a separate multi-party signing flow", "outbound fee manipulation on the same sink (C1, viable)", "footprint/ledger-key manipulation in the same sorobanData"]
assumptions = ["the Soroban host enforces that provided SorobanAuthorizationEntry trees match the authorizations actually required by the deterministic execution of the caller-chosen invocation (protocol behavior outside this repo)", "func and source for the invocation are caller-controlled, not simulation-controlled, per transaction.ts:108-109"]
mechanism_brief = "assembleTransaction embeds RPC result.auth verbatim when no prior auth exists and signAuthEntries lets source-account-credential entries ride the envelope signature; however the caller controls func/args, source-account credentials bind only the caller, and the host enforces auth-tree matching, so injection grants no capability."
why_failed_brief = "working-as-designed: simulation is the auth-discovery mechanism and the host enforces auth-tree matching, so injected entries cannot broaden authorization; below Medium severity floor."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "func and source for the embedded invocation are taken from the caller's raw op, not simulation, so the invocation command itself is caller-intended"

[[sanitizer_guarantees]]
kind = "design_invariant"
source = "src/contract/assembled_transaction.ts:signAuthEntries"
guarantee = "source-account credentials bind only the source account (the caller) and ride the caller's own envelope signature; they cannot authorize a third party"

[[blockers]]
kind = "external_enforcement"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "the Soroban host matches provided auth entries against the authorizations actually required by the caller-chosen execution, so injected entries that do not correspond to a required authorization are unused or fail the transaction rather than broadening authorization"
```
