# R984: Horizon requests set no maxContentLength, bypassing the bounded adapter and allowing unbounded response buffering

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/983-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the response-reading path against current source:

- `createHttpClient` (horizon_axios_client.ts:38-45) sets only headers; it never
  sets `maxContentLength` on the Horizon client.
- No Horizon request opts in either: `submitTransaction` (server.ts:349-353)
  passes only `timeout` + `Content-Type`; `_sendNormalRequest`
  (call_builder.ts:387-398) passes no options.
- The adapter selector (fetch-client.ts:482-490) invokes `boundedFetchAdapter`
  **only** when `maxRedirects`/`maxContentLength` is defined. With neither set,
  Horizon requests use plain feaxios `instance.request(config)`.
- The streamed size enforcement lives in `readBodyBounded` (fetch-client.ts:153-
  192) and is reached only from `boundedFetchAdapter` (fetch-client.ts:423,437).
  On the unmanaged feaxios path it never runs, so there is no `content-length`
  pre-check and no running-total cap; the full body is buffered.
- The buffered body is then fully materialized: `response.data.result_xdr` /
  `xdr.TransactionResult.fromXDR` in submit (server.ts:355-362) and
  `response.data` → `_parseResponse`/`JSON.parse` for call builders
  (call_builder.ts:395-411).
- The in-code comment at fetch-client.ts:322-326 explicitly states that when
  neither field is set the security config is "silently a no-op, allowing
  redirect-based SSRF and unbounded-response DoS."

## Findings

A caller-selected Horizon server returning a single very large (or chunked,
`Content-Length`-less) response body to any Horizon request forces the SDK to
buffer the entire body into memory and then JSON-parse / XDR-decode it, with no
documented size cap. This is the Medium "resource exhaustion from a single
response not bounded by documented SDK limits" / "unbounded parse/response
processing" impact category — an availability/memory-pressure effect on the
client, no fund loss, so it stays at Medium and below High.

`submitTransaction` sets `SUBMIT_TRANSACTION_TIMEOUT` (server.ts:351), which
bounds wall-clock but not peak memory of a fast large body; read call builders
set no timeout at all (call_builder.ts:395-396), so neither caps allocation.

## PoC Guidance

- **Test file**: add to `test/unit/server_test.js` or a new
  `test/unit/horizon_response_size_test.js`, reusing the existing
  fetch/axios-mock harness.
- **Setup**: construct a `Server` and mock a call-builder GET (e.g.
  `server.loadAccount` or `.transactions().call()`) to return a very large body
  (or one with no `Content-Length`).
- **Steps**: issue the request and observe that the full body is read and parsed
  without a size-cap rejection.
- **Assertion**: contrast with a request routed through `boundedFetchAdapter`
  (set `maxContentLength`) which throws `maxContentLength size of N exceeded`
  (fetch-client.ts:160/178); assert the Horizon path does **not** throw,
  demonstrating the missing cap.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-2a1428ac20bf568cf68ca936"
weakness = "unbounded response buffering due to missing maxContentLength on Horizon requests"
record_kind = "single_path"
path = ["_sendNormalRequest", "this.httpClient.get", "boundedFetchAdapter bypassed", "full body buffered and parsed"]
sink = "plain feaxios response read without readBodyBounded"
sink_role = "network_request"
impact_class = "resource_exhaustion"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/horizon/horizon_axios_client.ts:createHttpClient", "src/http-client/fetch-client.ts:createFetchClient", "src/http-client/fetch-client.ts:readBodyBounded", "src/horizon/call_builder.ts:_sendNormalRequest", "src/horizon/server.ts:submitTransaction"]
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
rules_out = ["no maxContentLength is set on the Horizon client or any Horizon request, so readBodyBounded (fetch-client.ts:153-192) never enforces a cap on this path", "SUBMIT_TRANSACTION_TIMEOUT bounds wall-clock only, not peak memory of a fast large body"]
does_not_rule_out = ["throughput/flow-control limits enforced by the underlying runtime were not concretely measured", "friendbot_builder request path beyond the traced routes"]
assumptions = ["plain feaxios instance.request buffers the full response body before resolving and does not apply its own size cap (consistent with the fetch-client.ts:322-326 comment)"]
mechanism_brief = "Horizon never sets maxContentLength, so the adapter selector (fetch-client.ts:482-490) uses plain feaxios and the streamed readBodyBounded cap (fetch-client.ts:153-192) is never reached; a single hostile response body is buffered in full and JSON/XDR-decoded with no size limit."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/horizon/server.ts:submitTransaction"
guarantee = "SUBMIT_TRANSACTION_TIMEOUT (server.ts:351) bounds wall-clock duration only and does not cap response body size or memory"

[[blockers]]
kind = "not_found"
source = "src/http-client/fetch-client.ts:createFetchClient"
guarantee = "no maxContentLength is ever set for Horizon traffic, so boundedFetchAdapter's readBodyBounded size enforcement never applies to Horizon responses"
```
