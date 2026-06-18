# F1019: Far-future Date header extends fetchTimebounds maxTime (duplicate of reviewed VIABLE route)

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/1019-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

I traced the full claimed path in current source:

- `src/horizon/horizon_axios_client.ts:47-80` — the response interceptor parses
  the remote `date` header (`Date.parse`, line 60/68) and writes
  `SERVER_TIME_MAP[hostname] = { serverTime, localTimeRecorded }` on every
  response, guarded only by `!Number.isNaN(serverTime)` (line 73). No magnitude
  or recency comparison against the local clock is applied.
- `src/horizon/horizon_axios_client.ts:95-111` `getCurrentServerTime` rejects
  only missing/zero entries (line 98) and entries older than 5 minutes
  (line 106). It then returns `currentTime - localTimeRecorded + serverTime`
  (line 110) with no upper sanity bound on `serverTime`.
- `src/horizon/server.ts:155-185` `fetchTimebounds` reads that value as
  `currentTime` (line 164) and, when truthy, returns
  `maxTime = currentTime + seconds` (line 169) with no clamp. The doc comment
  (125-153) shows the value is intended to populate `TransactionBuilder`
  timebounds.

The source confirms the mechanism is real: a far-future `Date` header is honored
unbounded and flows into `maxTime`, extending the signed transaction's validity
window beyond the caller's requested `seconds`. The candidate is **not** rejected
on technical grounds.

## Why It Failed

This candidate is an **exact typed duplicate of an already-reviewed VIABLE
route**, so it re-confirms rather than extends prior memory.

The injected prior-investigations brief records the identical typed route as
VIABLE three independent times, all sharing C1's exact scope tuple
(`remote_horizon_server` / `horizon_request_response_and_submission` /
`server_selected_by_caller` / `remote_response_and_caller_supplied_transaction` /
`json_or_xdr_decoded`):

- [1] `js-sdk-26e2014cc473b795c741c78d` (VIABLE) — "no source-proven sanity
  bound on server-supplied time prevents a **far-future Date header** from
  extending fetchTimebounds maxTime into the signed envelope."
- [3] `js-sdk-6a1608b4e9b3563a4a421b23` (VIABLE) — response_interceptor →
  Date.parse → getCurrentServerTime → fetchTimebounds, same unbounded magnitude.
- [4] `js-sdk-1081a18ffde6555aa858c026` (VIABLE) — "no source-proven bound
  relating server-supplied date to local time before it sets maxTime."

A prior re-confirmation [2] `js-sdk-865e0d639f2bb0ab25b1a662` of this same route
was itself disposed NOT_VIABLE as `exact_typed_duplicate_of_reviewed_viable_route`.
C1 falls under that same precedent.

The hypothesis premise — that only the far-past / premature-expiry shape was
adjudicated and the far-future fail-open shape is novel — is contradicted by the
injected brief: records [1], [3], and [4] are explicitly the far-future
magnitude-unbounded shape. The path, sink (`getCurrentServerTime`), sink_role
(remote time offset consumed into transaction timebounds), trust boundary,
protocol phase, parser state, size class, and input shape all match the existing
VIABLE records. There is no differentiating facet that would make C1 a distinct
typed route.

## What This Rules Out

Re-reporting the far-future remote `Date` header → `getCurrentServerTime`
(unbounded magnitude) → `fetchTimebounds` `maxTime`-extension route as a new
finding. It is already captured VIABLE in prior memory under the same scope.

## What This Does Not Rule Out

- Downstream `TransactionBuilder` handling: whether a poisoned `maxTime` is
  clamped, validated, or rejected when the envelope is built/signed was not
  traced (out of this path's files) and remains a genuinely distinct route if a
  builder-side guard or its absence is the security boundary.
- The far-past / premature-expiry shape on `fetchTimebounds` (different numeric
  domain, fail-closed) is a separate prior record and is unaffected by this
  disposition.
- Other consumers of `SERVER_TIME_MAP` / `getCurrentServerTime` outside
  `fetchTimebounds`, if any, are a different sink and not adjudicated here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-2a1428ac20bf568cf68ca936"
weakness = "Remote response field (Date header) extends transaction timebounds beyond intended window"
record_kind = "single_path"
path = ["fetchTimebounds", "getCurrentServerTime"]
sink = "getCurrentServerTime"
sink_role = "remote_time_offset_consumed_into_transaction_timebounds"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/horizon/server.ts:fetchTimebounds", "src/horizon/horizon_axios_client.ts:getCurrentServerTime", "src/horizon/horizon_axios_client.ts:responseInterceptor"]
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
rules_out = ["the far-future remote Date header -> getCurrentServerTime (unbounded magnitude) -> fetchTimebounds maxTime-extension route with identical path/sink/scope is already recorded VIABLE in prior memory (js-sdk-26e2014cc473b795c741c78d, js-sdk-6a1608b4e9b3563a4a421b23, js-sdk-1081a18ffde6555aa858c026); C1 re-confirms rather than extends it"]
does_not_rule_out = ["downstream TransactionBuilder maxTime clamping/validation on build/sign is a distinct untrace route", "far-past premature-expiry shape is a separate prior record", "other consumers of getCurrentServerTime outside fetchTimebounds"]
assumptions = ["source trace at horizon_axios_client.ts:47-111 and server.ts:155-185 confirms the mechanism is real; the only basis for NOT_VIABLE is typed-duplicate novelty against the injected prior-memory brief, not a source-level blocker"]
mechanism_brief = "Far-future remote Date header is recorded in SERVER_TIME_MAP without a magnitude bound; getCurrentServerTime adds it to local time and fetchTimebounds returns maxTime far beyond the requested window. Source-confirmed but already recorded VIABLE under the same scope."
why_failed_brief = "exact typed duplicate of three reviewed VIABLE records covering the same far-future Date-header timebounds-extension route, same path/sink/scope; matches prior duplicate-disposal precedent [2]"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "horizon_axios_client.ts:getCurrentServerTime"
guarantee = "NaN guard (line 73) and 5-minute staleness check (line 106) bound offset lifetime but not magnitude; far-future serverTime passes unchecked — confirming the weakness, not blocking it"

[[blockers]]
kind = "duplicate"
source = "src/horizon/server.ts:fetchTimebounds"
guarantee = "identical typed route already recorded VIABLE (js-sdk-26e2014cc473b795c741c78d, js-sdk-6a1608b4e9b3563a4a421b23, js-sdk-1081a18ffde6555aa858c026) under the same scope; prior duplicate disposal [2] sets precedent"
```
