# R943: Unbounded connection hold time on attacker-served stellar.toml (slow-trickle body hang) under default timeout=0

**Date**: 2026-06-18
**Subsystem**: stellartoml
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/stellartoml/943-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full default-path flow in current source:

- `src/stellartoml/index.ts:49-50` — `timeout = typeof opts.timeout === "undefined" ? Config.getTimeout() : opts.timeout`. With no caller override, this resolves to the shipped default.
- `src/config.ts:17-20` — `defaultConfig = { allowHttp: false, timeout: 0 }`; `Config.getTimeout()` returns `0` by default.
- `src/stellartoml/index.ts:55-67` — `resolve` calls `httpClient.get(...)` with `maxContentLength: STELLAR_TOML_MAX_SIZE` (always set), `cancelToken: timeout ? new CancelToken(...) : undefined`, and `timeout` forwarded as-is. With `timeout = 0`, `cancelToken` is `undefined` and `timeout: 0` is passed.
- `src/http-client/fetch-client.ts:483-490` — because `maxContentLength` is always set, the request is routed to `boundedFetchAdapter`, not the feaxios instance.
- `src/http-client/fetch-client.ts:331-337` — the adapter pushes a timeout `AbortSignal` only `if (timeout && timeout > 0)`. With `timeout = 0`, `signals` stays empty and `composeSignals([])` returns `undefined` (line 219-220).
- `src/http-client/fetch-client.ts:368-375` — `currentInit` spreads `...(signal ? { signal } : {})`, so `fetch` is invoked with **no abort signal**. The adapter never reads `config.cancelToken` at all, so the only possible cancellation source on this path is the (absent) timeout signal.
- `src/http-client/fetch-client.ts:166-184` — `readBodyBounded` loops `while (true) { const { done, value } = await reader.read(); ... }`, enforcing only a cumulative byte cap (`total > maxContentLength`). There is no per-read deadline and no wall-clock bound.

Net: on the shipped default path a malicious `.well-known/stellar.toml` server can return `200` with chunked transfer (no `Content-Length`) and trickle body bytes arbitrarily slowly while staying under 100 KiB. The streamed-total check never trips, `done` never arrives, no abort signal exists, and `resolve()` never settles — holding a socket and a pending promise for the lifetime of the trickle.

## Findings

The `STELLAR_TOML_MAX_SIZE` streamed cap bounds **bytes**, not **time**; it is orthogonal to connection hold time and does not block this mechanism. The SDK deliberately forces a non-optional byte cap on this attacker-controlled fetch but leaves hold time unbounded by default — an asymmetry that leaves the default path exposed.

Attacker control and reachability are realistic: `Resolver.resolve(domain)` is called with attacker-named domains directly and indirectly via federation / web-auth domain resolution, and the attacker controls the served HTTP response. A single hostile server can pin an application flow (and accumulate sockets/promises across repeated or forced resolutions).

Environment-dependent severity, confirmed against the cited anti-evidence:
- **Browser bundle** (no-axios `fetch`): no default body timeout — the hang is effectively unbounded.
- **Node (undici global fetch)**: default `bodyTimeout` (~300s between chunks) raises attacker effort but does not eliminate the issue — trickling ≥1 byte within each window keeps the connection alive, yielding multi-day per-connection hangs and socket/promise accumulation.

This maps to the objective's "Resource exhaustion from a single response/spec/challenge that is not bounded by documented SDK limits," with a Medium floor since it is exploitable by a realistic remote server. It is not the prior size-exhaustion route: `js-sdk-5087e2e1586dd529943e74ec` was dismissed on the **byte** dimension (`body_size_bounded_streamed`) and explicitly assumed `positive_timeout_aborts_fetch`; this candidate attacks the **time** dimension on the default-off (`timeout = 0`) path the prior record did not cover.

## PoC Guidance

- **Test file**: append to an existing `test/unit` stellartoml/fetch-client suite (e.g. `test/unit/stellar_toml_test.js` style or the fetch-client unit tests), using mocked responses — do not contact public infrastructure.
- **Setup**: ensure `Config.setDefault()` so `timeout = 0`. Construct a mock `Response` whose `body` is a `ReadableStream` that enqueues a small chunk, then stalls indefinitely (never calls `controller.close()`), with chunked transfer (no `content-length`) and total bytes < `STELLAR_TOML_MAX_SIZE`. Stub global `fetch` to return it.
- **Steps**: call `Resolver.resolve("attacker.example")` (default opts) and race the returned promise against a short test-side timer.
- **Assertion**: the test-side timer wins — `resolve()` does not settle within the window — demonstrating no SDK-imposed hold-time bound. Contrast: with `opts.timeout` set to a small value, `resolve()` rejects with `timeout of <n>ms exceeded` (the timeout `AbortSignal` path at `fetch-client.ts:334-337,385-387`), showing the defect is the default-off state, not the mechanism when enabled.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "stellartoml"
route_id = "js-sdk-6ed1a0df555f9d079b967630"
weakness = "Unbounded connection hold time on attacker-served stellar.toml response (slow-trickle body hang) when no timeout is configured"
record_kind = "single_path"
path = ["resolve", "httpCli ...    .get"]
sink = "httpCli ...    .get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/stellartoml/index.ts:resolve", "src/http-client/fetch-client.ts:boundedFetchAdapter", "src/http-client/fetch-client.ts:readBodyBounded", "src/config.ts:defaultConfig"]
scope.trust_boundary = "remote_domain_well_known_file"
scope.protocol_phase = "stellar_toml_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_and_toml_body"
scope.parser_state = "toml_decoded"
scope.size_class = "bounded_by_stellar_toml_max_size"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms the streamed maxContentLength cap bounds bytes only and does not bound connection hold time, so it is not a blocker for this candidate", "this time/hold-time route is not the prior NOT_VIABLE size-exhaustion record js-sdk-5087e2e1586dd529943e74ec, which bounded only bytes and assumed positive_timeout_aborts_fetch"]
does_not_rule_out = ["per-connection socket/promise accumulation magnitude across many forced resolutions was not quantified", "TOML parse-time complexity on a bounded body remains a separate unassessed route", "the bounded adapter ignoring config.cancelToken (honoring only the timeout-derived AbortSignal) is a related observation not separately reported here"]
assumptions = ["application calls Resolver.resolve without configuring opts.timeout or Config.setTimeout (the shipped default timeout=0)", "attacker controls the resolved domain's HTTP server and can serve a slow chunked body under 100 KiB", "no additional assumptions beyond cited source evidence in index.ts, config.ts, and fetch-client.ts"]
mechanism_brief = "Default timeout=0 means boundedFetchAdapter pushes no timeout AbortSignal and fetch runs with no signal; readBodyBounded streams with only a cumulative byte cap, so an attacker-served slow chunked body under 100 KiB makes resolve() never settle (unbounded in browser; multi-day per-connection under Node undici body-timeout)."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:readBodyBounded"
guarantee = "STELLAR_TOML_MAX_SIZE streamed cap bounds total response bytes only, not connection hold time; does not block this candidate"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:boundedFetchAdapter"
guarantee = "timeout AbortSignal aborts the body read but is created only when timeout > 0; shipped default timeout is 0 so no signal is wired on the default path"

[[blockers]]
kind = "not_found"
source = "src/stellartoml/index.ts:resolve"
guarantee = "no source-proven default time/connection-lifetime bound found on the resolve -> boundedFetchAdapter -> readBodyBounded path"
```
