# R983: Horizon redirect-following bypasses https/allowHttp gate and leaks X-Auth-Token + signed envelope cross-origin

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/983-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full Horizon HTTP path against current source:

- `Server` constructor builds its client with `createHttpClient(customHeaders)`
  (server.ts:118). `customHeaders` carries `X-Auth-Token` (server.ts:111-113),
  `X-App-Name`/`X-App-Version`, and any caller `opts.headers`.
- `createHttpClient` (horizon_axios_client.ts:38-45) calls `create({ headers:
  {...} })` and sets **only** headers. It never sets `maxRedirects` or
  `maxContentLength`.
- The https gate is `if (this.serverURL.protocol !== "https:" && !allowHttp)
  throw "Cannot connect to insecure horizon server"` (server.ts:120-122). It
  inspects only the construction-time `this.serverURL` — there is no per-request
  or per-redirect re-check.
- The submit POST (server.ts:349-353) passes only `timeout` and a
  `Content-Type` header; no `maxRedirects`/`maxContentLength`. Read call
  builders (`_sendNormalRequest`, call_builder.ts:387-398) call
  `this.httpClient.get(url.toString())` with no options at all.
- The client adapter (fetch-client.ts:482-490) routes to `boundedFetchAdapter`
  **only** when `config.maxRedirects !== undefined || config.maxContentLength
  !== undefined`; otherwise it calls plain feaxios `instance.request(config)`.
  Because Horizon sets neither field on the default client or on any request,
  every Horizon request takes the unmanaged feaxios path.
- The hardened cross-origin credential strip `stripCrossOriginAuth`
  (fetch-client.ts:276-294, which deletes `authorization`/`proxy-authorization`/
  `cookie` on a cross-origin hop) and `applyRedirectSemantics` live **inside**
  `boundedFetchAdapter` (invoked at fetch-client.ts:409-410). On the unmanaged
  path `boundedFetchAdapter` is never entered, so neither runs.
- On the unmanaged path native fetch uses its default `redirect: "follow"`
  (the managed `redirect` selection at fetch-client.ts:348-359 only applies
  inside the bounded adapter). Node/undici follows up to ~20 redirects,
  including https→http protocol downgrades, and does not block them (only
  browser mixed-content policy would).

The `_sendNormalRequest` protocol/host pin (call_builder.ts:390-393) rewrites
only the *initial* request URL's protocol/host; it does not intercept fetch's
redirect-following, so it does not block this path. Prior NOT_VIABLE record
js-sdk-26e2014cc473b795c741c78d concerns that pre-request `_links` URL pin, a
distinct mechanism from post-request redirect-following, so it does not subsume
this candidate (different route_id js-sdk-2a1428ac20bf568cf68ca936).

## Findings

A caller-selected Horizon server (malicious, compromised, or a hijacked
redirect hop) that returns a `3xx` with `Location: http://attacker.example/...`
causes the SDK to:

1. **Bypass the https/allowHttp gate at request time.** The constructor refused
   an insecure initial URL, but redirect-following silently downgrades the
   actual connection to http in Node, defeating the documented "Cannot connect
   to insecure horizon server" guarantee. This is the Medium "HTTPS policy or
   allowHttp gate bypass" impact category.
2. **Leak credentials and request payload cross-origin.** Custom headers
   (`X-Auth-Token`, `X-App-Name`, `X-App-Version`, caller `opts.headers`) are
   forwarded to the attacker origin — fetch only strips standard
   `Authorization`/`Cookie`/`Proxy-Authorization` cross-origin, not custom
   `X-*` headers. For a `submitTransaction` POST with a 307/308 redirect, the
   signed envelope body (`tx=<base64>`) is also re-sent to the attacker origin.

The submitted envelope is already signed and network-destined, so the dominant
harm is plaintext downgrade plus `X-Auth-Token`/custom-header exfiltration to a
foreign origin rather than direct fund movement, which keeps the finding at
Medium under the HTTPS/allowHttp-bypass category.

## PoC Guidance

- **Test file**: add to `test/unit/server_test.js` (or a new
  `test/unit/horizon_redirect_test.js`) following the existing axios-mock /
  fetch-mock pattern used for `submitTransaction`.
- **Setup**: construct `new Server("https://horizon.example")`; mock the first
  response as `307`/`302` with `Location: http://attacker.example/transactions`
  and a second handler on the attacker origin.
- **Steps**: call `server.submitTransaction(tx)` (or a call-builder `.call()`)
  and capture the request the attacker-origin handler receives.
- **Assertion**: assert the attacker-origin handler was reached (redirect
  followed), that the connection scheme is http (gate bypassed), and that the
  request still carries `X-Auth-Token` (and, for the POST, the `tx=` body).
  Contrast with a request issued through `boundedFetchAdapter` (set
  `maxRedirects`) to show the strip/cap would have applied.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-2a1428ac20bf568cf68ca936"
weakness = "https/allowHttp gate bypass and cross-origin credential leak via redirect-following"
record_kind = "single_path"
path = ["submitTransaction", "this.httpClient.post", "boundedFetchAdapter bypassed", "native fetch follows Location"]
sink = "native fetch redirect-follow on unmanaged adapter path"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/horizon/horizon_axios_client.ts:createHttpClient", "src/http-client/fetch-client.ts:createFetchClient", "src/http-client/fetch-client.ts:boundedFetchAdapter", "src/horizon/server.ts:submitTransaction", "src/horizon/call_builder.ts:_sendNormalRequest"]
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
rules_out = ["constructor https gate (server.ts:120) checks only the construction-time serverURL and does not re-check redirect targets", "_sendNormalRequest protocol/host pin (call_builder.ts:390-393) sanitizes only the initial URL, not fetch redirect-following", "prior _links pre-request SSRF dismissal (js-sdk-26e2014cc473b795c741c78d) addresses a different mechanism and does not subsume post-request redirect-following"]
does_not_rule_out = ["browser-bundle mixed-content blocking of https-to-http redirects", "friendbot_builder request path beyond the traced submit/call-builder routes"]
assumptions = ["Node/undici native fetch default redirect mode is follow and forwards custom X-* headers across cross-origin redirects while stripping only Authorization/Cookie/Proxy-Authorization", "X-Auth-Token is attached as a default client header (server.ts:111-113) and thus present on redirected requests"]
mechanism_brief = "createHttpClient never sets maxRedirects/maxContentLength, so the adapter selector (fetch-client.ts:482-490) uses plain feaxios; native fetch follows the attacker Location with redirect=follow, bypassing the https gate (server.ts:120) and the in-adapter stripCrossOriginAuth, leaking X-Auth-Token and the signed envelope to the attacker origin."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/horizon/server.ts:constructor"
guarantee = "https/allowHttp gate at server.ts:120 only validates the initial serverURL and does not block post-redirect http targets"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/horizon/call_builder.ts:_sendNormalRequest"
guarantee = "protocol/host pin (call_builder.ts:390-393) only rewrites the first request URL and does not govern fetch redirect-following"

[[blockers]]
kind = "not_found"
source = "src/http-client/fetch-client.ts:createFetchClient"
guarantee = "no maxRedirects is ever set for Horizon traffic, so boundedFetchAdapter (with stripCrossOriginAuth and redirect counting) is never invoked for this path"
```
