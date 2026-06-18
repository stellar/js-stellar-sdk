# R964: "Bounded" fetch adapter buffers unbounded response body when only maxRedirects is set

**Date**: 2026-06-18
**Subsystem**: http-client
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/http-client/964-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full caller -> adapter -> body-read path in
`src/http-client/fetch-client.ts` (LSP unavailable for `.ts`; scoped source
reads used).

- Adapter selector (`createFetchClient.defaults.adapter`, lines 482-490) routes
  a request to `boundedFetchAdapter` when **either** `config.maxRedirects !==
  undefined` **or** `config.maxContentLength !== undefined`. Setting only
  `maxRedirects` is therefore sufficient to enter the bounded adapter while
  `maxContentLength` stays `undefined`.
- `boundedFetchAdapter` (line 328) destructures `{ maxRedirects,
  maxContentLength, timeout }` at line 331; in the maxRedirects-only config
  `maxContentLength === undefined`.
- On a 2xx response the body is read at line 437 via
  `readBodyBounded(response, maxContentLength)` — i.e. with `undefined`. (The
  non-2xx error path at line 423 reads the body the same way.)
- `readBodyBounded` (lines 153-193) gates **both** size guards on
  `maxContentLength !== undefined`: the `content-length` header pre-check (line
  157) and the streamed running-total abort (line 176). With `undefined`,
  neither runs; the streaming loop pushes every chunk into `chunks` (line 182)
  and returns the fully buffered body (lines 186-192) with no SDK ceiling.
- `createFetchClient` (lines 455-491) only spreads `fetchConfig` into
  `defaults`; no default `maxContentLength` is injected, and the adapter applies
  no adapter-level ceiling.

Expected behavior: an adapter selected specifically for "bounded" behavior
should impose a size ceiling (or at minimum not silently disable the size guard
when only the redirect control is configured). The code deviates: it advertises
bounded behavior via name and selection but performs an unbounded read in this
config.

## Findings

A remote HTTP server (in scope: attacker controls response status, headers,
body, and redirect `Location`) can return an arbitrarily large or
slow-but-data-producing response body. When the application uses the exported
`httpClient`/`create` with `{ maxRedirects: N }` and no `maxContentLength`, the
entire body is buffered into memory with no cap — a bounded-but-material
resource-exhaustion (memory) DoS driven by a single final response.

This is a genuine bug, not a working-as-designed scenario: the adapter is named
and selected for bounded behavior, so a developer who sets `maxRedirects` to
harden against redirect SSRF reasonably assumes the "bounded" adapter also
bounds size. They are not disabling a documented control; they are
under-configuring an API whose name implies the guard is active — so this is not
the malicious/secret-disabling out-of-scope case.

Severity Medium per IMPACT_CATEGORIES ("Resource exhaustion from a single
response/spec/challenge that is not bounded by documented SDK limits"). It is
not High: reachability is via the public http-client export rather than a core
SDK signing/submission path, and there is no multi-hop body amplification
(intermediate 3xx responses are not body-read).

Novelty: distinct typed route from prior records. The VIABLE default-path
unbounded read (`js-sdk-74011b123136054779aaac38`) is the neither-bound-set
feaxios `instance.request` path and its own reasoning notes the cap "is reached
only on the opt-in boundedFetchAdapter." The NOT_VIABLE streaming-cap record
(`js-sdk-0f3de652e21d6be98b52f804`) only covers the `maxContentLength`-defined
case. Neither owns the maxRedirects-only `boundedFetchAdapter` path.

## PoC Guidance

- **Test file**: add a focused Vitest unit test under `test/unit` near existing
  http-client/fetch-client coverage.
- **Setup**: mock global `fetch` to return a `Response` whose `body` is a
  `ReadableStream` that emits chunks far exceeding any reasonable bound (or many
  chunks), with a 2xx status and no/oversized `content-length`. Construct the
  client via the exported `createFetchClient`/`httpClient` with
  `{ maxRedirects: 5 }` and **no** `maxContentLength`.
- **Steps**: issue a `.get(url)`; let the mocked stream emit a large total.
- **Assertion**: the call resolves with the full body buffered (assert
  `response.data`/byte length equals the full emitted size) and does **not**
  throw a `maxContentLength size ... exceeded` error — demonstrating the size
  guard never engaged on the bounded adapter. Contrast with the same setup plus
  `maxContentLength: <small>` which must throw, proving the guard is silently
  gated off in the maxRedirects-only config.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "http-client"
route_id = "js-sdk-21d3e5bacc2e1ae0938706bc"
weakness = "unbounded response-body buffering on the bounded adapter when only maxRedirects is configured"
record_kind = "single_path"
path = ["adapter", "boundedFetchAdapter", "readBodyBounded"]
sink = "readBodyBounded"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/http-client/fetch-client.ts:boundedFetchAdapter", "src/http-client/fetch-client.ts:readBodyBounded"]
scope.trust_boundary = "remote_http_server"
scope.protocol_phase = "http_transport"
scope.auth_state = "caller_configured"
scope.attacker_control = "url_headers_body_and_remote_response"
scope.parser_state = "byte_stream_or_json_decoded"
scope.size_class = "bounded_when_max_content_length_is_set"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms readBodyBounded's content-length pre-check (line 157) and streamed total abort (line 176) are both gated on maxContentLength !== undefined, so the maxRedirects-only boundedFetchAdapter path (selected at lines 482-490, read at line 437 with undefined) buffers the full body uncapped; this is the boundedFetchAdapter path, not the default instance.request path owned by VIABLE js-sdk-74011b123136054779aaac38, and not the maxContentLength-defined case ruled NOT_VIABLE in js-sdk-0f3de652e21d6be98b52f804"]
does_not_rule_out = ["redirect-scheme/allowHttp non-revalidation already owned by js-sdk-3210675ec7643a3184fe756f and js-sdk-cda4d93790ffd066b1523001", "default-path unbounded read already owned by js-sdk-74011b123136054779aaac38", "multi-hop body amplification (intermediate 3xx bodies are not read)"]
assumptions = ["no default maxContentLength is injected by createFetchClient/defaults (confirmed lines 455-491) and only stellartoml/federation opt in", "remote server is attacker-controlled per the route trust boundary", "an application uses the exported httpClient/create directly with maxRedirects only"]
mechanism_brief = "boundedFetchAdapter is selected when maxRedirects is set (lines 482-490), but readBodyBounded gates both size guards on maxContentLength !== undefined (lines 157, 176), so a maxRedirects-only config buffers the full attacker-controlled response body with no cap (line 182)."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/http-client/fetch-client.ts:readBodyBounded"
guarantee = "the content-length pre-check (line 157) and streamed total > maxContentLength abort (lines 176-181) bound the body only when maxContentLength is defined; neither runs on the maxRedirects-only path where maxContentLength is undefined"

[[blockers]]
kind = "not_found"
source = "src/http-client/fetch-client.ts:createFetchClient"
guarantee = "no default maxContentLength and no adapter-level size ceiling is applied when only maxRedirects is configured (defaults spread fetchConfig only, lines 455-491; adapter selector lines 482-490 adds none)"
```
