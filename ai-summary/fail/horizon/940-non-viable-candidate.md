# F940: Residual timebounds maxTime from unbounded server date (duplicate of reviewed VIABLE route)

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/940-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

I traced the full claimed path in current source and confirm it is accurate:

1. `src/horizon/horizon_axios_client.ts:47-80` — the response interceptor reads
   the remote HTTP `date` header and computes
   `serverTime = toSeconds(Date.parse(dateHeader))` (lines 58-60 / 67-69). The
   sole gate before caching into `SERVER_TIME_MAP` is `!Number.isNaN(serverTime)`
   (line 73). A well-formed far-future date (e.g. `"Fri, 31 Dec 9999 23:59:59
   GMT"`) parses to a large, valid, non-NaN epoch, so the guard passes and the
   attacker-controlled value is stored.
2. `getCurrentServerTime` (lines 95-111) returns
   `currentTime - localTimeRecorded + serverTime`. The 5-minute staleness check
   (line 106) bounds only the locally-measured offset
   `currentTime - localTimeRecorded`; `serverTime` is added unbounded, so the
   result is dominated by the remote value.
3. `src/horizon/server.ts:155-185` — `fetchTimebounds` returns
   `{ minTime: 0, maxTime: currentTime + seconds }` (lines 166-170) when
   `currentTime` is truthy, with no clamp and no comparison to the local clock.
   The `_isRetry` local-time fallback (lines 173-184) is reachable only when
   `getCurrentServerTime` returns falsy/null, never for a valid-but-bogus large
   value.

The mechanism is therefore real in source. The candidate fails the **novelty**
gate, not the source-trace gate.

## Why It Failed

This candidate is an **exact typed duplicate** of an already-reviewed VIABLE
route in structured prior memory. The injected prior-investigations brief
records three VIABLE reviewer-stage findings on this identical typed route:

- [1] `route_id=js-sdk-1081a18ffde6555aa858c026`, VIABLE/reviewed, medium —
  path `createHttpClient.responseInterceptor; getCurrentServerTime;
  fetchTimebounds`, scope
  `remote_horizon_server/horizon_request_response_and_submission/server_selected_by_caller/remote_response_and_caller_supplied_transaction/json_or_xdr_decoded`,
  blocker "no source-proven bound relating server-supplied date to local time
  before it sets maxTime."
- [2] `route_id=js-sdk-26e2014cc473b795c741c78d`, VIABLE/reviewed — same path
  and scope.
- [4] `route_id=js-sdk-6a1608b4e9b3563a4a421b23`, VIABLE/reviewed — same
  `response_interceptor; Date.parse; getCurrentServerTime; fetchTimebounds`
  path and scope.

The candidate's `path` (`createHttpClient.responseInterceptor` →
`getCurrentServerTime` → `fetchTimebounds`), `sink` (`fetchTimebounds`),
trust boundary, protocol phase, auth state, attacker control, parser state, and
size class match [1] exactly. There is no differentiating trust boundary,
protocol phase, parser state, size class, or input shape that would make this a
sibling rather than the same typed route. The hypothesis itself states the goal
was to "resolve that lead to a concrete yes/no" and that the result "confirms
prior [2] from source" — i.e. it re-confirms an already-validated VIABLE
finding rather than producing a new one. Re-confirmation of an exact typed
duplicate already at reviewed/VIABLE is NOT_VIABLE for this candidate per the
novelty rule.

Note this is not a weak/OPEN-failure situation: the prior records are VIABLE
reviewed findings (route already validated), not medium-confidence failures or
conditional failures that would leave the route open. The route is already
captured; nothing in this escalation narrows it to a new typed path.

## What This Rules Out

A second VIABLE record for the server-`date`-header →
`getCurrentServerTime` → `fetchTimebounds` `maxTime` route under the same
`remote_horizon_server` scope. That exact typed route is already recorded VIABLE
(`js-sdk-1081a18ffde6555aa858c026` and siblings) and does not need re-filing.

## What This Does Not Rule Out

- A negative / pre-epoch `date` header forcing an immediately-expired `maxTime`
  (availability variant, distinct input shape) remains unassessed.
- A distinct downstream consumer that signs-and-holds the over-validated
  transaction for later replay would be a different typed route (different
  sink/consumer) and could carry a higher severity; that is not covered by the
  existing VIABLE records and is not disposed of here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-865e0d639f2bb0ab25b1a662"
weakness = "unbounded_server_supplied_time_sets_transaction_maxtime"
record_kind = "single_path"
path = ["createHttpClient.responseInterceptor", "getCurrentServerTime", "fetchTimebounds"]
sink = "fetchTimebounds"
sink_role = "transaction_timebounds_assignment"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/horizon/horizon_axios_client.ts:createHttpClient", "src/horizon/horizon_axios_client.ts:getCurrentServerTime", "src/horizon/server.ts:fetchTimebounds"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "duplicate_of_prior_record"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["exact_typed_duplicate_of_reviewed_viable_route"]
rules_out = ["the server-date header -> getCurrentServerTime -> fetchTimebounds maxTime route with identical path/sink/scope is already recorded VIABLE in prior memory (route js-sdk-1081a18ffde6555aa858c026, siblings js-sdk-26e2014cc473b795c741c78d and js-sdk-6a1608b4e9b3563a4a421b23); re-confirming it from source produces no novel typed route"]
does_not_rule_out = ["negative/pre-epoch date header forcing immediately-expired maxTime (availability variant, distinct input shape)", "a distinct downstream consumer that signs-and-holds the over-validated transaction for later replay (different sink, potentially higher severity)"]
assumptions = ["current source at horizon_axios_client.ts:47-111 and server.ts:155-185 matches the prior-memory VIABLE record's path, sink, and scope exactly, with no new differentiating trust boundary/protocol phase/parser state/size class/input shape"]
mechanism_brief = "remote Horizon date header (Date.parse, only Number.isNaN-gated) is cached and added unbounded into fetchTimebounds maxTime; source confirms the mechanism but the typed route is already a reviewed VIABLE record"
why_failed_brief = "exact typed duplicate of already-reviewed VIABLE route js-sdk-1081a18ffde6555aa858c026 (and siblings); no novel path/sink/scope differentiation"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/horizon/horizon_axios_client.ts:getCurrentServerTime"
guarantee = "Number.isNaN guard (line 73), 5-minute staleness window (line 106), and _isRetry fallback (server.ts:173-184) handle only missing/unparseable/stale/zero dates and do not bound a parseable far-future date — same guards already documented in the prior VIABLE record"

[[blockers]]
kind = "duplicate"
source = "src/horizon/server.ts:fetchTimebounds"
guarantee = "the identical typed route (same path, sink, scope, mechanism) is already recorded VIABLE in prior memory as js-sdk-1081a18ffde6555aa858c026; this candidate re-confirms rather than extends it"
```
