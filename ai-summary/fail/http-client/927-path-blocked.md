# F927: Path blocked: bounded response read accounting in readBodyBounded

**Subsystem**: http-client
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/http-client/927-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`boundedFetchAdapter -> readBodyBounded`

Area seed targets: `boundedFetchAdapter`, `readBodyBounded`, `<anonymous>`.

## Blocker

`boundedFetchAdapter` is the only path reaching `readBodyBounded`, and it is
selected only when `maxRedirects` or `maxContentLength` is set
(fetch-client.ts:483-487). The sole in-source callers that reach it —
`stellartoml` and `federation` — both pass a finite `maxContentLength`
(`STELLAR_TOML_MAX_SIZE = 100*1024`, `FEDERATION_RESPONSE_MAX_SIZE = 100*1024`).
`maxContentLength` is forwarded to both `readBodyBounded` call sites
(fetch-client.ts:423, 437) with no derivation. With the cap defined,
`readBodyBounded` enforces it two ways: a `content-length` header pre-check
(158-161) and a streamed running-total guard that cancels the reader and throws
as soon as `total > maxContentLength`, before chunks are concatenated
(171-184). A spoofed/absent/small declared length cannot bypass the streamed
guard. The accounting holds for every response shape reachable in-source.

## Evidence

- `src/http-client/fetch-client.ts:483-487` - adapter chosen only when a cap option is present; otherwise plain `instance.request`.
- `src/http-client/fetch-client.ts:153-193` - `readBodyBounded`: header pre-check then streamed `total += value.byteLength` guard that throws before push/concat.
- `src/http-client/fetch-client.ts:423,437` - both reads pass `maxContentLength` through unchanged (no mis-derivation).
- `src/stellartoml/index.ts:56-57` and `src/federation/server.ts:226` + `src/federation/server.ts:15`, `src/stellartoml/index.ts:11` - the only in-source callers, each setting a finite 100 KiB cap.

## Per-Target Disposition

- `readBodyBounded`: NOT_VIABLE for in-source callers — always invoked with a finite cap; streamed accounting source-confirmed correct for spoofed, absent, small, single-huge-chunk, and oversized declared-length shapes.
- `boundedFetchAdapter`: NOT_VIABLE as a new resource-exhaustion finding — redirect loop reads no intermediate bodies; redirect-scheme non-revalidation is already VIABLE (js-sdk-0f3de652e21d6be98b52f804 family). Unbounded read when `maxRedirects` is set without `maxContentLength` is external-config only (js-sdk-f3602f77d6787375a5a1ec22, NOT_VIABLE-high).
- `<anonymous>`: resolves to the streamed read callback / JSON.parse step already covered above and by js-sdk-f3602f77d6787375a5a1ec22.

## Negative Scope

- Rules out: attacker-controlled remote response driving an unbounded or mis-accounted read at `readBodyBounded` for the in-source `boundedFetchAdapter` callers (stellartoml, federation), via spoofed/absent/contradictory `content-length` or chunked streaming.
- Does not rule out: the already-VIABLE unbounded read on the default `instance.request` path with no cap (js-sdk-74011b123136054779aaac38); the already-VIABLE redirect-scheme/allowHttp non-revalidation (js-sdk-0f3de652e21d6be98b52f804); external-caller config that sets `maxRedirects` without `maxContentLength` (js-sdk-f3602f77d6787375a5a1ec22).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "http-client"
route_id = "js-sdk-23977de2948fe40fd4758746"
weakness = "Resource Exhaustion"
record_kind = "area_seed"
path = ["boundedFetchAdapter", "readBodyBounded"]
sink = "readBodyBounded"
sink_role = "bounded_response_read"
impact_class = "resource_exhaustion"
route_family = "bounded_response_read"
material_effect = "bounded_response_read"
target_functions = ["boundedFetchAdapter", "readBodyBounded", "<anonymous>"]
scope.trust_boundary = "remote_http_server"
scope.protocol_phase = "http_transport"
scope.auth_state = "caller_configured"
scope.attacker_control = "url_headers_body_and_remote_response"
scope.parser_state = "byte_stream_or_json_decoded"
scope.size_class = "bounded_when_max_content_length_is_set"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["bounded_read_accounting_holds_for_inscope_boundedadapter_callers"]
rules_out = ["unbounded or mis-accounted read at readBodyBounded for in-source boundedFetchAdapter callers (stellartoml, federation) via spoofed/absent/contradictory content-length or chunked streaming"]
does_not_rule_out = ["unbounded read on default instance.request path with no cap (js-sdk-74011b123136054779aaac38)", "redirect-scheme/allowHttp non-revalidation (js-sdk-0f3de652e21d6be98b52f804)", "external caller setting maxRedirects without maxContentLength (js-sdk-f3602f77d6787375a5a1ec22)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "boundedFetchAdapter reaches readBodyBounded only for stellartoml and federation, which always pass a finite 100 KiB maxContentLength; readBodyBounded's streamed running-total guard throws before concatenation, so declared-length spoofing and chunked streaming cannot defeat the cap."
why_failed_brief = "Every in-source path to readBodyBounded supplies a finite cap and the streamed accounting is source-confirmed correct; the unbounded and redirect variants are already adjudicated under other route ids."
confidence = "high"

[[sanitizer_guarantees]]
kind = "constant_bound"
guarantee = "stellartoml (STELLAR_TOML_MAX_SIZE) and federation (FEDERATION_RESPONSE_MAX_SIZE) each pass a finite 100*1024 maxContentLength to boundedFetchAdapter."

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "readBodyBounded enforces the cap via a content-length pre-check (158-161) and a streamed total>cap guard that cancels the reader and throws before chunks are concatenated (171-184)."

[[blockers]]
kind = "reachability"
guarantee = "boundedFetchAdapter is selected only when maxRedirects or maxContentLength is set (fetch-client.ts:483-487); only stellartoml and federation reach it in source, both with a finite maxContentLength."
```
