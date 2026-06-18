# F913-C2: RPC-supplied auth entries embedded in signed Soroban transaction

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/913-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the auth-embedding path in current source:

- `src/rpc/transaction.ts:100-117`: for an `invokeHostFunction` op with no
  pre-existing auth, `assembleTransaction` sets `auth: existingAuth.length > 0 ?
  existingAuth : success.result!.auth`. So when the caller's raw op has no auth,
  the RPC simulation's `result.auth` is embedded verbatim. The host function
  itself (`func` = contract + args) is taken from the caller's `raw` op, not from
  simulation.
- `src/base/auth.ts:559-571` (`getAddressCredentials`): source-account
  credentials fall into the `default` branch and return `null`; only
  `Address`/`AddressV2`/`AddressWithDelegates` credentials return a non-null
  address-credential object.
- `src/contract/assembled_transaction.ts:1043-1061` (`signAuthEntries`): entries
  whose `getAddressCredentials` is `null` (source-account credentials) are
  `continue`d — left to ride the source-account envelope signature. Address
  credentials matching the caller's `address` are signed; others are left for
  external signers.
- `src/contract/assembled_transaction.ts:950-967` (`needsNonInvokerSigningBy`):
  enumerates exactly the address-credential entries (source-account/null entries
  are excluded).
- `src/contract/assembled_transaction.ts:804-812` (`sign`): the default signing
  flow does **not** call `signAuthEntries`; it computes
  `needsNonInvokerSigningBy().filter(id => !id.startsWith("C"))` and **throws**
  `NeedsMoreSignatures` if any address-credential auth entry remains.

## Why It Failed

The mechanism (RPC `result.auth` embedded verbatim) is source-true, but it does
not produce a material, source-proven security impact meeting the Medium floor:

1. **Only source-account-credential entries pass the default flow silently.**
   Any address-credential auth entry the RPC injects appears in
   `needsNonInvokerSigningBy` (it is non-null) and, since it is a `G...` address,
   survives the `!id.startsWith("C")` filter and forces `sign()` to throw
   `NeedsMoreSignatures` (`:807-812`). That is a fail-closed alert to the caller,
   not a silent unintended authorization. So injected address-credential entries
   cannot be silently signed/submitted in the default flow.

2. **Source-account-credential entries are host-gated.** The only entries that
   ride the envelope signature without an explicit per-entry signature are
   source-account-credential entries (`getAddressCredentials === null`,
   `:1049-1053`). Those authorize sub-invocations rooted in the caller-intended
   `func`+`args` (which come from the caller's `raw` op, not simulation). The
   Soroban host only consumes auth entries that match the authorizations the
   actual invocation requires; the attacker controls neither `func` nor `args`,
   so an injected source-credential entry can only correspond to a sub-invocation
   the caller-intended call genuinely makes (in which case the auth was legitimately
   required) or to no executed sub-invocation (in which case it is unused). It
   cannot grant capability the caller-intended invocation does not already entail.

The required host-side enforcement that neutralizes (2) is out of this repo and
was not source-provable here. Combined with the fail-closed behavior in (1), no
source-proven path yields a transaction with materially different, attacker-chosen
authorization. Below the Medium severity floor for a confirmed finding.

## What This Rules Out

The specific outbound auth-injection mechanism on route
`js-sdk-37b8abbeef5856e72db630c2`: RPC `result.auth` embedded verbatim via
`assembleTransaction` and implicitly authorized by the source-account envelope
signature does not, on the source-proven default path, grant authorization the
caller-intended `func`+`args` does not already require — address-credential
injections fail closed via `NeedsMoreSignatures`, and source-credential entries
are host-gated by the deterministic required-auth set.

## What This Does Not Rule Out

- The fee/footprint variant on the same `sorobanData` sink (C1, VIABLE).
- A flow where the caller explicitly invokes `signAuthEntries` with their own
  key (`address`) and the RPC injects a same-address credential entry — not the
  default `sign()` path and still host-gated, but not exhaustively traced here.
- Any future change that drops the `NeedsMoreSignatures` fail-closed check or
  auto-signs simulation-supplied address-credential auth entries.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-37b8abbeef5856e72db630c2"
weakness = "RPC-supplied auth entries embedded in signed transaction without intent validation"
record_kind = "single_path"
path = ["<anonymous>", "this.bu ... nvelope"]
sink = "this.bu ... nvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/contract/assembled_transaction.ts:signAuthEntries", "src/contract/assembled_transaction.ts:sign"]
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
negative_claim.rules_out_codes = ["host_side_auth_enforcement_neutralizes_injected_entries", "fail_closed_needs_more_signatures_blocks_address_credential_injection"]
rules_out = ["source trace proves injected address-credential auth entries force a NeedsMoreSignatures throw in the default sign() flow (assembled_transaction.ts:807-812) and source-account-credential entries authorize only sub-invocations the caller-intended func+args require, so RPC auth cannot silently grant attacker-chosen authorization on this path"]
does_not_rule_out = ["explicit signAuthEntries flow with a same-address injected credential entry", "future removal of the NeedsMoreSignatures fail-closed guard", "the C1 fee/footprint variant on the same sorobanData sink"]
assumptions = ["the Soroban host only consumes auth entries matching the authorizations actually required by the executed invocation, which is determined by the caller-controlled func+args"]
mechanism_brief = "assembleTransaction embeds RPC result.auth verbatim when no prior auth exists; only source-credential entries ride the envelope silently and they are host-gated to the caller-intended required-auth set, while address-credential injections fail closed via NeedsMoreSignatures."
why_failed_brief = "no source-proven path yields attacker-chosen authorization: address-credential injection fails closed, source-credential entries are host-gated; below Medium floor."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/assembled_transaction.ts:sign"
guarantee = "default sign() throws NeedsMoreSignatures when any address-credential auth entry remains (needsNonInvokerSigningBy filtered by !startsWith('C')), blocking silent submission of injected address-credential entries"

[[blockers]]
kind = "downstream_guard"
source = "src/contract/assembled_transaction.ts:signAuthEntries"
guarantee = "source-account-credential entries (getAddressCredentials === null) ride the envelope but are consumed by the Soroban host only when matching the caller-intended func+args required authorizations"
```
