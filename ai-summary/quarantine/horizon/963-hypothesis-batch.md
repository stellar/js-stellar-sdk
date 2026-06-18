# H963: Hypothesis batch for transport/redirect SSRF on httpClient.post

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/963-residual-seed.md
**Hypothesis by**: claude-opus-4-8, high

## Shared Path Context

**Path**: `Server.submitTransaction` / `submitAsyncTransaction` / call-builder
reads → `this.httpClient.post` / `.get` → fetch-client default adapter →
native `fetch` with `redirect: "follow"`.

**Trust boundary**: `remote_horizon_server` (the Horizon endpoint selected by
the caller; in scope as attacker-controlled per the objective threat model,
`scope.attacker_control = remote_response_and_caller_supplied_transaction`).

**Parser state**: JSON/XDR decoded after transport; the transport itself is the
issue here, before decode.

**Root cause (source-confirmed)**: The fetch-client only routes a request
through the hardened `boundedFetchAdapter` — which counts redirect hops, strips
cross-origin credential headers, and bounds the response body — when
`maxRedirects` **or** `maxContentLength` is defined on the request config:

```
src/http-client/fetch-client.ts:482-490
  adapter: (config) => {
    if (config.maxRedirects !== undefined ||
        config.maxContentLength !== undefined) {
      return boundedFetchAdapter(config);
    }
    return instance.request(config);   // feaxios → native fetch, redirect:"follow"
  }
```

No code under `src/horizon/` ever sets `maxRedirects` or `maxContentLength`
(verified by scoped grep: only `src/stellartoml/index.ts` and
`src/federation/server.ts` set them). Therefore **every** Horizon request —
`submitTransaction` (server.ts:349-353), `submitAsyncTransaction`
(server.ts:580-581), and all read call builders via
`_sendNormalRequest` (call_builder.ts:395-396) — takes the unprotected
`instance.request` path. The construction-time HTTPS gate
(server.ts:120-122) validates only the original `serverURL`; it is never
re-evaluated on redirect targets.

**Prior memory**: prior [2] (route `js-sdk-2a1428ac20bf568cf68ca936`,
reviewed=VIABLE) already established the redirect-follow mechanism. This batch
answers the residual escalation's explicit "confirm or refute" with a
source-confirmed YES (C1) and adds two **distinct material effects** on the
same root-cause bypass — cross-origin credential leakage (C2) and unbounded
response-body exhaustion (C3) — that the bare-SSRF prior record does not cover.
Prior [1]/[3] NOT_VIABLE concern decode-output-is-leaf and `_links` rewrite,
neither of which is the HTTP-transport redirect mechanism here; re-checked from
source and they do not block these candidates.

## Candidate 1

**Candidate ID**: C1
**Severity**: Medium
**Impact**: HTTPS/allowHttp policy bypass + SSRF on Horizon submit/read traffic
**Mechanism**: A malicious/compromised caller-selected Horizon server responds
with a 3xx redirect. Native fetch (`redirect:"follow"`) follows the `Location`
to an arbitrary host without re-checking the HTTPS gate or counting hops. A
307/308 redirect re-POSTs the signed `tx=` envelope body to the attacker host;
301/302/303 issues a GET. The target may be `http://` (TLS downgrade past the
server.ts:120 gate) or an internal/cloud-metadata address (`169.254.169.254`),
turning the SDK into an SSRF request initiator.
**Trigger**: Caller calls `submitTransaction`/`submitAsyncTransaction` (or any
read) against a Horizon URL whose operator/MITM-on-an-http-hop returns a 3xx
with an attacker-chosen `Location`.
**Target Functions**:
- `src/horizon/server.ts:submitTransaction:349-353`
- `src/horizon/server.ts:submitAsyncTransaction:580-581`
- `src/http-client/fetch-client.ts:createFetchClient(adapter):482-490`

### Expected Behavior

Redirect targets for Horizon traffic should be validated against the same
HTTPS/host policy enforced at construction, and redirects should be hop-bounded
(as `boundedFetchAdapter` does for stellartoml/federation).

### Evidence

- `fetch-client.ts:482-490` — adapter only invokes `boundedFetchAdapter` when a
  bound is set; otherwise `instance.request` (native fetch) is used.
- `fetch-client.ts:348-359` — even inside `boundedFetchAdapter`, undefined
  `maxRedirects` yields `redirect:"follow"`; the default path never reaches even
  this code.
- `server.ts:349-353` / `580-581` — submit calls pass only `timeout` + headers,
  no bounds.
- `server.ts:120-122` — HTTPS gate checks only the construction-time
  `serverURL`, never redirect targets.
- grep: no `maxRedirects`/`maxContentLength` anywhere under `src/horizon/`.

### Anti-Evidence

- `call_builder.ts:392-393` rewrites `_links` protocol/host to the configured
  authority, but that is applied to the JSON-derived next/prev URL *before* the
  request; it does not constrain HTTP `Location` redirects followed by fetch.
- Honest-Horizon-over-HTTPS limits a pure network MITM, but the objective
  treats the Horizon server itself as the trust boundary/attacker, so a
  malicious/compromised endpoint satisfies the threat model.

```toml-index
schema = 1
verdict = "CANDIDATE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-fa7e54befd2c601ca0dd1c60"
weakness = "redirect_following_ssrf_and_https_downgrade"
record_kind = "single_path"
path = ["submitTransaction", "httpClient.post"]
sink = "httpClient.post"
sink_role = "http_transport"
impact_class = "https_policy_bypass_ssrf"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/horizon/server.ts:submitTransaction", "src/http-client/fetch-client.ts:createFetchClient"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = []
rules_out = []
does_not_rule_out = ["cross_origin_credential_leak_on_redirect", "unbounded_response_body_exhaustion"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Horizon traffic never sets maxRedirects, so the fetch-client default adapter uses native fetch with redirect:follow; a malicious Horizon 3xx redirects submit/read to an arbitrary host (http downgrade, internal SSRF) without re-checking the construction-time HTTPS gate."
why_failed_brief = "not failed; candidate survived checked blockers"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "construction-time HTTPS gate (server.ts:120) checks only the original serverURL and is not re-evaluated on redirect targets"

[[blockers]]
kind = "not_found"
guarantee = "no maxRedirects/host re-validation is applied to Horizon redirect targets on the post/get path"
```

## Candidate 2

**Candidate ID**: C2
**Severity**: High
**Impact**: Cross-origin leakage of caller credential headers via redirect
**Mechanism**: Because the default adapter never invokes
`boundedFetchAdapter`, the `stripCrossOriginAuth` helper
(fetch-client.ts:276-296) — which removes `Authorization`/cookie-style headers
when a redirect crosses origin — is never executed for Horizon traffic. Native
fetch by default replays request headers across same-scheme redirects. Any
credential the caller configured on the client (the documented
`server.httpClient.defaults.headers['Authorization'] = 'Bearer token'` at
server.ts:85, and `X-Auth-Token` from `opts.authToken` at server.ts:112) is
forwarded to the attacker-controlled redirect target, exfiltrating the bearer
token / auth token.
**Trigger**: Caller sets an auth header (per documented API) and submits/reads
against a Horizon endpoint that 3xx-redirects to an attacker host.
**Target Functions**:
- `src/http-client/fetch-client.ts:stripCrossOriginAuth:276-296`
- `src/http-client/fetch-client.ts:createFetchClient(adapter):482-490`
- `src/horizon/server.ts:constructor(customHeaders/authToken):103-118`

### Expected Behavior

Credential-bearing headers must be stripped on cross-origin redirect (the very
guarantee `stripCrossOriginAuth` was written to provide for the bounded path).

### Evidence

- `fetch-client.ts:272-296` — `stripCrossOriginAuth` exists and is only called
  inside `boundedFetchAdapter` (fetch-client.ts:410).
- `fetch-client.ts:482-490` — Horizon path bypasses `boundedFetchAdapter`, so
  `stripCrossOriginAuth` is never reached.
- `server.ts:85-88` (doc) and `server.ts:111-118` — callers attach
  `Authorization`/`X-Auth-Token` to `httpClient`, carried on every request.

### Anti-Evidence

- Some fetch runtimes drop `Authorization` on cross-origin redirect by default,
  but this is environment-dependent and not guaranteed across Node/undici and
  browser builds; the SDK provides no enforcement, and same-origin→different-
  port or scheme-downgrade hops are not reliably covered. The deliberate
  `stripCrossOriginAuth` defense is simply not wired in for Horizon.

```toml-index
schema = 1
verdict = "CANDIDATE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-fa7e54befd2c601ca0dd1c60"
weakness = "cross_origin_credential_leak_on_redirect"
record_kind = "single_path"
path = ["submitTransaction", "httpClient.post"]
sink = "httpClient.post"
sink_role = "http_transport"
impact_class = "credential_exfiltration"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/http-client/fetch-client.ts:stripCrossOriginAuth", "src/http-client/fetch-client.ts:createFetchClient"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = []
rules_out = []
does_not_rule_out = ["redirect_following_ssrf_and_https_downgrade", "unbounded_response_body_exhaustion"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "stripCrossOriginAuth is only called inside boundedFetchAdapter, which Horizon traffic never reaches, so caller Authorization/X-Auth-Token headers are forwarded to an attacker redirect target."
why_failed_brief = "not failed; candidate survived checked blockers"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "stripCrossOriginAuth (fetch-client.ts:276) strips credential headers on cross-origin redirect but is unreachable on the Horizon post/get path"

[[blockers]]
kind = "not_found"
guarantee = "no credential-header stripping is applied to Horizon redirects"
```

## Candidate 3

**Candidate ID**: C3
**Severity**: Medium
**Impact**: Unbounded response-body memory exhaustion from a single response
**Mechanism**: `maxContentLength` is never set for Horizon traffic, so the
default adapter bypasses `boundedFetchAdapter`/`readBodyBounded`
(fetch-client.ts:153-196) and lets feaxios/native fetch buffer the entire
response body. A malicious or compromised Horizon server returns an arbitrarily
large (or chunked, no `content-length`) body to any read call builder or to
`submitTransaction`, forcing the SDK to allocate unbounded memory from a single
response — a resource-exhaustion DoS not bounded by any documented SDK limit.
**Trigger**: Caller performs any Horizon read/submit; the server streams an
oversized body.
**Target Functions**:
- `src/http-client/fetch-client.ts:readBodyBounded:153-196`
- `src/http-client/fetch-client.ts:createFetchClient(adapter):482-490`
- `src/horizon/call_builder.ts:_sendNormalRequest:395-396`

### Expected Behavior

Response bodies should be capped (as `boundedFetchAdapter` enforces for
stellartoml/federation) so a single hostile response cannot exhaust memory.

### Evidence

- `fetch-client.ts:153-196` — `readBodyBounded` enforces `maxContentLength`,
  only invoked inside `boundedFetchAdapter`.
- `fetch-client.ts:482-490` — Horizon path uses `instance.request`, no body cap.
- `call_builder.ts:395-396` — `.get(url.toString())` passes no config.
- grep: no `maxContentLength` under `src/horizon/`.

### Anti-Evidence

- Horizon's legitimate responses are bounded by page size, but the attacker is
  the response producer here, so legitimate-size assumptions do not hold; no
  SDK-side cap exists on this path.

```toml-index
schema = 1
verdict = "CANDIDATE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-fa7e54befd2c601ca0dd1c60"
weakness = "unbounded_response_body_exhaustion"
record_kind = "single_path"
path = ["submitTransaction", "httpClient.post"]
sink = "httpClient.post"
sink_role = "http_transport"
impact_class = "resource_exhaustion"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/http-client/fetch-client.ts:readBodyBounded", "src/horizon/call_builder.ts:_sendNormalRequest"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "unbounded_response_body"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = []
rules_out = []
does_not_rule_out = ["redirect_following_ssrf_and_https_downgrade", "cross_origin_credential_leak_on_redirect"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Horizon traffic never sets maxContentLength, so readBodyBounded is bypassed and a single oversized hostile response is buffered without limit, exhausting memory."
why_failed_brief = "not failed; candidate survived checked blockers"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "readBodyBounded (fetch-client.ts:153) caps response size but is unreachable on the Horizon post/get path"

[[blockers]]
kind = "not_found"
guarantee = "no response-body size cap is applied to Horizon traffic"
```
