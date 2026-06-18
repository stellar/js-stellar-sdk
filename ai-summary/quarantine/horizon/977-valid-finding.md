# R977: Far-future Horizon `Date` header silently extends `fetchTimebounds` validity window (fail-open)

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/977-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full server-time path in current source:

1. `src/horizon/horizon_axios_client.ts:47-80` — the response interceptor reads the
   HTTP `date` header and computes `serverTime = toSeconds(Date.parse(dateHeader))`
   (lines 60, 68). The only validation before writing into `SERVER_TIME_MAP[hostname]`
   is `if (!Number.isNaN(serverTime))` (line 73). There is **no magnitude or recency
   sanity bound** relative to `Date.now()`. `Date.parse("Sat, 01 Jan 2099 ...")`
   returns a valid large positive number (not NaN), so it is stored verbatim.

2. `src/horizon/horizon_axios_client.ts:95-111` — `getCurrentServerTime` returns
   `null` only when the entry is missing, `serverTime`/`localTimeRecorded` is falsy
   (line 98), or the **local recording** is older than 5 minutes
   (`currentTime - localTimeRecorded > 60 * 5`, line 106). It never validates that
   `serverTime` itself is near the local clock. A far-future `serverTime` recorded a
   moment ago passes all guards and is returned as
   `currentTime - localTimeRecorded + serverTime` (line 110) ≈ the poisoned value.

3. `src/horizon/server.ts:155-185` — `fetchTimebounds(seconds)` calls
   `getCurrentServerTime(serverKey)`; a large positive value is truthy at the
   `if (currentTime)` check (line 166) and is returned directly as
   `{ minTime: 0, maxTime: currentTime + seconds }` (lines 167-170). XDR `TimePoint`
   is uint64, so the huge value is encoded into the signed envelope without overflow
   rejection.

The mechanism in the hypothesis is source-accurate at every cited line.

## Findings

**Novelty.** This is the **far-future / fail-open** numeric-domain shape. Prior
record [1] on this same `route_id` bounds only the **far-past / premature-expiry**
shape (negative scope `premature_expiry_failclosed_below_floor`), where the network
rejects the transaction `tx_too_late` — a fail-closed, availability-only effect below
the severity floor. The opposite shape (an *extended*, effectively unbounded validity
window) is not covered by that record and is not a typed duplicate. Records [2] and [3]
dispose of submission-decode leaf return values (`result_xdr`/`offerResults`), a
different sink, and do not cover the `Date`-header → timebound channel. The injected
brief is sufficient to establish novelty.

**Security impact.** A malicious or compromised caller-selected Horizon server (in the
route's stated trust boundary, `remote_horizon_server` with attacker-controlled
responses) can return a far-future `Date` header. The caller who uses
`fetchTimebounds(N)` to obtain a *short* safety window (e.g. `N = 180s`) instead
receives `maxTime` years in the future, and bakes it into a transaction they sign.
The signed envelope's effective lifetime materially differs from the application's
intent: a signed-but-unsubmitted (withheld, delayed, or leaked) transaction the caller
believes has expired remains valid and submittable far past the intended bound. This
matches the impact category "Remote Horizon response decoded into a materially wrong
transaction state" and is an integrity loss without direct fund loss in the typical
case.

**Exploitability / severity calibration.** Marginal harm requires the attacker to (a)
control the `Date` header on a request recorded within the last 5 minutes, and (b) the
intended-short transaction to be withheld/delayed rather than submitted promptly.
Stellar sequence numbers prevent true double-apply, so the concrete risk is a *delayed
first submission* of a transaction the caller treated as expired. This is a real,
narrow integrity degradation, not direct fund loss — **Medium**, meeting the minimum
severity bar. It is not High because the destination/amount/auth of the envelope are
exactly as the caller intended; only the time bound is silently widened.

**Working-as-designed check.** The function deliberately trusts server time to correct
clock skew. However, legitimate skew is on the order of seconds to minutes; a value
decades from local time is not skew correction. The total absence of any magnitude
sanity bound (the code guards NaN and local-recording staleness but never compares
`serverTime` to the local clock) is a genuine missing guard, not intended design —
confirmed by the `_isRetry` comment at `server.ts:150-151` ("avoid a scenario where
Horizon is horking up the wrong date") which shows awareness of bad dates while
handling only the retry/fallback case, not a far-future value.

## PoC Guidance

- **Test file**: append to an existing unit test for the axios client / server time,
  e.g. `test/unit/server_test.js` or a focused new `test/unit/` spec for
  `horizon_axios_client`.
- **Setup**: import `SERVER_TIME_MAP`, `getCurrentServerTime` from
  `src/horizon/horizon_axios_client.ts`. Either drive the response interceptor with a
  mocked response carrying `headers.date = "Sat, 01 Jan 2099 00:00:00 GMT"`, or
  directly seed `SERVER_TIME_MAP["horizon.example.com"] = { serverTime:
  Date.parse("2099-01-01")/1000, localTimeRecorded: Math.floor(Date.now()/1000) }`.
- **Steps**: construct a `Server` pointed at that host and call
  `server.fetchTimebounds(180)`.
- **Assertion**: assert the returned `maxTime` is years in the future
  (`maxTime - Math.floor(Date.now()/1000)` ≫ 180, e.g. `> 60*60*24*365`), demonstrating
  the intended 180-second window was silently extended by the attacker-controlled
  `Date` header — no sanity bound rejected it.
- Use mocked responses only; do not contact public Stellar infrastructure.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-26e2014cc473b795c741c78d"
weakness = "network request & remote-response integrity"
record_kind = "single_path"
path = ["createHttpClient.interceptor", "getCurrentServerTime", "fetchTimebounds"]
sink = "fetchTimebounds"
sink_role = "transaction_timebound"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/horizon/horizon_axios_client.ts:createHttpClient", "src/horizon/horizon_axios_client.ts:getCurrentServerTime", "src/horizon/server.ts:fetchTimebounds"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms no magnitude/recency sanity bound on server-supplied time: only NaN (horizon_axios_client.ts:73) and 5-minute local-recording staleness (horizon_axios_client.ts:106) guards exist, neither compares serverTime to the local clock, so a far-future Date header is not blocked", "this far-future fail-open shape is not the far-past fail-closed shape disposed of by prior record [1] (premature_expiry_failclosed_below_floor) and not the submission-decode leaf value of records [2],[3]"]
does_not_rule_out = ["far-past premature-expiry timebounds producing tx_too_late (covered by prior record [1], fail-closed below floor)", "submitTransaction/submitAsyncTransaction response decode leaf return values (covered by prior records [2],[3])", "behavior when the SDK is pointed at an honest server returning legitimate near-local Date headers"]
assumptions = ["the caller-selected Horizon server is malicious/compromised or its response Date header is attacker-tampered, which is within the route's stated remote_horizon_server trust boundary", "caller uses fetchTimebounds output as the timebounds of a transaction they sign", "marginal harm (delayed/late submission of a transaction believed expired) requires the signed transaction to be withheld or delayed rather than submitted promptly"]
mechanism_brief = "A far-future Date header is stored as serverTime with no magnitude/recency sanity bound (only NaN and 5-min local-recording guards); getCurrentServerTime returns it ~unchanged and fetchTimebounds returns maxTime = serverTime + seconds, baking an effectively unbounded validity window into the caller's signed transaction and defeating the intended short time bound (fail-open extended validity)."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/horizon/horizon_axios_client.ts:createHttpClient"
guarantee = "NaN serverTime is rejected (line 73) and a >5-minute-stale local recording is nulled out (getCurrentServerTime line 106), but neither bounds serverTime magnitude relative to the local clock, so a far-future Date header passes"

[[blockers]]
kind = "not_found"
source = "src/horizon/server.ts:fetchTimebounds"
guarantee = "no source-proven sanity bound on server-supplied time prevents a far-future Date header from extending fetchTimebounds maxTime into the signed envelope"
```
