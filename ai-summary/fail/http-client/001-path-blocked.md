# F001: Path blocked: bounded-read / size / auth-strip dimensions of fetch transport

**Subsystem**: http-client
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/http-client/001-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> fetch`

Area seed target set: `<anonymous>`, `fetch`, `adapter`, `instance.request`,
`boundedFetchAdapter`, `get`, `response.headers.get`, `readBodyBounded`,
`request`.

## Per-Target Disposition

- `boundedFetchAdapter` / `readBodyBounded` / `response.headers.get` (size
  dimension): **blocked**. Bounded read enforces the cap twice — an early
  `content-length` header check and a streaming per-chunk running-total check
  that calls `reader.cancel()` and throws before buffering more than the cap.
  A lying/absent `content-length` falls through to the streaming guard, and a
  non-numeric header yields `NaN` (check skipped) but the stream guard still
  fires. Peak memory is `chunks[] + out` ≈ 2× cap — bounded. No accumulating
  queue/cache/timer in this layer; each response is read once and released, so
  repetition does not accumulate across events.
- `boundedFetchAdapter` redirect loop (auth dimension): **blocked**.
  `stripCrossOriginAuth` compares full `URL.origin` (scheme+host+port), treats
  malformed URLs as cross-origin, and removes authorization/proxy-authorization/
  cookie before the next hop.
- `adapter` / `instance.request` / `get` / `request` routing: bounded adapter
  is selected whenever `maxRedirects` or `maxContentLength` is set;
  `mergeWithDefaults` preserves inherited bounds on per-call configs. The
  feaxios path runs only when neither bound is set (documented caller
  responsibility), so it is not a defense bypass within this layer.
- Redirect-target trust (scheme/host of followed `Location`): **already VIABLE**
  under prior reviewed finding js-sdk-3210675ec7643a3184fe756f; not re-reported
  here. Left open in `does_not_rule_out`.

## Blocker

The bounded-read, size, and cross-origin auth-strip gates are source-proven for
this exact route. `readBodyBounded` enforces `maxContentLength` both via the
`content-length` header and via a streaming running-total that cancels the
reader and throws before exceeding the cap, so an attacker-controlled response
body or forged/absent length header cannot exceed the configured bound or
accumulate unboundedly. `stripCrossOriginAuth` removes credential headers on any
origin change. These dimensions therefore yield no distinct Medium+ finding
beyond the already-VIABLE redirect-target SSRF.

## Evidence

- `src/http-client/fetch-client.ts:153-193` - `readBodyBounded` header pre-check plus streaming `total > maxContentLength` guard with `reader.cancel()`.
- `src/http-client/fetch-client.ts:276-294` - `stripCrossOriginAuth` strips auth/proxy-auth/cookie on origin mismatch, malformed-URL → cross-origin.
- `src/http-client/fetch-client.ts:482-490` - adapter routing selects `boundedFetchAdapter` whenever either bound is set; `mergeWithDefaults` (86-103) preserves inherited bounds.

## Negative Scope

- Rules out: maxContentLength bypass / unbounded-response DoS and cross-origin credential-header leak on the bounded fetch transport when a size or redirect bound is configured.
- Does not rule out: (a) the already-VIABLE redirect-target scheme-downgrade/arbitrary-host SSRF in the same loop (js-sdk-3210675ec7643a3184fe756f); (b) 307/308 cross-origin re-forward of the original request body (auth/cookie stripped, body retained); (c) browser-mode hop count limited to fetch's native 20 when `maxRedirects>0` because the manual loop only runs in Node.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "http-client"
route_id = "js-sdk-0f3de652e21d6be98b52f804"
weakness = "network request / transport integrity"
record_kind = "area_seed"
path = ["<anonymous>", "fetch"]
sink = "fetch"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["boundedFetchAdapter", "readBodyBounded", "stripCrossOriginAuth", "response.headers.get", "instance.request", "get"]
scope.trust_boundary = "remote_http_server"
scope.protocol_phase = "http_transport"
scope.auth_state = "caller_configured"
scope.attacker_control = "url_headers_body_and_remote_response"
scope.parser_state = "byte_stream_or_json_decoded"
scope.size_class = "bounded_when_max_content_length_is_set"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["maxcontentlength_streaming_bounded", "cross_origin_auth_stripped"]
rules_out = ["unbounded remote response body / maxContentLength bypass on bounded fetch adapter", "cross-origin credential header (authorization/cookie) leak across redirect hop"]
does_not_rule_out = ["redirect-target scheme-downgrade/arbitrary-host SSRF following attacker Location (already VIABLE js-sdk-3210675ec7643a3184fe756f)", "307/308 cross-origin re-forward of original request body", "browser-mode redirect hop count bounded only by fetch native 20 when maxRedirects>0"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "readBodyBounded enforces maxContentLength via both a content-length pre-check and a streaming running-total that cancels the reader before exceeding the cap; stripCrossOriginAuth removes credential headers on origin change; adapter routing and mergeWithDefaults preserve configured bounds."
why_failed_brief = "size/bounded-read and cross-origin auth-strip gates are source-proven for this route; the only live distinct risk (redirect-target SSRF) is already VIABLE and is not re-reported."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "size_bound"
guarantee = "readBodyBounded throws maxContentLength-exceeded via content-length pre-check and per-chunk streaming total, cancelling the reader before over-buffering (src/http-client/fetch-client.ts:153-193)"

[[sanitizer_guarantees]]
kind = "credential_strip"
guarantee = "stripCrossOriginAuth deletes authorization/proxy-authorization/cookie on any URL.origin mismatch; malformed URL treated as cross-origin (src/http-client/fetch-client.ts:276-294)"

[[blockers]]
kind = "validated_bound"
guarantee = "streaming total > maxContentLength check with reader.cancel() prevents unbounded buffering of attacker-controlled response bodies (src/http-client/fetch-client.ts:171-184)"
```
