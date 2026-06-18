# R913: Horizon and Soroban RPC clients buffer remote responses with no size bound (single-response memory-exhaustion DoS)

**Date**: 2026-06-18
**Subsystem**: http-client
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/http-client/913-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The fetch client's default adapter selects a transport based solely on whether
`maxRedirects`/`maxContentLength` are set (`src/http-client/fetch-client.ts:482-490`):

```ts
adapter: (config) => {
  if (config.maxRedirects !== undefined || config.maxContentLength !== undefined) {
    return boundedFetchAdapter(config);   // streamed cap via readBodyBounded
  }
  return instance.request(config);        // feaxios — unbounded
}
```

The bounded path's streamed cap (`readBodyBounded`, `fetch-client.ts:153-193`,
with `total > maxContentLength` + `reader.cancel()` at 176-181) is only reached
when one of those two options is present. The file's own comment
(`fetch-client.ts:322-327`) states feaxios "ignores maxRedirects and
maxContentLength" and that the bounded adapter exists precisely because omitting
it allows "redirect-based SSRF and unbounded-response DoS."

Both high-traffic clients are constructed without either option:

- `src/horizon/horizon_axios_client.ts:38-45` — `createHttpClient` calls
  `create({ headers })` only; no `maxContentLength`/`maxRedirects`. This client
  backs every Horizon call builder and `submitTransaction` POST.
- `src/rpc/axios.ts:6-14` — RPC `createHttpClient` likewise calls
  `create({ headers })` only; used for every `jsonrpc.postObject` call.

`mergeWithDefaults` (`fetch-client.ts:86-103`) injects no default bound, and a
repo-wide search confirms `maxContentLength`/`maxRedirects` are set **only** in
`src/stellartoml/index.ts:56-57` (`STELLAR_TOML_MAX_SIZE`) and
`src/federation/server.ts:226` (`FEDERATION_RESPONSE_MAX_SIZE`). No global
default and no Horizon/RPC-level bound exists anywhere in `src/`.

Consequently every Horizon and Soroban RPC request takes `instance.request`
(feaxios), which buffers the entire attacker-controlled response body into
memory with no streamed cap.

## Findings

Trust boundary for this subsystem is a remote HTTP server whose response body is
attacker-controlled (a malicious or compromised Horizon/RPC endpoint, or an MITM
when `allowHttp` is enabled). Such a server can return an arbitrarily large or
chunked/streamed response body that the SDK fully buffers, causing unbounded
memory allocation and a single-response denial of service on the two transports
that carry essentially all production SDK traffic.

This is an **unsafe default**, not documented caller responsibility: the SDK
applies a default response-size cap for `stellartoml` and `federation`, the
exact same threat is called out in the SDK's own source comment
(`fetch-client.ts:322-327`), and the public Horizon/RPC call-builder APIs do not
expose `maxContentLength` per call — so an application has no straightforward
way to opt the highest-traffic clients into the protection. This matches the
objective's "Resource exhaustion from a single response not bounded by
documented SDK limits / unbounded response processing in HTTP body handling →
Medium if exploitable by a realistic remote server."

Severity is **Medium**: memory-exhaustion availability impact from a single
response, with no transaction-signing, fund-movement, or response-integrity
consequence (the floor in IMPACT_CATEGORIES for unbounded response processing).

Novelty: distinct from the prior NOT_VIABLE record
(`js-sdk-0f3de652e21d6be98b52f804`), whose streamed `readBodyBounded` cap is
genuinely correct but is reached **only** on the opt-in `boundedFetchAdapter`.
That negative result does not cover the default feaxios transport Horizon/RPC
use, which is this finding's route (`js-sdk-74011b123136054779aaac38`).

## PoC Guidance

- **Test file**: add a focused Vitest unit test under `test/unit/` exercising
  the fetch client directly (mock `fetch`/feaxios; do not contact public
  infra).
- **Setup**: build a Horizon (or RPC) `HttpClient` via the production factory
  (`horizon_axios_client.createHttpClient()` / `rpc/axios.createHttpClient()`).
  Stub the underlying `fetch` to return a `Response` whose body is a
  `ReadableStream` emitting many large chunks (or report a small/absent
  `content-length` while streaming far more bytes).
- **Steps**: issue a GET/POST through the client; instrument how many bytes the
  adapter pulls before resolving.
- **Assertion**: demonstrate the client reads/buffers the entire oversized body
  (no `maxContentLength size ... exceeded` error is thrown and the read does not
  abort), whereas the same request through `boundedFetchAdapter` with a
  `maxContentLength` set aborts via `reader.cancel()`. This shows the default
  Horizon/RPC transport applies no size bound.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "http-client"
route_id = "js-sdk-74011b123136054779aaac38"
weakness = "Unbounded remote response buffering on the default (non-bounded) transport used by Horizon and Soroban RPC"
record_kind = "single_path"
path = ["createFetchClient.adapter", "instance.request"]
sink = "request"
sink_role = "network_request"
impact_class = "resource_exhaustion"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/http-client/fetch-client.ts:createFetchClient", "src/horizon/horizon_axios_client.ts:createHttpClient", "src/rpc/axios.ts:createHttpClient"]
scope.trust_boundary = "remote_http_server"
scope.protocol_phase = "http_transport"
scope.auth_state = "caller_configured"
scope.attacker_control = "url_headers_body_and_remote_response"
scope.parser_state = "byte_stream_or_json_decoded"
scope.size_class = "unbounded"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_by_bounded_adapter_notviable_record"]
rules_out = ["the prior NOT_VIABLE streamed-cap result (js-sdk-0f3de652e21d6be98b52f804) does not block this candidate: readBodyBounded's cap is reached only on the opt-in boundedFetchAdapter, never on the default feaxios instance.request path that adapter selection (fetch-client.ts:482-490) routes Horizon/RPC to", "no default maxContentLength exists: mergeWithDefaults (fetch-client.ts:86-103) injects none and a repo-wide search shows the bound set only in stellartoml and federation"]
does_not_rule_out = ["redirect scheme/host non-revalidation on the manual bounded loop (already VIABLE: js-sdk-3210675ec7643a3184fe756f / js-sdk-cda4d93790ffd066b1523001)", "per-request body bound on the opt-in boundedFetchAdapter (already NOT_VIABLE: js-sdk-0f3de652e21d6be98b52f804)"]
assumptions = ["feaxios's instance.request buffers the full response body with no streamed size cap, as documented by the in-repo comment at fetch-client.ts:322-327 stating feaxios ignores maxContentLength and that omitting bounds allows unbounded-response DoS", "a malicious/compromised Horizon or RPC server, or an MITM when allowHttp is enabled, is an in-scope attacker that can return an arbitrarily large/streamed response body"]
mechanism_brief = "Horizon and RPC clients are created without maxContentLength/maxRedirects, so adapter selection routes their requests to the default feaxios transport that buffers the full attacker-controlled response body with no streamed cap, enabling single-response memory exhaustion on the SDK's highest-traffic clients."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:readBodyBounded"
guarantee = "the streamed total > maxContentLength cap with reader.cancel() (fetch-client.ts:171-184) bounds responses ONLY on the opt-in boundedFetchAdapter; it is not reached on the default feaxios instance.request path used by Horizon/RPC"

[[blockers]]
kind = "not_found"
source = "src/http-client/fetch-client.ts:createFetchClient"
guarantee = "no default maxContentLength and no Horizon/RPC-level size bound found; mergeWithDefaults injects none and only stellartoml and federation opt in"
```
