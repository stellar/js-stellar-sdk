# F943: Path blocked: downstream TransactionBuilder maxTime clamping is not a distinct route

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/943-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`fetchTimebounds -> getCurrentServerTime`

Residual question (escalated budget): *"downstream TransactionBuilder maxTime
clamping/validation on build/sign is a distinct untrace route."* Resolved to a
concrete **no** by source tracing the in-tree `TransactionBuilder`
(`src/base/transaction_builder.ts`, vendored, in scope).

## Blocker

The downstream `TransactionBuilder` applies **no** upper-bound, recency, or
magnitude clamp on `maxTime`. The constructor validates only non-negativity and
`minTime <= maxTime` ordering; `build()` only requires timebounds present and
converts to `Uint64` unchanged. So the downstream does **not** block the
upstream far-future-`maxTime` route — but it also adds **no distinct
mechanism**: the resulting signed envelope with an inflated `maxTime` is the
exact same material effect already recorded VIABLE
(`js-sdk-26e2014cc473b795c741c78d`, `js-sdk-1081a18ffde6555aa858c026`). The one
materially different input shape, a negative `maxTime` (far-past / negative
`Date` header), is rejected by the constructor non-negativity guard and would at
most throw at build — below Medium. No separate clamp to bypass and no new
failure mode exist, so the downstream is not a distinct untraced route.

## Evidence

- `src/horizon/server.ts:fetchTimebounds:164-171` - `maxTime = currentTime + seconds` where `currentTime = getCurrentServerTime(serverKey)`; no magnitude/recency check before returning the timebounds object.
- `src/horizon/horizon_axios_client.ts:getCurrentServerTime:95-110` - returns `currentTime - localTimeRecorded + serverTime`; only NaN (line 73) and 5-minute staleness (line 106) guards exist; no magnitude bound on the server-supplied offset.
- `src/base/transaction_builder.ts:constructor:190-211` - only `minTime<0` / `maxTime<0` rejection and `minTime>maxTime` ordering; no upper-bound clamp on `maxTime`.
- `src/base/transaction_builder.ts:build:965-990` - requires timebounds set, floors Dates to seconds, then `xdr.Uint64.fromString(this.timebounds.maxTime.toString())`; emits the far-future `maxTime` into the signed `xdr.TimeBounds` unchanged.
- `src/base/transaction_builder.ts:setTimebounds:493-524` - same non-negativity + ordering checks; confirms no alternate clamp on the setter path.

## Negative Scope

- Rules out: a distinct downstream `TransactionBuilder` build/sign clamp or validation route for the far-future server-time `maxTime` mechanism (no clamp exists; the effect is the already-VIABLE upstream finding, not a new one).
- Does not rule out: the upstream `createHttpClient.interceptor -> getCurrentServerTime -> fetchTimebounds` far-future-`maxTime` route itself, which remains VIABLE in prior memory (`js-sdk-26e2014cc473b795c741c78d`, `js-sdk-1081a18ffde6555aa858c026`).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-2a1428ac20bf568cf68ca936"
weakness = "remote_time_offset_consumed_into_transaction_timebounds"
record_kind = "residual_escalation"
path = ["fetchTimebounds", "getCurrentServerTime"]
sink = "getCurrentServerTime"
sink_role = "remote_time_offset_consumed_into_transaction_timebounds"
impact_class = "network_integrity"
route_family = "remote_time_offset_consumed_into_transaction_timebounds"
material_effect = "re-investigate residual lead"
target_functions = ["src/base/transaction_builder.ts:build", "src/base/transaction_builder.ts:constructor", "src/base/transaction_builder.ts:setTimebounds", "src/horizon/server.ts:fetchTimebounds", "src/horizon/horizon_axios_client.ts:getCurrentServerTime"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["exact_typed_duplicate_of_reviewed_viable_route"]
rules_out = ["downstream TransactionBuilder build/sign applies no maxTime clamp and is not a distinct route; the inflated-maxTime signed envelope is the same material effect already recorded VIABLE (js-sdk-26e2014cc473b795c741c78d, js-sdk-1081a18ffde6555aa858c026), not a new vulnerability"]
does_not_rule_out = ["the upstream createHttpClient.interceptor -> getCurrentServerTime -> fetchTimebounds far-future maxTime route, already VIABLE in prior memory"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "TransactionBuilder constructor/build/setTimebounds validate only maxTime>=0 and minTime<=maxTime; no upper-bound/recency clamp, so far-future server-time maxTime passes into the signed envelope unchanged, reproducing the already-VIABLE upstream effect with no distinct mechanism"
why_failed_brief = "downstream has no clamp to bypass and adds no distinct mechanism; effect duplicates already-VIABLE upstream route; only divergent shape (negative maxTime) is blocked by non-negativity guard and is below Medium"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "TransactionBuilder constructor (src/base/transaction_builder.ts:194-208) and setTimebounds (514-520) reject negative minTime/maxTime and minTime>maxTime ordering"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "getCurrentServerTime (src/horizon/horizon_axios_client.ts:73,106) guards only NaN and 5-minute staleness; no magnitude bound"

[[blockers]]
kind = "duplicate_of_viable"
guarantee = "the inflated-maxTime signed-envelope effect at build() is identical to already-VIABLE routes js-sdk-26e2014cc473b795c741c78d / js-sdk-1081a18ffde6555aa858c026; no distinct downstream vulnerability exists"

[[blockers]]
kind = "checked_guard"
guarantee = "the only divergent input shape (negative maxTime from far-past/negative Date header) is rejected at constructor src/base/transaction_builder.ts:198 and would at most throw at build, below Medium"
```
