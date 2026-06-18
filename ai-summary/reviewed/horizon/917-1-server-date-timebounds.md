# R917-1: Remote `date` header controls signed transaction timebounds via fetchTimebounds

**Date**: 2026-06-17
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/917-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full path from the remote response header to the signed transaction
`maxTime`:

1. `horizon_axios_client.ts:47-80` — the response interceptor reads the remote
   `date` response header and stores it with no relation to local time.
   - Line 58-60 (Headers branch) and 67-68 (object branch):
     `serverTime = toSeconds(Date.parse(dateHeader))`. There is no allow-list,
     no bound, and no comparison against the local clock.
   - Line 73: the **only** gate before caching is `if (!Number.isNaN(serverTime))`.
     A far-future but well-formed date string (e.g. `"Wed, 01 Jan 2110 00:00:00 GMT"`)
     parses to a finite number, passes the guard, and is written to
     `SERVER_TIME_MAP[hostname]` (lines 74-77) along with a fresh
     `localTimeRecorded`.
2. `horizon_axios_client.ts:95-111` — `getCurrentServerTime` returns
   `currentTime - localTimeRecorded + serverTime`. The only filters are:
   - `!entry || !entry.localTimeRecorded || !entry.serverTime` (line 98) —
     handles the missing/zero case only.
   - the 5-minute staleness window (line 106). A value cached moments earlier by
     the same interceptor passes this trivially, so an attacker-chosen value is
     returned unmodified (plus the negligible elapsed delta).
3. `server.ts:155-185` — `fetchTimebounds(seconds)`:
   - Line 164 fetches `getCurrentServerTime(serverKey)`.
   - Line 166-171: when that value is truthy, `maxTime = currentTime + seconds`
     uses the attacker-influenced value **directly** to build the returned
     `Timebounds`.
   - The `_isRetry` local-time fallback (lines 173-179) and the re-fetch
     (lines 181-184) only run when `getCurrentServerTime` returns a falsy value.
     A valid-but-wrong date is truthy, so the fallback never fires and the value
     is never re-validated.

The caller then sets these `Timebounds` as the transaction's `timebounds` and
signs/submits that transaction.

I verified the hypothesis's "Expected Behavior" claim against the doc comment at
`server.ts:150-153`: the `_isRetry` parameter exists explicitly "to avoid a
scenario where Horizon is horking up the wrong date," and the published intent
of `fetchTimebounds` is to give assurance the timebounds reflect what the caller
wants. The actual code only defends against a *missing/unparseable/stale* date,
not a *valid-but-attacker-chosen* one. This is a genuine deviation from the
documented safety guarantee, not a restatement of intended behavior.

## Findings

A malicious or compromised Horizon server — or a network MITM when the caller
runs with `allowHttp` — fully controls the `maxTime` (validity window) of a
transaction the application is about to sign and submit, despite the application
using the SDK's documented safety helper to avoid exactly this.

- **Extend window**: a far-future `date` header makes `maxTime` far-future, so a
  transaction the application intended to be short-lived (a common defensive
  practice that bounds how long a signed transaction can be replayed/submitted)
  becomes effectively long-lived. A server that withholds and later replays the
  signed transaction can submit it far outside the caller's intended window.
- **Collapse window**: a past `date` header makes `maxTime` < current ledger
  time, so the transaction is rejected on submission (availability nuisance;
  the caller-selected server could already refuse to submit, so this direction
  alone is weaker).

The extend direction is the material one: it directly changes the semantics of
the transaction the caller signs, driven entirely by an in-scope remote
response. This aligns with the High impact category "Remote ... response decoded
into a materially wrong transaction ... that leads to unsafe signing/submission."

Not a duplicate: the four prior horizon json_deserialization records all cover
`submitTransaction` XDR leaf-return decoding (`fromXDR`/`toEnvelope` at
server.ts:340/365/524/571), concluded NOT_VIABLE because the decoded value is a
leaf return that is never re-read for signing/fee/auth decisions. This finding
is the opposite shape: a remote value that *is* fed forward into the signed
transaction, via a different sink (`Date.parse`) and a different path
(header → SERVER_TIME_MAP → fetchTimebounds). No prior record touches it.

## PoC Guidance

- **Test file**: append to `test/unit/server_test.js` (existing `fetchTimebounds`
  tests already mock the `date` header and manipulate `SERVER_TIME_MAP`).
- **Setup**: clear `SERVER_TIME_MAP`; mock an axios/httpClient response whose
  `date` header is a valid far-future RFC 1123 string (e.g.
  `"Wed, 01 Jan 2110 00:00:00 GMT"`) so the interceptor at
  `horizon_axios_client.ts:47-80` records it.
- **Steps**: call `server.fetchTimebounds(60)` after the interceptor has run for
  that host (or seed `SERVER_TIME_MAP[host]` directly with the far-future
  `serverTime` and a current `localTimeRecorded`).
- **Assertion**: assert the returned `maxTime` reflects the attacker's
  far-future server time (≈ `4_416_336_000 + 60`) rather than
  `localNow + 60`, demonstrating the server controls the validity window.
  Optionally assert the `_isRetry`/re-fetch path is never taken for a
  valid-but-wrong date.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-1081a18ffde6555aa858c026"
weakness = "json_deserialization"
record_kind = "single_path"
path = ["createHttpClient.responseInterceptor", "getCurrentServerTime", "fetchTimebounds"]
sink = "fetchTimebounds.maxTime"
sink_role = "timebound_derivation"
impact_class = "transaction_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["horizon_axios_client.ts:createHttpClient", "horizon_axios_client.ts:getCurrentServerTime", "server.ts:fetchTimebounds", "Date.parse"]
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
rules_out = ["the Number.isNaN guard (horizon_axios_client.ts:73), the 5-minute staleness window (line 106), and the _isRetry local-time fallback (server.ts:173-184) all handle only missing/unparseable/stale/zero dates and do not block a valid attacker-chosen date from reaching maxTime"]
does_not_rule_out = ["streaming onMessage JSON.parse uncaught throw (see C2/R917-2)", "callers that build timebounds without fetchTimebounds and are therefore unaffected"]
assumptions = ["Horizon date response header is attacker-influenced consistent with the seed remote_horizon_server trust boundary (malicious/compromised server, or MITM under allowHttp)", "the caller uses fetchTimebounds to derive timebounds for a transaction it then signs and submits"]
mechanism_brief = "Remote date response header parsed by Date.parse with only a NaN guard is cached as server time and used by fetchTimebounds to set the signed transaction maxTime, letting the server choose the validity window despite the documented safety guarantee."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "horizon_axios_client.ts:getCurrentServerTime"
guarantee = "Number.isNaN and 5-minute staleness checks do not block a freshly cached valid attacker-chosen date"

[[blockers]]
kind = "not_found"
source = "server.ts:fetchTimebounds"
guarantee = "no source-proven bound relating server-supplied date to local time before it sets maxTime"
```
