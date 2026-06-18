# R904-2: Default `timeout=0` plus deadline-free streamed body read lets a slow stellar.toml server pin resolve indefinitely

**Date**: 2026-06-17
**Subsystem**: stellartoml
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/stellartoml/904-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Default config has no time bound: `defaultConfig.timeout = 0`
(`src/config.ts:17-20`), and `getTimeout()` returns that 0 by default.

`Resolver.resolve` (`src/stellartoml/index.ts:49-67`) sets
`timeout = typeof opts.timeout === "undefined" ? Config.getTimeout() : opts.timeout`
(0 under default), then builds the `cancelToken` **only** `if (timeout)`
(`index.ts:58-65`). With `timeout = 0` the ternary yields `undefined`, so no
cancel timer is created, and `timeout: 0` is forwarded into the request config.

In `boundedFetchAdapter` (`src/http-client/fetch-client.ts:328-337`) the only
place a time-based `AbortSignal` is composed is:

```
if (timeout && timeout > 0) {
  signals.push(createTimeoutSignal(timeout));
}
const signal = composeSignals(signals);
```

With `timeout = 0`, `signals` stays empty and `composeSignals([])` returns
`undefined` (`fetch-client.ts:219-220`), so `currentInit` carries **no signal**
(`fetch-client.ts:368-375`). `fetch` itself has no default timeout.

The response body is then consumed by `readBodyBounded`
(`fetch-client.ts:153-193`):

```
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  if (value) {
    total += value.byteLength;
    if (maxContentLength !== undefined && total > maxContentLength) { ... throw }
    chunks.push(value);
  }
}
```

The loop enforces only a running **byte** total against `maxContentLength`
(~100 KiB). There is no deadline. A malicious stellar.toml server that sends
headers and then trickles body bytes slowly (or sends nothing and never closes
the connection) keeps `await reader.read()` pending forever while staying under
the size cap. With no `AbortSignal` there is nothing to interrupt the read.

## Findings

**Security impact**: bounded resource exhaustion / connection-hold under the
**default** configuration. Each malicious endpoint the caller contacts holds one
`resolve` promise and one open socket open indefinitely. An application that
resolves attacker-influenced anchor/federation domains (a normal SDK use) can
accumulate stuck promises and sockets, exhausting connection/file-descriptor and
memory budgets over time. This maps to the objective's "Resource exhaustion from
a single response that is not bounded by documented SDK limits" category
(Medium, exploitable by a realistic remote server).

**Unsafe-default reasoning (not pure caller responsibility)**: the docs frame
`timeout` as a convenience ("avoid nasty lag", `index.ts:24`), but the shipped
default is `0` = *no* time bound, combined with a streamed read that has no
deadline of its own. That is an SDK-level unsafe default, so the OUT_OF_SCOPE
"documented as caller responsibility with no SDK-level unsafe default" exclusion
does **not** apply. The size cap (`maxContentLength`) bounds total bytes but
explicitly not total time.

**Novelty**: distinct from prior NOT_VIABLE parse-side memory/CPU exhaustion
(`js-sdk-cf63bb7d677c95e5892218bb`, prior [4]) — that ruling covers the
bounded, one-shot `smol-toml` parse sink. This is a time/connection-hold
mechanism in the network read loop before parsing, not the parse sink.

## PoC Guidance

- **Test file**: append to `test/unit/stellar_toml_test.js`.
- **Setup**: mock the transport with a response whose `body` is a
  `ReadableStream` that emits one small chunk and then never closes / never
  emits `done` (e.g. a stream backed by a controller that is never closed, or a
  small chunk then an unresolved pending read). Keep total bytes < 100 KiB.
- **Steps**: call `StellarToml.Resolver.resolve(domain)` with **no** `timeout`
  option (and `Config` left at default `timeout = 0`). Race the resolve promise
  against a short test timer.
- **Assertion**: assert the resolve promise does **not** settle within the test
  window (the timer wins), demonstrating the absence of a default deadline.
  Contrast: calling `resolve(domain, { timeout: 50 })` settles (rejects with the
  `timeout of 50ms exceeded` path via `createTimeoutSignal`), proving the hang
  is specific to the `timeout = 0` default. Keep the test fully mocked — do not
  contact public infrastructure.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "stellartoml"
route_id = "js-sdk-a0a2d5acc9407b3ba398d119"
weakness = "network request integrity"
record_kind = "single_path"
path = ["resolve", "get"]
sink = "get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/stellartoml/index.ts:resolve", "src/http-client/fetch-client.ts:readBodyBounded"]
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
rules_out = ["source trace confirms default Config.timeout=0 (config.ts:17-20), resolve composes a cancelToken only if (timeout) (index.ts:58), and boundedFetchAdapter adds a signal only if (timeout && timeout > 0) (fetch-client.ts:334) so no AbortSignal exists; readBodyBounded (fetch-client.ts:171-184) loops reader.read() enforcing only a byte cap with no deadline, leaving the read unbounded in time under default config"]
does_not_rule_out = ["parse-side memory/CPU exhaustion (prior NOT_VIABLE route js-sdk-cf63bb7d677c95e5892218bb)", "behavior when the caller explicitly sets a positive timeout (a signal is then composed and the read is bounded)"]
assumptions = ["caller uses default config or omits opts.timeout; fetch provides no implicit default timeout; resolve always passes maxContentLength so boundedFetchAdapter is the live path"]
mechanism_brief = "default Config.timeout=0 means resolve composes no AbortSignal; readBodyBounded streams with only a byte cap and no deadline, so a slow-feeding or never-closing malicious stellar.toml server holds the resolve promise and socket open indefinitely under the size cap."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:readBodyBounded"
guarantee = "maxContentLength bounds total bytes (~100KiB) but not total read time; no deadline in the reader.read() loop"

[[blockers]]
kind = "not_found"
source = "src/http-client/fetch-client.ts:boundedFetchAdapter"
guarantee = "no default time bound on the streamed body read for this path when timeout=0 (no AbortSignal composed)"
```
