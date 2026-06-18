# R9632: Cross-origin leak of caller credential headers on Horizon redirect

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/963-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Source-confirmed on current source:

- `src/http-client/fetch-client.ts:276-294` — `stripCrossOriginAuth` deletes
  `authorization`, `proxy-authorization`, and `cookie` headers when a redirect
  crosses origin. It is invoked only at `fetch-client.ts:410`, inside
  `boundedFetchAdapter`.
- `fetch-client.ts:482-490` — Horizon traffic never sets
  `maxRedirects`/`maxContentLength`, so it takes the `instance.request` path and
  never enters `boundedFetchAdapter`; therefore `stripCrossOriginAuth` is never
  executed for Horizon requests (grep confirms no bounds anywhere under
  `src/horizon/`; `createHttpClient` sets none).
- Callers attach credentials onto this same client: `X-Auth-Token` from
  `opts.authToken` (`server.ts:111-112`), arbitrary `opts.headers`
  (`server.ts:114-116`), and the documented
  `server.httpClient.defaults.headers['Authorization'] = 'Bearer token'`
  (`server.ts:85`). These headers are carried on every request the client
  emits.

When a Horizon endpoint (the in-scope trust boundary) returns a 3xx with a
cross-origin `Location`, the request is replayed by native `fetch` with
`redirect:"follow"`. The SDK's own credential-stripping defense never runs.

## Findings

The material gap is the SDK's documented custom auth headers, not
`Authorization`. Per the Fetch standard's HTTP-redirect handling, native fetch
(undici in Node, browser fetch) strips only `Authorization`,
`Proxy-Authorization`, and `Cookie` on cross-origin redirects — it does **not**
strip arbitrary custom headers. Consequently:

- `Authorization: Bearer …` (server.ts:85) has a native-runtime backstop on
  cross-origin redirect.
- `X-Auth-Token` (the SDK's own `opts.authToken` mechanism) and any credential
  the caller supplies via `opts.headers` have **no** stripping at all and are
  forwarded verbatim to the redirect target.

This is a real, source-proven deviation from intended behavior: the SDK ships
`stripCrossOriginAuth` precisely to prevent credential leakage on redirect, and
that defense is dead code on the primary (Horizon) client. A caller whose
`authToken`/custom credential is valid beyond the single Horizon origin (e.g. an
org-wide API-gateway token), or an honest HTTPS Horizon that legitimately
redirects to a sibling origin/port/third-party host, can have that credential
delivered to an unintended endpoint.

Severity is Medium rather than High: under the objective's strict
"Horizon-server-is-attacker" model, the attacker-operated server already
receives `X-Auth-Token` directly on the first request, so the redirect-forward
to the same operator adds no new exposure. The incremental, materially-new leak
requires the credential to be valid beyond the Horizon origin or the cross-origin
target to be a distinct party — a real but conditional integrity/confidentiality
loss, consistent with the Medium "security-significant integrity loss without
direct fund loss" tier. It does not reach the High bar (no fund movement,
signing, or SEP-10 bypass).

## PoC Guidance

- **Test file**: append to a unit test under `test/unit/` that exercises the
  fetch-client adapter (mirror the redirect/bounded-adapter tests). Avoid
  contacting public infra.
- **Setup**: build a `createHttpClient` / Horizon `httpClient` with a custom
  header set (`X-Auth-Token: secret` via `opts.authToken`, plus an
  `opts.headers` credential). Mock `fetch` to return a 3xx whose `Location`
  points to a different origin, then a 200 from the redirect target; capture the
  headers seen on the second (redirected) request.
- **Steps**: issue a GET via a call builder (or a `submitTransaction` with a
  307 so the body is preserved) against the original origin.
- **Assertion**: the redirected request still carries `X-Auth-Token` (and the
  custom `opts.headers` credential) — demonstrating the credential reaches the
  cross-origin target, whereas the bounded adapter (`maxRedirects` set) would
  have stripped credential headers via `stripCrossOriginAuth`. Contrast with a
  bounded-adapter call to show the intended behavior.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-fa7e54befd2c601ca0dd1c60"
weakness = "cross_origin_credential_leak_on_redirect"
record_kind = "single_path"
path = ["submitTransaction", "httpClient.post", "native_fetch_follow_location", "cross_origin_redirect_target"]
sink = "httpClient.post"
sink_role = "http_transport"
impact_class = "credential_exfiltration"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/http-client/fetch-client.ts:stripCrossOriginAuth", "src/http-client/fetch-client.ts:createFetchClient", "src/horizon/server.ts:constructor"]
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
rules_out = ["source trace rules out that prior [2] (bare redirect SSRF) covers credential-header forwarding: prior [2] is the transport/SSRF effect only, with a different impact_class, so it is anti-evidence not subsumption for this credential-leak effect"]
does_not_rule_out = ["redirect_following_ssrf_and_https_downgrade (C1, prior [2])", "unbounded_response_body_exhaustion (C3)", "the marginal-only case where the Horizon operator is the sole attacker and already holds X-Auth-Token from the first request"]
assumptions = ["native fetch (undici/browser) strips only Authorization/Proxy-Authorization/Cookie on cross-origin redirect and forwards arbitrary custom headers such as X-Auth-Token", "caller configures X-Auth-Token (opts.authToken) or an opts.headers credential per documented API", "stripCrossOriginAuth is reachable only via boundedFetchAdapter, which Horizon traffic never enters"]
mechanism_brief = "stripCrossOriginAuth is only invoked inside boundedFetchAdapter; Horizon traffic never sets bounds so it never enters that adapter, leaving the SDK's own X-Auth-Token / custom credential headers forwarded by native fetch to a cross-origin redirect target with no stripping (native fetch strips only Authorization/Cookie/Proxy-Authorization)."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:stripCrossOriginAuth"
guarantee = "stripCrossOriginAuth strips credential headers on cross-origin redirect but is reachable only via boundedFetchAdapter (called at fetch-client.ts:410), which the Horizon post/get path never enters"

[[blockers]]
kind = "not_found"
source = "src/horizon/server.ts:constructor"
guarantee = "no credential-header stripping is wired into the Horizon client; X-Auth-Token and opts.headers credentials are carried on every request and not stripped on redirect"
```
