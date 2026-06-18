# R989: Malicious Horizon `Date` header controls signed-transaction `maxTime` via `fetchTimebounds`

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/989-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The claimed path is source-confirmed end to end in current source.

1. **Header deserialization** — `src/horizon/horizon_axios_client.ts:47-80`. The
   response interceptor reads the remote `date` response header and computes
   `serverTime = toSeconds(Date.parse(dateHeader))` (`:60` for the `Headers`
   branch, `:68` for the plain-object branch). The string is taken directly from
   the attacker-controlled HTTP response header.

2. **Only guard is a NaN check** — `:73` `if (!Number.isNaN(serverTime))` stores
   `{ serverTime, localTimeRecorded }` into the module-global `SERVER_TIME_MAP`
   (`:74-78`). This rejects unparsable dates only; a valid far-future RFC date
   such as `Wed, 01 Jan 2200 00:00:00 GMT` parses to a large finite number and
   passes. `localTimeRecorded` is captured (`:71`) but never compared against
   `serverTime` to bound skew magnitude.

3. **Server time returned with near-zero local delta** — `getCurrentServerTime`
   (`:95-111`) returns `null` only when the entry is missing/zero or the
   recording is older than 5 minutes (`:106`). Otherwise it returns
   `currentTime - localTimeRecorded + serverTime` (`:110`). Because
   `currentTime` and `localTimeRecorded` are local clocks captured seconds
   apart, the result is essentially the attacker-supplied `serverTime`. The
   staleness check bounds *recording recency*, not the *magnitude* of
   `serverTime`.

4. **Used as a signed transaction field with no clamp** — `server.ts:155-185`.
   `fetchTimebounds` computes `serverKey` from the caller's URL (`:160-163`),
   calls `getCurrentServerTime` (`:164`), and on a truthy value returns
   `{ minTime: 0, maxTime: currentTime + seconds }` (`:166-170`) with no clamp
   against local time. The `_isRetry` local-time fallback (`:173-179`) is only
   reached when `getCurrentServerTime` returns `null`, i.e. when there is *no*
   server time — it does not sanitize a present-but-malicious value.

5. **Self-bootstrapping** — on a fresh call with no prior `SERVER_TIME_MAP`
   entry, `getCurrentServerTime` returns `null`, so `fetchTimebounds` issues
   `await this.httpClient.get(this.serverURL.toString())` (`:183`). That request
   runs the interceptor and populates the map from the attacker's `Date` header,
   then the recursive `_isRetry` call (`:184`) reads it back as truthy and
   returns the attacker-controlled `maxTime`. The attacker therefore controls
   `maxTime` even on the very first `fetchTimebounds` invocation.

The hypothesis's "Expected Behavior" is sound: the documented purpose of
`fetchTimebounds` (`server.ts:125-153`) is to give "more assurance that your
timebounds will reflect what you want" by correcting for *local clock skew*.
Correcting small skew is the design intent; granting an untrusted server
unbounded control of a signed field is not. The SDK already records
`localTimeRecorded` but never uses it to sanity-bound the server value, so this
is a genuine missing-guard deviation, not working-as-designed behavior.

## Findings

**Security impact**: A malicious, compromised, or MITM-reachable (via `allowHttp`
/ plaintext) Horizon server returns a syntactically valid but skewed `Date`
header and thereby fully controls the `maxTime` timebound of a transaction the
caller is about to sign and submit:

- **Far-future `Date`** widens the transaction's validity window far beyond the
  `seconds` the caller requested (e.g. caller asks for 100s, transaction stays
  valid until year 2200). The caller's own Horizon server is the party that
  receives the signed envelope on submit, so it can hold and broadcast the
  transaction at an attacker-chosen later time inside the inflated window while
  the account sequence still matches — defeating a tight timebound the user set
  as a safety control. Most damaging for time-sensitive flows (path payments,
  offers/DEX), where deferred execution changes economic outcome.
- **Past/near-past `Date`** yields a `maxTime` already expired, making every
  submission silently invalid (availability/integrity confusion: the user
  believes they signed a usable transaction).

This is a remote-response trust-confusion / integrity issue: the response (`Date`
header) is decoded into a materially wrong transaction field that the user signs
and submits, against an API contract that advertises the call as a safety
improvement. The trust boundary is the in-scope `remote_horizon_server`.

**Severity rationale (Medium)**: fits "remote-response trust confusion" and
"incorrect decoding that can cause unsafe application behavior" on the Medium
scale, and the "Remote response decoded into a materially wrong transaction
field that the user signs/submits" impact category. It is bounded below High
because the concrete fund-movement path is conditional (requires a
malicious/compromised/MITM server *and* a deferred-execution or sequence-stable
window), and `maxTime` changes *when* a transaction is valid rather than *what*
it does (destination/amount/auth are unaffected). The malicious-server
requirement is explicitly in scope for this objective, so it does not reduce the
finding below the Medium floor. A reviewer could argue High under the
"unsafe signing/submission" qualifier; the threshold judgment is why confidence
is `medium`.

## PoC Guidance

- **Test file**: append to an existing unit test that already exercises
  `SERVER_TIME_MAP` / `getCurrentServerTime` (e.g. under
  `test/unit/server_test.js` or the horizon axios client tests), using mocked
  responses — do not contact public infrastructure.
- **Setup**: construct a `HorizonServer`, mock the HTTP client so the root
  `GET` response carries a header `Date: Wed, 01 Jan 2200 00:00:00 GMT`.
- **Steps**: call `await server.fetchTimebounds(100)`.
- **Assertion**: assert the returned `maxTime` is on the order of the year-2200
  epoch (≈ `7.26e9` seconds) rather than `≈ now + 100`, demonstrating the server
  fully controls `maxTime`. Add a second case with a past `Date` header
  (e.g. `Thu, 01 Jan 2009 00:00:00 GMT`) and assert `maxTime` is in the past
  (already-expired transaction). A fix should clamp the server-derived value to
  a small tolerance around local time before it is used.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-6a1608b4e9b3563a4a421b23"
weakness = "json_deserialization"
record_kind = "single_path"
path = ["response_interceptor", "Date.parse", "getCurrentServerTime", "fetchTimebounds"]
sink = "fetchTimebounds.maxTime"
sink_role = "remote_header_deserialization_into_signed_transaction_timebound"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["src/horizon/horizon_axios_client.ts:getCurrentServerTime", "src/horizon/horizon_axios_client.ts:createHttpClient", "src/horizon/server.ts:fetchTimebounds"]
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
rules_out = ["NaN guard (horizon_axios_client.ts:73), 5-minute staleness check (getCurrentServerTime:106), and truthiness gate (server.ts:166) do not bound server-time magnitude; source trace shows no clamp of server-derived maxTime against the recorded local clock, so none of these block the candidate path"]
does_not_rule_out = ["streaming onMessage JSON.parse missing try/catch (already VIABLE, route js-sdk-1081a18ffde6555aa858c026)", "reconnect-storm DoS in createEventSource onClose loop with no backoff", "other call-builder consumers of remote response headers outside this fetchTimebounds path"]
assumptions = ["caller uses the documented fetchTimebounds convenience and signs/submits the returned timebounds", "the selected Horizon server is malicious, compromised, or MITM-reachable via allowHttp/plaintext, which is the in-scope remote_horizon_server trust boundary", "Date.parse accepts the attacker-chosen valid RFC date string"]
mechanism_brief = "Remote HTTP Date response header is Date.parsed into SERVER_TIME_MAP and returned by getCurrentServerTime offset by a near-zero local delta; fetchTimebounds uses it directly as transaction maxTime with only a NaN guard, a recency check, and a truthiness gate, none of which bound the server-time magnitude, so a malicious/MITM Horizon server controls the maxTime of a signed transaction."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/horizon/horizon_axios_client.ts:createHttpClient"
guarantee = "Number.isNaN(serverTime) at :73 rejects unparsable Date headers only; valid future/past RFC dates pass and remain attacker-controlled"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/horizon/horizon_axios_client.ts:getCurrentServerTime"
guarantee = "5-minute staleness check at :106 bounds recording recency, not the magnitude/skew of the stored serverTime"

[[blockers]]
kind = "not_found"
source = "src/horizon/server.ts:fetchTimebounds"
guarantee = "no source-proven clamp of the server-derived value against the recorded local clock before it becomes the signed transaction maxTime (:166-170); _isRetry local fallback at :173-179 is reached only when no server time exists"
```
