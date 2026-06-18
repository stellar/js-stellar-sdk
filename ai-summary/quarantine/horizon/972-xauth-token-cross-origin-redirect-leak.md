# R972: X-Auth-Token forwarded to cross-origin redirect target on Horizon submit POST

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/972-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Source-confirmed credential-header flow distinct from the C1 transport/policy
mechanism:

- `opts.authToken` is installed as a default `X-Auth-Token` header on the client
  (`src/horizon/server.ts:111-113`).
- `createHttpClient(customHeaders)` merges those custom headers into the client
  defaults so they are applied to every request, including the submit POST
  (`src/horizon/server.ts:118`, `src/horizon/horizon_axios_client.ts:38-45`).
- The submit POST sets neither `maxRedirects` nor `maxContentLength`
  (`src/horizon/server.ts:349-353` and `:580-583`), so the default adapter
  routes it through `instance.request(config)` rather than `boundedFetchAdapter`
  (`src/http-client/fetch-client.ts:483-489`). A 3xx on this request is followed
  by the feaxios/native-fetch path (`src/http-client/fetch-client.ts:322-327`,
  `:348-359`).
- The SDK's only credential-stripping routine, `stripCrossOriginAuth`, deletes
  only `authorization`, `proxy-authorization`, and `cookie`
  (`src/http-client/fetch-client.ts:290-292`) and is reachable **only** through
  `boundedFetchAdapter` — which is not engaged on the submit POST. So even the
  SDK's own stripping would not cover `X-Auth-Token`, and it is not invoked here
  regardless.

Under the fetch standard, cross-origin redirects strip only the standard
credential headers (`Authorization`, `Cookie`, `Proxy-Authorization`);
non-standard headers such as `X-Auth-Token` are preserved and re-sent to the
redirect target. The result: a 3xx whose `Location` points at a different origin
causes the caller's `X-Auth-Token` to be transmitted to the redirect-target
host.

This is a different material effect from the C1 / record-[2]
`https_allowhttp_policy_bypass` route: that route is about cleartext/off-policy
*transport*; this candidate is a *credential exposure* of a caller-supplied
secret to a host other than the configured Horizon origin. Record [2] did not
adjudicate the `X-Auth-Token` leak as a finding, so it is novel.

## Findings

**Severity: Medium** — security-significant confidentiality loss without direct
fund movement. A caller who passes `authToken` reasonably expects it to reach
only their configured Horizon origin. On a cross-origin redirect of the submit
POST the token is delivered to the redirect-target host. The SDK exposes no
redirect bound on the submit path and provides no stripping for non-standard
auth headers, so the protective contract is misleading. This matches the
objective's credential-exposure / security-significant-integrity-loss Medium
band.

Trust-boundary note: injecting a 3xx into an `https://` Horizon response stream
requires controlling that server or breaking TLS. The in-scope SDK defect is the
missing transport bound on a credential-bearing header for off-origin redirects
and the absence of any non-standard-header stripping — not the trustworthiness
of a chosen server. This is the same boundary framing already accepted as
in-scope for the sibling policy-bypass route.

## PoC Guidance

- **Test file**: append to an existing fetch-client / horizon server unit test
  under `test/unit` (e.g. the http-client redirect tests, or
  `test/unit/server_test.js` style).
- **Setup**: construct a `Server` with `allowHttp: true` and
  `{ authToken: "secret-token" }`. Mock the transport so the first POST to
  `/transactions` returns a `307` (to preserve the POST) or `302` with
  `Location` pointing at a *different origin* (e.g. `http://attacker.test/x`),
  and capture the headers of the follow-up request.
- **Steps**: call `server.submitTransaction(tx)` (or `submitAsyncTransaction`)
  with a built/signed transaction; let the mock follow the redirect.
- **Assertion**: assert that the follow-up request to the cross-origin target
  still carries `X-Auth-Token: secret-token` (demonstrating the leak), and
  contrast with `Authorization`, which a spec-compliant client would have
  stripped. Use mocked responses only; do not contact public infrastructure.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-e959ab04215fdeb636bbc4e0"
weakness = "credential_header_leak_via_redirect"
record_kind = "single_path"
path = ["submitTransaction", "httpClient.post", "cross_origin_redirect_target"]
sink = "httpClient.post"
sink_role = "transport_redirect_following"
impact_class = "credential_exposure"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/horizon/server.ts:constructor", "src/horizon/horizon_axios_client.ts:createHttpClient", "src/http-client/fetch-client.ts:stripCrossOriginAuth"]
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
rules_out = ["source trace rules out that the prior VIABLE policy-bypass record (js-sdk-2a1428ac20bf568cf68ca936) subsumes this candidate: that record's material effect is https/allowHttp transport bypass, whereas this is X-Auth-Token credential exposure with a different impact class and no overlapping guard analysis", "source trace rules out stripCrossOriginAuth as a blocker: it deletes only authorization/proxy-authorization/cookie and is unreachable on the submit POST"]
does_not_rule_out = ["leakage of the standard Authorization header (stripped by spec-compliant fetch on cross-origin redirect) — not this candidate", "the separate https/allowHttp transport-downgrade mechanism (C1) handled under route js-sdk-2a1428ac20bf568cf68ca936"]
assumptions = ["opts.authToken is supplied by the caller and becomes the X-Auth-Token default header (server.ts:111-113)", "native fetch/undici follows the fetch standard which strips only Authorization/Cookie/Proxy-Authorization on cross-origin redirects, leaving non-standard X-Auth-Token intact", "a 3xx with a cross-origin Location is delivered on the submit POST response stream"]
mechanism_brief = "X-Auth-Token default header is forwarded to cross-origin redirect targets on the submit POST because fetch strips only standard credential headers and the SDK's stripCrossOriginAuth (which also would not cover X-Auth-Token) is only reachable via the bounded adapter, which the submit POST does not use"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:stripCrossOriginAuth"
guarantee = "stripCrossOriginAuth removes only authorization/proxy-authorization/cookie and is unreachable for the unbounded submit POST path, so it does not block this X-Auth-Token leak"

[[blockers]]
kind = "not_found"
source = "src/horizon/server.ts:submitTransaction"
guarantee = "no source-proven stripping of non-standard X-Auth-Token on cross-origin redirect for the Horizon submit POST, and no redirect bound set on this path"
```
