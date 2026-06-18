# F910: Path blocked: stellar.toml resolver outbound HTTP get (size/timeout bounds)

**Subsystem**: stellartoml
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/stellartoml/910-path-seed.md
**Verdict**: NOT_VIABLE
**Hypothesis by**: claude-opus-4-8, high

## Path Checked

`resolve -> httpCli ...    .get`

Area seed target set: `resolve`, `get`, `<anonymous>`, `httpCli ...    .get`.

## Blocker

For the outbound get issued by `resolve`, the size and positive-timeout
assumptions hold at source. `resolve` always passes `maxContentLength =
STELLAR_TOML_MAX_SIZE` (index.ts:57), which forces the bounded fetch adapter
(fetch-client.ts:483-490), and `readBodyBounded` enforces the cap *during*
streaming — it accumulates chunks and `reader.cancel()`s the moment the running
total exceeds the cap (fetch-client.ts:171-184), so single-response body
exhaustion (incl. gzip-decompressed bytes pulled on demand) is bounded to
~100KiB. When `timeout > 0`, the adapter aborts the fetch via
`createTimeoutSignal(config.timeout)` (fetch-client.ts:334-337). The remaining
integrity gaps on this exact route — domain host/scheme injection before fetch,
unbounded read when `timeout<=0`, and server-driven redirect scheme/host
downgrade — are already VIABLE on this same `route_id`/family, so no DISTINCT
new mechanism survives here.

## Evidence

- `src/stellartoml/index.ts:54-67` - resolve issues the get with `maxContentLength=STELLAR_TOML_MAX_SIZE`, `maxRedirects=allowedRedirects??0`, and `cancelToken` created only when `timeout` is truthy.
- `src/http-client/fetch-client.ts:171-184` - `readBodyBounded` cancels the reader and throws once streamed `total > maxContentLength`, bounding peak memory.
- `src/http-client/fetch-client.ts:331-337` - bounded adapter composes an abort signal only from `config.timeout` (when `>0`); a positive timeout bounds total fetch+body time.
- `src/http-client/fetch-client.ts:561-573` - makeRequest sets `config.signal` and wires `cancelToken → abortController.abort()`, but `boundedFetchAdapter` never reads `config.signal`, so caller cancellation is dropped in the bounded path (masked on resolve because cancelToken is coupled to a positive timeout that arms the adapter signal).

## Negative Scope

- Rules out: single-response (or decompression-bomb) body-size resource
  exhaustion on `resolve -> get`, and unbounded body read when the caller
  supplies a positive `timeout`.
- Does not rule out: (a) already-VIABLE host/scheme injection on the domain
  before fetch (route_id js-sdk-a0a2d5acc9407b3ba398d119); (b) already-VIABLE
  unbounded read when `timeout<=0`/default (same route_id); (c) already-VIABLE
  redirect scheme/host downgrade in the manual loop (route_id
  js-sdk-3210675ec7643a3184fe756f); (d) `config.signal`/`cancelToken` being
  dropped by `boundedFetchAdapter` for OTHER bounded-adapter callers that pass
  an AbortSignal/cancelToken without a positive `timeout`.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "stellartoml"
route_id = "js-sdk-5087e2e1586dd529943e74ec"
weakness = "network request integrity"
record_kind = "area_seed"
path = ["resolve", "httpCli ...    .get"]
sink = "httpCli ...    .get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/stellartoml/index.ts:resolve", "src/http-client/fetch-client.ts:boundedFetchAdapter", "src/http-client/fetch-client.ts:readBodyBounded"]
scope.trust_boundary = "remote_domain_well_known_file"
scope.protocol_phase = "stellar_toml_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_and_toml_body"
scope.parser_state = "toml_decoded"
scope.size_class = "bounded_by_stellar_toml_max_size"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["body_size_bounded_streamed", "positive_timeout_aborts_fetch"]
rules_out = ["single-response body-size resource exhaustion on resolve->get (streamed maxContentLength cap)", "unbounded body read when caller supplies a positive timeout"]
does_not_rule_out = ["host/scheme injection on domain before fetch (VIABLE js-sdk-a0a2d5acc9407b3ba398d119)", "unbounded read when timeout<=0/default (VIABLE js-sdk-a0a2d5acc9407b3ba398d119)", "redirect scheme/host downgrade in manual loop (VIABLE js-sdk-3210675ec7643a3184fe756f)", "config.signal/cancelToken dropped by boundedFetchAdapter for other bounded-adapter callers without positive timeout"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "resolve forces the bounded fetch adapter via maxContentLength; readBodyBounded enforces the size cap during streaming and a positive timeout arms an abort signal, so size and positive-timeout assumptions hold for the outbound get; remaining integrity gaps on this route are already VIABLE."
why_failed_brief = "size is streamed-bounded and positive-timeout aborts the fetch; no distinct new mechanism beyond already-VIABLE host-injection, timeout<=0, and redirect-downgrade findings on this route."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "size_bound"
guarantee = "readBodyBounded (fetch-client.ts:171-184) cancels the reader and throws once streamed total exceeds maxContentLength=STELLAR_TOML_MAX_SIZE, bounding single-response body memory to ~100KiB."

[[sanitizer_guarantees]]
kind = "timeout_bound"
guarantee = "boundedFetchAdapter (fetch-client.ts:334-337) arms createTimeoutSignal(config.timeout) when timeout>0, aborting the fetch and body stream within the caller-supplied timeout."

[[blockers]]
kind = "checked_guard"
guarantee = "resolve always sets maxContentLength (index.ts:57), forcing the bounded adapter (fetch-client.ts:483-490); size-exhaustion variants are blocked for this exact route."
```
