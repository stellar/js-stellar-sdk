# R9633: Unbounded Horizon response-body buffering (memory-exhaustion DoS)

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/963-hypothesis-batch.md
**Candidate ID**: C3
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Source-confirmed on current source:

- `src/http-client/fetch-client.ts:153-193` — `readBodyBounded` enforces
  `maxContentLength` both by the `content-length` header check (157-161) and by
  streamed running-total enforcement (171-184). It is invoked only inside
  `boundedFetchAdapter` (`fetch-client.ts:423` and `:437`).
- `fetch-client.ts:482-490` — the Horizon default client never sets
  `maxContentLength` (nor `maxRedirects`), so it takes `instance.request`
  (feaxios → native `fetch`), which buffers the full response body
  (`response.json()`/`text()`) with no size cap. Scoped grep confirms no
  `maxContentLength` anywhere under `src/horizon/`;
  `createHttpClient` (`horizon_axios_client.ts:38-45`) sets none.
- `call_builder.ts:395-396` (`_sendNormalRequest`) issues `.get(url.toString())`
  with no config; `submitTransaction` (`server.ts:349-353`) and
  `submitAsyncTransaction` (`server.ts:580-583`) likewise pass no size bound.

## Findings

A malicious or compromised Horizon endpoint (the in-scope trust boundary) can
return an arbitrarily large response body — or a chunked body with no
`content-length` — to any read call builder, `submitTransaction`, or
`submitAsyncTransaction`. Because the SDK's own `readBodyBounded` cap is
unreachable on this path, the runtime buffers the entire body into memory before
the SDK parses it, allowing single-response memory exhaustion that is not
bounded by any documented SDK limit.

This maps directly to the objective's Medium tier: "Resource exhaustion from a
single response/spec/challenge that is not bounded by documented SDK limits."
The SDK ships the exact mitigation (`maxContentLength` + `readBodyBounded`,
used by stellartoml `STELLAR_TOML_MAX_SIZE` and federation
`FEDERATION_RESPONSE_MAX_SIZE`) but never applies it to Horizon traffic, so the
deviation from intended behavior is concrete and source-proven. Severity is
Medium (availability/integrity, no fund movement or signing impact); confidence
is medium because the attacker must actually transmit a large body and the
practical impact depends on the host runtime's memory headroom.

This effect is distinct from prior [2] (bare redirect SSRF, different
`impact_class`); prior [2] does not cover response-body size and is anti-evidence
only, not subsumption.

## PoC Guidance

- **Test file**: append to a `test/unit/` fetch-client / call-builder test that
  mocks `fetch`. Do not contact public infra.
- **Setup**: build the Horizon `httpClient` (default, no bounds). Mock `fetch`
  to return a response whose body stream yields chunks far exceeding any
  reasonable page size (or omit `content-length` and stream repeatedly).
- **Steps**: perform a read (`server.accounts().call()` style) or
  `submitTransaction` against the mocked client.
- **Assertion**: the full oversized body is read/buffered with no
  `maxContentLength` error thrown — contrasted with a bounded-adapter call
  (`maxContentLength` set) that throws `maxContentLength size of N exceeded`
  via `readBodyBounded`. This demonstrates the Horizon path has no size cap.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-fa7e54befd2c601ca0dd1c60"
weakness = "unbounded_response_body_exhaustion"
record_kind = "single_path"
path = ["_sendNormalRequest", "httpClient.get", "native_fetch_unbounded_body_buffer"]
sink = "httpClient.get"
sink_role = "http_transport"
impact_class = "resource_exhaustion"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/http-client/fetch-client.ts:readBodyBounded", "src/http-client/fetch-client.ts:createFetchClient", "src/horizon/call_builder.ts:_sendNormalRequest"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "unbounded_response_body"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace rules out that prior [2] (bare redirect SSRF) covers response-body size: prior [2] has a different impact_class and never sets/reads a content-length cap, so it is anti-evidence not subsumption for this resource-exhaustion effect"]
does_not_rule_out = ["redirect_following_ssrf_and_https_downgrade (C1, prior [2])", "cross_origin_credential_leak_on_redirect (C2)", "runtime-specific memory headroom that may bound practical impact short of a crash"]
assumptions = ["native fetch via feaxios buffers the full response body with no size cap when maxContentLength is unset", "a malicious/compromised Horizon server can transmit an arbitrarily large or content-length-absent chunked body", "readBodyBounded is reachable only via boundedFetchAdapter, which Horizon traffic never enters"]
mechanism_brief = "Horizon traffic never sets maxContentLength, so readBodyBounded is bypassed and the default adapter (native fetch) buffers an arbitrarily large single hostile response body into memory with no SDK-side cap, enabling single-response memory exhaustion."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:readBodyBounded"
guarantee = "readBodyBounded caps response size by header and streamed running total but is reachable only via boundedFetchAdapter, which the Horizon post/get path never enters"

[[blockers]]
kind = "not_found"
source = "src/horizon/horizon_axios_client.ts:createHttpClient"
guarantee = "no maxContentLength / response-body size cap is applied to Horizon traffic; only stellartoml and federation set one"
```
