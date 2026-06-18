# R963: Unbounded Horizon response-body buffering enables single-response memory exhaustion

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/963-hypothesis-batch.md
**Candidate ID**: C3
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full Horizon transport path in current source:

- `src/horizon/horizon_axios_client.ts:38-45` — `createHttpClient` builds the
  Horizon client via `create({ headers: ... })` and sets **no**
  `maxContentLength` (only headers). Every Horizon `Server` uses this client.
- `src/http-client/fetch-client.ts:482-490` — the client's adapter routes a
  request through the hardened `boundedFetchAdapter` only when
  `config.maxRedirects !== undefined || config.maxContentLength !== undefined`.
  Otherwise it calls `instance.request(config)` (feaxios → native fetch), which
  buffers the entire response body into memory with no cap.
- `src/http-client/fetch-client.ts:153-193` — `readBodyBounded` is the only
  size-enforcing reader (streamed cap that aborts as soon as the running total
  exceeds `maxContentLength`). It is invoked **only** from inside
  `boundedFetchAdapter` (lines 423, 437), never on the default Horizon path.
- `src/horizon/call_builder.ts:387-398` — `_sendNormalRequest` calls
  `this.httpClient.get(url.toString())` with no config, so all read call
  builders take the unbounded path.
- `src/horizon/server.ts:349-353` and `580-583` — `submitTransaction` and
  `submitAsyncTransaction` pass only `timeout`/headers, no body cap.
- Scoped grep confirms `maxContentLength` is set only in
  `src/stellartoml/index.ts:57` (`STELLAR_TOML_MAX_SIZE`) and
  `src/federation/server.ts:226` (`FEDERATION_RESPONSE_MAX_SIZE`); nowhere under
  `src/horizon/`.

Expected behavior (verified against the codebase's own pattern): response bodies
from untrusted servers should be capped, exactly as `boundedFetchAdapter` /
`readBodyBounded` enforce for stellartoml and federation traffic. The Horizon
path genuinely deviates: there is no SDK-side size limit, so the actual behavior
is unbounded buffering. This is a real missing-defense bug, not working-as-
designed — the same maintainers deliberately bound the sibling federation/toml
paths, demonstrating the cap is the intended contract for untrusted responses.

## Findings

Under the objective threat model the caller-selected Horizon endpoint is
attacker-controlled (`scope.trust_boundary = remote_horizon_server`). A
malicious or compromised Horizon server can answer any read call builder or a
submit call with an arbitrarily large body — or a chunked body with no
`content-length` header — and the SDK will allocate memory for the entire
payload (feaxios reads the full body, then `JSON.parse` doubles the footprint).
A single hostile response can drive the host process to OOM. There is no
documented SDK limit bounding this path, which matches IMPACT_CATEGORIES
"Resource exhaustion from a single response ... not bounded by documented SDK
limits → Medium" and "unbounded parse/response processing ... Medium if
exploitable by a realistic remote server."

This is a **distinct material effect** from the already-VIABLE redirect-SSRF
prior record (route `js-sdk-2a1428ac20bf568cf68ca936`): that record concerns
`redirect:"follow"` SSRF/HTTPS-downgrade, not response-body size. It is also
distinct from the NOT_VIABLE decode-output-is-leaf and `_links`-rewrite priors,
which concern decoded JSON/XDR returned to the caller, not transport-layer
buffering. Re-checked from source; none of those records blocks this candidate.

Severity Medium (meets the objective floor): availability-only resource
exhaustion with no fund loss or wrong-semantics signing, exploitable by a single
realistic hostile/compromised response.

## PoC Guidance

- **Test file**: append a focused Vitest unit test under
  `test/unit/` exercising the fetch-client adapter directly (mirror the existing
  stellartoml/federation `maxContentLength` tests).
- **Setup**: stub `globalThis.fetch` to return a `Response` whose body is a
  `ReadableStream` that yields chunks far exceeding any reasonable size and emits
  no `content-length` header (forces the streamed path).
- **Steps**: drive a Horizon-style request through the default client adapter
  (no `maxContentLength` set), e.g. `createHttpClient().get(url)` or a
  `CallBuilder` `.call()`, and contrast with the federation client that sets
  `maxContentLength`.
- **Assertion**: the bounded (federation/toml) client rejects with
  `/^maxContentLength size/`, while the Horizon default client buffers the full
  oversized body without error — demonstrating the missing cap. Assert that the
  number of bytes read on the Horizon path is unbounded (or that the bounded
  client throws and the Horizon client does not).

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-fa7e54befd2c601ca0dd1c60"
weakness = "unbounded_response_body_exhaustion"
record_kind = "single_path"
path = ["call_builder._sendNormalRequest", "httpClient.get", "createFetchClient.adapter", "instance.request"]
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
rules_out = ["source trace confirms no maxContentLength is set on any Horizon request, so readBodyBounded is never reached and the default adapter buffers the full body; the redirect-SSRF prior (different weakness/size_class) does not cover response-body size and does not block this candidate"]
does_not_rule_out = ["the exact OOM threshold depends on host memory and runtime; redirect-following SSRF (C1) and credential-leak (C2) variants are assessed separately"]
assumptions = ["caller-selected Horizon endpoint is attacker-controlled per the objective threat model", "feaxios/native fetch buffers the entire response body into memory on the default (non-bounded) adapter path"]
mechanism_brief = "Horizon traffic never sets maxContentLength, so the fetch-client default adapter (fetch-client.ts:482-490) uses instance.request instead of boundedFetchAdapter/readBodyBounded; a single oversized or chunked hostile Horizon response is buffered without limit, exhausting process memory."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:readBodyBounded"
guarantee = "readBodyBounded (fetch-client.ts:153-193) enforces a streamed maxContentLength cap but is invoked only inside boundedFetchAdapter, which the Horizon get/post path never reaches"

[[blockers]]
kind = "not_found"
source = "src/horizon/horizon_axios_client.ts:createHttpClient"
guarantee = "no maxContentLength or response-body size cap is applied to Horizon traffic on createHttpClient, call_builder._sendNormalRequest, submitTransaction, or submitAsyncTransaction"
```
