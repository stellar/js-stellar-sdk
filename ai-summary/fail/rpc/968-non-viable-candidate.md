# F968: Address-credential auth-entry pass-through is subsumed by the prior auth-entry reconciliation finding

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/967-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

I traced the candidate path in source.

- `src/rpc/transaction.ts:100-117` rebuilds the `invokeHostFunction` op, and
  `transaction.ts:115` sets
  `auth: existingAuth.length > 0 ? existingAuth : success.result!.auth`.
  This insertion performs **no credential-type discrimination** — the whole
  remote-supplied `success.result!.auth` array is inserted regardless of whether
  individual entries carry `SOROBAN_CREDENTIALS_ADDRESS` or
  `SOROBAN_CREDENTIALS_SOURCE_ACCOUNT` credentials. Confirmed: there is no
  branch on credential type anywhere in `assembleTransaction`.
- `src/rpc/server.ts:1139` returns `assembleTransaction(tx, simResponse).build()`
  for the caller to sign/process downstream.

The candidate correctly describes a real source behavior: address-credential
entries are passed through verbatim alongside source-account-credential entries.

## Why It Failed

C2 is **true typed subsumption** under the same prior VIABLE record that
subsumes C1:

- Prior record `js-sdk-014c7e2b1c426cfa3f7f5c02` (reviewed, VIABLE) records "no
  source-proven reconciliation, provenance warning, or caller-intent validation
  of **remote-supplied auth entries** before the assembled transaction is
  returned for signing" on `prepareTransaction -> assembleTransaction`. That
  claim is generic over the entire `success.result!.auth` array.

C2 is a strict subset of that array — the address-credential entries — handled
by the very same line (`transaction.ts:115`), with the same trust boundary
(`remote_rpc_server`), same parser state (`json_or_xdr_decoded`), same protocol
phase, and the same SDK-level input shape (the remote auth-entry array). The SDK
does not treat the two credential types differently, so there is no distinct
typed mechanism here — only the same reconciliation gap viewed through a credential
subtype. The reviewer rules treat a different input shape as anti-evidence only;
but the credential arm inside a `SorobanAuthorizationEntry` is not a different
SDK input shape — it is the same array at the same sink.

Additionally, C2's distinct realized harm (a wallet being asked to sign
attacker-shaped `rootInvocation`/nonce/expiration via `authorizeEntry` /
`signAuthEntry`) is, by the candidate's own anti-evidence, **downstream of
`assembleTransaction` and outside `src/rpc/transaction.ts`** — in caller/wallet
signing UX. There is no additional in-scope `src/` source mechanism beyond the
already-VIABLE reconciliation gap. The candidate self-identifies as "the weaker
of the two candidates."

## What This Rules Out

Re-reporting the verbatim pass-through of address-credential simulation auth
entries at `transaction.ts:115` as a distinct source finding: it is the same
no-reconciliation sink already captured VIABLE under
`js-sdk-014c7e2b1c426cfa3f7f5c02`, with no credential-type-specific SDK source
mechanism.

## What This Does Not Rule Out

- The underlying reconciliation gap remains real and VIABLE under
  `js-sdk-014c7e2b1c426cfa3f7f5c02`; this only blocks duplicate re-reporting.
- A genuine bug located **inside** the downstream signing helpers
  (`authorizeEntry` / `signAuthEntry`) — a different file and sink — is not
  assessed here and would be a separate route.
- Any distinct credential-type-specific guard or validation introduced elsewhere
  in `src/rpc` is unaffected.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-c0ae1ab847aed5e1f3fb7c58"
weakness = "pre_signing_auth_entry_reconciliation_gap"
record_kind = "single_path"
path = ["prepareTransaction", "assembleTransaction"]
sink = "assembleTransaction"
sink_role = "transaction_assembly_auth_injection"
impact_class = "transaction_integrity"
route_family = "transaction_assembly"
material_effect = "transaction signed/submitted with attacker-supplied auth entries the application did not intend"
target_functions = ["src/rpc/transaction.ts:assembleTransaction"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "subsumed_by_prior_record"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["typed_subsumption_js-sdk-014c7e2b1c426cfa3f7f5c02", "realized_harm_downstream_of_src_rpc"]
rules_out = ["re-reporting address-credential auth-entry pass-through at transaction.ts:115 as a distinct source finding: the SDK does not discriminate credential type at the sink, so it is the same generic remote auth-entry reconciliation gap already reviewed VIABLE under js-sdk-014c7e2b1c426cfa3f7f5c02", "treating credential-subtype framing as a new SDK input shape: line 115 inserts the whole success.result.auth array regardless of credential arm"]
does_not_rule_out = ["the underlying reconciliation gap, which remains VIABLE under js-sdk-014c7e2b1c426cfa3f7f5c02", "a distinct bug inside downstream authorizeEntry/signAuthEntry signing helpers (different file/sink, not assessed)", "any credential-type-specific guard elsewhere in src/rpc"]
assumptions = ["source trace at transaction.ts:100-117,115 confirms no credential-type discrimination at the auth-insertion sink", "C2's distinct realized harm is in downstream wallet signing UX outside src/rpc/transaction.ts per its own anti-evidence", "prior record js-sdk-014c7e2b1c426cfa3f7f5c02 covers the generic remote auth-entry reconciliation gap that includes address-credential entries"]
mechanism_brief = "transaction.ts:115 inserts the whole remote success.result.auth array (both SOROBAN_CREDENTIALS_ADDRESS and SOROBAN_CREDENTIALS_SOURCE_ACCOUNT entries) verbatim with no reconciliation; the address-credential subset is the same sink and gap already reviewed VIABLE"
why_failed_brief = "typed subsumption under reviewed VIABLE js-sdk-014c7e2b1c426cfa3f7f5c02 (same sink, same array, no credential-type discrimination) and the distinct realized harm is downstream wallet UX outside src/rpc"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "no credential-type discrimination exists at transaction.ts:115; the same no-reconciliation insertion handles address and source-account entries identically, already captured by js-sdk-014c7e2b1c426cfa3f7f5c02"

[[blockers]]
kind = "duplicate_record"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "the address-credential subset of the remote auth array at this sink is subsumed by the reviewed VIABLE reconciliation gap js-sdk-014c7e2b1c426cfa3f7f5c02; the distinct realized harm lies downstream of src/rpc and is out of scope for this source claim"
```
