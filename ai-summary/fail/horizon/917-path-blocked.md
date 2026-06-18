# F917: Path blocked: premature-expiry timebound from far-past server Date header

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/917-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`submitTransaction -> post`

The residual lead resolves to the server-time mechanism: a Horizon response
`Date` header recorded by the axios interceptor (populated by every response,
including the submit `post` response), consumed only by `fetchTimebounds`. The
escalated question — far-past server date causing premature timebound expiry —
was traced end to end to its single consumer.

## Blocker

The far-past variant is fail-closed and below the Medium floor. A malicious
caller-selected Horizon can return a far-past `Date` header; the interceptor
records it (`horizon_axios_client.ts:57-70`), `getCurrentServerTime` returns a
far-past timestamp within the 5-minute window (`:95-111`), and
`fetchTimebounds` returns `{minTime:0, maxTime: pastTime + seconds}`
(`server.ts:166-170`). The only effect is that the caller may build a
transaction whose `maxTime` is already in the past, so the network rejects it
with `tx_too_late`. Premature expiry means the transaction does not execute —
no fund movement, no wrong-semantics signing, no auth/sequence/fee corruption.
The `fetchTimebounds` value is a leaf return the caller opts into and the SDK
never re-reads for signing/fee/submission. Worst observable effect is a
self-inflicted availability degradation against a server the caller chose to
trust, below the Medium severity floor.

## Evidence

- `src/horizon/horizon_axios_client.ts:57-70` - `serverTime = toSeconds(Date.parse(dateHeader))` takes the attacker-controlled `Date` header verbatim; only NaN is filtered (`:73`), so a far-past date is accepted.
- `src/horizon/horizon_axios_client.ts:95-111` - `getCurrentServerTime` returns `currentTime - localTimeRecorded + serverTime` (≈ serverTime, far-past) when within 5 minutes, else null.
- `src/horizon/server.ts:155-185` - `fetchTimebounds` is the only consumer; it returns `maxTime = currentTime + seconds` to the caller and performs no SDK-internal security decision; on null it retries then falls back to local time.

## Negative Scope

- Rules out: far-past `Date` header producing a premature-expiry timebound as a Medium+ integrity finding — the resulting transaction fails closed (rejected `tx_too_late`), an availability-only effect against a caller-selected server below the severity floor.
- Does not rule out: the far-FUTURE `Date` header variant (extended/over-long `maxTime` widening the transaction validity/replay window beyond caller intent), which is a materially different impact direction and was not adjudicated here; and any caller code that treats `fetchTimebounds` output as authoritative without re-checking against local time.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-26e2014cc473b795c741c78d"
weakness = "network_request"
record_kind = "residual_escalation"
path = ["submitTransaction", "post"]
sink = "post"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "re-investigate residual lead"
target_functions = ["src/horizon/server.ts:fetchTimebounds", "src/horizon/horizon_axios_client.ts:getCurrentServerTime", "src/horizon/horizon_axios_client.ts:createHttpClient"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["premature_expiry_failclosed_below_floor", "server_time_is_leaf_return_value"]
rules_out = ["far-past Date header producing premature-expiry timebounds as a Medium+ finding: the resulting transaction is rejected tx_too_late (fail-closed availability only, below severity floor) and fetchTimebounds output is never re-read by the SDK"]
does_not_rule_out = ["far-future Date header extending maxTime/validity-replay window beyond caller intent (different impact direction, not adjudicated here)", "caller code trusting fetchTimebounds output without local-time cross-check"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Far-past Horizon Date header -> getCurrentServerTime returns far-past time -> fetchTimebounds returns maxTime in the past -> caller transaction rejected tx_too_late; fail-closed, no integrity loss."
why_failed_brief = "Premature expiry is fail-closed (transaction rejected, no fund loss/wrong semantics); availability-only against a caller-selected server, below the Medium severity floor; server time is a leaf return the SDK never re-reads."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "getCurrentServerTime applies a 5-minute staleness window and returns null when no fresh server time exists, after which fetchTimebounds falls back to local time (server.ts:174-177)"

[[blockers]]
kind = "severity_floor"
guarantee = "far-past timebound causes the network to reject the transaction (tx_too_late); the failure is closed (no execution, no fund movement, no wrong-semantics signing), an availability-only effect against a caller-selected server below the Medium floor"

[[blockers]]
kind = "leaf_return_value"
guarantee = "fetchTimebounds output is returned to the caller and never re-read by the SDK for signing, fee, auth, sequence, or submission (only consumer of getCurrentServerTime is server.ts:164)"
```
