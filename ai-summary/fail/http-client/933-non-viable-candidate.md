# F933: Unbounded read on default instance.request path (Horizon/RPC)

**Date**: 2026-06-18
**Subsystem**: http-client
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/http-client/933-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The mechanism C1 describes is source-accurate. I traced every cited location in
current source:

- `src/http-client/fetch-client.ts:482-489` — the default adapter selects
  `boundedFetchAdapter(config)` only when
  `config.maxRedirects !== undefined || config.maxContentLength !== undefined`;
  otherwise it `return instance.request(config)` (the raw feaxios path).
- `src/http-client/fetch-client.ts:322-327` — the file's own comment documents
  that "feaxios ignores maxRedirects and maxContentLength", which is why the
  bounded adapter exists. The streamed cap in `readBodyBounded`
  (`fetch-client.ts:153-193`, specifically the `total > maxContentLength`
  `reader.cancel()` at 176-181) is the only size enforcement and is unreachable
  on the `instance.request` branch.
- `src/horizon/horizon_axios_client.ts:38-45` — `createHttpClient` calls
  `create({ headers: ... })` with no `maxContentLength` / `maxRedirects`.
- `src/rpc/axios.ts:6-14` — `createHttpClient` likewise calls
  `create({ headers })` with no cap.
- `src/horizon/call_builder.ts:395-398` — `this.httpClient.get(url.toString())`
  is issued with no per-call config.
- `src/http-client/fetch-client.ts:86-103` (`mergeWithDefaults`) and the `get`
  method at `:623-632` — confirmed no default `maxContentLength` is injected, so
  the merged config carries no cap and the adapter takes the uncapped branch.

So the typed route is real and current-source verified: Horizon/RPC default
clients route remote response reads through the uncapped `instance.request`
branch with no SDK size accounting.

## Why It Failed

This candidate is an **exact typed duplicate of an already-confirmed VIABLE
finding** in structured prior memory: route `js-sdk-74011b123136054779aaac38`
(prior-investigations record, `stage=reviewed`, `verdict=VIABLE`).

That record covers the identical typed path
(`createFetchClient.adapter; instance.request`), identical scope
(`remote_http_server / http_transport / caller_configured /
url_headers_body_and_remote_response / byte_stream_or_json_decoded`), and the
identical mechanism — its `blocked_by`/negative-scope text reads "no default
maxContentLength and no Horizon/RPC-level size bound found; mergeWithDefaults
injects none and only stellartoml and federation opt in", and its `rules_out`
states "readBodyBounded's cap is reached only on the opt-in boundedFetchAdapter,
never on the default feaxios instance.request". That is precisely C1's claim.

The dispatch seed and hypothesis treat `js-sdk-74011b123136054779aaac38` as an
*open residual lead* left behind by the bounded-adapter NOT_VIABLE family
(`js-sdk-23977de2948fe40fd4758746`). Structured memory contradicts that premise:
the uncapped-path finding was already escalated and recorded VIABLE under
`js-sdk-74011b123136054779aaac38`. Re-confirming it here would double-count the
same finding, which the reviewer novelty rule forbids (exact typed duplicate →
NOT_VIABLE for this candidate). The underlying bug is real and remains captured
by the existing VIABLE record; it is not lost by this disposition.

## What This Rules Out

Re-opening the uncapped `instance.request` / no-`maxContentLength` Horizon/RPC
unbounded-read route as a *new* finding. The exact typed route
(default-adapter → `instance.request`, remote_http_server, byte_stream /
json_decoded, unbounded-when-no-cap) is already owned by the VIABLE record
`js-sdk-74011b123136054779aaac38`.

## What This Does Not Rule Out

- Variants on a *different transport* than `instance.request` — e.g. the
  EventSource/streaming path — which are out of this route's path.
- feaxios-internal mitigations or behaviors that live in `node_modules`
  (out of source scope); the in-source defect stands regardless.
- A distinct typed route with a different trust boundary, protocol phase, or
  size class (e.g. a caller that sets `maxRedirects` without `maxContentLength`,
  driving the uncapped `readBodyBounded` branch) — that is a separate typed
  shape, not disposed of here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "http-client"
route_id = "js-sdk-23977de2948fe40fd4758746"
weakness = "bounded_response_read"
record_kind = "single_path"
path = ["instance.request", "readBodyBounded"]
sink = "instance.request"
sink_role = "bounded_response_read"
impact_class = "resource_exhaustion"
route_family = "bounded_response_read"
material_effect = "re-investigate residual lead"
target_functions = ["src/http-client/fetch-client.ts:createFetchClient", "src/http-client/fetch-client.ts:readBodyBounded", "src/horizon/horizon_axios_client.ts:createHttpClient", "src/rpc/axios.ts:createHttpClient", "src/horizon/call_builder.ts:_sendNormalRequest"]
scope.trust_boundary = "remote_http_server"
scope.protocol_phase = "http_transport"
scope.auth_state = "caller_configured"
scope.attacker_control = "url_headers_body_and_remote_response"
scope.parser_state = "byte_stream_or_json_decoded"
scope.size_class = "unbounded_when_no_cap_set"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["exact_typed_duplicate_of_existing_viable_finding"]
rules_out = ["re-opening the uncapped instance.request / no-maxContentLength Horizon/RPC unbounded-read route as a new finding; the exact typed route is already owned by VIABLE record js-sdk-74011b123136054779aaac38"]
does_not_rule_out = ["EventSource/stream transport path (not instance.request)", "feaxios-internal mitigations in node_modules", "a caller setting maxRedirects without maxContentLength to drive the uncapped readBodyBounded branch (separate typed shape)"]
assumptions = ["prior-investigations record js-sdk-74011b123136054779aaac38 (stage=reviewed, VIABLE) covers the identical typed path/scope/mechanism re-derived by C1, per the injected memory brief", "source trace of fetch-client.ts:482-489, horizon_axios_client.ts:38-45, rpc/axios.ts:6-14, call_builder.ts:395-398, mergeWithDefaults:86-103 confirms the mechanism is real and current"]
mechanism_brief = "Horizon/RPC createHttpClient set no maxContentLength, so the default adapter forwards to instance.request (feaxios) with no SDK size cap; readBodyBounded is bypassed. Mechanism is real but already recorded VIABLE under js-sdk-74011b123136054779aaac38."
why_failed_brief = "exact typed duplicate of already-confirmed VIABLE finding js-sdk-74011b123136054779aaac38 (same path instance.request, same scope, same no-default-cap mechanism); re-reporting would double-count."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:readBodyBounded"
guarantee = "the readBodyBounded streamed cap (fetch-client.ts:176-181) is real but unreachable on the instance.request branch taken by Horizon/RPC; this matches the existing VIABLE record's finding rather than creating a new one"

[[blockers]]
kind = "duplicate_prior_record"
source = "src/http-client/fetch-client.ts:createFetchClient"
guarantee = "the uncapped instance.request unbounded-read route is already captured as VIABLE record js-sdk-74011b123136054779aaac38 with identical path, scope, and mechanism; this candidate is an exact typed duplicate"
```
