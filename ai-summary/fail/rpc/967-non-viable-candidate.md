# F967: Pre-signing source-account auth-entry reconciliation gap is an exact duplicate of prior VIABLE record

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/967-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

I traced the exact path the candidate claims.

- `src/rpc/server.ts:1133-1140` `prepareTransaction` simulates the caller tx,
  throws on simulation error, then `return assembleTransaction(tx, simResponse).build();`
  with no reconciliation step. Confirmed verbatim at `server.ts:1139`.
- `src/rpc/transaction.ts:63` derives `success` from
  `parseRawSimulation(simulation)`, i.e. the remote response.
- `src/rpc/transaction.ts:100-117` rebuilds the `invokeHostFunction` op, and
  `transaction.ts:115` sets
  `auth: existingAuth.length > 0 ? existingAuth : success.result!.auth`.
  When the raw tx carries no pre-existing auth (`existingAuth.length === 0`),
  the simulation-supplied auth array is copied verbatim into the op the caller
  then signs. There is no caller-intent reconciliation or provenance check.

The source mechanism is real and exactly as the candidate describes.

## Why It Failed

This is an **exact typed duplicate** of an already-reviewed VIABLE finding in
structured prior memory:

- Prior record `js-sdk-014c7e2b1c426cfa3f7f5c02` (stage=reviewed, verdict=VIABLE,
  score 1.00 against this batch), `path = prepareTransaction; assembleTransaction`,
  identical scope tuple
  (`remote_rpc_server / rpc_response_parse_and_transaction_submission /
  server_selected_by_caller / remote_response_and_caller_supplied_transaction /
  json_or_xdr_decoded`), `negative_scope = candidate_not_blocked_after_source_trace`,
  `blocked_by = no source-proven reconciliation, provenance warning, or
  caller-intent validation of remote-supplied auth entries before the assembled
  transaction is returned for signing`. Its `rules_out` explicitly cites the
  `existingAuth>0` guard at `transaction.ts`.

The hypothesis batch's own Shared Path Context names the investigated route as
`js-sdk-014c7e2b1c426cfa3f7f5c02` — the prior record's route. The batch author
distinguished the candidate against the *footprint/sorobanData* VIABLE finding
(`js-sdk-3504706c3cfcfc3ec6179739`) but did not account for prior
`js-sdk-014c7e2b1c426cfa3f7f5c02`, which **is** the auth-entry reconciliation
finding. C1 is the same path, same sink (`assembleTransaction` line 115), same
trust boundary, same parser state, same attacker-controlled input shape (the
remote `success.result!.auth` array), and the same High material effect already
recorded. The source-account-credential framing is the canonical instance of the
generic "remote-supplied auth entries" gap already captured, not a distinct
typed route.

Per reviewer rules, an exact typed duplicate of a reviewed VIABLE record is
NOT_VIABLE for re-reporting.

## What This Rules Out

Re-reporting the pre-signing auth-entry reconciliation gap on
`prepareTransaction -> assembleTransaction` (no reconciliation of remote
`success.result!.auth` against caller intent before signing) as a new finding.
The mechanism is already documented and VIABLE under
`js-sdk-014c7e2b1c426cfa3f7f5c02`.

## What This Does Not Rule Out

- The underlying source gap remains real and is captured by the existing VIABLE
  record; this verdict only blocks duplicate re-reporting, not the prior finding.
- A genuinely distinct trust boundary, protocol phase, parser state, or input
  shape on a nearby path (e.g. a different field reconciliation) is unaffected.
- The footprint/sorobanData reconciliation gap (`js-sdk-3504706c3cfcfc3ec6179739`)
  is a separate already-VIABLE finding and is not addressed here.

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
target_functions = ["src/rpc/transaction.ts:assembleTransaction", "src/rpc/server.ts:prepareTransaction"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "duplicate_of_prior_record"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["exact_typed_duplicate_js-sdk-014c7e2b1c426cfa3f7f5c02"]
rules_out = ["re-reporting the prepareTransaction->assembleTransaction auth-entry reconciliation gap (transaction.ts:115 inserts remote success.result.auth verbatim when existingAuth.length===0, no caller-intent check) as new: already reviewed VIABLE under js-sdk-014c7e2b1c426cfa3f7f5c02 with identical path, sink, scope, and the same existingAuth>0 guard citation"]
does_not_rule_out = ["the underlying gap itself, which remains VIABLE under js-sdk-014c7e2b1c426cfa3f7f5c02", "a genuinely distinct trust boundary, parser state, or input shape on a nearby path", "the separate footprint/sorobanData reconciliation gap js-sdk-3504706c3cfcfc3ec6179739"]
assumptions = ["source trace at transaction.ts:63,100-117,115 and server.ts:1133-1140 confirms the mechanism exactly as the candidate states", "prior record js-sdk-014c7e2b1c426cfa3f7f5c02 in the injected brief is the reviewed VIABLE auth-entry reconciliation finding on the same typed route"]
mechanism_brief = "assembleTransaction line 115 copies remote success.result.auth into the invokeHostFunction op verbatim when the raw tx has no existing auth, and prepareTransaction returns it for signing with no reconciliation"
why_failed_brief = "exact typed duplicate of reviewed VIABLE record js-sdk-014c7e2b1c426cfa3f7f5c02: same path, sink, scope, input shape, material effect, and cited existingAuth>0 guard"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "the existingAuth.length>0 branch (transaction.ts:115) preserves caller auth, but the no-existing-auth branch applies remote success.result.auth verbatim — the same guard already cited by prior VIABLE record js-sdk-014c7e2b1c426cfa3f7f5c02"

[[blockers]]
kind = "duplicate_record"
source = "src/rpc/transaction.ts:assembleTransaction"
guarantee = "the pre-signing auth-entry reconciliation gap on this exact path is already reviewed VIABLE under js-sdk-014c7e2b1c426cfa3f7f5c02; re-reporting is blocked as an exact typed duplicate"
```
