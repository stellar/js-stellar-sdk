# F949: Server-time injection into signed maxTime — re-confirmation of already-VIABLE route

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/949-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

I traced the full claimed path in current source and it behaves exactly as the
hypothesis describes:

- `src/horizon/horizon_axios_client.ts:57-70` — the response interceptor reads
  the remote `date` header (both `Headers` and plain-object header shapes) and
  computes `serverTime = toSeconds(Date.parse(dateHeader))` verbatim from the
  remote value (`:60`, `:68`). `Date.parse` of a far-future RFC date yields a
  valid finite number.
- `src/horizon/horizon_axios_client.ts:73-78` — the only guard before storing
  into `SERVER_TIME_MAP` is `!Number.isNaN(serverTime)`. No magnitude or
  recency comparison against the local clock.
- `src/horizon/horizon_axios_client.ts:106` — the staleness check
  `currentTime - localTimeRecorded > 60 * 5` bounds only the *local* recording
  age, not the magnitude of `serverTime`; a fresh far-future value passes it.
- `src/horizon/horizon_axios_client.ts:110` — returns
  `currentTime - localTimeRecorded + serverTime`, so the far-future value
  propagates intact (local delta is a few seconds).
- `src/horizon/server.ts:164-170` — `fetchTimebounds` takes the truthy
  `currentTime` and returns `maxTime: currentTime + seconds`, carrying the
  injected value into the `Timebounds` that the documented usage
  (`server.ts:137-147`) feeds to `TransactionBuilder` and signs.

The mechanism is genuine and current-source verified. The candidate is
technically correct about the code.

## Why It Failed

The candidate is an **exact typed duplicate** of an already-VIABLE route, not a
new finding. The hypothesis itself states (Anti-Evidence) that it "confirms (not
re-discovers)" route `js-sdk-26e2014cc473b795c741c78d`, and its `record_kind`
is `residual_escalation` / `material_effect = "re-investigate residual lead"` —
bookkeeping, not a distinct vulnerability.

Prior structured memory disposes of it:
- **[1] `js-sdk-26e2014cc473b795c741c78d` — VIABLE (reviewed)**: identical path
  (`createHttpClient.interceptor; getCurrentServerTime; fetchTimebounds`),
  identical scope, identical mechanism (no source-proven magnitude/recency bound
  on server-supplied time). This finding is already on the books.
- **[2] `js-sdk-865e0d639f2bb0ab25b1a662` — NOT_VIABLE** as
  `exact_typed_duplicate_of_reviewed_viable_route` for this same mechanism.
- **[4] `js-sdk-2a1428ac20bf568cf68ca936` — NOT_VIABLE** as
  `exact_typed_duplicate`: the inflated-maxTime signed-envelope effect at
  `build()` is identical to the already-VIABLE route, no distinct downstream
  vulnerability.

The disposing record [1] is an already-VIABLE finding, not a weak/conditional
failure, so this is true route closure: re-supplying the source-line trace
strengthens the evidence behind [1] but creates no new typed route. The source
confirmation I performed here corroborates [1]'s VIABLE verdict; it does not
warrant a second VIABLE record for the same path/sink/scope.

## What This Rules Out

A *second, independent* VIABLE finding for the remote-server-time →
`getCurrentServerTime` → `fetchTimebounds.maxTime` → signed-envelope route. The
far-future `Date`-header maxTime-extension mechanism is already captured by
VIABLE route `js-sdk-26e2014cc473b795c741c78d`; this candidate re-confirms it.

## What This Does Not Rule Out

- The underlying issue remains real and VIABLE under route
  `js-sdk-26e2014cc473b795c741c78d` — this NOT_VIABLE is a duplicate-disposition,
  not a refutation of the bug.
- The far-*past* `Date`-header premature-expiry variant (separately NOT_VIABLE,
  fail-closed below floor) is a distinct path and unaffected.
- Any *other* remote-response field that might re-enter SDK security logic
  beyond server time is outside this exact reviewed path and unassessed here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-3e3082d9789604107875d9c9"
weakness = "remote_server_time_injection_into_signed_timebounds"
record_kind = "single_path"
path = ["createHttpClient.interceptor", "getCurrentServerTime", "fetchTimebounds"]
sink = "fetchTimebounds"
sink_role = "timebounds_producer_for_signed_envelope"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "re-investigate residual lead"
target_functions = ["src/horizon/horizon_axios_client.ts:getCurrentServerTime", "src/horizon/server.ts:fetchTimebounds"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["exact_typed_duplicate_of_reviewed_viable_route"]
rules_out = ["a second independent VIABLE finding for the server-time -> getCurrentServerTime -> fetchTimebounds maxTime -> signed-envelope route; identical path/sink/scope/mechanism is already recorded VIABLE as js-sdk-26e2014cc473b795c741c78d, and prior NOT_VIABLE duplicates js-sdk-865e0d639f2bb0ab25b1a662 and js-sdk-2a1428ac20bf568cf68ca936 already dispose of the same mechanism"]
does_not_rule_out = ["the underlying bug remains real and VIABLE under js-sdk-26e2014cc473b795c741c78d; this is a duplicate-disposition not a refutation", "far-past Date-header premature-expiry variant (separately NOT_VIABLE, fail-closed below floor)", "other remote-response fields beyond server time that might re-enter SDK security logic on different paths"]
assumptions = ["source trace at horizon_axios_client.ts:60,68,73,106,110 and server.ts:164-170 confirms the mechanism matches the already-VIABLE route exactly", "documented usage feeds fetchTimebounds output to TransactionBuilder which is then signed (same assumption as the VIABLE route)"]
mechanism_brief = "far-future remote Date header passes the NaN-only and local-staleness guards and propagates through getCurrentServerTime into fetchTimebounds maxTime; mechanism is real but is the exact typed duplicate of already-VIABLE route js-sdk-26e2014cc473b795c741c78d, so it yields no new finding"
why_failed_brief = "exact typed duplicate of already-VIABLE route js-sdk-26e2014cc473b795c741c78d (re-confirmation via residual escalation), matching prior NOT_VIABLE duplicate dispositions [2] and [4]"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "horizon_axios_client.ts:getCurrentServerTime"
guarantee = "NaN guard (horizon_axios_client.ts:73) and 5-minute local-staleness guard (:106) do not bound the magnitude of server-supplied time; mechanism confirmed real but already recorded VIABLE elsewhere"

[[blockers]]
kind = "duplicate_record"
source = "server.ts:fetchTimebounds"
guarantee = "identical typed route (path, sink, scope, mechanism) is already recorded VIABLE as js-sdk-26e2014cc473b795c741c78d; this candidate re-confirms rather than extends it, so it is a duplicate and not a separate finding"
```
